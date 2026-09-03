import { describe, it, expect } from "vitest";
import { mapProductItem } from "../useProductsPipeline";
import { SellerProductSchema } from "@/shared/contracts/products.contract";

/**
 * The regression guard for the "Zod strips unknown keys" trap.
 *
 * SellerProductSchema is a plain z.object(), so a field the API returns but the
 * schema omits is dropped SILENTLY — no error, no warning, it simply never
 * reaches the UI. Parsing through the real schema here (rather than hand-making
 * a SellerProduct) is what makes this test able to catch that.
 */
const parse = (raw: unknown) => SellerProductSchema.parse(raw);

const BASE = {
  id: "p1",
  name: "Tee",
  price: "499.00",
  category: { id: "c1", name: "Fashion" },
  inventory: [{ quantityOnHand: 5 }],
};

describe("mapProductItem — options survive the schema", () => {
  it("keeps options through parse and flattens values to strings", () => {
    const product = parse({
      ...BASE,
      options: [
        {
          id: "o1",
          name: "Size",
          position: 0,
          values: [
            { id: "v1", value: "S" },
            { id: "v2", value: "M" },
          ],
        },
      ],
    });

    expect(mapProductItem(product).options).toEqual([
      { name: "Size", values: ["S", "M"] },
    ]);
  });

  it("preserves the server's option ordering", () => {
    const product = parse({
      ...BASE,
      options: [
        { name: "Size", position: 0, values: [{ value: "S" }] },
        { name: "Color", position: 1, values: [{ value: "Red" }] },
      ],
    });

    expect(mapProductItem(product).options?.map((o) => o.name)).toEqual([
      "Size",
      "Color",
    ]);
  });

  it("tolerates an option payload with no ids", () => {
    const product = parse({
      ...BASE,
      options: [{ name: "Size", values: [{ value: "S" }] }],
    });

    expect(mapProductItem(product).options).toEqual([
      { name: "Size", values: ["S"] },
    ]);
  });
});

describe("mapProductItem — products without options", () => {
  it("maps a payload with no options key to undefined, not []", () => {
    // undefined is what makes a pre-option-tier product open CLEAN in the edit
    // form; [] would read as "the seller cleared every option".
    const product = parse(BASE);
    expect(mapProductItem(product).options).toBeUndefined();
  });

  it("maps an explicitly empty options array to an empty array", () => {
    const product = parse({ ...BASE, options: [] });
    expect(mapProductItem(product).options).toEqual([]);
  });

  it("still maps every other field normally", () => {
    const item = mapProductItem(parse(BASE));
    expect(item).toMatchObject({
      id: "p1",
      name: "Tee",
      price: "499",
      category: "Fashion",
      categoryId: "c1",
      stock: 5,
    });
  });
});
