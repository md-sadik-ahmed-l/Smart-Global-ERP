"use client";

import { useERPStore } from "@/store/erp-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, Check, AlertTriangle, Info, CheckCircle2, XCircle, Settings } from "lucide-react";
import { systemAlerts } from "@/lib/erp/demo-data";

const alertIcon: Record<string, any> = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

export function NotificationPanel() {
  const { setNotifPanelOpen } = useERPStore();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setNotifPanelOpen(false)}
      />
      {/* Panel */}
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-indigo-400" />
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                8
              </span>
            </div>
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifPanelOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <button className="rounded-md bg-primary/15 px-2.5 py-1 text-xs font-medium text-indigo-300">All</button>
          <button className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-card">Unread</button>
          <button className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-card">Mentions</button>
          <button className="ml-auto text-xs font-medium text-indigo-400 hover:text-indigo-300">Mark all read</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {systemAlerts.map((a, i) => {
              const AIcon = alertIcon[a.type] ?? Info;
              return (
                <Card
                  key={i}
                  className="card-hover cursor-pointer border-border bg-card/50 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${a.color}1a`, color: a.color }}
                    >
                      <AIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <span className="text-[10px] text-muted-foreground">{a.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.message}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="rounded bg-card px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-card/80">
                          <Check className="mr-1 inline h-2.5 w-2.5" /> Dismiss
                        </button>
                        <button className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* More notifications */}
            {[
              { title: "Backup Completed", message: "Daily backup saved to cloud successfully", time: "3 hours ago", color: "#10b981", type: "success" },
              { title: "New Vendor Registered", message: "Quick Pack Solutions awaiting approval", time: "5 hours ago", color: "#3b82f6", type: "info" },
              { title: "Payroll Processed", message: "June payroll for 247 employees completed", time: "Yesterday", color: "#8b5cf6", type: "info" },
              { title: "System Update Available", message: "Version v1.1.0 ready to install", time: "Yesterday", color: "#f59e0b", type: "warning" },
            ].map((n, i) => {
              const NIcon = alertIcon[n.type] ?? Info;
              return (
                <Card key={`x-${i}`} className="card-hover cursor-pointer border-border bg-card/50 p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${n.color}1a`, color: n.color }}
                    >
                      <NIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border p-3">
          <Button variant="outline" className="w-full border-border bg-card text-foreground hover:bg-card/80">
            View All Notifications
          </Button>
        </div>
      </aside>
    </>
  );
}
