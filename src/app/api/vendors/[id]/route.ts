import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, logAudit } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const vendor = await db.vendor.findUnique({
    where: { id },
    include: { purchaseOrders: { orderBy: { orderDate: "desc" }, take: 20 } },
  });
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vendor });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    const body = await req.json();
    const vendor = await db.vendor.update({ where: { id }, data: body });
    await logAudit((session.user as any).id, "UPDATE", "Vendor", vendor.id, `Updated vendor ${vendor.name}`);
    return NextResponse.json({ vendor });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    await db.vendor.delete({ where: { id } });
    await logAudit((session.user as any).id, "DELETE", "Vendor", id, `Deleted vendor ${id}`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
