"use client";

import type { GuideDoc } from "@/lib/guide/schema";
import type { DeepscanQuestion } from "@/lib/deepscan/questions";
import { DeepscanSection } from "@/components/guide/deepscan-section";
import { GUIDE_TABS } from "@/lib/guide/guide-tabs";
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

/* ─── Persistent header (hero) ───────────────────────────────────────────── */

export function GuideHeader({ guide, token }: { guide: GuideDoc; token: string }) {
  return (
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
  );
}

/* ─── Deepscan panel ─────────────────────────────────────────────────────── */

export function DeepscanPanel({
  token,
  questions,
  initial,
}: {
  token: string;
  questions: DeepscanQuestion[];
  initial: GuideDoc["deepscan"] | null;
}) {
  return (
    <div className="flex flex-col gap-16">
      <div
        style={{
          animationName: "fadeSlideIn",
          animationDuration: "0.5s",
          animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          animationFillMode: "both",
          animationDelay: "60ms",
        }}
      >
        <DeepscanSection token={token} questions={questions} initial={initial ?? null} />
      </div>
    </div>
  );
}

/* ─── Start Here panel ───────────────────────────────────────────────────── */

export function StartHerePanel({ guide }: { guide: GuideDoc }) {
  return (
    <div className="flex flex-col gap-16">
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

      {/* ── First 7 days ──────────────────────────────────────────────── */}
      <Section title="Start here: your first 7 days" index={4}>
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
    </div>
  );
}

/* ─── Train panel ────────────────────────────────────────────────────────── */

export function TrainPanel({ guide }: { guide: GuideDoc }) {
  return (
    <div className="flex flex-col gap-16">
      {/* ── How your training works ───────────────────────────────────── */}
      <Section title="How your training works" index={1}>
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
      <Section title="Exercise library" index={2}>
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
      <Section title="Your week-by-week plan" index={3}>
        <div className="flex flex-col gap-4">
          {guide.weeks.map((w, i) => (
            <WeekCard key={w.week} w={w} delay={i * 50 + 100} />
          ))}
        </div>
      </Section>

      {/* ── Your 90-day arc ───────────────────────────────────────────── */}
      <Section title="Your 90-day arc" index={4}>
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

      {/* ── Daily blueprint ───────────────────────────────────────────── */}
      <Section title="Your daily blueprint" index={5}>
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

      {/* ── 10-minute fallback ────────────────────────────────────────── */}
      <Section title="The 10-minute fallback" index={6}>
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
    </div>
  );
}

/* ─── Eat panel ──────────────────────────────────────────────────────────── */

export function EatPanel({ guide }: { guide: GuideDoc }) {
  const n = guide.nutritionPlan;
  return (
    <div className="flex flex-col gap-16">
      {/* ── Nutrition plan ────────────────────────────────────────────── */}
      <Section title="Your nutrition plan" index={1}>
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
      <Section title="Recipe bank" index={2}>
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
    </div>
  );
}

/* ─── Recover panel ──────────────────────────────────────────────────────── */

export function RecoverPanel({ guide }: { guide: GuideDoc }) {
  return (
    <div className="flex flex-col gap-16">
      {/* ── Sleep and stress ──────────────────────────────────────────── */}
      <Section title="Sleep and stress recovery" index={1}>
        <DeepDiveBlock dive={guide.sleepAndStress.briefing} />
        <div className="flex flex-col gap-2">
          <SubLabel>Your protocol</SubLabel>
          <div className="mt-1">
            <Bullets items={guide.sleepAndStress.protocol} />
          </div>
        </div>
      </Section>

      {/* ── Progress markers ──────────────────────────────────────────── */}
      <Section title="How to know it is working" index={2}>
        <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
          {guide.progressMarkers.summary}
        </p>
        <Bullets items={guide.progressMarkers.markers} />
      </Section>

      {/* ── Troubleshooting ───────────────────────────────────────────── */}
      <Section title="When it gets hard" index={3}>
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

      {/* ── Recalibration ─────────────────────────────────────────────── */}
      <Section title="Weekly recalibration" index={4}>
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.recalibration}</p>
      </Section>
    </div>
  );
}

/* ─── Reference panel ────────────────────────────────────────────────────── */

export function ReferencePanel({ guide }: { guide: GuideDoc }) {
  return (
    <div className="flex flex-col gap-16">
      {/* ── Risk briefings (deep dives) ───────────────────────────────── */}
      <Section title="Your biggest risks, in depth" index={1}>
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

      {/* ── The science ───────────────────────────────────────────────── */}
      <Section title="The science behind the plan" index={2}>
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
      <Section title="Bonus playbooks" index={3}>
        <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
          Four additional playbooks covering the situations that derail most people - plateaus, travel, supplements, and keeping the results for good.
        </p>
        <div className="flex flex-col gap-4">
          {guide.bonusModules.map((m) => (
            <DeepDiveBlock key={m.heading} dive={m} />
          ))}
        </div>
      </Section>

      {/* ── FAQs ──────────────────────────────────────────────────────── */}
      <Section title="Common questions" index={4}>
        <div className="flex flex-col divide-y divide-monitor-line rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
          {guide.faqs.map((f) => (
            <div key={f.q} className="flex flex-col gap-1.5 px-5 py-4">
              <p className="text-sm font-semibold text-monitor-fg">{f.q}</p>
              <p className="text-sm leading-relaxed text-monitor-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ─── Next control ───────────────────────────────────────────────────────── */

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
        className="inline-flex items-center gap-2 rounded-lg bg-monitor-accent px-6 py-3 text-sm font-semibold text-monitor-bg transition-all duration-200 hover:bg-monitor-accent/90 active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-monitor-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-monitor-bg motion-reduce:active:scale-100"
      >
        Next: {next.label}
        <span aria-hidden>{"->"}</span>
      </button>
    </div>
  );
}
