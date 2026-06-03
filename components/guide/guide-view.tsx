import type { GuideDoc } from "@/lib/guide/schema";

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
        {title}
      </span>
      <span className="h-px flex-1 bg-monitor-line" />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionLabel title={title} />
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3.5">
          <span
            aria-hidden
            className="mt-px font-mono text-sm font-semibold leading-relaxed text-monitor-accent"
          >
            +
          </span>
          <span className="text-sm leading-relaxed text-monitor-fg">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function GuideView({ guide, token }: { guide: GuideDoc; token: string }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-14 px-6 pt-20 pb-28">
      {/* ── Hero ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Your protocol is ready
          </span>
          {/* Accent underline beneath the label */}
          <div className="h-px w-8 bg-monitor-accent" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-monitor-fg">
          {guide.title}
        </h1>

        <p className="max-w-[58ch] text-lg leading-relaxed text-monitor-muted">
          {guide.intro}
        </p>

        <a
          href={`/guide/${token}/pdf`}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-monitor-accent px-6 py-3.5 text-sm font-semibold text-monitor-bg transition-colors hover:bg-monitor-accent/90 active:scale-[0.98] sm:w-fit"
        >
          Download your PDF
        </a>
      </div>

      {/* ── Outcomes ── */}
      <Section title="What these 8 weeks deliver">
        <List items={guide.outcomes} />
      </Section>

      {/* ── Week plan ── */}
      <Section title="Your 8-week plan">
        <div className="flex flex-col gap-3">
          {guide.weeks.map((w) => (
            <div
              key={w.week}
              className="rounded-lg border border-monitor-line bg-monitor-panel p-5 pl-0 overflow-hidden"
              style={{ paddingLeft: 0 }}
            >
              <div className="flex gap-0">
                {/* Left accent bar */}
                <div className="w-1 shrink-0 rounded-l-lg bg-monitor-accent/25" />
                <div className="flex flex-1 flex-col gap-3 px-5 py-0">
                  {/* Week number + focus */}
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-2xl tracking-tighter text-monitor-accent">
                      {String(w.week).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 bg-monitor-line" />
                    <span className="text-sm font-semibold text-monitor-fg">
                      {w.focus}
                    </span>
                  </div>
                  {/* Sessions */}
                  <ul className="flex flex-col gap-1 border-t border-monitor-line pt-3">
                    {w.sessions.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-monitor-muted"
                      >
                        <span
                          aria-hidden
                          className="mt-px font-mono text-[10px] text-monitor-accent/60"
                        >
                          {"//"}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                  {w.note ? (
                    <p className="text-sm leading-relaxed text-monitor-muted/70 italic">
                      {w.note}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Nutrition ── */}
      <Section title="The metabolic reset">
        <p className="text-sm leading-relaxed text-monitor-fg">
          {guide.nutritionReset.summary}
        </p>
        <List items={guide.nutritionReset.eatList} />
        <List items={guide.nutritionReset.rhythm} />
      </Section>

      {/* ── Sleep & stress ── */}
      <Section title="Sleep and stress recovery">
        <p className="text-sm leading-relaxed text-monitor-fg">
          {guide.sleepStress.summary}
        </p>
        <List items={guide.sleepStress.practices} />
      </Section>

      {/* ── Daily 10 min ── */}
      <Section title="The 10-minute daily routine">
        <p className="text-sm leading-relaxed text-monitor-fg">
          {guide.dailyTenMinute.summary}
        </p>
        <List items={guide.dailyTenMinute.movements} />
      </Section>

      {/* ── Recalibration ── */}
      <Section title="Weekly recalibration">
        <p className="text-sm leading-relaxed text-monitor-fg">
          {guide.recalibration}
        </p>
      </Section>
    </main>
  );
}
