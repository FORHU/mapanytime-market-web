"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Shield, Search, CheckCircle2, Pencil } from "lucide-react";
import {
  getUsers,
  getRoles,
  getUser,
  replaceUserRoles,
} from "@/features/users/api/users.client";
import {
  User as ApiUser,
  CatalogRole,
} from "@/features/users/contracts/users.contract";
import { ApiError } from "@/shared/errors/api-error";

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const [roleSaveError, setRoleSaveError] = useState<string | null>(null);
  const [roleCatalog, setRoleCatalog] = useState<CatalogRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [roleLoadError, setRoleLoadError] = useState<string | null>(null);
  const changeRoleModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showChangeRoleModal || !changeRoleModalRef.current) return;

    const focusableElements =
      changeRoleModalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showChangeRoleModal]);

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
    getRoles()
      .then(setRoleCatalog)
      .catch((error) => console.error("Failed to fetch roles", error));
  }, []);

  const toggleSelectedRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    );
  };

  const openChangeRoleModal = (usr: ApiUser) => {
    setSelectedUser(usr);
    setSelectedRoles([]);
    setRoleSaveError(null);
    setRoleLoadError(null);
    setIsLoadingRoles(true);
    setShowChangeRoleModal(true);

    Promise.all([getRoles(), getUser(usr.id)])
      .then(([catalog, user]) => {
        setRoleCatalog(catalog);
        setSelectedUser(user);
        setSelectedRoles((user.roles ?? []).map((role) => role.roleName));
      })
      .catch((error) => {
        console.error("Failed to load roles", error);
        setRoleLoadError(
          error instanceof ApiError ? error.message : "Failed to load roles.",
        );
      })
      .finally(() => setIsLoadingRoles(false));
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    setRoleSaveError(null);
    setIsSavingRoles(true);
    try {
      const updatedUser = await replaceUserRoles(
        selectedUser.id,
        selectedRoles,
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
      setShowChangeRoleModal(false);
    } catch (error) {
      console.error("Failed to save roles", error);
      setRoleSaveError(
        error instanceof ApiError
          ? error.message
          : "Failed to save role(s). Please try again.",
      );
    } finally {
      setIsSavingRoles(false);
    }
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
          <Shield className="w-7 h-7 text-[var(--brand-core)]" />
          User Accounts
        </h1>
        <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
          Assign user roles and manage account access across the platform.
        </p>
      </div>

      {/* USER ACCOUNTS */}
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
            {roleCatalog.map((catalogRole) => (
              <button
                key={catalogRole.roleName}
                onClick={() => setRoleFilter(catalogRole.roleName)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  roleFilter === catalogRole.roleName
                    ? "bg-[var(--brand-core)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]"
                }`}
              >
                {catalogRole.roleName} (
                {
                  users.filter((u) =>
                    (u.roles ?? []).some(
                      (userRole) => userRole.roleName === catalogRole.roleName,
                    ),
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
                        {roleCatalog.find(
                          (r) => r.roleName === (usr.roles ?? [])[0]?.roleName,
                        )?.permissionCodes?.length ?? 0}{" "}
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
                      <button
                        onClick={() => openChangeRoleModal(usr)}
                        title="Change Roles"
                        className="group"
                      >
                        <Pencil className="w-4 h-4 text-slate-400 hover:text-sky-400 transition-colors" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Modal to Change User Roles */}
      {showChangeRoleModal &&
        selectedUser &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              ref={changeRoleModalRef}
              className="max-w-md w-full p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] space-y-6 shadow-2xl"
            >
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Change Roles
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {(selectedUser.firstName || "") +
                    " " +
                    (selectedUser.lastName || "")}
                  {selectedUser.email ? ` · ${selectedUser.email}` : ""}
                </p>
              </div>

              <div className="space-y-2">
                {isLoadingRoles ? (
                  <p className="text-xs font-bold text-[var(--text-tertiary)] text-center py-4">
                    Loading roles...
                  </p>
                ) : roleLoadError ? (
                  <p className="text-xs font-bold text-red-400">
                    {roleLoadError}
                  </p>
                ) : (
                  roleCatalog.map((role) => {
                    const isChecked = selectedRoles.includes(role.roleName);
                    return (
                      <label
                        key={role.roleName}
                        className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                          isChecked
                            ? "border-[var(--brand-core)] bg-[var(--brand-core)]/5"
                            : "border-[var(--border-default)] hover:bg-[var(--background-tertiary)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectedRole(role.roleName)}
                          disabled={isSavingRoles}
                          className="mt-1 accent-[var(--brand-core)]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {role.roleName}
                          </p>
                          {role.description && (
                            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {roleSaveError && (
                <p className="text-xs font-bold text-red-400">
                  {roleSaveError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangeRoleModal(false)}
                  disabled={isSavingRoles}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoles}
                  disabled={isSavingRoles || isLoadingRoles}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold shadow-md hover:bg-sky-400 transition-colors disabled:opacity-40"
                >
                  {isSavingRoles ? "Saving..." : "Save Roles"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
