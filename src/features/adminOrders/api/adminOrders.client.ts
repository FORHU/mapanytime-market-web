import { fetcher } from "@/shared/lib/http";
import {
  AdminOrdersPageSchema,
  type AdminOrdersPage,
  type AdminOrderStatus,
} from "../contracts/adminOrder.contract";

export interface AdminOrdersQuery {
  status?: AdminOrderStatus | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Platform-wide orders for the admin console.
 *
 * `/v1/orders/store` resolves the caller's seller profile and 403s without
 * one, so an admin cannot use it — hence the separate `/v1/orders/admin`.
 * Filtering and paging run in the database, not here.
 */
export async function listAdminOrders(
  query: AdminOrdersQuery = {},
): Promise<AdminOrdersPage> {
  const params = new URLSearchParams();
  if (query.status && query.status !== "ALL")
    params.set("status", query.status);
  if (query.search?.trim()) params.set("search", query.search.trim());
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  const raw = await fetcher<{ data: unknown }>(
    `/api/v1/orders/admin?${params.toString()}`,
  );

  const page = (raw?.data ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(page.items) ? page.items : [];

  return AdminOrdersPageSchema.parse({
    total: Number(page.total ?? 0),
    page: Number(page.page ?? 1),
    limit: Number(page.limit ?? 20),
    totalPages: Number(page.totalPages ?? 1),
    items: rows.map((row) => {
      const order = row as Record<string, any>;
      return {
        id: order.id,
        storeId: order.storeId,
        storeName: order.storeName ?? order.store?.storeName ?? null,
        buyerName: order.buyer?.displayName ?? null,
        buyerPhone: order.buyer?.users?.phoneNumber ?? null,
        totalAmount: order.totalAmount,
        status: order.status,
        type: order.type,
        paymentMethod:
          order.payment?.[0]?.paymentMethod?.name ??
          order.payment?.[0]?.paymentMethod?.code ??
          null,
        pickupAt: order.pickupAt ?? null,
        createdAt: order.createdAt,
        items: (order.orderitems ?? []).map((item: Record<string, any>) => ({
          productId: item.productId,
          productName: item.productName ?? item.product?.name ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
    }),
  });
}
