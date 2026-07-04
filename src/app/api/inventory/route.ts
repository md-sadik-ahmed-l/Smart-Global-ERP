import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, stockAdjustmentSchema, logAudit } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const warehouseId = searchParams.get("warehouseId");
  const lowStockOnly = searchParams.get("lowStock") === "true";

  // Get all products with their stock
  const products = await db.product.findMany({
    where: q ? {
      OR: [{ name: { contains: q } }, { sku: { contains: q } }]
    } : {},
    include: {
      category: true,
      stockItems: { include: { warehouse: true } },
    },
    orderBy: { name: "asc" },
  });

  let enriched = products.map((p) => {
    const totalStock = p.stockItems.reduce((s, si) => s + si.quantity, 0);
    const stockValue = p.stockItems.reduce((s, si) => s + si.quantity * p.costPrice, 0);
    let stockStatus = "In Stock";
    if (totalStock === 0) stockStatus = "Out of Stock";
    else if (totalStock < p.reorderLevel) stockStatus = "Low Stock";
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || "—",
      warehouse: p.stockItems[0]?.warehouse?.name || "—",
      stock: totalStock,
      reorder: p.reorderLevel,
      unit: p.unit,
      value: stockValue,
      status: stockStatus,
    };
  });

  if (lowStockOnly) {
    enriched = enriched.filter((p) => p.status !== "In Stock");
  }

  return NextResponse.json({ inventory: enriched, total: enriched.length });
}

// POST /api/inventory — stock adjustment
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const data = stockAdjustmentSchema.parse(body);

    // Find or create stock item
    let stockItem = await db.stockItem.findFirst({
      where: { productId: data.productId, warehouseId: data.warehouseId },
    });

    if (!stockItem) {
      stockItem = await db.stockItem.create({
        data: { productId: data.productId, warehouseId: data.warehouseId, quantity: 0 },
      });
    }

    // Apply adjustment
    let newQty = stockItem.quantity;
    if (["IN", "RETURN"].includes(data.adjustmentType)) {
      newQty += Math.abs(data.quantity);
    } else if (["OUT", "DAMAGE"].includes(data.adjustmentType)) {
      newQty -= Math.abs(data.quantity);
      if (newQty < 0) newQty = 0;
    } else if (data.adjustmentType === "TRANSFER") {
      // For transfer, just add the quantity (caller handles the OUT side separately)
      newQty += data.quantity;
    }

    await db.stockItem.update({ where: { id: stockItem.id }, data: { quantity: newQty } });

    // Create adjustment record
    const adjustment = await db.stockAdjustment.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        adjustedBy: (session.user as any).id,
        adjustmentType: data.adjustmentType,
        quantity: data.quantity,
        reason: data.reason || null,
      },
    });

    await logAudit((session.user as any).id, "CREATE", "StockAdjustment", adjustment.id, `Stock ${data.adjustmentType} of ${data.quantity} units (reason: ${data.reason || "—"})`);
    return NextResponse.json({ adjustment, newQuantity: newQty }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to adjust stock" }, { status: 400 });
  }
}
