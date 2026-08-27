import type { ProductOptionInput } from "@/shared/contracts/products.contract";
import { PRODUCT_LIMITS } from "@/shared/constants/product-limits.constant";

/**
 * Builder state ↔ wire payload for the product option tier.
 *
 * This mirrors mapanytime-api/src/modules/products/product-options.helper.ts,
 * which is the ENFORCING copy — everything here is UX only. Nothing in this
 * file may be the sole guard for a rule; the server re-derives all of them.
 */

export interface VariantDraft {
  /** React key only — never sent, and regenerated on every load. */
  id: string;
  name: string;
  values: string[];
  /** The in-progress chip the seller is typing. Never sent as-is. */
  draft: string;
  /**
   * Whether "Others…" was chosen, so the free-text input stays open.
   *
   * Explicit state, NOT derived from `!suggestions.includes(name)`: suggestions
   * arrive asynchronously, so a derived flag would flip every row to custom on
   * first paint and back once the query resolves.
   */
  isCustom: boolean;
}

function newId(): string {
  // randomUUID is unavailable in some older browsers and in a few test
  // environments, so fall back rather than throwing during render.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `opt-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export const emptyVariant = (): VariantDraft => ({
  id: newId(),
  name: "",
  values: [],
  draft: "",
  isCustom: false,
});

/** Collapses internal whitespace runs and trims — mirrors the server helper. */
function collapse(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/** API rows → builder state. */
export function toVariantDrafts(
  options: ProductOptionInput[] | undefined,
): VariantDraft[] {
  if (!options || options.length === 0) return [];

  return options.map((option) => ({
    id: newId(),
    name: option.name,
    values: [...option.values],
    draft: "",
    // Loaded rows render as free text: whether the name happens to match a
    // suggestion is irrelevant once it is saved, and treating it as a dropdown
    // selection would fight the async-suggestions problem described above.
    isCustom: true,
  }));
}

/**
 * Builder state → wire payload.
 *
 * Returns `undefined` rather than `[]` when nothing survives, so an untouched
 * form omits the `options` key entirely and the server leaves existing options
 * alone. An explicit `[]` means "clear them all" and is only produced when the
 * seller actually had options and removed them.
 */
export function toOptionsPayload(
  variants: VariantDraft[],
): ProductOptionInput[] | undefined {
  const seenNames = new Set<string>();
  const result: ProductOptionInput[] = [];

  for (const variant of variants) {
    const name = collapse(variant.name);
    if (!name) continue;

    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;

    // Flush the in-progress chip. Without this, a seller who types "Large" and
    // clicks Save straight away silently loses it.
    const rawValues = variant.draft.trim()
      ? [...variant.values, variant.draft]
      : variant.values;

    const seenValues = new Set<string>();
    const values: string[] = [];

    for (const raw of rawValues) {
      const value = collapse(raw);
      if (!value) continue;

      const valueKey = value.toLowerCase();
      if (seenValues.has(valueKey)) continue;

      seenValues.add(valueKey);
      values.push(value);

      if (values.length >= PRODUCT_LIMITS.OPTION_VALUES_MAX) break;
    }

    if (values.length === 0) continue;

    seenNames.add(nameKey);
    result.push({ name, values });

    if (result.length >= PRODUCT_LIMITS.OPTIONS_MAX) break;
  }

  return result.length > 0 ? result : undefined;
}

/**
 * Order- and content-sensitive, identity-insensitive serialisation for the edit
 * form's dirty check.
 *
 * Deep-comparing drafts would not work: `id` is regenerated on every load and
 * `draft` is transient, so a naive compare reports permanently dirty.
 *
 * Crucially `canonicalOptions(undefined) === canonicalOptions([])`, which is
 * what makes a product created before the option tier open CLEAN rather than
 * pre-dirtied.
 */
export function canonicalOptions(
  options: ProductOptionInput[] | undefined,
): string {
  if (!options || options.length === 0) return "";

  return options
    .map(
      (option) =>
        `${collapse(option.name)}:${option.values.map(collapse).join("|")}`,
    )
    .join(";;");
}

/**
 * Names already taken by another row, so the dropdown can hide them. Comparison
 * is case-insensitive because the server collapses "Size" and "size" into one.
 */
export function usedOptionNames(
  variants: VariantDraft[],
  exceptId: string,
): Set<string> {
  return new Set(
    variants
      .filter((v) => v.id !== exceptId && v.name.trim())
      .map((v) => collapse(v.name).toLowerCase()),
  );
}
