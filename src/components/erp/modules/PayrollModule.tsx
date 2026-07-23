"use client";

import { useState } from "react";
import { Banknote, Plus, Play, CheckCircle2, Users, TrendingUp, DollarSign } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import { usePayrollRuns, useSalarySlips, useRunPayroll, useEmployees } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";
import { motion } from "framer-motion";

const slipStatusVariant: Record<string, "success" | "warning" | "info" | "neutral" | "purple"> = {
  GENERATED: "info",
  APPROVED: "purple",
  PAID: "success",
};

interface SalarySlip {
  id: string;
  slipNumber: string;
  employee: { name: string; employeeCode: string; department: string | null };
  month: number;
  year: number;
  basicSalary: number;
  grossSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  taxAmount: number;
  netSalary: number;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  status: string;
}

const columns: Column<SalarySlip>[] = [
  { key: "slipNumber", header: "Slip #", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.slipNumber}</span> },
  {
    key: "employee",
    header: "Employee",
    render: (r) => (
      <div>
        <p className="text-sm font-medium text-foreground">{r.employee?.name}</p>
        <p className="text-[11px] text-muted-foreground">{r.employee?.employeeCode} · {r.employee?.department || "—"}</p>
      </div>
    ),
  },
  { key: "month", header: "Period", align: "center", render: (r) => <span className="text-xs text-muted-foreground">{r.month}/{r.year}</span> },
  { key: "grossSalary", header: "Gross", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.grossSalary)}</span> },
  { key: "totalAllowances", header: "Allowances", align: "right", render: (r) => <span className="text-emerald-400">+{fmtBDT(r.totalAllowances)}</span> },
  { key: "totalDeductions", header: "Deductions", align: "right", render: (r) => <span className="text-rose-400">−{fmtBDT(r.totalDeductions)}</span> },
  { key: "taxAmount", header: "Tax", align: "right", render: (r) => <span className="text-amber-400">{fmtBDT(r.taxAmount)}</span> },
  { key: "netSalary", header: "Net Pay", align: "right", render: (r) => <span className="font-bold text-indigo-400">{fmtBDT(r.netSalary)}</span> },
  { key: "presentDays", header: "Days", align: "center", render: (r) => <span className="text-xs"><span className="text-emerald-400">{r.presentDays}P</span> · <span className="text-rose-400">{r.absentDays}A</span></span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={slipStatusVariant[r.status] || "neutral"} dot>{r.status}</StatusBadge> },
];

export function PayrollModule() {
  const [showRunModal, setShowRunModal] = useState(false);
  const now = new Date();
  const [slipMonth, setSlipMonth] = useState(now.getMonth() + 1);
  const [slipYear, setSlipYear] = useState(now.getFullYear());

  const { data: runsData } = usePayrollRuns();
  const { data: slipsData, isLoading } = useSalarySlips({ month: slipMonth, year: slipYear });
  const { data: empData } = useEmployees();
  const runPayroll = useRunPayroll();

  const slips = (slipsData?.slips || []) as SalarySlip[];
  const runs = runsData?.runs || [];
  const employees = empData?.employees || [];

  const totalNet = slips.reduce((s, x) => s + x.netSalary, 0);
  const totalGross = slips.reduce((s, x) => s + x.grossSalary, 0);
  const totalTax = slips.reduce((s, x) => s + x.taxAmount, 0);

  const stats = [
    { label: "Total Employees", value: employees.length, delta: 2.1, icon: "Users", color: "#3b82f6" },
    { label: `Payroll ${slipMonth}/${slipYear}`, value: fmtBDT(totalNet), delta: 5.4, icon: "Banknote", color: "#10b981" },
    { label: "Gross Salaries", value: fmtBDT(totalGross), delta: 3.2, icon: "TrendingUp", color: "#f59e0b" },
    { label: "Tax Withheld", value: fmtBDT(totalTax), delta: 1.8, icon: "DollarSign", color: "#8b5cf6" },
  ];

  const iconMap: Record<string, any> = { Users, Banknote, TrendingUp, DollarSign };

  const payrollRunFields: FormField[] = [
    {
      name: "month",
      label: "Month",
      type: "select",
      required: true,
      default: String(now.getMonth() + 1),
      options: Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2024, i).toLocaleString("en", { month: "long" }) })),
    },
    {
      name: "year",
      label: "Year",
      type: "select",
      required: true,
      default: String(now.getFullYear()),
      options: [2024, 2025, 2026].map((y) => ({ value: String(y), label: String(y) })),
    },
  ];

  // Salary by department chart
  const deptMap: Record<string, number> = {};
  slips.forEach((s) => {
    const dept = s.employee?.department || "Unknown";
    deptMap[dept] = (deptMap[dept] || 0) + s.netSalary;
  });
  const deptData = Object.entries(deptMap).map(([name, value], i) => ({
    name,
    value,
    color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"][i % 6],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        subtitle="Salary structures, payroll runs, salary slips & tax calculation"
        icon={Banknote}
        iconColor="#10b981"
        showSearch
        showExport
        showAdd
        addLabel="Run Payroll"
        onAdd={() => setShowRunModal(true)}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = iconMap[s.icon] ?? Banknote;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} icon={Icon} color={s.color} index={i} />;
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Salary by Department"
          subtitle={`For ${slipMonth}/${slipYear}`}
          icon={Users}
          iconColor="#8b5cf6"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full">
            {deptData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No payroll data for this period. Run payroll to see the chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} formatter={(v: any) => fmtBDT(v)} cursor={{ fill: "#1c244050" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {deptData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <Card className="glass p-5 rounded-xl">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Payroll Runs</h3>
          {runs.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-center text-sm text-muted-foreground">
              <div>
                <Banknote className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                No payroll runs yet.<br />Click "Run Payroll" to start.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {runs.slice(0, 5).map((r: any, i: number) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-lg border border-border/60 bg-card/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-indigo-400">{r.runNumber}</span>
                    <StatusBadge variant={r.status === "PAID" ? "success" : r.status === "APPROVED" ? "purple" : "info"}>{r.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Period: {r.month}/{r.year}</p>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">{r.totalEmployees} employees</span>
                    <span className="font-semibold text-foreground">{fmtBDT(r.totalNet)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="glass p-5 rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Salary Slips — {slipMonth}/{slipYear}</h3>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${slips.length} slips`}</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={slipMonth} onChange={(e) => setSlipMonth(Number(e.target.value))} className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>{new Date(2024, i).toLocaleString("en", { month: "long" })}</option>
              ))}
            </select>
            <select value={slipYear} onChange={(e) => setSlipYear(Number(e.target.value))} className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={slips} />
        )}
      </Card>

      <FormModal
        open={showRunModal}
        onOpenChange={setShowRunModal}
        title="Run Payroll"
        description="Generate salary slips for all active employees for the selected period. This will calculate gross salary, deductions, tax, and net pay based on each employee's salary structure."
        fields={payrollRunFields}
        onSubmit={(values) => runPayroll.mutate({ month: Number(values.month), year: Number(values.year) }, { onSuccess: () => setShowRunModal(false) })}
        loading={runPayroll.isPending}
        submitLabel="Run Payroll"
      />
    </div>
  );
}
