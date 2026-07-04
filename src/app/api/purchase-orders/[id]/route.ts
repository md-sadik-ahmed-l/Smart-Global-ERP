import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, logAudit } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    const body = await req.json();
    const order = await db.purchaseOrder.update({ where: { id }, data: body });
    await logAudit((session.user as any).id, "UPDATE", "PurchaseOrder", order.id, `Updated PO ${order.poNumber}`);
    return NextResponse.json({ order });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    await db.purchaseOrder.delete({ where: { id } });
    await logAudit((session.user as any).id, "DELETE", "PurchaseOrder", id, `Deleted PO ${id}`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
