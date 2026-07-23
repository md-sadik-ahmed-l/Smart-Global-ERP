"use client";

import { useState } from "react";
import { UserCog, Plus, KeyRound, Shield, Users, CheckCircle2, XCircle, MoreHorizontal, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "../ui/StatCard";
import { DataTable, StatusBadge, type Column } from "../ui/DataTable";
import { PageHeader } from "../ui/PageHeader";
import { FormModal, type FormField } from "../ui/FormModal";
import {
  useUsers, useCreateUser, useUpdateUser, useDeleteUser, useResetPassword,
  useRoles, useBranches,
} from "@/lib/erp/hooks";
import { useSession } from "next-auth/react";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "#ef4444",
  CEO: "#f59e0b",
  MANAGER: "#3b82f6",
  STAFF: "#10b981",
  ACCOUNTANT: "#8b5cf6",
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CEO: "CEO",
  MANAGER: "Manager",
  STAFF: "Staff",
  ACCOUNTANT: "Accountant",
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  department: string | null;
  designation: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  branch: { name: string; code: string } | null;
  roleRef: { name: string } | null;
  permissions: string[];
  _count?: { salesOrders: number; purchaseOrders: number; auditLogs: number };
}

export function UserManagementModule() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading } = useUsers({ q: search, role: roleFilter, status: statusFilter });
  const { data: rolesData } = useRoles();
  const { data: branchData } = useBranches();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();

  const users = (data?.users || []) as User[];
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const adminUsers = users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "CEO").length;
  const staffUsers = users.filter((u) => u.role === "STAFF" || u.role === "MANAGER").length;

  const stats = [
    { label: "Total Users", value: totalUsers, delta: 0, icon: "Users", color: "#3b82f6", subtitle: `${activeUsers} active` },
    { label: "Administrators", value: adminUsers, delta: 0, icon: "Shield", color: "#ef4444", subtitle: "full access" },
    { label: "Staff & Managers", value: staffUsers, delta: 0, icon: "UserCog", color: "#10b981", subtitle: "operational" },
    { label: "Roles Defined", value: rolesData?.roles?.length ?? 0, delta: 0, icon: "Shield", color: "#8b5cf6", subtitle: "permission sets" },
  ];

  const iconMap: Record<string, any> = { Users, Shield, UserCog };

  const createFormFields: FormField[] = [
    { name: "name", label: "Full Name", type: "text", placeholder: "e.g. Rakib Hassan", required: true },
    { name: "email", label: "Email Address", type: "email", placeholder: "user@smartwebstudio.com", required: true },
    { name: "password", label: "Temporary Password", type: "text", placeholder: "Min 6 characters", required: true },
    { name: "role", label: "System Role", type: "select", default: "STAFF", required: true, options: [
      { value: "SUPER_ADMIN", label: "Super Admin — Full system access" },
      { value: "CEO", label: "CEO — Executive access" },
      { value: "MANAGER", label: "Manager — Department management" },
      { value: "ACCOUNTANT", label: "Accountant — Finance & payroll" },
      { value: "STAFF", label: "Staff — Day-to-day operations" },
    ]},
    { name: "phone", label: "Phone", type: "tel", placeholder: "+8801XXXXXXXXX" },
    { name: "department", label: "Department", type: "select", options: [
      { value: "Management", label: "Management" },
      { value: "Sales", label: "Sales" },
      { value: "Finance", label: "Finance" },
      { value: "HR", label: "HR & Admin" },
      { value: "Production", label: "Production" },
      { value: "IT", label: "IT" },
      { value: "Operations", label: "Operations" },
    ]},
    { name: "designation", label: "Designation", type: "text", placeholder: "e.g. Sales Manager" },
    {
      name: "branchId",
      label: "Assigned Branch",
      type: "select",
      options: (branchData?.branches || []).map((b: any) => ({ value: b.id, label: `${b.name} (${b.code})` })),
    },
    { name: "status", label: "Account Status", type: "select", default: "ACTIVE", options: [
      { value: "ACTIVE", label: "Active — can login" },
      { value: "INACTIVE", label: "Inactive — disabled" },
      { value: "SUSPENDED", label: "Suspended — temporary block" },
    ]},
  ];

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${roleColors[r.role]}20`, color: roleColors[r.role] }}
          >
            {r.avatar || r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {r.name}
              {r.id === currentUserId && <span className="ml-2 text-[10px] text-indigo-400">(You)</span>}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <span
          className="rounded-md px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `${roleColors[r.role]}15`, color: roleColors[r.role] }}
        >
          {roleLabels[r.role] || r.role}
        </span>
      ),
    },
    { key: "department", header: "Department", render: (r) => <span className="text-xs text-muted-foreground">{r.department || "—"}</span> },
    { key: "branch", header: "Branch", render: (r) => <span className="text-xs text-muted-foreground">{r.branch?.name || "—"}</span> },
    {
      key: "lastLoginAt",
      header: "Last Login",
      align: "center",
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "Never"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (r) => (
        <StatusBadge variant={r.status === "ACTIVE" ? "success" : r.status === "SUSPENDED" ? "danger" : "neutral"} dot>
          {r.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => { setSelectedUser(r); setShowPasswordModal(true); }}
            title="Reset Password"
          >
            <KeyRound className="h-3.5 w-3.5" />
          </Button>
          {isSuperAdmin && r.id !== currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10"
              onClick={() => {
                if (confirm(`Deactivate user "${r.name}"? They will no longer be able to login.`)) {
                  deleteUser.mutate(r.id);
                }
              }}
              title="Deactivate"
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Create user accounts, assign roles & manage access permissions"
        icon={UserCog}
        iconColor="#3b82f6"
        showAdd={isSuperAdmin}
        addLabel="New User"
        onAdd={() => setShowCreateModal(true)}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="CEO">CEO</option>
              <option value="MANAGER">Manager</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="STAFF">Staff</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = iconMap[s.icon] ?? Users;
          return <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} trend="up" icon={Icon} color={s.color} subtitle={s.subtitle} index={i} />;
        })}
      </div>

      {/* Roles overview */}
      {rolesData?.roles && (
        <Card className="glass p-5 rounded-xl">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Roles & Permission Matrix</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rolesData.roles.map((role: any, i: number) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-lg border border-border/60 bg-card/40 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-400">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{role.name}</p>
                      {role.isSystem && <span className="text-[9px] text-amber-400">SYSTEM</span>}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{role.userCount}</span>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{role.description || "Custom role"}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{role.permissions.length} permissions granted</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Users table */}
      <Card className="glass p-5 rounded-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">All Users</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${users.length} users in your organization`}
            </p>
          </div>
          <div className="relative w-48">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="h-8 border-border bg-card pl-9 text-sm"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </Card>

      {/* Create User Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New User Account"
        description="Create a new user with login access to the ERP system. The user will be able to login with the email and password you set."
        fields={createFormFields}
        onSubmit={(values) =>
          createUser.mutate(
            {
              name: values.name,
              email: values.email,
              password: values.password,
              role: values.role,
              phone: values.phone,
              department: values.department,
              designation: values.designation,
              branchId: values.branchId,
              status: values.status,
            },
            { onSuccess: () => setShowCreateModal(false) }
          )
        }
        loading={createUser.isPending}
        submitLabel="Create User Account"
      />

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => { setShowPasswordModal(false); setSelectedUser(null); }}
          onReset={(newPassword) =>
            resetPassword.mutate(
              { id: selectedUser.id, newPassword },
              { onSuccess: () => { setShowPasswordModal(false); setSelectedUser(null); } }
            )
          }
          loading={resetPassword.isPending}
        />
      )}
    </div>
  );
}

// Inline password reset modal
function ResetPasswordModal({
  user, onClose, onReset, loading,
}: {
  user: User;
  onClose: () => void;
  onReset: (password: string) => void;
  loading: boolean;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    onReset(newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <Card className="glass-strong w-full max-w-md p-6 rounded-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Reset Password</h3>
            <p className="text-xs text-muted-foreground">For: {user.name} ({user.email})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-400">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">New Password</label>
            <Input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="h-10 border-border bg-card text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
            <Input
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="h-10 border-border bg-card text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border bg-card text-foreground hover:bg-card/80">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
