import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const userId = (session.user as any).id;

  const notifications = await db.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await db.notification.count({
    where: { recipientId: userId, isRead: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// Mark all as read
export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const userId = (session.user as any).id;

  await db.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
