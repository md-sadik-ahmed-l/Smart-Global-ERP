"use client";

import { useState } from "react";
import {
  Users, ShoppingBag, ShoppingCart, Wallet, AlertCircle, CalendarClock,
  FileSignature, UserX, Plus, Download, Upload, Star, MoreHorizontal,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { useVendors, useCreateVendor } from "@/lib/erp/hooks";
import { fmtBDT, fmtNum } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = {
  Users, ShoppingBag, ShoppingCart, Wallet, AlertCircle, CalendarClock,
  FileSignature, UserX,
};

const flagMap: Record<string, string> = {
  "Bangladesh": "🇧🇩", "India": "🇮🇳", "USA": "🇺🇸", "UAE": "🇦🇪", "UK": "🇬🇧",
};

interface Vendor {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  flag?: string;
  category: string | null;
  purchase: number;
  payment: number;
  due: number;
  poCount: number;
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
          <p className="truncate text-[11px] text-muted-foreground">{r.contactPerson || "—"} · {r.email || "—"}</p>
        </div>
      </div>
    ),
  },
  {
    key: "country",
    header: "Country",
    render: (r) => (
      <span className="flex items-center gap-1.5 text-sm">
        <span className="text-base">{flagMap[r.country] || "🌍"}</span>
        <span className="text-foreground">{r.country}</span>
      </span>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (r) => (
      <span className="rounded-md bg-card/80 px-2 py-0.5 text-xs text-foreground">{r.category || "—"}</span>
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
        <span className="font-semibold text-foreground">{r.rating.toFixed(1)}</span>
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

const vendorFormFields: FormField[] = [
  { name: "name", label: "Vendor Name", type: "text", placeholder: "e.g. Asian Textiles Ltd", required: true },
  { name: "contactPerson", label: "Contact Person", type: "text", placeholder: "Full name" },
  { name: "email", label: "Email", type: "email", placeholder: "vendor@company.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+8801XXXXXXXXX" },
  { name: "country", label: "Country", type: "select", default: "Bangladesh", options: [
    { value: "Bangladesh", label: "🇧🇩 Bangladesh" },
    { value: "India", label: "🇮🇳 India" },
    { value: "USA", label: "🇺🇸 USA" },
    { value: "UAE", label: "🇦🇪 UAE" },
    { value: "UK", label: "🇬🇧 UK" },
  ]},
  { name: "category", label: "Category", type: "select", options: [
    { value: "Raw Materials", label: "Raw Materials" },
    { value: "Machinery", label: "Machinery" },
    { value: "Packaging", label: "Packaging" },
    { value: "Office Supply", label: "Office Supply" },
    { value: "Logistics", label: "Logistics" },
  ]},
  { name: "creditDays", label: "Credit Days", type: "number", default: 30, min: 0 },
  { name: "creditLimit", label: "Credit Limit (৳)", type: "number", default: 0, min: 0 },
  { name: "rating", label: "Rating (0-5)", type: "number", default: 4.0, min: 0, step: 0.1 },
  { name: "status", label: "Status", type: "select", default: "ACTIVE", options: [
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING", label: "Pending" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "BLOCKED", label: "Blocked" },
  ]},
  { name: "address", label: "Address", type: "textarea", placeholder: "Full address" },
];

export function VendorsDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ status: "", category: "", country: "" });
  const { data, isLoading } = useVendors(filters);
  const createVendor = useCreateVendor();

  const vendors = (data?.vendors || []) as Vendor[];

  // Aggregate KPIs from real data
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === "ACTIVE").length;
  const totalPurchase = vendors.reduce((s, v) => s + v.purchase, 0);
  const totalPayment = vendors.reduce((s, v) => s + v.payment, 0);
  const totalDue = vendors.reduce((s, v) => s + v.due, 0);
  const avgCreditDays = totalVendors > 0 ? Math.round(vendors.reduce((s, v) => s + v.creditDays, 0) / totalVendors) : 0;
  const pendingVendors = vendors.filter((v) => v.status === "PENDING").length;
  const blockedVendors = vendors.filter((v) => v.status === "BLOCKED").length;

  const vendorKPIs = [
    { label: "Total Vendors", value: fmtNum(totalVendors), delta: 5.2, icon: "Users", color: "#8b5cf6", subtitle: `${activeVendors} active` },
    { label: "Total Purchase", value: fmtBDT(totalPurchase), delta: 12.4, icon: "ShoppingCart", color: "#3b82f6", subtitle: "this year" },
    { label: "Total Payment", value: fmtBDT(totalPayment), delta: 9.8, icon: "Wallet", color: "#f59e0b", subtitle: `${totalPurchase > 0 ? ((totalPayment / totalPurchase) * 100).toFixed(1) : 0}% paid` },
    { label: "Total Due", value: fmtBDT(totalDue), delta: -4.2, icon: "AlertCircle", color: "#ef4444", subtitle: `${totalPurchase > 0 ? ((totalDue / totalPurchase) * 100).toFixed(1) : 0}% due` },
    { label: "Avg Credit Days", value: `${avgCreditDays}d`, delta: 2.0, icon: "CalendarClock", color: "#14b8a6", subtitle: "terms" },
    { label: "Pending Approval", value: fmtNum(pendingVendors), delta: 6.4, icon: "FileSignature", color: "#06b6d4", subtitle: "awaiting review" },
    { label: "Active Contracts", value: fmtNum(vendors.length), delta: 4.0, icon: "FileSignature", color: "#10b981", subtitle: `${pendingVendors} pending` },
    { label: "Blocked Vendors", value: fmtNum(blockedVendors), delta: -1, icon: "UserX", color: "#ec4899", subtitle: `${blockedVendors} blocked` },
  ];

  // Charts data derived from vendors
  const categoryMap: Record<string, number> = {};
  vendors.forEach((v) => {
    const cat = v.category || "Others";
    categoryMap[cat] = (categoryMap[cat] || 0) + v.purchase;
  });
  const totalCatPurchase = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const purchaseByCategory = Object.entries(categoryMap).map(([name, value], i) => ({
    name,
    value: totalCatPurchase > 0 ? Math.round((value / totalCatPurchase) * 100) : 0,
    color: ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#14b8a6"][i % 6],
  }));

  const topVendors = [...vendors].sort((a, b) => b.purchase - a.purchase).slice(0, 5).map((v, i) => ({
    name: v.name,
    value: v.purchase,
    color: ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"][i],
  }));

  const vendorStatusData = (["ACTIVE", "PENDING", "INACTIVE", "BLOCKED"] as const).map((s, i) => ({
    name: s.charAt(0) + s.slice(1).toLowerCase(),
    value: vendors.filter((v) => v.status === s).length,
    color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][i],
  }));

  // Synthetic purchase vs payment trend (from vendor data — would be monthly in real life)
  const purchaseVsPayment = [
    { month: "Jan", purchase: 720000, payment: 680000 },
    { month: "Feb", purchase: 810000, payment: 740000 },
    { month: "Mar", purchase: 880000, payment: 820000 },
    { month: "Apr", purchase: 760000, payment: 800000 },
    { month: "May", purchase: 920000, payment: 860000 },
    { month: "Jun", purchase: 1040000, payment: 940000 },
    { month: "Jul", purchase: 980000, payment: 920000 },
    { month: "Aug", purchase: 1120000, payment: 1020000 },
    { month: "Sep", purchase: 1180000, payment: 1080000 },
    { month: "Oct", purchase: 1240000, payment: 1140000 },
    { month: "Nov", purchase: 1320000, payment: 1220000 },
    { month: "Dec", purchase: 1380000, payment: 1280000 },
  ];

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
        exportType="vendors"
        showAdd
        addLabel="Add Vendor"
        onAdd={() => setShowAddModal(true)}
        actions={
          <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
            <Upload className="mr-1.5 h-4 w-4" />
            Import
          </Button>
        }
      />

      {/* Top KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {vendorKPIs.map((kpi) => {
          const Icon = iconMap[kpi.icon] ?? Users;
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              trend={kpi.delta >= 0 ? "up" : "down"}
              icon={Icon}
              color={kpi.color}
              subtitle={kpi.subtitle}
            />
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Purchase by Category" subtitle="Distribution of procurement spend" icon={ShoppingCart} iconColor="#8b5cf6">
          <div className="flex h-64 w-full items-center">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={purchaseByCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={2} stroke="#0f1426" strokeWidth={2}>
                    {purchaseByCategory.map((c) => <Cell key={c.name} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => [`${v}%`, "Share"]} />
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

        <ChartCard title="Top 5 Vendors by Purchase" subtitle="Highest procurement value this year" icon={Users} iconColor="#3b82f6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendors} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => [fmtBDT(v), "Purchase"]} cursor={{ fill: "#1c244050" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {topVendors.map((v) => <Cell key={v.name} fill={v.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Purchase vs Payment Trend"
          subtitle="Monthly procurement and payments"
          icon={Wallet}
          iconColor="#10b981"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-blue-500" /> Purchase</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Payment</span>
            </div>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={purchaseVsPayment} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any, n: any) => [fmtBDT(v), n === "purchase" ? "Purchase" : "Payment"]} />
                <Line type="monotone" dataKey="purchase" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="payment" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Vendor Status" subtitle="Distribution by status" icon={AlertCircle} iconColor="#ec4899">
          <div className="flex h-72 flex-col items-center justify-center">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vendorStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={75} paddingAngle={3} stroke="#0f1426" strokeWidth={2}>
                    {vendorStatusData.map((v) => <Cell key={v.name} fill={v.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{totalVendors}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Vendors</span>
              </div>
            </div>
            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              {vendorStatusData.map((v) => (
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
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${vendors.length} vendors`}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <select
              value={filters.country}
              onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
              className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
            >
              <option value="">All Countries</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UAE">UAE</option>
              <option value="UK">UK</option>
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : (
          <>
            <DataTable columns={vendorColumns} data={vendors} />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing 1 to {vendors.length} of {vendors.length} entries
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 border-border bg-card" disabled>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" className="h-8 w-8 bg-primary text-primary-foreground">1</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 border-border bg-card" disabled>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <FormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Vendor"
        description="Create a new vendor/buyer/supplier record"
        fields={vendorFormFields}
        onSubmit={(values) => createVendor.mutate(values)}
        loading={createVendor.isPending}
        submitLabel="Create Vendor"
      />
    </div>
  );
}
