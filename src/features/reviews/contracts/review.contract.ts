import { z } from "zod";

export const ReviewerSchema = z.object({
  id: z.string(),
  displayName: z.string().nullable().optional(),
});

export const ReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string().nullable().optional(),
  createdAt: z.string(),
  buyer: ReviewerSchema.optional(),
});

/** A review list always carries its own average, so the two cannot disagree. */
export const ReviewListSchema = z.object({
  items: z.array(ReviewSchema),
  total: z.number(),
  averageRating: z.coerce.number(),
});

export type Review = z.infer<typeof ReviewSchema>;
export type ReviewList = z.infer<typeof ReviewListSchema>;
