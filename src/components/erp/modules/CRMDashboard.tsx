"use client";

import { useState } from "react";
import { Users, Target, Handshake, TrendingUp, Plus, Mail, Phone, Eye, Pencil, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";
import { CustomerProfile } from "./CustomerProfile";

const iconMap: Record<string, any> = { Users, Target, Handshake, TrendingUp };

const customerFormFields: FormField[] = [
  { name: "name", label: "Customer Name", type: "text", placeholder: "e.g. Apex Garments Ltd", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "customer@company.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+8801XXXXXXXXX" },
  { name: "country", label: "Country", type: "select", default: "Bangladesh", options: [
    { value: "Bangladesh", label: "🇧🇩 Bangladesh" },
    { value: "India", label: "🇮🇳 India" },
    { value: "USA", label: "🇺🇸 USA" },
    { value: "UAE", label: "🇦🇪 UAE" },
    { value: "UK", label: "🇬🇧 UK" },
  ]},
  { name: "segment", label: "Segment", type: "select", default: "SME", options: [
    { value: "ENTERPRISE", label: "Enterprise" },
    { value: "SME", label: "SME" },
    { value: "RETAIL", label: "Retail" },
    { value: "VIP", label: "VIP" },
  ]},
  { name: "creditLimit", label: "Credit Limit (৳)", type: "number", default: 0, min: 0 },
  { name: "status", label: "Status", type: "select", default: "ACTIVE", options: [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "BLOCKED", label: "Blocked" },
  ]},
  { name: "address", label: "Address", type: "textarea", placeholder: "Full address" },
];

const countryOptions = [
  { value: "Bangladesh", label: "🇧🇩 Bangladesh" },
  { value: "India", label: "🇮🇳 India" },
  { value: "USA", label: "🇺🇸 USA" },
  { value: "UAE", label: "🇦🇪 UAE" },
  { value: "UK", label: "🇬🇧 UK" },
];

const segmentOptions = [
  { value: "ENTERPRISE", label: "Enterprise" },
  { value: "SME", label: "SME" },
  { value: "RETAIL", label: "Retail" },
  { value: "VIP", label: "VIP" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "BLOCKED", label: "Blocked" },
];

interface Customer {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string;
  address: string | null;
  segment: string;
  creditLimit: number;
  orders: number;
  totalValue: number;
  dueAmount: number;
  status: string;
  notes?: string | null;
}

// Build pre-populated edit form fields from a customer record
function buildEditFields(c: Customer): FormField[] {
  return [
    { name: "name", label: "Customer Name", type: "text", default: c.name, required: true },
    { name: "email", label: "Email", type: "email", default: c.email || "" },
    { name: "phone", label: "Phone", type: "tel", default: c.phone || "" },
    { name: "country", label: "Country", type: "select", default: c.country || "Bangladesh", options: countryOptions },
    { name: "segment", label: "Segment", type: "select", default: c.segment || "SME", options: segmentOptions },
    { name: "creditLimit", label: "Credit Limit (৳)", type: "number", default: c.creditLimit ?? 0, min: 0 },
    { name: "status", label: "Status", type: "select", default: c.status || "ACTIVE", options: statusOptions },
    { name: "address", label: "Address", type: "textarea", default: c.address || "" },
  ];
}

export function CRMDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomerMut = useDeleteCustomer();

  const customers = (data?.customers || []) as Customer[];
  const totalCustomers = customers.length;
  const totalValue = customers.reduce((s, c) => s + c.totalValue, 0);
  const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length;
  const vipCustomers = customers.filter((c) => c.segment === "VIP" || c.segment === "ENTERPRISE").length;

  // If a customer is selected, show the profile page instead
  if (selectedCustomerId) {
    const current = customers.find((c) => c.id === selectedCustomerId);
    return (
      <CustomerProfile
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
        onEdit={(cust) => setEditCustomer(cust as Customer)}
      />
    );
  }

  const crmStats = [
    { label: "Total Customers", value: totalCustomers.toLocaleString(), delta: 4.7, icon: "Users", color: "#3b82f6" },
    { label: "Active Customers", value: activeCustomers.toLocaleString(), delta: 5.1, icon: "Target", color: "#8b5cf6" },
    { label: "VIP & Enterprise", value: vipCustomers.toLocaleString(), delta: 3.4, icon: "Handshake", color: "#10b981" },
    { label: "Lifetime Value", value: fmtBDT(totalValue), delta: 8.2, icon: "TrendingUp", color: "#f59e0b" },
  ];

  const salesPipeline = [
    { stage: "Lead", count: 124, value: 4280000, color: "#3b82f6" },
    { stage: "Qualified", count: 86, value: 3140000, color: "#06b6d4" },
    { stage: "Proposal", count: 52, value: 2480000, color: "#8b5cf6" },
    { stage: "Negotiation", count: 28, value: 1640000, color: "#f59e0b" },
    { stage: "Closed Won", count: 18, value: totalValue, color: "#10b981" },
  ];

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (r) => (
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => setSelectedCustomerId(r.id)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-400">
            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground hover:text-indigo-400">{r.name}</p>
            <p className="text-[11px] text-muted-foreground">{r.email || "—"}</p>
          </div>
        </button>
      ),
    },
    { key: "phone", header: "Phone", render: (r) => <span className="text-xs text-muted-foreground">{r.phone || "—"}</span> },
    {
      key: "segment",
      header: "Segment",
      render: (r) => (
        <span className="rounded-md bg-card px-2 py-0.5 text-xs text-foreground">
          {r.segment.charAt(0) + r.segment.slice(1).toLowerCase()}
        </span>
      ),
    },
    { key: "orders", header: "Orders", align: "center", render: (r) => <span className="font-semibold">{r.orders}</span> },
    { key: "totalValue", header: "Lifetime Value", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.totalValue)}</span> },
    {
      key: "dueAmount",
      header: "Due",
      align: "right",
      render: (r) => (
        <span className={r.dueAmount > 0 ? "text-rose-400" : "text-emerald-400"}>
          {r.dueAmount > 0 ? fmtBDT(r.dueAmount) : "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-indigo-400" title="View Profile" onClick={() => setSelectedCustomerId(r.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Edit" onClick={() => setEditCustomer(r)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-400" title="Delete" onClick={() => setDeleteCustomer(r)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Dashboard"
        subtitle="Customer Relationship Management — Leads, opportunities & pipeline"
        icon={Users}
        iconColor="#3b82f6"
        showSearch
        showExport
        exportType="customers"
        showAdd
        addLabel="New Customer"
        onAdd={() => setShowAddModal(true)}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {crmStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Users;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} icon={Icon} color={s.color} />;
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Sales Pipeline" subtitle="Deals by stage" icon={Target} iconColor="#8b5cf6" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesPipeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
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
              const pct = total > 0 ? (s.value / total) * 100 : 0;
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
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${customers.length} customers`}</p>
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
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-rose-400">Failed to load customers</p>
            <Button variant="outline" size="sm" className="h-8 border-border bg-card text-foreground hover:bg-card/80" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={customers} emptyMessage="No customers found" />
        )}
      </Card>

      <FormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Customer"
        description="Create a new customer record in CRM"
        fields={customerFormFields}
        onSubmit={(values) => createCustomer.mutate(values, { onSuccess: () => setShowAddModal(false) })}
        loading={createCustomer.isPending}
        submitLabel="Create Customer"
      />

      {editCustomer && (
        <FormModal
          key={editCustomer.id}
          open={!!editCustomer}
          onOpenChange={(open) => { if (!open) setEditCustomer(null); }}
          title={`Edit Customer — ${editCustomer.name}`}
          description="Update customer details"
          fields={buildEditFields(editCustomer)}
          onSubmit={(values) =>
            updateCustomer.mutate(
              { id: editCustomer.id, data: values },
              { onSuccess: () => setEditCustomer(null) }
            )
          }
          loading={updateCustomer.isPending}
          submitLabel="Save Changes"
        />
      )}

      <AlertDialog open={!!deleteCustomer} onOpenChange={(open) => { if (!open) setDeleteCustomer(null); }}>
        <AlertDialogContent className="border-border bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteCustomer?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-card text-foreground hover:bg-card/80">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={deleteCustomerMut.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (!deleteCustomer) return;
                deleteCustomerMut.mutate(deleteCustomer.id, { onSuccess: () => setDeleteCustomer(null) });
              }}
            >
              {deleteCustomerMut.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
