import { fetcher } from "@/shared/lib/http";
import {
  AuditLogsPage,
  AuditLogsPageSchema,
  AuditLogQueryParams,
} from "../contracts/auditLog.contract";

export async function listAdminAuditLogs(
  params?: AuditLogQueryParams,
  signal?: AbortSignal,
): Promise<AuditLogsPage> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.performedById && params.performedById.trim()) {
    query.set("performedById", params.performedById.trim());
  }
  if (params?.action && params.action !== "ALL") {
    query.set("action", params.action.trim());
  }
  if (params?.entityType && params.entityType !== "ALL") {
    query.set("entityType", params.entityType.trim());
  }
  if (params?.from && params.from.trim()) {
    query.set("from", params.from.trim());
  }
  if (params?.to && params.to.trim()) {
    query.set("to", params.to.trim());
  }

  const qs = query.toString();
  const url = `/api/v1/admin/audit-logs${qs ? `?${qs}` : ""}`;
  const response = await fetcher<{ data: unknown }>(url, { signal });
  return AuditLogsPageSchema.parse(response.data);
}
