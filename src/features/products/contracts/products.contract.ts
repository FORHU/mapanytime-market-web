import { z } from "zod";

// Categories are a real backend resource (GET /api/v1/categories), not a
// fixed frontend enum — verified 2026-07-16 against the live backend.
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CategoriesResponseSchema = z.array(CategorySchema);

export const ProductSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  name: z.string(),
  brand: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
  // Optional: PUT /api/v1/products/:id rejects a stock field outright
  // ("initialStock" is not allowed), which suggests current stock may not
  // live on the product resource at read time either (likely owned by
  // Inventory instead). Never independently confirmed on a real GET
  // response — kept optional rather than assumed-present so a live parse
  // can't fail on this field alone.
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string(),
  imageKey: z.string().nullable(),
  createdAt: z.string(),
});

export const ProductsResponseSchema = z.array(ProductSchema);

export const CreateProductInputSchema = z.object({
  storeId: z.string(),
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand name is required"),
  description: z.string(),
  price: z.number().nonnegative("Price cannot be negative"),
  initialStock: z.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  imageKey: z.string().nullable().optional(),
});

// No stock/initialStock field: verified against the live backend that
// PUT /api/v1/products/:id rejects it ("initialStock" is not allowed).
export const UpdateProductInputSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand name is required"),
  description: z.string(),
  price: z.number().nonnegative("Price cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  imageKey: z.string().nullable().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
