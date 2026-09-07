"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useUpdateMember, useRemoveMember } from "../hooks/useTeam";
import {
  type OrgMember,
  type OrgStore,
  type SellerCatalogue,
} from "../contracts/team.contract";
import {
  isAdminRole as roleIsAdmin,
  sanitizePermissions,
} from "../lib/team.permissions";
import { MemberEditModal } from "./MemberEditModal";

interface MembersPanelProps {
  members: OrgMember[];
  stores: OrgStore[];
  /** Role labels, feature labels and admin-ness all come from here. */
  catalogue: SellerCatalogue;
  isAdmin: boolean;
  currentUserId: string | null;
}

export function MembersPanel({
  members,
  stores,
  catalogue,
  isAdmin,
  currentUserId,
}: MembersPanelProps) {
  const [editing, setEditing] = useState<OrgMember | null>(null);
  const [removing, setRemoving] = useState<OrgMember | null>(null);

  const updateMutation = useUpdateMember({
    onSuccess: () => {
      toast.success("Member updated");
      setEditing(null);
    },
  });

  const removeMutation = useRemoveMember({
    onSuccess: () => {
      toast.success("Member removed");
      setRemoving(null);
    },
  });

  const featureLabel = (code: string) =>
    catalogue.features.find((f) => f.code === code)?.label ?? code;

  // Falls back to the raw name so a role the catalogue has not caught up with
  // still renders as something, rather than an em dash that reads as "none".
  const roleLabel = (member: OrgMember) =>
    catalogue.roles.find((r) => r.name === member.role)?.label ??
    member.role ??
    "—";
  const isAdminMember = (member: OrgMember) =>
    roleIsAdmin(member.role, catalogue);

  const scopeLabel = (member: OrgMember) => {
    if (isAdminMember(member)) return "All stores";
    const count = member.assignedStores?.length ?? 0;
    return count === 0
      ? "No stores"
      : `${count} store${count === 1 ? "" : "s"}`;
  };

  // Admins hold every feature implicitly and store an empty list, so listing
  // chips for them would read as "no access" — exactly backwards.
  const featureChips = (member: OrgMember) =>
    isAdminMember(member)
      ? []
      : sanitizePermissions(member.permissions ?? [], catalogue);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-[var(--brand-core)]" />
          <h3 className="text-sm font-black text-[var(--text-primary)]">
            Members
          </h3>
        </div>
        <StatusPill label={`${members.length}`} variant="info" />
      </CardHeader>

      <CardContent className="space-y-2">
        {members.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
            No members yet. Invite someone to your organization.
          </p>
        )}

        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--background-elevated)] p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                    {member.user.firstName} {member.user.lastName}
                    {isSelf && (
                      <span className="ml-1 text-[10px] font-bold uppercase text-[var(--text-tertiary)]">
                        (you)
                      </span>
                    )}
                  </p>
                  <StatusPill label={roleLabel(member)} variant="info" />
                  {member.isOwner && (
                    <StatusPill label="Owner" variant="success" />
                  )}
                </div>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {member.user.email} · {scopeLabel(member)}
                </p>
                {!isAdminMember(member) && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {featureChips(member).length === 0 ? (
                      <span className="rounded-md bg-[var(--background-secondary)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--text-tertiary)]">
                        No features
                      </span>
                    ) : (
                      featureChips(member).map((feature) => (
                        <span
                          key={feature}
                          className="rounded-md bg-[var(--background-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
                        >
                          {featureLabel(feature)}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* The owner's row is not staff to manage: the API refuses to
                  edit or remove it for every caller, so showing the buttons
                  would only promise an action that 403s. */}
              {isAdmin && !isSelf && !member.isOwner && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="secondary"
                    className="h-8 w-8 px-0"
                    onClick={() => setEditing(member)}
                    aria-label={`Edit ${member.user.firstName}`}
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-8 w-8 px-0"
                    onClick={() => setRemoving(member)}
                    aria-label={`Remove ${member.user.firstName}`}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {editing && (
        <MemberEditModal
          member={editing}
          stores={stores}
          catalogue={catalogue}
          isPending={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSave={(input) =>
            updateMutation.mutate({
              // Forwarded whole rather than field-by-field: rebuilding the
              // object here silently dropped `permissions` when it was added,
              // and every field is optional so nothing type-checked.
              memberId: editing.id,
              input,
            })
          }
        />
      )}

      <ConfirmDialog
        open={!!removing}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) removeMutation.mutate(removing.id);
        }}
        title="Remove member?"
        description={`Remove ${removing?.user.firstName ?? ""} ${removing?.user.lastName ?? ""} from the organization? They will lose access immediately.`}
        confirmLabel="Remove member"
        isLoading={removeMutation.isPending}
      />
    </Card>
  );
}
