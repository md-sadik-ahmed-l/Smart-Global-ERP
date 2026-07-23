"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  index?: number;
}

export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = "#6366f1",
  action,
  children,
  className,
  bodyClassName,
  index = 0,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 + 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card
        className={cn(
          "glass flex flex-col p-5 rounded-xl",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${iconColor}30, ${iconColor}10)`,
                  color: iconColor,
                  border: `1px solid ${iconColor}20`,
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
        <div className={cn("flex-1", bodyClassName)}>{children}</div>
      </Card>
    </motion.div>
  );
}
