"use client";

import type {
  SellerCatalogue,
  SellerFeature,
} from "../contracts/team.contract";
import { togglePermission } from "../lib/team.permissions";

interface FeatureAccessGridProps {
  /** Null while the role is an admin one, which holds every feature implicitly. */
  permissions: SellerFeature[];
  isAdminRole: boolean;
  /** The server's feature list — this component renders it, it does not know it. */
  catalogue: SellerCatalogue;
  onChange: (next: SellerFeature[]) => void;
}

/**
 * The "Feature access" checkboxes shared by the create and edit member modals.
 *
 * Unticking everything is a legitimate state — the API honours an explicit empty
 * list rather than falling back to the role default — so there is deliberately
 * no "at least one" constraint here.
 */
export function FeatureAccessGrid({
  permissions,
  isAdminRole,
  catalogue,
  onChange,
}: FeatureAccessGridProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[var(--text-primary)]">
          Feature access
        </label>
        {isAdminRole && (
          <span className="text-[10px] font-bold uppercase text-[var(--brand-core)]">
            Admin sees everything
          </span>
        )}
      </div>

      {isAdminRole ? (
        <p className="rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3 text-xs text-[var(--text-secondary)]">
          Admins reach every part of the seller dashboard, so there is nothing
          to choose here.
        </p>
      ) : (
        <div className="space-y-2 rounded-xl border border-[var(--border-light)] bg-[var(--background-secondary)] p-3">
          {catalogue.features.map((feature) => (
            <label
              key={feature.code}
              className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]"
            >
              <input
                type="checkbox"
                checked={permissions.includes(feature.code)}
                onChange={() =>
                  onChange(
                    togglePermission(permissions, feature.code, catalogue),
                  )
                }
                className="h-4 w-4 accent-[var(--brand-core)]"
              />
              <span className="truncate">{feature.label}</span>
            </label>
          ))}
          {permissions.length === 0 && (
            <p className="pt-1 text-[11px] text-[var(--text-tertiary)]">
              With nothing ticked this member can sign in but reach no section
              of the dashboard.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
