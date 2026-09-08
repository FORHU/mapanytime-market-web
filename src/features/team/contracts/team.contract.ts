import { z } from "zod";

/**
 * A feature code is whatever the API says it is.
 *
 * This was a hardcoded union mirroring `SELLER_ORG_PERMISSIONS` on the API, next
 * to hand-copied labels, roles and role defaults. The copies drifted — the web
 * still listed a pre-migration vocabulary — and the result was a 400 on every
 * role save and a checkbox grid offering codes no route had ever checked.
 *
 * The client cannot validate this vocabulary in any case: `normalizePermissions`
 * and the Joi role schema are the only things that decide what is acceptable, so
 * a second opinion here could only ever be wrong in a new way. The catalogue now
 * arrives on `/seller/org/context` and the UI renders it.
 */
export type SellerFeature = string;
export type SellerOrgRole = string;

export const SellerCatalogueSchema = z
  .object({
    /** In server order; the grid preserves it so ticking a box never reshuffles. */
    features: z
      .array(z.object({ code: z.string(), label: z.string() }).loose())
      .default([]),
    roles: z
      .array(
        z
          .object({ name: z.string(), label: z.string(), isAdmin: z.boolean() })
          .loose(),
      )
      .default([]),
    /** What a role starts with before an admin ticks anything. */
    defaultsByRole: z.record(z.string(), z.array(z.string())).default({}),
  })
  .loose();
export type SellerCatalogue = z.infer<typeof SellerCatalogueSchema>;

const EMPTY_CATALOGUE: SellerCatalogue = {
  features: [],
  roles: [],
  defaultsByRole: {},
};

export const OrgContextSchema = z
  .object({
    organizationId: z.string(),
    role: z.string(),
    isAdmin: z.boolean(),
    // Whether the caller registered this organization rather than being staff
    // in it. A hired SELLER_ADMIN is `isAdmin: true, isOwner: false`, which is
    // what keeps them out of the create-your-own-store onboarding flow.
    isOwner: z.boolean().default(false),
    assignedStoreIds: z.array(z.string()).nullable(),
    // Already resolved by the server: admins come back holding every feature,
    // so the client never re-implements the implicit-admin rule.
    permissions: z.array(z.string()).default([]),
    // The caller's own seller application status, or `null` when they hold no
    // seller registration — which is the normal state for org staff, not a
    // failure. Anything reading this must treat `null` as "not applicable"
    // rather than "unverified", or every hired member of an approved
    // organization gets shown the under-review screen.
    //
    // A plain string, not an enum, for the same reason the feature vocabulary
    // above is: the server decides what these values are, and a second opinion
    // here could only ever be wrong in a new way. Defaulted to `null` so a
    // response from an API predating the field parses and fails open — the
    // server's `requireApprovedSeller` is the real gate, not this.
    sellerStatus: z.string().nullable().default(null),
    // Defaulted rather than required so a response from an API that predates the
    // field still parses — the team UI degrades to an empty grid instead of the
    // whole seller shell failing to load.
    catalogue: SellerCatalogueSchema.default(EMPTY_CATALOGUE),
  })
  .loose();
export type OrgContext = z.infer<typeof OrgContextSchema>;

export const OrgStoreSchema = z
  .object({
    id: z.string(),
    storeName: z.string(),
    isActive: z.boolean(),
  })
  .loose();
export type OrgStore = z.infer<typeof OrgStoreSchema>;

export const OrgMemberSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    role: z.string(),
    user: z
      .object({
        id: z.string(),
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
      })
      .loose(),
    assignedStores: z
      .array(z.object({ storeId: z.string() }).loose())
      .default([]),
    permissions: z.array(z.string()).default([]),
    // The organization owner. The server refuses to edit or remove this row, so
    // the panel hides both actions rather than offering a guaranteed 403.
    // Rendering only — the enforcement is server-side, in loadManagedMember.
    isOwner: z.boolean().default(false),
  })
  .loose();
export type OrgMember = z.infer<typeof OrgMemberSchema>;

/**
 * Creating a staff account outright, which replaced the invite flow.
 *
 * The account, the membership and the store assignments are made in a single
 * server-side transaction, so a new member never lands in the state an accepted
 * invite used to produce: able to sign in, assigned to nothing.
 */
export const CreateStaffInputSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  // Plain strings, not an enum: the role and feature vocabularies come from the
  // server's catalogue now, and the API is what rejects anything outside them.
  role: z.string().min(1, "Pick a role"),
  storeIds: z.array(z.string()).default([]),
  // Omitted means "use the role default"; an explicit [] means no features.
  permissions: z.array(z.string()).optional(),
});
export type CreateStaffInput = z.infer<typeof CreateStaffInputSchema>;

/**
 * `setupCode` is returned to the admin so they can relay it when the mail
 * worker is not running. It is not a password — the recipient exchanges it for
 * one of their own, so the admin never holds a working credential.
 */
export const CreatedStaffSchema = z
  .object({
    userId: z.string(),
    email: z.string(),
    role: z.string(),
    storeIds: z.array(z.string()).default([]),
    permissions: z.array(z.string()).default([]),
    setupCode: z.string(),
    setupUrl: z.string(),
    expiresInMinutes: z.number(),
  })
  .loose();
export type CreatedStaff = z.infer<typeof CreatedStaffSchema>;
