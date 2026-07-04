"use client";

import { LucideIcon, Search, Filter, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  showAdd?: boolean;
  addLabel?: string;
  onAdd?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "#6366f1",
  actions,
  showSearch = false,
  showFilters = false,
  showExport = false,
  showAdd = false,
  addLabel = "Add New",
  onAdd,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${iconColor}1a`,
              color: iconColor,
              boxShadow: `0 0 0 1px ${iconColor}33 inset`,
            }}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showSearch && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-9 w-44 border-border bg-card pl-9 text-sm"
            />
          </div>
        )}
        {showFilters && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-border bg-card text-foreground hover:bg-card/80"
          >
            <Filter className="mr-1.5 h-4 w-4" />
            Filters
          </Button>
        )}
        {showExport && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-border bg-card text-foreground hover:bg-card/80"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        )}
        {showAdd && (
          <Button
            size="sm"
            onClick={onAdd}
            className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {addLabel}
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}
