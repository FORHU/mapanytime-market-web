import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/shared/lib/http";
import { getToken } from "@/shared/lib/token";
import {
  ProductsApiResponseSchema,
  type SellerProduct,
  type UpdateProductInput,
} from "@/shared/contracts/products.contract";

export interface ProductItem {
  id?: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  categoryId?: string;
  description: string;
  stock: number;
  tags?: string[];
  imageUrl?: string;
  imageIds?: string[];
}

export interface ProductsPage {
  items: ProductItem[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

const PRODUCTS_QUERY_KEY = ["products"];

const EMPTY_PAGE: ProductsPage = {
  items: [],
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,
};

interface FetchProductsParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
}

const fetchProducts = async (
  storeId: string | null,
  params: FetchProductsParams,
): Promise<ProductsPage> => {
  if (!storeId)
    return { ...EMPTY_PAGE, page: params.page, limit: params.limit };

  const query = new URLSearchParams({
    storeId,
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.categoryId) query.set("categoryId", params.categoryId);

  const envelope = await fetcher<unknown>(
    `/api/v1/products?${query.toString()}`,
  );
  const parsed = ProductsApiResponseSchema.parse(envelope);
  const { items, total, totalPages, page, limit } = parsed.data;

  return {
    items: items.map(mapProductItem),
    total,
    totalPages,
    page,
    limit,
  };
};

function mapProductItem(product: SellerProduct): ProductItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand || "",
    price: product.price.toString(),
    category: product.category?.name || "Electronics",
    categoryId: product.category?.id,
    description: product.description || "",
    stock: product.inventory?.[0]?.quantityOnHand || 0,
    imageUrl: product.productImages?.[0]?.file?.url || undefined,
  };
}

export interface UseProductsPipelineOptions {
  storeId: string | null;
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  onMutationSuccess?: () => void;
}

export const useProductsPipeline = (options: UseProductsPipelineOptions) => {
  const {
    storeId,
    page = 1,
    limit = 10,
    search,
    categoryId,
    onMutationSuccess,
  } = options;
  const queryClient = useQueryClient();

  const query = useQuery<ProductsPage, Error>({
    queryKey: [PRODUCTS_QUERY_KEY, storeId, page, limit, search, categoryId],
    queryFn: () => fetchProducts(storeId, { page, limit, search, categoryId }),
    staleTime: 10000,
    enabled: Boolean(getToken() && storeId),
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductItem): Promise<ProductItem> => {
      if (!storeId) throw new Error("No active store branch selected.");

      let categoryIdForCreate = newProduct.categoryId;

      // Fallback: resolve a free-text category name to a backend category ID.
      if (!categoryIdForCreate) {
        const catEnvelope: any = await fetcher("/api/v1/categories");
        const categoriesList = catEnvelope.data || [];

        const categoryNameMap: Record<string, string> = {
          Electronics: "Electronics",
          Apparel: "Shopping & Retail",
          "Home & Kitchen": "Home & Living",
          Groceries: "Food & Beverage",
        };

        const targetName =
          categoryNameMap[newProduct.category] || "Electronics";
        const matchedCategory = categoriesList.find(
          (c: any) => c.name.toLowerCase() === targetName.toLowerCase(),
        );

        categoryIdForCreate = matchedCategory?.id || categoriesList[0]?.id;
        if (!categoryIdForCreate) {
          throw new Error(
            "No category ID matches. Ensure database categories are seeded.",
          );
        }
      }

      // Post to backend to create the product
      const response: any = await fetcher("/api/v1/products", {
        method: "POST",
        body: JSON.stringify({
          storeId,
          name: newProduct.name,
          price: Number(newProduct.price),
          brand: newProduct.brand,
          description: newProduct.description,
          categoryId: categoryIdForCreate,
          tags: newProduct.tags || [],
          isActive: true,
          initialStock: newProduct.stock || 0,
          imageIds: newProduct.imageIds || [],
        }),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY, storeId],
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
        queryKey: [PRODUCTS_QUERY_KEY, storeId],
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      productId,
      input,
      current,
    }: {
      productId: string;
      input: UpdateProductInput;
      current: ProductItem;
    }): Promise<ProductItem> => {
      const { name, description, price, stock } = input;

      await fetcher(`/api/v1/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ name, description, price }),
      });

      // The inventory endpoint only supports restocking (increments).
      const delta = stock - current.stock;
      if (delta > 0) {
        await fetcher(`/api/v1/inventory/${productId}/restock`, {
          method: "PATCH",
          body: JSON.stringify({ addedQuantity: delta }),
        });
      }

      return {
        ...current,
        name,
        description,
        price: price.toString(),
        stock,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY, storeId],
      });
    },
  });

  const data = query.data ?? { ...EMPTY_PAGE, page, limit };

  return {
    products: data.items,
    total: data.total,
    totalPages: data.totalPages,
    page: data.page,
    limit: data.limit,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addProduct: addProductMutation.mutateAsync,
    isAdding: addProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeleting: deleteProductMutation.isPending,
    updateProduct: (
      productId: string,
      input: UpdateProductInput,
      current: ProductItem,
    ) => updateProductMutation.mutateAsync({ productId, input, current }),
    isUpdating: updateProductMutation.isPending,
  };
};
