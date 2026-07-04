"use client";

import { Users, UserCheck, CalendarClock, Clock, Plus, Download, UserPlus } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { hrStats, departmentDist, employeeTable, fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { Users, UserCheck, CalendarClock, Clock };

interface Employee {
  id: string; name: string; dept: string; role: string; joinDate: string; salary: number; status: string;
}

const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Employee",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-400">
          {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{r.name}</p>
          <p className="text-[11px] text-muted-foreground">{r.id}</p>
        </div>
      </div>
    ),
  },
  { key: "dept", header: "Department", render: (r) => <span className="rounded-md bg-card px-2 py-0.5 text-xs text-foreground">{r.dept}</span> },
  { key: "role", header: "Role", render: (r) => <span className="text-sm text-foreground">{r.role}</span> },
  { key: "joinDate", header: "Join Date", align: "right", render: (r) => <span className="text-xs text-muted-foreground">{r.joinDate}</span> },
  { key: "salary", header: "Salary", align: "right", render: (r) => <span className="font-semibold text-foreground">{fmtBDT(r.salary)}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
];

export function HRModule() {
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
          return <StatCard key={s.label} label={s.label} value={s.value.toLocaleString()} delta={s.delta} icon={Icon} color={s.color} subtitle={s.subtitle} />;
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Department Distribution"
          subtitle="Headcount by department"
          icon={Users}
          iconColor="#8b5cf6"
        >
          <div className="flex h-64 items-center">
            <div className="h-full w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={departmentDist} dataKey="count" nameKey="dept" innerRadius={45} outerRadius={85} paddingAngle={2} stroke="#0f1426" strokeWidth={2}>
                    {departmentDist.map((d) => <Cell key={d.dept} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-full w-1/2 space-y-2 overflow-y-auto pl-4">
              {departmentDist.map((d) => (
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

        <ChartCard
          title="Headcount by Department"
          subtitle="Bar view"
          icon={Users}
          iconColor="#3b82f6"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentDist} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="dept" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                  cursor={{ fill: "#1c244050" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {departmentDist.map((d) => <Cell key={d.dept} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Employee Directory</h3>
            <p className="text-xs text-muted-foreground">{employeeTable.length} employees shown</p>
          </div>
        </div>
        <DataTable columns={columns} data={employeeTable} />
      </Card>
    </div>
  );
}
