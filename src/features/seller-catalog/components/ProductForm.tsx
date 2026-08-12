"use client";

import React, { useState, useRef, useCallback, FormEvent } from "react";
import { toast } from "sonner";
import Image from "next/image";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";
import { useS3AssetUpload } from "@/shared/hooks/useS3AssetUpload";
import { useStoreCategories } from "@/features/stores/hooks/useStoreCategories";
import { useSubCategories } from "@/features/stores/hooks/useSubCategories";
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
} from "lucide-react";

const emptyVariant = () => ({
  id: crypto.randomUUID(),
  name: "",
  values: [] as string[],
  draft: "",
});

interface ProductFormProps {
  onSuccess: (newProduct: ProductItem) => Promise<ProductItem>;
  closeForm: () => void;
  /** The active store whose primary category scopes the sub-category list. */
  storeId: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                          */
/* -------------------------------------------------------------------------- */

function FieldLabel({
  icon: Icon,
  children,
  hint,
  required,
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <label
        className="flex items-center gap-1.5 text-sm font-medium"
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
      {hint && (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {hint}
        </span>
      )}
    </div>
  );
}

function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:glow-primary " +
        (className || "")
      }
      style={{
        background: "var(--background-secondary)",
        border: "1px solid var(--border-default)",
        color: "var(--text-primary)",
      }}
    />
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
/*  Tag input                                                                */
/* -------------------------------------------------------------------------- */

function TagInput({
  tags,
  setTags,
  placeholder,
}: {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setDraft("");
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl p-2.5 transition-all duration-200 focus-within:glow-primary"
      style={{
        background: "var(--background-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            background: "var(--background-elevated)",
            color: "var(--brand-core)",
            border: "1px solid var(--border-default)",
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => setTags(tags.filter((t) => t !== tag))}
            className="rounded-full opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && tags.length) {
            setTags(tags.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
        style={{ color: "var(--text-primary)" }}
      />
    </div>
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

  const addFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/"),
      );
      const withPreviews = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...withPreviews]);
    },
    [setImages],
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
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-6 py-10 text-center transition-all duration-200"
        style={{
          border: `1.5px dashed ${dragOver ? "var(--brand-core)" : "var(--border-default)"}`,
          background: dragOver
            ? "var(--background-elevated)"
            : "var(--background-secondary)",
          boxShadow: dragOver ? "var(--glow-vibrant, none)" : "none",
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
          Drag images here, or click to browse
        </p>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          PNG, JPG or WebP — first image is the cover
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

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
  storeId,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const {
    mainCategory,
    isLoading: storeCategoriesLoading,
    isError: storeCategoriesError,
  } = useStoreCategories(storeId);
  const primaryCategoryId = mainCategory?.id ?? null;

  const {
    data: subCategories,
    isLoading: subCategoriesLoading,
    isError: subCategoriesError,
  } = useSubCategories(primaryCategoryId);

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

  const formattedPrice = price
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(price) || 0)
    : null;

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel required>Product name</FieldLabel>
            <TextInput
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aurora Runner Sneaker"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
            )}
          </div>
          <div>
            <FieldLabel required>Brand</FieldLabel>
            <TextInput
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Nova Athletics"
            />
            {errors.brand && (
              <p className="mt-1 text-xs text-rose-500">{errors.brand}</p>
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
          <FieldLabel hint={`${description.length}/600`} required>
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
          <FieldLabel icon={Tag} hint="Optional">
            Tags
          </FieldLabel>
          <TagInput
            tags={tags}
            setTags={setTags}
            placeholder="e.g. summer, limited-edition"
          />
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
              Price (USD)
            </FieldLabel>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                $
              </span>
              <TextInput
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
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
              min="0"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              placeholder="e.g. 120"
            />
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
