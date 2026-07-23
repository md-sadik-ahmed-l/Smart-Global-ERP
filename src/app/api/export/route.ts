// Export API — generates CSV for any entity type
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

// GET /api/export?type=customers|vendors|products|sales-orders|purchase-orders|inventory|users
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "customers";

  let rows: any[] = [];
  let filename = type;

  switch (type) {
    case "customers": {
      const customers = await db.customer.findMany({
        where: { tenantId },
        include: { salesOrders: { select: { totalAmount: true, paidAmount: true } } },
        orderBy: { createdAt: "desc" },
      });
      rows = customers.map((c) => {
        const totalValue = c.salesOrders.reduce((s, o) => s + o.totalAmount, 0);
        const due = c.salesOrders.reduce((s, o) => s + (o.totalAmount - o.paidAmount), 0);
        return {
          Code: c.code,
          Name: c.name,
          Email: c.email || "",
          Phone: c.phone || "",
          Country: c.country,
          Segment: c.segment,
          "Credit Limit": c.creditLimit,
          "Total Orders Value": totalValue,
          "Due Amount": due,
          Status: c.status,
          "Created At": c.createdAt.toISOString().slice(0, 10),
        };
      });
      break;
    }

    case "vendors": {
      const vendors = await db.vendor.findMany({
        where: { tenantId },
        include: { purchaseOrders: { select: { totalAmount: true, paidAmount: true } } },
        orderBy: { createdAt: "desc" },
      });
      rows = vendors.map((v) => {
        const purchase = v.purchaseOrders.reduce((s, o) => s + o.totalAmount, 0);
        const payment = v.purchaseOrders.reduce((s, o) => s + o.paidAmount, 0);
        return {
          Code: v.code,
          Name: v.name,
          "Contact Person": v.contactPerson || "",
          Email: v.email || "",
          Phone: v.phone || "",
          Country: v.country,
          Category: v.category || "",
          "Credit Days": v.creditDays,
          "Credit Limit": v.creditLimit,
          "Total Purchase": purchase,
          "Total Payment": payment,
          Rating: v.rating,
          Status: v.status,
        };
      });
      break;
    }

    case "products": {
      const products = await db.product.findMany({
        where: { tenantId },
        include: {
          category: true,
          brand: true,
          stockItems: { select: { quantity: true } },
        },
        orderBy: { name: "asc" },
      });
      rows = products.map((p) => {
        const totalStock = p.stockItems.reduce((s, si) => s + si.quantity, 0);
        return {
          SKU: p.sku,
          Name: p.name,
          Category: p.category?.name || "",
          Brand: p.brand?.name || "",
          Unit: p.unit,
          "Cost Price": p.costPrice,
          "Sale Price": p.salePrice,
          "Reorder Level": p.reorderLevel,
          "Total Stock": totalStock,
          "Stock Value": totalStock * p.costPrice,
          Status: p.status,
        };
      });
      break;
    }

    case "sales-orders": {
      const orders = await db.salesOrder.findMany({
        where: { tenantId },
        include: { customer: true, branch: true },
        orderBy: { orderDate: "desc" },
      });
      rows = orders.map((o) => ({
        "Order #": o.orderNumber,
        Customer: o.customer?.name || "",
        Branch: o.branch?.name || "",
        "Order Date": o.orderDate.toISOString().slice(0, 10),
        Subtotal: o.subtotal,
        Tax: o.taxAmount,
        Total: o.totalAmount,
        Paid: o.paidAmount,
        Due: o.totalAmount - o.paidAmount,
        "Payment Method": o.paymentMethod || "",
        Status: o.status,
      }));
      break;
    }

    case "purchase-orders": {
      const orders = await db.purchaseOrder.findMany({
        where: { tenantId },
        include: { vendor: true, branch: true },
        orderBy: { orderDate: "desc" },
      });
      rows = orders.map((o) => ({
        "PO #": o.poNumber,
        Vendor: o.vendor?.name || "",
        Branch: o.branch?.name || "",
        "Order Date": o.orderDate.toISOString().slice(0, 10),
        Total: o.totalAmount,
        Paid: o.paidAmount,
        Due: o.totalAmount - o.paidAmount,
        "GRN Status": o.grnStatus,
        Status: o.status,
      }));
      break;
    }

    case "inventory": {
      const products = await db.product.findMany({
        where: { tenantId },
        include: { category: true, stockItems: { include: { warehouse: true } } },
        orderBy: { name: "asc" },
      });
      rows = products.flatMap((p) =>
        p.stockItems.map((si) => ({
          SKU: p.sku,
          Product: p.name,
          Category: p.category?.name || "",
          Warehouse: si.warehouse.name,
          Quantity: si.quantity,
          Unit: p.unit,
          "Cost Price": p.costPrice,
          "Stock Value": si.quantity * p.costPrice,
        }))
      );
      break;
    }

    case "users": {
      // Only Super Admin can export users
      if ((session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Only Super Admin can export user data" }, { status: 403 });
      }
      const users = await db.user.findMany({
        where: { tenantId },
        include: { branch: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      rows = users.map((u) => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Department: u.department || "",
        Designation: u.designation || "",
        Branch: u.branch?.name || "",
        Phone: u.phone || "",
        Status: u.status,
        "Last Login": u.lastLoginAt ? u.lastLoginAt.toISOString().slice(0, 19) : "Never",
        "Created At": u.createdAt.toISOString().slice(0, 10),
      }));
      break;
    }

    default:
      return NextResponse.json({ error: `Unknown export type: ${type}` }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "No data to export" }, { status: 404 });
  }

  // Convert to CSV
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = (row as any)[h];
        // Escape quotes and wrap in quotes if contains comma/quote/newline
        const str = String(val ?? "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(",")
    ),
  ];
  const csv = csvLines.join("\n");

  // Return as downloadable CSV
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
