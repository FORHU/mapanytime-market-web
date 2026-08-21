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
  storeName?: string;
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
  totalPages: 0,
  page: 1,
  limit: 10,
};

interface FetchProductsParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const fetchProducts = async (
  storeId: string | null,
  params: FetchProductsParams,
): Promise<ProductsPage> => {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (storeId) query.append("storeId", storeId);
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

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
    category: product.category?.name || "",
    categoryId: product.category?.id,
    description: product.description || "",
    stock: product.inventory?.[0]?.quantityOnHand || 0,
    imageUrl: product.productImages?.[0]?.file?.url || undefined,
    storeName: product.store?.storeName,
  };
}

export interface UseProductsPipelineOptions {
  storeId: string | null;
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onMutationSuccess?: () => void;
}

export const useProductsPipeline = (options: UseProductsPipelineOptions) => {
  const {
    storeId,
    page = 1,
    limit = 10,
    search,
    categoryId,
    sortBy,
    sortOrder,
    onMutationSuccess,
  } = options;
  const queryClient = useQueryClient();

  const query = useQuery<ProductsPage, Error>({
    queryKey: [
      PRODUCTS_QUERY_KEY,
      storeId,
      page,
      limit,
      search,
      categoryId,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchProducts(storeId, {
        page,
        limit,
        search,
        categoryId,
        sortBy,
        sortOrder,
      }),
    staleTime: 10000,
    enabled: Boolean(getToken()),
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductItem): Promise<ProductItem> => {
      if (!storeId) throw new Error("No active store branch selected.");

      // The form always picks a sub-category, so require a real category ID.
      // Guessing a category on the client would silently mis-categorize.
      const categoryIdForCreate = newProduct.categoryId;
      if (!categoryIdForCreate) {
        throw new Error(
          "A category is required. Select a sub-category and try again.",
        );
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

      // The backend computes the delta transactionally from the absolute target,
      // so stock can be increased or decreased safely.
      await fetcher(`/api/v1/inventory/${productId}/adjust`, {
        method: "PATCH",
        body: JSON.stringify({ targetQuantity: stock }),
      });

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
    isFetching: query.isFetching,
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
