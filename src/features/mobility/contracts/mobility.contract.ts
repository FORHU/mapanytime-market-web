import { z } from "zod";

export const VehicleTypeSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  markerIconUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const LiveVehicleSchema = z.object({
  id: z.string(),
  plateNumber: z.string(),
  typeCode: z.string(),
  lat: z.number(),
  lng: z.number(),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
  status: z.enum(["moving", "stopped"]),
  stoppedSince: z.number().nullable().optional(),
  ts: z.number(),
});

export type LiveVehicle = z.infer<typeof LiveVehicleSchema>;

export const TrailPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  speed: z.number().nullable().optional(),
  heading: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
  status: z.enum(["moving", "stopped"]),
  ts: z.number(),
});

export type TrailPoint = z.infer<typeof TrailPointSchema>;

export const VehicleTrailSchema = z.object({
  vehicleId: z.string(),
  plateNumber: z.string(),
  typeCode: z.string(),
  typeName: z.string().optional(),
  operator: z.object({
    id: z.string(),
    name: z.string(),
  }),
  driver: z
    .object({
      id: z.string(),
      firstName: z.string().nullable().optional(),
      lastName: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  totalPoints: z.number(),
  points: z.array(TrailPointSchema),
});

export type VehicleTrail = z.infer<typeof VehicleTrailSchema>;

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
