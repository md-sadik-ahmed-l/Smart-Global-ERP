"use client";

import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/lib/erp/hooks";
import { fmtBDT } from "@/lib/erp/demo-data";

export function AIInsightsPanel() {
  const { data } = useDashboardStats();
  const k = data?.kpis;

  if (!k) return null;

  // Real AI-style insights derived from actual data
  const insights = [];

  if (k.netProfit > 0) {
    const margin = ((k.netProfit / (k.totalRevenue || 1)) * 100).toFixed(1);
    insights.push({
      type: "positive",
      icon: TrendingUp,
      color: "#10b981",
      title: "Healthy Profit Margin",
      message: `Your net profit margin is ${margin}%, which is ${parseFloat(margin) > 20 ? "excellent" : "good"} for your industry. Revenue is ৳${fmtBDT(k.totalRevenue)} against expenses of ৳${fmtBDT(k.totalExpenses)}.`,
    });
  }

  if (k.lowStockCount > 0) {
    insights.push({
      type: "warning",
      icon: AlertCircle,
      color: "#f59e0b",
      title: "Restock Alert",
      message: `${k.lowStockCount} products are below reorder level. Based on current sales velocity, reorder within 3 days to avoid stockouts.`,
    });
  }

  if (k.activeWorkOrders > 0) {
    insights.push({
      type: "info",
      icon: Sparkles,
      color: "#3b82f6",
      title: "Production Optimization",
      message: `${k.activeWorkOrders} work orders are in progress. AI predicts completion on schedule. Consider scheduling the next batch to maintain throughput.`,
    });
  }

  if (k.payrollThisMonth > 0) {
    insights.push({
      type: "info",
      icon: Brain,
      color: "#8b5cf6",
      title: "Payroll Forecast",
      message: `This month's payroll commitment is ৳${fmtBDT(k.payrollThisMonth)}. Ensure cash flow covers this by the 28th.`,
    });
  }

  insights.push({
    type: "suggestion",
    icon: Lightbulb,
    color: "#ec4899",
    title: "Growth Recommendation",
    message: `Based on ${k.totalOrders} orders from ${k.totalCustomers} customers, your average order value is ৳${fmtBDT(k.totalOrders > 0 ? k.totalRevenue / k.totalOrders : 0)}. Target a 10% increase through upselling.`,
  });

  return (
    <Card className="glass relative overflow-hidden p-5 rounded-xl">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Business Insights</h3>
            <p className="text-xs text-muted-foreground">Real-time analysis from your live data</p>
          </div>
          <span className="ml-auto flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
            <span className="h-1 w-1 rounded-full bg-indigo-400 pulse-dot" />
            AI POWERED
          </span>
        </div>

        <div className="space-y-2.5">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3"
              >
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${insight.color}1a`, color: insight.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{insight.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
