import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/shared/config/api";
// import { io } from "socket.io-client"; // Commented out until backend is ready

export interface ProductItem {
  id?: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  stock: number;
}

const USE_LIVE_BACKEND = true;
const PRODUCTS_QUERY_KEY = ["products"];

const fetchProducts = async (): Promise<ProductItem[]> => {
  if (!USE_LIVE_BACKEND) return Promise.resolve([]);
  const response = await fetch(`${API_BASE_URL}/api/seller/products`);
  if (!response.ok) throw new Error("Failed to pull live catalog listings.");
  return response.json();
};

const createProduct = async (newProduct: ProductItem): Promise<ProductItem> => {
  if (!USE_LIVE_BACKEND) return Promise.resolve(newProduct);
  const response = await fetch(`${API_BASE_URL}/api/seller/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct),
  });
  if (!response.ok)
    throw new Error("Could not register product item downstream.");
  return response.json();
};

export const useProductsPipeline = (onMutationSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const query = useQuery<ProductItem[], Error>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchProducts,
    // Changing staleTime back to a normal window (like 10 seconds) so the UI
    // refetches normally until the socket layer is live.
    staleTime: 10000,
  });

  /* ==========================================================
     SOCKET.IO PIPELINE (Awaiting Backend Deployment)
     ==========================================================
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_GATEWAY_URL || "http://localhost:4000";
    const socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("CATALOG_UPDATED", () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    });

    socket.on("reconnect", () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    });

    return () => { socket.disconnect(); };
  }, [queryClient]);
  ========================================================== */

  const addProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      if (onMutationSuccess) onMutationSuccess();
    },
  });

  return {
    products: query.data ?? ([] as ProductItem[]),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    // mutateAsync (not mutate) so callers that need to know whether the
    // create actually succeeded — e.g. ProductForm, before it closes itself
    // — can await it instead of firing-and-forgetting.
    addProduct: addProductMutation.mutateAsync,
    isAdding: addProductMutation.isPending,
  };
};
