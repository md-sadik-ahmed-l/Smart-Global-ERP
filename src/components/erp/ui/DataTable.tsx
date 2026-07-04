"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  maxHeight?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No records found",
  maxHeight = "440px",
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card/30">
      <div className="overflow-x-auto" style={{ maxHeight }}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#0f1426]">
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    "h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow
                  key={row.id ?? idx}
                  className="border-border/60 transition-colors hover:bg-white/[0.03]"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={cn(
                        "whitespace-nowrap py-3 text-sm text-foreground/90",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------- Status badge ----------
interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
  children: React.ReactNode;
  dot?: boolean;
}

const badgeStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const dotColors: Record<NonNullable<BadgeProps["variant"]>, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  info: "bg-blue-400",
  neutral: "bg-slate-300",
  purple: "bg-purple-400",
};

export function StatusBadge({ variant = "neutral", children, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badgeStyles[variant]
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full pulse-dot", dotColors[variant])} />}
      {children}
    </span>
  );
}

// Helper to map status strings to badge variants
export function statusVariant(status: string): BadgeProps["variant"] {
  const s = status.toLowerCase();
  if (["active", "completed", "in stock", "vip", "paid", "won", "received", "approved", "shipped"].includes(s)) return "success";
  if (["pending", "low stock", "warning", "on leave", "processing"].includes(s)) return "warning";
  if (["blocked", "out of stock", "overdue", "rejected", "cancelled"].includes(s)) return "danger";
  if (["inactive"].includes(s)) return "neutral";
  return "info";
}
