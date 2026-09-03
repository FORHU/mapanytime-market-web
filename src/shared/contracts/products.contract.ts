import { z } from "zod";
import { PRODUCT_LIMITS } from "@/shared/constants/product-limits.constant";
import { ALL_PRODUCT_TAGS_TUPLE } from "@/shared/constants/product-tags.constant";

export const ProductOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  position: z.number().optional(),
  values: z.array(z.object({ id: z.string().optional(), value: z.string() })),
});

export const SellerProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().nullable().optional(),
  price: z.coerce.number(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  category: z
    .object({ id: z.string(), name: z.string() })
    .nullable()
    .optional(),
  inventory: z
    .array(z.object({ quantityOnHand: z.coerce.number().default(0) }))
    .optional(),
  productImages: z
    .array(
      z.object({
        file: z
          .object({ path: z.string().optional(), url: z.string().optional() })
          .optional(),
      }),
    )
    .optional(),
  store: z.object({ storeName: z.string() }).optional(),
  /** Join records from GET /api/v1/products — flattened to tag names by the pipeline mapper. */
  tags: z.array(z.object({ tag: z.object({ name: z.string() }) })).optional(),
  options: z.array(ProductOptionSchema).optional(),
});

export const ProductsListDataSchema = z.object({
  items: z.array(SellerProductSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const ProductsApiResponseSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number().optional(),
  data: ProductsListDataSchema,
});

/**
 * A node of GET /api/v1/products/my-categories — the category hierarchy the
 * seller actually has products in, across one store or all of them.
 *
 * Depth is unbounded, so this is declared recursively rather than as a fixed
 * two-level shape. Note the flat `CategorySchema` in stores.contract.ts is a
 * strict 2-field object that strips nesting — it can't be reused here.
 */
export type SellerCategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
  directCount: number;
  totalCount: number;
  children: SellerCategoryNode[];
};

export const SellerCategoryNodeSchema: z.ZodType<SellerCategoryNode> = z.lazy(
  () =>
    z.object({
      id: z.string(),
      name: z.string(),
      parentId: z.string().nullable(),
      directCount: z.number(),
      totalCount: z.number(),
      children: z.array(SellerCategoryNodeSchema),
    }),
);

export const SellerCategoryTreeResponseSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number().optional(),
  data: z.array(SellerCategoryNodeSchema),
});

/**
 * Input for PUT /api/v1/products/:id — the editable product fields exposed in
 * the seller ProductDetailDialog. Description is capped to 600 chars to match
 * the existing ProductForm rule. Stock is adjusted via the inventory restock
 * endpoint, which only supports increases, so it must never be negative.
 */
export const UpdateProductInputSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(PRODUCT_LIMITS.NAME_MAX),
  brand: z.string().max(PRODUCT_LIMITS.BRAND_MAX).optional(),
  description: z
    .string()
    .max(
      PRODUCT_LIMITS.DESCRIPTION_MAX,
      `Description must be ${PRODUCT_LIMITS.DESCRIPTION_MAX} characters or fewer`,
    ),
  tags: z.array(z.enum(ALL_PRODUCT_TAGS_TUPLE)).optional(),
  price: z.coerce
    .number()
    .positive("Price must be a positive number")
    .max(PRODUCT_LIMITS.PRICE_MAX),
  stock: z.coerce
    .number()
    .int("Stock must be a non-negative whole number")
    .min(0, "Stock must be a non-negative whole number")
    .max(PRODUCT_LIMITS.STOCK_MAX),
  /**
   * Replace-all, matching `tags` and the server contract: an array is the whole
   * option set, `[]` clears it, omitting the key leaves options untouched.
   */
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.string().min(1)).min(1),
      }),
    )
    .optional(),
});

/** Flattened option shape used by the forms and the wire payload. */
export type ProductOptionInput = { name: string; values: string[] };

export type SellerProduct = z.infer<typeof SellerProductSchema>;
export type ProductsListData = z.infer<typeof ProductsListDataSchema>;
export type ProductsApiResponse = z.infer<typeof ProductsApiResponseSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
