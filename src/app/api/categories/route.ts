import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ categories, brands });
}
