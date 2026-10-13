"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { TeamModal } from "./TeamModal";
import {
  type OrgMember,
  type OrgStore,
  type SellerCatalogue,
  type SellerFeature,
} from "../contracts/team.contract";
import {
  defaultPermissionsForRole,
  isAdminRole as roleIsAdmin,
  sanitizePermissions,
  unknownPermissions,
} from "../lib/team.permissions";
import { FeatureAccessGrid } from "./FeatureAccessGrid";

interface MemberEditModalProps {
  member: OrgMember;
  stores: OrgStore[];
  catalogue: SellerCatalogue;
  isPending: boolean;
  onClose: () => void;
  /**
   * `permissions` is omitted when the admin never touched the grid. The API
   * treats an absent list as "leave the column alone" and a present one as
   * authoritative, so sending it unconditionally rewrote rows nobody edited.
   */
  onSave: (input: {
    role: string;
    storeIds: string[];
    permissions?: SellerFeature[];
  }) => void;
}

export function MemberEditModal({
  member,
  stores,
  catalogue,
  isPending,
  onClose,
  onSave,
}: MemberEditModalProps) {
  const [role, setRole] = useState<string>(member.role ?? "");
  const [storeIds, setStoreIds] = useState<string[]>(
    (member.assignedStores ?? []).map((s) => s.storeId),
  );
  // Only the codes the catalogue still defines can be rendered as checkboxes.
  const [permissions, setPermissions] = useState<SellerFeature[]>(
    sanitizePermissions(member.permissions ?? [], catalogue),
  );

  /**
   * Whether the grid was actually edited.
   *
   * The bug this closes: state was seeded from `sanitizePermissions`, which
   * drops codes the catalogue no longer defines, and that reduced array was then
   * submitted as the authoritative list. Opening a member and pressing Save
   * without touching anything destroyed every permission this build did not
   * recognise. Re-submitting the unknown codes is not the fix either — the API
   * rejects codes outside its catalogue with a 400 — so an untouched grid must
   * send nothing at all.
   */
  const [permissionsTouched, setPermissionsTouched] = useState(false);

  // Stale codes cannot be shown as ticked and cannot be sent back. Say so,
  // rather than dropping them silently the moment the role changes.
  const retired = unknownPermissions(member.permissions ?? [], catalogue);

  const isAdminRole = roleIsAdmin(role, catalogue);

  // Changing role swaps in that role's defaults, matching what the API would do
  // for a role change sent without an explicit list. That counts as touching the
  // grid: the API rewrites permissions on any role change anyway.
  const handleRoleChange = (next: string) => {
    setRole(next);
    setPermissions(defaultPermissionsForRole(next, catalogue));
    setPermissionsTouched(true);
  };

  const handlePermissionsChange = (next: SellerFeature[]) => {
    setPermissions(next);
    setPermissionsTouched(true);
  };

  const toggleStore = (storeId: string) => {
    setStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId],
    );
  };

  return (
    <TeamModal open onClose={onClose} title="Edit member" eyebrow="Team access">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          {member.user.firstName} {member.user.lastName} · {member.user.email}
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)]">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3 text-sm font-medium text-[var(--text-primary)]"
          >
            {catalogue.roles.map((r) => (
              <option key={r.name} value={r.name}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {retired.length > 0 && (
          <p className="rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3 text-xs text-[var(--text-secondary)]">
            This member holds {retired.length} permission
            {retired.length === 1 ? "" : "s"} that no longer exist
            {retired.length === 1 ? "s" : ""} ({retired.join(", ")}). They
            cannot be shown here, and changing the role will clear them.
          </p>
        )}

        <FeatureAccessGrid
          permissions={permissions}
          isAdminRole={isAdminRole}
          catalogue={catalogue}
          onChange={handlePermissionsChange}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Store access
            </label>
            {isAdminRole && (
              <span className="text-[10px] font-bold uppercase text-[var(--brand-core)]">
                Admin sees all stores
              </span>
            )}
          </div>
          {isAdminRole ? (
            <p className="rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3 text-xs text-[var(--text-secondary)]">
              Members with an admin role are granted access to every store in
              the organization. Store assignments are managed here only for
              limited roles.
            </p>
          ) : stores.length === 0 ? (
            <p className="rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3 text-xs text-[var(--text-secondary)]">
              No stores yet in this organization.
            </p>
          ) : (
            <div className="space-y-2 rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3">
              {stores.map((store) => {
                const checked = storeIds.includes(store.id);
                return (
                  <label
                    key={store.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStore(store.id)}
                      className="h-4 w-4 accent-[var(--brand-core)]"
                    />
                    <span className="truncate">{store.storeName}</span>
                    {!store.isActive && (
                      <span className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">
                        inactive
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            isLoading={isPending}
            onClick={() =>
              onSave({
                role,
                storeIds: isAdminRole ? [] : storeIds,
                // Untouched means "no opinion" — the API then leaves the stored
                // list exactly as it is.
                ...(permissionsTouched
                  ? { permissions: isAdminRole ? [] : permissions }
                  : {}),
              })
            }
          >
            Save changes
          </Button>
        </div>
      </div>
    </TeamModal>
  );
}
