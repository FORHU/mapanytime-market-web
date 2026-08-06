import { z } from "zod";

export const HouseLotDraftSchema = z.object({
  sellerCapacity: z.enum(["owner", "broker", "proxy"]),
  legalName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  governmentIdName: z.string(),
  propertyType: z.enum(["house-lot", "raw-land"]),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  subdivision: z.string(),
  selfieCaptured: z.boolean(),
});

export const CreatePropertyResponseEnvelopeSchema = z.object({
  data: z
    .object({
      id: z.string(),
      status: z.enum(["DRAFT", "PENDING_REVIEW"]),
    })
    .passthrough(),
});

export type HouseLotDraft = z.infer<typeof HouseLotDraftSchema>;
export type CreatePropertyResponse = z.infer<
  typeof CreatePropertyResponseEnvelopeSchema
>["data"];
