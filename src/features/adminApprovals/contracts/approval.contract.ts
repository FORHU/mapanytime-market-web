import { z } from "zod";

export const ApprovalStatusSchema = z.enum(["PENDING", "ACTIVE", "REJECTED"]);

export const ApprovalItemSchema = z.object({
  id: z.string(),
  entityType: z.enum(["STORE", "PROPERTY"]),
  name: z.string(),
  owner: z.string(),
  email: z.string(),
  address: z.string(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  propertyType: z.string().nullable().optional(),
  status: ApprovalStatusSchema,
  rejectionReason: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const ApprovalsResponseSchema = z.array(ApprovalItemSchema);

export type ApprovalItem = z.infer<typeof ApprovalItemSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
