import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, bomSchema, logAudit } from "@/lib/api-helpers";

// GET /api/manufacturing/bom — list all BOMs
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const tenantId = (session.user as any).tenantId;

  const boms = await db.billOfMaterial.findMany({
    where: { tenantId },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      components: { include: { product: { select: { id: true, name: true, sku: true, costPrice: true } } } },
      _count: { select: { workOrders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ boms, total: boms.length });
}

// POST /api/manufacturing/bom — create new BOM
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const tenantId = (session.user as any).tenantId;

  try {
    const body = await req.json();
    const data = bomSchema.parse(body);

    const count = await db.billOfMaterial.count({ where: { tenantId } });
    const bomNumber = `BOM-${String(count + 1).padStart(4, "0")}`;

    const totalCost = data.components.reduce((s, c) => s + c.quantity * c.unitCost, 0);

    const bom = await db.billOfMaterial.create({
      data: {
        tenantId,
        bomNumber,
        productId: data.productId,
        name: data.name,
        description: data.description || null,
        totalCost,
        components: {
          create: data.components.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
            unitCost: c.unitCost,
            totalPrice: c.quantity * c.unitCost,
            notes: c.notes || null,
          })),
        },
      },
      include: { components: { include: { product: true } } },
    });

    await logAudit((session.user as any).id, "CREATE", "BillOfMaterial", bom.id, `Created BOM ${bom.bomNumber} for ${bom.name}`, { tenantId });
    return NextResponse.json({ bom }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create BOM" }, { status: 400 });
  }
}
