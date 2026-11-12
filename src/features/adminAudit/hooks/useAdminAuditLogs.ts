import { keepPreviousData } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { listAdminAuditLogs } from "../api/auditLog.client";
import {
  AuditLogsPage,
  AuditLogQueryParams,
} from "../contracts/auditLog.contract";

export function useAdminAuditLogs(params?: AuditLogQueryParams) {
  return useSafeQuery<AuditLogsPage, Error>({
    queryKey: [
      "admin",
      "audit-logs",
      params?.page ?? 1,
      params?.limit ?? 20,
      params?.performedById ?? "",
      params?.action ?? "ALL",
      params?.entityType ?? "ALL",
      params?.from ?? "",
      params?.to ?? "",
    ],
    queryFn: ({ signal }) => listAdminAuditLogs(params, signal),
    placeholderData: keepPreviousData,
  });
}
