import { useQueryClient } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  createSupplierProduct,
  deleteSupplierProduct,
  getSupplierProductsByProduct,
  getSupplierProductsBySeller,
  updateSupplierProduct,
} from "../api/supplier-products.client";
import { sellerCatalogKeys } from "../api/seller-catalog.keys";
import type { SupplierProduct } from "../contracts/supplier-products.contract";

export function useSupplierProductsBySeller(sellerId: string | null) {
  return useSafeQuery<SupplierProduct[]>({
    queryKey: sellerCatalogKeys.bySeller(sellerId ?? ""),
    queryFn: () => getSupplierProductsBySeller(sellerId as string),
    enabled: Boolean(sellerId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSupplierProductsByProduct(productId: string | null) {
  return useSafeQuery<SupplierProduct[]>({
    queryKey: sellerCatalogKeys.byProduct(productId ?? ""),
    queryFn: () => getSupplierProductsByProduct(productId as string),
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create / update / delete for supplier records, all invalidating the seller's
 * list so the table reflects the change without a manual refetch.
 */
export function useSupplierProductMutations(sellerId: string | null) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: sellerCatalogKeys.bySeller(sellerId ?? ""),
    });
  };

  const create = useSafeMutation({
    mutationFn: createSupplierProduct,
    onSuccess: invalidate,
  });

  const update = useSafeMutation({
    mutationFn: updateSupplierProduct,
    onSuccess: invalidate,
  });

  const remove = useSafeMutation({
    mutationFn: deleteSupplierProduct,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
