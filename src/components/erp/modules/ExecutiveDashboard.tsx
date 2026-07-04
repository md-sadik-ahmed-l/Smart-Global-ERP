"use client";

import { useSession } from "next-auth/react";
import {
  TrendingUp, TrendingDown, Wallet, ShoppingCart, Package, Users,
  UserCog, Boxes, Crown, AlertTriangle, CheckCircle2, Info, XCircle,
  Download, Calendar, ArrowUpRight, Activity, DollarSign, Globe2, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart,
  RadialBar, PolarAngleAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { useDashboardStats } from "@/lib/erp/hooks";
import { fmtBDT, fmtNum } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = {
  TrendingUp, TrendingDown, Wallet, ShoppingCart, Package, Users,
  UserCog, Boxes,
};

const alertIcon: Record<string, any> = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  payment: string;
}

const orderColumns: Column<Order>[] = [
  {
    key: "id",
    header: "Order ID",
    render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.id}</span>,
  },
  { key: "customer", header: "Customer", render: (r) => <span className="font-medium text-foreground">{r.customer}</span> },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.amount)}</span>,
  },
  {
    key: "payment",
    header: "Payment",
    render: (r) => <span className="text-xs text-muted-foreground">{r.payment}</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge>,
  },
  {
    key: "date",
    header: "Date",
    align: "right",
    render: (r) => <span className="text-xs text-muted-foreground">{r.date}</span>,
  },
];

export function ExecutiveDashboard() {
  const { data: session } = useSession();
  const { data, isLoading, refetch, isFetching } = useDashboardStats();
  const userName = (session?.user as any)?.name || "User";

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-80 rounded-xl border border-border bg-card animate-pulse lg:col-span-2" />
          <div className="h-80 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  const k = data.kpis;
  const execKPIs = [
    { label: "Total Revenue", value: fmtBDT(k.totalRevenue), delta: 12.5, trend: "up", icon: "TrendingUp", color: "#3b82f6", subtitle: "vs last year" },
    { label: "Net Profit", value: fmtBDT(k.netProfit), delta: 8.2, trend: "up", icon: "Wallet", color: "#10b981", subtitle: "23.2% margin" },
    { label: "Total Sales", value: fmtBDT(k.totalSales), delta: 15.3, trend: "up", icon: "ShoppingCart", color: "#8b5cf6", subtitle: `${fmtNum(k.totalOrders)} orders` },
    { label: "Total Orders", value: fmtNum(k.totalOrders), delta: 9.1, trend: "up", icon: "Package", color: "#f59e0b", subtitle: "this year" },
    { label: "Total Customers", value: fmtNum(k.totalCustomers), delta: 4.7, trend: "up", icon: "Users", color: "#06b6d4", subtitle: "active buyers" },
    { label: "Total Employees", value: fmtNum(k.totalEmployees), delta: 2.1, trend: "up", icon: "UserCog", color: "#ec4899", subtitle: "12 depts" },
    { label: "Total Products", value: fmtNum(k.totalProducts), delta: 6.8, trend: "up", icon: "Boxes", color: "#14b8a6", subtitle: `${k.lowStockCount} low stock` },
    { label: "Total Expenses", value: fmtBDT(k.totalExpenses), delta: -3.2, trend: "down", icon: "TrendingDown", color: "#ef4444", subtitle: "under budget" },
  ];

  // Sales by country with flag emojis
  const flagMap: Record<string, string> = {
    "Bangladesh": "🇧🇩", "India": "🇮🇳", "USA": "🇺🇸", "UAE": "🇦🇪", "UK": "🇬🇧",
  };
  const salesByCountry = (data.salesByCountry || []).map((c: any) => ({
    ...c,
    flag: flagMap[c.country] || "🌍",
  }));
  const countryColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#14b8a6"];

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-[#0f1426] via-[#131a2e] to-[#1c2440] p-6">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5">
              <Crown className="h-3 w-3 text-amber-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                CEO Command Center
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Real-time overview of your entire business
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome back, <span className="font-medium text-foreground">{userName}</span> · Live data as of {new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-border bg-card/50 text-foreground hover:bg-card"
            >
              <Calendar className="mr-1.5 h-4 w-4" />
              This Year
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-border bg-card/50 text-foreground hover:bg-card"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => refetch()}
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Live
              <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {execKPIs.map((kpi) => {
          const Icon = iconMap[kpi.icon] ?? TrendingUp;
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              trend={kpi.trend as "up" | "down"}
              icon={Icon}
              color={kpi.color}
              subtitle={kpi.subtitle}
            />
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Revenue Overview"
          subtitle="Monthly revenue trend (current year)"
          icon={DollarSign}
          iconColor="#8b5cf6"
          className="lg:col-span-2"
          action={
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
              Revenue
            </span>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                  formatter={(v: any) => [fmtBDT(v), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Performance Rings"
          subtitle="Target achievement"
          icon={Activity}
          iconColor="#10b981"
        >
          <div className="flex h-full flex-col justify-center gap-4 py-2">
            {(data.progressRings || []).map((ring: any) => (
              <div key={ring.label} className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: ring.value, fill: ring.color }]} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: "#1c2440" }} dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color: ring.color }}>{ring.value}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{ring.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {ring.value >= 80 ? "On track" : ring.value >= 60 ? "Needs attention" : "Behind target"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Profit & Expense"
          subtitle="Monthly comparison"
          icon={TrendingUp}
          iconColor="#10b981"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Profit</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-rose-500" /> Expense</span>
            </div>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                  formatter={(v: any, n: any) => [fmtBDT(v), n === "profit" ? "Profit" : "Expense"]}
                  cursor={{ fill: "#1c244050" }}
                />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Sales by Country"
          subtitle="Geographic distribution"
          icon={Globe2}
          iconColor="#3b82f6"
        >
          <div className="flex h-64 w-full items-center">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesByCountry} dataKey="sales" nameKey="country" innerRadius={50} outerRadius={90} paddingAngle={2} stroke="#0f1426" strokeWidth={2}>
                    {salesByCountry.map((c: any, i: number) => (
                      <Cell key={c.country} fill={countryColors[i % countryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                    formatter={(v: any) => fmtBDT(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-full w-1/2 space-y-2 overflow-y-auto pl-4">
              {salesByCountry.map((c: any, i: number) => (
                <div key={c.country} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{c.flag}</span>
                    <span className="truncate text-foreground">{c.country}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold text-foreground">{fmtBDT(c.sales)}</span>
                    <span className="text-[10px] text-muted-foreground">{c.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Branch performance + Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Branch Performance</h3>
              <p className="text-xs text-muted-foreground">Revenue vs target across branches</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-400 hover:text-indigo-300">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {(data.branchPerformance || []).map((b: any) => {
              const pct = b.target > 0 ? (b.revenue / b.target) * 100 : 0;
              const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
              return (
                <div key={b.branch} className="flex items-center gap-4">
                  <div className="w-28 flex-shrink-0">
                    <p className="truncate text-sm font-medium text-foreground">{b.branch}</p>
                    <p className="text-[10px] text-muted-foreground">{b.employees} employees</p>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{fmtBDT(b.revenue)}</span>
                      <span className="text-muted-foreground">/ {fmtBDT(b.target)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                    </div>
                  </div>
                  <div className="w-12 flex-shrink-0 text-right">
                    <span className="text-sm font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">System Alerts</h3>
              <p className="text-xs text-muted-foreground">Recent notifications</p>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15 text-xs font-bold text-rose-400">
              {(data.alerts || []).length}
            </span>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {(data.alerts || []).map((a: any, i: number) => {
              const AIcon = alertIcon[a.type] ?? Info;
              return (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/50 p-2.5 transition-colors hover:border-border">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${a.color}1a`, color: a.color }}>
                    <AIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.message}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
            <p className="text-xs text-muted-foreground">Latest customer orders across all branches</p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-400 hover:text-indigo-300">
            View All Orders <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <DataTable columns={orderColumns} data={data.recentOrders || []} />
      </Card>
    </div>
  );
}
