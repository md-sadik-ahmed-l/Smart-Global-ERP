import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import {
  requireAuth,
  unauthorized,
  forbidden,
  customerUpdateSchema,
  logAudit,
  getTenantContext,
  checkPermission,
} from "@/lib/api-helpers";

// GET /api/customers/[id] — tenant-scoped customer detail with orders
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId } = getTenantContext(session);

  const customer = await db.customer.findFirst({
    where: { id, tenantId },
    include: {
      salesOrders: { orderBy: { orderDate: "desc" }, take: 20 },
      customerNotes: { orderBy: { createdAt: "desc" }, take: 20 },
      customerActivities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

// PUT /api/customers/[id] — tenant-scoped update with Zod validation + RBAC
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "crm", "update");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = customerUpdateSchema.parse(body);

    const customer = await db.customer.findFirst({ where: { id, tenantId } });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const updated = await db.customer.update({ where: { id }, data });

    await cache.invalidateEntity("customers", tenantId);
    await cache.invalidateEntity("dashboard", tenantId);
    await logAudit(
      tenantId,
      userId,
      "UPDATE",
      "Customer",
      updated.id,
      `Updated customer ${updated.name} (${updated.code})`,
      req
    );

    return NextResponse.json({ customer: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.name === "ZodError" ? e.issues?.[0]?.message || "Validation error" : e.message || "Failed to update customer" },
      { status: 400 }
    );
  }
}

// DELETE /api/customers/[id] — tenant-scoped delete with RBAC
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "crm", "delete");
  if (permErr) return permErr;

  try {
    const customer = await db.customer.findFirst({ where: { id, tenantId } });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    // Tenant-scoped delete — can only remove a customer owned by the caller's tenant
    const deleted = await db.customer.deleteMany({ where: { id, tenantId } });
    if (deleted.count === 0) return forbidden("You cannot delete this customer");

    await cache.invalidateEntity("customers", tenantId);
    await cache.invalidateEntity("dashboard", tenantId);
    await logAudit(
      tenantId,
      userId,
      "DELETE",
      "Customer",
      id,
      `Deleted customer ${customer.name} (${customer.code})`,
      req
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete customer" }, { status: 400 });
  }
}
