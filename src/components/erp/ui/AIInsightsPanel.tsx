"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Sparkles, RefreshCw, Bot, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtBDT } from "@/lib/erp/demo-data";
import { toast } from "sonner";

const insightIcons: Record<string, any> = {
  positive: TrendingUp,
  warning: AlertCircle,
  critical: TrendingDown,
  opportunity: Lightbulb,
};

const insightColors: Record<string, string> = {
  positive: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  opportunity: "#3b82f6",
};

const riskColors: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
};

export function AIInsightsPanel() {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sales_forecast" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI analysis failed");
      }
      return res.json();
    },
    enabled,
  });

  const handleGenerate = () => {
    setEnabled(true);
    refetch();
  };

  const aiData = data?.data;
  const forecast = aiData?.forecast;
  const insights = aiData?.insights || [];
  const recommendations = aiData?.recommendations || [];
  const risk = aiData?.riskAssessment;
  const kpiPred = aiData?.kpiPredictions;

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
            <p className="text-xs text-muted-foreground">Real AI analysis from your live ERP data</p>
          </div>
          <span className="ml-auto flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
            <span className="h-1 w-1 rounded-full bg-indigo-400 pulse-dot" />
            GEMINI AI
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleGenerate}
            disabled={isFetching}
            title="Generate AI insights"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading || isFetching ? (
          <div className="flex h-48 flex-col items-center justify-center">
            <div className="relative">
              <Bot className="h-12 w-12 text-indigo-400/50" />
              <div className="absolute inset-0 animate-ping">
                <Bot className="h-12 w-12 text-indigo-400/30" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">AI analyzing your business data...</p>
            <p className="text-xs text-muted-foreground/70">This may take a few seconds</p>
          </div>
        ) : !aiData ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <Sparkles className="mb-2 h-10 w-10 text-indigo-400/50" />
            <p className="text-sm font-medium text-foreground">AI-Powered Business Intelligence</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate real AI forecasts, insights & recommendations<br />
              based on your live ERP data.
            </p>
            <Button
              size="sm"
              onClick={handleGenerate}
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Generate AI Insights
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Forecast */}
            {forecast && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next Month</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{fmtBDT(forecast.nextMonthRevenue || 0)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next Quarter</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{fmtBDT(forecast.nextQuarterRevenue || 0)}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Growth Rate</p>
                  <p className="mt-1 text-sm font-bold text-emerald-400">{forecast.growthRate || 0}%</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</p>
                  <p className="mt-1 text-sm font-bold text-indigo-400">{forecast.confidence || 0}%</p>
                </div>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Insights</p>
                <div className="space-y-2">
                  {insights.slice(0, 4).map((ins: any, i: number) => {
                    const Icon = insightIcons[ins.type] || Lightbulb;
                    const color = insightColors[ins.type] || "#3b82f6";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5"
                      >
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${color}1a`, color }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground">{ins.title}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{ins.description}</p>
                        </div>
                        {ins.impact && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                            style={{ backgroundColor: `${color}15`, color }}
                          >
                            {ins.impact}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Recommendations</p>
                <div className="space-y-2">
                  {recommendations.slice(0, 3).map((rec: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                      className="flex items-start gap-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-2.5"
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-400">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">{rec.action}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">Expected: {rec.expectedImpact}</p>
                      </div>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        rec.priority === "high" ? "bg-rose-500/15 text-rose-400" :
                        rec.priority === "medium" ? "bg-amber-500/15 text-amber-400" :
                        "bg-blue-500/15 text-blue-400"
                      }`}>
                        {rec.priority}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Assessment + KPI Predictions */}
            {(risk || kpiPred) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {risk && (
                  <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk Assessment</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold capitalize" style={{ color: riskColors[risk.overallRisk] }}>
                        {risk.overallRisk} Risk
                      </span>
                    </div>
                    {risk.factors?.slice(0, 2).map((f: any, i: number) => (
                      <p key={i} className="mt-1 text-[10px] text-muted-foreground">• {f.factor}</p>
                    ))}
                  </div>
                )}
                {kpiPred && (
                  <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">KPI Predictions</p>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-medium capitalize text-foreground">{kpiPred.revenueTrend}</span>
                      <span className="text-muted-foreground">Inventory:</span>
                      <span className="font-medium capitalize text-foreground">{kpiPred.inventoryHealth}</span>
                      <span className="text-muted-foreground">Customers:</span>
                      <span className="font-medium capitalize text-foreground">{kpiPred.customerGrowth}</span>
                      <span className="text-muted-foreground">Cash Flow:</span>
                      <span className="font-medium capitalize text-foreground">{kpiPred.cashFlowHealth}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regenerate button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-full border-border bg-card text-foreground hover:bg-card/80"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Regenerate AI Analysis
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
