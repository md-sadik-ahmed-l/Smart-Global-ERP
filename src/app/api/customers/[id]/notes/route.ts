import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import {
  requireAuth,
  unauthorized,
  customerNoteSchema,
  logAudit,
  getTenantContext,
  checkPermission,
} from "@/lib/api-helpers";

// GET /api/customers/[id]/notes — list notes for a tenant-scoped customer
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId } = getTenantContext(session);

  const customer = await db.customer.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const notes = await db.customerNote.findMany({
    where: { tenantId, customerId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notes });
}

// POST /api/customers/[id]/notes — add a note to a tenant-scoped customer
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
    const data = customerNoteSchema.parse(body);

    const note = await db.customerNote.create({
      data: { tenantId, customerId: id, note: data.note, createdBy: userId },
    });

    await cache.invalidateEntity("customers", tenantId);
    await logAudit(tenantId, userId, "NOTE", "Customer", id, `Added note to customer ${id}`, req);

    return NextResponse.json({ note }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.name === "ZodError" ? e.issues?.[0]?.message || "Validation error" : e.message || "Failed to add note" },
      { status: 400 }
    );
  }
}
