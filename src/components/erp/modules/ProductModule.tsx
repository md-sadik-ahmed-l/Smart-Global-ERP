"use client";

import { useState } from "react";
import { Package, FolderTree, Tag, AlertTriangle, Plus, Download, Upload, Barcode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { useProducts, useCategories, useCreateProduct } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Package, FolderTree, Tag, AlertTriangle };

interface Product {
  id: string;
  sku: string;
  name: string;
  category: { name: string } | null;
  brand: { name: string } | null;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  stockStatus: string;
  status: string;
}

const columns: Column<Product>[] = [
  { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.sku}</span> },
  { key: "name", header: "Product", render: (r) => <span className="text-sm font-medium text-foreground">{r.name}</span> },
  { key: "category", header: "Category", render: (r) => <span className="rounded-md bg-card px-2 py-0.5 text-xs text-foreground">{r.category?.name || "—"}</span> },
  { key: "brand", header: "Brand", render: (r) => <span className="text-xs text-muted-foreground">{r.brand?.name || "—"}</span> },
  { key: "salePrice", header: "Price", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.salePrice)}</span> },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    render: (r) => (
      <span className={`font-semibold ${r.stock === 0 ? "text-rose-400" : r.stockStatus === "Low Stock" ? "text-amber-400" : "text-foreground"}`}>
        {r.stock.toLocaleString()} {r.unit}
      </span>
    ),
  },
  { key: "stockStatus", header: "Stock Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.stockStatus)} dot>{r.stockStatus}</StatusBadge> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={r.status === "ACTIVE" ? "success" : "neutral"} dot>{r.status}</StatusBadge> },
];

export function ProductModule() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data, isLoading } = useProducts();
  const { data: catData } = useCategories();
  const createProduct = useCreateProduct();

  const products = (data?.products || []) as Product[];
  const totalProducts = products.length;
  const totalCategories = catData?.categories?.length || 0;
  const totalBrands = catData?.brands?.length || 0;
  const lowStock = products.filter((p) => p.stockStatus === "Low Stock").length;

  const productStats = [
    { label: "Total Products", value: totalProducts.toLocaleString(), delta: 6.8, icon: "Package", color: "#3b82f6" },
    { label: "Categories", value: totalCategories.toLocaleString(), delta: 2.0, icon: "FolderTree", color: "#8b5cf6" },
    { label: "Brands", value: totalBrands.toLocaleString(), delta: 4.0, icon: "Tag", color: "#10b981" },
    { label: "Low Stock Items", value: lowStock.toLocaleString(), delta: 12.0, icon: "AlertTriangle", color: "#f59e0b" },
  ];

  const productFormFields: FormField[] = [
    { name: "sku", label: "SKU", type: "text", placeholder: "e.g. FAB-CTN-001", required: true },
    { name: "name", label: "Product Name", type: "text", placeholder: "e.g. Cotton Fabric Roll", required: true },
    {
      name: "categoryId",
      label: "Category",
      type: "select",
      options: (catData?.categories || []).map((c: any) => ({ value: c.id, label: c.name })),
    },
    {
      name: "brandId",
      label: "Brand",
      type: "select",
      options: (catData?.brands || []).map((b: any) => ({ value: b.id, label: b.name })),
    },
    { name: "unit", label: "Unit", type: "select", default: "pcs", options: [
      { value: "pcs", label: "Pieces" },
      { value: "kg", label: "Kilogram" },
      { value: "meter", label: "Meter" },
      { value: "liter", label: "Liter" },
      { value: "box", label: "Box" },
    ]},
    { name: "costPrice", label: "Cost Price (৳)", type: "number", default: 0, min: 0, required: true },
    { name: "salePrice", label: "Sale Price (৳)", type: "number", default: 0, min: 0, required: true },
    { name: "reorderLevel", label: "Reorder Level", type: "number", default: 10, min: 0 },
    { name: "barcode", label: "Barcode", type: "text", placeholder: "Optional" },
    { name: "description", label: "Description", type: "textarea" },
  ];

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
        onAdd={() => setShowAddModal(true)}
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
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} icon={Icon} color={s.color} />;
        })}
      </div>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Product List</h3>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${products.length} products`}</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={products} />
        )}
      </Card>

      <FormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Product"
        description="Create a new product in the catalog"
        fields={productFormFields}
        onSubmit={(values) => createProduct.mutate(values, { onSuccess: () => setShowAddModal(false) })}
        loading={createProduct.isPending}
        submitLabel="Create Product"
      />
    </div>
  );
}
