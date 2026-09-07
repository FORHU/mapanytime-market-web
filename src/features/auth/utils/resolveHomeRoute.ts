/**
 * Maps a user's role claims to the route that is "home" for them.
 *
 * Extracted so the post-login redirect (AuthCard), the dual-role prompt, and the
 * public landing nav all agree on where a signed-in user belongs. Precedence
 * matches the original AuthCard ordering — seller, buyer, admin, agent — so
 * single-role behaviour is unchanged by the extraction.
 */

// TODO: duplicates the same literal list in AdminAuthGate.tsx (and inline
// copies in SellerLayout.tsx / buyer/layout.tsx) — extract to one shared source.
export const ADMIN_ROLES = ["SUPER_ADMIN", "DEVELOPER", "ADMIN"];

export function isSellerRole(roles: string[]) {
  return roles.includes("SELLER");
}

export function isBuyerRole(roles: string[]) {
  return roles.includes("BUYER");
}

export function isAdminRole(roles: string[]) {
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

export function isAgentRole(roles: string[]) {
  return roles.includes("SUPPORT_AGENT");
}

/**
 * `null` means "no known role" — callers should treat that as signed-out and
 * render their public affordance rather than linking somewhere meaningless.
 *
 * Sellers land on `/seller/manage-stores` rather than `/seller/onboarding`:
 * choosing between the two needs `hasStores`/`isOnboarded` from the login
 * response, which only AuthCard has. manage-stores renders its own create-store
 * empty state, so it is the safe destination for callers without that data.
 */
export function resolveHomeRoute(roles: string[]): string | null {
  if (isSellerRole(roles)) return "/seller/manage-stores";
  if (isBuyerRole(roles)) return "/buyer";
  if (isAdminRole(roles)) return "/admin";
  if (isAgentRole(roles)) return "/agent";
  return null;
}

/**
 * Where a signed-in seller belongs: their stores, or onboarding.
 *
 * The question onboarding answers is "do you still have to build your own
 * store?", and only an organization's *owner* can answer yes. Staff — anyone
 * holding a membership without a `Sellers` row of their own — can never
 * complete it: `POST /stores` reads the caller's own seller id and answers
 * `403 User is not registered as a seller.` So ownership, not role and not
 * store assignment, is what splits the two destinations.
 *
 * Getting that wrong is what sent a newly created `SELLER_ADMIN` staff member
 * to onboarding after setting their password. The old rule looked for a
 * "scoped member" — not an admin, and holding at least one assigned store — and
 * an admin staff member is neither (admins carry `assignedStoreIds: null`), so
 * they fell through to the owner branch, where `seller` is null for staff and
 * the test could only fail. A member with an empty assignment fell through the
 * same way.
 *
 * Membership alone would be no better a signal than it was before: registration
 * creates an organization for every new seller, so a brand-new merchant has one
 * with zero stores and still needs onboarding. That case is exactly the owner
 * branch below.
 *
 * `isOwner` is the server's answer, taken as given. The client does not infer
 * ownership from which fields happen to be present on the response.
 *
 * Kept here rather than in AuthCard because the rule had drifted into three
 * copies there, one of them dead.
 */
export function resolveSellerLandingRoute(result: {
  hasStores: boolean;
  seller?: { isOnboarded: boolean } | null;
  orgContext?: {
    isAdmin: boolean;
    isOwner: boolean;
    assignedStoreIds: string[] | null;
  } | null;
}): string {
  // The server's verdict, not an inference from payload shape. This previously
  // fell back to `!!result.seller` when `isOwner` was absent — the client
  // guessing at ownership is the same move that produced the original bug, and
  // the schema now guarantees the field is a boolean.
  const isOrgStaff = !!result.orgContext && !result.orgContext.isOwner;

  if (isOrgStaff) return "/seller/manage-stores";

  return result.hasStores && result.seller?.isOnboarded
    ? "/seller/manage-stores"
    : "/seller/onboarding";
}
