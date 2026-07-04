import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-helpers";

// GET /api/dashboard — executive KPIs, charts, recent orders, alerts
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  // Aggregate all in parallel
  const [
    totalRevenue, totalOrders, totalCustomers, totalProducts,
    totalEmployees, totalVendors, lowStockCount, outOfStockCount,
    stockValue, recentOrders, salesOrdersByMonth, branchPerf,
    notifications, customersByCountry,
  ] = await Promise.all([
    db.salesOrder.aggregate({ _sum: { totalAmount: true } }),
    db.salesOrder.count(),
    db.customer.count(),
    db.product.count(),
    db.user.count(),
    db.vendor.count(),
    db.product.count({ where: { stockItems: { some: { quantity: { lt: 10 } } } } }),
    db.product.count({ where: { stockItems: { every: { quantity: 0 } } } }),
    db.stockItem.findMany({ include: { product: true } }),
    db.salesOrder.findMany({
      take: 7,
      orderBy: { orderDate: "desc" },
      include: { customer: true },
    }),
    getMonthlySales(),
    db.branch.findMany({ include: { _count: { select: { users: true } }, salesOrders: { select: { totalAmount: true } } } }),
    db.notification.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    db.customer.groupBy({ by: ["country"], _count: true, orderBy: { _count: { country: "desc" } } }),
  ]);

  // Calculate total expense from purchase orders
  const totalExpense = await db.purchaseOrder.aggregate({ _sum: { totalAmount: true } });
  const netProfit = totalRevenue._sum.totalAmount - totalExpense._sum.totalAmount;
  const stockVal = stockValue.reduce((s, si) => s + si.quantity * si.product.costPrice, 0);

  // Revenue trend (last 12 months)
  const monthlyData = salesOrdersByMonth.map((m: any) => ({
    month: m.month,
    revenue: m.revenue,
    profit: Math.round(m.revenue * 0.23),
    expense: Math.round(m.revenue * 0.28),
  }));

  // Sales by country (using customer country)
  const customersByCountryWithSales = await Promise.all(
    customersByCountry.map(async (c) => {
      const sales = await db.salesOrder.aggregate({
        _sum: { totalAmount: true },
        where: { customer: { country: c.country } },
      });
      return { country: c.country, count: c._count, sales: sales._sum.totalAmount || 0 };
    })
  );
  const totalSales = customersByCountryWithSales.reduce((s: number, c: any) => s + c.sales, 0);
  const salesByCountry = customersByCountryWithSales.map((c: any) => ({
    ...c,
    percentage: totalSales > 0 ? (c.sales / totalSales) * 100 : 0,
  })).sort((a: any, b: any) => b.sales - a.sales).slice(0, 6);

  // Branch performance
  const branchPerformance = branchPerf.map((b) => {
    const revenue = b.salesOrders.reduce((s, o) => s + o.totalAmount, 0);
    return {
      branch: b.name,
      revenue,
      target: Math.round(revenue * 1.15),
      employees: b._count.users,
      status: b.status,
    };
  });

  // Recent orders enrichment
  const recentOrdersEnriched = recentOrders.map((o) => ({
    id: o.orderNumber,
    customer: o.customer?.name || "—",
    amount: o.totalAmount,
    status: o.status,
    date: o.orderDate.toISOString().slice(0, 10),
    payment: o.paymentMethod || "—",
  }));

  // Alerts
  const alerts = notifications.map((n) => ({
    type: n.type,
    title: n.title,
    message: n.message,
    time: timeAgo(n.createdAt),
    color: alertColor(n.type),
  }));

  return NextResponse.json({
    kpis: {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      netProfit,
      totalSales: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalCustomers,
      totalEmployees,
      totalProducts,
      totalExpenses: totalExpense._sum.totalAmount || 0,
      lowStockCount,
      outOfStockCount,
      stockValue: stockVal,
      totalVendors,
    },
    revenueTrend: monthlyData,
    salesByCountry,
    branchPerformance,
    recentOrders: recentOrdersEnriched,
    alerts,
    progressRings: [
      { label: "Sales Target", value: 78, color: "#3b82f6" },
      { label: "Production", value: 92, color: "#10b981" },
      { label: "Collection", value: 68, color: "#f59e0b" },
    ],
  });
}

// Build monthly revenue for last 12 months
async function getMonthlySales() {
  const now = new Date();
  const months: any[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const result = await db.salesOrder.aggregate({
      _sum: { totalAmount: true },
      where: { orderDate: { gte: start, lt: end } },
    });
    months.push({
      month: start.toLocaleString("en", { month: "short" }),
      revenue: result._sum.totalAmount || 0,
    });
  }
  return months;
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
