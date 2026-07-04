"use client";

import { useState } from "react";
import { CreditCard, Search, Plus, Minus, Trash2, ShoppingCart, Percent, User, X, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { posProducts, fmtBDT, COMPANY } from "@/lib/erp/demo-data";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export function POSModule() {
  const [cart, setCart] = useState<CartItem[]>([
    { id: "P1", name: "T-Shirt (White, M)", price: 320, qty: 2 },
    { id: "P5", name: "Cap (Red)", price: 240, qty: 1 },
  ]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const categories = ["All", "Garments", "Footwear", "Accessories"];

  const filtered = posProducts.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p: (typeof posProducts)[number]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const handleCheckout = () => {
    toast.success(`Order placed successfully! Total: ${fmtBDT(total)}`);
    setCart([]);
    setShowCheckout(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Product grid */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">POS Terminal</h1>
              <p className="text-xs text-muted-foreground">Counter 1 · {COMPANY.company}, Chittagong HQ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <Percent className="mr-1.5 h-4 w-4" /> Discount
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80">
              <User className="mr-1.5 h-4 w-4" /> Walk-in Customer
            </Button>
          </div>
        </div>

        {/* Category tabs + search */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-card/80"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-48">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              className="h-9 border-border bg-card pl-9 text-sm"
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="card-hover flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-4xl">
                {p.image}
              </div>
              <div className="w-full">
                <p className="line-clamp-2 text-xs font-medium text-foreground">{p.name}</p>
                <p className="mt-1 text-sm font-bold text-indigo-400">{fmtBDT(p.price)}</p>
                <p className="text-[10px] text-muted-foreground">{p.stock} in stock</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      <Card className="flex w-80 flex-shrink-0 flex-col border-border bg-card p-4 xl:w-96">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground">Current Order</h3>
          </div>
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-400">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingCart className="mb-2 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Cart is empty</p>
              <p className="text-xs text-muted-foreground/70">Tap a product to add</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtBDT(item.price)} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, -1)} className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-card hover:text-foreground">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold text-foreground">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-card hover:text-foreground">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="flex h-6 w-6 items-center justify-center rounded text-rose-400 hover:bg-rose-500/10">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + checkout */}
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{fmtBDT(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">VAT (5%)</span>
            <span className="font-medium text-foreground">{fmtBDT(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-indigo-400">{fmtBDT(total)}</span>
          </div>

          <Button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="h-11 w-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            <Wallet className="mr-2 h-4 w-4" /> Checkout
          </Button>
        </div>
      </Card>

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCheckout(false)}>
          <Card className="w-full max-w-md border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Payment</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCheckout(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4 rounded-lg border border-border bg-card/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Total Amount Due</p>
              <p className="mt-1 text-3xl font-bold text-indigo-400">{fmtBDT(total)}</p>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {["Cash", "Card", "Mobile"].map((m, i) => (
                <button
                  key={m}
                  className={cn(
                    "rounded-lg border p-3 text-xs font-medium transition-colors",
                    i === 0
                      ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                      : "border-border bg-card text-foreground hover:bg-card/80"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <Button onClick={handleCheckout} className="h-11 w-full bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700">
              Confirm Payment · {fmtBDT(total)}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
