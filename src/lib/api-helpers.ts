import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Auth helper
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Format helpers
export const fmtBDT = (n: number) => "৳" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// Zod schemas for validation
export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().default("Bangladesh"),
  segment: z.enum(["ENTERPRISE", "SME", "RETAIL", "VIP"]).default("SME"),
  creditLimit: z.number().min(0).default(0),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().default("Bangladesh"),
  category: z.string().optional(),
  creditDays: z.coerce.number().min(0).default(30),
  creditLimit: z.coerce.number().min(0).default(0),
  rating: z.coerce.number().min(0).max(5).default(4.0),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unit: z.string().default("pcs"),
  costPrice: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(10),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"]).default("ACTIVE"),
});

export const salesOrderSchema = z.object({
  customerId: z.string().min(1),
  branchId: z.string().optional(),
  deliveryDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().min(1),
    unitPrice: z.coerce.number().min(0),
  })).min(1, "At least one item is required"),
});

export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1),
  branchId: z.string().optional(),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().min(1),
    unitPrice: z.coerce.number().min(0),
  })).min(1, "At least one item is required"),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  adjustmentType: z.enum(["IN", "OUT", "TRANSFER", "DAMAGE", "RETURN"]),
  quantity: z.coerce.number().int(),
  reason: z.string().optional(),
});

// Audit log helper (non-blocking — never fail the main operation)
export async function logAudit(userId: string | undefined, action: string, entity: string, entityId: string | undefined, details: string) {
  try {
    await db.auditLog.create({
      data: { userId, action, entity, entityId, details },
    });
  } catch (e) {
    console.error("Audit log failed (non-blocking):", e);
  }
}
