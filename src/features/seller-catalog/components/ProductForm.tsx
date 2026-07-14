"use client";

import React, { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import {
  ProductFormCore,
  ProductFormValues,
} from "@/shared/components/forms/ProductFormCore";
import type { ProductItem } from "@/shared/hooks/useProductsPipeline";

interface ProductFormProps {
  onSuccess: (newProduct: ProductItem) => Promise<ProductItem>;
  closeForm: () => void; // ✅ Added prop to close the window on submit
}

export default function ProductForm({
  onSuccess,
  closeForm,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>({
    name: "",
    brand: "",
    description: "",
    price: 0,
    stock: 0,
    category: "Electronics",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.brand) {
      setErrors({
        name: !form.name ? "Product name is required" : "",
        brand: !form.brand ? "Brand name is required" : "",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSuccess({
        ...form,
        price: form.price.toString(),
        category: form.category ?? "Electronics",
      });

      setForm({
        name: "",
        brand: "",
        description: "",
        price: 0,
        stock: 0,
        category: "Electronics",
      });
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
      <ProductFormCore
        values={form}
        errors={errors}
        onChange={handleInputChange}
      />

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="px-6 py-2 text-xs font-bold rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-all"
        >
          Register Catalog Product
        </Button>
      </div>
    </form>
  );
}
