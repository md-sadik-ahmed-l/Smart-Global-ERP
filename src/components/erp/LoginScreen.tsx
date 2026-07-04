"use client";

import { useERPStore } from "@/store/erp-store";
import { COMPANY } from "@/lib/erp/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Crown, Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Globe,
  TrendingUp, Users, Package, Zap, Eye, EyeOff, Phone, MapPin,
} from "lucide-react";

export function LoginScreen() {
  const login = useERPStore((s) => s.login);
  const [email, setEmail] = useState("sayem@smartwebstudio.com");
  const [password, setPassword] = useState("smartglobal");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login();
      setLoading(false);
    }, 600);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: Branding hero */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0a0f1f] p-10 lg:flex">
        {/* Decorative grid pattern + glow */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{COMPANY.name}</h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {COMPANY.tagline}
            </p>
          </div>
        </div>

        <div className="relative z-10 my-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-indigo-300">
              Enterprise Command Center · 50 Modules
            </span>
          </div>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Run your entire
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              enterprise from one place
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Smart Global ERP unifies sales, purchase, inventory, HR, finance,
            POS, manufacturing, multi-company, AI insights and 40+ more modules
            into a single real-time cockpit built for fast-growing businesses.
          </p>

          {/* Feature pills */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: TrendingUp, label: "Real-Time Analytics", color: "#3b82f6" },
              { icon: Users, label: "CRM & Customer Hub", color: "#8b5cf6" },
              { icon: Package, label: "Multi-Warehouse", color: "#10b981" },
              { icon: Zap, label: "AI Automation", color: "#f59e0b" },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card/50 p-3"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${f.color}1a`, color: f.color }}
                >
                  <f.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>ISO 27001 · GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            <span>{COMPANY.version}</span>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">{COMPANY.name}</h1>
              <p className="text-xs text-muted-foreground">{COMPANY.tagline}</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="text-[11px] font-medium text-indigo-300">Demo Access</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back 👋</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your <span className="font-medium text-foreground">{COMPANY.company}</span> account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 border-border bg-card pl-10 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-border bg-card pl-10 pr-10 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-border bg-card text-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-300">
              Demo Credentials (pre-filled)
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Email: <span className="font-mono text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Password: <span className="font-mono text-foreground">{password}</span>
            </p>
          </div>

          {/* Owner footer */}
          <div className="mt-6 border-t border-border pt-6 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              Owned by <span className="font-semibold text-foreground">{COMPANY.owner}</span>
            </p>
            <div className="mt-1.5 flex flex-col gap-1 text-[11px]">
              <p className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> {COMPANY.phone}
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {COMPANY.location}
              </p>
            </div>
            <p className="mt-3 text-center text-[10px] text-muted-foreground/70">
              © 2026 {COMPANY.company}. All rights reserved. {COMPANY.version}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
