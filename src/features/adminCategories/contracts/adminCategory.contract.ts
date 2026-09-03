import { z } from "zod";

/**
 * A node in the platform category tree, as `GET /v1/categories/trees` returns
 * it. `subCategories` is one level deep in practice, but the schema is
 * recursive so a deeper tree does not silently fail to parse.
 */
export type AdminCategory = {
  id: string;
  parentId: string | null;
  name: string;
  description: string | null;
  status: string;
  createdAt?: string;
  subCategories: AdminCategory[];
};

export const AdminCategorySchema: z.ZodType<AdminCategory> = z.lazy(() =>
  z.object({
    id: z.string(),
    parentId: z.string().nullable().default(null),
    name: z.string(),
    description: z.string().nullable().default(null),
    status: z.string().default("APPROVED"),
    createdAt: z.string().optional(),
    subCategories: z.array(AdminCategorySchema).default([]),
  }),
);

export const AdminCategoriesSchema = z.array(AdminCategorySchema);

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}
