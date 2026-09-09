"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { useStoreProfiles } from "@/features/store-profile/hooks/useStoreProfile";
import { useOrgContext } from "@/features/team";
import { SellerAuthGate } from "@/features/auth/components/SellerAuthGate";
import {
  SELLER_PENDING_ROUTE,
  isSellerRestricted,
} from "@/shared/lib/sellerVerification";

const ROUTE_PERMISSIONS: ReadonlyArray<[prefix: string, permission: string]> = [
  ["/seller/products", "products.view"],
  ["/seller/properties", "products.view"],
  ["/seller/orders", "orders.process"],
  ["/seller/promotions", "promotions.add"],
];

/** Routes only an organization admin may open. */
const ADMIN_ONLY_PREFIXES = [
  "/seller/team",
  "/seller/finance",
  "/seller/fulfillment",
  "/seller/store-profile",
  "/seller/settings",
];

export function SellerAppLayout({ children }: { children: React.ReactNode }) {
  const { data: stores } = useStoreProfiles();
  const orgQuery = useOrgContext();
  const pathname = usePathname();
  const router = useRouter();

  const access = useMemo(
    () => ({
      // Undefined until the query resolves — distinct from an empty list, which
      // is a real state meaning "this member holds no features".
      permissions: orgQuery.data?.permissions,
      isOrgAdmin: orgQuery.data?.isAdmin === true,
      // Explicit, so the sidebar stops inferring intent from `undefined` and
      // can tell "still loading" from "request failed".
      status: orgQuery.isPending
        ? ("pending" as const)
        : orgQuery.isError
          ? ("error" as const)
          : ("ready" as const),
    }),
    [orgQuery.data, orgQuery.isPending, orgQuery.isError],
  );

  /**
   * An unverified seller reaches nothing but the review page.
   *
   * Read from the org context rather than the login response so an approval
   * takes effect on this query's next refetch — the seller does not have to sign
   * out and back in to be let through.
   */
  const isRestricted =
    access.status === "ready" &&
    isSellerRestricted(orgQuery.data?.sellerStatus);
  const onPendingRoute = pathname === SELLER_PENDING_ROUTE;

  /**
   * What the current path demands, if anything.
   *
   * Only paths that actually require something wait on the org context. Gating
   * the whole seller shell on this one query would strand a user on the
   * dashboard — which needs no permission at all — over a momentary failure.
   */
  const required = useMemo(() => {
    const adminOnly = ADMIN_ONLY_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );
    const permission = ROUTE_PERMISSIONS.filter(([prefix]) =>
      pathname.startsWith(prefix),
    ).sort((a, b) => b[0].length - a[0].length)[0]?.[1];
    return {
      adminOnly,
      permission,
      gated: adminOnly || permission !== undefined,
    };
  }, [pathname]);

  useEffect(() => {
    if (access.status !== "ready") return;

    if (isRestricted && !onPendingRoute) {
      router.replace(SELLER_PENDING_ROUTE);
      return;
    }

    if (!isRestricted && onPendingRoute) {
      router.replace("/seller/manage-stores");
    }
  }, [access.status, isRestricted, onPendingRoute, router]);

  useEffect(() => {
    // Nav hiding is a convenience; this is what stops a typed URL rendering a
    // section the API will refuse. Neither is the real gate — that is
    // requireSellerFeature on the server.
    if (access.status !== "ready" || access.isOrgAdmin) return;

    const denied =
      required.adminOnly ||
      (required.permission !== undefined &&
        !(access.permissions ?? []).includes(required.permission));

    if (denied) router.replace("/seller/dashboard");
  }, [access.status, access.permissions, access.isOrgAdmin, required, router]);

  /**
   * A gated route renders nothing until we know the caller may open it.
   *
   * Previously an unresolved context short-circuited the effect above, so the
   * page rendered and stayed rendered — on a failed request, permanently. An
   * unknown answer is not a yes.
   */
  const gatedAndUnresolved = required.gated && access.status !== "ready";
  const leavingForPendingRoute = isRestricted && !onPendingRoute;

  return (
    <SellerAuthGate
      stores={stores}
      access={access}
      // Sidebar-only: the nav greys out, but the review page still renders.
      navLocked={isRestricted}
    >
      {leavingForPendingRoute ? null : gatedAndUnresolved ? (
        <div className="space-y-3 p-6">
          {access.status === "error" ? (
            <div className="space-y-3 rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)] p-8 text-center">
              <p className="font-semibold text-[var(--text-primary)]">
                We couldn&apos;t load your permissions.
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                This section is restricted, so we can&apos;t show it until we
                know what you have access to.
              </p>
              <Button onClick={() => orgQuery.refetch()}>Try again</Button>
            </div>
          ) : (
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-[var(--background-tertiary)]"
              />
            ))
          )}
        </div>
      ) : (
        children
      )}
    </SellerAuthGate>
  );
}
