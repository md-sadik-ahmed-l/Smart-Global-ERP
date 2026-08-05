import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

// GET /api/customers/[id]/profile — aggregated customer profile data
// Returns: { customer, orders, activities, notes, timeline }
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId } = getTenantContext(session);

  const customer = await db.customer.findFirst({
    where: { id, tenantId },
    include: {
      _count: { select: { salesOrders: true } },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const [orders, activities, notes, auditLogs] = await Promise.all([
    db.salesOrder.findMany({
      where: { tenantId, customerId: id },
      include: {
        branch: true,
        items: { include: { product: true } },
      },
      orderBy: { orderDate: "desc" },
    }),
    db.customerActivity.findMany({
      where: { tenantId, customerId: id },
      orderBy: { createdAt: "desc" },
    }),
    db.customerNote.findMany({
      where: { tenantId, customerId: id },
      orderBy: { createdAt: "desc" },
    }),
    db.auditLog.findMany({
      where: { tenantId, entity: "Customer", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const enrichedOrders = orders.map((o) => ({
    ...o,
    dueAmount: o.totalAmount - o.paidAmount,
    itemCount: o.items.length,
  }));

  // Unified timeline — newest first
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

  return NextResponse.json({
    customer,
    orders: enrichedOrders,
    activities,
    notes,
    timeline,
  });
}
