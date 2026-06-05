import { describe, it, expect } from "vitest";
import {
  INCLUDED,
  PRICES,
  SUPPORTED_CURRENCIES,
  localizedValue,
  stackValueFor,
} from "@/lib/product";

describe("INCLUDED value stack", () => {
  it("USD stack value is 492 (the locked anchor)", () => {
    expect(stackValueFor("USD")).toBe(492);
  });

  it("stackValueFor equals the sum of localized item values, per currency", () => {
    for (const currency of SUPPORTED_CURRENCIES) {
      const sum = INCLUDED.reduce(
        (total, item) => total + localizedValue(item.value, currency),
        0
      );
      expect(stackValueFor(currency)).toBe(sum);
    }
  });
});

describe("PRICES", () => {
  it("every currency has a sane, ordered price ladder", () => {
    for (const currency of SUPPORTED_CURRENCIES) {
      const tier = PRICES[currency];
      // winback undercuts launch, which undercuts the expired price, which sits
      // well below the struck-through list anchor.
      expect(tier.winbackPrice).toBeLessThan(tier.price);
      expect(tier.price).toBeLessThan(tier.expiredPrice);
      expect(tier.expiredPrice).toBeLessThan(tier.listPrice);
      // The live price is a real discount against the localized value stack.
      expect(tier.price).toBeLessThan(stackValueFor(currency));
      expect(tier.symbol.length).toBeGreaterThan(0);
    }
  });
});
