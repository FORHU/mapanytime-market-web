import { z } from "zod";

export const AgentPayoutStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export type AgentPayoutStatus = z.infer<typeof AgentPayoutStatusSchema>;

export const AgentProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
});

export type AgentProfile = z.infer<typeof AgentProfileSchema>;

export const AgentPayoutItemSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  accountId: z.string(),
  amount: z.number(),
  status: AgentPayoutStatusSchema,
  paymentMethod: z.string(),
  reference: z.string().nullable().optional(),
  processedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  agent: AgentProfileSchema.optional(),
});

export type AgentPayoutItem = z.infer<typeof AgentPayoutItemSchema>;

export const AgentPayoutsPageSchema = z.object({
  items: z.array(AgentPayoutItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type AgentPayoutsPage = z.infer<typeof AgentPayoutsPageSchema>;

export const AgentCommissionConfigSchema = z.object({
  commissionRate: z.number(),
  commissionBase: z.string(),
  eligibilityHoldDays: z.number(),
  payoutMinimum: z.number(),
  isEnabled: z.boolean(),
});

export type AgentCommissionConfig = z.infer<typeof AgentCommissionConfigSchema>;
