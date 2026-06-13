# Protocol Page Tabbed Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the post-purchase protocol page (`components/guide/guide-view.tsx`) from one 20-section scroll into six work-ordered tabs, reducing first-load overwhelm while keeping every section and the download kit reachable.

**Architecture:** A persistent header (hero + download kit) sits above a base-ui `Tabs` shell with six tabs (`Deepscan · Start Here · Train · Eat · Recover · Reference`). Active tab is reflected in the URL hash and persisted to `localStorage`; a per-tab `Next` button advances the sequence. The existing section JSX is moved verbatim into six panel components; shared primitives move to a parts module. No guide content, schema, or PDF changes.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, `@base-ui/react` Tabs, Vitest (node env), Playwright e2e.

**Design spec:** `docs/superpowers/specs/2026-06-13-protocol-page-tabs-design.md`

**Conventions (non-negotiable):**
- No em-dashes in any user-facing string. Use hyphens, commas, periods.
- Monitor palette only (`monitor-*` tokens). No new color tokens, no light mode.
- All UI/visual work goes through the `design-taste-frontend-v1` skill (per user global config). This applies to the tab bar and Next button styling in Task 3.
- US-native, deadpan-clinical copy voice for any new microcopy.

**Section -> tab mapping (the source of truth for Task 3):**

| Tab id | Label | Sections (current titles, moved verbatim) |
|---|---|---|
| `deepscan` | Deepscan | The AI Deepscan (`DeepscanSection`) |
| `start` | Start Here | Where you stand · Your numbers · What these 90 days deliver · Start here: your first 7 days |
| `train` | Train | How your training works · Exercise library · Your week-by-week plan · Your 90-day arc · Your daily blueprint · The 10-minute fallback |
| `eat` | Eat | Your nutrition plan · Recipe bank |
| `recover` | Recover | Sleep and stress recovery · How to know it is working · When it gets hard · Weekly recalibration |
| `reference` | Reference | Your biggest risks, in depth · The science behind the plan · Bonus playbooks · Common questions |

The default landing tab is `deepscan`. The `reference` tab renders `guide.closing` at its end instead of a Next button.

---

## File Structure

- **Create** `lib/guide/guide-tabs.ts` - pure tab config + `resolveInitialTab` (no React).
- **Create** `lib/guide/guide-tabs.test.ts` - vitest unit tests for the above.
- **Create** `components/guide/use-guide-tab.ts` - the `"use client"` hook wrapping the pure resolver with hash + localStorage sync.
- **Create** `components/guide/guide-view-parts.tsx` - shared primitives and cards moved out of `guide-view.tsx` (no behavior change).
- **Create** `components/guide/guide-panels.tsx` - the six panel components + the persistent header + the Next-nav control.
- **Modify** `components/guide/guide-view.tsx` - becomes the `"use client"` tab shell.
- **Modify** `e2e/smoke.spec.ts` - navigate tabs before asserting now-hidden content; add tab-reachability assertions.
- **Unchanged:** `app/guide/[token]/page.tsx` (props already serializable), the guide schema, builder, and all PDFs.

---

## Task 1: Pure tab config and initial-tab resolver

**Files:**
- Create: `lib/guide/guide-tabs.ts`
- Test: `lib/guide/guide-tabs.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/guide/guide-tabs.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/guide/guide-tabs.test.ts`
Expected: FAIL (cannot find module `./guide-tabs`).

- [ ] **Step 3: Write the implementation**

Create `lib/guide/guide-tabs.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/guide/guide-tabs.test.ts`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/guide/guide-tabs.ts lib/guide/guide-tabs.test.ts
git commit -m "feat(guide): pure tab config + initial-tab resolver"
```

---

## Task 2: Extract shared primitives into a parts module (no behavior change)

This is a pure mechanical move to shrink `guide-view.tsx` before the restructure. The page must render byte-identically after this task.

**Files:**
- Create: `components/guide/guide-view-parts.tsx`
- Modify: `components/guide/guide-view.tsx`

- [ ] **Step 1: Create the parts module**

Create `components/guide/guide-view-parts.tsx`. Move these declarations **verbatim** out of `guide-view.tsx` (current line ranges in parentheses) and `export` each one:
- `SectionLabel` (17-31)
- `Section` (33-57)
- `Bullets` (59-75)
- `SubLabel` (77-83)
- `Badge` (85-91)
- `DeepDiveBlock` (97-122)
- `DownloadIcon` (126-142)
- `DownloadKit` (146-211)
- `YourNumbersSection` (215-269)
- `WeekCard` (273-343)
- `RecipeCard` (347-412)
- `ExerciseLibraryCard` (416-485)

Keep the type imports these need at the top of the new file:

```tsx
import type { DeepDive, ExerciseEntry, GuideDoc, Recipe, YourNumbers } from "@/lib/guide/schema";
```

Do NOT add a `"use client"` directive to this file (these are pure presentational components usable from server or client). Add `export` to each moved declaration.

- [ ] **Step 2: Update guide-view.tsx to import them**

In `components/guide/guide-view.tsx`, delete the moved declarations and add:

```tsx
import {
  Section,
  SubLabel,
  Badge,
  Bullets,
  DeepDiveBlock,
  DownloadKit,
  YourNumbersSection,
  WeekCard,
  RecipeCard,
  ExerciseLibraryCard,
} from "@/components/guide/guide-view-parts";
```

(Note: `SectionLabel` and `DownloadIcon` are only used internally by `Section`/`DownloadKit`, so they do not need importing into `guide-view.tsx` unless referenced directly. Verify with tsc.)

- [ ] **Step 3: Verify types and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS, no errors.

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Verify the page is unchanged via e2e**

Run: `npm run e2e`
Expected: PASS (this task makes no visual change, so the existing smoke test must still pass green).

- [ ] **Step 6: Commit**

```bash
git add components/guide/guide-view-parts.tsx components/guide/guide-view.tsx
git commit -m "refactor(guide): extract guide-view primitives into parts module"
```

---

## Task 3: Build the tab shell, the panels, and the navigation hook

This is the core task. It introduces the `useGuideTab` hook, six panel components, the persistent header, and converts `guide-view.tsx` into a `"use client"` tab shell. **Invoke the `design-taste-frontend-v1` skill** before styling the tab bar and Next button.

**Files:**
- Create: `components/guide/use-guide-tab.ts`
- Create: `components/guide/guide-panels.tsx`
- Modify: `components/guide/guide-view.tsx`

- [ ] **Step 1: Create the navigation hook**

Create `components/guide/use-guide-tab.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import {
  resolveInitialTab,
  GUIDE_TAB_IDS,
  DEFAULT_GUIDE_TAB,
  GUIDE_TAB_STORAGE_KEY,
} from "@/lib/guide/guide-tabs";

/**
 * Manages the active protocol tab.
 * - Initial render uses the default (SSR-safe, avoids hydration mismatch).
 * - After mount, resolves from URL hash > localStorage > default.
 * - Tab changes write the URL hash (replaceState) and localStorage.
 * - Browser back/forward (hashchange) moves between tabs.
 */
export function useGuideTab(): readonly [string, (id: string) => void] {
  const [active, setActiveState] = useState<string>(DEFAULT_GUIDE_TAB);

  useEffect(() => {
    const stored = window.localStorage.getItem(GUIDE_TAB_STORAGE_KEY);
    setActiveState(
      resolveInitialTab(
        { hash: window.location.hash, stored },
        GUIDE_TAB_IDS,
        DEFAULT_GUIDE_TAB,
      ),
    );
  }, []);

  useEffect(() => {
    function onHashChange() {
      const id = window.location.hash.replace(/^#/, "");
      if (GUIDE_TAB_IDS.includes(id)) setActiveState(id);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setActive = (id: string) => {
    setActiveState(id);
    try {
      window.localStorage.setItem(GUIDE_TAB_STORAGE_KEY, id);
    } catch {
      // ignore storage failures (private mode, quota)
    }
    window.history.replaceState(null, "", `#${id}`);
  };

  return [active, setActive] as const;
}
```

- [ ] **Step 2: Create the panels module**

Create `components/guide/guide-panels.tsx` with `"use client"` at the top. It exports:

1. `GuideHeader({ guide, token })` - the persistent header. Move the hero block (current `guide-view.tsx` lines 516-554: the eyebrow, `<h1>{guide.title}`, `<p>{guide.intro}`, and `<DownloadKit token={token} />`) into it.

2. Six panel components, each containing the existing `<Section ...>` JSX for its mapped sections (see the mapping table at the top of this plan), moved **verbatim** from `guide-view.tsx`:
   - `DeepscanPanel({ token, questions, initial })` - renders `<DeepscanSection token={token} questions={questions} initial={initial} />`.
   - `StartHerePanel({ guide })` - "Where you stand" (574-585), "Your numbers" (588-590), "What these 90 days deliver" (593-595), "Start here: your first 7 days" (611-632).
   - `TrainPanel({ guide })` - "How your training works" (635-702), "Exercise library" (705-715), "Your week-by-week plan" (718-724), "Your 90-day arc" (727-780), "Your daily blueprint" (916-929), "The 10-minute fallback" (943-955).
   - `EatPanel({ guide })` - "Your nutrition plan" (783-872), "Recipe bank" (875-913).
   - `RecoverPanel({ guide })` - "Sleep and stress recovery" (932-940), "How to know it is working" (958-963), "When it gets hard" (966-982), "Weekly recalibration" (1044-1046).
   - `ReferencePanel({ guide })` - "Your biggest risks, in depth" (598-608), "The science behind the plan" (997-1029), "Bonus playbooks" (1032-1041), "Common questions" (985-994).

   Each panel returns a `<div className="flex flex-col gap-16">` wrapping its sections (matching the existing 16-unit gap between sections). Keep the existing `Section` `index` props or renumber sequentially within each panel - renumbering per panel is preferred so the small mono section numbers read 01, 02... within each tab. Import the primitives from `@/components/guide/guide-view-parts` and `DeepscanSection` from `@/components/guide/deepscan-section`, plus the needed types from `@/lib/guide/schema` and `DeepscanQuestion` from `@/lib/deepscan/questions`.

3. `TabNav({ currentId, onNavigate })` - the Next control. Compute the next tab from `GUIDE_TABS`:

```tsx
import { GUIDE_TABS } from "@/lib/guide/guide-tabs";

export function TabNav({
  currentId,
  onNavigate,
}: {
  currentId: string;
  onNavigate: (id: string) => void;
}) {
  const idx = GUIDE_TABS.findIndex((t) => t.id === currentId);
  const next = GUIDE_TABS[idx + 1];
  if (!next) return null;
  return (
    <div className="flex justify-end border-t border-monitor-line pt-8">
      <button
        type="button"
        onClick={() => onNavigate(next.id)}
        className="inline-flex items-center gap-2 rounded-lg bg-monitor-accent px-6 py-3 text-sm font-semibold text-monitor-bg transition-all duration-200 hover:bg-monitor-accent/90 active:scale-[0.97]"
      >
        Next: {next.label}
        <span aria-hidden>{"->"}</span>
      </button>
    </div>
  );
}
```

Note: the `->` text is a placeholder arrow glyph; the design-taste pass in Step 4 may replace it with a proper inline SVG chevron. Do NOT use an em-dash or en-dash anywhere.

- [ ] **Step 3: Convert guide-view.tsx into the tab shell**

Rewrite `components/guide/guide-view.tsx` so it:
- starts with `"use client";`
- keeps the `<style>` keyframes block (516 area) and the outer `<main className="mx-auto flex max-w-3xl flex-col gap-16 px-5 sm:px-6 pt-20 pb-32">` wrapper (note: the inter-section gap now lives inside each panel; the main wrapper gap can stay or be reduced - keep visual rhythm sensible).
- renders `<GuideHeader guide={guide} token={token} />`.
- renders a base-ui `Tabs.Root` controlled by the hook, with a sticky `Tabs.List` of six numbered tabs and six `Tabs.Panel`s (all `keepMounted` so the Deepscan in-progress state and scroll positions survive tab switches). Each non-reference panel ends with `<TabNav>`; the reference panel ends with the closing block (current lines 1049-1052).

Skeleton (the implementer applies the design-taste pass to `Tabs.List`/`Tabs.Tab` visuals in Step 4):

```tsx
"use client";

import { Tabs } from "@base-ui/react/tabs";
import type { GuideDoc } from "@/lib/guide/schema";
import type { DeepscanQuestion } from "@/lib/deepscan/questions";
import { GUIDE_TABS } from "@/lib/guide/guide-tabs";
import { useGuideTab } from "@/components/guide/use-guide-tab";
import {
  GuideHeader,
  DeepscanPanel,
  StartHerePanel,
  TrainPanel,
  EatPanel,
  RecoverPanel,
  ReferencePanel,
  TabNav,
} from "@/components/guide/guide-panels";

export function GuideView({
  guide,
  token,
  deepscanQuestions,
}: {
  guide: GuideDoc;
  token: string;
  deepscanQuestions: DeepscanQuestion[];
}) {
  const [active, setActive] = useGuideTab();
  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes accentPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>

      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-5 sm:px-6 pt-20 pb-32">
        <GuideHeader guide={guide} token={token} />

        <Tabs.Root value={active} onValueChange={(v) => setActive(String(v))}>
          {/* design-taste-frontend-v1 styles this tab bar (sticky, numbered, mobile horizontal scroll). */}
          <Tabs.List className="sticky top-0 z-10 ...">
            {GUIDE_TABS.map((t, i) => (
              <Tabs.Tab key={t.id} value={t.id} className="...">
                <span className="font-mono ...">{String(i + 1).padStart(2, "0")}</span>
                {t.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panel value="deepscan" keepMounted className="pt-10">
            <DeepscanPanel token={token} questions={deepscanQuestions} initial={guide.deepscan ?? null} />
            <TabNav currentId="deepscan" onNavigate={setActive} />
          </Tabs.Panel>
          <Tabs.Panel value="start" keepMounted className="pt-10">
            <StartHerePanel guide={guide} />
            <TabNav currentId="start" onNavigate={setActive} />
          </Tabs.Panel>
          <Tabs.Panel value="train" keepMounted className="pt-10">
            <TrainPanel guide={guide} />
            <TabNav currentId="train" onNavigate={setActive} />
          </Tabs.Panel>
          <Tabs.Panel value="eat" keepMounted className="pt-10">
            <EatPanel guide={guide} />
            <TabNav currentId="eat" onNavigate={setActive} />
          </Tabs.Panel>
          <Tabs.Panel value="recover" keepMounted className="pt-10">
            <RecoverPanel guide={guide} />
            <TabNav currentId="recover" onNavigate={setActive} />
          </Tabs.Panel>
          <Tabs.Panel value="reference" keepMounted className="pt-10">
            <ReferencePanel guide={guide} />
            <div className="flex flex-col gap-4 border-t border-monitor-line pt-10">
              <div className="h-px w-6 bg-monitor-accent/40" />
              <p className="text-base leading-relaxed text-monitor-fg max-w-[58ch]">{guide.closing}</p>
            </div>
          </Tabs.Panel>
        </Tabs.Root>
      </main>
    </>
  );
}
```

When `Next` is clicked, scroll the user to the top of the tab list. Add a `ref` on `Tabs.List` and, in a wrapper passed to `TabNav` (or inside `setActive`), call `listRef.current?.scrollIntoView({ block: "start", behavior: prefersReducedMotion ? "auto" : "smooth" })`. Respect `window.matchMedia("(prefers-reduced-motion: reduce)")`. Keep this minimal; if it complicates the hook, do `window.scrollTo({ top: 0, behavior })` instead.

- [ ] **Step 4: Apply the design-taste pass to the tab bar**

Invoke the `design-taste-frontend-v1` skill. Style `Tabs.List` / `Tabs.Tab` / `TabNav` in the monitor palette:
- Sticky tab bar under the header with a subtle bottom border / panel background so content scrolls under it cleanly.
- Numbered tabs (`01`..`06` in mono accent) with the label; active tab uses `monitor-accent` (underline/indicator or filled), inactive uses `monitor-muted`.
- Mobile: `overflow-x-auto`, horizontal scroll-snap, active tab scrolled into view (`scrollIntoView({ inline: "center" })` on tab change via a `ref`).
- Optionally use `Tabs.Indicator` for a moving underline.
- No em-dashes. Monitor tokens only.

- [ ] **Step 5: Verify types, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS. Common issues to fix: `onValueChange` value typing (cast with `String(v)`), `GUIDE_TAB_IDS.includes(id)` (array is typed `readonly string[]`, so this is fine), unused imports after the move.

- [ ] **Step 6: Manual smoke via dev server (optional but recommended)**

Run `npm run dev`, open a generated guide, and confirm: lands on Deepscan, tabs switch, `#train` deep-links, refresh resumes last tab, Next advances and scrolls up, mobile width scrolls the tab bar.

- [ ] **Step 7: Commit**

```bash
git add components/guide/use-guide-tab.ts components/guide/guide-panels.tsx components/guide/guide-view.tsx
git commit -m "feat(guide): tabbed protocol page (deepscan/start/train/eat/recover/reference)"
```

---

## Task 4: Update the e2e smoke test for tabs

The existing test asserts content that now lives on non-default tabs (hidden until selected). Update it to navigate tabs, and add reachability assertions.

**Files:**
- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Update the "buying builds and shows the generated guide" test**

In `e2e/smoke.spec.ts`, the block currently around lines 84-101 asserts the guide heading, then `Your week-by-week plan`, `your biggest risks, in depth`, `Your numbers`, then the three download links. Replace the section-content assertions (week-by-week / risks / numbers) with tab navigation. The download-link assertions stay (the kit is in the persistent header, always visible). Use this shape:

```ts
// Guide heading + download kit (persistent header) are visible immediately.
await expect(
  page.getByRole("heading", { name: /second wind protocol/i })
).toBeVisible({ timeout: 20000 });
await expect(
  page.getByRole("link", { name: /download your workbook pdf/i })
).toBeVisible();
await expect(
  page.getByRole("link", { name: /printable tracker pack/i })
).toBeVisible();
await expect(
  page.getByRole("link", { name: /one-page quick-start/i })
).toBeVisible();

// Six tabs render; default landing is Deepscan.
await expect(page.getByRole("tab")).toHaveCount(6);

// Start Here tab -> Your numbers.
await page.getByRole("tab", { name: /start here/i }).click();
await expect(page.getByText("Your numbers", { exact: true })).toBeVisible();

// Train tab -> Your week-by-week plan.
await page.getByRole("tab", { name: /train/i }).click();
await expect(
  page.getByText("Your week-by-week plan", { exact: true })
).toBeVisible();

// Reference tab -> Your biggest risks.
await page.getByRole("tab", { name: /reference/i }).click();
await expect(page.getByText(/your biggest risks, in depth/i)).toBeVisible();
```

- [ ] **Step 2: Point the Deepscan flow at its tab**

The Deepscan flow later in the same test (currently lines 112-142) must run on the Deepscan tab. Before `await expect(page.getByText("AI Deepscan", { exact: true })).toBeVisible();`, add:

```ts
// Return to the Deepscan tab for the assessment flow.
await page.getByRole("tab", { name: /deepscan/i }).click();
```

Keep the rest of the Deepscan steps (begin, answer questions, run, assert "Deepscan complete" / "Your markers" / "Fix these first" / "Do this") unchanged.

- [ ] **Step 3: Run the e2e suite**

Run: `npm run e2e`
Expected: PASS. If a tab `name` regex is ambiguous (the numbered prefix is part of the accessible name), the `/start here/i` style regexes still match because they are substrings. If `getByRole("tab", { name: /train/i })` matches more than one element, tighten to `{ name: /^0?3.*train/i }` or use the exact label.

- [ ] **Step 4: Full verification loop**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test(e2e): navigate protocol tabs in the purchase smoke test"
```

---

## Self-Review Notes (for the executor)

- **Spec coverage:** Task 1 = state/persistence + tab config; Task 2 = file split; Task 3 = tabs, panels, header, Next nav, deep-link/resume, design pass; Task 4 = test updates + reachability guard. All six tabs, the persistent header, light progress, and keepMounted from the spec are covered.
- **No content changes:** Tasks 2-3 move JSX verbatim. If any section heading text changes, that is a bug.
- **Type consistency:** `resolveInitialTab`, `GUIDE_TABS`, `GUIDE_TAB_IDS`, `GUIDE_TAB_STORAGE_KEY`, `DEFAULT_GUIDE_TAB`, `useGuideTab`, and the panel/`TabNav` prop names are used identically across tasks.
- **Watch:** base-ui `Tabs.Panel` defaults to unmounting inactive panels; `keepMounted` is required on every panel for Deepscan state survival and stable selectors.
