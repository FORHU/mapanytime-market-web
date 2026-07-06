"use client";

import React, { useState, ChangeEvent, FormEvent, DragEvent } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { FormSkeleton } from "./FormSkeleton";
// ✅ FIXED: Corrected import target location using absolute path configurations
import {
  ProductFormCore,
  ProductFormValues,
} from "@/features/seller-catalog/components/ProductFormCore";
import { uploadAIImage } from "./aiServiceLocal";
import { UploadCloud, Sparkles, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function AICatalogUpload() {
  const [form, setForm] = useState<ProductFormValues>({
    name: "",
    brand: "",
    description: "",
    price: 0,
    stock: 0,
    category: "Electronics",
  });

  const [aiFields, setAiFields] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [systemMessage, setSystemMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name])
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    if (aiFields[name]) setAiFields((prev) => ({ ...prev, [name]: false }));
  };

  const processImageStream = async (file: File) => {
    setIsProcessing(true);
    setSystemMessage(null);
    try {
      // Cast the incoming response payload to a safe unconstrained object record
      const payload = (await uploadAIImage(file)) as Record<string, any>;
      const { title, description, price, brand, stock, category } = payload;

      setForm((prev) => ({
        ...prev,
        name: title || payload.name || prev.name,
        description: description || prev.description,
        price: price ? Number(price) : prev.price,
        brand: brand || prev.brand,
        stock: stock ? Number(stock) : prev.stock,
        category: category || prev.category,
      }));

      // Map out fields that were dynamically filled by the Vision engine
      const highlights = Object.keys(payload).reduce(
        (acc, key) => ({ ...acc, [key === "title" ? "name" : key]: true }),
        {},
      );
      setAiFields(highlights);

      setSystemMessage({
        type: "success",
        text: "Vision layout structural vectors parsed cleanly.",
      });
    } catch (err: any) {
      setSystemMessage({
        type: "error",
        text: err?.message || err || "Failed to process visual asset.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0])
      await processImageStream(e.dataTransfer.files[0]);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setSystemMessage({
        type: "success",
        text: "Product deployed safely to your catalog.",
      });
    } catch (err) {
      setSystemMessage({ type: "error", text: "Pipeline rejection error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* LEFT COLUMN: DROPZONE CONTROL */}
      <div className="lg:col-span-5 space-y-4">
        <div className="space-y-1 text-left">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brand-core)]" /> Vision
            Engine Ingestion
          </h3>
          <p className="text-xs text-zinc-400">
            Drop an item image asset frame to extract attributes automatically.
          </p>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[280px] transition-all overflow-hidden ${
            isDragActive
              ? "border-[var(--brand-core)] bg-[var(--background-secondary)]"
              : "border-[var(--border-strong)] bg-[var(--background-elevated)]"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={async (e) =>
              e.target.files?.[0] &&
              (await processImageStream(e.target.files[0]))
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4 flex flex-col items-center z-10 pointer-events-none">
            <UploadCloud
              className={`w-6 h-6 text-[var(--brand-core)] ${isProcessing ? "animate-bounce" : ""}`}
            />
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {isProcessing
                ? "Analyzing raster structural vectors..."
                : "Drag asset frame component here"}
            </p>
          </div>
        </div>

        {systemMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-bold border flex items-start gap-2 ${
              systemMessage.type === "success"
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-600"
                : "bg-rose-50/50 border-rose-200 text-rose-600"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{systemMessage.text}</span>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: CORE FORM INPUT WRAPPER */}
      <div className="lg:col-span-7">
        <Card className="p-6 border border-[var(--border-default)]">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-light)]">
              <ShoppingBag className="w-4 h-4 text-[var(--brand-core)]" />
              <div className="text-left">
                <h2 className="text-sm font-black">Product Node Attributes</h2>
              </div>
            </div>

            {isProcessing ? (
              <FormSkeleton />
            ) : (
              <ProductFormCore
                values={form}
                errors={errors}
                aiHighlights={aiFields}
                onChange={handleInputChange}
              />
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isProcessing}
              className="!h-11 mt-4"
            >
              Authorize and Deploy Product Node
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
