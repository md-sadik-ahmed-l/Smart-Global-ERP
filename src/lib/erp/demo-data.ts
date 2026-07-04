// Demo data for Smart Global ERP — mock financial, sales, inventory & vendor data
// All amounts are in BDT (Bangladeshi Taka) — denoted with the ৳ symbol

export const COMPANY = {
  name: "Smart Global ERP",
  company: "Smart WebStudio",
  owner: "Mohammad Sayem",
  phone: "01711772407",
  location: "Chittagong South Kulshi, Bangladesh",
  tagline: "Enterprise Resource Planning",
  version: "v1.0.0 Demo",
};

export const fmtBDT = (n: number) =>
  "৳" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

// ---------- Executive Dashboard ----------
export const execKPIs = [
  { label: "Total Revenue", value: 18425000, delta: 12.5, trend: "up", icon: "TrendingUp", color: "#3b82f6", subtitle: "vs last year" },
  { label: "Net Profit", value: 4280000, delta: 8.2, trend: "up", icon: "Wallet", color: "#10b981", subtitle: "23.2% margin" },
  { label: "Total Sales", value: 15680000, delta: 15.3, trend: "up", icon: "ShoppingCart", color: "#8b5cf6", subtitle: "1,284 orders" },
  { label: "Total Orders", value: 1284, delta: 9.1, trend: "up", icon: "Package", color: "#f59e0b", subtitle: "this year" },
  { label: "Total Customers", value: 3842, delta: 4.7, trend: "up", icon: "Users", color: "#06b6d4", subtitle: "412 active" },
  { label: "Total Employees", value: 247, delta: 2.1, trend: "up", icon: "UserCog", color: "#ec4899", subtitle: "12 depts" },
  { label: "Total Products", value: 1842, delta: 6.8, trend: "up", icon: "Boxes", color: "#14b8a6", subtitle: "32 categories" },
  { label: "Total Expenses", value: 6420000, delta: -3.2, trend: "down", icon: "TrendingDown", color: "#ef4444", subtitle: "under budget" },
];

export const revenueTrend = [
  { month: "Jan", revenue: 1240000, profit: 280000, expense: 410000 },
  { month: "Feb", revenue: 1380000, profit: 320000, expense: 430000 },
  { month: "Mar", revenue: 1520000, profit: 360000, expense: 460000 },
  { month: "Apr", revenue: 1450000, profit: 340000, expense: 480000 },
  { month: "May", revenue: 1680000, profit: 410000, expense: 510000 },
  { month: "Jun", revenue: 1820000, profit: 450000, expense: 530000 },
  { month: "Jul", revenue: 1740000, profit: 420000, expense: 540000 },
  { month: "Aug", revenue: 1920000, profit: 480000, expense: 560000 },
  { month: "Sep", revenue: 2050000, profit: 510000, expense: 580000 },
  { month: "Oct", revenue: 2180000, profit: 540000, expense: 600000 },
  { month: "Nov", revenue: 2320000, profit: 590000, expense: 620000 },
  { month: "Dec", revenue: 2480000, profit: 640000, expense: 650000 },
];

export const salesByCountry = [
  { country: "Bangladesh", code: "BD", flag: "🇧🇩", sales: 8240000, percentage: 52.5 },
  { country: "India", code: "IN", flag: "🇮🇳", sales: 3120000, percentage: 19.9 },
  { country: "USA", code: "US", flag: "🇺🇸", sales: 1860000, percentage: 11.9 },
  { country: "UAE", code: "AE", flag: "🇦🇪", sales: 1240000, percentage: 7.9 },
  { country: "UK", code: "GB", flag: "🇬🇧", sales: 760000, percentage: 4.8 },
  { country: "Others", code: "OT", flag: "🌍", sales: 485000, percentage: 3.0 },
];

export const branchPerformance = [
  { branch: "Chittagong HQ", revenue: 5240000, target: 6000000, employees: 87, status: "active" },
  { branch: "Dhaka North", revenue: 4180000, target: 4500000, employees: 64, status: "active" },
  { branch: "Dhaka South", revenue: 3640000, target: 4000000, employees: 52, status: "active" },
  { branch: "Sylhet", revenue: 1860000, target: 2000000, employees: 24, status: "active" },
  { branch: "Khulna", revenue: 1480000, target: 1800000, employees: 20, status: "warning" },
];

export const systemAlerts = [
  { type: "warning", title: "Low Stock Alert", message: "12 products below reorder level", time: "5 min ago", color: "#f59e0b" },
  { type: "info", title: "New Order Received", message: "Order #ORD-2841 from Buyer Apex", time: "12 min ago", color: "#3b82f6" },
  { type: "success", title: "Payment Received", message: "৳245,000 from Rahim Traders", time: "28 min ago", color: "#10b981" },
  { type: "error", title: "Invoice Overdue", message: "3 invoices past due date", time: "1 hour ago", color: "#ef4444" },
  { type: "warning", title: "Leave Approval", message: "5 leave requests pending", time: "2 hours ago", color: "#f59e0b" },
];

export const recentOrders = [
  { id: "ORD-2841", customer: "Apex Garments Ltd", amount: 245000, status: "Processing", date: "2026-07-05", payment: "Credit" },
  { id: "ORD-2840", customer: "Rahim Traders", amount: 182000, status: "Completed", date: "2026-07-05", payment: "Cash" },
  { id: "ORD-2839", customer: "Karim Enterprise", amount: 96500, status: "Pending", date: "2026-07-04", payment: "Bank" },
  { id: "ORD-2838", customer: "Sonali Textile", amount: 312000, status: "Shipped", date: "2026-07-04", payment: "Credit" },
  { id: "ORD-2837", customer: "Mega Mart BD", amount: 78400, status: "Completed", date: "2026-07-03", payment: "Online" },
  { id: "ORD-2836", customer: "Global Imports", amount: 524000, status: "Processing", date: "2026-07-03", payment: "Bank" },
  { id: "ORD-2835", customer: "Nila Fashion", amount: 124000, status: "Pending", date: "2026-07-02", payment: "Credit" },
];

export const progressRings = [
  { label: "Sales Target", value: 78, color: "#3b82f6" },
  { label: "Production", value: 92, color: "#10b981" },
  { label: "Collection", value: 68, color: "#f59e0b" },
];

// ---------- Vendors Dashboard ----------
export const vendorKPIs = [
  { label: "Total Vendors", value: 248, delta: 5.2, icon: "Users", color: "#8b5cf6", subtitle: "218 active" },
  { label: "Total Buyers", value: 412, delta: 8.7, icon: "ShoppingBag", color: "#10b981", subtitle: "386 active" },
  { label: "Total Purchase", value: 9840000, delta: 12.4, icon: "ShoppingCart", color: "#3b82f6", subtitle: "this year", isCurrency: true },
  { label: "Total Payment", value: 8420000, delta: 9.8, icon: "Wallet", color: "#f59e0b", subtitle: "85.6% paid", isCurrency: true },
  { label: "Total Due", value: 1420000, delta: -4.2, icon: "AlertCircle", color: "#ef4444", subtitle: "14.4% due", isCurrency: true },
  { label: "Avg Credit Days", value: 32, delta: 2.0, icon: "CalendarClock", color: "#14b8a6", subtitle: "terms" },
  { label: "Active Contracts", value: 186, delta: 6.4, icon: "FileSignature", color: "#06b6d4", subtitle: "12 expiring" },
  { label: "Blocked Vendors", value: 7, delta: -1, icon: "UserX", color: "#ec4899", subtitle: "3 this month" },
];

export const purchaseByCategory = [
  { name: "Raw Materials", value: 38, color: "#8b5cf6" },
  { name: "Machinery", value: 22, color: "#3b82f6" },
  { name: "Packaging", value: 16, color: "#f59e0b" },
  { name: "Office Supply", value: 12, color: "#10b981" },
  { name: "Logistics", value: 8, color: "#ec4899" },
  { name: "Others", value: 4, color: "#14b8a6" },
];

export const topVendorsByPurchase = [
  { name: "Asian Textiles Ltd", value: 1840000, color: "#8b5cf6" },
  { name: "Global Traders BD", value: 1420000, color: "#3b82f6" },
  { name: "Smart Suppliers", value: 980000, color: "#f59e0b" },
  { name: "Mega Industries", value: 760000, color: "#10b981" },
  { name: "Sonali Imports", value: 540000, color: "#ef4444" },
];

export const purchaseVsPayment = [
  { month: "Jan", purchase: 720000, payment: 680000 },
  { month: "Feb", purchase: 810000, payment: 740000 },
  { month: "Mar", purchase: 880000, payment: 820000 },
  { month: "Apr", purchase: 760000, payment: 800000 },
  { month: "May", purchase: 920000, payment: 860000 },
  { month: "Jun", purchase: 1040000, payment: 940000 },
  { month: "Jul", purchase: 980000, payment: 920000 },
  { month: "Aug", purchase: 1120000, payment: 1020000 },
  { month: "Sep", purchase: 1180000, payment: 1080000 },
  { month: "Oct", purchase: 1240000, payment: 1140000 },
  { month: "Nov", purchase: 1320000, payment: 1220000 },
  { month: "Dec", purchase: 1380000, payment: 1280000 },
];

export const vendorStatus = [
  { name: "Active", value: 218, color: "#10b981" },
  { name: "Inactive", value: 23, color: "#f59e0b" },
  { name: "Pending", value: 12, color: "#3b82f6" },
  { name: "Blocked", value: 7, color: "#ef4444" },
];

export const vendorTable = [
  { id: "VND-001", name: "Asian Textiles Ltd", contact: "Anwar Hossain", email: "anwar@asiantextiles.com", phone: "+8801711-123456", country: "Bangladesh", flag: "🇧🇩", category: "Raw Materials", purchase: 1840000, payment: 1680000, due: 160000, rating: 4.8, status: "Active", creditDays: 30 },
  { id: "VND-002", name: "Global Traders BD", contact: "Rafiq Ahmed", email: "rafiq@globaltraders.com", phone: "+8801711-234567", country: "Bangladesh", flag: "🇧🇩", category: "Machinery", purchase: 1420000, payment: 1420000, due: 0, rating: 4.6, status: "Active", creditDays: 45 },
  { id: "VND-003", name: "Smart Suppliers Co", contact: "Sabina Yeasmin", email: "sabina@smartsuppliers.com", phone: "+8801711-345678", country: "India", flag: "🇮🇳", category: "Packaging", purchase: 980000, payment: 820000, due: 160000, rating: 4.4, status: "Active", creditDays: 30 },
  { id: "VND-004", name: "Mega Industries Inc", contact: "John Peterson", email: "john@megaindustries.com", phone: "+1-555-0142", country: "USA", flag: "🇺🇸", category: "Machinery", purchase: 760000, payment: 700000, due: 60000, rating: 4.5, status: "Active", creditDays: 60 },
  { id: "VND-005", name: "Sonali Imports Ltd", contact: "Karim Uddin", email: "karim@sonaliimports.com", phone: "+8801711-456789", country: "Bangladesh", flag: "🇧🇩", category: "Raw Materials", purchase: 540000, payment: 380000, due: 160000, rating: 4.2, status: "Active", creditDays: 30 },
  { id: "VND-006", name: "Dubai Trade Hub", contact: "Ahmed Al Rashid", email: "ahmed@dubaitrade.ae", phone: "+971-50-1234567", country: "UAE", flag: "🇦🇪", category: "Logistics", purchase: 480000, payment: 480000, due: 0, rating: 4.7, status: "Active", creditDays: 45 },
  { id: "VND-007", name: "London Exports Plc", contact: "Sarah Williams", email: "sarah@londonexports.co.uk", phone: "+44-20-7946-0958", country: "UK", flag: "🇬🇧", category: "Office Supply", purchase: 360000, payment: 280000, due: 80000, rating: 4.3, status: "Active", creditDays: 60 },
  { id: "VND-008", name: "Quick Pack Solutions", contact: "Imran Khan", email: "imran@quickpack.com", phone: "+8801711-567890", country: "Bangladesh", flag: "🇧🇩", category: "Packaging", purchase: 280000, payment: 280000, due: 0, rating: 4.1, status: "Pending", creditDays: 30 },
  { id: "VND-009", name: "Tech Bazaar Online", contact: "Ramesh Patel", email: "ramesh@techbazaar.in", phone: "+91-98765-43210", country: "India", flag: "🇮🇳", category: "Office Supply", purchase: 240000, payment: 180000, due: 60000, rating: 3.9, status: "Inactive", creditDays: 30 },
  { id: "VND-010", name: "Asian Foods Export", contact: "Mohammed Ali", email: "ali@asianfoods.com", phone: "+8801711-678901", country: "Bangladesh", flag: "🇧🇩", category: "Raw Materials", purchase: 220000, payment: 120000, due: 100000, rating: 3.5, status: "Blocked", creditDays: 30 },
];

// ---------- CRM ----------
export const crmStats = [
  { label: "Total Customers", value: 3842, delta: 4.7, icon: "Users", color: "#3b82f6" },
  { label: "Active Leads", value: 248, delta: 12.3, icon: "Target", color: "#8b5cf6" },
  { label: "Open Deals", value: 86, delta: 8.1, icon: "Handshake", color: "#10b981" },
  { label: "Win Rate", value: 68, delta: 3.2, icon: "TrendingUp", color: "#f59e0b", isPercent: true },
];

export const salesPipeline = [
  { stage: "Lead", count: 124, value: 4280000, color: "#3b82f6" },
  { stage: "Qualified", count: 86, value: 3140000, color: "#06b6d4" },
  { stage: "Proposal", count: 52, value: 2480000, color: "#8b5cf6" },
  { stage: "Negotiation", count: 28, value: 1640000, color: "#f59e0b" },
  { stage: "Closed Won", count: 18, value: 980000, color: "#10b981" },
];

export const customerTable = [
  { id: "CUS-001", name: "Apex Garments Ltd", email: "info@apexgarments.com", phone: "+8801711-100100", segment: "Enterprise", orders: 142, value: 2840000, status: "VIP", lastOrder: "2026-07-05" },
  { id: "CUS-002", name: "Rahim Traders", email: "rahim@traders.com", phone: "+8801711-200200", segment: "SME", orders: 86, value: 1240000, status: "Active", lastOrder: "2026-07-05" },
  { id: "CUS-003", name: "Karim Enterprise", email: "karim@enterprise.com", phone: "+8801711-300300", segment: "SME", orders: 64, value: 860000, status: "Active", lastOrder: "2026-07-04" },
  { id: "CUS-004", name: "Sonali Textile", email: "info@sonalitextile.com", phone: "+8801711-400400", segment: "Enterprise", orders: 218, value: 4120000, status: "VIP", lastOrder: "2026-07-04" },
  { id: "CUS-005", name: "Mega Mart BD", email: "info@megamartbd.com", phone: "+8801711-500500", segment: "Retail", orders: 124, value: 680000, status: "Active", lastOrder: "2026-07-03" },
  { id: "CUS-006", name: "Global Imports Inc", email: "info@globalimports.com", phone: "+1-555-0100", segment: "Enterprise", orders: 92, value: 5240000, status: "VIP", lastOrder: "2026-07-03" },
  { id: "CUS-007", name: "Nila Fashion House", email: "nila@fashion.com", phone: "+8801711-600600", segment: "SME", orders: 48, value: 420000, status: "Active", lastOrder: "2026-07-02" },
];

// ---------- Sales ----------
export const salesStats = [
  { label: "Total Sales", value: 15680000, delta: 15.3, icon: "ShoppingCart", color: "#3b82f6", isCurrency: true },
  { label: "Orders", value: 1284, delta: 9.1, icon: "Package", color: "#8b5cf6" },
  { label: "Avg Order Value", value: 12212, delta: 5.7, icon: "TrendingUp", color: "#10b981", isCurrency: true },
  { label: "Pending Payment", value: 2480000, delta: -2.4, icon: "AlertCircle", color: "#ef4444", isCurrency: true },
];

export const salesTrend = [
  { month: "Jan", online: 420000, offline: 580000 },
  { month: "Feb", online: 480000, offline: 620000 },
  { month: "Mar", online: 520000, offline: 680000 },
  { month: "Apr", online: 460000, offline: 720000 },
  { month: "May", online: 620000, offline: 780000 },
  { month: "Jun", online: 720000, offline: 820000 },
  { month: "Jul", online: 680000, offline: 760000 },
  { month: "Aug", online: 820000, offline: 880000 },
  { month: "Sep", online: 920000, offline: 940000 },
  { month: "Oct", online: 1020000, offline: 980000 },
  { month: "Nov", online: 1140000, offline: 1040000 },
  { month: "Dec", online: 1280000, offline: 1120000 },
];

export const ordersTable = [
  { id: "ORD-2841", customer: "Apex Garments Ltd", items: 24, total: 245000, status: "Processing", date: "2026-07-05", payment: "Credit", due: 245000 },
  { id: "ORD-2840", customer: "Rahim Traders", items: 12, total: 182000, status: "Completed", date: "2026-07-05", payment: "Cash", due: 0 },
  { id: "ORD-2839", customer: "Karim Enterprise", items: 8, total: 96500, status: "Pending", date: "2026-07-04", payment: "Bank", due: 96500 },
  { id: "ORD-2838", customer: "Sonali Textile", items: 36, total: 312000, status: "Shipped", date: "2026-07-04", payment: "Credit", due: 156000 },
  { id: "ORD-2837", customer: "Mega Mart BD", items: 18, total: 78400, status: "Completed", date: "2026-07-03", payment: "Online", due: 0 },
  { id: "ORD-2836", customer: "Global Imports", items: 48, total: 524000, status: "Processing", date: "2026-07-03", payment: "Bank", due: 0 },
  { id: "ORD-2835", customer: "Nila Fashion", items: 14, total: 124000, status: "Pending", date: "2026-07-02", payment: "Credit", due: 124000 },
  { id: "ORD-2834", customer: "London Exports", items: 22, total: 386000, status: "Shipped", date: "2026-07-02", payment: "Bank", due: 0 },
];

// ---------- Purchase ----------
export const purchaseStats = [
  { label: "Total Purchase", value: 9840000, delta: 12.4, icon: "Truck", color: "#3b82f6", isCurrency: true },
  { label: "PO Count", value: 486, delta: 7.8, icon: "FileText", color: "#8b5cf6" },
  { label: "Pending GRN", value: 28, delta: 4.2, icon: "PackageCheck", color: "#f59e0b" },
  { label: "Supplier Due", value: 1420000, delta: -4.2, icon: "AlertCircle", color: "#ef4444", isCurrency: true },
];

export const purchaseOrdersTable = [
  { id: "PO-1248", supplier: "Asian Textiles Ltd", items: 18, total: 284000, status: "Approved", date: "2026-07-05", grn: "Pending", due: 284000 },
  { id: "PO-1247", supplier: "Global Traders BD", items: 24, total: 192000, status: "Received", date: "2026-07-04", grn: "GRN-1184", due: 0 },
  { id: "PO-1246", supplier: "Smart Suppliers Co", items: 12, total: 86000, status: "Pending", date: "2026-07-04", grn: "—", due: 0 },
  { id: "PO-1245", supplier: "Mega Industries Inc", items: 6, total: 412000, status: "Approved", date: "2026-07-03", grn: "Pending", due: 412000 },
  { id: "PO-1244", supplier: "Sonali Imports Ltd", items: 32, total: 124000, status: "Received", date: "2026-07-03", grn: "GRN-1182", due: 0 },
  { id: "PO-1243", supplier: "Dubai Trade Hub", items: 8, total: 248000, status: "Shipped", date: "2026-07-02", grn: "Pending", due: 0 },
];

// ---------- Inventory ----------
export const inventoryStats = [
  { label: "Total Products", value: 1842, delta: 6.8, icon: "Boxes", color: "#3b82f6" },
  { label: "Stock Value", value: 8420000, delta: 4.2, icon: "Wallet", color: "#10b981", isCurrency: true },
  { label: "Low Stock", value: 42, delta: 12.0, icon: "AlertTriangle", color: "#f59e0b" },
  { label: "Out of Stock", value: 18, delta: -3.0, icon: "XCircle", color: "#ef4444" },
];

export const warehouseStock = [
  { warehouse: "Chittagong Main", products: 1240, value: 4820000, capacity: 78, color: "#3b82f6" },
  { warehouse: "Dhaka North", products: 880, value: 2240000, capacity: 64, color: "#10b981" },
  { warehouse: "Dhaka South", products: 640, value: 1180000, capacity: 52, color: "#f59e0b" },
  { warehouse: "Sylhet Branch", products: 320, value: 180000, capacity: 38, color: "#8b5cf6" },
];

export const inventoryTable = [
  { id: "PRD-001", name: "Cotton Fabric Roll", sku: "FAB-CTN-001", category: "Raw Material", warehouse: "Chittagong", stock: 1240, reorder: 200, unit: "meter", value: 1240000, status: "In Stock" },
  { id: "PRD-002", name: "Polyester Thread", sku: "THR-POL-002", category: "Raw Material", warehouse: "Chittagong", stock: 86, reorder: 100, unit: "kg", value: 86000, status: "Low Stock" },
  { id: "PRD-003", name: "Sewing Machine", sku: "MCH-SW-003", category: "Machinery", warehouse: "Dhaka N.", stock: 24, reorder: 5, unit: "pcs", value: 2400000, status: "In Stock" },
  { id: "PRD-004", name: "Carton Box (Large)", sku: "PKG-CB-L-004", category: "Packaging", warehouse: "Dhaka S.", stock: 0, reorder: 500, unit: "pcs", value: 0, status: "Out of Stock" },
  { id: "PRD-005", name: "Printing Ink", sku: "INK-PR-005", category: "Raw Material", warehouse: "Chittagong", stock: 320, reorder: 100, unit: "liter", value: 320000, status: "In Stock" },
  { id: "PRD-006", name: "T-Shirt (M, White)", sku: "TSR-M-W-006", category: "Finished Goods", warehouse: "Dhaka N.", stock: 1820, reorder: 200, unit: "pcs", value: 364000, status: "In Stock" },
  { id: "PRD-007", name: "Tag Pin", sku: "PKG-TP-007", category: "Packaging", warehouse: "Sylhet", stock: 48, reorder: 100, unit: "box", value: 9600, status: "Low Stock" },
];

// ---------- POS ----------
export const posProducts = [
  { id: "P1", name: "T-Shirt (White, M)", price: 320, image: "👕", category: "Garments", stock: 1820 },
  { id: "P2", name: "T-Shirt (Black, L)", price: 350, image: "👕", category: "Garments", stock: 1240 },
  { id: "P3", name: "Jeans (Blue, 32)", price: 980, image: "👖", category: "Garments", stock: 860 },
  { id: "P4", name: "Sneakers (Size 42)", price: 1450, image: "👟", category: "Footwear", stock: 124 },
  { id: "P5", name: "Cap (Red)", price: 240, image: "🧢", category: "Accessories", stock: 540 },
  { id: "P6", name: "Backpack", price: 1850, image: "🎒", category: "Accessories", stock: 86 },
  { id: "P7", name: "Watch", price: 2400, image: "⌚", category: "Accessories", stock: 42 },
  { id: "P8", name: "Sunglasses", price: 680, image: "🕶️", category: "Accessories", stock: 184 },
  { id: "P9", name: "Wallet", price: 420, image: "👛", category: "Accessories", stock: 320 },
  { id: "P10", name: "Belt (Brown)", price: 580, image: "👔", category: "Accessories", stock: 240 },
  { id: "P11", name: "Hoodie (Grey, L)", price: 1240, image: "👕", category: "Garments", stock: 680 },
  { id: "P12", name: "Socks (Pair)", price: 120, image: "🧦", category: "Garments", stock: 1240 },
];

// ---------- HR ----------
export const hrStats = [
  { label: "Total Employees", value: 247, delta: 2.1, icon: "Users", color: "#3b82f6" },
  { label: "Present Today", value: 224, delta: 4.8, icon: "UserCheck", color: "#10b981", isPercent: false, subtitle: "90.7%" },
  { label: "On Leave", value: 14, delta: 0, icon: "CalendarClock", color: "#f59e0b" },
  { label: "Pending Approvals", value: 8, delta: 2, icon: "Clock", color: "#8b5cf6" },
];

export const departmentDist = [
  { dept: "Sales", count: 48, color: "#3b82f6" },
  { dept: "Production", count: 86, color: "#10b981" },
  { dept: "Finance", count: 18, color: "#f59e0b" },
  { dept: "HR & Admin", count: 22, color: "#8b5cf6" },
  { dept: "IT", count: 16, color: "#ec4899" },
  { dept: "Operations", count: 36, color: "#14b8a6" },
  { dept: "Others", count: 21, color: "#06b6d4" },
];

export const employeeTable = [
  { id: "EMP-001", name: "Mohammad Sayem", dept: "Management", role: "CEO", joinDate: "2018-01-15", salary: 250000, status: "Active" },
  { id: "EMP-002", name: "Fatima Begum", dept: "Finance", role: "CFO", joinDate: "2018-03-20", salary: 180000, status: "Active" },
  { id: "EMP-003", name: "Rakib Hassan", dept: "Sales", role: "Sales Manager", joinDate: "2019-06-10", salary: 95000, status: "Active" },
  { id: "EMP-004", name: "Sadia Islam", dept: "HR", role: "HR Manager", joinDate: "2019-08-15", salary: 88000, status: "Active" },
  { id: "EMP-005", name: "Tanvir Ahmed", dept: "Production", role: "Production Head", joinDate: "2018-11-05", salary: 120000, status: "Active" },
  { id: "EMP-006", name: "Nusrat Jahan", dept: "IT", role: "Senior Developer", joinDate: "2020-02-28", salary: 110000, status: "Active" },
  { id: "EMP-007", name: "Imran Hossain", dept: "Operations", role: "Ops Manager", joinDate: "2019-04-12", salary: 92000, status: "On Leave" },
];

// ---------- Finance ----------
export const financeStats = [
  { label: "Total Revenue", value: 18425000, delta: 12.5, icon: "TrendingUp", color: "#3b82f6", isCurrency: true },
  { label: "Total Expense", value: 6420000, delta: -3.2, icon: "TrendingDown", color: "#ef4444", isCurrency: true },
  { label: "Net Profit", value: 4280000, delta: 8.2, icon: "Wallet", color: "#10b981", isCurrency: true },
  { label: "Cash in Hand", value: 3240000, delta: 5.4, icon: "Banknote", color: "#f59e0b", isCurrency: true },
];

export const cashFlowData = [
  { month: "Jan", inflow: 1240000, outflow: 410000, net: 830000 },
  { month: "Feb", inflow: 1380000, outflow: 430000, net: 950000 },
  { month: "Mar", inflow: 1520000, outflow: 460000, net: 1060000 },
  { month: "Apr", inflow: 1450000, outflow: 480000, net: 970000 },
  { month: "May", inflow: 1680000, outflow: 510000, net: 1170000 },
  { month: "Jun", inflow: 1820000, outflow: 530000, net: 1290000 },
  { month: "Jul", inflow: 1740000, outflow: 540000, net: 1200000 },
  { month: "Aug", inflow: 1920000, outflow: 560000, net: 1360000 },
  { month: "Sep", inflow: 2050000, outflow: 580000, net: 1470000 },
  { month: "Oct", inflow: 2180000, outflow: 600000, net: 1580000 },
  { month: "Nov", inflow: 2320000, outflow: 620000, net: 1700000 },
  { month: "Dec", inflow: 2480000, outflow: 650000, net: 1830000 },
];

export const plBreakdown = [
  { label: "Sales Revenue", amount: 18425000, type: "income", color: "#10b981" },
  { label: "Cost of Goods Sold", amount: 7420000, type: "expense", color: "#ef4444" },
  { label: "Operating Expenses", amount: 3240000, type: "expense", color: "#f59e0b" },
  { label: "Salary & Wages", amount: 2480000, type: "expense", color: "#8b5cf6" },
  { label: "Tax & Compliance", amount: 1005000, type: "expense", color: "#ec4899" },
  { label: "Net Profit", amount: 4280000, type: "income", color: "#3b82f6" },
];

// ---------- Products ----------
export const productStats = [
  { label: "Total Products", value: 1842, delta: 6.8, icon: "Package", color: "#3b82f6" },
  { label: "Categories", value: 32, delta: 2.0, icon: "FolderTree", color: "#8b5cf6" },
  { label: "Brands", value: 86, delta: 4.0, icon: "Tag", color: "#10b981" },
  { label: "Low Stock Items", value: 42, delta: 12.0, icon: "AlertTriangle", color: "#f59e0b" },
];

export const productTable = [
  { id: "PRD-001", name: "Cotton Fabric Roll", sku: "FAB-CTN-001", category: "Raw Material", brand: "Local", price: 1200, stock: 1240, status: "Active" },
  { id: "PRD-002", name: "Polyester Thread", sku: "THR-POL-002", category: "Raw Material", brand: "Coats", price: 1450, stock: 86, status: "Active" },
  { id: "PRD-003", name: "Sewing Machine", sku: "MCH-SW-003", category: "Machinery", brand: "Juki", price: 100000, stock: 24, status: "Active" },
  { id: "PRD-004", name: "Carton Box (Large)", sku: "PKG-CB-L-004", category: "Packaging", brand: "Local", price: 45, stock: 0, status: "Out of Stock" },
  { id: "PRD-005", name: "Printing Ink", sku: "INK-PR-005", category: "Raw Material", brand: "Toyo", price: 1200, stock: 320, status: "Active" },
  { id: "PRD-006", name: "T-Shirt (M, White)", sku: "TSR-M-W-006", category: "Finished Goods", brand: "SmartWear", price: 320, stock: 1820, status: "Active" },
  { id: "PRD-007", name: "Tag Pin", sku: "PKG-TP-007", category: "Packaging", brand: "Local", price: 200, stock: 48, status: "Low Stock" },
];

// ---------- Reports ----------
export const reportCategories = [
  { id: "sales", name: "Sales Reports", icon: "ShoppingCart", color: "#3b82f6", count: 12 },
  { id: "purchase", name: "Purchase Reports", icon: "Truck", color: "#8b5cf6", count: 8 },
  { id: "inventory", name: "Inventory Reports", icon: "Warehouse", color: "#10b981", count: 10 },
  { id: "finance", name: "Financial Reports", icon: "Landmark", color: "#f59e0b", count: 14 },
  { id: "hr", name: "HR Reports", icon: "Users", color: "#ec4899", count: 9 },
  { id: "tax", name: "Tax Reports", icon: "ReceiptText", color: "#14b8a6", count: 6 },
];

export const recentReports = [
  { id: "RPT-001", name: "Monthly Sales Summary", category: "Sales", generatedAt: "2026-07-05", size: "1.2 MB", format: "PDF", by: "System" },
  { id: "RPT-002", name: "Vendor Performance Report", category: "Purchase", generatedAt: "2026-07-04", size: "890 KB", format: "Excel", by: "Mohammad Sayem" },
  { id: "RPT-003", name: "Stock Valuation Report", category: "Inventory", generatedAt: "2026-07-04", size: "2.1 MB", format: "PDF", by: "System" },
  { id: "RPT-004", name: "P&L Statement Q2", category: "Finance", generatedAt: "2026-07-03", size: "1.8 MB", format: "PDF", by: "Fatima Begum" },
  { id: "RPT-005", name: "Payroll Summary June", category: "HR", generatedAt: "2026-07-02", size: "1.5 MB", format: "Excel", by: "Sadia Islam" },
];
