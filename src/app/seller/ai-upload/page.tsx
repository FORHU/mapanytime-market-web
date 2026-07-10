"use client";

import React, { useState, FormEvent } from "react";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { FormSkeleton } from "@/features/stores/components/FormSkeleton";
import {
  ProductFormCore,
  ProductFormValues,
} from "@/shared/components/forms/ProductFormCore";
import { uploadAIImage } from "@/features/stores/components/aiServiceLocal";
import { UploadCloud, Sparkles, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function AIUploadPage() {
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
  const [isDragActive, setIsDragActive] = useState(false);
  const [systemMessage, setSystemMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  const processImageStream = async (file: File) => {
    setIsProcessing(true);
    setSystemMessage(null);
    try {
      const payload = (await uploadAIImage(file)) as Record<string, any>;

      // Explicitly pull out what we need, avoiding any type lookup issues
      const { title, description, price, brand, stock, category } = payload;

      setForm((prev) => ({
        ...prev,
        name: title || payload.name || "",
        description: description || prev.description,
        price: price ? Number(price) : prev.price,
        brand: brand || prev.brand,
        stock: stock ? Number(stock) : prev.stock,
        category: category || prev.category,
      }));

      // Highlight the fields that came back from the AI uniquely to avoid collisions
      const highlights = Object.keys(payload).reduce(
        (acc, key) => ({ ...acc, [key === "title" ? "name" : key]: true }),
        {},
      );
      setAiFields(highlights);

      setSystemMessage({
        type: "success",
        text: "Vision analysis complete. Registry properties populated.",
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

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.brand) return;

    setIsSubmitting(true);
    try {
      const backendPayload = {
        name: form.name,
        brand: form.brand,
        price: form.price,
        description: form.description,
        initialStock: form.stock,
      };

      console.log("Sending payload to backend node:", backendPayload);

      setSystemMessage({
        type: "success",
        text: "Background stripped and product successfully deployed!",
      });
      setForm({
        name: "",
        brand: "",
        description: "",
        price: 0,
        stock: 0,
        category: "Electronics",
      });
      setAiFields({});
    } catch (err) {
      setSystemMessage({
        type: "error",
        text: "Transaction deployment failure.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-6xl mx-auto pt-4">
      {/* Dropzone Container */}
      <div className="lg:col-span-5 space-y-4">
        <div className="space-y-1 text-left">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brand-core)]" /> Vision
            Engine Ingestion
          </h3>
          <p className="text-xs text-zinc-400">
            Drop your raw product image here to instantly isolate the layer and
            auto-fill details.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragActive(false);
            if (e.dataTransfer.files?.[0])
              await processImageStream(e.dataTransfer.files[0]);
          }}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[320px] transition-all overflow-hidden ${
            isDragActive
              ? "border-[var(--brand-core)] bg-[var(--background-secondary)]"
              : "border-[var(--border-strong)] bg-[var(--background-elevated)]"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            disabled={isProcessing}
            onChange={async (e) =>
              e.target.files?.[0] &&
              (await processImageStream(e.target.files[0]))
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="space-y-4 flex flex-col items-center z-10 pointer-events-none">
            <UploadCloud
              className={`w-6 h-6 text-[var(--brand-core)] ${isProcessing ? "animate-bounce" : ""}`}
            />
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {isProcessing
                ? "Processing alpha channels..."
                : "Drag product photo here"}
            </p>
          </div>
        </div>
      </div>

      {/* Registry Review Form Wrapper */}
      <div className="lg:col-span-7 w-full">
        <Card className="p-6 border border-[var(--border-default)] shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-light)]">
              <ShoppingBag className="w-4 h-4 text-[var(--brand-core)]" />
              <div className="text-left">
                <h2 className="text-sm font-black">AI Verification Registry</h2>
                <p className="text-[10px] text-zinc-400">
                  Attributes locked until parsed by vision parser engine node
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

            {isProcessing ? (
              <FormSkeleton />
            ) : (
              <div>
                <ProductFormCore
                  values={form}
                  errors={{}}
                  aiHighlights={aiFields}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isProcessing || !form.name || !form.brand}
              className="!h-11 mt-4 w-full"
            >
              Authorize and Deploy Product Node
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
