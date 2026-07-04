"use client";

import { Package, FolderTree, Tag, AlertTriangle, Plus, Download, Upload, Barcode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { productStats, productTable, fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Package, FolderTree, Tag, AlertTriangle };

interface Product {
  id: string; name: string; sku: string; category: string; brand: string; price: number; stock: number; status: string;
}

const columns: Column<Product>[] = [
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
  { key: "brand", header: "Brand", render: (r) => <span className="text-xs text-muted-foreground">{r.brand}</span> },
  { key: "price", header: "Price", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.price)}</span> },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    render: (r) => (
      <span className={r.stock === 0 ? "font-semibold text-rose-400" : "font-semibold text-foreground"}>
        {r.stock.toLocaleString()}
      </span>
    ),
  },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
];

export function ProductModule() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Management"
        subtitle="Catalog, categories, brands, variants, SKUs & barcodes"
        icon={Package}
        iconColor="#3b82f6"
        showSearch
        showExport
        showAdd
        addLabel="New Product"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <Barcode className="mr-1.5 h-4 w-4" /> Generate Barcode
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <Upload className="mr-1.5 h-4 w-4" /> Import
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {productStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Package;
          return <StatCard key={s.label} label={s.label} value={s.value.toLocaleString()} delta={s.delta} icon={Icon} color={s.color} />;
        })}
      </div>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Product List</h3>
            <p className="text-xs text-muted-foreground">{productTable.length} products shown</p>
          </div>
        </div>
        <DataTable columns={columns} data={productTable} />
      </Card>
    </div>
  );
}
