// built, not mounted - /v1/supplier-products/* exists and the contracts match,
// but no UI file imports useSupplierProducts. See FLAGS.md.
import { fetcher } from "@/shared/lib/http";
import {
  SupplierProductSchema,
  SupplierProductsSchema,
  type CreateSupplierProductInput,
  type SupplierProduct,
  type UpdateSupplierProductInput,
} from "../contracts/supplier-products.contract";

/** Supply-side records: cost price, MOQ and lead time behind a listed product. */
export const getSupplierProductsBySeller = async (
  sellerId: string,
): Promise<SupplierProduct[]> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/supplier-products/seller/${sellerId}`,
  );
  return SupplierProductsSchema.parse(raw.data ?? []);
};

export const getSupplierProductsByProduct = async (
  productId: string,
): Promise<SupplierProduct[]> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/supplier-products/product/${productId}`,
  );
  return SupplierProductsSchema.parse(raw.data ?? []);
};

export const createSupplierProduct = async (
  input: CreateSupplierProductInput,
): Promise<SupplierProduct> => {
  const raw = await fetcher<{ data: unknown }>("/api/v1/supplier-products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return SupplierProductSchema.parse(raw.data);
};

export const updateSupplierProduct = async ({
  id,
  ...patch
}: UpdateSupplierProductInput): Promise<SupplierProduct> => {
  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/supplier-products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(patch),
    },
  );
  return SupplierProductSchema.parse(raw.data);
};

export const deleteSupplierProduct = async (id: string): Promise<void> => {
  await fetcher<unknown>(`/api/v1/supplier-products/${id}`, {
    method: "DELETE",
  });
};
