import { z } from "zod";

export const InviteStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REVOKED",
  "EXPIRED",
]);

export type InviteStatus = z.infer<typeof InviteStatusSchema>;

export const InviterInfoSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

export const AdminInviteSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  token: z.string().optional(),
  role: z.string(),
  status: InviteStatusSchema,
  inviterId: z.string().nullable().optional(),
  expiresAt: z.string(),
  acceptedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  inviter: InviterInfoSchema.nullable().optional(),
});

export type AdminInvite = z.infer<typeof AdminInviteSchema>;

export const AdminInvitesPageSchema = z.object({
  invites: z.array(AdminInviteSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type AdminInvitesPage = z.infer<typeof AdminInvitesPageSchema>;

export const ValidateInviteDataSchema = z.object({
  valid: z.boolean(),
  email: z.string(),
  role: z.string(),
  expiresAt: z.string(),
});

export type ValidateInviteData = z.infer<typeof ValidateInviteDataSchema>;

export const AcceptInviteDataSchema = z.object({
  user: z
    .object({
      id: z.string().optional(),
      email: z.string().optional(),
      firstName: z.string().nullable().optional(),
      lastName: z.string().nullable().optional(),
    })
    .optional(),
  token: z.string().optional(),
});

export type AcceptInviteData = z.infer<typeof AcceptInviteDataSchema>;

export const INVITABLE_ADMIN_ROLES = [
  {
    roleName: "ADMIN",
    label: "Administrator",
    description: "System management and daily operational oversight.",
  },
  {
    roleName: "SUPER_ADMIN",
    label: "Super Administrator",
    description: "Unrestricted platform control and administrative invite permissions.",
  },
  {
    roleName: "SUPPORT_AGENT",
    label: "Support Agent",
    description: "Reviews customer inquiries, storefronts, and orders.",
  },
  {
    roleName: "DEVELOPER",
    label: "Developer",
    description: "Access to system API logs, webhooks, and developer tooling.",
  },
] as const;

