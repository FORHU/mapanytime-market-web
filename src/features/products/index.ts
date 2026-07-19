export { ProductForm } from "./components/ProductForm";
export { ProductCatalog } from "./components/ProductCatalog";
export { ProductDetail } from "./components/ProductDetail";
export {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
} from "./hooks/products.hooks";
export type {
  Product,
  Category,
  CreateProductInput,
  UpdateProductInput,
} from "./contracts/products.contract";
