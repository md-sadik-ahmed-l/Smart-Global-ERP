import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, customerSchema, logAudit } from "@/lib/api-helpers";

// GET /api/customers — list with optional search
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status");
  const segment = searchParams.get("segment");

  const customers = await db.customer.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
            { code: { contains: q } },
          ]
        } : {},
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

  return NextResponse.json({ customers: enriched, total: enriched.length });
}

// POST /api/customers — create
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const data = customerSchema.parse(body);

    // Generate customer code
    const count = await db.customer.count();
    const code = `CUS-${String(count + 1).padStart(4, "0")}`;

    const customer = await db.customer.create({
      data: { ...data, code, email: data.email || null },
    });

    await logAudit((session.user as any).id, "CREATE", "Customer", customer.id, `Created customer ${customer.name} (${customer.code})`);

    return NextResponse.json({ customer }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create customer" }, { status: 400 });
  }
}
