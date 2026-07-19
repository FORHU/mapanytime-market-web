import { fetcher } from "@/shared/lib/http";
import {
  ProductSchema,
  ProductsResponseSchema,
  CategoriesResponseSchema,
  type Product,
  type ProductsResponse,
  type CategoriesResponse,
  type CreateProductInput,
  type UpdateProductInput,
} from "../contracts/products.contract";

// Every real success response observed from this backend (auth, categories)
// is wrapped in { status, statusCode, data, message } — applied here too,
// though not independently confirmed on a successful products response
// specifically (see the live-backend connectivity report).
interface Envelope<T> {
  data: T;
}

export const listProducts = async (
  storeId: string,
): Promise<ProductsResponse> => {
  const res = await fetcher<Envelope<unknown>>(
    `/api/v1/products?storeId=${storeId}`,
  );
  return ProductsResponseSchema.parse(res.data);
};

export const getProduct = async (productId: string): Promise<Product> => {
  const res = await fetcher<Envelope<unknown>>(`/api/v1/products/${productId}`);
  return ProductSchema.parse(res.data);
};

export const createProduct = async (
  input: CreateProductInput,
): Promise<Product> => {
  const res = await fetcher<Envelope<unknown>>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return ProductSchema.parse(res.data);
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductInput,
): Promise<Product> => {
  // Verified against the live backend: this resource updates via PUT, not
  // PATCH, and rejects a stock/initialStock field entirely.
  const res = await fetcher<Envelope<unknown>>(
    `/api/v1/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
  return ProductSchema.parse(res.data);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  await fetcher<void>(`/api/v1/products/${productId}`, {
    method: "DELETE",
  });
};

// Backend resource discovered while validating the Products contract —
// products reference a categoryId from this list, not a fixed enum.
export const listCategories = async (): Promise<CategoriesResponse> => {
  const res = await fetcher<Envelope<unknown>>("/api/v1/categories");
  return CategoriesResponseSchema.parse(res.data);
};
