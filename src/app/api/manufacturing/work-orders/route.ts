// Work Orders API — full lifecycle management
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { requireAuth, unauthorized, workOrderSchema, productionLogSchema, qcCheckSchema, logAudit, getTenantContext, checkPermission } from "@/lib/api-helpers";

// GET /api/manufacturing/work-orders
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const workOrders = await db.workOrder.findMany({
    where: {
      tenantId,
      ...(status ? { status } : {}),
    },
    include: {
      product: true,
      bom: { include: { items: { include: { product: true } } } },
      branch: true,
      supervisor: { select: { id: true, name: true, avatar: true } },
      items: { include: { product: true } },
      productionLogs: { orderBy: { logTime: "desc" }, take: 5 },
      qcChecks: { orderBy: { checkedAt: "desc" }, take: 3 },
      _count: { select: { productionLogs: true, qcChecks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with progress percentage
  const enriched = workOrders.map((wo) => ({
    ...wo,
    progressPct: wo.plannedQty > 0 ? Math.round((wo.producedQty / wo.plannedQty) * 100) : 0,
    rejectionRate: wo.producedQty > 0 ? ((wo.rejectedQty / wo.producedQty) * 100).toFixed(1) : "0",
  }));

  return NextResponse.json({ workOrders: enriched, total: enriched.length });
}

// POST /api/manufacturing/work-orders — create + lifecycle actions
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "manufacturing", "create");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const { action, ...rest } = body;

    // Action: create | release | start_production | log_production | qc_check | complete
    if (action === "log_production") {
      return await logProduction(req, session, rest);
    } else if (action === "qc_check") {
      return await addQCCheck(req, session, rest);
    }

    // Default: create work order
    const data = workOrderSchema.parse(rest);
    const count = await db.workOrder.count({ where: { tenantId } });
    const woNumber = `WO-${String(count + 1).padStart(4, "0")}`;

    // If BOM provided, copy BOM items to work order items
    let bomItems: any[] = [];
    if (data.bomId) {
      const bom = await db.bOM.findUnique({
        where: { id: data.bomId },
        include: { items: true },
      });
      if (bom) {
        bomItems = bom.items.map((bi) => ({
          productId: bi.productId,
          requiredQty: bi.quantity * data.plannedQty,
          issuedQty: 0,
          unit: bi.unit,
        }));
      }
    }

    const wo = await db.workOrder.create({
      data: {
        tenantId,
        woNumber,
        bomId: data.bomId || null,
        productId: data.productId,
        branchId: data.branchId || null,
        supervisorId: data.supervisorId || null,
        plannedQty: data.plannedQty,
        startDate: action === "release" ? new Date() : null,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : null,
        status: action === "release" ? "IN_PROGRESS" : "CREATED",
        priority: data.priority,
        notes: data.notes || null,
        items: bomItems.length > 0 ? { create: bomItems } : undefined,
      },
      include: { items: { include: { product: true } } },
    });

    await logAudit(tenantId, userId, "CREATE", "WorkOrder", wo.id, `Created work order ${wo.woNumber} for ${wo.plannedQty} units`, req);
    return NextResponse.json({ workOrder: wo }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// PUT /api/manufacturing/work-orders — lifecycle transitions
export async function PUT(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId, userId } = getTenantContext(session);

  const permErr = await checkPermission(session, "manufacturing", "update");
  if (permErr) return permErr;

  try {
    const body = await req.json();
    const { id, action } = body;

    const wo = await db.workOrder.findFirst({ where: { id, tenantId } });
    if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

    const transitions: Record<string, string> = {
      release: "IN_PROGRESS",
      complete: "COMPLETED",
      cancel: "CANCELLED",
    };

    const newStatus = transitions[action];
    if (!newStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const updateData: any = { status: newStatus };
    if (action === "release") updateData.startDate = new Date();
    if (action === "complete") {
      updateData.endDate = new Date();
      // Auto stock-in the produced quantity
      const warehouse = await db.warehouse.findFirst({ where: { tenantId, branchId: wo.branchId } });
      if (warehouse) {
        const existingStock = await db.stockItem.findFirst({
          where: { tenantId, productId: wo.productId, warehouseId: warehouse.id },
        });
        if (existingStock) {
          await db.stockItem.update({
            where: { id: existingStock.id },
            data: { quantity: { increment: wo.producedQty } },
          });
        } else {
          await db.stockItem.create({
            data: { tenantId, productId: wo.productId, warehouseId: warehouse.id, quantity: wo.producedQty },
          });
        }
      }
    }

    const updated = await db.workOrder.update({ where: { id }, data: updateData });
    await cache.invalidateEntity("workorders", tenantId);
    await logAudit(tenantId, userId, "UPDATE", "WorkOrder", wo.id, `Work order ${wo.woNumber} → ${newStatus}`, req);

    return NextResponse.json({ workOrder: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// Log production output
async function logProduction(req: NextRequest, session: any, body: any) {
  const { tenantId, userId } = getTenantContext(session);
  const data = productionLogSchema.parse(body);

  const wo = await db.workOrder.findFirst({ where: { id: data.workOrderId, tenantId } });
  if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  if (wo.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Work order must be in progress to log production" }, { status: 400 });
  }

  const log = await db.productionLog.create({
    data: {
      tenantId,
      workOrderId: data.workOrderId,
      operatorId: userId,
      producedQty: data.producedQty,
      rejectedQty: data.rejectedQty,
      shift: data.shift || null,
      station: data.station || null,
      notes: data.notes || null,
    },
  });

  // Update work order cumulative quantities
  const updated = await db.workOrder.update({
    where: { id: data.workOrderId },
    data: {
      producedQty: { increment: data.producedQty },
      rejectedQty: { increment: data.rejectedQty },
    },
  });

  // Auto-complete if produced >= planned
  if (updated.producedQty >= updated.plannedQty) {
    await db.workOrder.update({
      where: { id: data.workOrderId },
      data: { status: "QC", endDate: new Date() },
    });
  }

  await logAudit(tenantId, userId, "CREATE", "ProductionLog", log.id, `Logged ${data.producedQty} units to ${wo.woNumber}`, req);
  return NextResponse.json({ log, workOrder: updated }, { status: 201 });
}

// Add QC check
async function addQCCheck(req: NextRequest, session: any, body: any) {
  const { tenantId, userId } = getTenantContext(session);
  const data = qcCheckSchema.parse(body);

  const wo = await db.workOrder.findFirst({ where: { id: data.workOrderId, tenantId } });
  if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  const qc = await db.qCCheck.create({
    data: {
      tenantId,
      workOrderId: data.workOrderId,
      inspectorId: userId,
      checkType: data.checkType,
      sampleSize: data.sampleSize,
      passedQty: data.passedQty,
      failedQty: data.failedQty,
      defectType: data.defectType || null,
      status: data.status,
      notes: data.notes || null,
    },
  });

  // If QC passed and work order is in QC status, complete it
  if (data.status === "PASSED" && wo.status === "QC") {
    await db.workOrder.update({
      where: { id: data.workOrderId },
      data: { status: "COMPLETED", endDate: new Date() },
    });
  }

  await logAudit(tenantId, userId, "CREATE", "QCCheck", qc.id, `QC check (${data.status}) on ${wo.woNumber}`, req);
  return NextResponse.json({ qcCheck: qc }, { status: 201 });
}
