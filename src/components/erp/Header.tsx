"use client";

import { useERPStore } from "@/store/erp-store";
import { useSession, signOut } from "next-auth/react";
import { useNotifications, useBranches } from "@/lib/erp/hooks";
import { COMPANY } from "@/lib/erp/demo-data";
import { Button } from "@/components/ui/button";
import { getModuleById } from "@/lib/erp/modules";
import { GlobalSearch } from "./GlobalSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useState } from "react";
import {
  Bell, Menu, Sun, Moon, ChevronDown, Crown, Settings, LogOut, User,
  MessageSquare, HelpCircle, Building2, GitBranch, Zap, Plus, Star,
  Clock, Bot, Wifi,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { data: session } = useSession();
  const { activeModuleId, toggleSidebar, theme, toggleTheme, notifPanelOpen, setNotifPanelOpen, setActiveModule } = useERPStore();
  const { data: notifData } = useNotifications();
  const { data: branchData } = useBranches();
  const activeModule = getModuleById(activeModuleId);
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [showQuickActions, setShowQuickActions] = useState(false);

  const user = session?.user as any;
  const userName = user?.name || "User";
  const userRole = user?.role === "SUPER_ADMIN" ? "CEO / Owner" : user?.role || "User";
  const userAvatar = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
  const unreadCount = notifData?.unreadCount || 0;
  const branches = branchData?.branches || [];

  const quickActions = [
    { label: "New Customer", icon: User, module: "crm", color: "#3b82f6" },
    { label: "New Sales Order", icon: Plus, module: "sales", color: "#8b5cf6" },
    { label: "New Product", icon: Plus, module: "products", color: "#10b981" },
    { label: "New Work Order", icon: Plus, module: "manufacturing", color: "#f59e0b" },
    { label: "Run Payroll", icon: Plus, module: "payroll", color: "#ec4899" },
    { label: "Add User", icon: Plus, module: "user-management", color: "#06b6d4" },
  ];

  const recentlyVisited = [
    { name: "Dashboard", moduleId: "executive-dashboard" },
    { name: "CRM", moduleId: "crm" },
    { name: "Sales", moduleId: "sales" },
    { name: "Inventory", moduleId: "inventory" },
  ].slice(0, 4);

  return (
    <header className="glass-strong flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-border px-4">
      {/* Left: collapse + breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 text-muted-foreground hover:bg-card hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Breadcrumb */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="text-xs text-muted-foreground">Smart Global ERP</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">
            {activeModule?.name ?? "Dashboard"}
          </span>
          {activeModule?.number === 1 && (
            <Crown className="h-3.5 w-3.5 text-amber-400" />
          )}
        </div>

        {/* Company Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden items-center gap-2 rounded-lg border border-border bg-card/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card lg:flex">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>{COMPANY.company}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Companies</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-sm text-foreground hover:bg-card cursor-pointer">
              <Building2 className="mr-2 h-4 w-4 text-indigo-400" /> {COMPANY.company}
              <span className="ml-auto text-[10px] text-emerald-400">Active</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Branch Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden items-center gap-2 rounded-lg border border-border bg-card/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card xl:flex">
              <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
              <span className="max-w-24 truncate">{selectedBranch}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-popover border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Select Branch</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-sm text-foreground hover:bg-card cursor-pointer"
              onClick={() => setSelectedBranch("All Branches")}
            >
              <GitBranch className="mr-2 h-4 w-4 text-emerald-400" /> All Branches
            </DropdownMenuItem>
            {branches.map((b: any) => (
              <DropdownMenuItem
                key={b.id}
                className="text-sm text-foreground hover:bg-card cursor-pointer"
                onClick={() => setSelectedBranch(b.name)}
              >
                <GitBranch className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="truncate">{b.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{b.code}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center: global search */}
      <div className="hidden flex-1 max-w-md lg:block">
        <GlobalSearch />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Quick Actions */}
        <DropdownMenu open={showQuickActions} onOpenChange={setShowQuickActions}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 text-indigo-400 hover:bg-indigo-500/20"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden text-xs font-medium sm:inline">Quick Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {quickActions.map((a) => (
              <DropdownMenuItem
                key={a.label}
                className="text-sm text-foreground hover:bg-card cursor-pointer"
                onClick={() => { setActiveModule(a.module); setShowQuickActions(false); }}
              >
                <a.icon className="mr-2 h-4 w-4" style={{ color: a.color }} />
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Recently Visited */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden h-9 w-9 text-muted-foreground hover:bg-card hover:text-foreground xl:flex">
              <Clock className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Recently Visited</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {recentlyVisited.map((r) => (
              <DropdownMenuItem
                key={r.moduleId}
                className="text-sm text-foreground hover:bg-card cursor-pointer"
                onClick={() => setActiveModule(r.moduleId)}
              >
                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                {r.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Assistant */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-9 w-9 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 sm:flex"
          onClick={() => setActiveModule("ai-copilot")}
          title="AI Assistant"
        >
          <Bot className="h-4 w-4" />
        </Button>

        {/* Language Switcher — 12 languages */}
        <LanguageSwitcher />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:bg-card hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotifPanelOpen(!notifPanelOpen)}
          className="relative h-9 w-9 text-muted-foreground hover:bg-card hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Messages */}
        <Button variant="ghost" size="icon" className="relative hidden h-9 w-9 text-muted-foreground hover:bg-card hover:text-foreground sm:flex">
          <MessageSquare className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
            3
          </span>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="hidden h-9 w-9 text-muted-foreground hover:bg-card hover:text-foreground lg:flex">
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-card">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                {userAvatar}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold leading-tight text-foreground">{userName}</p>
                <p className="text-[10px] text-muted-foreground">{userRole}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                {userAvatar}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-sm text-foreground hover:bg-card focus:bg-card cursor-pointer">
              <User className="mr-2 h-4 w-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-foreground hover:bg-card focus:bg-card cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-sm text-foreground hover:bg-card focus:bg-card cursor-pointer"
              onClick={() => setActiveModule("user-management")}
            >
              <Star className="mr-2 h-4 w-4 text-amber-400" /> User Management
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <div className="px-2 py-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</p>
              <p className="text-xs font-medium text-foreground">{COMPANY.company}</p>
              <p className="text-[10px] text-muted-foreground">{COMPANY.location}</p>
              <p className="text-[10px] text-muted-foreground">{COMPANY.phone}</p>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-sm text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
