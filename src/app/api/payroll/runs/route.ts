// Payroll Run API — generates salary slips for all employees for a given month
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, payrollRunSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

// GET /api/payroll/runs — list payroll runs
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const runs = await db.payrollRun.findMany({
    where: { tenantId },
    include: {
      _count: { select: { salarySlips: true } },
      processedBy: { select: { name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ runs, total: runs.length });
}

// POST /api/payroll/runs — create payroll run + auto-generate salary slips
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "payroll", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = payrollRunSchema.parse(body);

    // Check if payroll already exists for this month/year
    const existing = await db.payrollRun.findFirst({
      where: { tenantId, month: data.month, year: data.year, status: { not: "DRAFT" } },
    });
    if (existing) {
      return NextResponse.json({ error: `Payroll for ${data.month}/${data.year} already processed` }, { status: 400 });
    }

    const count = await db.payrollRun.count({ where: { tenantId } });
    const runNumber = `PR-${data.year}${String(data.month).padStart(2, "0")}-${String(count + 1).padStart(3, "0")}`;

    // Get all active employees with salary structures
    const employees = await db.employee.findMany({
      where: { tenantId, status: "ACTIVE", salaryStructureId: { not: null } },
      include: { salaryStructure: true },
    });

    if (employees.length === 0) {
      return NextResponse.json({ error: "No active employees with salary structures found" }, { status: 400 });
    }

    // Calculate attendance for the month
    const monthStart = new Date(data.year, data.month - 1, 1);
    const monthEnd = new Date(data.year, data.month, 0);

    const slips = [];
    let totalGross = 0;
    let totalNet = 0;
    let totalTax = 0;

    for (const emp of employees) {
      const ss = emp.salaryStructure!;
      const grossSalary = ss.basicSalary + ss.houseRent + ss.medicalAllowance + ss.conveyance + ss.foodAllowance + ss.specialAllowance;
      const pfDeduction = ss.providentFund;
      const taxAmount = Math.round((grossSalary * ss.taxPercent) / 100);
      const totalDeductions = pfDeduction + taxAmount;
      const netSalary = grossSalary - totalDeductions;

      // Get attendance
      const attendance = await db.attendance.findMany({
        where: {
          tenantId,
          employeeId: emp.id,
          date: { gte: monthStart, lte: monthEnd },
        },
      });

      const presentDays = attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
      const absentDays = attendance.filter((a) => a.status === "ABSENT").length;
      const leaveDays = attendance.filter((a) => a.status === "LEAVE" || a.status === "HALF_DAY").length;
      const overtimeHours = attendance.reduce((s, a) => s + a.overtime, 0);
      const overtimeAmount = Math.round(overtimeHours * (ss.basicSalary / 30 / 8) * 1.5); // 1.5x hourly rate

      const slipCount = await db.salarySlip.count({ where: { tenantId } });
      const slipNumber = `SLIP-${data.year}${String(data.month).padStart(2, "0")}-${String(slipCount + 1).padStart(4, "0")}`;

      const slip = await db.salarySlip.create({
        data: {
          tenantId,
          slipNumber,
          employeeId: emp.id,
          generatedById: userId,
          month: data.month,
          year: data.year,
          basicSalary: ss.basicSalary,
          grossSalary: grossSalary + overtimeAmount,
          totalAllowances: grossSalary - ss.basicSalary + overtimeAmount,
          totalDeductions,
          taxAmount,
          netSalary: netSalary + overtimeAmount,
          presentDays,
          absentDays,
          leaveDays,
          overtimeHours,
          overtimeAmount,
          status: "GENERATED",
        },
      });
      slips.push(slip);

      totalGross += grossSalary + overtimeAmount;
      totalNet += netSalary + overtimeAmount;
      totalTax += taxAmount;
    }

    const run = await db.payrollRun.create({
      data: {
        tenantId,
        runNumber,
        month: data.month,
        year: data.year,
        totalEmployees: employees.length,
        totalGross,
        totalNet,
        totalTax,
        status: "PROCESSED",
        processedById: userId,
        processedAt: new Date(),
      },
    });

    // Link slips to run
    await db.salarySlip.updateMany({
      where: { id: { in: slips.map((s) => s.id) } },
      data: { payrollRunId: run.id },
    });

    await logAudit(tenantId, userId, "CREATE", "PayrollRun", run.id, `Payroll run ${run.runNumber} for ${data.month}/${data.year} — ${employees.length} employees, net ৳${totalNet}`, req);

    return NextResponse.json({
      run,
      slipCount: slips.length,
      totalGross,
      totalNet,
      totalTax,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
