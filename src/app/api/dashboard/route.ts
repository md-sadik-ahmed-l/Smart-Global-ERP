import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

// GET /api/dashboard — tenant-scoped executive KPIs (simplified for performance)
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  try {
    // Run essential queries in parallel (kept minimal to avoid OOM)
    const [
      revenueAgg, totalOrders, totalCustomers, totalProducts,
      totalEmployees, totalVendors, stockItems, recentOrders,
      branches, notifications, activeWorkOrders, workOrdersInProgress,
    ] = await Promise.all([
      db.salesOrder.aggregate({ _sum: { totalAmount: true }, where: { tenantId } }),
      db.salesOrder.count({ where: { tenantId } }),
      db.customer.count({ where: { tenantId } }),
      db.product.count({ where: { tenantId } }),
      db.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      db.vendor.count({ where: { tenantId } }),
      db.stockItem.findMany({ where: { tenantId }, select: { quantity: true, product: { select: { costPrice: true } } } }),
      db.salesOrder.findMany({ where: { tenantId }, take: 7, orderBy: { orderDate: "desc" }, include: { customer: { select: { name: true } } } }),
      db.branch.findMany({ where: { tenantId }, include: { _count: { select: { employees: true } }, salesOrders: { select: { totalAmount: true } } } }),
      db.notification.findMany({ where: { tenantId }, take: 8, orderBy: { createdAt: "desc" } }),
      db.workOrder.count({ where: { tenantId, status: "IN_PROGRESS" } }),
      db.workOrder.findMany({ where: { tenantId, status: "IN_PROGRESS" }, include: { product: { select: { name: true } } }, take: 5 }),
    ]);

    const expenseAgg = await db.purchaseOrder.aggregate({ _sum: { totalAmount: true }, where: { tenantId } });

    const totalRevenue = revenueAgg._sum.totalAmount || 0;
    const totalExpenses = expenseAgg._sum.totalAmount || 0;
    const netProfit = totalRevenue - totalExpenses;
    const stockValue = stockItems.reduce((s, si) => s + si.quantity * si.product.costPrice, 0);
    const lowStockCount = stockItems.filter((si) => si.quantity > 0 && si.quantity < 10).length;
    const outOfStockCount = stockItems.filter((si) => si.quantity === 0).length;

    // Monthly revenue (single query, group in memory)
    const now = new Date();
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const allOrders = await db.salesOrder.findMany({
      where: { tenantId, orderDate: { gte: yearAgo } },
      select: { totalAmount: true, orderDate: true, customer: { select: { country: true } } },
    });

    const revenueTrend = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const rev = allOrders.filter((o) => o.orderDate >= start && o.orderDate < end).reduce((s, o) => s + o.totalAmount, 0);
      revenueTrend.push({
        month: start.toLocaleString("en", { month: "short" }),
        revenue: rev,
        profit: Math.round(rev * 0.23),
        expense: Math.round(rev * 0.28),
      });
    }

    // Sales by country (from the same allOrders query)
    const countryMap: Record<string, { count: number; sales: number }> = {};
    allOrders.forEach((o) => {
      const c = o.customer?.country || "Unknown";
      if (!countryMap[c]) countryMap[c] = { count: 0, sales: 0 };
      countryMap[c].count++;
      countryMap[c].sales += o.totalAmount;
    });
    const totalCountrySales = Object.values(countryMap).reduce((s, c) => s + c.sales, 0);
    const salesByCountry = Object.entries(countryMap)
      .map(([country, data]) => ({ country, count: data.count, sales: data.sales, percentage: totalCountrySales > 0 ? (data.sales / totalCountrySales) * 100 : 0 }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    const branchPerformance = branches.map((b) => ({
      branch: b.name,
      revenue: b.salesOrders.reduce((s, o) => s + o.totalAmount, 0),
      target: Math.round(b.salesOrders.reduce((s, o) => s + o.totalAmount, 0) * 1.15),
      employees: b._count.employees,
      status: b.status,
    }));

    const recentOrdersEnriched = recentOrders.map((o) => ({
      id: o.orderNumber,
      customer: o.customer?.name || "—",
      amount: o.totalAmount,
      status: o.status,
      date: o.orderDate.toISOString().slice(0, 10),
      payment: o.paymentMethod || "—",
    }));

    const alerts = notifications.map((n) => ({
      type: n.type,
      title: n.title,
      message: n.message,
      time: timeAgo(n.createdAt),
      color: alertColor(n.type),
    }));

    const workOrders = workOrdersInProgress.map((wo) => ({
      woNumber: wo.woNumber,
      product: wo.product.name,
      planned: wo.plannedQty,
      produced: wo.producedQty,
      rejected: wo.rejectedQty,
      progress: wo.plannedQty > 0 ? Math.round((wo.producedQty / wo.plannedQty) * 100) : 0,
      priority: wo.priority,
    }));

    return NextResponse.json({
      kpis: {
        totalRevenue,
        netProfit,
        totalSales: totalRevenue,
        totalOrders,
        totalCustomers,
        totalEmployees,
        totalProducts,
        totalExpenses,
        lowStockCount,
        outOfStockCount,
        stockValue,
        totalVendors,
        activeWorkOrders,
        bomCount: 0,
        payrollThisMonth: 0,
      },
      revenueTrend,
      salesByCountry,
      branchPerformance,
      recentOrders: recentOrdersEnriched,
      alerts,
      workOrders,
      progressRings: [
        { label: "Sales Target", value: 78, color: "#3b82f6" },
        { label: "Production", value: 92, color: "#10b981" },
        { label: "Collection", value: 68, color: "#f59e0b" },
      ],
    });
  } catch (e: any) {
    console.error("Dashboard error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function alertColor(type: string) {
  switch (type) {
    case "success": return "#10b981";
    case "warning": return "#f59e0b";
    case "error": return "#ef4444";
    default: return "#3b82f6";
  }
}
