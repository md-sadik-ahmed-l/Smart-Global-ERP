// Global Search API — searches across all entities in tenant
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

// GET /api/search?q=query
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }

  // Search across all major entities types in parallel
  const [customers, vendors, products, salesOrders, purchaseOrders, users, employees] = await Promise.all([
    db.customer.findMany({
      where: { tenantId, OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { code: { contains: q } },
      ]},
      take: 5,
      select: { id: true, name: true, email: true, phone: true, code: true, status: true, segment: true },
    }),
    db.vendor.findMany({
      where: { tenantId, OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { code: { contains: q } },
        { contactPerson: { contains: q } },
      ]},
      take: 5,
      select: { id: true, name: true, email: true, phone: true, code: true, status: true, category: true, contactPerson: true },
    }),
    db.product.findMany({
      where: { tenantId, OR: [
        { name: { contains: q } },
        { sku: { contains: q } },
        { barcode: { contains: q } },
      ]},
      take: 5,
      select: { id: true, name: true, sku: true, salePrice: true, status: true, category: { select: { name: true } } },
    }),
    db.salesOrder.findMany({
      where: { tenantId, OR: [
        { orderNumber: { contains: q } },
        { customer: { name: { contains: q } } },
      ]},
      take: 5,
      select: { id: true, orderNumber: true, totalAmount: true, status: true, orderDate: true, customer: { select: { name: true } } },
    }),
    db.purchaseOrder.findMany({
      where: { tenantId, OR: [
        { poNumber: { contains: q } },
        { vendor: { name: { contains: q } } },
      ]},
      take: 5,
      select: { id: true, poNumber: true, totalAmount: true, status: true, orderDate: true, vendor: { select: { name: true } } },
    }),
    db.user.findMany({
      where: { tenantId, OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ]},
      take: 5,
      select: { id: true, name: true, email: true, role: true, status: true, avatar: true },
    }),
    db.employee.findMany({
      where: { tenantId, OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { employeeCode: { contains: q } },
        { department: { contains: q } },
      ]},
      take: 5,
      select: { id: true, name: true, employeeCode: true, department: true, designation: true, status: true },
    }),
  ]);

  // Format results with type + icon metadata
  const results = [
    ...customers.map((c) => ({
      type: "customer", id: c.id, title: c.name, subtitle: `${c.code} · ${c.email || c.phone || "—"}`,
      status: c.status, badge: c.segment, icon: "Users", color: "#3b82f6",
    })),
    ...vendors.map((v) => ({
      type: "vendor", id: v.id, title: v.name, subtitle: `${v.code} · ${v.contactPerson || v.email || "—"}`,
      status: v.status, badge: v.category, icon: "Truck", color: "#8b5cf6",
    })),
    ...products.map((p) => ({
      type: "product", id: p.id, title: p.name, subtitle: `${p.sku} · ৳${p.salePrice}`,
      status: p.status, badge: p.category?.name, icon: "Package", color: "#10b981",
    })),
    ...salesOrders.map((o) => ({
      type: "sales-order", id: o.id, title: o.orderNumber, subtitle: `${o.customer?.name || "—"} · ৳${o.totalAmount}`,
      status: o.status, badge: "Order", icon: "ShoppingCart", color: "#f59e0b",
    })),
    ...purchaseOrders.map((o) => ({
      type: "purchase-order", id: o.id, title: o.poNumber, subtitle: `${o.vendor?.name || "—"} · ৳${o.totalAmount}`,
      status: o.status, badge: "PO", icon: "FileText", color: "#ec4899",
    })),
    ...users.map((u) => ({
      type: "user", id: u.id, title: u.name, subtitle: u.email,
      status: u.status, badge: u.role, icon: "UserCog", color: "#06b6d4",
    })),
    ...employees.map((e) => ({
      type: "employee", id: e.id, title: e.name, subtitle: `${e.employeeCode} · ${e.department || "—"}`,
      status: e.status, badge: e.designation, icon: "Users", color: "#14b8a6",
    })),
  ];

  return NextResponse.json({ results, total: results.length, query: q });
}
