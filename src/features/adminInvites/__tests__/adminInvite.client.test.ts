import { describe, it, expect, vi, beforeEach } from "vitest";
import * as http from "@/shared/lib/http";
import {
  listAdminInvites,
  createAdminInvite,
  revokeAdminInvite,
  validateAdminInvite,
  acceptAdminInvite,
} from "../api/adminInvite.client";

describe("adminInvite.client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAdminInvites", () => {
    it("fetches invites with query params and parses result", async () => {
      const mockResponse = {
        data: {
          invites: [
            {
              id: "inv-1",
              email: "staff@mapanytime.com",
              role: "ADMIN",
              status: "PENDING",
              expiresAt: "2026-11-17T00:00:00.000Z",
              createdAt: "2026-11-10T00:00:00.000Z",
              inviter: {
                id: "usr-admin",
                name: "Admin User",
                email: "lead@mapanytime.com",
              },
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce(mockResponse as never);

      const result = await listAdminInvites({
        status: "PENDING",
        page: 1,
        limit: 10,
      });

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/admin/invites?status=PENDING&page=1&limit=10",
        { signal: undefined },
      );
      expect(result.invites).toHaveLength(1);
      expect(result.invites[0].email).toBe("staff@mapanytime.com");
      expect(result.invites[0].status).toBe("PENDING");
    });
  });

  describe("createAdminInvite", () => {
    it("posts invite payload and returns validated invite", async () => {
      const mockInvite = {
        id: "inv-new",
        email: "newstaff@mapanytime.com",
        role: "SUPPORT_AGENT",
        status: "PENDING",
        expiresAt: "2026-11-17T00:00:00.000Z",
        createdAt: "2026-11-10T00:00:00.000Z",
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce({ data: mockInvite } as never);

      const result = await createAdminInvite({
        email: "newstaff@mapanytime.com",
        role: "SUPPORT_AGENT",
        expiresInDays: 7,
      });

      expect(fetcherSpy).toHaveBeenCalledWith("/api/v1/admin/invites", {
        method: "POST",
        body: JSON.stringify({
          email: "newstaff@mapanytime.com",
          role: "SUPPORT_AGENT",
          expiresInDays: 7,
        }),
        signal: undefined,
      });
      expect(result.id).toBe("inv-new");
      expect(result.role).toBe("SUPPORT_AGENT");
    });
  });

  describe("revokeAdminInvite", () => {
    it("posts to revoke endpoint and returns updated invite", async () => {
      const mockRevoked = {
        id: "inv-target",
        email: "revoked@mapanytime.com",
        role: "ADMIN",
        status: "REVOKED",
        expiresAt: "2026-11-17T00:00:00.000Z",
        createdAt: "2026-11-10T00:00:00.000Z",
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce({ data: mockRevoked } as never);

      const result = await revokeAdminInvite("inv-target");

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/admin/invites/inv-target/revoke",
        {
          method: "POST",
          body: JSON.stringify({}),
          signal: undefined,
        },
      );
      expect(result.status).toBe("REVOKED");
    });
  });

  describe("validateAdminInvite", () => {
    it("validates token query parameter and returns invite details", async () => {
      const mockValidation = {
        valid: true,
        email: "invited@mapanytime.com",
        role: "ADMIN",
        expiresAt: "2026-11-17T00:00:00.000Z",
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce({ data: mockValidation } as never);

      const result = await validateAdminInvite("secure-token-123");

      expect(fetcherSpy).toHaveBeenCalledWith(
        "/api/v1/admin/invites/validate?token=secure-token-123",
        { signal: undefined },
      );
      expect(result.valid).toBe(true);
      expect(result.email).toBe("invited@mapanytime.com");
    });
  });

  describe("acceptAdminInvite", () => {
    it("submits accept payload and returns user and token", async () => {
      const mockAcceptData = {
        user: {
          id: "usr-activated",
          email: "invited@mapanytime.com",
          firstName: "Jane",
          lastName: "Doe",
        },
        token: "jwt-or-session-token",
      };

      const fetcherSpy = vi
        .spyOn(http, "fetcher")
        .mockResolvedValueOnce({ data: mockAcceptData } as never);

      const result = await acceptAdminInvite({
        token: "secure-token-123",
        password: "NewPassword123!",
        firstName: "Jane",
        lastName: "Doe",
      });

      expect(fetcherSpy).toHaveBeenCalledWith("/api/v1/admin/invites/accept", {
        method: "POST",
        body: JSON.stringify({
          token: "secure-token-123",
          password: "NewPassword123!",
          firstName: "Jane",
          lastName: "Doe",
        }),
        signal: undefined,
      });
      expect(result.user?.id).toBe("usr-activated");
    });
  });
});

