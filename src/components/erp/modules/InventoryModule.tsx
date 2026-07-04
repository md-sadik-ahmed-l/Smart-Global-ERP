"use client";

import { Boxes, Wallet, AlertTriangle, XCircle, Plus, Download, Warehouse, ArrowRightLeft } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { inventoryStats, warehouseStock, inventoryTable, fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Boxes, Wallet, AlertTriangle, XCircle };

interface Item {
  id: string; name: string; sku: string; category: string; warehouse: string; stock: number; reorder: number; unit: string; value: number; status: string;
}

const columns: Column<Item>[] = [
  { key: "id", header: "ID", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.id}</span> },
  {
    key: "name",
    header: "Product",
    render: (r) => (
      <div>
        <p className="text-sm font-medium text-foreground">{r.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{r.sku}</p>
      </div>
    ),
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
        actions={
          <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
            <ArrowRightLeft className="mr-1.5 h-4 w-4" /> Transfer
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {inventoryStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Boxes;
          const display = s.isCurrency ? fmtBDT(s.value) : s.value.toLocaleString();
          return <StatCard key={s.label} label={s.label} value={display} delta={s.delta} trend={s.delta >= 0 ? "up" : "down"} icon={Icon} color={s.color} />;
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Warehouse Capacity"
          subtitle="Stock value & capacity utilization"
          icon={Warehouse}
          iconColor="#3b82f6"
        >
          <div className="space-y-4 py-2">
            {warehouseStock.map((w) => (
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

        <ChartCard
          title="Stock Value by Warehouse"
          subtitle="Distribution"
          icon={Boxes}
          iconColor="#8b5cf6"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseStock} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="warehouse" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                  formatter={(v: any) => fmtBDT(v)}
                  cursor={{ fill: "#1c244050" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {warehouseStock.map((w) => <Cell key={w.warehouse} fill={w.color} />)}
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
            <p className="text-xs text-muted-foreground">{inventoryTable.length} items across all warehouses</p>
          </div>
        </div>
        <DataTable columns={columns} data={inventoryTable} />
      </Card>
    </div>
  );
}
