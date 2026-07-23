"use client";

import { useState } from "react";
import { ShoppingCart, Package, TrendingUp, AlertCircle, Plus, Download, FileText, CreditCard } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { useSalesOrders, useCustomers, useProducts, useCreateSalesOrder } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { ShoppingCart, Package, TrendingUp, AlertCircle };

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string } | null;
  itemCount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string | null;
  status: string;
  orderDate: string;
}

const columns: Column<Order>[] = [
  { key: "orderNumber", header: "Order ID", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.orderNumber}</span> },
  { key: "customer", header: "Customer", render: (r) => <span className="font-medium text-foreground">{r.customer?.name || "—"}</span> },
  { key: "itemCount", header: "Items", align: "center", render: (r) => <span>{r.itemCount}</span> },
  { key: "totalAmount", header: "Total", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.totalAmount)}</span> },
  { key: "paymentMethod", header: "Payment", render: (r) => <span className="text-xs text-muted-foreground">{r.paymentMethod || "—"}</span> },
  { key: "dueAmount", header: "Due", align: "right", render: (r) => <span className={r.dueAmount > 0 ? "text-rose-400" : "text-emerald-400"}>{r.dueAmount > 0 ? fmtBDT(r.dueAmount) : "—"}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
  { key: "orderDate", header: "Date", align: "right", render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.orderDate).toISOString().slice(0, 10)}</span> },
];

export function SalesModule() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data, isLoading } = useSalesOrders();
  const { data: custData } = useCustomers();
  const { data: prodData } = useProducts();
  const createOrder = useCreateSalesOrder();

  const orders = (data?.orders || []) as Order[];
  const totalSales = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalDue = orders.reduce((s, o) => s + o.dueAmount, 0);
  const avgOrder = orders.length > 0 ? totalSales / orders.length : 0;

  const salesStats = [
    { label: "Total Sales", value: fmtBDT(totalSales), delta: 15.3, icon: "ShoppingCart", color: "#3b82f6" },
    { label: "Orders", value: orders.length.toLocaleString(), delta: 9.1, icon: "Package", color: "#8b5cf6" },
    { label: "Avg Order Value", value: fmtBDT(avgOrder), delta: 5.7, icon: "TrendingUp", color: "#10b981" },
    { label: "Pending Payment", value: fmtBDT(totalDue), delta: -2.4, icon: "AlertCircle", color: "#ef4444" },
  ];

  // Sales trend (synthetic monthly for visualization)
  const salesTrend = [
    { month: "Jan", online: 420000, offline: 580000 },
    { month: "Feb", online: 480000, offline: 620000 },
    { month: "Mar", online: 520000, offline: 680000 },
    { month: "Apr", online: 460000, offline: 720000 },
    { month: "May", online: 620000, offline: 780000 },
    { month: "Jun", online: 720000, offline: 820000 },
    { month: "Jul", online: 680000, offline: 760000 },
    { month: "Aug", online: 820000, offline: 880000 },
    { month: "Sep", online: 920000, offline: 940000 },
    { month: "Oct", online: 1020000, offline: 980000 },
    { month: "Nov", online: 1140000, offline: 1040000 },
    { month: "Dec", online: 1280000, offline: 1120000 },
  ];

  // Build dynamic form for new order
  const orderFormFields: FormField[] = [
    {
      name: "customerId",
      label: "Customer",
      type: "select",
      required: true,
      options: (custData?.customers || []).map((c: any) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      options: [
        { value: "Cash", label: "Cash" },
        { value: "Credit", label: "Credit" },
        { value: "Bank", label: "Bank Transfer" },
        { value: "Online", label: "Online" },
      ],
    },
    {
      name: "productId",
      label: "Product",
      type: "select",
      required: true,
      options: (prodData?.products || []).map((p: any) => ({ value: p.id, label: `${p.sku} — ${p.name} (${fmtBDT(p.salePrice)})` })),
    },
    { name: "quantity", label: "Quantity", type: "number", required: true, default: 1, min: 1 },
    { name: "unitPrice", label: "Unit Price (৳)", type: "number", required: true, default: 0, min: 0 },
    { name: "notes", label: "Order Notes", type: "textarea", placeholder: "Optional notes..." },
  ];

  const handleCreate = (values: any) => {
    createOrder.mutate({
      customerId: values.customerId,
      paymentMethod: values.paymentMethod,
      notes: values.notes,
      items: [{ productId: values.productId, quantity: Number(values.quantity), unitPrice: Number(values.unitPrice) }],
    }, {
      onSuccess: () => setShowAddModal(false),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Management"
        subtitle="Sales orders, quotations, invoices, returns & due collection"
        icon={ShoppingCart}
        iconColor="#3b82f6"
        showSearch
        showExport
        exportType="sales-orders"
        showAdd
        addLabel="New Sales Order"
        onAdd={() => setShowAddModal(true)}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <FileText className="mr-1.5 h-4 w-4" /> Quotations
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <CreditCard className="mr-1.5 h-4 w-4" /> Invoices
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {salesStats.map((s) => {
          const Icon = iconMap[s.icon] ?? ShoppingCart;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} trend={s.delta >= 0 ? "up" : "down"} icon={Icon} color={s.color} />;
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
              <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => fmtBDT(v)} />
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
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${orders.length} orders`}</p>
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
        title="New Sales Order"
        description="Create a new sales order for a customer"
        fields={orderFormFields}
        onSubmit={handleCreate}
        loading={createOrder.isPending}
        submitLabel="Create Order"
      />
    </div>
  );
}
