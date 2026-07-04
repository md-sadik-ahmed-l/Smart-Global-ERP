"use client";

import { useERPStore } from "@/store/erp-store";
import { LoginScreen } from "@/components/erp/LoginScreen";
import { ERPApp } from "@/components/erp/ERPApp";

export default function Home() {
  const isAuthenticated = useERPStore((s) => s.isAuthenticated);

  return isAuthenticated ? <ERPApp /> : <LoginScreen />;
}
