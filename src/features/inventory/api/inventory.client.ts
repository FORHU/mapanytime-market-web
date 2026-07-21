import {
  InventorySourceProductSchema,
  InventoryItemsResponseSchema,
  type InventoryStockStatus,
  type InventoryItemsResponse,
} from "../contracts/inventory.contract";

const deriveStatus = (stock?: number): InventoryStockStatus => {
  if (stock === undefined) return "UNKNOWN";
  return stock === 0 ? "OUT_OF_STOCK" : "IN_STOCK";
};

export const deriveInventoryItems = (
  products: unknown[],
): InventoryItemsResponse => {
  const items = products.map((product) => {
    const source = InventorySourceProductSchema.parse(product);
    return {
      productId: source.id,
      name: source.name,
      sku: source.sku,
      price: source.price,
      stock: source.stock,
      status: deriveStatus(source.stock),
    };
  });
  return InventoryItemsResponseSchema.parse(items);
};
