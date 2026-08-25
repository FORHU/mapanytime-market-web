"use client";

import React, { useState, useRef, useCallback, FormEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";
import { useS3AssetUpload } from "@/shared/hooks/useS3AssetUpload";
import {
  type ProductTagType,
  PRODUCT_TAGS,
} from "@/shared/constants/product-tags.constant";
import {
  PRODUCT_LIMITS,
  PRICE_MAX_LABEL,
  STOCK_MAX_LABEL,
} from "@/shared/constants/product-limits.constant";
import TagSelector from "./TagSelector";
import {
  Tag,
  DollarSign,
  ImagePlus,
  Package,
  Layers,
  Plus,
  X,
  ChevronDown,
  Save,
  UploadCloud,
  Boxes,
  AlignLeft,
  Sparkles,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const emptyVariant = () => ({
  id: crypto.randomUUID(),
  name: "",
  values: [] as string[],
  draft: "",
});

// Shared with the edit form and mirrored from the API, so a product created
// here can always be saved there. These used to be per-form constants that
// disagreed with each other.
const MAX_PRICE = PRODUCT_LIMITS.PRICE_MAX;
const MAX_STOCK = PRODUCT_LIMITS.STOCK_MAX;
const MAX_NAME_LENGTH = PRODUCT_LIMITS.NAME_MAX;
const MAX_BRAND_LENGTH = PRODUCT_LIMITS.BRAND_MAX;
const MAX_DESCRIPTION_LENGTH = PRODUCT_LIMITS.DESCRIPTION_MAX;

/** Images per product — a form-only cap, not enforced server-side. */
const MAX_IMAGES = 5;

/** Amber, not rose: hitting a ceiling is a clamp, not a validation failure. */
const LIMIT_COLOR = "rgb(245 158 11)";

const MAX_PRICE_LABEL = PRICE_MAX_LABEL;
const MAX_STOCK_LABEL = STOCK_MAX_LABEL;

/**
 * Get counter visibility — return a hint string if > 80% used, empty otherwise.
 * This reduces visual noise while highlighting when the user is near the limit.
 */
const getCounterHint = (current: number, max: number): string => {
  if (current > max * 0.8) {
    return `${current}/${max}`;
  }
  return "";
};

/**
 * `max` on a number input only gates form validation and the stepper arrows —
 * it does not stop a paste. Clamping here is what actually keeps the value in
 * range, and it has to happen before Number() sees a long digit string:
 * "222222222222222222222" parses to 2.2222222222222223e+21, which
 * Intl.NumberFormat then renders as a wall of trailing zeros.
 */
const clampPriceInput = (raw: string): string => {
  if (raw === "") return "";

  // Keep at most 2 decimals — the column's scale, and what the formatter shows.
  const [whole = "", decimals] = raw.split(".");
  const trimmed =
    decimals !== undefined ? `${whole}.${decimals.slice(0, 2)}` : whole;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return "";
  if (parsed < 0) return "0";
  if (parsed > MAX_PRICE) return String(MAX_PRICE);

  // Returned as typed so a trailing "." survives while the user is mid-entry.
  return trimmed;
};

const clampStockInput = (raw: string): string => {
  if (raw === "") return "";

  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";

  // Number() may lose precision on an absurdly long paste, but the result is
  // still far above MAX_STOCK, so the clamp lands correctly either way.
  return String(Math.min(Number(digits), MAX_STOCK));
};

interface ProductFormCategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  onSuccess: (newProduct: ProductItem) => Promise<ProductItem>;
  closeForm: () => void;
  mainCategory: ProductFormCategoryOption | null;
  storeCategoriesLoading: boolean;
  storeCategoriesError: boolean;
  subCategories: ProductFormCategoryOption[];
  subCategoriesLoading: boolean;
  subCategoriesError: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                          */
/* -------------------------------------------------------------------------- */

function FieldLabel({
  icon: Icon,
  children,
  hint,
  required,
  hintAsHelper,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  hintAsHelper?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label
          className="flex min-w-0 items-center gap-1.5 text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {Icon && (
            <Icon
              className="h-3.5 w-3.5"
              style={{ color: "var(--brand-core)" }}
            />
          )}
          {children}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
        {hint && !hintAsHelper && (
          // max-w + truncate: the price hint renders a formatted currency string,
          // which must never widen the row past the card it sits in.
          <span
            className="ml-2 max-w-[55%] shrink-0 truncate text-xs"
            style={{ color: "var(--text-secondary)" }}
            title={hint}
          >
            {hint}
          </span>
        )}
      </div>
      {hint && hintAsHelper && (
        <p className="mb-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function TextInput({
  className,
  atLimit,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  /** Value sits on its ceiling — border shifts to amber. */
  atLimit?: boolean;
}) {
  return (
    <input
      {...props}
      className={
        "w-full overflow-hidden text-ellipsis rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:glow-primary " +
        (className || "")
      }
      style={{
        background: "var(--background-secondary)",
        border: `1px solid ${atLimit ? LIMIT_COLOR : "var(--border-default)"}`,
        color: "var(--text-primary)",
      }}
    />
  );
}

/**
 * Inline "you're at the ceiling" note. `aria-live` so a screen reader announces
 * it — otherwise a truncated paste is rewritten with no feedback at all.
 */
function LimitNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="mt-1.5 flex items-start gap-1.5 text-xs font-medium"
      style={{ color: LIMIT_COLOR }}
    >
      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  defaultOpen = true,
  collapsible = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: "var(--md-sys-color-surface-container-high)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div
        className={
          "flex items-center justify-between " +
          (collapsible ? "cursor-pointer select-none" : "")
        }
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "var(--background-elevated)",
                border: "1px solid var(--border-default)",
              }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: "var(--brand-core)" }}
              />
            </div>
          )}
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {collapsible && (
          <ChevronDown
            className="h-4 w-4 transition-transform duration-200"
            style={{
              color: "var(--text-secondary)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        )}
      </div>

      {(!collapsible || open) && (
        <div className="mt-5 space-y-5">{children}</div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image dropzone (visual-only placeholder)                                 */
/* -------------------------------------------------------------------------- */

function ImageDropzone({
  images,
  setImages,
}: {
  images: { id: string; file: File; url: string }[];
  setImages: React.Dispatch<
    React.SetStateAction<{ id: string; file: File; url: string }[]>
  >;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFull = images.length >= MAX_IMAGES;

  // Counted against the current list rather than inside the state updater:
  // updaters must stay pure, and StrictMode double-invokes them — which would
  // fire the toast twice.
  const addFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length === 0) return;

      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        toast.warning(
          `Image limit reached — ${MAX_IMAGES} images per product.`,
        );
        return;
      }

      const accepted = files.slice(0, remaining);
      const skipped = files.length - accepted.length;
      if (skipped > 0) {
        toast.warning(
          `Only ${MAX_IMAGES} images allowed — ${skipped} file${
            skipped === 1 ? "" : "s"
          } skipped.`,
        );
      }

      // Object URLs are only minted for files that made the cut.
      const withPreviews = accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...withPreviews]);
    },
    [images.length, setImages],
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          // Opening the picker when there is nowhere to put the result is a
          // dead end — say so instead.
          if (isFull) {
            toast.warning(`Image limit reached — remove one to add another.`);
            return;
          }
          inputRef.current?.click();
        }}
        className={
          "flex flex-col items-center justify-center gap-2 rounded-2xl px-6 py-10 text-center transition-all duration-200 " +
          (isFull ? "cursor-not-allowed" : "cursor-pointer")
        }
        style={{
          border: `1.5px dashed ${
            isFull
              ? LIMIT_COLOR
              : dragOver
                ? "var(--brand-core)"
                : "var(--border-default)"
          }`,
          background: dragOver
            ? "var(--background-elevated)"
            : "var(--background-secondary)",
          boxShadow: dragOver && !isFull ? "var(--glow-vibrant, none)" : "none",
          opacity: isFull ? 0.6 : 1,
        }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "var(--background-elevated)",
            border: "1px solid var(--border-default)",
          }}
        >
          <UploadCloud
            className="h-5 w-5"
            style={{ color: "var(--brand-core)" }}
          />
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {isFull
            ? `Maximum of ${MAX_IMAGES} images added`
            : "Drag images here, or click to browse"}
        </p>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          PNG, JPG or WebP — first image is the cover
        </p>
        <p
          className="text-xs font-semibold"
          style={{
            color: isFull ? LIMIT_COLOR : "var(--text-secondary)",
          }}
        >
          {images.length} / {MAX_IMAGES}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={isFull}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            // Reset so re-picking the same file still fires a change event.
            e.target.value = "";
          }}
        />
      </div>

      {isFull && (
        <LimitNotice>
          You&apos;ve reached the {MAX_IMAGES}-image limit. Remove one to add a
          different photo.
        </LimitNotice>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl"
              style={{ border: "1px solid var(--border-default)" }}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                className="object-cover"
              />
              {idx === 0 && (
                <span
                  className="absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: "var(--brand-core)",
                    color: "var(--background-primary)",
                  }}
                >
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => setImages(images.filter((i) => i.id !== img.id))}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Variants builder (visual-only placeholder)                               */
/* -------------------------------------------------------------------------- */

function VariantsBuilder({
  variants,
  setVariants,
}: {
  variants: { id: string; name: string; values: string[]; draft: string }[];
  setVariants: React.Dispatch<
    React.SetStateAction<
      { id: string; name: string; values: string[]; draft: string }[]
    >
  >;
}) {
  const addVariant = () => setVariants([...variants, emptyVariant()]);

  const updateVariant = (
    id: string,
    patch: Partial<{ name: string; values: string[]; draft: string }>,
  ) => setVariants(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const removeVariant = (id: string) =>
    setVariants(variants.filter((v) => v.id !== id));

  const addValue = (variant: {
    id: string;
    name: string;
    values: string[];
    draft: string;
  }) => {
    const value = variant.draft.trim();
    if (!value || variant.values.includes(value)) return;
    updateVariant(variant.id, {
      values: [...variant.values, value],
      draft: "",
    });
  };

  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div
          key={variant.id}
          className="rounded-xl p-4"
          style={{
            background: "var(--background-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <input
              value={variant.name}
              onChange={(e) =>
                updateVariant(variant.id, { name: e.target.value })
              }
              placeholder="Option name, e.g. Size or Color"
              className="flex-1 rounded-lg bg-transparent px-2 py-1.5 text-sm font-medium outline-none"
              style={{
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }}
            />
            <button
              type="button"
              onClick={() => removeVariant(variant.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg opacity-70 hover:opacity-100"
              style={{ border: "1px solid var(--border-default)" }}
            >
              <Trash2
                className="h-3.5 w-3.5"
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {variant.values.map((val) => (
              <span
                key={val}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: "var(--background-elevated)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {val}
                <button
                  type="button"
                  onClick={() =>
                    updateVariant(variant.id, {
                      values: variant.values.filter((v) => v !== val),
                    })
                  }
                  className="opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={variant.draft}
              onChange={(e) =>
                updateVariant(variant.id, { draft: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addValue(variant);
                }
              }}
              placeholder="Add value, press Enter"
              className="min-w-[110px] flex-1 bg-transparent py-1 text-xs outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-sm font-medium cursor-not-allowed"
        style={{
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
          opacity: 0.4,
        }}
      >
        <Plus className="h-4 w-4" />
        Add option (size, color, material…)
      </button>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        Variants are coming soon — this section will be saved when the feature
        launches.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ProductForm — main component                                             */
/* -------------------------------------------------------------------------- */

export default function ProductForm({
  onSuccess,
  closeForm,
  mainCategory,
  storeCategoriesLoading,
  storeCategoriesError,
  subCategories,
  subCategoriesLoading,
  subCategoriesError,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<ProductTagType[]>([]);

  const nameAtMax = name.length >= MAX_NAME_LENGTH;
  const brandAtMax = brand.length >= MAX_BRAND_LENGTH;

  const primaryCategoryId = mainCategory?.id ?? null;

  const subCategoryOptions = subCategories ?? [];
  const subCategoriesDisabled =
    !primaryCategoryId ||
    subCategoriesLoading ||
    subCategoriesError ||
    subCategoryOptions.length === 0;

  const subCategoryPlaceholder = storeCategoriesError
    ? "Couldn't load store categories"
    : storeCategoriesLoading
      ? "Loading categories…"
      : !primaryCategoryId
        ? "No sub-categories available"
        : subCategoriesLoading
          ? "Loading sub-categories…"
          : subCategoriesError
            ? "Couldn't load sub-categories"
            : subCategoryOptions.length === 0
              ? "No sub-categories available"
              : "Select a sub-category";

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [images, setImages] = useState<
    { id: string; file: File; url: string }[]
  >([]);

  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const uploadMutation = useS3AssetUpload("products");

  const [inventory, setInventory] = useState("");
  const [variants, setVariants] = useState<
    { id: string; name: string; values: string[]; draft: string }[]
  >([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guarded rather than trusting the clamp alone: autofill and programmatic
  // resets can put a value in state without passing through onChange.
  const priceNumber = Number(price);
  const formattedPrice =
    price !== "" && Number.isFinite(priceNumber) && priceNumber <= MAX_PRICE
      ? `₱${new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(priceNumber)}`
      : null;

  const priceAtMax = price !== "" && priceNumber >= MAX_PRICE;
  const stockAtMax = inventory !== "" && Number(inventory) >= MAX_STOCK;

  /**
   * A paste above the ceiling is rewritten in place, which is easy to miss.
   * Toast once per crossing — the ref stops further keystrokes at the ceiling
   * from stacking duplicates, and resets when the value drops back below.
   */
  const priceCapNotified = useRef(false);
  const stockCapNotified = useRef(false);

  const handlePriceChange = (raw: string) => {
    const clamped = clampPriceInput(raw);
    if (clamped !== raw && Number(clamped) >= MAX_PRICE) {
      if (!priceCapNotified.current) {
        priceCapNotified.current = true;
        toast.warning(`Price capped at ${MAX_PRICE_LABEL}`);
      }
    } else if (Number(clamped) < MAX_PRICE) {
      priceCapNotified.current = false;
    }
    setPrice(clamped);
  };

  const handleStockChange = (raw: string) => {
    const clamped = clampStockInput(raw);
    if (clamped !== raw && Number(clamped) >= MAX_STOCK) {
      if (!stockCapNotified.current) {
        stockCapNotified.current = true;
        toast.warning(`Stock capped at ${MAX_STOCK_LABEL} units`);
      }
    } else if (Number(clamped) < MAX_STOCK) {
      stockCapNotified.current = false;
    }
    setInventory(clamped);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Product name is required";
    if (!brand) newErrors.brand = "Brand name is required";
    if (!categoryId)
      newErrors.category = subCategoriesDisabled
        ? "No sub-category is available for your store's category yet"
        : "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const fileIds = uploadedFileIds.slice();

      if (
        images.length > 0 &&
        images.some((img) => !uploadedFileIds.includes(img.id))
      ) {
        const newFiles = images.filter(
          (img) => !uploadedFileIds.includes(img.id),
        );
        for (const img of newFiles) {
          const result = await uploadMutation.mutateAsync(img.file);
          if (result.fileId) fileIds.push(result.fileId);
        }
      }

      const selectedSubCategory = subCategoryOptions.find(
        (c) => c.id === categoryId,
      );

      await onSuccess({
        name,
        brand,
        price: price.toString(),
        category: selectedSubCategory?.name ?? "",
        categoryId: selectedSubCategory?.id,
        description,
        stock: inventory ? Number(inventory) : 0,
        tags: tags.length > 0 ? tags : undefined,
        imageIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setName("");
      setBrand("");
      setCategoryId("");
      setDescription("");
      setTags([]);
      setPrice("");
      setIsActive(true);
      setImages([]);
      setUploadedFileIds([]);
      setInventory("");
      setVariants([]);
      closeForm();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not add product. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--brand-core)" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          New listing
        </span>
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          Add New Product
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Fill in the details below to publish a new product to your store.
        </p>
      </div>

      {/* Basic Information */}
      <SectionCard
        title="Basic Information"
        subtitle="What the product is and how customers will find it"
        icon={AlignLeft}
      >
        <div className="space-y-5">
          <div>
            <FieldLabel
              hint={getCounterHint(name.length, MAX_NAME_LENGTH)}
              required
            >
              Product name
            </FieldLabel>
            <TextInput
              required
              value={name}
              maxLength={MAX_NAME_LENGTH}
              // maxLength already truncates typing and pastes; the slice covers
              // autofill and anything set programmatically.
              onChange={(e) =>
                setName(e.target.value.slice(0, MAX_NAME_LENGTH))
              }
              placeholder="e.g. Aurora Runner Sneaker"
              atLimit={nameAtMax}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
            )}
            {nameAtMax && (
              <LimitNotice>
                Maximum length reached — {MAX_NAME_LENGTH} characters.
              </LimitNotice>
            )}
          </div>

          <div>
            <FieldLabel
              hint={getCounterHint(brand.length, MAX_BRAND_LENGTH)}
              required
            >
              Brand
            </FieldLabel>
            <TextInput
              required
              value={brand}
              maxLength={MAX_BRAND_LENGTH}
              onChange={(e) =>
                setBrand(e.target.value.slice(0, MAX_BRAND_LENGTH))
              }
              placeholder="e.g. Nova Athletics"
              atLimit={brandAtMax}
            />
            {errors.brand && (
              <p className="mt-1 text-xs text-rose-500">{errors.brand}</p>
            )}
            {brandAtMax && (
              <LimitNotice>
                Maximum length reached — {MAX_BRAND_LENGTH} characters.
              </LimitNotice>
            )}
          </div>
        </div>

        <div>
          <FieldLabel
            icon={Boxes}
            hint={
              mainCategory
                ? `Under "${mainCategory.name}"`
                : "Based on your store's category"
            }
            hintAsHelper
          >
            Category
          </FieldLabel>
          <div className="relative">
            <select
              required
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={subCategoriesDisabled}
              aria-busy={subCategoriesLoading || storeCategoriesLoading}
              className="w-full appearance-none rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:glow-primary disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "var(--background-secondary)",
                border: "1px solid var(--border-default)",
                color: categoryId
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              }}
            >
              <option value="" disabled>
                {subCategoryPlaceholder}
              </option>
              {subCategoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
          {errors.category && (
            <p className="mt-1 text-xs text-rose-500">{errors.category}</p>
          )}
        </div>

        <div>
          <FieldLabel
            hint={getCounterHint(description.length, MAX_DESCRIPTION_LENGTH)}
            required
          >
            Description
          </FieldLabel>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 600))}
            rows={5}
            placeholder="Describe materials, fit, and what makes this product stand out…"
            className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:glow-primary"
            style={{
              background: "var(--background-secondary)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div>
          <FieldLabel icon={Tag} hint={`${tags.length} selected`}>
            Tags
          </FieldLabel>
          <TagSelector selected={tags} onChange={setTags} />
        </div>
      </SectionCard>

      {/* Pricing & Status */}
      <SectionCard
        title="Pricing & Status"
        subtitle="Set the price and control storefront visibility"
        icon={DollarSign}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel
              icon={DollarSign}
              hint={formattedPrice ?? undefined}
              required
            >
              Price
            </FieldLabel>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                ₱
              </span>
              <TextInput
                required
                type="number"
                inputMode="decimal"
                min="0"
                max={MAX_PRICE}
                step="0.01"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                atLimit={priceAtMax}
              />
            </div>
            {priceAtMax && (
              <LimitNotice>
                Maximum price reached — {MAX_PRICE_LABEL} is the highest a
                listing can be set to.
              </LimitNotice>
            )}
          </div>
          <div>
            <FieldLabel
              icon={Package}
              hint="Units available at launch"
              required
            >
              Initial stock
            </FieldLabel>
            <TextInput
              required
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_STOCK}
              step="1"
              value={inventory}
              onChange={(e) => handleStockChange(e.target.value)}
              placeholder="e.g. 120"
              atLimit={stockAtMax}
            />
            {stockAtMax && (
              <LimitNotice>
                Maximum stock reached — {MAX_STOCK_LABEL} units is the highest
                you can list at launch.
              </LimitNotice>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Media & Assets */}
      <SectionCard
        title="Media & Assets"
        subtitle="Add photos customers will see first"
        icon={ImagePlus}
      >
        <ImageDropzone images={images} setImages={setImages} />
      </SectionCard>

      {/* Advanced Options */}
      <SectionCard
        title="Advanced Options"
        subtitle="Product variants and options"
        icon={Layers}
        collapsible
        defaultOpen={true}
      >
        <div>
          <FieldLabel icon={Layers} hint="Optional">
            Variants & options
          </FieldLabel>
          <VariantsBuilder variants={variants} setVariants={setVariants} />
        </div>
      </SectionCard>

      {/* Floating save bar */}
      <div className="flex justify-center px-4 pb-5">
        <div
          className="flex w-full max-w-md items-center justify-between rounded-2xl px-5 py-3.5 sm:w-auto"
          style={{
            background: "var(--md-sys-color-surface-container-high)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="hidden sm:block">
            <p
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            ></p>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            ></p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="animate-pulse-glow glow-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform duration-150 hover:scale-[1.02] disabled:opacity-60"
            style={{
              background: "var(--brand-core)",
              color: "var(--background-primary)",
            }}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save Product"}
          </button>
        </div>
      </div>
    </form>
  );
}
