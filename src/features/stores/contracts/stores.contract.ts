import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable().optional(),
  subCategories: z.array(z.object({ id: z.string() })).optional(),
});

export const CategoriesResponseSchema = z.array(CategorySchema);

export const OnboardingFormValuesSchema = z.object({
  storeName: z.string().min(1),
  categoryId: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  currentAddress: z.string().min(1),
  homeAddress: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  openTime: z.string().min(1),
  closeTime: z.string().min(1),
  mayorsPermitFileName: z.string().min(1).optional(),
  mayorsPermitKey: z.string().min(1).optional(),
  dtiCertificateFileName: z.string().min(1).optional(),
  dtiCertificateKey: z.string().min(1).optional(),
  birCertificateFileName: z.string().min(1).optional(),
  birCertificateKey: z.string().min(1).optional(),
  secCertificateFileName: z.string().min(1).optional(),
  secCertificateKey: z.string().min(1).optional(),
});

export const CreateStoreResponseEnvelopeSchema = z.object({
  data: z
    .object({
      id: z.string(),
    })
    .passthrough(),
});

export const CreateStoreResponseSchema = z.object({
  storeId: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;
export type OnboardingFormValues = z.infer<typeof OnboardingFormValuesSchema>;
export type CreateStoreResponseEnvelope = z.infer<
  typeof CreateStoreResponseEnvelopeSchema
>;
export type CreateStoreResponse = z.infer<typeof CreateStoreResponseSchema>;
