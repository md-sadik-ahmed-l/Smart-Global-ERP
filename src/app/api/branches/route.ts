import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();
    const { tenantId } = getTenantContext(session);

    const branches = await db.branch.findMany({
      where: { tenantId },
      include: { employees: true, users: true, warehouses: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ branches });
  } catch (e: any) {
    console.error("Branches error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
