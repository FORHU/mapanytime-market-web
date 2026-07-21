import { fetcher } from "@/shared/lib/http";
import {
  CreateStoreResponseEnvelopeSchema,
  CreateStoreResponseSchema,
  type OnboardingFormValues,
  type CreateStoreResponse,
} from "../contracts/stores.contract";

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

export const submitOnboarding = async (
  values: OnboardingFormValues,
): Promise<CreateStoreResponse> => {
  const documents = {
    ...(values.mayorsPermitFileName && values.mayorsPermitKey
      ? {
          mayorsPermitFileName: values.mayorsPermitFileName,
          mayorsPermitKey: values.mayorsPermitKey,
        }
      : {}),
    ...(values.dtiCertificateFileName && values.dtiCertificateKey
      ? {
          dtiCertificateFileName: values.dtiCertificateFileName,
          dtiCertificateKey: values.dtiCertificateKey,
        }
      : {}),
    ...(values.birCertificateFileName && values.birCertificateKey
      ? {
          birCertificateFileName: values.birCertificateFileName,
          birCertificateKey: values.birCertificateKey,
        }
      : {}),
    ...(values.secCertificateFileName && values.secCertificateKey
      ? {
          secCertificateFileName: values.secCertificateFileName,
          secCertificateKey: values.secCertificateKey,
        }
      : {}),
  };

  const raw = await fetcher<unknown>("/api/v1/stores", {
    method: "POST",
    body: JSON.stringify({
      storeData: {
        storeName: values.storeName,
        categoryIds: [values.categoryId],
      },
      locationData: {
        latitude: values.lat,
        longitude: values.lng,
        currentAddress: values.currentAddress,
        homeAddress: values.homeAddress,
        city: values.city,
        province: values.province,
        zipCode: values.zipCode,
        country: values.country,
      },
      hoursData: DAYS_OF_WEEK.map((dayOfWeek) => ({
        dayOfWeek,
        openTime: values.openTime,
        closeTime: values.closeTime,
      })),
      ...(Object.keys(documents).length > 0 ? { documents } : {}),
    }),
  });

  const envelope = CreateStoreResponseEnvelopeSchema.parse(raw);
  return CreateStoreResponseSchema.parse({ storeId: envelope.data.id });
};
