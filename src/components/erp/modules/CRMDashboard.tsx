"use client";

import { Users, Target, Handshake, TrendingUp, Plus, Mail, Phone, MoreHorizontal } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { crmStats, salesPipeline, customerTable, fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Users, Target, Handshake, TrendingUp };

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: string;
  orders: number;
  value: number;
  status: string;
  lastOrder: string;
}

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-400">
          {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{r.name}</p>
          <p className="text-[11px] text-muted-foreground">{r.email}</p>
        </div>
      </div>
    ),
  },
  { key: "phone", header: "Phone", render: (r) => <span className="text-xs text-muted-foreground">{r.phone}</span> },
  {
    key: "segment",
    header: "Segment",
    render: (r) => (
      <span className="rounded-md bg-card px-2 py-0.5 text-xs text-foreground">{r.segment}</span>
    ),
  },
  { key: "orders", header: "Orders", align: "center", render: (r) => <span className="font-semibold">{r.orders}</span> },
  { key: "value", header: "Lifetime Value", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.value)}</span> },
  { key: "lastOrder", header: "Last Order", align: "right", render: (r) => <span className="text-xs text-muted-foreground">{r.lastOrder}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
  { key: "actions", header: "", align: "right", render: () => <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button> },
];

export function CRMDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Dashboard"
        subtitle="Customer Relationship Management — Leads, opportunities & pipeline"
        icon={Users}
        iconColor="#3b82f6"
        showSearch
        showExport
        showAdd
        addLabel="New Lead"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {crmStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Users;
          const display = s.isPercent ? `${s.value}%` : s.value.toLocaleString();
          return (
            <StatCard key={s.label} label={s.label} value={display} delta={s.delta} icon={Icon} color={s.color} />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Sales Pipeline"
          subtitle="Deals by stage"
          icon={Target}
          iconColor="#8b5cf6"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesPipeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                  formatter={(v: any, n: any) => [n === "count" ? `${v} deals` : fmtBDT(v), n === "count" ? "Deals" : "Value"]}
                  cursor={{ fill: "#1c244050" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {salesPipeline.map((s) => <Cell key={s.stage} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card className="border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Pipeline Value</h3>
          <div className="space-y-3">
            {salesPipeline.map((s) => {
              const total = salesPipeline.reduce((sum, x) => sum + x.value, 0);
              const pct = (s.value / total) * 100;
              return (
                <div key={s.stage}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{s.stage}</span>
                    <span className="font-semibold text-foreground">{fmtBDT(s.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{s.count} deals · {pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Customer Database</h3>
            <p className="text-xs text-muted-foreground">{customerTable.length} customers shown</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 border-border bg-card text-foreground hover:bg-card/80">
              <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
            </Button>
            <Button variant="outline" size="sm" className="h-8 border-border bg-card text-foreground hover:bg-card/80">
              <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={customerTable} />
      </Card>
    </div>
  );
}
