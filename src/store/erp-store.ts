"use client";

import { create } from "zustand";

// Note: We use next-auth/react's useSession for real auth state in components,
// but keep this Zustand store for UI-only state (active module, sidebar, etc.)

interface ERPState {
  activeModuleId: string;
  setActiveModule: (id: string) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  theme: "dark" | "light";
  toggleTheme: () => void;

  notifPanelOpen: boolean;
  setNotifPanelOpen: (open: boolean) => void;
}

export const useERPStore = create<ERPState>((set) => ({
  activeModuleId: "executive-dashboard",
  setActiveModule: (id) => set({ activeModuleId: id }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  theme: "dark",
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

  notifPanelOpen: false,
  setNotifPanelOpen: (open) => set({ notifPanelOpen: open }),
}));
