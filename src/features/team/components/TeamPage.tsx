"use client";

import { useState } from "react";
import { UsersIcon, UserPlusIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useOrgContext, useOrgMembers, useOrgStores } from "../hooks/useTeam";
import { MembersPanel } from "./MembersPanel";
import { CreateStaffModal } from "./CreateStaffModal";

export function TeamPage() {
  const { userId, isHydrated } = useCurrentUser();
  const [inviteOpen, setInviteOpen] = useState(false);

  const ready = isHydrated && !!userId;

  const contextQuery = useOrgContext(ready);

  // Members and org stores are only readable by organization admins (the
  // members endpoint is admin-gated), so we don't fire those queries until the
  // context confirms the caller is an admin.
  const adminReady = !!contextQuery.data && contextQuery.data.isAdmin === true;
  const membersQuery = useOrgMembers(adminReady);
  const storesQuery = useOrgStores(adminReady);

  const isAdmin = contextQuery.data?.isAdmin === true;
  // The role and feature vocabulary the modals render. Server-owned: the web
  // used to keep its own copy and the two drifted.
  const catalogue = contextQuery.data?.catalogue ?? {
    features: [],
    roles: [],
    defaultsByRole: {},
  };
  const loading = !isHydrated || contextQuery.isLoading;
  const error = contextQuery.isError ? contextQuery.error : null;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Team & permissions"
        description="Manage who can access your organization, their roles, and the stores they control."
        action={
          isAdmin && (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlusIcon className="h-4 w-4" />
              Add staff
            </Button>
          )
        }
      />

      {!isHydrated && null}

      {loading && (
        <Card>
          <CardContent className="p-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-[var(--background-tertiary)]"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="p-8 text-center py-16 space-y-2">
            <UsersIcon className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" />
            <p className="font-semibold text-[var(--text-primary)]">
              We couldn&apos;t load your organization.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {String(error?.message ?? "")}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && !isAdmin && (
        <Card>
          <CardContent className="p-8 text-center py-16 space-y-2">
            <p className="font-semibold text-[var(--text-primary)]">
              Only organization admins can manage team access.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Contact an organization admin to change roles or store access.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && isAdmin && (
        <MembersPanel
          members={membersQuery.data ?? []}
          stores={storesQuery.data ?? []}
          catalogue={catalogue}
          isAdmin
          currentUserId={userId}
        />
      )}

      {inviteOpen && (
        <CreateStaffModal
          stores={storesQuery.data ?? []}
          catalogue={catalogue}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}
