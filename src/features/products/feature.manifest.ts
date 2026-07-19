export const featureManifest = {
  name: "products",
  dependsOn: ["auth"] as const,
  exposes: [
    "ProductForm",
    "ProductCatalog",
    "ProductDetail",
    "useProducts",
    "useProduct",
    "useCreateProduct",
    "useUpdateProduct",
    "useDeleteProduct",
  ] as const,
} as const;

export type ProductsManifest = typeof featureManifest;
