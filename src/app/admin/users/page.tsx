"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  Search,
  CheckCircle2,
  Lock,
  Plus,
  Grid,
  Check,
  Key,
  Layers,
  Sparkles,
} from "lucide-react";
import { getUsers } from "@/features/users/api/users.client";
import { User as ApiUser } from "@/features/users/contracts/users.contract";

interface SystemPermission {
  code: string;
  name: string;
  category: string;
}

const SYSTEM_PERMISSIONS: SystemPermission[] = [
  {
    code: "stores.approve",
    name: "Approve Merchant Stores",
    category: "Store Operations",
  },
  {
    code: "stores.manage",
    name: "Manage Store Catalog",
    category: "Store Operations",
  },
  {
    code: "categories.manage",
    name: "Manage Marketplace Categories",
    category: "Taxonomy",
  },
  {
    code: "users.manage",
    name: "Manage User Accounts",
    category: "User Administration",
  },
  {
    code: "users.roles",
    name: "Manage Roles & Permissions",
    category: "User Administration",
  },
  {
    code: "orders.view",
    name: "View Order Stream & Pickups",
    category: "Order Management",
  },
  {
    code: "analytics.view",
    name: "View Platform Revenue Analytics",
    category: "Reporting",
  },
];

export default function AdminUsersPage() {
  const [activeView, setActiveView] = useState<"USERS" | "RBAC_MATRIX">(
    "USERS",
  );
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Role permissions state mapping
  const [rolePermissions, setRolePermissions] = useState<
    Record<string, string[]>
  >({
    ADMIN: [
      "stores.approve",
      "stores.manage",
      "categories.manage",
      "users.manage",
      "users.roles",
      "orders.view",
      "analytics.view",
    ],
    SELLER: ["stores.manage", "orders.view", "analytics.view"],
    SUPPORT_AGENT: ["orders.view", "stores.manage"],
    BUYER: [],
  });

  const [customRoles, setCustomRoles] = useState([
    { name: "ADMIN", desc: "Super Administrator with full platform control" },
    { name: "SELLER", desc: "Merchant store owner and product manager" },
    { name: "SUPPORT_AGENT", desc: "Customer support specialist" },
    { name: "BUYER", desc: "Standard marketplace buyer account" },
  ]);

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await getUsers();
      setUsers(response.users);
      setIsError(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const togglePermission = (roleName: string, permCode: string) => {
    setRolePermissions((prev) => {
      const current = prev[roleName] || [];
      const updated = current.includes(permCode)
        ? current.filter((c) => c !== permCode)
        : [...current, permCode];
      return { ...prev, [roleName]: updated };
    });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const formattedName = newRoleName.trim().toUpperCase().replace(/\s+/g, "_");
    setCustomRoles([
      ...customRoles,
      { name: formattedName, desc: newRoleDesc || "Custom system role" },
    ]);
    setRolePermissions({ ...rolePermissions, [formattedName]: [] });
    setNewRoleName("");
    setNewRoleDesc("");
    setShowCreateRoleModal(false);
  };

  const filteredUsers = users.filter((u) => {
    const roleNames = u.roles?.map((role) => role.roleName) ?? [];
    const matchesRole = roleFilter === "ALL" || roleNames.includes(roleFilter);
    const matchesSearch =
      (u.firstName || "")
        .concat(" ", u.lastName || "")
        .trim()
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <Shield className="w-7 h-7 text-[var(--brand-core)]" />
            User Roles & RBAC Matrix
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Assign user roles, configure dynamic permission matrixes, and
            enforce fine-grained access control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("USERS")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeView === "USERS"
                ? "bg-[var(--brand-core)] text-white shadow-md"
                : "border border-[var(--border-default)] bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveView("RBAC_MATRIX")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeView === "RBAC_MATRIX"
                ? "bg-cyan-600 text-white shadow-md"
                : "border border-[var(--border-default)] bg-[var(--background-secondary)] text-cyan-400 hover:bg-cyan-500/10"
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Permissions Matrix
          </button>
        </div>
      </div>

      {/* VIEW 1: USER ACCOUNTS */}
      {activeView === "USERS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setRoleFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  roleFilter === "ALL"
                    ? "bg-[var(--brand-core)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                }`}
              >
                All Users ({users.length})
              </button>
              {customRoles.map((r) => (
                <button
                  key={r.name}
                  onClick={() => setRoleFilter(r.name)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    roleFilter === r.name
                      ? "bg-[var(--brand-core)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                  }`}
                >
                  {r.name} (
                  {
                    users.filter((u) =>
                      (u.roles ?? []).some((role) => role.roleName === r.name),
                    ).length
                  }
                  )
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-sm font-bold text-[var(--text-tertiary)]">
                  Loading users...
                </p>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-sm font-bold text-red-400">
                  Failed to load users. Please try again later.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-light)] text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    <th className="pb-3 px-4">User</th>
                    <th className="pb-3 px-4">Email</th>
                    <th className="pb-3 px-4">Assigned Role</th>
                    <th className="pb-3 px-4">Active Permissions</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)] text-sm">
                  {filteredUsers.map((usr) => (
                    <tr
                      key={usr.id}
                      className="hover:bg-[var(--background-tertiary)]/40 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                          {((usr.firstName || "") + " " + (usr.lastName || ""))
                            .trim()
                            .charAt(0) || "U"}
                        </div>
                        {(
                          (usr.firstName || "") +
                          " " +
                          (usr.lastName || "")
                        ).trim() || usr.email}
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)] text-xs">
                        {usr.email}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-[var(--text-secondary)]">
                        {(usr.roles ?? [])
                          .map((role) => role.roleName)
                          .join(", ") || "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {
                            (
                              rolePermissions[
                                (usr.roles ?? [])[0]?.roleName ?? ""
                              ] || []
                            ).length
                          }{" "}
                          Granted
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-[var(--text-tertiary)]">
                        {usr.createdAt}
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-[var(--text-tertiary)]">
                        pencil
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ROLES & PERMISSIONS MATRIX */}
      {activeView === "RBAC_MATRIX" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Role-Based Authorization Matrix
              </h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Toggle granular capabilities per system role. Changes apply
                across API endpoints instantly.
              </p>
            </div>

            <button
              onClick={() => setShowCreateRoleModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Custom Role
            </button>
          </div>

          <div className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <th className="pb-3 px-4 w-1/3">Permission Code & Name</th>
                  {customRoles.map((role) => (
                    <th key={role.name} className="pb-3 px-4 text-center">
                      <span className="font-bold text-sky-400 block text-xs">
                        {role.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)] text-sm">
                {SYSTEM_PERMISSIONS.map((perm) => (
                  <tr
                    key={perm.code}
                    className="hover:bg-[var(--background-tertiary)]/40 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-xs text-[var(--text-primary)]">
                          {perm.name}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-400 mt-0.5">
                          {perm.code}
                        </p>
                      </div>
                    </td>
                    {customRoles.map((role) => {
                      const hasPerm = (
                        rolePermissions[role.name] || []
                      ).includes(perm.code);
                      const isSuperAdmin = role.name === "ADMIN";

                      return (
                        <td key={role.name} className="py-4 px-4 text-center">
                          <button
                            disabled={isSuperAdmin}
                            onClick={() =>
                              togglePermission(role.name, perm.code)
                            }
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              hasPerm || isSuperAdmin
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-[var(--background-primary)] border border-[var(--border-default)] text-transparent hover:border-cyan-400"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to Create Role */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Create New Custom Role
            </h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Role Identifer
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COMPLIANCE_OFFICER"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Responsibilities & scope"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold shadow-md hover:bg-sky-400 transition-colors"
                >
                  Save Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
