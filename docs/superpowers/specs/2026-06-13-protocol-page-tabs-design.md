# Protocol page: tabbed restructure

**Date:** 2026-06-13
**Status:** Design, pending implementation
**Surface:** `components/guide/guide-view.tsx` (the post-purchase `/guide/[token]` protocol page)

## Problem

The protocol page renders as one continuous scroll of 20 numbered sections plus
the hero, the AI Deepscan, and a closing. It reads like a reference document
dumped on screen, not something designed to be worked through. A buyer landing
on it sees a wall of content, which risks first-load overwhelm (and the
remorse/refund that follows) and makes it hard to either work the program in
order or return later to look one thing up.

## Goal and priorities

Restructure the page so it is digestible and navigable. Priorities, in order:

1. **Reduce first-load overwhelm** (primary). The arrival experience must feel
   manageable, not like homework.
2. **Help buyers work the program** in sequence over 90 days.
3. **Fast reference lookup** for repeat visits.

A key enabling fact: the downloadable workbook PDF is already the complete,
read-it-all-in-order artifact. That frees the web page to be the *interactive
working surface* rather than the canonical document, so homing content under
navigation (where some content is not visible until clicked) is safe here.

## Chosen approach: grouped tabs

Collapse the sections into **six work-ordered tabs**. Land on tab 01 by default;
the tab order doubles as the program sequence; the tab bar is the lookup nav.

### Tab bar

```
01 Deepscan · 02 Start Here · 03 Train · 04 Eat · 05 Recover · 06 Reference
```

- Tabs are numbered so the sequence reads as a path.
- Desktop: full horizontal bar, sticky beneath the persistent header.
- Mobile: horizontally scrollable, snap-to, with the active tab auto-scrolled
  into view (`scrollIntoView({ inline: "center" })`).
- Styled in the existing monitor palette only. No new tokens.

### Section mapping

No section is cut. All 20 sections still render, each homed under one tab. The
complete linear read continues to live in the workbook PDF.

| Tab | Sections (current section titles) |
|---|---|
| **01 Deepscan** | The AI Deepscan (`DeepscanSection`: intake -> analyzing -> report) |
| **02 Start Here** | Where you stand · Your numbers · What these 90 days deliver · Start here: your first 7 days |
| **03 Train** | How your training works · Exercise library · Your week-by-week plan · Your 90-day arc · Your daily blueprint · The 10-minute fallback |
| **04 Eat** | Your nutrition plan · Recipe bank |
| **05 Recover** | Sleep and stress recovery · How to know it is working · When it gets hard · Weekly recalibration |
| **06 Reference** | Your biggest risks, in depth · The science behind the plan · Bonus playbooks · Common questions |

### Persistent header (outside the tab system)

The hero (title + intro) and the **download kit** render above the tab bar and
stay visible regardless of active tab, because the downloads must be reachable
from anywhere and "here is your protocol plus your files" is itself a calming
first impression.

### Per-tab footer nudge (the "work-it" spine)

Each tab panel ends with a single `Next: <next tab> →` button that advances the
active tab and scrolls back to the tab bar. This turns six tabs into something
worked through in order. The final tab (06 Reference) closes with the existing
`guide.closing` instead of a Next button.

### Progress signaling

Light only: the numbered tabs and the per-tab `Next →` button are the only
sequence cues. No stepper, no progress bar, no visited-tab ticks.

### State, deep-linking, persistence

- Active tab is reflected in the **URL hash** (e.g. `#train`) via
  `history.replaceState`, so a buyer can bookmark or deep-link a section
  (lookup) and the Next button is shareable.
- Listen for `hashchange` so browser back/forward moves between tabs.
- The last-viewed tab is stored in `localStorage` (suggested key
  `sw_guide_tab`) so a returning buyer resumes where they left off (work-it).
- **Resolution order on mount:** valid URL hash > stored tab > default
  (`deepscan`).

## Architecture and implementation

- **`guide-view.tsx` becomes a client component** (`"use client"`). All of its
  inputs (`guide: GuideDoc`, `token: string`, `deepscanQuestions[]`) are already
  serializable, and `DeepscanSection` is already a client island, so this is
  safe. The server page that renders it is unchanged.
- **Tabs use base-ui `Tabs`** (the shadcn-on-base-ui stack already in the repo),
  controlled via a `value`/`onValueChange` pair wired to the hash/localStorage
  logic above, for built-in keyboard a11y (arrow-key roving focus, correct
  `role`/`aria-controls`). Style to the monitor palette.
- **All panels stay mounted** (`keepMounted`-style: inactive panels rendered but
  hidden via the tabs primitive). Rationale: this page is gated and post-purchase
  so DOM size and SEO are irrelevant; keeping panels mounted keeps the existing
  e2e selectors valid and avoids re-mount cost. Overwhelm is a *visual* concern,
  addressed by showing one panel at a time, not by trimming the DOM.
- **File split.** `guide-view.tsx` is already ~1000 lines and is about to gain a
  tab shell; this is the moment to break it up. Proposed:
  - the client tab shell (header + tab bar + panel switching + Next nudge + hash/
    localStorage logic) lives in `guide-view.tsx`;
  - the six panel bodies become six small components (one per tab), and the
    shared primitives (`SectionLabel`, `Section`, `Bullets`, `SubLabel`, `Badge`,
    `DeepDiveBlock`, `DownloadKit`, `YourNumbersSection`, `WeekCard`,
    `RecipeCard`, `ExerciseLibraryCard`, `DownloadIcon`) move to a sibling
    `guide-view-parts.tsx` (or similar) imported by the panels.
  - Exact boundaries are a plan-level detail; the goal is focused files, not one
    1300-line module.
- **UI implementation must go through the `design-taste-frontend-v1` skill** (per
  the user's global config: all UI work, no exceptions).

## Constraints to honor

- **No em-dashes** in any user-facing string (tab labels, Next button, etc.).
  Use hyphens, commas, periods.
- **Monitor palette only.** No new color tokens, no light mode. The two
  per-gender trace tints remain reserved for their existing result-page uses; do
  not introduce them here.
- **US-native, imperial, deadpan-clinical** copy voice for any new microcopy.
- Existing `fadeSlideIn`/`accentPulse` animations and reduced-motion behavior are
  preserved; per-panel entrance animation may re-run on tab switch but must stay
  subtle and respect reduced motion.

## Edge cases

- **Deepscan not yet completed:** tab 01 shows the intake form; once completed it
  shows the stored report. This is existing `DeepscanSection` behavior, unchanged.
- **Default landing:** first visit lands on `01 Deepscan` to prompt the
  highest-value action while it is fresh; subsequent visits resume the stored tab.
- **Unknown/stale hash:** falls back to stored tab, then to `deepscan`.
- **"Building" state:** unchanged. `guide-view` only renders once the order is
  ready; the polling/building screen is upstream and untouched.

## Testing

- **e2e (`npm run e2e`):** update the purchase smoke test to click through the
  tabs and assert one representative heading per tab is reachable (panels are
  kept mounted, so content remains in the DOM, but the test should still exercise
  the tab interaction). Confirm the Deepscan flow still runs on tab 01.
- **Regression guard:** add a lightweight assertion that every section heading is
  present across the six panels, so a future edit cannot silently drop a section
  when re-homing content. (Can live in the e2e flow or a small render test.)
- Run the standard loop after implementation:
  `npm test && npx tsc --noEmit && npm run lint && npm run build`, then
  `npm run e2e`.

## Out of scope

- No changes to guide *content* or to `lib/guide/build-guide.ts` / the schema.
  This is purely a presentation/navigation restructure.
- No changes to the PDFs (they remain the complete linear artifact).
- No accordion-within-tabs, no stepper/progress bar (explicitly deferred).
