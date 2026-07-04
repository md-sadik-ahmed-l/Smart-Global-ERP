"use client";

import { create } from "zustand";

interface ERPUser {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

interface ERPState {
  // Auth
  isAuthenticated: boolean;
  user: ERPUser | null;
  login: () => void;
  logout: () => void;

  // Navigation
  activeModuleId: string;
  setActiveModule: (id: string) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Global search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Notifications panel
  notifPanelOpen: boolean;
  setNotifPanelOpen: (open: boolean) => void;
}

export const useERPStore = create<ERPState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  login: () =>
    set({
      isAuthenticated: true,
      user: {
        name: "Mohammad Sayem",
        role: "CEO / Owner",
        email: "sayem@smartwebstudio.com",
        avatar: "MS",
      },
    }),
  logout: () => set({ isAuthenticated: false, user: null, activeModuleId: "executive-dashboard" }),

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
