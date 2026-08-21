/**
 * Maps a user's role claims to the route that is "home" for them.
 *
 * Extracted so the post-login redirect (AuthCard), the dual-role prompt, and the
 * public landing nav all agree on where a signed-in user belongs. Precedence
 * matches the original AuthCard ordering — seller, buyer, admin, agent — so
 * single-role behaviour is unchanged by the extraction.
 */

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
