"use client";

import { useState } from "react";
import { LucideIcon, Search, Filter, Download, Plus, X, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  /** Entity type for export — maps to /api/export?type= */
  exportType?: string;
  /** Optional search value + onChange (if parent manages search state) */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
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
  exportType,
  searchValue,
  onSearchChange,
}: PageHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");

  const handleSearch = (value: string) => {
    setInternalSearch(value);
    onSearchChange?.(value);
  };

  const handleExport = async (format: "csv") => {
    if (!exportType) {
      toast.error("Export not configured for this page");
      return;
    }
    setShowExportMenu(false);
    toast.loading("Generating export...");

    try {
      const res = await fetch(`/api/export?type=${exportType}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportType}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${exportType} exported as CSV`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    }
  };

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
              value={searchValue ?? internalSearch}
              onChange={(e) => handleSearch(e.target.value)}
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
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-9 border-border bg-card text-foreground hover:bg-card/80"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="glass-strong absolute right-0 top-11 z-50 w-48 rounded-lg border border-border p-1.5 shadow-2xl">
                  <button
                    onClick={() => handleExport("csv")}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-foreground hover:bg-white/[0.05]"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="font-medium">Export as CSV</p>
                      <p className="text-[10px] text-muted-foreground">Opens in Excel</p>
                    </div>
                  </button>
                  <button
                    onClick={() => toast.info("PDF export coming soon — CSV is ready now!")}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-foreground hover:bg-white/[0.05]"
                  >
                    <FileText className="h-4 w-4 text-rose-400" />
                    <div>
                      <p className="font-medium">Export as PDF</p>
                      <p className="text-[10px] text-muted-foreground">Formatted report</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
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
