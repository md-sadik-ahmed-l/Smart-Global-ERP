"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ==================== DASHBOARD ====================
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
    refetchInterval: 60 * 1000, // refresh every minute (live dashboard)
  });
}

// ==================== CUSTOMERS ====================
export function useCustomers(params: { q?: string; status?: string; segment?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  if (params.segment) qs.set("segment", params.segment);
  return useQuery({
    queryKey: ["customers", params],
    queryFn: async () => {
      const res = await fetch(`/api/customers?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load customers");
      return res.json();
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create customer");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Customer created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update customer");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== VENDORS ====================
export function useVendors(params: { q?: string; status?: string; category?: string; country?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  if (params.category) qs.set("category", params.category);
  if (params.country) qs.set("country", params.country);
  return useQuery({
    queryKey: ["vendors", params],
    queryFn: async () => {
      const res = await fetch(`/api/vendors?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load vendors");
      return res.json();
    },
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create vendor");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== PRODUCTS ====================
export function useProducts(params: { q?: string; categoryId?: string; status?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.status) qs.set("status", params.status);
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await fetch(`/api/products?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== SALES ORDERS ====================
export function useSalesOrders(params: { q?: string; status?: string; customerId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  if (params.customerId) qs.set("customerId", params.customerId);
  return useQuery({
    queryKey: ["sales-orders", params],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load sales orders");
      return res.json();
    },
  });
}

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Sales order created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateSalesOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, paidAmount }: { id: string; status?: string; paidAmount?: number }) => {
      const data: any = {};
      if (status) data.status = status;
      if (paidAmount !== undefined) data.paidAmount = paidAmount;
      const res = await fetch(`/api/sales-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Order updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== PURCHASE ORDERS ====================
export function usePurchaseOrders(params: { q?: string; status?: string; vendorId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status) qs.set("status", params.status);
  if (params.vendorId) qs.set("vendorId", params.vendorId);
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: async () => {
      const res = await fetch(`/api/purchase-orders?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load purchase orders");
      return res.json();
    },
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create PO");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Purchase order created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== INVENTORY ====================
export function useInventory(params: { q?: string; lowStock?: boolean } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.lowStock) qs.set("lowStock", "true");
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load inventory");
      return res.json();
    },
  });
}

export function useStockAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to adjust stock");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Stock adjusted successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== CATEGORIES & BRANCHES ====================
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== NOTIFICATIONS ====================
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30 * 1000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ==================== MANUFACTURING ====================
export function useBOMs() {
  return useQuery({
    queryKey: ["boms"],
    queryFn: async () => {
      const res = await fetch("/api/manufacturing/boms");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useWorkOrders(status?: string) {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  return useQuery({
    queryKey: ["work-orders", status],
    queryFn: async () => {
      const res = await fetch(`/api/manufacturing/work-orders?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30 * 1000,
  });
}

export function useWorkOrderAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const method = data.action && ["release", "complete", "cancel"].includes(data.action) ? "PUT" : "POST";
      const res = await fetch("/api/manufacturing/work-orders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Work order updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== PAYROLL ====================
export function usePayrollRuns() {
  return useQuery({
    queryKey: ["payroll-runs"],
    queryFn: async () => {
      const res = await fetch("/api/payroll/runs");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useSalarySlips(params: { month?: number; year?: number; employeeId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.month) qs.set("month", String(params.month));
  if (params.year) qs.set("year", String(params.year));
  if (params.employeeId) qs.set("employeeId", params.employeeId);
  return useQuery({
    queryKey: ["salary-slips", params],
    queryFn: async () => {
      const res = await fetch(`/api/payroll/slips?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useRunPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { month: number; year: number }) => {
      const res = await fetch("/api/payroll/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
      qc.invalidateQueries({ queryKey: ["salary-slips"] });
      toast.success("Payroll run completed — salary slips generated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== EMPLOYEES ====================
export function useEmployees(department?: string) {
  const qs = new URLSearchParams();
  if (department) qs.set("department", department);
  return useQuery({
    queryKey: ["employees", department],
    queryFn: async () => {
      const res = await fetch(`/api/employees?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

// ==================== SYSTEM ====================
export function useSystemStats() {
  return useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const res = await fetch("/api/system/stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 15 * 1000,
  });
}

// ==================== USER MANAGEMENT ====================
export function useUsers(params: { q?: string; role?: string; status?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await fetch(`/api/users?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User account created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reset password");
      }
      return res.json();
    },
    onSuccess: () => toast.success("Password reset successfully"),
    onError: (e: any) => toast.error(e.message),
  });
}

// ==================== ROLES & PERMISSIONS ====================
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to load roles");
      return res.json();
    },
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create role");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_permissions", roleId, permissionIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update permissions");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role permissions updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
