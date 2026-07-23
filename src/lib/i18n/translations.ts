// Smart Global ERP — Translations for 12 languages
// Every UI string used in the ERP is defined here as TranslationKey

export type TranslationKey =
  // Common
  | "dashboard" | "search" | "search_placeholder" | "export" | "import" | "add" | "edit" | "delete"
  | "save" | "cancel" | "confirm" | "close" | "loading" | "no_data" | "actions" | "status" | "date"
  | "filter" | "all" | "total" | "name" | "email" | "phone" | "address" | "country" | "created_at"
  // Navigation categories
  | "cat_executive" | "cat_sales_crm" | "cat_purchase_inventory" | "cat_hr_finance"
  | "cat_operations" | "cat_system" | "cat_advanced"
  // Module names
  | "mod_executive_dashboard" | "mod_crm" | "mod_vendors" | "mod_marketplace" | "mod_products"
  | "mod_sales" | "mod_purchase" | "mod_inventory" | "mod_pos" | "mod_ecommerce"
  | "mod_manufacturing" | "mod_merchandising" | "mod_sample_dev" | "mod_qc"
  | "mod_hr" | "mod_attendance" | "mod_payroll" | "mod_finance" | "mod_banking"
  | "mod_logistics" | "mod_dms" | "mod_assets" | "mod_helpdesk" | "mod_projects"
  | "mod_multi_company" | "mod_multi_branch" | "mod_multi_currency"
  | "mod_subscription" | "mod_ai_bi" | "mod_reports" | "mod_api_integration"
  | "mod_security" | "mod_workflow" | "mod_notifications" | "mod_audit"
  | "mod_backup" | "mod_mobile" | "mod_iot" | "mod_cloud" | "mod_system_admin"
  | "mod_ai_copilot" | "mod_automation" | "mod_marketplace_pro" | "mod_franchise"
  | "mod_loyalty" | "mod_affiliate" | "mod_visitor" | "mod_legal" | "mod_esg"
  | "mod_communication" | "mod_user_management"
  // KPI labels
  | "kpi_total_revenue" | "kpi_net_profit" | "kpi_total_sales" | "kpi_total_orders"
  | "kpi_total_customers" | "kpi_total_employees" | "kpi_total_products" | "kpi_total_expenses"
  | "kpi_low_stock" | "kpi_out_of_stock" | "kpi_stock_value" | "kpi_total_vendors"
  | "kpi_active_work_orders"
  // Dashboard
  | "welcome_back" | "real_time_overview" | "revenue_overview" | "performance_rings"
  | "profit_expense" | "sales_by_country" | "branch_performance" | "system_alerts"
  | "recent_orders" | "factory_floor" | "ai_insights" | "live" | "production_live"
  | "all_systems_operational" | "database_connected" | "modules_count"
  // Auth
  | "sign_in" | "sign_out" | "email_address" | "password" | "remember_me" | "forgot_password"
  | "welcome_title" | "sign_in_to_dashboard" | "enterprise_edition" | "owned_by"
  // Page titles
  | "page_customers" | "page_vendors" | "page_products" | "page_sales" | "page_purchase"
  | "page_inventory" | "page_manufacturing" | "page_payroll" | "page_finance" | "page_reports"
  | "page_user_management" | "page_hr"
  // Form labels
  | "form_name" | "form_email" | "form_phone" | "form_address" | "form_country"
  | "form_segment" | "form_credit_limit" | "form_status" | "form_sku" | "form_price"
  | "form_stock" | "form_quantity" | "form_category" | "form_branch" | "form_role"
  | "form_department" | "form_designation" | "form_password" | "form_new_password"
  | "form_confirm_password"
  // Buttons
  | "btn_add_customer" | "btn_add_vendor" | "btn_add_product" | "btn_new_order"
  | "btn_new_po" | "btn_new_work_order" | "btn_run_payroll" | "btn_new_user"
  | "btn_stock_adjustment" | "btn_create" | "btn_update" | "btn_delete" | "btn_reset_password"
  | "btn_generate_ai" | "btn_export_csv" | "btn_export_pdf"
  // Table headers
  | "col_code" | "col_customer" | "col_vendor" | "col_product" | "col_amount"
  | "col_payment" | "col_order_date" | "col_quantity" | "col_unit_price" | "col_total"
  | "col_due" | "col_rating" | "col_credit" | "col_role" | "col_last_login"
  // Status
  | "status_active" | "status_inactive" | "status_pending" | "status_completed"
  | "status_processing" | "status_shipped" | "status_blocked" | "status_in_stock"
  | "status_low_stock" | "status_out_of_stock"
  // Language switcher
  | "language" | "theme" | "dark_mode" | "light_mode"
  // Header
  | "company" | "branch" | "notifications" | "messages" | "profile" | "settings"
  | "quick_actions" | "recently_visited" | "favorites" | "ai_assistant"
  // Manufacturing
  | "bom" | "work_order" | "production_tracking" | "quality_control" | "planned_qty"
  | "produced_qty" | "rejected_qty" | "progress" | "priority" | "supervisor"
  // Payroll
  | "salary_slip" | "payroll_run" | "gross_salary" | "net_salary" | "tax_amount"
  | "deductions" | "allowances" | "overtime" | "present_days" | "absent_days"
  // User management
  | "total_users" | "administrators" | "staff_managers" | "roles_defined"
  | "permission_matrix" | "create_user_account" | "reset_password"
  | "system_role" | "account_status";

type TranslationDict = Record<TranslationKey, string>;

const en: TranslationDict = {
  dashboard: "Dashboard", search: "Search", search_placeholder: "Search customers, vendors, products, orders...",
  export: "Export", import: "Import", add: "Add", edit: "Edit", delete: "Delete",
  save: "Save", cancel: "Cancel", confirm: "Confirm", close: "Close", loading: "Loading...",
  no_data: "No data available", actions: "Actions", status: "Status", date: "Date",
  filter: "Filter", all: "All", total: "Total", name: "Name", email: "Email", phone: "Phone",
  address: "Address", country: "Country", created_at: "Created At",
  cat_executive: "Executive", cat_sales_crm: "Sales & CRM", cat_purchase_inventory: "Purchase & Inventory",
  cat_hr_finance: "HR & Finance", cat_operations: "Operations", cat_system: "System", cat_advanced: "Advanced",
  mod_executive_dashboard: "Dashboard", mod_crm: "CRM", mod_vendors: "Vendors", mod_marketplace: "Marketplace",
  mod_products: "Products", mod_sales: "Sales", mod_purchase: "Purchase", mod_inventory: "Inventory",
  mod_pos: "POS", mod_ecommerce: "E-Commerce", mod_manufacturing: "Manufacturing",
  mod_merchandising: "Merchandising", mod_sample_dev: "Sample Dev", mod_qc: "QC",
  mod_hr: "HR", mod_attendance: "Attendance", mod_payroll: "Payroll", mod_finance: "Finance",
  mod_banking: "Banking", mod_logistics: "Logistics", mod_dms: "DMS", mod_assets: "Assets",
  mod_helpdesk: "Help Desk", mod_projects: "Projects", mod_multi_company: "Multi-Company",
  mod_multi_branch: "Multi-Branch", mod_multi_currency: "Currency/Lang",
  mod_subscription: "Subscriptions", mod_ai_bi: "AI/BI", mod_reports: "Reports",
  mod_api_integration: "API/Integrations", mod_security: "Security", mod_workflow: "Workflow",
  mod_notifications: "Notifications", mod_audit: "Audit", mod_backup: "Backup",
  mod_mobile: "Mobile", mod_iot: "IoT", mod_cloud: "Cloud", mod_system_admin: "Admin",
  mod_ai_copilot: "AI Copilot", mod_automation: "Automation", mod_marketplace_pro: "Marketplace Pro",
  mod_franchise: "Franchise", mod_loyalty: "Loyalty", mod_affiliate: "Affiliate",
  mod_visitor: "Visitor", mod_legal: "Legal", mod_esg: "ESG",
  mod_communication: "Comms Hub", mod_user_management: "Users & Roles",
  kpi_total_revenue: "Total Revenue", kpi_net_profit: "Net Profit", kpi_total_sales: "Total Sales",
  kpi_total_orders: "Total Orders", kpi_total_customers: "Total Customers",
  kpi_total_employees: "Total Employees", kpi_total_products: "Total Products",
  kpi_total_expenses: "Total Expenses", kpi_low_stock: "Low Stock", kpi_out_of_stock: "Out of Stock",
  kpi_stock_value: "Stock Value", kpi_total_vendors: "Total Vendors", kpi_active_work_orders: "Active Work Orders",
  welcome_back: "Welcome back", real_time_overview: "Real-time overview of your entire business",
  revenue_overview: "Revenue Overview", performance_rings: "Performance Rings",
  profit_expense: "Profit & Expense", sales_by_country: "Sales by Country",
  branch_performance: "Branch Performance", system_alerts: "System Alerts",
  recent_orders: "Recent Orders", factory_floor: "Factory Floor — Live 3D View",
  ai_insights: "AI Business Insights", live: "Live", production_live: "Production · Live",
  all_systems_operational: "All systems operational", database_connected: "Database connected",
  modules_count: "modules",
  sign_in: "Sign In", sign_out: "Sign Out", email_address: "Email Address", password: "Password",
  remember_me: "Remember me for 30 days", forgot_password: "Forgot?",
  welcome_title: "Welcome back 👋", sign_in_to_dashboard: "Sign In to Dashboard",
  enterprise_edition: "Enterprise Edition", owned_by: "Owned by",
  page_customers: "CRM Dashboard", page_vendors: "Vendors Dashboard", page_products: "Product Management",
  page_sales: "Sales Management", page_purchase: "Purchase Management", page_inventory: "Inventory & Warehouse",
  page_manufacturing: "Manufacturing Management", page_payroll: "Payroll Management",
  page_finance: "Finance & Accounting", page_reports: "Reports & Analytics",
  page_user_management: "User Management", page_hr: "HR Management",
  form_name: "Full Name", form_email: "Email Address", form_phone: "Phone", form_address: "Address",
  form_country: "Country", form_segment: "Segment", form_credit_limit: "Credit Limit",
  form_status: "Status", form_sku: "SKU", form_price: "Price", form_stock: "Stock",
  form_quantity: "Quantity", form_category: "Category", form_branch: "Branch", form_role: "Role",
  form_department: "Department", form_designation: "Designation", form_password: "Password",
  form_new_password: "New Password", form_confirm_password: "Confirm Password",
  btn_add_customer: "New Customer", btn_add_vendor: "Add Vendor", btn_add_product: "New Product",
  btn_new_order: "New Sales Order", btn_new_po: "New Purchase Order", btn_new_work_order: "New Work Order",
  btn_run_payroll: "Run Payroll", btn_new_user: "New User", btn_stock_adjustment: "Stock Adjustment",
  btn_create: "Create", btn_update: "Update", btn_delete: "Delete", btn_reset_password: "Reset Password",
  btn_generate_ai: "Generate AI Insights", btn_export_csv: "Export as CSV", btn_export_pdf: "Export as PDF",
  col_code: "Code", col_customer: "Customer", col_vendor: "Vendor", col_product: "Product",
  col_amount: "Amount", col_payment: "Payment", col_order_date: "Order Date",
  col_quantity: "Quantity", col_unit_price: "Unit Price", col_total: "Total", col_due: "Due",
  col_rating: "Rating", col_credit: "Credit", col_role: "Role", col_last_login: "Last Login",
  status_active: "Active", status_inactive: "Inactive", status_pending: "Pending",
  status_completed: "Completed", status_processing: "Processing", status_shipped: "Shipped",
  status_blocked: "Blocked", status_in_stock: "In Stock", status_low_stock: "Low Stock",
  status_out_of_stock: "Out of Stock",
  language: "Language", theme: "Theme", dark_mode: "Dark Mode", light_mode: "Light Mode",
  company: "Company", branch: "Branch", notifications: "Notifications", messages: "Messages",
  profile: "Profile", settings: "Settings", quick_actions: "Quick Actions",
  recently_visited: "Recently Visited", favorites: "Favorites", ai_assistant: "AI Assistant",
  bom: "BOM", work_order: "Work Order", production_tracking: "Production Tracking",
  quality_control: "Quality Control", planned_qty: "Planned Qty", produced_qty: "Produced Qty",
  rejected_qty: "Rejected Qty", progress: "Progress", priority: "Priority", supervisor: "Supervisor",
  salary_slip: "Salary Slip", payroll_run: "Payroll Run", gross_salary: "Gross Salary",
  net_salary: "Net Salary", tax_amount: "Tax Amount", deductions: "Deductions",
  allowances: "Allowances", overtime: "Overtime", present_days: "Present Days", absent_days: "Absent Days",
  total_users: "Total Users", administrators: "Administrators", staff_managers: "Staff & Managers",
  roles_defined: "Roles Defined", permission_matrix: "Roles & Permission Matrix",
  create_user_account: "Create New User Account", reset_password: "Reset Password",
  system_role: "System Role", account_status: "Account Status",
};

// Helper to create partial translations (fallback to English for missing keys)
function makeTranslation(partial: Partial<TranslationDict>): TranslationDict {
  return { ...en, ...partial };
}

const bn: TranslationDict = makeTranslation({
  dashboard: "ড্যাশবোর্ড", search: "অনুসন্ধান", search_placeholder: "গ্রাহক, বিক্রেতা, পণ্য, অর্ডার খুঁজুন...",
  export: "এক্সপোর্ট", import: "ইম্পোর্ট", add: "যোগ করুন", edit: "সম্পাদনা", delete: "মুছুন",
  save: "সংরক্ষণ", cancel: "বাতিল", confirm: "নিশ্চিত", close: "বন্ধ", loading: "লোড হচ্ছে...",
  no_data: "কোন তথ্য নেই", actions: "অ্যাকশন", status: "স্ট্যাটাস", date: "তারিখ",
  filter: "ফিল্টার", all: "সব", total: "মোট", name: "নাম", email: "ইমেইল", phone: "ফোন",
  address: "ঠিকানা", country: "দেশ", created_at: "তৈরির তারিখ",
  cat_executive: "নির্বাহী", cat_sales_crm: "বিক্রয় ও CRM", cat_purchase_inventory: "ক্রয় ও ইনভেন্টরি",
  cat_hr_finance: "HR ও অর্থ", cat_operations: "অপারেশন", cat_system: "সিস্টেম", cat_advanced: "উন্নত",
  mod_executive_dashboard: "ড্যাশবোর্ড", mod_crm: "CRM", mod_vendors: "বিক্রেতা", mod_products: "পণ্য",
  mod_sales: "বিক্রয়", mod_purchase: "ক্রয়", mod_inventory: "ইনভেন্টরি", mod_pos: "POS",
  mod_manufacturing: "উৎপাদন", mod_hr: "HR", mod_payroll: "পেরোল", mod_finance: "অর্থ",
  mod_reports: "রিপোর্ট", mod_user_management: "ব্যবহারকারী ও ভূমিকা",
  kpi_total_revenue: "মোট রাজস্ব", kpi_net_profit: "নিট লাভ", kpi_total_sales: "মোট বিক্রয়",
  kpi_total_orders: "মোট অর্ডার", kpi_total_customers: "মোট গ্রাহক", kpi_total_employees: "মোট কর্মী",
  kpi_total_products: "মোট পণ্য", kpi_total_expenses: "মোট খরচ",
  welcome_back: "ফিরে আসায় স্বাগতম", real_time_overview: "আপনার পুরো ব্যবসার রিয়েল-টাইম ওভারভিউ",
  revenue_overview: "রাজস্ব ওভারভিউ", performance_rings: "পারফরম্যান্স রিং",
  profit_expense: "লাভ ও খরচ", sales_by_country: "দেশ অনুযায়ী বিক্রয়",
  branch_performance: "শাখার পারফরম্যান্স", system_alerts: "সিস্টেম সতর্কতা",
  recent_orders: "সাম্প্রতিক অর্ডার", factory_floor: "কারখানা ফ্লোর — লাইভ 3D ভিউ",
  ai_insights: "AI বিজনেস ইনসাইটস", live: "লাইভ",
  sign_in: "সাইন ইন", sign_out: "সাইন আউট", email_address: "ইমেইল ঠিকানা", password: "পাসওয়ার্ড",
  welcome_title: "ফিরে আসায় স্বাগতম 👋", sign_in_to_dashboard: "ড্যাশবোর্ডে সাইন ইন করুন",
  enterprise_edition: "এন্টারপ্রাইজ সংস্করণ",
  language: "ভাষা", company: "কোম্পানি", branch: "শাখা", notifications: "বিজ্ঞপ্তি",
  profile: "প্রোফাইল", settings: "সেটিংস", ai_assistant: "AI সহকারী",
});

const ar: TranslationDict = makeTranslation({
  dashboard: "لوحة التحكم", search: "بحث", search_placeholder: "ابحث عن العملاء والموردين والمنتجات...",
  export: "تصدير", import: "استيراد", add: "إضافة", edit: "تحرير", delete: "حذف",
  save: "حفظ", cancel: "إلغاء", confirm: "تأكيد", close: "إغلاق", loading: "جار التحميل...",
  no_data: "لا توجد بيانات", actions: "إجراءات", status: "الحالة", date: "التاريخ",
  filter: "تصفية", all: "الكل", total: "المجموع", name: "الاسم", email: "البريد الإلكتروني",
  phone: "الهاتف", address: "العنوان", country: "الدولة", created_at: "تاريخ الإنشاء",
  cat_executive: "تنفيذي", cat_sales_crm: "المبيعات و CRM", cat_purchase_inventory: "المشتريات والمخزون",
  cat_hr_finance: "الموارد البشرية والمالية", cat_operations: "العمليات", cat_system: "النظام", cat_advanced: "متقدم",
  mod_executive_dashboard: "لوحة التحكم", mod_crm: "CRM", mod_vendors: "الموردون", mod_products: "المنتجات",
  mod_sales: "المبيعات", mod_purchase: "المشتريات", mod_inventory: "المخزون", mod_pos: "POS",
  mod_manufacturing: "التصنيع", mod_hr: "الموارد البشرية", mod_payroll: "الرواتب", mod_finance: "المالية",
  mod_reports: "التقارير", mod_user_management: "المستخدمون والأدوار",
  kpi_total_revenue: "إجمالي الإيرادات", kpi_net_profit: "صافي الربح", kpi_total_sales: "إجمالي المبيعات",
  kpi_total_orders: "إجمالي الطلبات", kpi_total_customers: "إجمالي العملاء", kpi_total_employees: "إجمالي الموظفين",
  kpi_total_products: "إجمالي المنتجات", kpi_total_expenses: "إجمالي المصاريف",
  welcome_back: "مرحبا بعودتك", real_time_overview: "نظرة عامة في الوقت الحقيقي على أعمالك بالكامل",
  sign_in: "تسجيل الدخول", sign_out: "تسجيل الخروج", email_address: "البريد الإلكتروني", password: "كلمة المرور",
  welcome_title: "مرحبا بعودتك 👋", sign_in_to_dashboard: "تسجيل الدخول إلى لوحة التحكم",
  enterprise_edition: "نسخة المؤسسة",
  language: "اللغة", company: "الشركة", branch: "الفرع", notifications: "الإشعارات",
  profile: "الملف الشخصي", settings: "الإعدادات", ai_assistant: "مساعد الذكاء الاصطناعي",
});

const ur: TranslationDict = makeTranslation({
  dashboard: "ڈیش بورڈ", search: "تلاش", search_placeholder: "گاہک، وینڈرز، مصنوعات تلاش کریں...",
  export: "ایکسپورٹ", import: "امپورٹ", add: "شامل کریں", edit: "ترمیم", delete: "حذف",
  save: "محفوظ", cancel: "منسوخ", confirm: "تصدیق", close: "بند", loading: "لوڈ ہو رہا ہے...",
  no_data: "کوئی ڈیٹا نہیں", actions: "اقدامات", status: "حالت", date: "تاریخ",
  filter: "فلٹر", all: "تمام", total: "کل", name: "نام", email: "ای میل", phone: "فون",
  address: "پتہ", country: "ملک", created_at: "تاریخ تخلیق",
  cat_executive: "ایگزیکٹو", cat_sales_crm: "سیلز و CRM", cat_purchase_inventory: "خرید و انوینٹری",
  cat_hr_finance: "HR و فنانس", cat_operations: "آپریشنز", cat_system: "سسٹم", cat_advanced: "ایڈوانسڈ",
  mod_executive_dashboard: "ڈیش بورڈ", mod_crm: "CRM", mod_vendors: "وینڈرز", mod_products: "مصنوعات",
  mod_sales: "سیلز", mod_purchase: "خرید", mod_inventory: "انوینٹری", mod_pos: "POS",
  mod_manufacturing: "مینوفیکچرنگ", mod_hr: "HR", mod_payroll: "پے رول", mod_finance: "فنانس",
  mod_reports: "رپورٹس", mod_user_management: "یوزرز و رولز",
  kpi_total_revenue: "کل آمدنی", kpi_net_profit: "خالص منافع", kpi_total_sales: "کل سیلز",
  kpi_total_orders: "کل آرڈرز", kpi_total_customers: "کل گاہک", kpi_total_employees: "کل ملازمین",
  kpi_total_products: "کل مصنوعات", kpi_total_expenses: "کل اخراجات",
  welcome_back: "واپس خوش آمدید", real_time_overview: "آپ کے پورے کاروبار کا ریئل ٹائم جائزہ",
  sign_in: "سائن ان", sign_out: "سائن آؤٹ", email_address: "ای میل ایڈریس", password: "پاس ورڈ",
  welcome_title: "واپس خوش آمدید 👋", sign_in_to_dashboard: "ڈیش بورڈ میں سائن ان کریں",
  enterprise_edition: "اینٹرپرائز ایڈیشن",
  language: "زبان", company: "کمپنی", branch: "برانچ", notifications: "نوٹیفکیشنز",
  profile: "پروفائل", settings: "سیٹنگز", ai_assistant: "AI اسسٹنٹ",
});

const hi: TranslationDict = makeTranslation({
  dashboard: "डैशबोर्ड", search: "खोज", search_placeholder: "ग्राहक, विक्रेता, उत्पाद खोजें...",
  export: "निर्यात", import: "आयात", add: "जोड़ें", edit: "संपादित करें", delete: "हटाएं",
  save: "सहेजें", cancel: "रद्द करें", confirm: "पुष्टि करें", close: "बंद करें", loading: "लोड हो रहा है...",
  no_data: "कोई डेटा नहीं", actions: "क्रियाएं", status: "स्थिति", date: "तारीख",
  filter: "फ़िल्टर", all: "सभी", total: "कुल", name: "नाम", email: "ईमेल", phone: "फ़ोन",
  address: "पता", country: "देश", created_at: "बनाया गया",
  cat_executive: "कार्यकारी", cat_sales_crm: "बिक्री और CRM", cat_purchase_inventory: "खरीद और इन्वेंट्री",
  cat_hr_finance: "HR और वित्त", cat_operations: "संचालन", cat_system: "सिस्टम", cat_advanced: "उन्नत",
  mod_executive_dashboard: "डैशबोर्ड", mod_crm: "CRM", mod_vendors: "विक्रेता", mod_products: "उत्पाद",
  mod_sales: "बिक्री", mod_purchase: "खरीद", mod_inventory: "इन्वेंट्री", mod_pos: "POS",
  mod_manufacturing: "विनिर्माण", mod_hr: "HR", mod_payroll: "वेतन", mod_finance: "वित्त",
  mod_reports: "रिपोर्ट", mod_user_management: "उपयोगकर्ता और भूमिकाएं",
  kpi_total_revenue: "कुल राजस्व", kpi_net_profit: "शुद्ध लाभ", kpi_total_sales: "कुल बिक्री",
  kpi_total_orders: "कुल ऑर्डर", kpi_total_customers: "कुल ग्राहक", kpi_total_employees: "कुल कर्मचारी",
  kpi_total_products: "कुल उत्पाद", kpi_total_expenses: "कुल खर्च",
  welcome_back: "वापसी पर स्वागत है", sign_in: "साइन इन", sign_out: "साइन आउट",
  password: "पासवर्ड", enterprise_edition: "एंटरप्राइज़ संस्करण",
  language: "भाषा", company: "कंपनी", branch: "शाखा", notifications: "सूचनाएं",
});

const zh: TranslationDict = makeTranslation({
  dashboard: "仪表板", search: "搜索", search_placeholder: "搜索客户、供应商、产品...",
  export: "导出", import: "导入", add: "添加", edit: "编辑", delete: "删除",
  save: "保存", cancel: "取消", confirm: "确认", close: "关闭", loading: "加载中...",
  no_data: "无数据", actions: "操作", status: "状态", date: "日期",
  filter: "筛选", all: "全部", total: "总计", name: "名称", email: "邮箱", phone: "电话",
  address: "地址", country: "国家", created_at: "创建时间",
  cat_executive: "执行", cat_sales_crm: "销售与CRM", cat_purchase_inventory: "采购与库存",
  cat_hr_finance: "人事与财务", cat_operations: "运营", cat_system: "系统", cat_advanced: "高级",
  mod_executive_dashboard: "仪表板", mod_crm: "CRM", mod_vendors: "供应商", mod_products: "产品",
  mod_sales: "销售", mod_purchase: "采购", mod_inventory: "库存", mod_pos: "POS",
  mod_manufacturing: "制造", mod_hr: "人事", mod_payroll: "工资", mod_finance: "财务",
  mod_reports: "报告", mod_user_management: "用户与角色",
  kpi_total_revenue: "总收入", kpi_net_profit: "净利润", kpi_total_sales: "总销售额",
  kpi_total_orders: "总订单", kpi_total_customers: "总客户", kpi_total_employees: "总员工",
  kpi_total_products: "总产品", kpi_total_expenses: "总支出",
  welcome_back: "欢迎回来", sign_in: "登录", sign_out: "退出", password: "密码",
  enterprise_edition: "企业版", language: "语言", company: "公司", branch: "分支",
  notifications: "通知", profile: "个人资料", settings: "设置", ai_assistant: "AI助手",
});

const ja: TranslationDict = makeTranslation({
  dashboard: "ダッシュボード", search: "検索", search_placeholder: "顧客、仕入先、製品を検索...",
  export: "エクスポート", import: "インポート", add: "追加", edit: "編集", delete: "削除",
  save: "保存", cancel: "キャンセル", confirm: "確認", close: "閉じる", loading: "読み込み中...",
  no_data: "データなし", actions: "アクション", status: "ステータス", date: "日付",
  filter: "フィルター", all: "すべて", total: "合計", name: "名前", email: "メール", phone: "電話",
  address: "住所", country: "国", created_at: "作成日",
  cat_executive: "エグゼクティブ", cat_sales_crm: "営業・CRM", cat_purchase_inventory: "購買・在庫",
  cat_hr_finance: "人事・財務", cat_operations: "運営", cat_system: "システム", cat_advanced: "高度",
  mod_executive_dashboard: "ダッシュボード", mod_crm: "CRM", mod_vendors: "仕入先", mod_products: "製品",
  mod_sales: "営業", mod_purchase: "購買", mod_inventory: "在庫", mod_pos: "POS",
  mod_manufacturing: "製造", mod_hr: "人事", mod_payroll: "給与", mod_finance: "財務",
  mod_reports: "レポート", mod_user_management: "ユーザーとロール",
  kpi_total_revenue: "総収益", kpi_net_profit: "純利益", kpi_total_sales: "総売上",
  kpi_total_orders: "総注文", kpi_total_customers: "総顧客", kpi_total_employees: "総従業員",
  kpi_total_products: "総製品", kpi_total_expenses: "総経費",
  welcome_back: "おかえりなさい", sign_in: "ログイン", sign_out: "ログアウト", password: "パスワード",
  enterprise_edition: "エンタープライズ版", language: "言語", company: "会社", branch: "支店",
  notifications: "通知", profile: "プロフィール", settings: "設定", ai_assistant: "AIアシスタント",
});

const fr: TranslationDict = makeTranslation({
  dashboard: "Tableau de bord", search: "Rechercher", search_placeholder: "Rechercher clients, fournisseurs, produits...",
  export: "Exporter", import: "Importer", add: "Ajouter", edit: "Modifier", delete: "Supprimer",
  save: "Enregistrer", cancel: "Annuler", confirm: "Confirmer", close: "Fermer", loading: "Chargement...",
  no_data: "Aucune donnée", actions: "Actions", status: "Statut", date: "Date",
  filter: "Filtrer", all: "Tout", total: "Total", name: "Nom", email: "Email", phone: "Téléphone",
  address: "Adresse", country: "Pays", created_at: "Créé le",
  cat_executive: "Exécutif", cat_sales_crm: "Ventes & CRM", cat_purchase_inventory: "Achats & Stock",
  cat_hr_finance: "RH & Finance", cat_operations: "Opérations", cat_system: "Système", cat_advanced: "Avancé",
  mod_executive_dashboard: "Tableau de bord", mod_crm: "CRM", mod_vendors: "Fournisseurs", mod_products: "Produits",
  mod_sales: "Ventes", mod_purchase: "Achats", mod_inventory: "Stock", mod_pos: "POS",
  mod_manufacturing: "Production", mod_hr: "RH", mod_payroll: "Paie", mod_finance: "Finance",
  mod_reports: "Rapports", mod_user_management: "Utilisateurs & Rôles",
  kpi_total_revenue: "Revenu total", kpi_net_profit: "Profit net", kpi_total_sales: "Ventes totales",
  kpi_total_orders: "Commandes totales", kpi_total_customers: "Clients totaux", kpi_total_employees: "Employés totaux",
  kpi_total_products: "Produits totaux", kpi_total_expenses: "Dépenses totales",
  welcome_back: "Bon retour", sign_in: "Connexion", sign_out: "Déconnexion", password: "Mot de passe",
  enterprise_edition: "Édition Entreprise", language: "Langue", company: "Société", branch: "Filiale",
  notifications: "Notifications", profile: "Profil", settings: "Paramètres", ai_assistant: "Assistant IA",
});

const de: TranslationDict = makeTranslation({
  dashboard: "Dashboard", search: "Suche", search_placeholder: "Kunden, Lieferanten, Produkte suchen...",
  export: "Exportieren", import: "Importieren", add: "Hinzufügen", edit: "Bearbeiten", delete: "Löschen",
  save: "Speichern", cancel: "Abbrechen", confirm: "Bestätigen", close: "Schließen", loading: "Laden...",
  no_data: "Keine Daten", actions: "Aktionen", status: "Status", date: "Datum",
  filter: "Filter", all: "Alle", total: "Gesamt", name: "Name", email: "E-Mail", phone: "Telefon",
  address: "Adresse", country: "Land", created_at: "Erstellt am",
  cat_executive: "Geschäftsführung", cat_sales_crm: "Vertrieb & CRM", cat_purchase_inventory: "Einkauf & Lager",
  cat_hr_finance: "HR & Finanzen", cat_operations: "Betrieb", cat_system: "System", cat_advanced: "Erweitert",
  mod_executive_dashboard: "Dashboard", mod_crm: "CRM", mod_vendors: "Lieferanten", mod_products: "Produkte",
  mod_sales: "Vertrieb", mod_purchase: "Einkauf", mod_inventory: "Lager", mod_pos: "POS",
  mod_manufacturing: "Produktion", mod_hr: "HR", mod_payroll: "Gehalt", mod_finance: "Finanzen",
  mod_reports: "Berichte", mod_user_management: "Benutzer & Rollen",
  kpi_total_revenue: "Gesamtumsatz", kpi_net_profit: "Nettogewinn", kpi_total_sales: "Gesamtverkäufe",
  kpi_total_orders: "Gesamtbestellungen", kpi_total_customers: "Gesamtkunden", kpi_total_employees: "Gesamtmitarbeiter",
  kpi_total_products: "Gesamtprodukte", kpi_total_expenses: "Gesamtausgaben",
  welcome_back: "Willkommen zurück", sign_in: "Anmelden", sign_out: "Abmelden", password: "Passwort",
  enterprise_edition: "Enterprise Edition", language: "Sprache", company: "Unternehmen", branch: "Filiale",
  notifications: "Benachrichtigungen", profile: "Profil", settings: "Einstellungen", ai_assistant: "KI-Assistent",
});

const es: TranslationDict = makeTranslation({
  dashboard: "Panel", search: "Buscar", search_placeholder: "Buscar clientes, proveedores, productos...",
  export: "Exportar", import: "Importar", add: "Agregar", edit: "Editar", delete: "Eliminar",
  save: "Guardar", cancel: "Cancelar", confirm: "Confirmar", close: "Cerrar", loading: "Cargando...",
  no_data: "Sin datos", actions: "Acciones", status: "Estado", date: "Fecha",
  filter: "Filtrar", all: "Todo", total: "Total", name: "Nombre", email: "Correo", phone: "Teléfono",
  address: "Dirección", country: "País", created_at: "Creado el",
  cat_executive: "Ejecutivo", cat_sales_crm: "Ventas y CRM", cat_purchase_inventory: "Compras e Inventario",
  cat_hr_finance: "RRHH y Finanzas", cat_operations: "Operaciones", cat_system: "Sistema", cat_advanced: "Avanzado",
  mod_executive_dashboard: "Panel", mod_crm: "CRM", mod_vendors: "Proveedores", mod_products: "Productos",
  mod_sales: "Ventas", mod_purchase: "Compras", mod_inventory: "Inventario", mod_pos: "POS",
  mod_manufacturing: "Producción", mod_hr: "RRHH", mod_payroll: "Nómina", mod_finance: "Finanzas",
  mod_reports: "Informes", mod_user_management: "Usuarios y Roles",
  kpi_total_revenue: "Ingresos Totales", kpi_net_profit: "Beneficio Neto", kpi_total_sales: "Ventas Totales",
  kpi_total_orders: "Pedidos Totales", kpi_total_customers: "Clientes Totales", kpi_total_employees: "Empleados Totales",
  kpi_total_products: "Productos Totales", kpi_total_expenses: "Gastos Totales",
  welcome_back: "Bienvenido de nuevo", sign_in: "Iniciar sesión", sign_out: "Cerrar sesión", password: "Contraseña",
  enterprise_edition: "Edición Enterprise", language: "Idioma", company: "Empresa", branch: "Sucursal",
  notifications: "Notificaciones", profile: "Perfil", settings: "Configuración", ai_assistant: "Asistente IA",
});

const tr: TranslationDict = makeTranslation({
  dashboard: "Kontrol Paneli", search: "Ara", search_placeholder: "Müşteri, tedarikçi, ürün ara...",
  export: "Dışa Aktar", import: "İçe Aktar", add: "Ekle", edit: "Düzenle", delete: "Sil",
  save: "Kaydet", cancel: "İptal", confirm: "Onayla", close: "Kapat", loading: "Yükleniyor...",
  no_data: "Veri yok", actions: "İşlemler", status: "Durum", date: "Tarih",
  filter: "Filtrele", all: "Tümü", total: "Toplam", name: "Ad", email: "E-posta", phone: "Telefon",
  address: "Adres", country: "Ülke", created_at: "Oluşturma",
  cat_executive: "Yönetim", cat_sales_crm: "Satış ve CRM", cat_purchase_inventory: "Satın Alma ve Stok",
  cat_hr_finance: "İK ve Finans", cat_operations: "Operasyonlar", cat_system: "Sistem", cat_advanced: "Gelişmiş",
  mod_executive_dashboard: "Panel", mod_crm: "CRM", mod_vendors: "Tedarikçiler", mod_products: "Ürünler",
  mod_sales: "Satış", mod_purchase: "Satın Alma", mod_inventory: "Stok", mod_pos: "POS",
  mod_manufacturing: "Üretim", mod_hr: "İK", mod_payroll: "Bordro", mod_finance: "Finans",
  mod_reports: "Raporlar", mod_user_management: "Kullanıcılar ve Roller",
  kpi_total_revenue: "Toplam Gelir", kpi_net_profit: "Net Kâr", kpi_total_sales: "Toplam Satış",
  kpi_total_orders: "Toplam Sipariş", kpi_total_customers: "Toplam Müşteri", kpi_total_employees: "Toplam Çalışan",
  kpi_total_products: "Toplam Ürün", kpi_total_expenses: "Toplam Gider",
  welcome_back: "Tekrar hoş geldiniz", sign_in: "Giriş yap", sign_out: "Çıkış yap", password: "Şifre",
  enterprise_edition: "Kurumsal Sürüm", language: "Dil", company: "Şirket", branch: "Şube",
  notifications: "Bildirimler", profile: "Profil", settings: "Ayarlar", ai_assistant: "AI Asistanı",
});

const ru: TranslationDict = makeTranslation({
  dashboard: "Панель управления", search: "Поиск", search_placeholder: "Поиск клиентов, поставщиков, товаров...",
  export: "Экспорт", import: "Импорт", add: "Добавить", edit: "Изменить", delete: "Удалить",
  save: "Сохранить", cancel: "Отмена", confirm: "Подтвердить", close: "Закрыть", loading: "Загрузка...",
  no_data: "Нет данных", actions: "Действия", status: "Статус", date: "Дата",
  filter: "Фильтр", all: "Все", total: "Итого", name: "Имя", email: "Эл. почта", phone: "Телефон",
  address: "Адрес", country: "Страна", created_at: "Создано",
  cat_executive: "Руководство", cat_sales_crm: "Продажи и CRM", cat_purchase_inventory: "Закупки и склад",
  cat_hr_finance: "Кадры и финансы", cat_operations: "Операции", cat_system: "Система", cat_advanced: "Дополнительно",
  mod_executive_dashboard: "Панель", mod_crm: "CRM", mod_vendors: "Поставщики", mod_products: "Товары",
  mod_sales: "Продажи", mod_purchase: "Закупки", mod_inventory: "Склад", mod_pos: "POS",
  mod_manufacturing: "Производство", mod_hr: "Кадры", mod_payroll: "Зарплата", mod_finance: "Финансы",
  mod_reports: "Отчёты", mod_user_management: "Пользователи и роли",
  kpi_total_revenue: "Общий доход", kpi_net_profit: "Чистая прибыль", kpi_total_sales: "Общие продажи",
  kpi_total_orders: "Всего заказов", kpi_total_customers: "Всего клиентов", kpi_total_employees: "Всего сотрудников",
  kpi_total_products: "Всего товаров", kpi_total_expenses: "Общие расходы",
  welcome_back: "С возвращением", sign_in: "Войти", sign_out: "Выйти", password: "Пароль",
  enterprise_edition: "Корпоративная версия", language: "Язык", company: "Компания", branch: "Филиал",
  notifications: "Уведомления", profile: "Профиль", settings: "Настройки", ai_assistant: "ИИ-ассистент",
});

export const translations: Record<LanguageCode, TranslationDict> = {
  en, bn, ar, ur, hi, zh, ja, fr, de, es, tr, ru,
};
