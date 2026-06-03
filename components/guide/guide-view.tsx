import type { DeepDive, GuideDoc } from "@/lib/guide/schema";

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

          {/* Workouts */}
          {w.workouts.map((wo, wi) => (
            <div key={wi} className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-monitor-accent/60 shrink-0 w-8">
                  {wo.day.slice(0, 3)}
                </span>
                <span className="text-sm font-semibold text-monitor-fg">{wo.title}</span>
              </div>

              {/* Exercise rows */}
              <div className="flex flex-col gap-2 pl-11">
                {wo.exercises.map((ex, ei) => (
                  <div
                    key={ei}
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

          {/* CTA */}
          <a
            href={`/guide/${token}/pdf`}
            className="mt-1 inline-flex w-full sm:w-fit items-center justify-center gap-2.5 rounded-lg bg-monitor-accent px-7 py-3.5 text-sm font-semibold text-monitor-bg transition-all duration-200 hover:bg-monitor-accent/90 active:scale-[0.97]"
          >
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
            Download your full PDF
          </a>
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

        {/* ── Outcomes ──────────────────────────────────────────────────── */}
        <Section title="What these 8 weeks deliver" index={2}>
          <Bullets items={guide.outcomes} />
        </Section>

        {/* ── Risk briefings (deep dives) ───────────────────────────────── */}
        <Section title="Your biggest risks, in depth" index={3}>
          <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
            For each of your largest modifiable risks: what is happening, why it
            costs you, what improves when you fix it, and exactly what to do.
          </p>
          <div className="flex flex-col gap-4">
            {guide.riskBriefings.map((d, i) => (
              <DeepDiveBlock key={i} dive={d} />
            ))}
          </div>
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

        {/* ── How your training works ───────────────────────────────────── */}
        <Section title="How your training works" index={5}>
          <DeepDiveBlock dive={guide.training.approach} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 rounded-xl border border-monitor-line bg-monitor-panel p-5">
              <SubLabel>Warm up first, every session</SubLabel>
              <ul className="mt-1 flex flex-col divide-y divide-monitor-line">
                {guide.training.warmup.map((m, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 py-2">
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
        </Section>

        {/* ── 8-week plan ───────────────────────────────────────────────── */}
        <Section title="Your 8-week plan" index={6}>
          <div className="flex flex-col gap-4">
            {guide.weeks.map((w, i) => (
              <WeekCard key={w.week} w={w} delay={i * 50 + 100} />
            ))}
          </div>
        </Section>

        {/* ── Nutrition plan ────────────────────────────────────────────── */}
        <Section title="Your nutrition plan" index={7}>
          <DeepDiveBlock dive={n.philosophy} />

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
            {n.sampleDays.map((day, di) => (
              <div key={di} className="rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
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
              {n.swaps.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
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

        {/* ── Daily blueprint ───────────────────────────────────────────── */}
        <Section title="Your daily blueprint" index={8}>
          <div className="rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
            <ul className="flex flex-col divide-y divide-monitor-line">
              {guide.dailyBlueprint.map((b, i) => (
                <li key={i} className="flex items-start gap-4 px-5 py-3">
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
        <Section title="Sleep and stress recovery" index={9}>
          <DeepDiveBlock dive={guide.sleepAndStress.briefing} />
          <div className="flex flex-col gap-2">
            <SubLabel>Your protocol</SubLabel>
            <div className="mt-1">
              <Bullets items={guide.sleepAndStress.protocol} />
            </div>
          </div>
        </Section>

        {/* ── 10-minute fallback ────────────────────────────────────────── */}
        <Section title="The 10-minute fallback" index={10}>
          <p className="text-sm leading-relaxed text-monitor-fg">{guide.tenMinutePlan.summary}</p>
          <div className="rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
            <ul className="flex flex-col divide-y divide-monitor-line">
              {guide.tenMinutePlan.movements.map((m, i) => (
                <li key={i} className="flex items-baseline gap-4 px-5 py-3">
                  <span className="text-sm text-monitor-fg flex-1">{m.name}</span>
                  <span className="font-mono text-xs text-monitor-muted shrink-0">{m.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ── Progress markers ──────────────────────────────────────────── */}
        <Section title="How to know it is working" index={11}>
          <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
            {guide.progressMarkers.summary}
          </p>
          <Bullets items={guide.progressMarkers.markers} />
        </Section>

        {/* ── Troubleshooting ───────────────────────────────────────────── */}
        <Section title="When it gets hard" index={12}>
          <div className="flex flex-col gap-3">
            {guide.troubleshooting.map((t, i) => (
              <div
                key={i}
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
        <Section title="Common questions" index={13}>
          <div className="flex flex-col divide-y divide-monitor-line rounded-xl border border-monitor-line bg-monitor-panel overflow-hidden">
            {guide.faqs.map((f, i) => (
              <div key={i} className="flex flex-col gap-1.5 px-5 py-4">
                <p className="text-sm font-semibold text-monitor-fg">{f.q}</p>
                <p className="text-sm leading-relaxed text-monitor-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Recalibration ─────────────────────────────────────────────── */}
        <Section title="Weekly recalibration" index={14}>
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
