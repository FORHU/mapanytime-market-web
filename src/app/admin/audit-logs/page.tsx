"use client";

import { AuditLogsTable } from "@/features/adminAudit/components/AuditLogsTable";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <AuditLogsTable />
    </div>
  );
}
