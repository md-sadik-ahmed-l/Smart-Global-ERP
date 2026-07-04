// Smart Global ERP — Seed script
// Run: bun run db:seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Smart Global ERP database...");

  // ---------- 1. Branches & Warehouses ----------
  const branches = await Promise.all([
    db.branch.create({ data: { name: "Chittagong HQ", code: "CTG-HQ", address: "South Kulsi, Chittagong", phone: "01711772407", status: "active" } }),
    db.branch.create({ data: { name: "Dhaka North", code: "DHK-N", address: "Gulshan, Dhaka", status: "active" } }),
    db.branch.create({ data: { name: "Dhaka South", code: "DHK-S", address: "Dhanmondi, Dhaka", status: "active" } }),
    db.branch.create({ data: { name: "Sylhet", code: "SYL", address: "Zindabazar, Sylhet", status: "active" } }),
    db.branch.create({ data: { name: "Khulna", code: "KHL", address: "New Market, Khulna", status: "warning" } }),
  ]);

  const warehouses = await Promise.all([
    db.warehouse.create({ data: { name: "Chittagong Main", code: "WH-CTG-1", branchId: branches[0].id, capacity: 5000, status: "active" } }),
    db.warehouse.create({ data: { name: "Dhaka North WH", code: "WH-DHN-1", branchId: branches[1].id, capacity: 3000, status: "active" } }),
    db.warehouse.create({ data: { name: "Dhaka South WH", code: "WH-DHS-1", branchId: branches[2].id, capacity: 2000, status: "active" } }),
    db.warehouse.create({ data: { name: "Sylhet Branch WH", code: "WH-SYL-1", branchId: branches[3].id, capacity: 800, status: "active" } }),
  ]);

  // ---------- 2. Users (single real owner account) ----------
  const passwordHash = await bcrypt.hash("smartglobal", 10);
  const owner = await db.user.create({
    data: {
      email: "sayem@smartwebstudio.com",
      name: "Mohammad Sayem",
      passwordHash,
      role: "SUPER_ADMIN",
      phone: "01711772407",
      avatar: "MS",
      department: "Management",
      designation: "CEO / Owner",
      branchId: branches[0].id,
      status: "ACTIVE",
    },
  });
  const users = [owner];

  // ---------- 3. Categories & Brands ----------
  const categories = await Promise.all([
    db.category.create({ data: { name: "Raw Material" } }),
    db.category.create({ data: { name: "Machinery" } }),
    db.category.create({ data: { name: "Packaging" } }),
    db.category.create({ data: { name: "Office Supply" } }),
    db.category.create({ data: { name: "Logistics" } }),
    db.category.create({ data: { name: "Finished Goods" } }),
  ]);

  const brands = await Promise.all([
    db.brand.create({ data: { name: "Local" } }),
    db.brand.create({ data: { name: "Coats" } }),
    db.brand.create({ data: { name: "Juki" } }),
    db.brand.create({ data: { name: "Toyo" } }),
    db.brand.create({ data: { name: "SmartWear" } }),
  ]);

  // ---------- 4. Products ----------
  const products = await Promise.all([
    db.product.create({ data: { sku: "FAB-CTN-001", name: "Cotton Fabric Roll", categoryId: categories[0].id, brandId: brands[0].id, unit: "meter", costPrice: 900, salePrice: 1200, reorderLevel: 200, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "THR-POL-002", name: "Polyester Thread", categoryId: categories[0].id, brandId: brands[1].id, unit: "kg", costPrice: 1100, salePrice: 1450, reorderLevel: 100, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "MCH-SW-003", name: "Sewing Machine", categoryId: categories[1].id, brandId: brands[2].id, unit: "pcs", costPrice: 85000, salePrice: 100000, reorderLevel: 5, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "PKG-CB-L-004", name: "Carton Box (Large)", categoryId: categories[2].id, brandId: brands[0].id, unit: "pcs", costPrice: 35, salePrice: 45, reorderLevel: 500, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "INK-PR-005", name: "Printing Ink", categoryId: categories[0].id, brandId: brands[3].id, unit: "liter", costPrice: 950, salePrice: 1200, reorderLevel: 100, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "TSR-M-W-006", name: "T-Shirt (M, White)", categoryId: categories[5].id, brandId: brands[4].id, unit: "pcs", costPrice: 220, salePrice: 320, reorderLevel: 200, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "PKG-TP-007", name: "Tag Pin", categoryId: categories[2].id, brandId: brands[0].id, unit: "box", costPrice: 150, salePrice: 200, reorderLevel: 100, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "TSR-B-L-008", name: "T-Shirt (Black, L)", categoryId: categories[5].id, brandId: brands[4].id, unit: "pcs", costPrice: 250, salePrice: 350, reorderLevel: 200, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "JNS-B-32-009", name: "Jeans (Blue, 32)", categoryId: categories[5].id, brandId: brands[4].id, unit: "pcs", costPrice: 700, salePrice: 980, reorderLevel: 100, status: "ACTIVE" } }),
    db.product.create({ data: { sku: "SNK-42-010", name: "Sneakers (Size 42)", categoryId: categories[5].id, brandId: brands[4].id, unit: "pcs", costPrice: 1100, salePrice: 1450, reorderLevel: 50, status: "ACTIVE" } }),
  ]);

  // ---------- 5. Stock ----------
  await Promise.all([
    db.stockItem.create({ data: { productId: products[0].id, warehouseId: warehouses[0].id, quantity: 1240 } }),
    db.stockItem.create({ data: { productId: products[1].id, warehouseId: warehouses[0].id, quantity: 86 } }),
    db.stockItem.create({ data: { productId: products[2].id, warehouseId: warehouses[1].id, quantity: 24 } }),
    db.stockItem.create({ data: { productId: products[3].id, warehouseId: warehouses[2].id, quantity: 0 } }),
    db.stockItem.create({ data: { productId: products[4].id, warehouseId: warehouses[0].id, quantity: 320 } }),
    db.stockItem.create({ data: { productId: products[5].id, warehouseId: warehouses[1].id, quantity: 1820 } }),
    db.stockItem.create({ data: { productId: products[6].id, warehouseId: warehouses[3].id, quantity: 48 } }),
    db.stockItem.create({ data: { productId: products[7].id, warehouseId: warehouses[1].id, quantity: 1240 } }),
    db.stockItem.create({ data: { productId: products[8].id, warehouseId: warehouses[0].id, quantity: 860 } }),
    db.stockItem.create({ data: { productId: products[9].id, warehouseId: warehouses[1].id, quantity: 124 } }),
  ]);

  // ---------- 6. Customers ----------
  const customers = await Promise.all([
    db.customer.create({ data: { code: "CUS-001", name: "Apex Garments Ltd", email: "info@apexgarments.com", phone: "+8801711-100100", country: "Bangladesh", segment: "ENTERPRISE", creditLimit: 2000000, status: "ACTIVE" } }),
    db.customer.create({ data: { code: "CUS-002", name: "Rahim Traders", email: "rahim@traders.com", phone: "+8801711-200200", country: "Bangladesh", segment: "SME", creditLimit: 500000, status: "ACTIVE" } }),
    db.customer.create({ data: { code: "CUS-003", name: "Karim Enterprise", email: "karim@enterprise.com", phone: "+8801711-300300", country: "Bangladesh", segment: "SME", creditLimit: 400000, status: "ACTIVE" } }),
    db.customer.create({ data: { code: "CUS-004", name: "Sonali Textile", email: "info@sonalitextile.com", phone: "+8801711-400400", country: "Bangladesh", segment: "ENTERPRISE", creditLimit: 3000000, status: "ACTIVE" } }),
    db.customer.create({ data: { code: "CUS-005", name: "Mega Mart BD", email: "info@megamartbd.com", phone: "+8801711-500500", country: "Bangladesh", segment: "RETAIL", creditLimit: 300000, status: "ACTIVE" } }),
    db.customer.create({ data: { code: "CUS-006", name: "Global Imports Inc", email: "info@globalimports.com", phone: "+1-555-0100", country: "USA", segment: "ENTERPRISE", creditLimit: 5000000, status: "ACTIVE" } }),
    db.customer.create({ data: { code: "CUS-007", name: "Nila Fashion House", email: "nila@fashion.com", phone: "+8801711-600600", country: "Bangladesh", segment: "SME", creditLimit: 250000, status: "ACTIVE" } }),
  ]);

  // ---------- 7. Vendors ----------
  const vendors = await Promise.all([
    db.vendor.create({ data: { code: "VND-001", name: "Asian Textiles Ltd", contactPerson: "Anwar Hossain", email: "anwar@asiantextiles.com", phone: "+8801711-123456", country: "Bangladesh", category: "Raw Materials", creditDays: 30, creditLimit: 2000000, rating: 4.8, status: "ACTIVE" } }),
    db.vendor.create({ data: { code: "VND-002", name: "Global Traders BD", contactPerson: "Rafiq Ahmed", email: "rafiq@globaltraders.com", phone: "+8801711-234567", country: "Bangladesh", category: "Machinery", creditDays: 45, creditLimit: 1500000, rating: 4.6, status: "ACTIVE" } }),
    db.vendor.create({ data: { code: "VND-003", name: "Smart Suppliers Co", contactPerson: "Sabina Yeasmin", email: "sabina@smartsuppliers.com", phone: "+8801711-345678", country: "India", category: "Packaging", creditDays: 30, creditLimit: 1000000, rating: 4.4, status: "ACTIVE" } }),
    db.vendor.create({ data: { code: "VND-004", name: "Mega Industries Inc", contactPerson: "John Peterson", email: "john@megaindustries.com", phone: "+1-555-0142", country: "USA", category: "Machinery", creditDays: 60, creditLimit: 1500000, rating: 4.5, status: "ACTIVE" } }),
    db.vendor.create({ data: { code: "VND-005", name: "Sonali Imports Ltd", contactPerson: "Karim Uddin", email: "karim@sonaliimports.com", phone: "+8801711-456789", country: "Bangladesh", category: "Raw Materials", creditDays: 30, creditLimit: 800000, rating: 4.2, status: "ACTIVE" } }),
    db.vendor.create({ data: { code: "VND-006", name: "Dubai Trade Hub", contactPerson: "Ahmed Al Rashid", email: "ahmed@dubaitrade.ae", phone: "+971-50-1234567", country: "UAE", category: "Logistics", creditDays: 45, creditLimit: 1000000, rating: 4.7, status: "ACTIVE" } }),
    db.vendor.create({ data: { code: "VND-007", name: "London Exports Plc", contactPerson: "Sarah Williams", email: "sarah@londonexports.co.uk", phone: "+44-20-7946-0958", country: "UK", category: "Office Supply", creditDays: 60, creditLimit: 600000, rating: 4.3, status: "ACTIVE" } }),
    db.vendor.create({ data: { code: "VND-008", name: "Quick Pack Solutions", contactPerson: "Imran Khan", email: "imran@quickpack.com", phone: "+8801711-567890", country: "Bangladesh", category: "Packaging", creditDays: 30, creditLimit: 400000, rating: 4.1, status: "PENDING" } }),
    db.vendor.create({ data: { code: "VND-009", name: "Tech Bazaar Online", contactPerson: "Ramesh Patel", email: "ramesh@techbazaar.in", phone: "+91-98765-43210", country: "India", category: "Office Supply", creditDays: 30, creditLimit: 300000, rating: 3.9, status: "INACTIVE" } }),
    db.vendor.create({ data: { code: "VND-010", name: "Asian Foods Export", contactPerson: "Mohammed Ali", email: "ali@asianfoods.com", phone: "+8801711-678901", country: "Bangladesh", category: "Raw Materials", creditDays: 30, creditLimit: 250000, rating: 3.5, status: "BLOCKED" } }),
  ]);

  // ---------- 8. Sales Orders ----------
  const now = new Date();
  const salesOrders = [
    { orderNumber: "ORD-2841", customerId: customers[0].id, branchId: branches[0].id, salesRepId: users[0].id, orderDate: now, subtotal: 233333, taxAmount: 11667, totalAmount: 245000, paidAmount: 0, paymentMethod: "Credit", status: "PROCESSING" },
    { orderNumber: "ORD-2840", customerId: customers[1].id, branchId: branches[0].id, salesRepId: users[0].id, orderDate: now, subtotal: 172857, taxAmount: 9143, totalAmount: 182000, paidAmount: 182000, paymentMethod: "Cash", status: "COMPLETED" },
    { orderNumber: "ORD-2839", customerId: customers[2].id, branchId: branches[1].id, salesRepId: users[0].id, orderDate: new Date(now.getTime() - 86400000), subtotal: 91667, taxAmount: 4833, totalAmount: 96500, paidAmount: 0, paymentMethod: "Bank", status: "PENDING" },
    { orderNumber: "ORD-2838", customerId: customers[3].id, branchId: branches[1].id, salesRepId: users[0].id, orderDate: new Date(now.getTime() - 86400000), subtotal: 296667, taxAmount: 15333, totalAmount: 312000, paidAmount: 156000, paymentMethod: "Credit", status: "SHIPPED" },
    { orderNumber: "ORD-2837", customerId: customers[4].id, branchId: branches[0].id, salesRepId: users[0].id, orderDate: new Date(now.getTime() - 86400000 * 2), subtotal: 74571, taxAmount: 3829, totalAmount: 78400, paidAmount: 78400, paymentMethod: "Online", status: "COMPLETED" },
    { orderNumber: "ORD-2836", customerId: customers[5].id, branchId: branches[0].id, salesRepId: users[0].id, orderDate: new Date(now.getTime() - 86400000 * 2), subtotal: 498095, taxAmount: 25905, totalAmount: 524000, paidAmount: 524000, paymentMethod: "Bank", status: "PROCESSING" },
    { orderNumber: "ORD-2835", customerId: customers[6].id, branchId: branches[0].id, salesRepId: users[0].id, orderDate: new Date(now.getTime() - 86400000 * 3), subtotal: 118095, taxAmount: 5905, totalAmount: 124000, paidAmount: 0, paymentMethod: "Credit", status: "PENDING" },
  ];
  for (const so of salesOrders) {
    await db.salesOrder.create({ data: so });
  }

  // ---------- 9. Purchase Orders ----------
  const purchaseOrders = [
    { poNumber: "PO-1248", vendorId: vendors[0].id, branchId: branches[0].id, buyerId: users[0].id, orderDate: now, subtotal: 270476, taxAmount: 13524, totalAmount: 284000, paidAmount: 0, status: "APPROVED", grnStatus: "PENDING" },
    { poNumber: "PO-1247", vendorId: vendors[1].id, branchId: branches[0].id, buyerId: users[0].id, orderDate: new Date(now.getTime() - 86400000), subtotal: 182857, taxAmount: 9143, totalAmount: 192000, paidAmount: 192000, status: "RECEIVED", grnStatus: "COMPLETED" },
    { poNumber: "PO-1246", vendorId: vendors[2].id, branchId: branches[1].id, buyerId: users[0].id, orderDate: new Date(now.getTime() - 86400000), subtotal: 81714, taxAmount: 4286, totalAmount: 86000, paidAmount: 0, status: "PENDING", grnStatus: "PENDING" },
    { poNumber: "PO-1245", vendorId: vendors[3].id, branchId: branches[0].id, buyerId: users[0].id, orderDate: new Date(now.getTime() - 86400000 * 2), subtotal: 391905, taxAmount: 20095, totalAmount: 412000, paidAmount: 0, status: "APPROVED", grnStatus: "PENDING" },
    { poNumber: "PO-1244", vendorId: vendors[4].id, branchId: branches[1].id, buyerId: users[0].id, orderDate: new Date(now.getTime() - 86400000 * 2), subtotal: 118095, taxAmount: 5905, totalAmount: 124000, paidAmount: 124000, status: "RECEIVED", grnStatus: "COMPLETED" },
    { poNumber: "PO-1243", vendorId: vendors[5].id, branchId: branches[0].id, buyerId: users[0].id, orderDate: new Date(now.getTime() - 86400000 * 3), subtotal: 235714, taxAmount: 12286, totalAmount: 248000, paidAmount: 0, status: "APPROVED", grnStatus: "PENDING" },
  ];
  for (const po of purchaseOrders) {
    await db.purchaseOrder.create({ data: po });
  }

  // ---------- 10. Notifications ----------
  const notifs = [
    { recipientId: users[0].id, type: "warning", title: "Low Stock Alert", message: "12 products below reorder level" },
    { recipientId: users[0].id, type: "info", title: "New Order Received", message: "Order #ORD-2841 from Buyer Apex", isRead: false },
    { recipientId: users[0].id, type: "success", title: "Payment Received", message: "৳245,000 from Rahim Traders", isRead: false },
    { recipientId: users[0].id, type: "error", title: "Invoice Overdue", message: "3 invoices past due date", isRead: false },
    { recipientId: users[0].id, type: "warning", title: "Leave Approval", message: "5 leave requests pending", isRead: true },
    { recipientId: users[0].id, type: "success", title: "Backup Completed", message: "Daily backup saved to cloud successfully", isRead: true },
    { recipientId: users[0].id, type: "info", title: "New Vendor Registered", message: "Quick Pack Solutions awaiting approval", isRead: true },
    { recipientId: users[0].id, type: "warning", title: "System Update Available", message: "Version v1.1.0 ready to install", isRead: true },
  ];
  for (const n of notifs) {
    await db.notification.create({ data: n });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`   - ${branches.length} branches, ${warehouses.length} warehouses`);
  console.log(`   - 1 owner account (login: sayem@smartwebstudio.com / smartglobal)`);
  console.log(`   - ${categories.length} categories, ${brands.length} brands, ${products.length} products`);
  console.log(`   - ${customers.length} customers, ${vendors.length} vendors`);
  console.log(`   - ${salesOrders.length} sales orders, ${purchaseOrders.length} purchase orders`);
  console.log(`   - ${notifs.length} notifications`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
