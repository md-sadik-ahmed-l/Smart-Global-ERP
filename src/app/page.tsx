"use client";

import { useSession } from "next-auth/react";
import { LoginScreen } from "@/components/erp/LoginScreen";
import { ERPApp } from "@/components/erp/ERPApp";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading Smart Global ERP...</p>
        </div>
      </div>
    );
  }

  return session?.user ? <ERPApp /> : <LoginScreen />;
}
