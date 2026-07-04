import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, logAudit } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, brand: true, stockItems: { include: { warehouse: true } } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    const body = await req.json();
    const product = await db.product.update({ where: { id }, data: body, include: { category: true, brand: true } });
    await logAudit((session.user as any).id, "UPDATE", "Product", product.id, `Updated product ${product.name}`);
    return NextResponse.json({ product });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    await logAudit((session.user as any).id, "DELETE", "Product", id, `Deleted product ${id}`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
