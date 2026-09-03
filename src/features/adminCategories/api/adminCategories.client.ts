import { fetcher } from "@/shared/lib/http";
import {
  AdminCategoriesSchema,
  type AdminCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../contracts/adminCategory.contract";

/**
 * The whole category tree, roots with their children.
 *
 * `GET /v1/categories/trees` answers 404 when nothing is seeded rather than an
 * empty list, so that case is normalised to `[]` here — an empty taxonomy is a
 * legitimate state for this screen, not an error.
 */
export async function listCategoryTrees(): Promise<AdminCategory[]> {
  try {
    const res = await fetcher<{ data: unknown }>("/api/v1/categories/trees");
    return AdminCategoriesSchema.parse(res.data ?? []);
  } catch (error) {
    if ((error as { status?: number })?.status === 404) return [];
    throw error;
  }
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<void> {
  await fetcher<unknown>("/api/v1/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<void> {
  await fetcher<unknown>(`/api/v1/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await fetcher<unknown>(`/api/v1/categories/${id}`, { method: "DELETE" });
}
