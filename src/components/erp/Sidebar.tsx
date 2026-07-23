"use client";

import { useERPStore } from "@/store/erp-store";
import { MODULES, MODULE_CATEGORIES, type ModuleCategory } from "@/lib/erp/modules";
import { getIcon } from "./ui/icon-map";
import { COMPANY } from "@/lib/erp/demo-data";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { ChevronDown, Crown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryTranslationKeys: Record<ModuleCategory, TranslationKey> = {
  Executive: "cat_executive",
  "Sales & CRM": "cat_sales_crm",
  "Purchase & Inventory": "cat_purchase_inventory",
  "HR & Finance": "cat_hr_finance",
  Operations: "cat_operations",
  System: "cat_system",
  Advanced: "cat_advanced",
};

// Map module IDs to translation keys
const moduleTranslationKeys: Record<string, TranslationKey> = {
  "executive-dashboard": "mod_executive_dashboard",
  crm: "mod_crm",
  "buyers-suppliers": "mod_vendors",
  marketplace: "mod_marketplace",
  products: "mod_products",
  sales: "mod_sales",
  purchase: "mod_purchase",
  inventory: "mod_inventory",
  pos: "mod_pos",
  ecommerce: "mod_ecommerce",
  manufacturing: "mod_manufacturing",
  "garments-merchandising": "mod_merchandising",
  "sample-development": "mod_sample_dev",
  "quality-control": "mod_qc",
  hr: "mod_hr",
  attendance: "mod_attendance",
  payroll: "mod_payroll",
  finance: "mod_finance",
  banking: "mod_banking",
  "courier-logistics": "mod_logistics",
  dms: "mod_dms",
  "fixed-asset": "mod_assets",
  helpdesk: "mod_helpdesk",
  "project-management": "mod_projects",
  "multi-company": "mod_multi_company",
  "multi-branch": "mod_multi_branch",
  "multi-currency": "mod_multi_currency",
  subscription: "mod_subscription",
  "ai-bi": "mod_ai_bi",
  "reports-analytics": "mod_reports",
  "api-integration": "mod_api_integration",
  "security-access": "mod_security",
  workflow: "mod_workflow",
  notifications: "mod_notifications",
  "audit-compliance": "mod_audit",
  "backup-recovery": "mod_backup",
  "mobile-app": "mod_mobile",
  iot: "mod_iot",
  "cloud-server": "mod_cloud",
  "system-admin": "mod_system_admin",
  "ai-copilot": "mod_ai_copilot",
  automation: "mod_automation",
  "marketplace-advanced": "mod_marketplace_pro",
  "franchise-dealer": "mod_franchise",
  "loyalty-rewards": "mod_loyalty",
  affiliate: "mod_affiliate",
  "visitor-gate-pass": "mod_visitor",
  "legal-contract": "mod_legal",
  "esg-sustainability": "mod_esg",
  "communication-hub": "mod_communication",
  "user-management": "mod_user_management",
};

export function Sidebar() {
  const { activeModuleId, setActiveModule, sidebarCollapsed } = useERPStore();
  const { t } = useI18n();
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
                  <span>{t(categoryTranslationKeys[cat])}</span>
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
                          <span className="truncate">{t(moduleTranslationKeys[mod.id] || ("mod_executive_dashboard" as TranslationKey))}</span>
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
        <div className="mb-3 rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-foreground">Production · Live</span>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            50 modules · {COMPANY.version} · Database connected
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-[10px] text-emerald-400">All systems operational</span>
          </div>
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
