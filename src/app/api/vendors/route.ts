import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { requireAuth, unauthorized, vendorSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const country = searchParams.get("country");

  const cKey = `${tenantId}:vendors:list:${q}:${status}:${category}:${country}`;

  const result = await cache.cached(cKey, 30, async () => {
    const vendors = await db.vendor.findMany({
      where: {
        tenantId,
        AND: [
          q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { code: { contains: q } }, { contactPerson: { contains: q } }] } : {},
          status ? { status: status as any } : {},
          category ? { category: { contains: category } } : {},
          country ? { country } : {},
        ],
      },
      include: {
        _count: { select: { purchaseOrders: true } },
        purchaseOrders: { select: { totalAmount: true, paidAmount: true }, take: 100 },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = vendors.map((v) => {
      const purchase = v.purchaseOrders.reduce((s, o) => s + o.totalAmount, 0);
      const payment = v.purchaseOrders.reduce((s, o) => s + o.paidAmount, 0);
      const due = purchase - payment;
      const { purchaseOrders, ...rest } = v;
      return { ...rest, purchase, payment, due, poCount: v._count.purchaseOrders };
    });

    return { vendors: enriched, total: enriched.length };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "vendors", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = vendorSchema.parse(body);

    const count = await db.vendor.count({ where: { tenantId } });
    const code = `VND-${String(count + 1).padStart(4, "0")}`;

    const vendor = await db.vendor.create({
      data: { ...data, tenantId, code, email: data.email || null },
    });

    await cache.invalidateEntity("vendors", tenantId);
    await logAudit(tenantId, userId, "CREATE", "Vendor", vendor.id, `Created vendor ${vendor.name} (${vendor.code})`, req);

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create vendor" }, { status: 400 });
  }
}
