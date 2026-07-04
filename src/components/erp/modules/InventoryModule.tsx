"use client";

import { useState } from "react";
import { Boxes, Wallet, AlertTriangle, XCircle, Plus, Download, Warehouse, ArrowRightLeft } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { useInventory, useProducts, useBranches, useStockAdjustment } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Boxes, Wallet, AlertTriangle, XCircle };

interface Item {
  id: string;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  stock: number;
  reorder: number;
  unit: string;
  value: number;
  status: string;
}

const columns: Column<Item>[] = [
  { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.sku}</span> },
  {
    key: "name",
    header: "Product",
    render: (r) => <span className="text-sm font-medium text-foreground">{r.name}</span>,
  },
  { key: "category", header: "Category", render: (r) => <span className="rounded-md bg-card px-2 py-0.5 text-xs text-foreground">{r.category}</span> },
  { key: "warehouse", header: "Warehouse", render: (r) => <span className="text-xs text-muted-foreground">{r.warehouse}</span> },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    render: (r) => (
      <div className="text-right">
        <p className={`font-semibold ${r.stock === 0 ? "text-rose-400" : r.stock < r.reorder ? "text-amber-400" : "text-foreground"}`}>
          {r.stock.toLocaleString()} {r.unit}
        </p>
        <p className="text-[10px] text-muted-foreground">Reorder: {r.reorder}</p>
      </div>
    ),
  },
  { key: "value", header: "Value", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.value)}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
];

export function InventoryModule() {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const { data, isLoading } = useInventory();
  const { data: prodData } = useProducts();
  const { data: branchData } = useBranches();
  const adjustStock = useStockAdjustment();

  const items = (data?.inventory || []) as Item[];
  const totalProducts = items.length;
  const stockValue = items.reduce((s, i) => s + i.value, 0);
  const lowStock = items.filter((i) => i.status === "Low Stock").length;
  const outOfStock = items.filter((i) => i.status === "Out of Stock").length;

  const inventoryStats = [
    { label: "Total Products", value: totalProducts.toLocaleString(), delta: 6.8, icon: "Boxes", color: "#3b82f6" },
    { label: "Stock Value", value: fmtBDT(stockValue), delta: 4.2, icon: "Wallet", color: "#10b981" },
    { label: "Low Stock", value: lowStock.toLocaleString(), delta: 12.0, icon: "AlertTriangle", color: "#f59e0b" },
    { label: "Out of Stock", value: outOfStock.toLocaleString(), delta: -3.0, icon: "XCircle", color: "#ef4444" },
  ];

  // Warehouse capacity (synthetic visualization based on real warehouses)
  const warehouses = (branchData?.branches || []).flatMap((b: any) =>
    b.warehouses.map((w: any) => ({
      warehouse: w.name,
      products: items.filter((i) => i.warehouse === w.name).length || Math.floor(Math.random() * 100) + 20,
      value: items.filter((i) => i.warehouse === w.name).reduce((s, i) => s + i.value, 0) || Math.floor(Math.random() * 2000000),
      capacity: Math.floor(Math.random() * 40) + 40,
      color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][Math.floor(Math.random() * 4)],
    }))
  ).slice(0, 4);

  const adjustFormFields: FormField[] = [
    {
      name: "productId",
      label: "Product",
      type: "select",
      required: true,
      options: (prodData?.products || []).map((p: any) => ({ value: p.id, label: `${p.sku} — ${p.name}` })),
    },
    {
      name: "warehouseId",
      label: "Warehouse",
      type: "select",
      required: true,
      options: (branchData?.branches || []).flatMap((b: any) =>
        b.warehouses.map((w: any) => ({ value: w.id, label: w.name }))
      ),
    },
    {
      name: "adjustmentType",
      label: "Adjustment Type",
      type: "select",
      required: true,
      default: "IN",
      options: [
        { value: "IN", label: "Stock In (Add)" },
        { value: "OUT", label: "Stock Out (Remove)" },
        { value: "DAMAGE", label: "Damaged" },
        { value: "RETURN", label: "Return" },
      ],
    },
    { name: "quantity", label: "Quantity", type: "number", required: true, default: 1, min: 1 },
    { name: "reason", label: "Reason", type: "textarea", placeholder: "Reason for adjustment..." },
  ];

  const handleAdjust = (values: any) => {
    adjustStock.mutate({
      productId: values.productId,
      warehouseId: values.warehouseId,
      adjustmentType: values.adjustmentType,
      quantity: Number(values.quantity),
      reason: values.reason,
    }, { onSuccess: () => setShowAdjustModal(false) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Warehouse"
        subtitle="Multi-warehouse stock, transfers, adjustments & batch tracking"
        icon={Warehouse}
        iconColor="#10b981"
        showSearch
        showExport
        showAdd
        addLabel="Stock Adjustment"
        onAdd={() => setShowAdjustModal(true)}
        actions={
          <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
            <ArrowRightLeft className="mr-1.5 h-4 w-4" /> Transfer
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {inventoryStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Boxes;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} trend={s.delta >= 0 ? "up" : "down"} icon={Icon} color={s.color} />;
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Warehouse Capacity" subtitle="Stock value & capacity utilization" icon={Warehouse} iconColor="#3b82f6">
          <div className="space-y-4 py-2">
            {warehouses.map((w) => (
              <div key={w.warehouse}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-foreground">{w.warehouse}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{w.products} products</span>
                  </div>
                  <span className="font-semibold text-foreground">{fmtBDT(w.value)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-all" style={{ width: `${w.capacity}%`, backgroundColor: w.color }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold" style={{ color: w.color }}>{w.capacity}%</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Stock Value by Warehouse" subtitle="Distribution" icon={Boxes} iconColor="#8b5cf6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouses} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="warehouse" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => fmtBDT(v)} cursor={{ fill: "#1c244050" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {warehouses.map((w) => <Cell key={w.warehouse} fill={w.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Stock List</h3>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${items.length} items across all warehouses`}</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={items} />
        )}
      </Card>

      <FormModal
        open={showAdjustModal}
        onOpenChange={setShowAdjustModal}
        title="Stock Adjustment"
        description="Adjust stock levels for a product in a warehouse"
        fields={adjustFormFields}
        onSubmit={handleAdjust}
        loading={adjustStock.isPending}
        submitLabel="Apply Adjustment"
      />
    </div>
  );
}
