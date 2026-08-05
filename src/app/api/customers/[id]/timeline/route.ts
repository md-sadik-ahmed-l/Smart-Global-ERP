import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

// GET /api/customers/[id]/timeline — unified activity timeline (newest first)
// Sources: AuditLog (create/update), notes, activities, orders
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId } = getTenantContext(session);

  const customer = await db.customer.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const [auditLogs, notes, activities, orders] = await Promise.all([
    db.auditLog.findMany({
      where: { tenantId, entity: "Customer", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.customerNote.findMany({
      where: { tenantId, customerId: id },
      orderBy: { createdAt: "desc" },
    }),
    db.customerActivity.findMany({
      where: { tenantId, customerId: id },
      orderBy: { createdAt: "desc" },
    }),
    db.salesOrder.findMany({
      where: { tenantId, customerId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const timeline: any[] = [
    ...auditLogs.map((l) => ({
      id: `audit-${l.id}`,
      type: l.action,
      title: l.action === "CREATE" ? "Customer created" : l.action === "UPDATE" ? "Customer updated" : l.action === "DELETE" ? "Customer deleted" : "Customer activity",
      description: l.details || "",
      createdAt: l.createdAt,
    })),
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      type: "NOTE",
      title: "Note added",
      description: n.note,
      createdAt: n.createdAt,
    })),
    ...activities.map((a) => ({
      id: `activity-${a.id}`,
      type: "ACTIVITY",
      title: `${a.type} activity`,
      description: a.description || "",
      createdAt: a.createdAt,
    })),
    ...orders.map((o) => ({
      id: `order-${o.id}`,
      type: "ORDER",
      title: `Order created (${o.orderNumber})`,
      description: `Total ${o.totalAmount} · ${o.status}`,
      createdAt: o.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ timeline });
}
