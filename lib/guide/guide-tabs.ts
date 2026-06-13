// Pure tab configuration and initial-tab resolution for the protocol page.
// No React here so it is unit-testable in the node vitest environment.

export const GUIDE_TABS = [
  { id: "deepscan", label: "Deepscan" },
  { id: "start", label: "Start Here" },
  { id: "train", label: "Train" },
  { id: "eat", label: "Eat" },
  { id: "recover", label: "Recover" },
  { id: "reference", label: "Reference" },
] as const;

export type GuideTabId = (typeof GUIDE_TABS)[number]["id"];

export const GUIDE_TAB_IDS: readonly string[] = GUIDE_TABS.map((t) => t.id);
export const DEFAULT_GUIDE_TAB: GuideTabId = "deepscan";
export const GUIDE_TAB_STORAGE_KEY = "sw_guide_tab";

/**
 * Resolve which tab to show on mount.
 * Order: a valid URL hash, then a valid stored value, then the fallback.
 */
export function resolveInitialTab(
  source: { hash?: string | null; stored?: string | null },
  validIds: readonly string[],
  fallback: string,
): string {
  const fromHash = source.hash?.replace(/^#/, "");
  if (fromHash && validIds.includes(fromHash)) return fromHash;
  if (source.stored && validIds.includes(source.stored)) return source.stored;
  return fallback;
}
