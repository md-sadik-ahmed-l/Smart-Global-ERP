"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
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
  index?: number;
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
  index = 0,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const isPositive = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          "glass glass-hover relative overflow-hidden p-5 rounded-xl",
          className
        )}
      >
        {/* Top accent gradient line */}
        <div
          className="absolute left-0 top-0 h-[3px] w-full"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
          }}
        />
        {/* Glow blob in top-right */}
        <div
          className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
          style={{ backgroundColor: color }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <motion.p
              key={String(value)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-2 text-2xl font-bold text-foreground tabular-nums"
            >
              {value}
            </motion.p>
            {(delta !== undefined || subtitle) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {delta !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                      isPositive
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/15 text-rose-400"
                    )}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(delta)}%
                  </span>
                )}
                {subtitle && (
                  <span className="text-[11px] text-muted-foreground">{subtitle}</span>
                )}
              </div>
            )}
          </div>
          {/* 3D icon container */}
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
              color: color,
              boxShadow: `0 4px 12px ${color}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
              border: `1px solid ${color}20`,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
