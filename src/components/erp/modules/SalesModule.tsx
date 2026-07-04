"use client";

import { ShoppingCart, Package, TrendingUp, AlertCircle, Plus, Download, FileText, CreditCard } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { salesStats, salesTrend, ordersTable, fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { ShoppingCart, Package, TrendingUp, AlertCircle };

interface Order {
  id: string; customer: string; items: number; total: number; status: string; date: string; payment: string; due: number;
}

const columns: Column<Order>[] = [
  { key: "id", header: "Order ID", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.id}</span> },
  { key: "customer", header: "Customer", render: (r) => <span className="font-medium text-foreground">{r.customer}</span> },
  { key: "items", header: "Items", align: "center", render: (r) => <span>{r.items}</span> },
  { key: "total", header: "Total", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.total)}</span> },
  { key: "payment", header: "Payment", render: (r) => <span className="text-xs text-muted-foreground">{r.payment}</span> },
  { key: "due", header: "Due", align: "right", render: (r) => <span className={r.due > 0 ? "text-rose-400" : "text-emerald-400"}>{r.due > 0 ? fmtBDT(r.due) : "—"}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
  { key: "date", header: "Date", align: "right", render: (r) => <span className="text-xs text-muted-foreground">{r.date}</span> },
];

export function SalesModule() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Management"
        subtitle="Sales orders, quotations, invoices, returns & due collection"
        icon={ShoppingCart}
        iconColor="#3b82f6"
        showSearch
        showExport
        showAdd
        addLabel="New Sales Order"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {salesStats.map((s) => {
          const Icon = iconMap[s.icon] ?? ShoppingCart;
          const display = s.isCurrency ? fmtBDT(s.value) : s.value.toLocaleString();
          return <StatCard key={s.label} label={s.label} value={display} delta={s.delta} trend={s.delta >= 0 ? "up" : "down"} icon={Icon} color={s.color} />;
        })}
      </div>

      <ChartCard
        title="Sales Trend — Online vs Offline"
        subtitle="Monthly sales channel comparison"
        icon={TrendingUp}
        iconColor="#8b5cf6"
        action={
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-blue-500" /> Online</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Offline</span>
          </div>
        }
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="offlineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                formatter={(v: any) => fmtBDT(v)}
              />
              <Area type="monotone" dataKey="online" stroke="#3b82f6" strokeWidth={2.5} fill="url(#onlineGrad)" />
              <Area type="monotone" dataKey="offline" stroke="#10b981" strokeWidth={2.5} fill="url(#offlineGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
            <p className="text-xs text-muted-foreground">{ordersTable.length} recent orders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 border-border bg-card text-foreground hover:bg-card/80">
              <FileText className="mr-1.5 h-3.5 w-3.5" /> Quotations
            </Button>
            <Button variant="outline" size="sm" className="h-8 border-border bg-card text-foreground hover:bg-card/80">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Invoices
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={ordersTable} />
      </Card>
    </div>
  );
}
