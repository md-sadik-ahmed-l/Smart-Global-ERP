import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { requireAuth, unauthorized, salesOrderSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");

  const orders = await db.salesOrder.findMany({
    where: {
      tenantId,
      AND: [
        q ? { orderNumber: { contains: q } } : {},
        status ? { status: status as any } : {},
        customerId ? { customerId } : {},
      ],
    },
    include: {
      customer: true,
      branch: true,
      salesRep: { select: { id: true, name: true, avatar: true } },
      items: { include: { product: true } },
    },
    orderBy: { orderDate: "desc" },
    take: 200,
  });

  const enriched = orders.map((o) => ({
    ...o,
    dueAmount: o.totalAmount - o.paidAmount,
    itemCount: o.items.length,
  }));

  return NextResponse.json({ orders: enriched, total: enriched.length });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "sales", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = salesOrderSchema.parse(body);

    const items = data.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.quantity * it.unitPrice,
    }));
    const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);
    const taxAmount = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + taxAmount;

    const count = await db.salesOrder.count({ where: { tenantId } });
    const orderNumber = `ORD-${String(2842 + count).padStart(4, "0")}`;

    const order = await db.salesOrder.create({
      data: {
        tenantId,
        orderNumber,
        customerId: data.customerId,
        branchId: data.branchId || null,
        salesRepId: userId,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes || null,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        status: "PENDING",
        items: { create: items },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    await cache.invalidateEntity("sales", tenantId);
    await cache.invalidateEntity("dashboard", tenantId);
    await logAudit(tenantId, userId, "CREATE", "SalesOrder", order.id, `Created sales order ${order.orderNumber} for ${order.customer?.name}`, req);
    return NextResponse.json({ order }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create sales order" }, { status: 400 });
  }
}
