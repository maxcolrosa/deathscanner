import type {
  DeepDive,
  ExerciseEntry,
  GuideDoc,
  Recipe,
  YourNumbers,
} from "@/lib/guide/schema";

/* ─── Design constants ───────────────────────────────────────────────────── */
// DESIGN_VARIANCE: 8 | MOTION_INTENSITY: 6 (CSS cubic-bezier cascades)
// VISUAL_DENSITY: 4 | Monitor palette only. No new themes, no light mode.

/* ─── Shared primitives ──────────────────────────────────────────────────── */

function SectionLabel({ title, index }: { title: string; index?: number }) {
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

function Section({
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

function Bullets({ items }: { items: string[] }) {
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

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-monitor-muted/70">
      {children}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center font-mono text-[11px] text-monitor-accent bg-monitor-accent/8 border border-monitor-accent/20 rounded px-1.5 py-0.5 leading-none">
      {children}
    </span>
  );
}

/* ─── Deep-dive block ────────────────────────────────────────────────────── */
// The recurring "depth" unit: the problem, why it matters, what changes when
// fixed, then the actions. A left accent rail ties the steps together.

function DeepDiveBlock({ dive }: { dive: DeepDive }) {
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

function DownloadIcon() {
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

function DownloadKit({ token }: { token: string }) {
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

function YourNumbersSection({ yourNumbers }: { yourNumbers: YourNumbers }) {
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

function WeekCard({ w, delay }: { w: GuideDoc["weeks"][number]; delay: number }) {
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

function RecipeCard({ recipe }: { recipe: Recipe }) {
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

function ExerciseLibraryCard({ entry }: { entry: ExerciseEntry }) {
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

/* ─── Main component ─────────────────────────────────────────────────────── */

export function GuideView({ guide, token }: { guide: GuideDoc; token: string }) {
  const n = guide.nutritionPlan;
  return (
    <>
      {/* Keyframe injection: fixed pseudo-element, never repaints on scroll */}
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

      <main className="mx-auto flex max-w-3xl flex-col gap-16 px-5 sm:px-6 pt-20 pb-32">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-5"
          style={{
            animationName: "fadeSlideIn",
            animationDuration: "0.6s",
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            animationFillMode: "both",
          }}
        >
          {/* Eyebrow label */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span
                className="block h-1.5 w-1.5 rounded-full bg-monitor-accent shrink-0"
                style={{
                  animationName: "accentPulse",
                  animationDuration: "2.4s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-monitor-accent">
                Your protocol is ready
              </span>
            </div>
            <div className="h-px w-12 bg-monitor-accent/50" />
          </div>

          <h1 className="text-[2.15rem] sm:text-[2.6rem] font-semibold tracking-tight leading-[1.08] text-monitor-fg max-w-[22ch]">
            {guide.title}
          </h1>

          <p className="max-w-[58ch] text-base sm:text-lg leading-relaxed text-monitor-muted">
            {guide.intro}
          </p>

          {/* Kit downloads block */}
          <DownloadKit token={token} />
        </div>

        {/* ── Where you stand ───────────────────────────────────────────── */}
        <Section title="Where you stand" index={1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-xl border border-monitor-line bg-monitor-panel p-5">
              <SubLabel>Situation</SubLabel>
              <p className="mt-1 text-sm leading-relaxed text-monitor-fg">{guide.yourSituation}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-monitor-line bg-monitor-panel p-5">
              <SubLabel>Strategy</SubLabel>
              <p className="mt-1 text-sm leading-relaxed text-monitor-muted">{guide.strategy}</p>
            </div>
          </div>
        </Section>

        {/* ── Your numbers ──────────────────────────────────────────────── */}
        <Section title="Your numbers" index={2}>
          <YourNumbersSection yourNumbers={guide.yourNumbers} />
        </Section>

        {/* ── Outcomes ──────────────────────────────────────────────────── */}
        <Section title="What these 90 days deliver" index={3}>
          <Bullets items={guide.outcomes} />
        </Section>

        {/* ── Risk briefings (deep dives) ───────────────────────────────── */}
        <Section title="Your biggest risks, in depth" index={4}>
          <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
            For each of your largest modifiable risks: what is happening, why it
            costs you, what improves when you fix it, and exactly what to do.
          </p>
          <div className="flex flex-col gap-4">
            {guide.riskBriefings.map((d) => (
              <DeepDiveBlock key={d.heading} dive={d} />
            ))}
          </div>
        </Section>

        {/* ── First 7 days ──────────────────────────────────────────────── */}
        <Section title="Start here: your first 7 days" index={5}>
          <ol className="flex flex-col gap-0 divide-y divide-monitor-line border border-monitor-line rounded-xl overflow-hidden">
            {guide.next7Days.map((d, i) => (
              <li
                key={d.day}
                className="flex items-start gap-4 px-5 py-3.5 bg-monitor-panel transition-colors duration-200 hover:bg-monitor-accent/[0.03]"
                style={{
                  animationName: "fadeSlideIn",
                  animationDuration: "0.4s",
                  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  animationFillMode: "both",
                  animationDelay: `${i * 40 + 200}ms`,
                }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-monitor-accent w-8 shrink-0 mt-[3px]">
                  {d.day.slice(0, 3)}
                </span>
                <span className="text-sm leading-relaxed text-monitor-fg">{d.action}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── How your training works ───────────────────────────────────── */}
        <Section title="How your training works" index={6}>
          <DeepDiveBlock dive={guide.training.approach} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-xl border border-monitor-line bg-monitor-panel p-5">
              <SubLabel>Warm up first, every session</SubLabel>
              <ul className="mt-1 flex flex-col divide-y divide-monitor-line">
                {guide.training.warmup.map((m) => (
                  <li key={m.name} className="flex items-baseline justify-between gap-4 py-2">
                    <span className="text-sm text-monitor-fg">{m.name}</span>
                    <span className="font-mono text-[11px] text-monitor-muted shrink-0">{m.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-monitor-line bg-monitor-panel p-5">
              <SubLabel>How to progress</SubLabel>
              <div className="mt-1">
                <Bullets items={guide.training.progressionRules} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 rounded-xl border border-monitor-line bg-monitor-accent/[0.04] p-5">
            <SubLabel>The deload week</SubLabel>
            <p className="text-sm leading-relaxed text-monitor-fg">{guide.training.deload}</p>
          </div>

          {/* Sessions - shown once for the weekly plan. Run them every week across
              the 90-day program, adding a little load or one more rep as you go.
              The movements stay the same; the numbers climb. */}
          <div className="flex flex-col gap-2">
            <SubLabel>Your weekly training sessions</SubLabel>
            <p className="text-sm leading-relaxed text-monitor-muted">
              These are your sessions to run each week across the 90-day program. Add a little load or one more rep as you go. The movements stay the same; the numbers climb.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {guide.training.workouts.map((wo) => (
              <div key={wo.day} className="overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-monitor-line">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-monitor-accent/60 shrink-0 w-8">
                    {wo.day.slice(0, 3)}
                  </span>
                  <span className="text-sm font-semibold text-monitor-fg">{wo.title}</span>
                </div>
                <div className="flex flex-col gap-2 px-5 py-4">
                  {wo.exercises.map((ex) => (
                    <div
                      key={ex.name}
                      className="grid gap-x-3 gap-y-0.5"
                      style={{ gridTemplateColumns: "1fr auto auto" }}
                    >
                      <span className="text-sm text-monitor-fg col-span-1">{ex.name}</span>
                      <div className="flex items-center gap-1.5 row-start-1 col-start-2">
                        <Badge>{ex.sets} x {ex.reps}</Badge>
                        <span className="font-mono text-[10px] text-monitor-muted whitespace-nowrap">
                          {ex.rest}
                        </span>
                      </div>
                      <span className="text-xs leading-relaxed text-monitor-muted/70 col-span-2 col-start-1">
                        {ex.cues}. Progress: {ex.progression}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Exercise library ──────────────────────────────────────────── */}
        <Section title="Exercise library" index={7}>
          <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
            Detailed setup and execution cues for every movement in your plan. No guesswork on form.
            The printable exercise library PDF in your download kit has everything in one place.
          </p>
          <div className="flex flex-col gap-4">
            {guide.exerciseLibrary.map((entry) => (
              <ExerciseLibraryCard key={entry.name} entry={entry} />
            ))}
          </div>
        </Section>

        {/* ── Week-by-week plan ─────────────────────────────────────────── */}
        <Section title="Your week-by-week plan" index={8}>
          <div className="flex flex-col gap-4">
            {guide.weeks.map((w, i) => (
              <WeekCard key={w.week} w={w} delay={i * 50 + 100} />
            ))}
          </div>
        </Section>

        {/* ── Your 90-day arc ───────────────────────────────────────────── */}
        <Section title="Your 90-day arc" index={9}>
          {/* Summary */}
          <div className="flex flex-col gap-2 rounded-xl border border-monitor-accent/30 bg-monitor-accent/[0.06] p-5">
            <SubLabel>The journey</SubLabel>
            <p className="mt-1 text-sm leading-relaxed text-monitor-fg">{guide.programArc.summary}</p>
          </div>

          {/* Phases timeline */}
          <div className="flex flex-col gap-2">
            <SubLabel>Phase breakdown</SubLabel>
            <div className="flex flex-col divide-y divide-monitor-line rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden mt-1">
              {guide.programArc.phases.map((phase) => (
                <div key={phase.name} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1.5fr] gap-0">
                  <div className="px-5 py-4 sm:border-r border-b sm:border-b-0 border-monitor-line flex flex-col gap-1 sm:w-36">
                    <span className="text-sm font-semibold text-monitor-fg">{phase.name}</span>
                    <Badge>{phase.weeks}</Badge>
                  </div>
                  <div className="px-5 py-4 sm:border-r border-b sm:border-b-0 border-monitor-line flex flex-col gap-1">
                    <SubLabel>Focus</SubLabel>
                    <p className="text-sm leading-relaxed text-monitor-fg mt-0.5">{phase.focus}</p>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-1">
                    <SubLabel>What changes</SubLabel>
                    <p className="text-sm leading-relaxed text-monitor-muted mt-0.5">{phase.whatChanges}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly reviews */}
          <div className="flex flex-col gap-2">
            <SubLabel>Monthly progress reviews</SubLabel>
            <div className="flex flex-col gap-3 mt-1">
              {guide.programArc.monthlyReviews.map((review) => (
                <div key={review.month} className="overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel">
                  <div className="border-b border-monitor-line px-5 py-3.5">
                    <span className="text-sm font-semibold text-monitor-fg">{review.month}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-monitor-line">
                    <div className="px-5 py-4 flex flex-col gap-2">
                      <SubLabel>Checkpoints</SubLabel>
                      <Bullets items={review.checkpoints} />
                    </div>
                    <div className="px-5 py-4 flex flex-col gap-2">
                      <SubLabel>Adjust rules</SubLabel>
                      <Bullets items={review.adjustRules} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Nutrition plan ────────────────────────────────────────────── */}
        <Section title="Your nutrition plan" index={10}>
          <DeepDiveBlock dive={n.philosophy} />

          {/* Plate formula: visually distinct callout block */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-monitor-accent/30 bg-monitor-accent/[0.06] p-5">
            <SubLabel>Build every plate like this</SubLabel>
            <p className="mt-1 text-sm leading-relaxed text-monitor-fg">{n.plateFormula}</p>
          </div>

          {/* Goal-specific calibration cues */}
          <div className="flex flex-col gap-2">
            <SubLabel>Calibrated to your goal</SubLabel>
            <div className="mt-1">
              <Bullets items={n.calibration} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 rounded-xl border border-monitor-line bg-monitor-panel p-5">
              <SubLabel>Your protein target</SubLabel>
              <p className="text-sm leading-relaxed text-monitor-fg">{n.proteinTarget}</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-monitor-line bg-monitor-panel p-5">
              <SubLabel>Hydration</SubLabel>
              <p className="text-sm leading-relaxed text-monitor-fg">{n.hydration}</p>
            </div>
          </div>

          <Bullets items={n.principles} />

          {/* Sample days */}
          <div className="flex flex-col gap-4">
            {n.sampleDays.map((day) => (
              <div key={day.label} className="rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
                <div className="px-5 pt-4 pb-3 border-b border-monitor-line">
                  <SubLabel>{day.label}</SubLabel>
                </div>
                <dl className="flex flex-col divide-y divide-monitor-line">
                  {(
                    [
                      ["Breakfast", day.breakfast],
                      ["Lunch", day.lunch],
                      ["Dinner", day.dinner],
                      ["Snacks", day.snacks],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="flex gap-4 px-5 py-3.5">
                      <dt className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-monitor-accent mt-[2px]">
                        {k}
                      </dt>
                      <dd className="text-sm leading-relaxed text-monitor-fg">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {/* Swaps */}
          <div className="flex flex-col gap-2">
            <SubLabel>Swaps</SubLabel>
            <div className="flex flex-col gap-1 mt-1">
              {n.swaps.map((s) => (
                <div key={s.from} className="flex items-center gap-3 text-sm">
                  <span className="text-monitor-muted line-through">{s.from}</span>
                  <span aria-hidden className="font-mono text-[10px] text-monitor-accent/60">
                    {">"}
                  </span>
                  <span className="text-monitor-fg">{s.to}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eating out */}
          <div className="flex flex-col gap-2">
            <SubLabel>Eating out without losing the week</SubLabel>
            <div className="mt-1">
              <Bullets items={n.eatingOut} />
            </div>
          </div>

          {/* Staples */}
          <div className="flex flex-col gap-2">
            <SubLabel>Grocery staples</SubLabel>
            <p className="text-sm leading-relaxed text-monitor-fg mt-1">
              {n.groceryStaples.join(", ")}
            </p>
          </div>
        </Section>

        {/* ── Recipe bank ───────────────────────────────────────────────── */}
        <Section title="Recipe bank" index={11}>
          <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
            Real recipes built around your goal and dietary preferences. Calorie and protein figures are
            per-serving estimates, not measured values. The recipe book PDF in your download kit
            includes all recipes with the shopping list in one printable document.
          </p>

          {/* Recipes grouped by meal type */}
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => {
            const recipes = guide.recipeBank.recipes.filter((r) => r.meal === meal);
            if (recipes.length === 0) return null;
            const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);
            return (
              <div key={meal} className="flex flex-col gap-3">
                <SubLabel>{mealLabel}s</SubLabel>
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.name} recipe={recipe} />
                ))}
              </div>
            );
          })}

          {/* Shopping list by aisle */}
          <div className="flex flex-col gap-2">
            <SubLabel>Shopping list by aisle</SubLabel>
            <div className="flex flex-col divide-y divide-monitor-line rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden mt-1">
              {guide.recipeBank.shoppingList.map((aisleGroup) => (
                <div key={aisleGroup.aisle} className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-0">
                  <div className="px-5 py-3 sm:border-r border-b sm:border-b-0 border-monitor-line bg-monitor-accent/[0.03] flex items-start">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-monitor-accent/70">{aisleGroup.aisle}</span>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-xs leading-relaxed text-monitor-fg">{aisleGroup.items.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Daily blueprint ───────────────────────────────────────────── */}
        <Section title="Your daily blueprint" index={12}>
          <div className="rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
            <ul className="flex flex-col divide-y divide-monitor-line">
              {guide.dailyBlueprint.map((b) => (
                <li key={b.time} className="flex items-start gap-4 px-5 py-3">
                  <span className="font-mono text-[11px] text-monitor-accent w-16 shrink-0 mt-[2px] tabular-nums">
                    {b.time}
                  </span>
                  <span className="text-sm leading-relaxed text-monitor-fg">{b.activity}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ── Sleep and stress ──────────────────────────────────────────── */}
        <Section title="Sleep and stress recovery" index={13}>
          <DeepDiveBlock dive={guide.sleepAndStress.briefing} />
          <div className="flex flex-col gap-2">
            <SubLabel>Your protocol</SubLabel>
            <div className="mt-1">
              <Bullets items={guide.sleepAndStress.protocol} />
            </div>
          </div>
        </Section>

        {/* ── 10-minute fallback ────────────────────────────────────────── */}
        <Section title="The 10-minute fallback" index={14}>
          <p className="text-sm leading-relaxed text-monitor-fg">{guide.tenMinutePlan.summary}</p>
          <div className="rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
            <ul className="flex flex-col divide-y divide-monitor-line">
              {guide.tenMinutePlan.movements.map((m) => (
                <li key={m.name} className="flex items-baseline gap-4 px-5 py-3">
                  <span className="text-sm text-monitor-fg flex-1">{m.name}</span>
                  <span className="font-mono text-xs text-monitor-muted shrink-0">{m.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ── Progress markers ──────────────────────────────────────────── */}
        <Section title="How to know it is working" index={15}>
          <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
            {guide.progressMarkers.summary}
          </p>
          <Bullets items={guide.progressMarkers.markers} />
        </Section>

        {/* ── Troubleshooting ───────────────────────────────────────────── */}
        <Section title="When it gets hard" index={16}>
          <div className="flex flex-col gap-3">
            {guide.troubleshooting.map((t) => (
              <div
                key={t.problem}
                className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-0 rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden"
              >
                <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r border-monitor-line bg-monitor-accent/[0.03]">
                  <p className="text-sm font-semibold text-monitor-fg leading-snug">{t.problem}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-monitor-muted">{t.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── FAQs ──────────────────────────────────────────────────────── */}
        <Section title="Common questions" index={17}>
          <div className="flex flex-col divide-y divide-monitor-line rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
            {guide.faqs.map((f) => (
              <div key={f.q} className="flex flex-col gap-1.5 px-5 py-4">
                <p className="text-sm font-semibold text-monitor-fg">{f.q}</p>
                <p className="text-sm leading-relaxed text-monitor-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── The science ───────────────────────────────────────────────── */}
        <Section title="The science behind the plan" index={18}>
          {/* Summary intro */}
          <div className="flex flex-col gap-2 rounded-xl border border-monitor-line bg-monitor-panel p-5">
            <SubLabel>Why these levers were chosen for you</SubLabel>
            <p className="mt-1 text-sm leading-relaxed text-monitor-fg">{guide.scienceNotes.summary}</p>
          </div>

          {/* Per-lever entries */}
          <div className="flex flex-col gap-3">
            {guide.scienceNotes.entries.map((entry) => (
              <div key={entry.lever} className="overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel">
                <div className="border-b border-monitor-line px-5 py-4">
                  <h3 className="text-sm font-semibold text-monitor-fg">{entry.lever}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-monitor-line">
                  <div className="px-5 py-4 flex flex-col gap-1.5">
                    <SubLabel>Mechanism</SubLabel>
                    <p className="text-sm leading-relaxed text-monitor-fg mt-0.5">{entry.mechanism}</p>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-1.5">
                    <SubLabel>What the evidence shows</SubLabel>
                    <p className="text-sm leading-relaxed text-monitor-muted mt-0.5">{entry.evidence}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer in muted footnote style */}
          <p className="text-xs leading-relaxed text-monitor-muted/50 border-t border-monitor-line pt-3">
            {guide.scienceNotes.disclaimer}
          </p>
        </Section>

        {/* ── Bonus playbooks ───────────────────────────────────────────── */}
        <Section title="Bonus playbooks" index={19}>
          <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
            Four additional playbooks covering the situations that derail most people - plateaus, travel, supplements, and keeping the results for good.
          </p>
          <div className="flex flex-col gap-4">
            {guide.bonusModules.map((m) => (
              <DeepDiveBlock key={m.heading} dive={m} />
            ))}
          </div>
        </Section>

        {/* ── Recalibration ─────────────────────────────────────────────── */}
        <Section title="Weekly recalibration" index={20}>
          <p className="text-sm leading-relaxed text-monitor-fg">{guide.recalibration}</p>
        </Section>

        {/* ── Closing ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-monitor-line pt-10">
          <div className="h-px w-6 bg-monitor-accent/40" />
          <p className="text-base leading-relaxed text-monitor-fg max-w-[58ch]">{guide.closing}</p>
        </div>

      </main>
    </>
  );
}
