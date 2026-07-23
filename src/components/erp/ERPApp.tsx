"use client";

import { useERPStore } from "@/store/erp-store";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getModuleById } from "@/lib/erp/modules";
import { ExecutiveDashboard } from "./modules/ExecutiveDashboard";
import { VendorsDashboard } from "./modules/VendorsDashboard";
import { CRMDashboard } from "./modules/CRMDashboard";
import { SalesModule } from "./modules/SalesModule";
import { PurchaseModule } from "./modules/PurchaseModule";
import { InventoryModule } from "./modules/InventoryModule";
import { ProductModule } from "./modules/ProductModule";
import { HRModule } from "./modules/HRModule";
import { FinanceModule } from "./modules/FinanceModule";
import { ReportsModule } from "./modules/ReportsModule";
import { GenericModule } from "./modules/GenericModule";
import { NotificationPanel } from "./NotificationPanel";
import { lazy, Suspense } from "react";
import { ManufacturingModule } from "./modules/ManufacturingModule";
import { PayrollModule } from "./modules/PayrollModule";
import { UserManagementModule } from "./modules/UserManagementModule";
import { POSModule } from "./modules/POSModule";

// Code-split heavy modules (lazy loaded on first access)
// const POSModule = lazy(() => import("./modules/POSModule").then(m => ({ default: m.POSModule })));

export function ERPApp() {
  const { activeModuleId, notifPanelOpen } = useERPStore();
  const mod = getModuleById(activeModuleId);

  const renderModule = () => {
    if (!mod) return <ExecutiveDashboard />;
    switch (mod.variant) {
      case "executive-dashboard": return <ExecutiveDashboard />;
      case "vendors-dashboard":   return <VendorsDashboard />;
      case "crm":                  return <CRMDashboard />;
      case "sales":                return <SalesModule />;
      case "purchase":             return <PurchaseModule />;
      case "inventory":            return <InventoryModule />;
      case "pos":                  return <POSModule />;
      case "product":              return <ProductModule />;
      case "hr":                   return <HRModule />;
      case "finance":              return <FinanceModule />;
      case "reports":              return <ReportsModule />;
      case "manufacturing":        return <ManufacturingModule />;
      case "payroll":              return <PayrollModule />;
      case "user-management":      return <UserManagementModule />;
      default:                     return <GenericModule module={mod} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" /></div>}>
            {renderModule()}
          </Suspense>
        </main>
      </div>
      {notifPanelOpen && <NotificationPanel />}
    </div>
  );
}
