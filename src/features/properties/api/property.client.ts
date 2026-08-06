import { fetcher } from "@/shared/lib/http";
import {
  CreatePropertyResponseEnvelopeSchema,
  HouseLotDraftSchema,
  type HouseLotDraft,
  type CreatePropertyResponse,
} from "../contracts/property.contract";

export async function submitHouseLotProperty(
  values: HouseLotDraft,
): Promise<CreatePropertyResponse> {
  const draft = HouseLotDraftSchema.parse(values);

  const raw = await fetcher<unknown>("/api/v1/properties", {
    method: "POST",
    body: JSON.stringify({
      sellerCapacity: draft.sellerCapacity,
      legalName: draft.legalName,
      phone: draft.phone,
      email: draft.email,
      governmentIdName: draft.governmentIdName || undefined,
      propertyType: draft.propertyType,
      address: draft.address,
      lat: draft.lat,
      lng: draft.lng,
      subdivision: draft.subdivision || undefined,
      // selfieCaptured is intentionally UI-only for this MVP.
    }),
  });

  return CreatePropertyResponseEnvelopeSchema.parse(raw).data;
}
