"use client";

import { useERPStore } from "@/store/erp-store";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/lib/erp/hooks";
import { COMPANY } from "@/lib/erp/demo-data";
import { Button } from "@/components/ui/button";
import { getModuleById } from "@/lib/erp/modules";
import { GlobalSearch } from "./GlobalSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Search, Bell, Menu, Sun, Moon, Globe, ChevronDown,
  Crown, Settings, LogOut, User, MessageSquare, HelpCircle,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function Header() {
  const { data: session } = useSession();
  const { activeModuleId, toggleSidebar, theme, toggleTheme, notifPanelOpen, setNotifPanelOpen } = useERPStore();
  const { data: notifData } = useNotifications();
  const activeModule = getModuleById(activeModuleId);

  const user = session?.user as any;
  const userName = user?.name || "User";
  const userRole = user?.role === "SUPER_ADMIN" ? "CEO / Owner" : user?.role || "User";
  const userAvatar = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("");
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-border bg-card/40 px-4 backdrop-blur-sm">
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
      </div>

      {/* Center: global search */}
      <div className="hidden flex-1 max-w-md lg:block">
        <GlobalSearch />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Language Switcher — 12 languages, translates entire ERP */}
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
        <Button variant="ghost" size="icon" className="hidden h-9 w-9 text-muted-foreground hover:bg-card hover:text-foreground sm:flex">
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
            <DropdownMenuItem className="text-sm text-foreground hover:bg-card focus:bg-card cursor-pointer">
              <Crown className="mr-2 h-4 w-4 text-amber-400" /> Upgrade Plan
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
