"use client";

import React from "react";
import { Check } from "lucide-react";
import {
  ALL_PRODUCT_TAGS,
  TAG_LABELS,
  ProductTagType,
} from "@/shared/constants/product-tags.constant";

function TagSelector({
  selected,
  onChange,
}: {
  selected: ProductTagType[];
  onChange: (tags: ProductTagType[]) => void;
}) {
  const toggleTag = (tag: ProductTagType) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {ALL_PRODUCT_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium outline-none transition-all duration-200 hover:scale-105 focus:outline-2 focus:outline-offset-2 active:scale-95"
            style={{
              background: isSelected
                ? "var(--brand-core)"
                : "var(--background-secondary)",
              color: isSelected
                ? "var(--background-primary)"
                : "var(--text-primary)",
              border: `1px solid ${
                isSelected ? "var(--brand-core)" : "var(--border-default)"
              }`,
              outlineColor: "var(--brand-core)",
            }}
            aria-pressed={isSelected}
          >
            {isSelected && <Check className="h-4 w-4" />}
            {TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}

export default TagSelector;
