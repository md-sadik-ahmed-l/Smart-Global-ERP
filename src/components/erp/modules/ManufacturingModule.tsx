"use client";

import { useState } from "react";
import { Factory, Plus, Play, CheckCircle2, XCircle, ClipboardCheck, Activity, Package } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { useWorkOrders, useWorkOrderAction, useProducts, useBOMs } from "@/lib/erp/hooks";
import { motion } from "framer-motion";

const statusVariantMap: Record<string, "success" | "warning" | "info" | "danger" | "neutral" | "purple"> = {
  CREATED: "neutral",
  IN_PROGRESS: "info",
  QC: "purple",
  COMPLETED: "success",
  CANCELLED: "danger",
};

interface WorkOrder {
  id: string;
  woNumber: string;
  product: { name: string };
  branch: { name: string } | null;
  supervisor: { name: string; avatar: string } | null;
  plannedQty: number;
  producedQty: number;
  rejectedQty: number;
  status: string;
  priority: string;
  progressPct: number;
  rejectionRate: string;
  startDate: string | null;
  plannedEndDate: string | null;
  bom: { bomNumber: string; name: string } | null;
}

const columns: Column<WorkOrder>[] = [
  { key: "woNumber", header: "WO #", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.woNumber}</span> },
  { key: "product", header: "Product", render: (r) => <span className="text-sm font-medium text-foreground">{r.product?.name}</span> },
  { key: "plannedQty", header: "Planned", align: "right", render: (r) => <span className="font-semibold">{r.plannedQty}</span> },
  {
    key: "producedQty",
    header: "Produced",
    align: "right",
    render: (r) => (
      <div className="text-right">
        <span className="font-semibold text-emerald-400">{r.producedQty}</span>
        <span className="text-xs text-muted-foreground"> / {r.plannedQty}</span>
      </div>
    ),
  },
  {
    key: "progress",
    header: "Progress",
    align: "center",
    render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${r.progressPct}%` }} />
        </div>
        <span className="text-xs font-semibold text-foreground">{r.progressPct}%</span>
      </div>
    ),
  },
  { key: "rejectedQty", header: "Rejected", align: "right", render: (r) => <span className="text-rose-400">{r.rejectedQty}</span> },
  {
    key: "priority",
    header: "Priority",
    align: "center",
    render: (r) => (
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
        r.priority === "URGENT" ? "bg-rose-500/20 text-rose-400" :
        r.priority === "HIGH" ? "bg-amber-500/20 text-amber-400" :
        r.priority === "NORMAL" ? "bg-blue-500/20 text-blue-400" :
        "bg-slate-500/20 text-slate-400"
      }`}>{r.priority}</span>
    ),
  },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariantMap[r.status] || "neutral"} dot>{r.status.replace("_", " ")}</StatusBadge> },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (r) => (
      <div className="flex items-center justify-end gap-1">
        {r.status === "CREATED" && (
          <Button size="sm" variant="outline" className="h-7 border-border bg-card text-xs text-foreground hover:bg-card/80" onClick={() => useWorkOrderAction().mutate({ id: r.id, action: "release" })}>
            <Play className="mr-1 h-3 w-3" /> Release
          </Button>
        )}
        {r.status === "IN_PROGRESS" && (
          <Button size="sm" variant="outline" className="h-7 border-border bg-card text-xs text-foreground hover:bg-card/80" onClick={() => useWorkOrderAction().mutate({ id: r.id, action: "complete" })}>
            <CheckCircle2 className="mr-1 h-3 w-3" /> Complete
          </Button>
        )}
      </div>
    ),
  },
];

export function ManufacturingModule() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useWorkOrders(statusFilter || undefined);
  const { data: prodData } = useProducts();
  const { data: bomData } = useBOMs();
  const action = useWorkOrderAction();

  const workOrders = (data?.workOrders || []) as WorkOrder[];

  const stats = [
    { label: "Active Work Orders", value: workOrders.filter((w) => w.status === "IN_PROGRESS").length, delta: 8, icon: "Activity", color: "#3b82f6" },
    { label: "Completed (30d)", value: workOrders.filter((w) => w.status === "COMPLETED").length, delta: 12, icon: "CheckCircle2", color: "#10b981" },
    { label: "Total Planned Qty", value: workOrders.reduce((s, w) => s + w.plannedQty, 0).toLocaleString(), delta: 5, icon: "Package", color: "#f59e0b" },
    { label: "Total Produced", value: workOrders.reduce((s, w) => s + w.producedQty, 0).toLocaleString(), delta: 15, icon: "Factory", color: "#8b5cf6" },
  ];

  const iconMap: Record<string, any> = { Activity, CheckCircle2, Package, Factory };

  const woFormFields: FormField[] = [
    {
      name: "bomId",
      label: "BOM (optional — auto-fills components)",
      type: "select",
      options: (bomData?.boms || []).map((b: any) => ({ value: b.id, label: `${b.bomNumber} — ${b.name}` })),
    },
    {
      name: "productId",
      label: "Product to Manufacture",
      type: "select",
      required: true,
      options: (prodData?.products || []).filter((p: any) => p.productType === "FINISHED").map((p: any) => ({ value: p.id, label: `${p.sku} — ${p.name}` })),
    },
    { name: "plannedQty", label: "Planned Quantity", type: "number", required: true, default: 100, min: 1 },
    { name: "priority", label: "Priority", type: "select", default: "NORMAL", options: [
      { value: "LOW", label: "Low" },
      { value: "NORMAL", label: "Normal" },
      { value: "HIGH", label: "High" },
      { value: "URGENT", label: "Urgent" },
    ]},
    { name: "plannedEndDate", label: "Planned End Date", type: "date" },
    { name: "notes", label: "Production Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manufacturing Management"
        subtitle="BOM, Work Orders, Production Tracking & Quality Control"
        icon={Factory}
        iconColor="#f59e0b"
        showSearch
        showExport
        showAdd
        addLabel="New Work Order"
        onAdd={() => setShowCreateModal(true)}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = iconMap[s.icon] ?? Factory;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} icon={Icon} color={s.color} index={i} />;
        })}
      </div>

      {/* Active work orders with progress rings */}
      {workOrders.filter((w) => w.status === "IN_PROGRESS").length > 0 && (
        <ChartCard title="Active Production — Real-time Progress" subtitle="Work orders currently in production" icon={Activity} iconColor="#3b82f6">
          <div className="grid grid-cols-2 gap-4 py-2 md:grid-cols-4">
            {workOrders.filter((w) => w.status === "IN_PROGRESS").slice(0, 4).map((wo, i) => (
              <motion.div
                key={wo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 text-center"
              >
                <div className="relative mx-auto h-20 w-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: wo.progressPct, fill: "#6366f1" }]} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: "#1c2440" }} dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-400">{wo.progressPct}%</span>
                  </div>
                </div>
                <p className="mt-2 truncate text-xs font-semibold text-foreground">{wo.woNumber}</p>
                <p className="truncate text-[10px] text-muted-foreground">{wo.product?.name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{wo.producedQty} / {wo.plannedQty} units</p>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Production output chart */}
      <ChartCard
        title="Production Output vs Rejection"
        subtitle="Per work order comparison"
        icon={Factory}
        iconColor="#8b5cf6"
      >
        <div className="h-72 w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workOrders.slice(0, 8)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="woNumber" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} cursor={{ fill: "#1c244050" }} />
                <Bar dataKey="producedQty" name="Produced" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="rejectedQty" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      {/* Work Orders Table */}
      <Card className="glass p-5 rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Work Orders</h3>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${workOrders.length} work orders`}</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
          >
            <option value="">All Status</option>
            <option value="CREATED">Created</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="QC">QC</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={workOrders} />
        )}
      </Card>

      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="New Work Order"
        description="Create a manufacturing work order"
        fields={woFormFields}
        onSubmit={(values) => action.mutate({ ...values, action: "create" }, { onSuccess: () => setShowCreateModal(false) })}
        loading={action.isPending}
        submitLabel="Create Work Order"
      />
    </div>
  );
}
