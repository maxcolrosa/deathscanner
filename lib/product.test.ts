import { describe, it, expect } from "vitest";
import { PRODUCT, INCLUDED } from "@/lib/product";

describe("INCLUDED value stack", () => {
  it("sum of item values equals PRODUCT.stackValue", () => {
    const total = INCLUDED.reduce((sum, item) => sum + item.value, 0);
    expect(total).toBe(PRODUCT.stackValue);
  });
});
