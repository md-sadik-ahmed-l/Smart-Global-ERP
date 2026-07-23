"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Truck, Package, ShoppingCart, FileText, UserCog, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useERPStore } from "@/store/erp-store";

const iconMap: Record<string, any> = {
  Users, Truck, Package, ShoppingCart, FileText, UserCog,
};

const typeLabels: Record<string, string> = {
  customer: "Customer",
  vendor: "Vendor",
  product: "Product",
  "sales-order": "Sales Order",
  "purchase-order": "Purchase Order",
  user: "User",
  employee: "Employee",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  const results = data?.results || [];

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search customers, vendors, products, orders..."
        className="h-9 border-border bg-card pl-9 pr-8 text-sm placeholder:text-muted-foreground"
      />
      {query && (
        <button
          onClick={() => { setQuery(""); setIsOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && debouncedQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto rounded-xl border border-border p-2 shadow-2xl"
          >
            {isFetching && (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
              </div>
            )}

            {!isFetching && results.length === 0 && (
              <div className="py-8 text-center">
                <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No results for "{debouncedQuery}"</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try searching by name, code, email, or phone</p>
              </div>
            )}

            {!isFetching && results.length > 0 && (
              <>
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-0.5">
                  {results.map((r: any, i: number) => {
                    const Icon = iconMap[r.icon] || Search;
                    return (
                      <button
                        key={`${r.type}-${r.id}-${i}`}
                        onClick={() => {
                          setIsOpen(false);
                          // Navigate to relevant module (future: could deep-link to entity)
                          const { setActiveModule } = useERPStore.getState();
                          const moduleMap: Record<string, string> = {
                            customer: "crm",
                            vendor: "buyers-suppliers",
                            product: "products",
                            "sales-order": "sales",
                            "purchase-order": "purchase",
                            user: "user-management",
                            employee: "hr",
                          };
                          const targetModule = moduleMap[r.type];
                          if (targetModule) setActiveModule(targetModule);
                        }}
                        className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/[0.05]"
                      >
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${r.color}15`, color: r.color }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="rounded bg-card px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                            {typeLabels[r.type] || r.type}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
