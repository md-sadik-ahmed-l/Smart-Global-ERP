// Employees API
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext, checkPermission, logAudit, employeeSchema } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");
  const status = searchParams.get("status");

  const employees = await db.employee.findMany({
    where: {
      tenantId,
      ...(department ? { department } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      salaryStructure: true,
      branch: { select: { name: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ employees, total: employees.length });
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "hr", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const data = employeeSchema.parse(body);

    const count = await db.employee.count({ where: { tenantId } });
    const employeeCode = `EMP-${String(count + 1).padStart(4, "0")}`;

    const employee = await db.employee.create({
      data: {
        tenantId,
        employeeCode,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        department: data.department || null,
        designation: data.designation || null,
        branchId: data.branchId || null,
        joinDate: new Date(data.joinDate),
        salaryStructureId: data.salaryStructureId || null,
        bankAccount: data.bankAccount || null,
        bankName: data.bankName || null,
        nidNumber: data.nidNumber || null,
        status: "ACTIVE",
      },
      include: { salaryStructure: true, branch: true },
    });

    await logAudit(tenantId, userId, "CREATE", "Employee", employee.id, `Created employee ${employee.name} (${employee.employeeCode})`, req);
    return NextResponse.json({ employee }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
