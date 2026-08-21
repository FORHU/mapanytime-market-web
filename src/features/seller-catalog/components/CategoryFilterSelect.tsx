"use client";

import React, { useMemo } from "react";
import type { SellerCategoryNode } from "@/shared/contracts/products.contract";

interface CategoryFilterSelectProps {
  tree: SellerCategoryNode[];
  value: string;
  onChange: (categoryId: string) => void;
  isLoading: boolean;
  isError: boolean;
}

interface FlatOption {
  id: string;
  label: string;
}

interface OptionGroup {
  rootId: string;
  rootName: string;
  rootTotal: number;
  descendants: FlatOption[];
}

/** Two non-breaking spaces per level — plain spaces collapse inside <option>. */
const INDENT = "  ";

/**
 * Flattens a root's descendants depth-first, indenting by depth.
 *
 * HTML allows only one level of <optgroup>, so anything below the root is
 * expressed as indentation instead of real nesting. That degrades gracefully at
 * depth 3+ rather than breaking, and keeps the native mobile picker working.
 */
function flattenDescendants(
  nodes: SellerCategoryNode[],
  depth: number,
): FlatOption[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      label: `${INDENT.repeat(depth)}${node.name} (${node.totalCount})`,
    },
    ...flattenDescendants(node.children, depth + 1),
  ]);
}

/**
 * Category filter for the seller "My products" page.
 *
 * Every row is selectable, including parents — the API expands a selected
 * category to its descendants, so "All of Food & Beverage" returns everything
 * filed beneath it, not just products pinned directly to that node.
 */
export function CategoryFilterSelect({
  tree,
  value,
  onChange,
  isLoading,
  isError,
}: CategoryFilterSelectProps) {
  const groups = useMemo<OptionGroup[]>(
    () =>
      tree.map((root) => ({
        rootId: root.id,
        rootName: root.name,
        rootTotal: root.totalCount,
        descendants: flattenDescendants(root.children, 1),
      })),
    [tree],
  );

  const isEmpty = !isLoading && !isError && groups.length === 0;
  const isDisabled = isLoading || isError || isEmpty;

  // Mirrors the placeholder ladder in ProductForm so a failed load is visible
  // instead of silently rendering an empty dropdown.
  const placeholder = isError
    ? "Couldn't load categories"
    : isLoading
      ? "Loading categories…"
      : isEmpty
        ? "No categories yet"
        : "All Categories";

  return (
    <select
      aria-label="Filter by category"
      value={value}
      disabled={isDisabled}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 text-sm border rounded-xl focus:outline-none focus:border-[var(--brand-core)] transition-colors w-full md:w-52 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "var(--background-secondary)",
        borderColor: "var(--border-default)",
        color: "var(--text-primary)",
      }}
    >
      <option
        value=""
        className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
      >
        {placeholder}
      </option>

      {groups.map((group) => (
        <optgroup key={group.rootId} label={group.rootName}>
          <option
            value={group.rootId}
            className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
          >
            {`All of ${group.rootName} (${group.rootTotal})`}
          </option>
          {group.descendants.map((option) => (
            <option
              key={option.id}
              value={option.id}
              className="bg-[var(--background-secondary)] text-[var(--text-primary)]"
            >
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
