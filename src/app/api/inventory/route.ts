import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { requireAuth, unauthorized, stockAdjustmentSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const lowStockOnly = searchParams.get("lowStock") === "true";

  const cKey = `${tenantId}:inventory:${q}:${lowStockOnly}`;

  const result = await cache.cached(cKey, 30, async () => {
    const products = await db.product.findMany({
      where: {
        tenantId,
        ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {}),
      },
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

    return { inventory: enriched, total: enriched.length };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "inventory", "update");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = stockAdjustmentSchema.parse(body);

    let stockItem = await db.stockItem.findFirst({
      where: { tenantId, productId: data.productId, warehouseId: data.warehouseId },
    });

    if (!stockItem) {
      stockItem = await db.stockItem.create({
        data: { tenantId, productId: data.productId, warehouseId: data.warehouseId, quantity: 0 },
      });
    }

    let newQty = stockItem.quantity;
    if (["IN", "RETURN"].includes(data.adjustmentType)) {
      newQty += Math.abs(data.quantity);
    } else if (["OUT", "DAMAGE"].includes(data.adjustmentType)) {
      newQty -= Math.abs(data.quantity);
      if (newQty < 0) newQty = 0;
    } else if (data.adjustmentType === "TRANSFER") {
      newQty += data.quantity;
    }

    await db.stockItem.update({ where: { id: stockItem.id }, data: { quantity: newQty } });

    const adjustment = await db.stockAdjustment.create({
      data: {
        tenantId,
        productId: data.productId,
        warehouseId: data.warehouseId,
        adjustedBy: userId,
        adjustmentType: data.adjustmentType,
        quantity: data.quantity,
        reason: data.reason || null,
      },
    });

    await cache.invalidateEntity("inventory", tenantId);
    await cache.invalidateEntity("products", tenantId);
    await logAudit(tenantId, userId, "CREATE", "StockAdjustment", adjustment.id, `Stock ${data.adjustmentType} of ${data.quantity} units`, req);
    return NextResponse.json({ adjustment, newQuantity: newQty }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to adjust stock" }, { status: 400 });
  }
}
