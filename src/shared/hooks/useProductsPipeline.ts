import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/shared/lib/http";
import { getToken } from "@/shared/lib/token";

export interface ProductItem {
  id?: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  stock: number;
  tags?: string[];
}

const PRODUCTS_QUERY_KEY = ["products"];

const fetchProducts = async (
  storeId: string | null,
): Promise<ProductItem[]> => {
  if (!storeId) return [];

  const envelope: any = await fetcher(`/api/v1/products?storeId=${storeId}`);
  const rawList = envelope.data || [];

  return rawList.map((prod: any) => ({
    id: prod.id,
    name: prod.name,
    brand: prod.brand || "",
    price: prod.price.toString(),
    category: prod.category?.name || "Electronics",
    description: prod.description || "",
    stock: prod.inventory?.[0]?.quantityOnHand || 0,
  }));
};

export const useProductsPipeline = (
  storeId: string | null,
  onMutationSuccess?: () => void,
) => {
  const queryClient = useQueryClient();

  const query = useQuery<ProductItem[], Error>({
    queryKey: [...PRODUCTS_QUERY_KEY, storeId],
    queryFn: () => fetchProducts(storeId),
    staleTime: 10000,
    enabled: Boolean(getToken() && storeId),
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductItem): Promise<ProductItem> => {
      if (!storeId) throw new Error("No active store branch selected.");

      // 1. Fetch categories from backend to resolve name to ID
      const catEnvelope: any = await fetcher("/api/v1/categories");
      const categoriesList = catEnvelope.data || [];

      // 2. Map frontend dropdown category to seeded database category name
      const categoryNameMap: Record<string, string> = {
        Electronics: "Electronics",
        Apparel: "Shopping & Retail",
        "Home & Kitchen": "Home & Living",
        Groceries: "Food & Beverage",
      };

      const targetName = categoryNameMap[newProduct.category] || "Electronics";
      const matchedCategory = categoriesList.find(
        (c: any) => c.name.toLowerCase() === targetName.toLowerCase(),
      );

      const categoryId = matchedCategory?.id || categoriesList[0]?.id;
      if (!categoryId) {
        throw new Error(
          "No category ID matches. Ensure database categories are seeded.",
        );
      }

      // 3. Post to backend to create the product
      const response: any = await fetcher("/api/v1/products", {
        method: "POST",
        body: JSON.stringify({
          storeId,
          name: newProduct.name,
          price: Number(newProduct.price),
          brand: newProduct.brand,
          description: newProduct.description,
          categoryId,
          tags: newProduct.tags || [],
          isActive: true,
          initialStock: newProduct.stock || 0,
        }),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEY, storeId],
      });
      if (onMutationSuccess) onMutationSuccess();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return fetcher(`/api/v1/products/${productId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEY, storeId],
      });
    },
  });

  return {
    products: query.data ?? ([] as ProductItem[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addProduct: addProductMutation.mutateAsync,
    isAdding: addProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeleting: deleteProductMutation.isPending,
  };
};
