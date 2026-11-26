import { describe, it, expect, vi, beforeEach } from "vitest";
import * as http from "@/shared/lib/http";
import { listAdminAuditLogs } from "../api/auditLog.client";

describe("auditLog.client (MA-11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAdminAuditLogs", () => {
    it("fetches audit logs with query parameters and parses result", async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: "audit-1",
              action: "ADMIN_INVITE_CREATED",
              entityType: "ADMIN_INVITE",
              entityId: "inv-101",
              metadata: { role: "ADMIN", email: "newadmin@example.com" },
              createdAt: "2026-11-12T08:00:00.000Z",
              performedBy: {
                id: "admin-1",
                name: "Lead Admin",
                email: "admin@mapanytime.com",
              },
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse);

      const result = await listAdminAuditLogs({
        page: 1,
        limit: 20,
        action: "ADMIN_INVITE_CREATED",
        performedById: "admin-1",
        from: "2026-11-01",
        to: "2026-11-15",
      });

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/admin/audit-logs?page=1&limit=20&performedById=admin-1&action=ADMIN_INVITE_CREATED&from=2026-11-01&to=2026-11-15",
        { signal: undefined },
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].action).toBe("ADMIN_INVITE_CREATED");
      expect(result.items[0].performedBy?.name).toBe("Lead Admin");
    });
  });
});
