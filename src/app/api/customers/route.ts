import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { requireAuth, unauthorized, customerSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status");
  const segment = searchParams.get("segment");

  // Cache key scoped to tenant + filters
  const cKey = `${tenantId}:customers:list:${q}:${status}:${segment}`;

  const result = await cache.cached(cKey, 30, async () => {
    const customers = await db.customer.findMany({
      where: {
        tenantId,
        AND: [
          q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { code: { contains: q } }] } : {},
          status ? { status: status as any } : {},
          segment ? { segment: segment as any } : {},
        ],
      },
      include: {
        _count: { select: { salesOrders: true } },
        salesOrders: { select: { totalAmount: true, paidAmount: true }, take: 100 },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = customers.map((c) => {
      const totalValue = c.salesOrders.reduce((s, o) => s + o.totalAmount, 0);
      const dueAmount = c.salesOrders.reduce((s, o) => s + (o.totalAmount - o.paidAmount), 0);
      const { salesOrders, ...rest } = c;
      return { ...rest, orders: c._count.salesOrders, totalValue, dueAmount };
    });

    return { customers: enriched, total: enriched.length };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  // RBAC check
  const permErr = await checkPermission(session, "crm", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = customerSchema.parse(body);

    const count = await db.customer.count({ where: { tenantId } });
    const code = `CUS-${String(count + 1).padStart(4, "0")}`;

    const customer = await db.customer.create({
      data: { ...data, tenantId, code, email: data.email || null },
    });

    // Invalidate cache
    await cache.invalidateEntity("customers", tenantId);

    await logAudit(tenantId, userId, "CREATE", "Customer", customer.id, `Created customer ${customer.name} (${customer.code})`, req);

    return NextResponse.json({ customer }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create customer" }, { status: 400 });
  }
}
