"use client";

import { Users, UserCheck, CalendarClock, Clock, Plus, Download, UserPlus } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { PageHeader } from "../ui/PageHeader";
import { useDashboardStats, useBranches, useEmployees } from "@/lib/erp/hooks";

const iconMap: Record<string, any> = { Users, UserCheck, CalendarClock, Clock };

export function HRModule() {
  const { data: dashData } = useDashboardStats();
  const { data: branchData } = useBranches();
  const { data: empData } = useEmployees();
  const k = dashData?.kpis;

  const totalEmployees = k?.totalEmployees ?? 0;

  const hrStats = [
    { label: "Total Employees", value: totalEmployees.toLocaleString(), delta: 2.1, icon: "Users", color: "#3b82f6" },
    { label: "Active Branches", value: (branchData?.branches?.length ?? 0).toString(), delta: 0, icon: "UserCheck", color: "#10b981" },
    { label: "Total Customers", value: (k?.totalCustomers ?? 0).toLocaleString(), delta: 4.7, icon: "CalendarClock", color: "#f59e0b" },
    { label: "Total Vendors", value: (k?.totalVendors ?? 0).toLocaleString(), delta: 5.2, icon: "Clock", color: "#8b5cf6" },
  ];

  // Real department distribution from employee database
  const allEmployees = (empData?.employees || []) as any[];
  const deptCountMap: Record<string, number> = {};
  allEmployees.forEach((e) => {
    const dept = e.department || "Unassigned";
    deptCountMap[dept] = (deptCountMap[dept] || 0) + 1;
  });
  const deptColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#06b6d4", "#f97316"];
  const departments = Object.entries(deptCountMap).map(([dept, count], i) => ({
    dept,
    count,
    color: deptColors[i % deptColors.length],
  })).filter((d) => d.count > 0);

  // Branch headcount
  const branchHeadcount = (branchData?.branches || []).map((b: any, i: number) => ({
    name: b.name,
    employees: b._count?.users ?? 0,
    color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][i % 5],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Management"
        subtitle="Employee lifecycle, departments, designations & recruitment"
        icon={Users}
        iconColor="#ec4899"
        showSearch
        showExport
        showAdd
        addLabel="New Employee"
        actions={
          <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
            <UserPlus className="mr-1.5 h-4 w-4" /> Recruitment
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {hrStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Users;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} icon={Icon} color={s.color} />;
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Department Distribution" subtitle="Headcount by department" icon={Users} iconColor="#8b5cf6">
          <div className="flex h-64 items-center">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={departments} dataKey="count" nameKey="dept" innerRadius={45} outerRadius={85} paddingAngle={2} stroke="#0f1426" strokeWidth={2}>
                    {departments.map((d) => <Cell key={d.dept} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-full w-1/2 space-y-2 overflow-y-auto pl-4">
              {departments.map((d) => (
                <div key={d.dept} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="truncate text-foreground">{d.dept}</span>
                  </div>
                  <span className="font-semibold text-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Branch Headcount" subtitle="Employees per branch (live)" icon={Users} iconColor="#3b82f6" className="lg:col-span-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchHeadcount} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                  cursor={{ fill: "#1c244050" }}
                />
                <Bar dataKey="employees" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {branchHeadcount.map((b: any) => <Cell key={b.name} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <Card className="border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Branch Directory</h3>
          <p className="text-xs text-muted-foreground">{branchData?.branches?.length ?? 0} branches</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(branchData?.branches || []).map((b: any) => (
            <div key={b.id} className="rounded-lg border border-border/60 bg-card/50 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{b.code}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${b.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                  {b.status}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{b.address || "—"}</p>
              <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                <span className="text-muted-foreground">Employees: <span className="font-semibold text-foreground">{b._count?.users ?? 0}</span></span>
                <span className="text-muted-foreground">Warehouses: <span className="font-semibold text-foreground">{b.warehouses?.length ?? 0}</span></span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Employee Directory — real DB data */}
      <Card className="glass p-5 rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Employee Directory</h3>
            <p className="text-xs text-muted-foreground">{allEmployees.length} employees</p>
          </div>
        </div>
        {allEmployees.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No employees found. Add employees via the Employees API.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="py-2 text-left font-medium">Code</th>
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Department</th>
                  <th className="py-2 text-left font-medium">Designation</th>
                  <th className="py-2 text-left font-medium">Branch</th>
                  <th className="py-2 text-left font-medium">Join Date</th>
                  <th className="py-2 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {allEmployees.map((emp: any) => (
                  <tr key={emp.id} className="border-b border-border/50 hover:bg-white/[0.03]">
                    <td className="py-2.5 font-mono text-xs text-indigo-400">{emp.employeeCode}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/15 text-[10px] font-bold text-indigo-400">
                          {emp.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{emp.department || "—"}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{emp.designation || "—"}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{emp.branch?.name || "—"}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{new Date(emp.joinDate).toISOString().slice(0, 10)}</td>
                    <td className="py-2.5 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${emp.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
