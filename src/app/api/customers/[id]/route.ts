import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, logAudit } from "@/lib/api-helpers";

// GET /api/customers/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: { salesOrders: { orderBy: { orderDate: "desc" }, take: 20 } },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

// PUT /api/customers/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    const body = await req.json();
    const customer = await db.customer.update({ where: { id }, data: body });
    await logAudit((session.user as any).id, "UPDATE", "Customer", customer.id, `Updated customer ${customer.name}`);
    return NextResponse.json({ customer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE /api/customers/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    await db.customer.delete({ where: { id } });
    await logAudit((session.user as any).id, "DELETE", "Customer", id, `Deleted customer ${id}`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
