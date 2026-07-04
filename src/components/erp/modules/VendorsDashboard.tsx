"use client";

import {
  Users, ShoppingBag, ShoppingCart, Wallet, AlertCircle, CalendarClock,
  FileSignature, UserX, Plus, Download, Upload, Star, MoreHorizontal,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import {
  vendorKPIs, purchaseByCategory, topVendorsByPurchase,
  purchaseVsPayment, vendorStatus, vendorTable, fmtBDT, fmtNum,
} from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = {
  Users, ShoppingBag, ShoppingCart, Wallet, AlertCircle, CalendarClock,
  FileSignature, UserX,
};

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  category: string;
  purchase: number;
  payment: number;
  due: number;
  rating: number;
  status: string;
  creditDays: number;
}

const vendorColumns: Column<Vendor>[] = [
  {
    key: "name",
    header: "Vendor",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-400">
          {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{r.contact} · {r.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "country",
    header: "Country",
    render: (r) => (
      <span className="flex items-center gap-1.5 text-sm">
        <span className="text-base">{r.flag}</span>
        <span className="text-foreground">{r.country}</span>
      </span>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (r) => (
      <span className="rounded-md bg-card/80 px-2 py-0.5 text-xs text-foreground">{r.category}</span>
    ),
  },
  {
    key: "purchase",
    header: "Total Purchase",
    align: "right",
    render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.purchase)}</span>,
  },
  {
    key: "due",
    header: "Due",
    align: "right",
    render: (r) => (
      <span className={r.due > 0 ? "font-semibold text-rose-400" : "text-emerald-400"}>
        {r.due > 0 ? fmtBDT(r.due) : "—"}
      </span>
    ),
  },
  {
    key: "rating",
    header: "Rating",
    align: "center",
    render: (r) => (
      <span className="inline-flex items-center gap-1 text-xs">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="font-semibold text-foreground">{r.rating}</span>
      </span>
    ),
  },
  {
    key: "creditDays",
    header: "Credit",
    align: "center",
    render: (r) => <span className="text-xs text-muted-foreground">{r.creditDays}d</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge>,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => (
      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
];

export function VendorsDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors Dashboard"
        subtitle="Manage & monitor all buyers, suppliers and vendors in one place"
        icon={Users}
        iconColor="#8b5cf6"
        showSearch
        showFilters
        showExport
        showAdd
        addLabel="Add Vendor"
        actions={
          <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
            <Upload className="mr-1.5 h-4 w-4" />
            Import
          </Button>
        }
      />

      {/* Top KPI row — 8 cards in 2 rows of 4 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {vendorKPIs.map((kpi) => {
          const Icon = iconMap[kpi.icon] ?? Users;
          const display = kpi.isCurrency ? fmtBDT(kpi.value) : fmtNum(kpi.value);
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={display}
              delta={kpi.delta}
              trend={kpi.delta >= 0 ? "up" : "down"}
              icon={Icon}
              color={kpi.color}
              subtitle={kpi.subtitle}
            />
          );
        })}
      </div>

      {/* Charts row 1: Purchase by Category pie + Top 5 vendors bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Purchase by Category"
          subtitle="Distribution of procurement spend"
          icon={ShoppingCart}
          iconColor="#8b5cf6"
        >
          <div className="flex h-64 w-full items-center">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={purchaseByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="#0f1426"
                    strokeWidth={2}
                  >
                    {purchaseByCategory.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1426", border: "1px solid #28304a",
                      borderRadius: "8px", color: "#e2e8f0", fontSize: "12px",
                    }}
                    formatter={(v: any) => [`${v}%`, "Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-full w-1/2 space-y-2 overflow-y-auto pl-4">
              {purchaseByCategory.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                    <span className="truncate text-foreground">{c.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Top 5 Vendors by Purchase"
          subtitle="Highest procurement value this year"
          icon={Users}
          iconColor="#3b82f6"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topVendorsByPurchase}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b" fontSize={10} tickLine={false} axisLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f1426", border: "1px solid #28304a",
                    borderRadius: "8px", color: "#e2e8f0", fontSize: "12px",
                  }}
                  formatter={(v: any) => [fmtBDT(v), "Purchase"]}
                  cursor={{ fill: "#1c244050" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {topVendorsByPurchase.map((v) => (
                    <Cell key={v.name} fill={v.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2: Purchase vs Payment trend + Vendor Status donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Purchase vs Payment Trend"
          subtitle="Monthly procurement and payments"
          icon={Wallet}
          iconColor="#10b981"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Purchase
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Payment
              </span>
            </div>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={purchaseVsPayment} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f1426", border: "1px solid #28304a",
                    borderRadius: "8px", color: "#e2e8f0", fontSize: "12px",
                  }}
                  formatter={(v: any, n: any) => [fmtBDT(v), n === "purchase" ? "Purchase" : "Payment"]}
                />
                <Line
                  type="monotone" dataKey="purchase" stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone" dataKey="payment" stroke="#10b981" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Vendor Status"
          subtitle="Distribution by status"
          icon={AlertCircle}
          iconColor="#ec4899"
        >
          <div className="flex h-72 flex-col items-center justify-center">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendorStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    stroke="#0f1426"
                    strokeWidth={2}
                  >
                    {vendorStatus.map((v) => (
                      <Cell key={v.name} fill={v.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1426", border: "1px solid #28304a",
                      borderRadius: "8px", color: "#e2e8f0", fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">248</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Vendors</span>
              </div>
            </div>
            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              {vendorStatus.map((v) => (
                <div key={v.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v.color }} />
                  <span className="text-muted-foreground">{v.name}</span>
                  <span className="ml-auto font-semibold text-foreground">{v.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Vendor table */}
      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">All Vendors</h3>
            <p className="text-xs text-muted-foreground">{vendorTable.length} of 248 vendors shown</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
              <option>Blocked</option>
            </select>
            <select className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground">
              <option>All Categories</option>
              <option>Raw Materials</option>
              <option>Machinery</option>
              <option>Packaging</option>
            </select>
            <select className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground">
              <option>All Countries</option>
              <option>Bangladesh</option>
              <option>India</option>
              <option>USA</option>
            </select>
          </div>
        </div>
        <DataTable columns={vendorColumns} data={vendorTable} />

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing 1 to {vendorTable.length} of 248 entries
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 border-border bg-card">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {[1, 2, 3, 4, 5].map((p) => (
              <Button
                key={p}
                variant={p === 1 ? "default" : "outline"}
                size="icon"
                className={
                  p === 1
                    ? "h-8 w-8 bg-primary text-primary-foreground"
                    : "h-8 w-8 border-border bg-card text-foreground hover:bg-card/80"
                }
              >
                {p}
              </Button>
            ))}
            <span className="px-1 text-xs text-muted-foreground">…</span>
            <Button variant="outline" size="icon" className="h-8 w-8 border-border bg-card">
              25
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-border bg-card">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
