import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  listCategoryTrees,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/adminCategories.client";
import type {
  AdminCategory,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../contracts/adminCategory.contract";

const CATEGORIES_KEY = ["admin", "categories"] as const;

export function useAdminCategories() {
  return useSafeQuery<AdminCategory[], Error>({
    queryKey: CATEGORIES_KEY,
    queryFn: listCategoryTrees,
  });
}

/**
 * Create, rename and delete against the real endpoints. This screen used to
 * hold its categories in `useState` seed data, so every edit was discarded on
 * refresh and no change ever reached the platform taxonomy. See FLAGS.md ADM-3.
 */
export function useAdminCategoryActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });

  const create = useSafeMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: invalidate,
  });

  const rename = useSafeMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: invalidate,
  });

  const remove = useSafeMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  });

  return { create, rename, remove };
}
