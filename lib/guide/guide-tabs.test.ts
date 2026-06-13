import { describe, expect, it } from "vitest";
import {
  GUIDE_TABS,
  GUIDE_TAB_IDS,
  DEFAULT_GUIDE_TAB,
  resolveInitialTab,
} from "./guide-tabs";

describe("guide tabs config", () => {
  it("defines six tabs in work order starting with deepscan", () => {
    expect(GUIDE_TABS.map((t) => t.id)).toEqual([
      "deepscan",
      "start",
      "train",
      "eat",
      "recover",
      "reference",
    ]);
    expect(DEFAULT_GUIDE_TAB).toBe("deepscan");
  });

  it("has no em-dashes in any label", () => {
    for (const t of GUIDE_TABS) {
      expect(t.label).not.toMatch(/[–—]/);
    }
  });
});

describe("resolveInitialTab", () => {
  it("prefers a valid URL hash over stored value", () => {
    expect(
      resolveInitialTab({ hash: "#train", stored: "eat" }, GUIDE_TAB_IDS, DEFAULT_GUIDE_TAB),
    ).toBe("train");
  });

  it("strips the leading # from the hash", () => {
    expect(
      resolveInitialTab({ hash: "#recover", stored: null }, GUIDE_TAB_IDS, DEFAULT_GUIDE_TAB),
    ).toBe("recover");
  });

  it("falls back to stored value when the hash is invalid", () => {
    expect(
      resolveInitialTab({ hash: "#bogus", stored: "eat" }, GUIDE_TAB_IDS, DEFAULT_GUIDE_TAB),
    ).toBe("eat");
  });

  it("falls back to the default when both hash and stored are invalid", () => {
    expect(
      resolveInitialTab({ hash: "", stored: "nope" }, GUIDE_TAB_IDS, DEFAULT_GUIDE_TAB),
    ).toBe("deepscan");
  });

  it("falls back to the default when nothing is provided", () => {
    expect(
      resolveInitialTab({ hash: null, stored: null }, GUIDE_TAB_IDS, DEFAULT_GUIDE_TAB),
    ).toBe("deepscan");
  });
});
