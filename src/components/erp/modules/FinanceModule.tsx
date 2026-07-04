"use client";

import { TrendingUp, TrendingDown, Wallet, Banknote, Plus, Download, FileText, BookOpen } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../ui/StatCard";
import { ChartCard } from "../ui/ChartCard";
import { PageHeader } from "../ui/PageHeader";
import { financeStats, cashFlowData, plBreakdown, fmtBDT } from "@/lib/erp/demo-data";

const iconMap: Record<string, any> = { TrendingUp, TrendingDown, Wallet, Banknote };

export function FinanceModule() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Accounting"
        subtitle="Chart of accounts, journal, ledger, P&L, balance sheet & trial balance"
        icon={Wallet}
        iconColor="#10b981"
        showSearch
        showExport
        showAdd
        addLabel="New Journal Entry"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <BookOpen className="mr-1.5 h-4 w-4" /> Ledger
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <FileText className="mr-1.5 h-4 w-4" /> P&L Statement
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {financeStats.map((s) => {
          const Icon = iconMap[s.icon] ?? Wallet;
          return <StatCard key={s.label} label={s.label} value={fmtBDT(s.value)} delta={s.delta} trend={s.delta >= 0 ? "up" : "down"} icon={Icon} color={s.color} />;
        })}
      </div>

      <ChartCard
        title="Cash Flow Statement"
        subtitle="Monthly inflow, outflow & net cash"
        icon={TrendingUp}
        iconColor="#10b981"
        action={
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Inflow</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-rose-500" /> Outflow</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Net</span>
          </div>
        }
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2440" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f1426", border: "1px solid #28304a", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                formatter={(v: any) => fmtBDT(v)}
                cursor={{ fill: "#1c244050" }}
              />
              <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <Card className="border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Profit & Loss Breakdown</h3>
          <p className="text-xs text-muted-foreground">Year-to-date financial summary</p>
        </div>
        <div className="space-y-3">
          {plBreakdown.map((p) => {
            const max = Math.max(...plBreakdown.map((x) => x.amount));
            const pct = (p.amount / max) * 100;
            return (
              <div key={p.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-semibold" style={{ color: p.type === "income" ? "#10b981" : "#ef4444" }}>
                    {p.type === "income" ? "+" : "−"}{fmtBDT(p.amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
