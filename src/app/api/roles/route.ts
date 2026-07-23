// Roles & Permissions API
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { requireAuth, unauthorized, forbidden, logAudit, getTenantContext } from "@/lib/api-helpers";

// GET /api/roles — list all roles + all permissions (for permission matrix UI)
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const [roles, permissions] = await Promise.all([
    db.role.findMany({
      where: { tenantId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] }),
  ]);

  // Group permissions by module for the UI
  const permissionsByModule: Record<string, any[]> = {};
  permissions.forEach((p) => {
    if (!permissionsByModule[p.module]) permissionsByModule[p.module] = [];
    permissionsByModule[p.module].push({
      id: p.id,
      action: p.action,
      description: p.description,
    });
  });

  const rolesEnriched = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    userCount: r._count.users,
    permissions: r.permissions.map((rp) => rp.permission.id),
    permissionKeys: r.permissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`),
  }));

  return NextResponse.json({
    roles: rolesEnriched,
    permissions: permissionsByModule,
    modules: Object.keys(permissionsByModule),
  });
}

// POST /api/roles — create new role or update role permissions
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  if ((session.user as any).role !== "SUPER_ADMIN") {
    return forbidden("Only Super Admin can manage roles");
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "update_permissions") {
      // Update permissions for an existing role
      const { roleId, permissionIds } = body;
      const role = await db.role.findFirst({ where: { id: roleId, tenantId } });
      if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });
      if (role.isSystem && role.name === "Super Admin") {
        return NextResponse.json({ error: "Cannot modify Super Admin role permissions" }, { status: 400 });
      }

      // Delete existing permissions
      await db.rolePermission.deleteMany({ where: { roleId } });

      // Insert new permissions
      if (permissionIds.length > 0) {
        await db.rolePermission.createMany({
          data: permissionIds.map((pid: string) => ({ roleId, permissionId: pid })),
        });
      }

      // Clear permission cache for all users with this role
      const usersWithRole = await db.user.findMany({ where: { tenantId, roleId }, select: { id: true } });
      for (const u of usersWithRole) {
        await cache.del(`perms:${u.id}`);
      }

      await logAudit(tenantId, userId, "UPDATE", "Role", roleId, `Updated permissions for role ${role.name} (${permissionIds.length} permissions)`, req);
      return NextResponse.json({ success: true });
    }

    // Default: create new role
    const { name, description, permissionIds } = body;
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Role name must be at least 2 characters" }, { status: 400 });
    }

    const existing = await db.role.findFirst({ where: { tenantId, name } });
    if (existing) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 400 });
    }

    const role = await db.role.create({
      data: {
        tenantId,
        name,
        description: description || null,
        isSystem: false,
      },
    });

    if (permissionIds && permissionIds.length > 0) {
      await db.rolePermission.createMany({
        data: permissionIds.map((pid: string) => ({ roleId: role.id, permissionId: pid })),
      });
    }

    await logAudit(tenantId, userId, "CREATE", "Role", role.id, `Created role ${role.name} with ${permissionIds?.length || 0} permissions`, req);
    return NextResponse.json({ role }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE /api/roles — delete custom role (not system roles)
export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  if ((session.user as any).role !== "SUPER_ADMIN") {
    return forbidden("Only Super Admin can delete roles");
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("id");
    if (!roleId) return NextResponse.json({ error: "Role ID required" }, { status: 400 });

    const role = await db.role.findFirst({ where: { id: roleId, tenantId } });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    if (role.isSystem) {
      return NextResponse.json({ error: "Cannot delete system roles" }, { status: 400 });
    }

    // Check if any users have this role
    const userCount = await db.user.count({ where: { tenantId, roleId } });
    if (userCount > 0) {
      return NextResponse.json({ error: `Cannot delete role — ${userCount} users are assigned to it` }, { status: 400 });
    }

    await db.role.delete({ where: { id: roleId } });
    await logAudit(tenantId, userId, "DELETE", "Role", roleId, `Deleted role ${role.name}`, req);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
