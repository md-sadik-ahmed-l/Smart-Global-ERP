// User detail API — get, update, delete, reset password
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth, unauthorized, forbidden, logAudit, getTenantContext } from "@/lib/api-helpers";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["SUPER_ADMIN", "CEO", "MANAGER", "STAFF", "ACCOUNTANT"]).optional(),
  roleId: z.string().nullable().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  branchId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

// GET /api/users/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);
  const { id } = await params;

  const user = await db.user.findFirst({
    where: { id, tenantId },
    include: {
      roleRef: { include: { permissions: { include: { permission: true } } } },
      branch: { select: { name: true, code: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { passwordHash, twoFactorSecret, ...safe } = user;
  return NextResponse.json({ user: safe });
}

// PUT /api/users/[id] — update user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);
  const { id } = await params;

  // Only SUPER_ADMIN can update other users (users can update themselves)
  if ((session.user as any).role !== "SUPER_ADMIN" && userId !== id) {
    return forbidden("Only Super Admin can update other users");
  }

  try {
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const existing = await db.user.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Prevent demoting the last super admin
    if (existing.role === "SUPER_ADMIN" && data.role && data.role !== "SUPER_ADMIN") {
      const superAdminCount = await db.user.count({ where: { tenantId, role: "SUPER_ADMIN", status: "ACTIVE" } });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: "Cannot demote the last Super Admin" }, { status: 400 });
      }
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.roleId !== undefined && { roleId: data.roleId }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.department !== undefined && { department: data.department || null }),
        ...(data.designation !== undefined && { designation: data.designation || null }),
        ...(data.branchId !== undefined && { branchId: data.branchId }),
        ...(data.status && { status: data.status }),
      },
      include: { roleRef: true, branch: { select: { name: true } } },
    });

    await cache.invalidateEntity("users", tenantId);
    await cache.del(`perms:${id}`); // clear permission cache for this user
    await logAudit(tenantId, userId, "UPDATE", "User", updated.id, `Updated user ${updated.name} (role: ${updated.role}, status: ${updated.status})`, req);

    const { passwordHash, twoFactorSecret, ...safe } = updated;
    return NextResponse.json({ user: safe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);
  const { id } = await params;

  if ((session.user as any).role !== "SUPER_ADMIN") {
    return forbidden("Only Super Admin can delete users");
  }

  if (userId === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const existing = await db.user.findFirst({ where: { id, tenantId } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Prevent deleting last super admin
  if (existing.role === "SUPER_ADMIN") {
    const superAdminCount = await db.user.count({ where: { tenantId, role: "SUPER_ADMIN", status: "ACTIVE" } });
    if (superAdminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last Super Admin" }, { status: 400 });
    }
  }

  // Soft delete: set status to INACTIVE instead of hard delete (preserve referential integrity)
  const updated = await db.user.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  await cache.invalidateEntity("users", tenantId);
  await cache.del(`perms:${id}`);
  await logAudit(tenantId, userId, "DELETE", "User", id, `Deactivated user ${existing.name} (${existing.email})`, req);

  return NextResponse.json({ success: true, message: "User deactivated" });
}

// PATCH /api/users/[id] — reset password
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);
  const { id } = await params;

  if ((session.user as any).role !== "SUPER_ADMIN" && userId !== id) {
    return forbidden("Only Super Admin can reset other users' passwords");
  }

  try {
    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await db.user.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id }, data: { passwordHash } });

    await logAudit(tenantId, userId, "UPDATE", "User", id, `Reset password for ${existing.name}`, req);
    return NextResponse.json({ success: true, message: "Password reset successful" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
