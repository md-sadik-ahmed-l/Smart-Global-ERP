"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
  subtitle?: string;
  isPercent?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  icon: Icon,
  color,
  subtitle,
  isPercent,
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const isPositive = trend === "up";

  return (
    <Card
      className={cn(
        "card-hover relative overflow-hidden border-border bg-card p-5",
        className
      )}
    >
      {/* Color accent bar on top */}
      <div
        className="absolute left-0 top-0 h-1 w-full opacity-80"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {(delta !== undefined || subtitle) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {delta !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                    isPositive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(delta)}{isPercent ? "%" : "%"}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${color}1a`,
            color: color,
            boxShadow: `0 0 0 1px ${color}33 inset`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
