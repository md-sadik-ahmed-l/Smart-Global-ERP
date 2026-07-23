"use client";

import { ShoppingCart, Truck, Warehouse, Landmark, Users, ReceiptText, FileText, Download, Filter, FileSpreadsheet, FileDown, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../ui/PageHeader";
import { StatCard } from "../ui/StatCard";
import { useDashboardStats, useCustomers, useVendors, useProducts, useSalesOrders, usePurchaseOrders } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";
import { motion } from "framer-motion";
import { useState } from "react";

const iconMap: Record<string, any> = {
  ShoppingCart, Truck, Warehouse, Landmark, Users, ReceiptText, TrendingUp, TrendingDown, DollarSign, Package,
};

export function ReportsModule() {
  const { data: dashData } = useDashboardStats();
  const { data: custData } = useCustomers();
  const { data: vendData } = useVendors();
  const { data: prodData } = useProducts();
  const { data: salesData } = useSalesOrders();
  const { data: poData } = usePurchaseOrders();
  const [activeReport, setActiveReport] = useState("overview");

  const k = dashData?.kpis;
  const customers = custData?.customers || [];
  const vendors = vendData?.vendors || [];
  const products = prodData?.products || [];
  const salesOrders = salesData?.orders || [];
  const purchaseOrders = poData?.orders || [];

  // Real report categories derived from actual data
  const reportCategories = [
    { id: "overview", name: "Business Overview", icon: "TrendingUp", color: "#3b82f6", count: 4, desc: "Executive summary" },
    { id: "sales", name: "Sales Reports", icon: "ShoppingCart", color: "#8b5cf6", count: salesOrders.length, desc: `${salesOrders.length} orders` },
    { id: "purchase", name: "Purchase Reports", icon: "Truck", color: "#10b981", count: purchaseOrders.length, desc: `${purchaseOrders.length} POs` },
    { id: "inventory", name: "Inventory Reports", icon: "Warehouse", color: "#f59e0b", count: products.length, desc: `${products.length} products` },
    { id: "customers", name: "Customer Reports", icon: "Users", color: "#ec4899", count: customers.length, desc: `${customers.length} customers` },
    { id: "vendors", name: "Vendor Reports", icon: "ReceiptText", color: "#14b8a6", count: vendors.length, desc: `${vendors.length} vendors` },
  ];

  // Real KPI stats
  const reportStats = [
    { label: "Total Revenue", value: k ? fmtBDT(k.totalRevenue) : "—", icon: "DollarSign", color: "#3b82f6" },
    { label: "Net Profit", value: k ? fmtBDT(k.netProfit) : "—", icon: "TrendingUp", color: "#10b981" },
    { label: "Total Orders", value: (k?.totalOrders ?? 0).toString(), icon: "ShoppingCart", color: "#8b5cf6" },
    { label: "Stock Value", value: k ? fmtBDT(k.stockValue) : "—", icon: "Package", color: "#f59e0b" },
  ];

  // Revenue trend chart (real data)
  const revenueTrend = (dashData?.revenueTrend || []).map((m: any) => ({
    month: m.month,
    revenue: m.revenue,
    profit: m.profit,
  }));

  // Sales by country (real data)
  const salesByCountry = (dashData?.salesByCountry || []).slice(0, 6);
  const countryColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#14b8a6"];

  const handleExport = (type: string) => {
    window.open(`/api/export?type=${type}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Real-time business intelligence from your live database"
        icon={FileText}
        iconColor="#14b8a6"
        showExport
        exportType="sales-orders"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80" onClick={() => handleExport("customers")}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Export Customers
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80" onClick={() => handleExport("products")}>
              <FileDown className="mr-1.5 h-4 w-4" /> Export Products
            </Button>
          </>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {reportStats.map((s, i) => {
          const Icon = iconMap[s.icon] ?? FileText;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={0} icon={Icon} color={s.color} index={i} />;
        })}
      </div>

      {/* Report Category Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {reportCategories.map((c, i) => {
          const Icon = iconMap[c.icon] ?? FileText;
          return (
            <Card
              key={c.id}
              className={`card-hover cursor-pointer border-border bg-card p-4 ${activeReport === c.id ? "border-indigo-500/50 ring-1 ring-indigo-500/30" : ""}`}
              onClick={() => setActiveReport(c.id)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-transform hover:scale-110"
                  style={{ backgroundColor: `${c.color}1a`, color: c.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">{c.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
                <p className="mt-1 text-lg font-bold" style={{ color: c.color }}>{c.count}</p>
              </motion.div>
            </Card>
          );
        })}
      </div>

      {/* Revenue Trend Chart (real data) */}
      <Card className="glass p-5 rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Revenue & Profit Trend</h3>
            <p className="text-xs text-muted-foreground">Last 12 months — real data from database</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 border-border bg-card text-foreground hover:bg-card/80" onClick={() => handleExport("sales-orders")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
        <div className="h-64 w-full">
          {revenueTrend.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No sales data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                  formatter={(v: any, n: any) => [fmtBDT(v), n === "revenue" ? "Revenue" : "Profit"]}
                  cursor={{ fill: "#1c244050" }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Sales by Country + Top Customers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glass p-5 rounded-xl">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Sales by Country</h3>
          {salesByCountry.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No data</div>
          ) : (
            <div className="flex items-center">
              <div className="h-48 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={salesByCountry} dataKey="sales" nameKey="country" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="#0f1426" strokeWidth={2}>
                      {salesByCountry.map((c: any, i: number) => <Cell key={c.country} fill={countryColors[i % countryColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => fmtBDT(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 pl-4">
                {salesByCountry.map((c: any, i: number) => (
                  <div key={c.country} className="flex items-center justify-between text-xs">
                    <span className="truncate text-foreground">{c.country}</span>
                    <span className="font-semibold text-foreground">{fmtBDT(c.sales)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="glass p-5 rounded-xl">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Top Customers by Value</h3>
          <div className="space-y-2">
            {customers.slice(0, 6).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/15 text-xs font-bold text-indigo-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.code} · {c.segment}</p>
                </div>
                <span className="font-semibold text-foreground">{fmtBDT(c.totalValue || 0)}</span>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No customers yet</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
