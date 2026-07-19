import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
} from "../api/products.client";
import { productsKeys, categoriesKeys } from "../api/products.keys";
import type {
  Product,
  ProductsResponse,
  CategoriesResponse,
  CreateProductInput,
  UpdateProductInput,
} from "../contracts/products.contract";

/** Fetch all products for a given store. No-ops until a store is selected. */
export function useProducts(storeId: string) {
  return useSafeQuery<ProductsResponse, Error>({
    queryKey: productsKeys.lists(storeId),
    queryFn: () => listProducts(storeId),
    enabled: Boolean(storeId),
  });
}

/** Fetch a single product's detail. No-ops until a productId is known. */
export function useProduct(productId: string) {
  return useSafeQuery<Product, Error>({
    queryKey: productsKeys.detail(productId),
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });
}

/** Create a product. Invalidates that store's product list on success. */
export function useCreateProduct(
  storeId: string,
  options?: {
    onValidationError?: (fields: Record<string, string[]>) => void;
  },
) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onValidationError: options?.onValidationError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists(storeId) });
    },
  });
}

/** Update a product. Invalidates its detail and store list on success. */
export function useUpdateProduct(
  productId: string,
  storeId: string,
  options?: {
    onValidationError?: (fields: Record<string, string[]>) => void;
  },
) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(productId, input),
    onValidationError: options?.onValidationError,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.detail(productId),
      });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists(storeId) });
    },
  });
}

/** Delete a product. Invalidates that store's product list on success. */
export function useDeleteProduct(storeId: string) {
  const queryClient = useQueryClient();
  return useSafeMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists(storeId) });
    },
  });
}

/** Fetch the real category list products reference by categoryId. */
export function useCategories() {
  return useSafeQuery<CategoriesResponse, Error>({
    queryKey: categoriesKeys.all,
    queryFn: listCategories,
  });
}
