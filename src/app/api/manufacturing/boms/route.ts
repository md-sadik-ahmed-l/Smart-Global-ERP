// GET /api/manufacturing/boms — list BOMs
// POST /api/manufacturing/boms — create BOM
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, bomSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const boms = await db.bOM.findMany({
    where: { tenantId },
    include: {
      product: true,
      items: { include: { product: true } },
      _count: { select: { workOrders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ boms, total: boms.length });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "manufacturing", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = bomSchema.parse(body);

    const count = await db.bOM.count({ where: { tenantId } });
    const bomNumber = `BOM-${String(count + 1).padStart(4, "0")}`;

    const bom = await db.bOM.create({
      data: {
        tenantId,
        bomNumber,
        name: data.name,
        productId: data.productId,
        quantity: data.quantity,
        unit: data.unit,
        status: "ACTIVE",
        items: {
          create: data.items.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity,
            unit: it.unit,
            isOptional: it.isOptional || false,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await logAudit(tenantId, userId, "CREATE", "BOM", bom.id, `Created BOM ${bom.bomNumber} (${bom.name})`, req);
    return NextResponse.json({ bom }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
