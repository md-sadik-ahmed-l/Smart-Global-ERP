"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "../ui/PageHeader";
import { getIcon } from "../ui/icon-map";
import { type ModuleDef } from "@/lib/erp/modules";
import {
  Sparkles, Check, ArrowRight, Activity, Database, Zap,
  TrendingUp, FileText, BarChart3, Shield,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useMemo } from "react";

interface GenericModuleProps {
  module: ModuleDef;
}

const colorByCategory: Record<string, string> = {
  Executive: "#6366f1",
  "Sales & CRM": "#3b82f6",
  "Purchase & Inventory": "#8b5cf6",
  "HR & Finance": "#10b981",
  Operations: "#f59e0b",
  System: "#06b6d4",
  Advanced: "#ec4899",
};

// Sample mini chart data
const sampleData = [
  { day: "Mon", value: 4200 }, { day: "Tue", value: 5100 },
  { day: "Wed", value: 4800 }, { day: "Thu", value: 6200 },
  { day: "Fri", value: 7400 }, { day: "Sat", value: 6800 },
  { day: "Sun", value: 5200 },
];

export function GenericModule({ module }: GenericModuleProps) {
  const Icon = getIcon(module.icon);
  const accent = colorByCategory[module.category] ?? "#6366f1";

  // Generate stable mock KPIs from module features
  const kpis = useMemo(() => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];
    return module.features.slice(0, 4).map((f, i) => ({
      label: f,
      value: Math.floor(Math.random() * 9000) + 100,
      delta: Math.floor(Math.random() * 20) - 5,
      color: colors[i % colors.length],
    }));
  }, [module.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={module.name}
        subtitle={module.description}
        icon={Icon}
        iconColor={accent}
        showSearch
        showExport
        showAdd
        addLabel="New Entry"
      />

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#0f1426] via-[#131a2e] to-[#1c2440] p-6">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${accent}30` }}
        />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accent}1a`, color: accent, boxShadow: `0 0 0 1px ${accent}33 inset` }}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Badge variant="outline" className="border-border bg-card/50 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Module {module.number} of 50
                </Badge>
                <Badge variant="outline" className="border-border bg-card/50 text-[10px] font-medium text-muted-foreground">
                  {module.category}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{module.name}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{module.description}</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              <Sparkles className="mr-1.5 h-4 w-4" /> Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Sample KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="card-hover relative overflow-hidden border-border bg-card p-5">
            <div
              className="absolute left-0 top-0 h-1 w-full opacity-80"
              style={{ background: `linear-gradient(90deg, ${kpi.color} 0%, transparent 100%)` }}
            />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                  kpi.delta >= 0
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {kpi.delta >= 0 ? "↑" : "↓"} {Math.abs(kpi.delta)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Mini chart + summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Activity Overview</h3>
              <p className="text-xs text-muted-foreground">Weekly activity sample for {module.shortName ?? module.name}</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${module.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accent} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="value" stroke={accent} strokeWidth={2.5} fill={`url(#grad-${module.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Module Health</h3>
          <div className="space-y-3">
            {[
              { icon: Shield, label: "Security", value: "Active", color: "#10b981" },
              { icon: Database, label: "Data Sync", value: "Live", color: "#3b82f6" },
              { icon: Zap, label: "Automation", value: "Running", color: "#f59e0b" },
              { icon: TrendingUp, label: "Performance", value: "Optimal", color: "#8b5cf6" },
              { icon: FileText, label: "Reports", value: "248", color: "#ec4899" },
              { icon: BarChart3, label: "Records", value: "12.4K", color: "#14b8a6" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${m.color}1a`, color: m.color }}
                >
                  <m.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-semibold text-foreground">{m.value}</p>
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Feature grid */}
      <Card className="border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Module Features</h3>
            <p className="text-xs text-muted-foreground">{module.features.length} features available in this module</p>
          </div>
          <Badge variant="outline" className="border-border bg-card/50 text-xs text-muted-foreground">
            All features
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {module.features.map((f, i) => (
            <button
              key={f}
              className="card-hover group flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5 text-left"
            >
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                style={{
                  backgroundColor: `${accent}15`,
                  color: accent,
                }}
              >
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 text-xs font-medium text-foreground">{f}</span>
              <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </Card>

      {/* CTA footer */}
      <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-5">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ready to explore {module.name}?</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              This is a demo preview of the {module.name} module. In the full version, every feature above is fully functional with live data, charts, and exports.
            </p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
            <Sparkles className="mr-1.5 h-4 w-4" /> Request Full Demo
          </Button>
        </div>
      </Card>
    </div>
  );
}
