"use client";

import { useERPStore } from "@/store/erp-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkAllRead } from "@/lib/erp/hooks";
import { Bell, X, Check, AlertTriangle, Info, CheckCircle2, XCircle, Settings } from "lucide-react";

const alertIcon: Record<string, any> = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function NotificationPanel() {
  const { setNotifPanelOpen } = useERPStore();
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setNotifPanelOpen(false)}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-indigo-400" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
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
          <button className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-card">Unread ({unreadCount})</button>
          <button className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-card">Mentions</button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="ml-auto text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bell className="mb-2 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => {
                const NIcon = alertIcon[n.type] ?? Info;
                const color =
                  n.type === "success" ? "#10b981" :
                  n.type === "warning" ? "#f59e0b" :
                  n.type === "error" ? "#ef4444" : "#3b82f6";
                return (
                  <Card
                    key={n.id}
                    className={`card-hover cursor-pointer border-border bg-card/50 p-3 ${!n.isRead ? "border-l-2 border-l-indigo-500" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${color}1a`, color }}
                      >
                        <NIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                        {!n.isRead && (
                          <div className="mt-2 flex items-center gap-2">
                            <button className="rounded bg-card px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-card/80">
                              <Check className="mr-1 inline h-2.5 w-2.5" /> Mark read
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
