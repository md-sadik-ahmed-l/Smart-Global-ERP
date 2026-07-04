import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const branches = await db.branch.findMany({
    include: { warehouses: true, _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ branches });
}
