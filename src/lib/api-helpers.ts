import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import { z } from "zod";

// ==================== AUTH & TENANT ====================

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message = "Insufficient permissions") {
  return NextResponse.json({ error: message }, { status: 403 });
}

// Get tenant-scoped user info from session
export function getTenantContext(session: any) {
  return {
    userId: session?.user?.id as string,
    tenantId: session?.user?.tenantId as string,
    role: session?.user?.role as string,
    branchId: session?.user?.branchId as string | null,
  };
}

// ==================== RBAC PERMISSION CHECK ====================

// Super admin bypasses all checks
const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

export async function requirePermission(session: any, module: string, action: string): Promise<boolean> {
  if (!session?.user) return false;
  const role = (session.user as any).role;
  if (role === SUPER_ADMIN_ROLE) return true;

  // Check cached permissions
  const userId = (session.user as any).id;
  const cacheKey = `perms:${userId}`;
  let permissions = await cache.get<string[]>(cacheKey);

  if (permissions === null) {
    // Load from DB
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roleRef: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    permissions = user?.roleRef?.permissions?.map((rp) => `${rp.permission.module}:${rp.permission.action}`) ?? [];
    await cache.set(cacheKey, permissions, 300); // cache for 5 minutes
  }

  return permissions.includes(`${module}:${action}`);
}

export async function checkPermission(session: any, module: string, action: string) {
  const has = await requirePermission(session, module, action);
  if (!has) return forbidden(`You need ${module}:${action} permission`);
  return null;
}

// ==================== TENANT ISOLATION ====================

// All DB queries must be scoped to tenantId
// Helper to build tenant-scoped where clauses
export function tenantScope(tenantId: string, extra: any = {}) {
  return { tenantId, ...extra };
}

// ==================== AUDIT LOG ====================

export async function logAudit(
  tenantId: string | undefined,
  userId: string | undefined,
  action: string,
  entity: string,
  entityId: string | undefined,
  details: string,
  req?: NextRequest
) {
  try {
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress: req?.headers.get("x-forwarded-for") || req?.headers.get("x-real-ip") || null,
        userAgent: req?.headers.get("user-agent") || null,
      },
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}

// ==================== VALIDATION SCHEMAS ====================

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().default("Bangladesh"),
  segment: z.enum(["ENTERPRISE", "SME", "RETAIL", "VIP"]).default("SME"),
  creditLimit: z.coerce.number().min(0).default(0),
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
  productType: z.enum(["RAW", "SEMI_FINISHED", "FINISHED", "SERVICE"]).default("FINISHED"),
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

// Manufacturing schemas
export const bomSchema = z.object({
  name: z.string().min(2),
  productId: z.string().min(1),
  quantity: z.coerce.number().min(0.001).default(1),
  unit: z.string().default("pcs"),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().min(0.001),
    unit: z.string(),
    isOptional: z.boolean().default(false),
  })).min(1, "BOM must have at least one component"),
});

export const workOrderSchema = z.object({
  bomId: z.string().optional(),
  productId: z.string().min(1),
  branchId: z.string().optional(),
  supervisorId: z.string().optional(),
  plannedQty: z.coerce.number().min(1),
  plannedEndDate: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  notes: z.string().optional(),
});

export const productionLogSchema = z.object({
  workOrderId: z.string().min(1),
  producedQty: z.coerce.number().min(0),
  rejectedQty: z.coerce.number().min(0).default(0),
  shift: z.string().optional(),
  station: z.string().optional(),
  notes: z.string().optional(),
});

export const qcCheckSchema = z.object({
  workOrderId: z.string().min(1),
  checkType: z.enum(["INLINE", "FINAL", "PRE_SHIPMENT"]),
  sampleSize: z.coerce.number().min(1),
  passedQty: z.coerce.number().min(0),
  failedQty: z.coerce.number().min(0),
  defectType: z.string().optional(),
  status: z.enum(["PASSED", "FAILED", "REWORK"]).default("PASSED"),
  notes: z.string().optional(),
});

// Payroll schemas
export const salaryStructureSchema = z.object({
  name: z.string().min(2),
  basicSalary: z.coerce.number().min(0),
  houseRent: z.coerce.number().min(0).default(0),
  medicalAllowance: z.coerce.number().min(0).default(0),
  conveyance: z.coerce.number().min(0).default(0),
  foodAllowance: z.coerce.number().min(0).default(0),
  specialAllowance: z.coerce.number().min(0).default(0),
  providentFund: z.coerce.number().min(0).default(0),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
});

export const employeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  branchId: z.string().optional(),
  joinDate: z.string(),
  salaryStructureId: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  nidNumber: z.string().optional(),
});

export const payrollRunSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2099),
});
