"use client";

import { useERPStore } from "@/store/erp-store";
import { MODULES, MODULE_CATEGORIES, type ModuleCategory } from "@/lib/erp/modules";
import { getIcon } from "./ui/icon-map";
import { COMPANY } from "@/lib/erp/demo-data";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { ChevronDown, Crown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<ModuleCategory, string> = {
  Executive: "Executive",
  "Sales & CRM": "Sales & CRM",
  "Purchase & Inventory": "Purchase & Inventory",
  "HR & Finance": "HR & Finance",
  Operations: "Operations",
  System: "System",
  Advanced: "Advanced",
};

export function Sidebar() {
  const { activeModuleId, setActiveModule, sidebarCollapsed } = useERPStore();
  const [expandedCats, setExpandedCats] = useState<Set<ModuleCategory>>(
    new Set(["Executive", "Sales & CRM", "Purchase & Inventory"])
  );

  const toggleCat = (cat: ModuleCategory) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (sidebarCollapsed) {
    return <CollapsedSidebar />;
  }

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
          <span className="text-lg font-bold text-white">S</span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-white">Smart Global ERP</h1>
          <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            Enterprise Edition
          </p>
        </div>
      </div>

      {/* Module navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-1">
          {MODULE_CATEGORIES.map((cat) => {
            const catModules = MODULES.filter((m) => m.category === cat);
            const isExpanded = expandedCats.has(cat);
            const hasActive = catModules.some((m) => m.id === activeModuleId);

            return (
              <div key={cat} className="mb-1">
                <button
                  onClick={() => toggleCat(cat)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider transition-colors",
                    hasActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{categoryLabels[cat]}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-0.5 space-y-0.5">
                    {catModules.map((mod) => {
                      const Icon = getIcon(mod.icon);
                      const isActive = mod.id === activeModuleId;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => setActiveModule(mod.id)}
                          className={cn(
                            "group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-all",
                            isActive
                              ? "nav-active font-medium"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-foreground"
                          )}
                          title={mod.name}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 flex-shrink-0",
                              isActive ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          <span className="truncate">{mod.shortName ?? mod.name}</span>
                          {mod.number === 1 && (
                            <Crown className="ml-auto h-3.5 w-3.5 text-amber-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom: upgrade card + company info */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 rounded-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-foreground">Demo Build</span>
          </div>
          <p className="mb-2 text-[11px] leading-snug text-muted-foreground">
            50 modules · All features unlocked for evaluation
          </p>
          <Button
            size="sm"
            className="h-7 w-full bg-primary text-[11px] text-primary-foreground hover:bg-primary/90"
          >
            Upgrade to Pro
          </Button>
        </div>

        <div className="rounded-lg bg-card/50 p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500/20 text-xs font-bold text-indigo-400">
              {COMPANY.owner.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-foreground">
                {COMPANY.company}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {COMPANY.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Collapsed sidebar (icon-only)
function CollapsedSidebar() {
  const { activeModuleId, setActiveModule, toggleSidebar } = useERPStore();

  return (
    <aside className="flex h-full w-16 flex-shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar py-3">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
        <span className="text-lg font-bold text-white">S</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="mb-2 h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
      </Button>
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center gap-1 px-2">
          {MODULES.map((mod) => {
            const Icon = getIcon(mod.icon);
            const isActive = mod.id === activeModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                title={mod.name}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md transition-all",
                  isActive
                    ? "bg-primary/20 text-indigo-400"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
