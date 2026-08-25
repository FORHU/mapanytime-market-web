import { z } from "zod";

export const SellerStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

// firstName/lastName are nullable columns on Users — a bare z.string() here
// threw a Zod error for any applicant who never filled them in.
const NullableName = z.string().nullable();

export const PendingSellerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: NullableName,
  lastName: NullableName,
  email: z.string(),
  phoneNumber: z.string().nullable(),
  applicationStatus: SellerStatusSchema,
  storeCount: z.number(),
  verificationCount: z.number(),
  createdAt: z.string(),
});

export const SellerDetailSchema = PendingSellerSchema.omit({
  storeCount: true,
  verificationCount: true,
}).extend({
  rejectionReason: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  reviewedBy: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
    })
    .nullable(),
  stores: z.array(
    z.object({
      id: z.string(),
      storeName: z.string(),
      approvalStatus: z.string(),
    }),
  ),
  documentVerifications: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      documents: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
        }),
      ),
    }),
  ),
});

/** The API's standard page envelope — `items`, not a resource-specific key. */
export const PendingSellersPageSchema = z.object({
  items: z.array(PendingSellerSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type PendingSeller = z.infer<typeof PendingSellerSchema>;
export type SellerDetail = z.infer<typeof SellerDetailSchema>;
export type PendingSellersPage = z.infer<typeof PendingSellersPageSchema>;
