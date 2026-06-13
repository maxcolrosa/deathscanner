import type { DeepDive, ExerciseEntry, GuideDoc, Recipe, YourNumbers } from "@/lib/guide/schema";

/* ─── Shared primitives ──────────────────────────────────────────────────── */

export function SectionLabel({ title, index }: { title: string; index?: number }) {
  return (
    <div className="flex items-center gap-4">
      {index !== undefined && (
        <span className="font-mono text-[10px] text-monitor-accent/40 tabular-nums select-none w-5 text-right shrink-0">
          {String(index).padStart(2, "0")}
        </span>
      )}
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-monitor-muted">
        {title}
      </span>
      <span className="h-px flex-1 bg-monitor-line" />
    </div>
  );
}

export function Section({
  title,
  index,
  children,
}: {
  title: string;
  index?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col gap-5"
      style={{
        animationName: "fadeSlideIn",
        animationDuration: "0.5s",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        animationFillMode: "both",
        animationDelay: index !== undefined ? `${index * 60}ms` : "0ms",
      }}
    >
      <SectionLabel title={title} index={index} />
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-4">
          <span
            aria-hidden
            className="mt-[3px] shrink-0 font-mono text-xs font-bold text-monitor-accent leading-none"
          >
            +
          </span>
          <span className="text-sm leading-relaxed text-monitor-fg">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-monitor-muted/70">
      {children}
    </span>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center font-mono text-[11px] text-monitor-accent bg-monitor-accent/8 border border-monitor-accent/20 rounded px-1.5 py-0.5 leading-none">
      {children}
    </span>
  );
}

/* ─── Deep-dive block ────────────────────────────────────────────────────── */
// The recurring "depth" unit: the problem, why it matters, what changes when
// fixed, then the actions. A left accent rail ties the steps together.

export function DeepDiveBlock({ dive }: { dive: DeepDive }) {
  const steps: { label: string; body: string }[] = [
    { label: "The problem", body: dive.problem },
    { label: "Why it matters", body: dive.why },
    { label: "When you fix it", body: dive.whenFixed },
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel">
      <div className="border-b border-monitor-line px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight text-monitor-fg">{dive.heading}</h3>
      </div>
      <div className="flex flex-col divide-y divide-monitor-line">
        {steps.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5 px-5 py-4">
            <SubLabel>{s.label}</SubLabel>
            <p className="text-sm leading-relaxed text-monitor-fg">{s.body}</p>
          </div>
        ))}
        <div className="flex flex-col gap-2 bg-monitor-accent/[0.04] px-5 py-4">
          <SubLabel>What to do</SubLabel>
          <Bullets items={dive.actions} />
        </div>
      </div>
    </div>
  );
}

/* ─── Download icon (shared) ─────────────────────────────────────────────── */

export function DownloadIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 1v8M4 6l3 3 3-3M1 10v1a2 2 0 002 2h8a2 2 0 002-2v-1" />
    </svg>
  );
}

/* ─── Your kit downloads block ───────────────────────────────────────────── */

export function DownloadKit({ token }: { token: string }) {
  return (
    <div className="mt-1 flex flex-col gap-3">
      {/* Primary: workbook (accent button, full-width on mobile) */}
      <a
        href={`/guide/${token}/download/workbook`}
        download
        className="inline-flex w-full sm:w-fit items-center justify-center gap-2.5 rounded-lg bg-monitor-accent px-7 py-3.5 text-sm font-semibold text-monitor-bg transition-all duration-200 hover:bg-monitor-accent/90 active:scale-[0.97]"
      >
        <DownloadIcon />
        Download your workbook PDF
      </a>
      <p className="text-xs text-monitor-muted max-w-[46ch]">
        The full personalized workbook - your 90-day program, training, nutrition, your numbers dashboard, and four bonus playbooks.
      </p>

      {/* Secondary downloads: recipe book, exercise library, tracker pack, quick-start */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <a
          href={`/guide/${token}/download/recipes`}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-monitor-line bg-monitor-panel px-5 py-2.5 text-xs font-medium text-monitor-fg transition-colors duration-200 hover:border-monitor-accent/40 hover:text-monitor-accent"
        >
          <DownloadIcon />
          <span>
            <span className="block font-semibold">Recipe book PDF</span>
            <span className="block text-monitor-muted font-normal mt-0.5">All recipes with macros, steps, and shopping list</span>
          </span>
        </a>
        <a
          href={`/guide/${token}/download/exercises`}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-monitor-line bg-monitor-panel px-5 py-2.5 text-xs font-medium text-monitor-fg transition-colors duration-200 hover:border-monitor-accent/40 hover:text-monitor-accent"
        >
          <DownloadIcon />
          <span>
            <span className="block font-semibold">Exercise library PDF</span>
            <span className="block text-monitor-muted font-normal mt-0.5">Setup, cues, regressions, and progressions</span>
          </span>
        </a>
        <a
          href={`/guide/${token}/download/trackers`}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-monitor-line bg-monitor-panel px-5 py-2.5 text-xs font-medium text-monitor-fg transition-colors duration-200 hover:border-monitor-accent/40 hover:text-monitor-accent"
        >
          <DownloadIcon />
          <span>
            <span className="block font-semibold">Printable tracker pack</span>
            <span className="block text-monitor-muted font-normal mt-0.5">Workout log, habit grid, and shopping list</span>
          </span>
        </a>
        <a
          href={`/guide/${token}/download/quickstart`}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-monitor-line bg-monitor-panel px-5 py-2.5 text-xs font-medium text-monitor-fg transition-colors duration-200 hover:border-monitor-accent/40 hover:text-monitor-accent"
        >
          <DownloadIcon />
          <span>
            <span className="block font-semibold">One-page quick-start</span>
            <span className="block text-monitor-muted font-normal mt-0.5">Your first 7 days on one page</span>
          </span>
        </a>
      </div>
    </div>
  );
}

/* ─── Your numbers section ───────────────────────────────────────────────── */

export function YourNumbersSection({ yourNumbers }: { yourNumbers: YourNumbers }) {
  const { reclaimedYearsHeadline, summary, metrics, milestones } = yourNumbers;
  return (
    <div className="flex flex-col gap-5">
      {/* Headline + summary */}
      <div className="flex flex-col gap-2 rounded-xl border border-monitor-accent/30 bg-monitor-accent/[0.06] p-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-monitor-accent">
          Your estimated starting point
        </span>
        <p className="text-xl font-semibold tracking-tight text-monitor-fg leading-snug">
          {reclaimedYearsHeadline}
        </p>
        <p className="text-sm leading-relaxed text-monitor-muted mt-1">{summary}</p>
      </div>

      {/* Metrics table */}
      <div className="rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-monitor-line">
          <SubLabel>Estimated bands and targets</SubLabel>
        </div>
        <ul className="flex flex-col divide-y divide-monitor-line">
          {metrics.map((m) => (
            <li key={m.label} className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr] gap-0">
              <div className="px-5 py-3.5 flex flex-col gap-0.5">
                <span className="text-sm font-medium text-monitor-fg">{m.label}</span>
                <span className="text-xs text-monitor-muted">{m.how}</span>
              </div>
              <div className="px-5 py-3.5 sm:border-l border-t sm:border-t-0 border-monitor-line flex flex-col gap-0.5">
                <SubLabel>Starting band</SubLabel>
                <span className="text-sm text-monitor-fg mt-0.5">{m.startingBand}</span>
              </div>
              <div className="px-5 py-3.5 sm:border-l border-t sm:border-t-0 border-monitor-line flex flex-col gap-0.5">
                <SubLabel>90-day target</SubLabel>
                <span className="text-sm text-monitor-accent mt-0.5">{m.target}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Milestones */}
      <div className="flex flex-col gap-2">
        <SubLabel>What to expect, week by week</SubLabel>
        <div className="flex flex-col gap-0 divide-y divide-monitor-line rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden mt-1">
          {milestones.map((ms) => (
            <div key={ms.week} className="flex items-start gap-4 px-5 py-3.5">
              <Badge>{ms.week}</Badge>
              <p className="text-sm leading-relaxed text-monitor-fg">{ms.marker}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Week card ──────────────────────────────────────────────────────────── */

export function WeekCard({ w, delay }: { w: GuideDoc["weeks"][number]; delay: number }) {
  return (
    <div
      className="group overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel transition-colors duration-300 hover:border-monitor-accent/20"
      style={{
        animationName: "fadeSlideIn",
        animationDuration: "0.5s",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        animationFillMode: "both",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Card header bar */}
      <div className="flex items-stretch">
        {/* Accent stripe, brightens on hover */}
        <div className="w-[3px] shrink-0 bg-monitor-accent/20 transition-colors duration-300 group-hover:bg-monitor-accent/50" />
        <div className="flex flex-1 items-baseline gap-4 px-5 py-4 border-b border-monitor-line">
          <span className="font-mono text-3xl font-light tracking-tighter text-monitor-accent leading-none tabular-nums">
            {String(w.week).padStart(2, "0")}
          </span>
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-monitor-fg leading-snug">{w.focus}</span>
            <span className="text-xs leading-relaxed text-monitor-muted line-clamp-1">{w.theme}</span>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-[3px] shrink-0 bg-monitor-accent/20 transition-colors duration-300 group-hover:bg-monitor-accent/50" />
        <div className="flex flex-1 flex-col gap-0 divide-y divide-monitor-line px-0">

          {/* Training note - sessions are defined once above; no reprinting exercises here */}
          <div className="flex items-start gap-3 px-5 py-3.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-monitor-accent/60 mt-px shrink-0 w-8">
              Trn
            </span>
            <p className="text-xs leading-relaxed text-monitor-muted">
              Run your training sessions this week, adding a little where last week felt easy.
            </p>
          </div>

          {/* Nutrition + Habit footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-monitor-line">
            <div className="flex flex-col gap-1 px-5 py-4">
              <SubLabel>Nutrition focus</SubLabel>
              <p className="mt-1 text-sm leading-relaxed text-monitor-fg">{w.nutritionFocus}</p>
            </div>
            <div className="flex flex-col gap-1 px-5 py-4">
              <SubLabel>Habit stack</SubLabel>
              <p className="mt-1 text-sm leading-relaxed text-monitor-fg">
                {w.habit.name}
              </p>
              <p className="text-xs text-monitor-muted">
                Trigger: {w.habit.trigger}. {w.habit.why}
              </p>
            </div>
          </div>

          {/* Checkpoint */}
          <div className="flex items-start gap-3 px-5 py-3 bg-monitor-accent/[0.04]">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-monitor-accent/60 mt-px shrink-0">
              Check
            </span>
            <p className="text-xs leading-relaxed text-monitor-muted italic">{w.checkpoint}</p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Recipe card ────────────────────────────────────────────────────────── */

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const mealLabel = recipe.meal.charAt(0).toUpperCase() + recipe.meal.slice(1);
  return (
    <div className="overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-monitor-line px-5 py-4">
        <h3 className="text-sm font-semibold text-monitor-fg flex-1 min-w-0">{recipe.name}</h3>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <Badge>{mealLabel}</Badge>
          <Badge>{recipe.timeMins} min</Badge>
          <Badge>~{recipe.calories} kcal est.</Badge>
          <Badge>~{recipe.proteinG}g protein est.</Badge>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-monitor-line">
        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 py-3">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-monitor-muted/60 bg-monitor-line/40 rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients + Steps side by side on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] divide-y sm:divide-y-0 sm:divide-x divide-monitor-line">
          <div className="px-5 py-4 flex flex-col gap-2">
            <SubLabel>Ingredients (serves {recipe.servings})</SubLabel>
            <ul className="mt-1 flex flex-col gap-1.5">
              {recipe.ingredients.map((ing) => (
                <li key={ing} className="flex items-start gap-2 text-xs leading-relaxed text-monitor-fg">
                  <span aria-hidden className="text-monitor-accent/50 mt-px">-</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-4 flex flex-col gap-2">
            <SubLabel>Steps</SubLabel>
            <ol className="mt-1 flex flex-col gap-2">
              {recipe.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-2.5 text-xs leading-relaxed text-monitor-fg">
                  <span className="font-mono text-monitor-accent/60 shrink-0 tabular-nums w-4">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Optional note */}
        {recipe.note && (
          <div className="px-5 py-3 bg-monitor-accent/[0.03]">
            <p className="text-xs leading-relaxed text-monitor-muted italic">{recipe.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Exercise library card ──────────────────────────────────────────────── */

export function ExerciseLibraryCard({ entry }: { entry: ExerciseEntry }) {
  return (
    <div className="overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel">
      {/* Header: name + pattern + targets */}
      <div className="flex flex-wrap items-center gap-3 border-b border-monitor-line px-5 py-4">
        <h3 className="text-sm font-semibold text-monitor-fg flex-1 min-w-0">{entry.name}</h3>
        <div className="flex gap-1.5 shrink-0">
          <Badge>{entry.pattern}</Badge>
        </div>
      </div>

      <div className="px-5 py-2.5 border-b border-monitor-line">
        <span className="text-xs text-monitor-muted">Targets: {entry.targets}</span>
      </div>

      {/* Setup / Execution / Mistakes in 3-col grid on wide, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-monitor-line">
        <div className="px-4 py-4 flex flex-col gap-2">
          <SubLabel>Setup</SubLabel>
          <ul className="mt-1 flex flex-col gap-1.5">
            {entry.setup.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs leading-relaxed text-monitor-fg">
                <span aria-hidden className="text-monitor-accent/50 mt-px shrink-0">-</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 py-4 flex flex-col gap-2">
          <SubLabel>Execution</SubLabel>
          <ol className="mt-1 flex flex-col gap-1.5">
            {entry.execution.map((e, i) => (
              <li key={e} className="flex items-start gap-2 text-xs leading-relaxed text-monitor-fg">
                <span className="font-mono text-monitor-accent/60 shrink-0 tabular-nums w-4">{i + 1}.</span>
                {e}
              </li>
            ))}
          </ol>
        </div>
        <div className="px-4 py-4 flex flex-col gap-2">
          <SubLabel>Common mistakes</SubLabel>
          <ul className="mt-1 flex flex-col gap-1.5">
            {entry.mistakes.map((m) => (
              <li key={m} className="flex items-start gap-2 text-xs leading-relaxed text-monitor-alert/80">
                <span aria-hidden className="text-monitor-alert/60 mt-px shrink-0">!</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Easier / Harder / How to learn */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-monitor-line divide-y sm:divide-y-0 sm:divide-x divide-monitor-line bg-monitor-accent/[0.03]">
        <div className="px-4 py-3 flex flex-col gap-1">
          <SubLabel>Easier option</SubLabel>
          <p className="text-xs leading-relaxed text-monitor-fg mt-0.5">{entry.easier}</p>
        </div>
        <div className="px-4 py-3 flex flex-col gap-1">
          <SubLabel>Harder progression</SubLabel>
          <p className="text-xs leading-relaxed text-monitor-fg mt-0.5">{entry.harder}</p>
        </div>
        <div className="px-4 py-3 flex flex-col gap-1">
          <SubLabel>How to learn it</SubLabel>
          <p className="text-xs leading-relaxed text-monitor-muted mt-0.5">{entry.learn}</p>
        </div>
      </div>
    </div>
  );
}
