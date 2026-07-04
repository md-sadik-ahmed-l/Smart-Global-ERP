import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, productSchema, logAudit } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId");
  const status = searchParams.get("status");

  const products = await db.product.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { barcode: { contains: q } },
          ]
        } : {},
        categoryId ? { categoryId } : {},
        status ? { status: status as any } : {},
      ],
    },
    include: {
      category: true,
      brand: true,
      stockItems: { include: { warehouse: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = products.map((p) => {
    const totalStock = p.stockItems.reduce((s, si) => s + si.quantity, 0);
    const stockValue = p.stockItems.reduce((s, si) => s + si.quantity * p.costPrice, 0);
    let stockStatus = "In Stock";
    if (totalStock === 0) stockStatus = "Out of Stock";
    else if (totalStock < p.reorderLevel) stockStatus = "Low Stock";
    const { stockItems, ...rest } = p;
    return { ...rest, stock: totalStock, stockValue, stockStatus };
  });

  return NextResponse.json({ products: enriched, total: enriched.length });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await db.product.create({
      data: {
        ...data,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        description: data.description || null,
        barcode: data.barcode || null,
        imageUrl: data.imageUrl || null,
      },
      include: { category: true, brand: true },
    });

    await logAudit((session.user as any).id, "CREATE", "Product", product.id, `Created product ${product.name} (${product.sku})`);
    return NextResponse.json({ product }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create product" }, { status: 400 });
  }
}
