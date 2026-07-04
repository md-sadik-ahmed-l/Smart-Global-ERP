import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-helpers";

// Mark single notification as read
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;

  await db.notification.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { id } = await params;

  await db.notification.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
