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

// GET /api/customers/[id]/activities — list activities for a tenant-scoped customer
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId } = getTenantContext(session);

  const customer = await db.customer.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const activities = await db.customerActivity.findMany({
    where: { tenantId, customerId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ activities });
}
