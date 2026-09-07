import type {
  SellerCatalogue,
  SellerFeature,
  SellerOrgRole,
} from "../contracts/team.contract";

/**
 * Pure helpers behind the "Feature access" checkbox grid.
 *
 * Kept free of React so the rules can be tested directly. Every one of them
 * takes the server's catalogue rather than reading a module constant: the web
 * used to keep its own copy of the feature list and role defaults, the copies
 * drifted, and the UI ended up offering codes the API had never heard of. The
 * API is the enforcement point; these only decide what the form shows and sends.
 */

/** The codes the current catalogue defines, in server order. */
export function featureCodes(catalogue: SellerCatalogue): SellerFeature[] {
  return catalogue.features.map((feature) => feature.code);
}

/** Whether a role grants everything implicitly, per the server. */
export function isAdminRole(
  role: SellerOrgRole,
  catalogue: SellerCatalogue,
): boolean {
  return catalogue.roles.some((entry) => entry.name === role && entry.isAdmin);
}

/** What a role starts with when an admin has not chosen. */
export function defaultPermissionsForRole(
  role: SellerOrgRole,
  catalogue: SellerCatalogue,
): SellerFeature[] {
  return [...(catalogue.defaultsByRole[role] ?? [])];
}

/** Add or remove one code, keeping catalogue order so the grid never reshuffles. */
export function togglePermission(
  current: readonly string[],
  code: SellerFeature,
  catalogue: SellerCatalogue,
): SellerFeature[] {
  const next = new Set(current);
  if (next.has(code)) {
    next.delete(code);
  } else {
    next.add(code);
  }
  return featureCodes(catalogue).filter((feature) => next.has(feature));
}

/**
 * The stored codes that the current catalogue still defines, in catalogue order.
 *
 * Used to decide which boxes are ticked — NOT to decide what gets saved. A
 * member's row can outlive a code, and dropping the unknown ones from a
 * submitted list would silently revoke them. `unknownPermissions` is what the
 * modal surfaces instead.
 */
export function sanitizePermissions(
  stored: readonly string[],
  catalogue: SellerCatalogue,
): SellerFeature[] {
  return featureCodes(catalogue).filter((feature) => stored.includes(feature));
}

/** Stored codes the catalogue no longer defines, so the UI can say so out loud. */
export function unknownPermissions(
  stored: readonly string[],
  catalogue: SellerCatalogue,
): string[] {
  const known = new Set(featureCodes(catalogue));
  return stored.filter((code) => !known.has(code));
}

/**
 * Whether a viewer holding `permissions` may reach a feature.
 *
 * `isAdmin` short-circuits to match the server, where an admin's stored list is
 * empty and never read.
 */
export function hasFeature(
  permissions: readonly string[] | undefined,
  code: SellerFeature,
  isAdmin = false,
): boolean {
  if (isAdmin) return true;
  return (permissions ?? []).includes(code);
}
