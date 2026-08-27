import { describe, it, expect } from "vitest";
import {
  toVariantDrafts,
  toOptionsPayload,
  canonicalOptions,
  usedOptionNames,
  emptyVariant,
  type VariantDraft,
} from "../variant-options";

const draft = (over: Partial<VariantDraft> = {}): VariantDraft => ({
  ...emptyVariant(),
  ...over,
});

describe("toOptionsPayload — the draft chip", () => {
  it("flushes a typed-but-uncommitted value so the seller does not lose it", () => {
    // Types "Large", clicks Save without pressing Enter.
    const variants = [draft({ name: "Size", values: ["S"], draft: "Large" })];
    expect(toOptionsPayload(variants)).toEqual([
      { name: "Size", values: ["S", "Large"] },
    ]);
  });

  it("ignores a whitespace-only draft", () => {
    const variants = [draft({ name: "Size", values: ["S"], draft: "   " })];
    expect(toOptionsPayload(variants)).toEqual([
      { name: "Size", values: ["S"] },
    ]);
  });

  it("does not duplicate a draft that already exists as a chip", () => {
    const variants = [draft({ name: "Color", values: ["Red"], draft: "red" })];
    expect(toOptionsPayload(variants)).toEqual([
      { name: "Color", values: ["Red"] },
    ]);
  });
});

describe("toOptionsPayload — undefined vs empty", () => {
  it("returns undefined, not [], when there is nothing to send", () => {
    // undefined omits the key so the server leaves options untouched; [] would
    // mean "clear them all".
    expect(toOptionsPayload([])).toBeUndefined();
  });

  it("returns undefined when every option is blank", () => {
    expect(toOptionsPayload([draft(), draft()])).toBeUndefined();
  });

  it("drops an option that has a name but no values", () => {
    expect(
      toOptionsPayload([draft({ name: "Color", values: [] })]),
    ).toBeUndefined();
  });
});

describe("toOptionsPayload — normalisation mirrors the server", () => {
  it("collapses internal whitespace and trims", () => {
    const variants = [
      draft({ name: "  Sleeve   Length ", values: ["  Long  Sleeve  "] }),
    ];
    expect(toOptionsPayload(variants)).toEqual([
      { name: "Sleeve Length", values: ["Long Sleeve"] },
    ]);
  });

  it("dedupes values case-insensitively, keeping the first casing", () => {
    const variants = [draft({ name: "Color", values: ["Red", "red", "Blue"] })];
    expect(toOptionsPayload(variants)).toEqual([
      { name: "Color", values: ["Red", "Blue"] },
    ]);
  });

  it("dedupes option names case-insensitively, first-wins", () => {
    const variants = [
      draft({ name: "Size", values: ["S"] }),
      draft({ name: "size", values: ["M"] }),
    ];
    expect(toOptionsPayload(variants)).toEqual([
      { name: "Size", values: ["S"] },
    ]);
  });

  it("preserves the seller's casing verbatim", () => {
    const variants = [
      draft({ name: "Model", values: ["iPhone", "XL", "500ml"] }),
    ];
    expect(toOptionsPayload(variants)?.[0].values).toEqual([
      "iPhone",
      "XL",
      "500ml",
    ]);
  });
});

describe("toVariantDrafts", () => {
  it("maps API rows into builder state", () => {
    const drafts = toVariantDrafts([{ name: "Size", values: ["S", "M"] }]);
    expect(drafts).toHaveLength(1);
    expect(drafts[0].name).toBe("Size");
    expect(drafts[0].values).toEqual(["S", "M"]);
    expect(drafts[0].draft).toBe("");
  });

  it("returns an empty array for a product with no options", () => {
    expect(toVariantDrafts(undefined)).toEqual([]);
  });

  it("gives every row a distinct React key", () => {
    const drafts = toVariantDrafts([
      { name: "Size", values: ["S"] },
      { name: "Color", values: ["Red"] },
    ]);
    expect(drafts[0].id).not.toBe(drafts[1].id);
  });

  it("copies the values array rather than aliasing the source", () => {
    const source = [{ name: "Size", values: ["S"] }];
    const drafts = toVariantDrafts(source);
    drafts[0].values.push("M");
    expect(source[0].values).toEqual(["S"]);
  });
});

describe("canonicalOptions — the dirty-check property", () => {
  it("treats undefined and [] as identical", () => {
    // This is what makes a product created BEFORE the option tier open clean
    // rather than pre-dirtied, with Save correctly disabled.
    expect(canonicalOptions(undefined)).toBe(canonicalOptions([]));
  });

  it("round-trips unchanged options to an identical string", () => {
    const options = [{ name: "Size", values: ["S", "M"] }];
    expect(canonicalOptions(toOptionsPayload(toVariantDrafts(options)))).toBe(
      canonicalOptions(options),
    );
  });

  it("detects a changed value", () => {
    expect(canonicalOptions([{ name: "Size", values: ["S"] }])).not.toBe(
      canonicalOptions([{ name: "Size", values: ["M"] }]),
    );
  });

  it("detects a reordered value list", () => {
    expect(canonicalOptions([{ name: "Size", values: ["S", "M"] }])).not.toBe(
      canonicalOptions([{ name: "Size", values: ["M", "S"] }]),
    );
  });

  it("is insensitive to the transient draft and id fields", () => {
    const a = [draft({ name: "Size", values: ["S"], draft: "" })];
    const b = [draft({ name: "Size", values: ["S"], draft: "" })];
    expect(canonicalOptions(toOptionsPayload(a))).toBe(
      canonicalOptions(toOptionsPayload(b)),
    );
  });
});

describe("usedOptionNames", () => {
  it("excludes the row being edited", () => {
    const a = draft({ name: "Size", values: ["S"] });
    const b = draft({ name: "Color", values: ["Red"] });
    expect(usedOptionNames([a, b], a.id)).toEqual(new Set(["color"]));
  });

  it("lower-cases so the dropdown hides a differently-cased duplicate", () => {
    const a = draft({ name: "SIZE" });
    const b = draft({ name: "Color" });
    expect(usedOptionNames([a, b], b.id).has("size")).toBe(true);
  });

  it("ignores rows with no name yet", () => {
    const a = draft({ name: "" });
    const b = draft({ name: "Color" });
    expect(usedOptionNames([a, b], b.id).size).toBe(0);
  });
});
