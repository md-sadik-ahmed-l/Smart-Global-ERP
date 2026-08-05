import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import {
  requireAuth,
  unauthorized,
  customerActivitySchema,
  logAudit,
  getTenantContext,
  checkPermission,
} from "@/lib/api-helpers";

// POST /api/customers/[id]/activity — record an activity (Call, Email, Meeting, Follow-up, Order)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "crm", "update");
  if (permErr) return permErr;

  try {
    const customer = await db.customer.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const body = await req.json();
    const data = customerActivitySchema.parse(body);

    const activity = await db.customerActivity.create({
      data: {
        tenantId,
        customerId: id,
        type: data.type,
        description: data.description || null,
        createdBy: userId,
      },
    });

    await cache.invalidateEntity("customers", tenantId);
    await logAudit(tenantId, userId, "ACTIVITY", "Customer", id, `Logged ${data.type} activity on customer ${id}`, req);

    return NextResponse.json({ activity }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.name === "ZodError" ? e.issues?.[0]?.message || "Validation error" : e.message || "Failed to log activity" },
      { status: 400 }
    );
  }
}
