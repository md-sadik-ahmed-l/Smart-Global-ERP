"use client";

import { Truck, FileText, PackageCheck, AlertCircle, Plus, Download } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { purchaseStats, purchaseVsPayment, purchaseOrdersTable, fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Truck, FileText, PackageCheck, AlertCircle };

interface PO {
  id: string; supplier: string; items: number; total: number; status: string; date: string; grn: string; due: number;
}

const columns: Column<PO>[] = [
  { key: "id", header: "PO ID", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.id}</span> },
  { key: "supplier", header: "Supplier", render: (r) => <span className="font-medium text-foreground">{r.supplier}</span> },
  { key: "items", header: "Items", align: "center", render: (r) => <span>{r.items}</span> },
  { key: "total", header: "Total", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.total)}</span> },
  { key: "grn", header: "GRN", render: (r) => <span className={`text-xs ${r.grn === "Pending" ? "text-amber-400" : "text-emerald-400"}`}>{r.grn}</span> },
  { key: "due", header: "Due", align: "right", render: (r) => <span className={r.due > 0 ? "text-rose-400" : "text-emerald-400"}>{r.due > 0 ? fmtBDT(r.due) : "—"}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
  { key: "date", header: "Date", align: "right", render: (r) => <span className="text-xs text-muted-foreground">{r.date}</span> },
];

export function PurchaseModule() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Management"
        subtitle="Purchase orders, GRN, approvals, supplier payments"
        icon={Truck}
        iconColor="#8b5cf6"
        showSearch
        showExport
        showAdd
        addLabel="New Purchase Order"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {purchaseStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Truck;
          const display = s.isCurrency ? fmtBDT(s.value) : s.value.toLocaleString();
          return <StatCard key={s.label} label={s.label} value={display} delta={s.delta} trend={s.delta >= 0 ? "up" : "down"} icon={Icon} color={s.color} />;
        })}
      </div>

      <ChartCard
        title="Purchase vs Payment Trend"
        subtitle="Monthly procurement and payments to suppliers"
        icon={Truck}
        iconColor="#3b82f6"
        action={
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-blue-500" /> Purchase</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Payment</span>
          </div>
        }
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseVsPayment} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                formatter={(v: any) => fmtBDT(v)}
                cursor={{ fill: "#1c244050" }}
              />
              <Bar dataKey="purchase" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="payment" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Purchase Orders</h3>
            <p className="text-xs text-muted-foreground">{purchaseOrdersTable.length} purchase orders</p>
          </div>
        </div>
        <DataTable columns={columns} data={purchaseOrdersTable} />
      </Card>
    </div>
  );
}
