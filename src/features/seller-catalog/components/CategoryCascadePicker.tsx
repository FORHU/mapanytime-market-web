"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useSafeQuery } from "@/shared/query/useSafeQuery";

/**
 * The minimum shape the cascade needs from a category.
 *
 * Declared locally rather than imported from the `stores` feature: cross-feature
 * imports are barred by the architecture validator, so the data source is injected
 * by the app layer through `loadChildren` instead.
 */
export type CascadeCategory = {
  id: string;
  name: string;
  /** Present when the source includes it; absent is treated as "no children". */
  subCategories?: { id: string }[];
};

/** A category the seller has picked, plus whether it can be drilled into further. */
export type SelectedCategoryNode = {
  id: string;
  name: string;
  /** False means this is a leaf — the deepest classification available. */
  hasChildren: boolean;
};

/**
 * Stops a cycle in `parentId` from drilling forever. The seeded taxonomy is 4 deep;
 * anything past this is corrupt data, not a legitimately deeper tree.
 */
const MAX_DEPTH = 6;

/** Accent used for the active step, the selected row and the open-state glow. */
const ACCENT = "var(--text-tertiary)";
const tintedAccent = (percent: number) =>
  `color-mix(in srgb, ${ACCENT} ${percent}%, transparent)`;

const hasChildren = (category: CascadeCategory) =>
  (category.subCategories?.length ?? 0) > 0;

type Props = {
  /** The store's primary category. The cascade lists its descendants, not itself. */
  rootId: string | null;
  rootName?: string;
  rootLoading?: boolean;
  rootError?: boolean;
  /** Selected category id owned by the parent form; clearing it resets the cascade. */
  value: string;
  onChange: (node: SelectedCategoryNode | null) => void;
  /** Injected by the app layer — see the note on `CascadeCategory`. */
  loadChildren: (parentId: string) => Promise<CascadeCategory[]>;
  disabled?: boolean;
};

/**
 * Drill-down category selector: one trigger showing the chosen path, and a panel
 * that walks a single level at a time.
 *
 * Replaces a single fixed dropdown that could only ever reach level 2 of a 4-level
 * taxonomy, which left every deeper category unassignable.
 *
 * Depth comes entirely from the data. Picking a branch advances a level and keeps the
 * panel open; picking a leaf closes it. Because a branch's depth isn't known until
 * it's walked, the step indicator shows the levels discovered so far rather than a
 * total fixed up front.
 */
export default function CategoryCascadePicker({
  rootId,
  rootName,
  rootLoading = false,
  rootError = false,
  value,
  onChange,
  loadChildren,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState(0);
  const [path, setPath] = useState<SelectedCategoryNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Which way the seller last moved through the tree. Drives the level slide so
   * the list travels with the step indicator instead of against it — every
   * `setLevel` should set this alongside.
   */
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [terminal, setTerminal] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!value && path.length > 0) {
      setPath([]);
      setLevel(0);
      setTerminal(new Set());
      setDirection("forward");
    }
  }, [value, path]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const currentParentId = level === 0 ? rootId : (path[level - 1]?.id ?? null);

  const { data, isLoading, isError } = useSafeQuery<CascadeCategory[]>({
    queryKey: ["seller-catalog", "category-children", currentParentId],
    queryFn: () => loadChildren(currentParentId as string),
    enabled: Boolean(currentParentId),
    placeholderData: keepPreviousData,
  });

  const options = useMemo(() => data ?? [], [data]);
  const showLoading = isLoading && !isError && options.length === 0;
  const isEmpty = !isLoading && !isError && options.length === 0;

  useEffect(() => {
    if (!isEmpty || level === 0) return;
    const parent = path[level - 1];
    if (!parent || terminal.has(parent.id)) return;

    setTerminal((prev) => new Set(prev).add(parent.id));
    setPath((prev) =>
      prev.map((n, i) => (i === level - 1 ? { ...n, hasChildren: false } : n)),
    );
    setDirection("back");
    setLevel(level - 1);
    setOpen(false);
    onChange({ ...parent, hasChildren: false });
  }, [isEmpty, level, path, terminal, onChange]);

  const handlePick = (option: CascadeCategory) => {
    const node: SelectedCategoryNode = {
      id: option.id,
      name: option.name,
      hasChildren: hasChildren(option) && !terminal.has(option.id),
    };

    const next = path.slice(0, level);
    next.push(node);
    setPath(next);
    onChange(node);

    if (node.hasChildren && next.length < MAX_DEPTH) {
      setDirection("forward");
      setLevel(level + 1);
    } else {
      setOpen(false);
    }
  };

  const pathNames = path.map((n) => n.name);
  const triggerText = pathNames.length
    ? pathNames.join(" › ")
    : "Select category";

  const deepest = path[path.length - 1];
  const hasLevelBelow = deepest
    ? deepest.hasChildren && !terminal.has(deepest.id)
    : true;

  const totalLevels = Math.max(
    path.length + (hasLevelBelow && !isEmpty ? 1 : 0),
    level + 1,
  );
  const panelTitle =
    level === 0
      ? (rootName ?? "Category")
      : (path[level - 1]?.name ?? "Category");

  const triggerDisabled = disabled || !rootId || rootLoading || rootError;
  const triggerLabel = rootError
    ? "Couldn't load store categories"
    : rootLoading
      ? "Loading categories…"
      : !rootId
        ? "No categories available"
        : triggerText;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={triggerDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[14px] px-[18px] py-[14px] text-left transition-shadow duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "var(--background-secondary)",
          boxShadow: open
            ? `0 0 0 1px ${tintedAccent(50)}, 0 0 18px ${tintedAccent(25)}`
            : `0 0 0 1px var(--border-default)`,
        }}
      >
        <span
          className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium"
          style={{
            color: pathNames.length
              ? "var(--text-primary)"
              : "var(--text-secondary)",
          }}
        >
          {triggerLabel}
        </span>
        <span
          className="ml-[10px] flex-shrink-0 text-xs transition-transform duration-200"
          style={{
            color: ACCENT,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-10 overflow-hidden rounded-[14px]"
          style={{
            top: "calc(100% + 8px)",
            background: "var(--background-secondary)",
            boxShadow: `0 0 0 1px ${tintedAccent(35)}, 0 12px 28px rgba(0,0,0,0.5)`,
          }}
        >
          <div
            className="flex items-center gap-[10px] px-[14px] py-3"
            style={{ borderBottom: "1px solid var(--border-default)" }}
          >
            {level > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDirection("back");
                  setLevel((prev) => Math.max(0, prev - 1));
                }}
                aria-label="Back to the previous level"
                className="cursor-pointer px-1 py-0.5 text-sm"
                style={{ color: ACCENT }}
              >
                ←
              </button>
            )}

            <span
              key={panelTitle}
              className="step-title-enter flex-1 text-[13px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {panelTitle}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-[14px] pb-1 pt-2.5">
            {Array.from({ length: totalLevels }).map((_, index) => {
              const done = Boolean(path[index]);
              const active = index === level;
              return (
                <div
                  key={index}
                  className="step-segment-enter flex items-center gap-1.5"
                  style={{ animationDelay: `${Math.min(index * 70, 280)}ms` }}
                >
                  <div
                    className={`step-dot relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                      active ? "step-dot-active" : ""
                    }`}
                    style={{
                      border: active
                        ? `2px solid ${ACCENT}`
                        : `1px solid var(--border-default)`,
                      color: done
                        ? "var(--background-primary)"
                        : active
                          ? ACCENT
                          : "var(--text-secondary)",
                    }}
                  >
                    <span
                      aria-hidden
                      className={`step-dot-fill absolute inset-0 rounded-full ${
                        done ? "step-dot-fill-on" : ""
                      }`}
                      style={{ background: ACCENT }}
                    />
                    <span
                      className={`relative ${done ? "step-check-enter" : ""}`}
                      style={{ display: "inline-flex" }}
                    >
                      {done ? "✓" : index + 1}
                    </span>
                  </div>
                  {index < totalLevels - 1 && (
                    <div
                      className="h-0.5 w-[18px] overflow-hidden rounded-full"
                      style={{ background: "var(--border-default)" }}
                    >
                      <div
                        className={`step-connector-fill h-full w-full ${
                          done ? "step-connector-fill-on" : ""
                        }`}
                        style={{ background: ACCENT }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <div
              className="ml-1.5 text-[11px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Step {level + 1} of {totalLevels}
            </div>
          </div>

          <div
            key={showLoading ? "loading" : currentParentId}
            className={`${
              direction === "back" ? "step-list-back" : "step-list-forward"
            } flex max-h-64 flex-col gap-1 overflow-y-auto px-2.5 pb-2.5 pt-1.5`}
          >
            {showLoading && (
              <div
                className="px-[14px] py-2.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Loading…
              </div>
            )}
            {isError && (
              <div
                className="px-[14px] py-2.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Couldn&apos;t load sub-categories
              </div>
            )}
            {!showLoading &&
              !isError &&
              options.map((option) => {
                const isSelected = path[level]?.id === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handlePick(option)}
                    className="flex cursor-pointer items-center justify-between rounded-[10px] px-[14px] py-2.5 text-left text-sm"
                    style={{
                      background: isSelected ? tintedAccent(12) : "transparent",
                      color: isSelected ? ACCENT : "var(--text-primary)",
                    }}
                  >
                    <span>{option.name}</span>
                    {isSelected && <span style={{ color: ACCENT }}>✓</span>}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
