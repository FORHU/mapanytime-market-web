import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchLiveVehicles,
  fetchVehicleTypes,
  fetchVehicleTrail,
} from "../api/mobility.client";
import { fetcher } from "@/shared/lib/http";

vi.mock("@/shared/lib/http", () => ({
  fetcher: vi.fn(),
}));

describe("Mobility API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchLiveVehicles", () => {
    it("calls endpoint with bounding coordinates and validates returned array", async () => {
      const mockData = [
        {
          id: "veh-1",
          plateNumber: "ABC-1234",
          typeCode: "JEEPNEY",
          lat: 16.41,
          lng: 120.59,
          speed: 30,
          heading: 90,
          accuracy: 5,
          status: "moving",
          ts: 1700000000000,
        },
      ];
      vi.mocked(fetcher).mockResolvedValueOnce({ data: mockData });

      const bounds = { north: 16.5, south: 16.3, east: 120.7, west: 120.5 };
      const result = await fetchLiveVehicles(bounds);

      expect(fetcher).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/v1/mobility/vehicles/live?north=16.5&south=16.3&east=120.7&west=120.5",
        ),
        expect.any(Object),
      );
      expect(result).toHaveLength(1);
      expect(result[0].plateNumber).toBe("ABC-1234");
      expect(result[0].status).toBe("moving");
    });
  });

  describe("fetchVehicleTypes", () => {
    it("retrieves active vehicle types", async () => {
      const mockTypes = [
        {
          id: "type-1",
          code: "JEEPNEY",
          name: "Traditional Jeepney",
          markerIconUrl: null,
          isActive: true,
          sortOrder: 1,
        },
      ];
      vi.mocked(fetcher).mockResolvedValueOnce({ data: mockTypes });

      const result = await fetchVehicleTypes();
      expect(fetcher).toHaveBeenCalledWith(
        "/api/v1/mobility/vehicle-types",
        expect.any(Object),
      );
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("JEEPNEY");
    });
  });

  describe("fetchVehicleTrail", () => {
    it("queries vehicle trail with limit and time range filters", async () => {
      const mockTrail = {
        vehicleId: "veh-1",
        plateNumber: "ABC-1234",
        typeCode: "JEEPNEY",
        typeName: "Jeepney",
        operator: { id: "op-1", name: "Baguio Transport" },
        driver: { id: "d-1", firstName: "Juan", lastName: "Dela Cruz" },
        totalPoints: 2,
        points: [
          {
            lat: 16.4,
            lng: 120.6,
            speed: 20,
            heading: 180,
            accuracy: 5,
            status: "moving",
            ts: 1700000001000,
          },
          {
            lat: 16.401,
            lng: 120.601,
            speed: 0,
            heading: 180,
            accuracy: 4,
            status: "stopped",
            ts: 1700000015000,
          },
        ],
      };
      vi.mocked(fetcher).mockResolvedValueOnce({ data: mockTrail });

      const result = await fetchVehicleTrail("veh-1", {
        limit: 100,
        since: 1700000000000,
        until: 1700000020000,
      });

      expect(fetcher).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/v1/mobility/vehicles/veh-1/trail?limit=100&since=1700000000000&until=1700000020000",
        ),
        expect.any(Object),
      );
      expect(result.vehicleId).toBe("veh-1");
      expect(result.totalPoints).toBe(2);
      expect(result.points).toHaveLength(2);
    });
  });
});
