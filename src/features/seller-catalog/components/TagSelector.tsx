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
    <div className="flex flex-wrap gap-2">
      {ALL_PRODUCT_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-full px-4 text-[13px] font-medium outline-none transition-all duration-200 hover:scale-105 focus:outline-2 focus:outline-offset-2 active:scale-95"
            style={{
              background: isSelected
                ? "var(--brand-core)"
                : "var(--background-elevated)",
              color: isSelected
                ? "var(--background-primary)"
                : "var(--brand-core)",
              // Unselected chips read as brand outlines rather than neutral
              // boxes: the tint is the affordance that they are pickable.
              border: `1px solid ${
                isSelected
                  ? "var(--brand-core)"
                  : "color-mix(in srgb, var(--brand-core) 45%, transparent)"
              }`,
              outlineColor: "var(--brand-core)",
            }}
            aria-pressed={isSelected}
          >
            {isSelected && <Check className="h-3.5 w-3.5" />}
            {TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}

export default TagSelector;
