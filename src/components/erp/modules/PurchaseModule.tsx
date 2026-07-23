"use client";

import { useState } from "react";
import { Truck, FileText, PackageCheck, AlertCircle, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { usePurchaseOrders, useVendors, useProducts, useCreatePurchaseOrder, useDashboardStats } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Truck, FileText, PackageCheck, AlertCircle };

interface PO {
  id: string;
  poNumber: string;
  vendor: { name: string } | null;
  itemCount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  grnStatus: string;
  status: string;
  orderDate: string;
}

const columns: Column<PO>[] = [
  { key: "poNumber", header: "PO ID", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.poNumber}</span> },
  { key: "vendor", header: "Supplier", render: (r) => <span className="font-medium text-foreground">{r.vendor?.name || "—"}</span> },
  { key: "itemCount", header: "Items", align: "center", render: (r) => <span>{r.itemCount}</span> },
  { key: "totalAmount", header: "Total", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.totalAmount)}</span> },
  { key: "grnStatus", header: "GRN", render: (r) => <span className={`text-xs ${r.grnStatus === "PENDING" ? "text-amber-400" : "text-emerald-400"}`}>{r.grnStatus === "PENDING" ? "Pending" : r.grnStatus === "COMPLETED" ? "Completed" : "Partial"}</span> },
  { key: "dueAmount", header: "Due", align: "right", render: (r) => <span className={r.dueAmount > 0 ? "text-rose-400" : "text-emerald-400"}>{r.dueAmount > 0 ? fmtBDT(r.dueAmount) : "—"}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
  { key: "orderDate", header: "Date", align: "right", render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.orderDate).toISOString().slice(0, 10)}</span> },
];

export function PurchaseModule() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data, isLoading } = usePurchaseOrders();
  const { data: vendData } = useVendors();
  const { data: prodData } = useProducts();
  const { data: dashData } = useDashboardStats();
  const createPO = useCreatePurchaseOrder();

  const orders = (data?.orders || []) as PO[];
  const totalPurchase = orders.reduce((s, o) => s + o.totalAmount, 0);
  const pendingGRN = orders.filter((o) => o.grnStatus === "PENDING").length;
  const supplierDue = orders.reduce((s, o) => s + o.dueAmount, 0);

  const purchaseStats = [
    { label: "Total Purchase", value: fmtBDT(totalPurchase), delta: 12.4, icon: "Truck", color: "#3b82f6" },
    { label: "PO Count", value: orders.length.toLocaleString(), delta: 7.8, icon: "FileText", color: "#8b5cf6" },
    { label: "Pending GRN", value: pendingGRN.toLocaleString(), delta: 4.2, icon: "PackageCheck", color: "#f59e0b" },
    { label: "Supplier Due", value: fmtBDT(supplierDue), delta: -4.2, icon: "AlertCircle", color: "#ef4444" },
  ];

  // Real purchase vs payment trend from dashboard API
  const purchaseVsPayment = dashData?.purchaseTrend || [];

  const poFormFields: FormField[] = [
    {
      name: "vendorId",
      label: "Supplier",
      type: "select",
      required: true,
      options: (vendData?.vendors || []).map((v: any) => ({ value: v.id, label: `${v.code} — ${v.name}` })),
    },
    {
      name: "productId",
      label: "Product",
      type: "select",
      required: true,
      options: (prodData?.products || []).map((p: any) => ({ value: p.id, label: `${p.sku} — ${p.name} (cost: ${fmtBDT(p.costPrice)})` })),
    },
    { name: "quantity", label: "Quantity", type: "number", required: true, default: 1, min: 1 },
    { name: "unitPrice", label: "Unit Cost (৳)", type: "number", required: true, default: 0, min: 0 },
    { name: "notes", label: "PO Notes", type: "textarea" },
  ];

  const handleCreate = (values: any) => {
    createPO.mutate({
      vendorId: values.vendorId,
      notes: values.notes,
      items: [{ productId: values.productId, quantity: Number(values.quantity), unitPrice: Number(values.unitPrice) }],
    }, { onSuccess: () => setShowAddModal(false) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Management"
        subtitle="Purchase orders, GRN, approvals, supplier payments"
        icon={Truck}
        iconColor="#8b5cf6"
        showSearch
        showExport
        exportType="purchase-orders"
        showAdd
        addLabel="New Purchase Order"
        onAdd={() => setShowAddModal(true)}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {purchaseStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Truck;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} trend={s.delta >= 0 ? "up" : "down"} icon={Icon} color={s.color} />;
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
              <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => fmtBDT(v)} cursor={{ fill: "#1c244050" }} />
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
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${orders.length} purchase orders`}</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={orders} />
        )}
      </Card>

      <FormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="New Purchase Order"
        description="Create a new purchase order for a supplier"
        fields={poFormFields}
        onSubmit={handleCreate}
        loading={createPO.isPending}
        submitLabel="Create PO"
      />
    </div>
  );
}
