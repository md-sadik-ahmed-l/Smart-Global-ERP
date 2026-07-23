// Smart Global ERP — Enterprise Seed Script
// Multi-Tenant + RBAC + Manufacturing + Payroll

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Smart Global ERP — Enterprise Edition...");

  // ---------- 1. Tenant ----------
  const tenant = await db.tenant.create({
    data: {
      name: "Smart WebStudio",
      code: "SWS",
      domain: "smartwebstudio.com",
      plan: "ENTERPRISE",
      status: "ACTIVE",
      maxUsers: 1000,
      maxBranches: 100,
      settings: JSON.stringify({ currency: "BDT", timezone: "Asia/Dhaka" }),
    },
  });

  // ---------- 2. Company ----------
  const company = await db.company.create({
    data: {
      tenantId: tenant.id,
      name: "Smart WebStudio",
      code: "SWS-HQ",
      legalName: "Smart WebStudio Ltd.",
      taxId: "TIN-123456789",
      regNumber: "RJ-SC-12345",
      address: "South Kulsi, Chittagong, Bangladesh",
      phone: "01711772407",
      email: "info@smartwebstudio.com",
      website: "smartwebstudio.com",
      baseCurrency: "BDT",
      fiscalYearStart: "01-JAN",
      status: "ACTIVE",
    },
  });

  // ---------- 3. Branches ----------
  const branches = await Promise.all([
    db.branch.create({ data: { tenantId: tenant.id, companyId: company.id, name: "Chittagong HQ", code: "CTG-HQ", address: "South Kulsi, Chittagong", phone: "01711772407", status: "active" } }),
    db.branch.create({ data: { tenantId: tenant.id, companyId: company.id, name: "Dhaka North", code: "DHK-N", address: "Gulshan, Dhaka", status: "active" } }),
    db.branch.create({ data: { tenantId: tenant.id, companyId: company.id, name: "Dhaka South", code: "DHK-S", address: "Dhanmondi, Dhaka", status: "active" } }),
    db.branch.create({ data: { tenantId: tenant.id, companyId: company.id, name: "Sylhet", code: "SYL", address: "Zindabazar, Sylhet", status: "active" } }),
    db.branch.create({ data: { tenantId: tenant.id, companyId: company.id, name: "Khulna", code: "KHL", address: "New Market, Khulna", status: "warning" } }),
  ]);

  const warehouses = await Promise.all([
    db.warehouse.create({ data: { tenantId: tenant.id, branchId: branches[0].id, name: "Chittagong Main", code: "WH-CTG-1", capacity: 5000, status: "active" } }),
    db.warehouse.create({ data: { tenantId: tenant.id, branchId: branches[1].id, name: "Dhaka North WH", code: "WH-DHN-1", capacity: 3000, status: "active" } }),
    db.warehouse.create({ data: { tenantId: tenant.id, branchId: branches[2].id, name: "Dhaka South WH", code: "WH-DHS-1", capacity: 2000, status: "active" } }),
    db.warehouse.create({ data: { tenantId: tenant.id, branchId: branches[3].id, name: "Sylhet Branch WH", code: "WH-SYL-1", capacity: 800, status: "active" } }),
  ]);

  // ---------- 4. RBAC — Roles & Permissions ----------
  // Create permissions for all modules
  const modules = ["dashboard", "crm", "vendors", "products", "sales", "purchase", "inventory", "pos", "manufacturing", "hr", "payroll", "finance", "reports", "settings", "audit"];
  const actions = ["view", "create", "update", "delete", "approve", "export"];

  const permissions = await Promise.all(
    modules.flatMap((m) =>
      actions.map((a) => db.permission.create({ data: { module: m, action: a, description: `${a} ${m}` } }))
    )
  );

  // Super Admin role (all permissions)
  const superAdminRole = await db.role.create({
    data: {
      tenantId: tenant.id,
      name: "Super Admin",
      description: "Full access to all modules and actions",
      isSystem: true,
    },
  });

  await db.rolePermission.createMany({
    data: permissions.map((p) => ({ roleId: superAdminRole.id, permissionId: p.id })),
  });

  // Manager role (view + create + update, no delete)
  const managerRole = await db.role.create({
    data: {
      tenantId: tenant.id,
      name: "Manager",
      description: "Manage operations, no system config",
      isSystem: true,
    },
  });
  const managerPerms = permissions.filter((p) => p.action !== "delete" && p.module !== "settings");
  await db.rolePermission.createMany({
    data: managerPerms.map((p) => ({ roleId: managerRole.id, permissionId: p.id })),
  });

  // Staff role (view + create only)
  const staffRole = await db.role.create({
    data: {
      tenantId: tenant.id,
      name: "Staff",
      description: "Day-to-day operations",
      isSystem: true,
    },
  });
  const staffPerms = permissions.filter((p) => ["view", "create"].includes(p.action));
  await db.rolePermission.createMany({
    data: staffPerms.map((p) => ({ roleId: staffRole.id, permissionId: p.id })),
  });

  // ---------- 5. User (single owner) ----------
  const passwordHash = await bcrypt.hash("smartglobal", 10);
  const owner = await db.user.create({
    data: {
      tenantId: tenant.id,
      email: "sayem@smartwebstudio.com",
      name: "Mohammad Sayem",
      passwordHash,
      role: "SUPER_ADMIN",
      roleId: superAdminRole.id,
      phone: "01711772407",
      avatar: "MS",
      department: "Management",
      designation: "CEO / Owner",
      branchId: branches[0].id,
      status: "ACTIVE",
    },
  });

  // ---------- 6. Categories & Brands ----------
  const categories = await Promise.all([
    db.category.create({ data: { tenantId: tenant.id, name: "Raw Material" } }),
    db.category.create({ data: { tenantId: tenant.id, name: "Machinery" } }),
    db.category.create({ data: { tenantId: tenant.id, name: "Packaging" } }),
    db.category.create({ data: { tenantId: tenant.id, name: "Office Supply" } }),
    db.category.create({ data: { tenantId: tenant.id, name: "Finished Goods" } }),
  ]);

  const brands = await Promise.all([
    db.brand.create({ data: { tenantId: tenant.id, name: "Local" } }),
    db.brand.create({ data: { tenantId: tenant.id, name: "Coats" } }),
    db.brand.create({ data: { tenantId: tenant.id, name: "Juki" } }),
    db.brand.create({ data: { tenantId: tenant.id, name: "SmartWear" } }),
  ]);

  // ---------- 7. Products ----------
  const products = await Promise.all([
    db.product.create({ data: { tenantId: tenant.id, companyId: company.id, sku: "FAB-CTN-001", name: "Cotton Fabric Roll", categoryId: categories[0].id, brandId: brands[0].id, unit: "meter", productType: "RAW", costPrice: 900, salePrice: 1200, reorderLevel: 200, status: "ACTIVE" } }),
    db.product.create({ data: { tenantId: tenant.id, companyId: company.id, sku: "THR-POL-002", name: "Polyester Thread", categoryId: categories[0].id, brandId: brands[1].id, unit: "kg", productType: "RAW", costPrice: 1100, salePrice: 1450, reorderLevel: 100, status: "ACTIVE" } }),
    db.product.create({ data: { tenantId: tenant.id, companyId: company.id, sku: "MCH-SW-003", name: "Sewing Machine", categoryId: categories[1].id, brandId: brands[2].id, unit: "pcs", productType: "RAW", costPrice: 85000, salePrice: 100000, reorderLevel: 5, status: "ACTIVE" } }),
    db.product.create({ data: { tenantId: tenant.id, companyId: company.id, sku: "PKG-CB-L-004", name: "Carton Box (Large)", categoryId: categories[2].id, brandId: brands[0].id, unit: "pcs", productType: "RAW", costPrice: 35, salePrice: 45, reorderLevel: 500, status: "ACTIVE" } }),
    db.product.create({ data: { tenantId: tenant.id, companyId: company.id, sku: "TSR-M-W-006", name: "T-Shirt (M, White)", categoryId: categories[4].id, brandId: brands[3].id, unit: "pcs", productType: "FINISHED", costPrice: 220, salePrice: 320, reorderLevel: 200, status: "ACTIVE" } }),
    db.product.create({ data: { tenantId: tenant.id, companyId: company.id, sku: "TSR-B-L-008", name: "T-Shirt (Black, L)", categoryId: categories[4].id, brandId: brands[3].id, unit: "pcs", productType: "FINISHED", costPrice: 250, salePrice: 350, reorderLevel: 200, status: "ACTIVE" } }),
  ]);

  // ---------- 8. Stock ----------
  await Promise.all([
    db.stockItem.create({ data: { tenantId: tenant.id, productId: products[0].id, warehouseId: warehouses[0].id, quantity: 1240 } }),
    db.stockItem.create({ data: { tenantId: tenant.id, productId: products[1].id, warehouseId: warehouses[0].id, quantity: 86 } }),
    db.stockItem.create({ data: { tenantId: tenant.id, productId: products[2].id, warehouseId: warehouses[1].id, quantity: 24 } }),
    db.stockItem.create({ data: { tenantId: tenant.id, productId: products[3].id, warehouseId: warehouses[2].id, quantity: 480 } }),
    db.stockItem.create({ data: { tenantId: tenant.id, productId: products[4].id, warehouseId: warehouses[1].id, quantity: 1820 } }),
    db.stockItem.create({ data: { tenantId: tenant.id, productId: products[5].id, warehouseId: warehouses[1].id, quantity: 1240 } }),
  ]);

  // ---------- 9. Customers ----------
  const customers = await Promise.all([
    db.customer.create({ data: { tenantId: tenant.id, companyId: company.id, code: "CUS-001", name: "Apex Garments Ltd", email: "info@apexgarments.com", phone: "+8801711-100100", country: "Bangladesh", segment: "ENTERPRISE", creditLimit: 2000000, status: "ACTIVE" } }),
    db.customer.create({ data: { tenantId: tenant.id, companyId: company.id, code: "CUS-002", name: "Rahim Traders", email: "rahim@traders.com", phone: "+8801711-200200", country: "Bangladesh", segment: "SME", creditLimit: 500000, status: "ACTIVE" } }),
    db.customer.create({ data: { tenantId: tenant.id, companyId: company.id, code: "CUS-003", name: "Global Imports Inc", email: "info@globalimports.com", phone: "+1-555-0100", country: "USA", segment: "ENTERPRISE", creditLimit: 5000000, status: "ACTIVE" } }),
  ]);

  // ---------- 10. Vendors ----------
  const vendors = await Promise.all([
    db.vendor.create({ data: { tenantId: tenant.id, companyId: company.id, code: "VND-001", name: "Asian Textiles Ltd", contactPerson: "Anwar Hossain", email: "anwar@asiantextiles.com", phone: "+8801711-123456", country: "Bangladesh", category: "Raw Materials", creditDays: 30, creditLimit: 2000000, rating: 4.8, status: "ACTIVE" } }),
    db.vendor.create({ data: { tenantId: tenant.id, companyId: company.id, code: "VND-002", name: "Global Traders BD", contactPerson: "Rafiq Ahmed", email: "rafiq@globaltraders.com", phone: "+8801711-234567", country: "Bangladesh", category: "Machinery", creditDays: 45, creditLimit: 1500000, rating: 4.6, status: "ACTIVE" } }),
    db.vendor.create({ data: { tenantId: tenant.id, companyId: company.id, code: "VND-003", name: "Mega Industries Inc", contactPerson: "John Peterson", email: "john@megaindustries.com", phone: "+1-555-0142", country: "USA", category: "Machinery", creditDays: 60, creditLimit: 1500000, rating: 4.5, status: "ACTIVE" } }),
  ]);

  // ---------- 11. Sales Orders ----------
  const now = new Date();
  await db.salesOrder.createMany({
    data: [
      { tenantId: tenant.id, companyId: company.id, orderNumber: "ORD-2841", customerId: customers[0].id, branchId: branches[0].id, salesRepId: owner.id, orderDate: now, subtotal: 233333, taxAmount: 11667, totalAmount: 245000, paidAmount: 0, paymentMethod: "Credit", status: "PROCESSING" },
      { tenantId: tenant.id, companyId: company.id, orderNumber: "ORD-2840", customerId: customers[1].id, branchId: branches[0].id, salesRepId: owner.id, orderDate: now, subtotal: 172857, taxAmount: 9143, totalAmount: 182000, paidAmount: 182000, paymentMethod: "Cash", status: "COMPLETED" },
      { tenantId: tenant.id, companyId: company.id, orderNumber: "ORD-2839", customerId: customers[2].id, branchId: branches[0].id, salesRepId: owner.id, orderDate: new Date(now.getTime() - 86400000), subtotal: 498095, taxAmount: 25905, totalAmount: 524000, paidAmount: 524000, paymentMethod: "Bank", status: "PROCESSING" },
    ],
  });

  // ---------- 12. Purchase Orders ----------
  await db.purchaseOrder.createMany({
    data: [
      { tenantId: tenant.id, companyId: company.id, poNumber: "PO-1248", vendorId: vendors[0].id, branchId: branches[0].id, buyerId: owner.id, orderDate: now, subtotal: 270476, taxAmount: 13524, totalAmount: 284000, paidAmount: 0, status: "APPROVED", grnStatus: "PENDING" },
      { tenantId: tenant.id, companyId: company.id, poNumber: "PO-1247", vendorId: vendors[1].id, branchId: branches[0].id, buyerId: owner.id, orderDate: new Date(now.getTime() - 86400000), subtotal: 182857, taxAmount: 9143, totalAmount: 192000, paidAmount: 192000, status: "RECEIVED", grnStatus: "COMPLETED" },
    ],
  });

  // ---------- 13. Salary Structures ----------
  const salStruct1 = await db.salaryStructure.create({
    data: {
      tenantId: tenant.id,
      name: "Executive",
      basicSalary: 150000,
      houseRent: 60000,
      medicalAllowance: 10000,
      conveyance: 15000,
      foodAllowance: 8000,
      specialAllowance: 20000,
      providentFund: 12000,
      taxPercent: 15,
    },
  });

  const salStruct2 = await db.salaryStructure.create({
    data: {
      tenantId: tenant.id,
      name: "Staff",
      basicSalary: 30000,
      houseRent: 12000,
      medicalAllowance: 3000,
      conveyance: 4000,
      foodAllowance: 2000,
      providentFund: 2400,
      taxPercent: 5,
    },
  });

  // ---------- 14. Employees ----------
  const employees = await Promise.all([
    db.employee.create({ data: { tenantId: tenant.id, employeeCode: "EMP-001", userId: owner.id, name: "Mohammad Sayem", email: "sayem@smartwebstudio.com", phone: "01711772407", department: "Management", designation: "CEO", branchId: branches[0].id, joinDate: new Date("2018-01-15"), salaryStructureId: salStruct1.id, status: "ACTIVE" } }),
    db.employee.create({ data: { tenantId: tenant.id, employeeCode: "EMP-002", name: "Rakib Hassan", email: "rakib@smartwebstudio.com", phone: "01711222222", department: "Sales", designation: "Sales Manager", branchId: branches[1].id, joinDate: new Date("2019-06-10"), salaryStructureId: salStruct2.id, status: "ACTIVE" } }),
    db.employee.create({ data: { tenantId: tenant.id, employeeCode: "EMP-003", name: "Tanvir Ahmed", email: "tanvir@smartwebstudio.com", phone: "01711333333", department: "Production", designation: "Production Head", branchId: branches[0].id, joinDate: new Date("2018-11-05"), salaryStructureId: salStruct2.id, status: "ACTIVE" } }),
  ]);

  // ---------- 15. BOM (Bill of Materials) ----------
  const bom1 = await db.bOM.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      bomNumber: "BOM-001",
      name: "T-Shirt (M, White) BOM",
      productId: products[4].id, // T-Shirt (M, White)
      quantity: 1,
      unit: "pcs",
      status: "ACTIVE",
    },
  });

  await db.bOMItem.createMany({
    data: [
      { bomId: bom1.id, productId: products[0].id, quantity: 1.5, unit: "meter" }, // 1.5m fabric
      { bomId: bom1.id, productId: products[1].id, quantity: 0.05, unit: "kg" },   // 50g thread
      { bomId: bom1.id, productId: products[3].id, quantity: 0.1, unit: "pcs" },   // 0.1 carton
    ],
  });

  // ---------- 16. Work Order ----------
  const wo1 = await db.workOrder.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      woNumber: "WO-001",
      bomId: bom1.id,
      productId: products[4].id,
      branchId: branches[0].id,
      supervisorId: owner.id,
      plannedQty: 500,
      producedQty: 320,
      startDate: new Date(now.getTime() - 86400000 * 3),
      plannedEndDate: new Date(now.getTime() + 86400000 * 2),
      status: "IN_PROGRESS",
      priority: "HIGH",
    },
  });

  await db.workOrderItem.createMany({
    data: [
      { workOrderId: wo1.id, productId: products[0].id, requiredQty: 750, issuedQty: 480, unit: "meter" },
      { workOrderId: wo1.id, productId: products[1].id, requiredQty: 25, issuedQty: 16, unit: "kg" },
    ],
  });

  // Production logs
  await db.productionLog.createMany({
    data: [
      { tenantId: tenant.id, workOrderId: wo1.id, operatorId: owner.id, producedQty: 150, rejectedQty: 5, shift: "MORNING", station: "STN-01", logTime: new Date(now.getTime() - 86400000 * 2) },
      { tenantId: tenant.id, workOrderId: wo1.id, operatorId: owner.id, producedQty: 170, rejectedQty: 3, shift: "EVENING", station: "STN-02", logTime: new Date(now.getTime() - 86400000) },
    ],
  });

  // QC check
  await db.qCCheck.create({
    data: {
      tenantId: tenant.id,
      workOrderId: wo1.id,
      inspectorId: owner.id,
      checkType: "INLINE",
      sampleSize: 50,
      passedQty: 47,
      failedQty: 3,
      defectType: "Stitching",
      status: "PASSED",
      notes: "Minor stitching defects found, within AQL limit",
    },
  });

  // ---------- 17. Notifications ----------
  const notifs = [
    { tenantId: tenant.id, recipientId: owner.id, type: "warning", title: "Low Stock Alert", message: "Polyester Thread below reorder level" },
    { tenantId: tenant.id, recipientId: owner.id, type: "info", title: "New Order Received", message: "Order #ORD-2841 from Apex Garments" },
    { tenantId: tenant.id, recipientId: owner.id, type: "success", title: "Work Order Progress", message: "WO-001: 320 of 500 units produced (64%)" },
    { tenantId: tenant.id, recipientId: owner.id, type: "error", title: "Invoice Overdue", message: "3 invoices past due date" },
  ];
  for (const n of notifs) await db.notification.create({ data: n });

  console.log("✅ Enterprise seed completed!");
  console.log(`   Tenant: ${tenant.name} (${tenant.code}) — Plan: ${tenant.plan}`);
  console.log(`   Company: ${company.name}`);
  console.log(`   ${branches.length} branches, ${warehouses.length} warehouses`);
  console.log(`   ${modules.length * actions.length} permissions, 3 roles (Super Admin, Manager, Staff)`);
  console.log(`   1 owner account (sayem@smartwebstudio.com / smartglobal)`);
  console.log(`   ${products.length} products, ${customers.length} customers, ${vendors.length} vendors`);
  console.log(`   ${employees.length} employees, 2 salary structures`);
  console.log(`   1 BOM, 1 work order (in progress), 2 production logs, 1 QC check`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
