// User Management API — create, list, update, delete users
// Only Super Admin or users with "settings" permissions can manage users
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth, unauthorized, forbidden, logAudit, getTenantContext } from "@/lib/api-helpers";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "CEO", "MANAGER", "STAFF", "ACCOUNTANT"]).default("STAFF"),
  roleId: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  branchId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

// GET /api/users — list all users in tenant
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const users = await db.user.findMany({
    where: {
      tenantId,
      AND: [
        q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] } : {},
        role ? { role: role as any } : {},
        status ? { status: status as any } : {},
      ],
    },
    include: {
      roleRef: { include: { permissions: { include: { permission: true } } } },
      branch: { select: { name: true, code: true } },
      _count: { select: { salesOrders: true, purchaseOrders: true, auditLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Strip passwordHash from response
  const safe = users.map((u) => {
    const { passwordHash, twoFactorSecret, ...rest } = u;
    return {
      ...rest,
      permissions: u.roleRef?.permissions?.map((rp) => `${rp.permission.module}:${rp.permission.action}`) ?? [],
    };
  });

  return NextResponse.json({ users: safe, total: safe.length });
}

// POST /api/users — create new user (Super Admin only, or settings:create permission)
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  // Only SUPER_ADMIN can create users
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return forbidden("Only Super Admin can create new user accounts");
  }

  try {
    const body = await req.json();
    const data = createUserSchema.parse(body);

    // Check email uniqueness within tenant
    const existing = await db.user.findFirst({
      where: { tenantId, email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);
    const avatar = data.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

    const user = await db.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        roleId: data.roleId || null,
        phone: data.phone || null,
        avatar,
        department: data.department || null,
        designation: data.designation || null,
        branchId: data.branchId || null,
        status: data.status,
      },
      include: {
        roleRef: true,
        branch: { select: { name: true, code: true } },
      },
    });

    await cache.invalidateEntity("users", tenantId);
    await logAudit(tenantId, userId, "CREATE", "User", user.id, `Created user ${user.name} (${user.email}) with role ${user.role}`, req);

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create user" }, { status: 400 });
  }
}
