"use client";

import { useEffect, useState } from "react";
import { Key, Check } from "lucide-react";
import {
  getPermissions,
  getRoles,
  updateRolePermissions,
} from "@/features/users/api/users.client";
import {
  CatalogRole,
  Permission,
} from "@/features/users/contracts/users.contract";

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<CatalogRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([getPermissions(), getRoles()])
      .then(([permissionList, roleList]) => {
        if (!active) return;
        setPermissions(permissionList);
        setRoles(roleList);
        setIsError(false);
      })
      .catch((error) => {
        console.error("Failed to load permissions", error);
        if (active) setIsError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const togglePermission = async (role: CatalogRole, permCode: string) => {
    const roleId = role.id;
    if (!roleId || savingRoleId === roleId) return;

    const current = role.permissionCodes;
    const updated = current.includes(permCode)
      ? current.filter((c) => c !== permCode)
      : [...current, permCode];

    const previousRoles = roles;
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId ? { ...r, permissionCodes: updated } : r,
      ),
    );
    setSavingRoleId(roleId);
    setSaveError(null);

    try {
      await updateRolePermissions(roleId, updated);
    } catch (error) {
      console.error("Failed to update role permissions", error);
      setRoles(previousRoles);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save permissions. Please try again.",
      );
    } finally {
      setSavingRoleId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
          <Key className="w-7 h-7 text-[var(--brand-core)]" />
          Permissions Matrix
        </h1>
        <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
          Configure dynamic permission matrixes and enforce fine-grained access
          control across system roles.
        </p>
      </div>

      {/* ROLES & PERMISSIONS MATRIX */}
      <div className="space-y-6">
        <div className="p-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Role-Based Authorization Matrix
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Toggle granular capabilities per system role. Changes apply across
            API endpoints instantly.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md overflow-x-auto">
          {saveError && (
            <p className="mb-4 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30">
              {saveError}
            </p>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-sm font-bold text-[var(--text-tertiary)]">
                Loading permission matrix...
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-sm font-bold text-red-400">
                Failed to load permissions. Please try again later.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <th className="pb-3 px-4 w-1/3">Permission Code & Name</th>
                  {roles.map((role) => (
                    <th key={role.roleName} className="pb-3 px-4 text-center">
                      <span className="font-bold text-sky-400 block text-xs">
                        {role.roleName}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)] text-sm">
                {permissions.map((perm) => (
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
                    {roles.map((role) => {
                      const hasPerm = role.permissionCodes.includes(perm.code);
                      const isSuperAdmin = role.roleName === "ADMIN";
                      const isSaving = savingRoleId === role.id;

                      return (
                        <td
                          key={role.roleName}
                          className="py-4 px-4 text-center"
                        >
                          <button
                            disabled={isSuperAdmin || isSaving}
                            onClick={() => togglePermission(role, perm.code)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              hasPerm || isSuperAdmin
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-[var(--background-primary)] border border-[var(--border-default)] text-transparent hover:border-cyan-400"
                            } ${isSaving ? "opacity-50" : ""}`}
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
          )}
        </div>
      </div>
    </div>
  );
}
