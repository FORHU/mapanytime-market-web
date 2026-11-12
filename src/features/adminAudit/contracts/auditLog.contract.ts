import { z } from "zod";

export const AuditActorSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

export type AuditActor = z.infer<typeof AuditActorSchema>;

export const AuditLogItemSchema = z.object({
  id: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: z.string(),
  performedBy: AuditActorSchema.nullable().optional(),
});

export type AuditLogItem = z.infer<typeof AuditLogItemSchema>;

export const AuditLogsPageSchema = z.object({
  items: z.array(AuditLogItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type AuditLogsPage = z.infer<typeof AuditLogsPageSchema>;

export interface AuditLogQueryParams {
  performedById?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
