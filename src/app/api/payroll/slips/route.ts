// Salary Slips API
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext, checkPermission, logAudit } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const employeeId = searchParams.get("employeeId");

  const slips = await db.salarySlip.findMany({
    where: {
      tenantId,
      ...(month ? { month: parseInt(month) } : {}),
      ...(year ? { year: parseInt(year) } : {}),
      ...(employeeId ? { employeeId } : {}),
    },
    include: {
      employee: { include: { salaryStructure: true } },
      payrollRun: { select: { runNumber: true, status: true } },
      generatedBy: { select: { name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ slips, total: slips.length });
}

// Mark slip as paid
export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "payroll", "approve");
  if (permErr) return permErr;

  try {
    const { id } = await req.json();
    const slip = await db.salarySlip.findFirst({ where: { id, tenantId } });
    if (!slip) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.salarySlip.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });

    await logAudit(tenantId, userId, "UPDATE", "SalarySlip", slip.id, `Marked slip ${slip.slipNumber} as PAID`, req);
    return NextResponse.json({ slip: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
