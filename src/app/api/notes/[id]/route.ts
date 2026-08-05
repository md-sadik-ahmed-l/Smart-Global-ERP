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

// PUT /api/notes/[id] — update a tenant-scoped customer note
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "crm", "update");
  if (permErr) return permErr;

  try {
    const note = await db.customerNote.findFirst({ where: { id, tenantId } });
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const body = await req.json();
    const data = customerNoteSchema.parse(body);

    const updated = await db.customerNote.update({ where: { id }, data: { note: data.note } });

    await cache.invalidateEntity("customers", tenantId);
    await logAudit(tenantId, userId, "UPDATE", "CustomerNote", updated.id, `Updated note for customer ${updated.customerId}`, req);

    return NextResponse.json({ note: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.name === "ZodError" ? e.issues?.[0]?.message || "Validation error" : e.message || "Failed to update note" },
      { status: 400 }
    );
  }
}

// DELETE /api/notes/[id] — delete a tenant-scoped customer note
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "crm", "update");
  if (permErr) return permErr;

  try {
    const note = await db.customerNote.findFirst({ where: { id, tenantId } });
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const deleted = await db.customerNote.deleteMany({ where: { id, tenantId } });
    if (deleted.count === 0) return unauthorized();

    await cache.invalidateEntity("customers", tenantId);
    await logAudit(tenantId, userId, "DELETE", "CustomerNote", id, `Deleted note for customer ${note.customerId}`, req);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete note" }, { status: 400 });
  }
}
