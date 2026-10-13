"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useCreateStaffAccount } from "../hooks/useTeam";
import {
  type OrgStore,
  type SellerCatalogue,
  type SellerFeature,
  type SellerOrgRole,
} from "../contracts/team.contract";
import {
  defaultPermissionsForRole,
  isAdminRole as roleIsAdmin,
} from "../lib/team.permissions";
import { FeatureAccessGrid } from "./FeatureAccessGrid";
import { TeamModal } from "./TeamModal";

interface CreateStaffModalProps {
  stores: OrgStore[];
  catalogue: SellerCatalogue;
  onClose: () => void;
}

/**
 * Creates a staff account and assigns their stores in one step.
 *
 * Replaces the invite modal. An invite could only carry a role, so an accepted
 * one produced a member who could sign in and see nothing; store assignment
 * happens here, in the same transaction as the account.
 */
export function CreateStaffModal({
  stores,
  catalogue,
  onClose,
}: CreateStaffModalProps) {
  // The narrowest role the server offers. Catalogue order runs most- to
  // least-privileged, so a new hire starts at the bottom and is widened
  // deliberately rather than defaulting into more access than intended.
  const narrowestRole =
    [...catalogue.roles].reverse().find((r) => !r.isAdmin)?.name ??
    catalogue.roles[catalogue.roles.length - 1]?.name ??
    "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SellerOrgRole>(narrowestRole);
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<SellerFeature[]>(() =>
    defaultPermissionsForRole(narrowestRole, catalogue),
  );
  const [created, setCreated] = useState<{ url: string; hours: number } | null>(
    null,
  );

  const isAdminRole = roleIsAdmin(role, catalogue);

  // Picking a role swaps in its defaults, which the admin can then narrow.
  const handleRoleChange = (next: SellerOrgRole) => {
    setRole(next);
    setPermissions(defaultPermissionsForRole(next, catalogue));
  };

  const createMutation = useCreateStaffAccount({
    onSuccess: (data) => {
      setCreated({
        url: data.setupUrl,
        hours: Math.round(data.expiresInMinutes / 60),
      });
      toast.success("Staff account created");
    },
  });

  const toggleStore = (id: string) =>
    setStoreIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const copyCode = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
      toast.success("Set-up link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  // An admin reaches every store the organization owns, so listing stores for
  // them would be misleading — the server ignores the field for admin roles.
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    (isAdminRole || storeIds.length > 0);

  return (
    <TeamModal
      open
      onClose={onClose}
      title={created ? "Account created" : "Add a staff member"}
      eyebrow="Team access"
    >
      {created ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            We emailed a set-up link to{" "}
            <strong className="text-[var(--text-primary)]">{email}</strong>.
            Share this copy if it does not arrive — it opens a page where they
            choose their own password, which you never see.
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3">
            <code className="min-w-0 flex-1 break-all text-xs text-[var(--text-primary)]">
              {created.url}
            </code>
            <Button
              variant="secondary"
              className="h-8 shrink-0 px-3"
              onClick={copyCode}
            >
              <CopyIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Expires in {created.hours} hours.
          </p>
          <Button fullWidth onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Rico"
                className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--brand-core)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Bautista"
                className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--brand-core)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--brand-core)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Role
            </label>
            <select
              value={role}
              onChange={(e) =>
                handleRoleChange(e.target.value as SellerOrgRole)
              }
              className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] px-3 text-sm font-medium text-[var(--text-primary)]"
            >
              {catalogue.roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <FeatureAccessGrid
            permissions={permissions}
            isAdminRole={isAdminRole}
            catalogue={catalogue}
            onChange={setPermissions}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Store access
            </label>
            {isAdminRole ? (
              <p className="rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3 text-xs text-[var(--text-secondary)]">
                Admins are granted access to every store in the organization,
                including stores added later.
              </p>
            ) : (
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-[var(--border-light)] p-2">
                {stores.length === 0 && (
                  <p className="p-2 text-xs text-[var(--text-tertiary)]">
                    No stores yet — create one before adding staff.
                  </p>
                )}
                {stores.map((store) => (
                  <label
                    key={store.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--background-secondary)]"
                  >
                    <input
                      type="checkbox"
                      checked={storeIds.includes(store.id)}
                      onChange={() => toggleStore(store.id)}
                    />
                    <span className="text-sm text-[var(--text-primary)]">
                      {store.storeName}
                    </span>
                    {!store.isActive && (
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        inactive
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              fullWidth
              isLoading={createMutation.isPending}
              disabled={!canSubmit}
              onClick={() =>
                createMutation.mutate({
                  firstName,
                  lastName,
                  email,
                  role,
                  storeIds: isAdminRole ? [] : storeIds,
                  permissions: isAdminRole ? [] : permissions,
                })
              }
            >
              Create account
            </Button>
          </div>
        </div>
      )}
    </TeamModal>
  );
}
