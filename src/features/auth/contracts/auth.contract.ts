import { z } from "zod";

export const AuthUserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.string()).optional(),
    isOnBoarding: z.boolean().optional(),
  })
  .passthrough();

/**
 * The caller's seller-organization membership.
 *
 * `stores` above is only the stores a user owns through their own `Sellers`
 * row, which is empty for org staff. This is what says which stores they may
 * actually operate: an admin reaches every store the org owns (hence
 * `assignedStoreIds: null`), a member only the ids listed here.
 *
 * The API has always sent it; it was silently dropped because `data` is a plain
 * `z.object`, which strips unknown keys.
 */
export const OrgContextSchema = z
  .object({
    organizationId: z.string(),
    role: z.string().nullable().optional(),
    isAdmin: z.boolean(),
    // Whether the caller registered this organization, as opposed to being
    // staff in it. Decides the post-login destination — see
    // `resolveSellerLandingRoute`. Defaulted rather than required so a response
    // from an API that predates the field parses instead of throwing.
    isOwner: z.boolean().default(false),
    assignedStoreIds: z.array(z.string()).nullable(),
  })
  .nullable()
  .optional();

export const LoginResponseEnvelopeSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    user: AuthUserSchema.optional(),
    stores: z.array(z.unknown()).optional(),
    orgContext: OrgContextSchema,
    seller: z
      .object({
        id: z.string(),
        applicationStatus: z.string().optional(),
        isOnboarded: z.boolean(),
        onboardingStep: z.number(),
        hasStores: z.boolean(),
      })
      .nullable()
      .optional(),
  }),
});

export const AuthResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  hasStores: z.boolean(),
  orgContext: OrgContextSchema,
  user: AuthUserSchema.optional(),
  seller: z
    .object({
      id: z.string(),
      applicationStatus: z.string().optional(),
      isOnboarded: z.boolean(),
      onboardingStep: z.number(),
      hasStores: z.boolean(),
    })
    .nullable()
    .optional(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResult = z.infer<typeof AuthResultSchema>;
