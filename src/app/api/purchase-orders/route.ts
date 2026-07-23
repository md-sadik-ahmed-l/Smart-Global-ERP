import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { requireAuth, unauthorized, purchaseOrderSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status");
  const vendorId = searchParams.get("vendorId");

  const orders = await db.purchaseOrder.findMany({
    where: {
      tenantId,
      AND: [
        q ? { poNumber: { contains: q } } : {},
        status ? { status: status as any } : {},
        vendorId ? { vendorId } : {},
      ],
    },
    include: {
      vendor: true,
      branch: true,
      buyer: { select: { id: true, name: true, avatar: true } },
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

  const permErr = await checkPermission(session, "purchase", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = purchaseOrderSchema.parse(body);

    const items = data.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.quantity * it.unitPrice,
    }));
    const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);
    const taxAmount = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + taxAmount;

    const count = await db.purchaseOrder.count({ where: { tenantId } });
    const poNumber = `PO-${String(1249 + count).padStart(4, "0")}`;

    const order = await db.purchaseOrder.create({
      data: {
        tenantId,
        poNumber,
        vendorId: data.vendorId,
        branchId: data.branchId || null,
        buyerId: userId,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        notes: data.notes || null,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        status: "PENDING",
        grnStatus: "PENDING",
        items: { create: items },
      },
      include: { vendor: true, items: { include: { product: true } } },
    });

    await cache.invalidateEntity("purchase", tenantId);
    await logAudit(tenantId, userId, "CREATE", "PurchaseOrder", order.id, `Created PO ${order.poNumber} for ${order.vendor?.name}`, req);
    return NextResponse.json({ order }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create purchase order" }, { status: 400 });
  }
}
