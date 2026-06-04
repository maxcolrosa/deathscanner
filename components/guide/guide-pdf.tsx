/**
 * guide-pdf.tsx
 *
 * The full workbook PDF for the Second Wind Protocol.
 *
 * HARD CONSTRAINT: do NOT add `fixed` to any element.
 * @react-pdf 4.x throws "unsupported number" across many auto-broken pages
 * whenever a `fixed` element exists, which 500s the PDF routes. Page identity
 * lives on the cover instead.
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DeepDive, GuideDoc } from "@/lib/guide/schema";
import {
  SANS,
  MONO,
  C,
  trackerStyles,
  WorkoutLogGrid,
  WeeklyHabitGrid,
  MeasurementTrackerGrid,
  GroceryChecklist,
  DailyChecklistCard,
} from "@/components/guide/pdf-shared";

/* ─── Brand ──────────────────────────────────────────────────────────────────── */
const BRAND = "LONGEVITY SCAN";

/* ─── StyleSheet ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.fg,
    fontFamily: SANS,
    fontSize: 10.5,
    lineHeight: 1.55,
    paddingVertical: 52,
    paddingHorizontal: 48,
  },

  /* Cover */
  coverMark: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 96 },
  coverDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent },
  coverMarkText: { fontFamily: MONO, fontSize: 8.5, letterSpacing: 2.2, color: C.fg },
  coverKicker: {
    fontFamily: MONO,
    fontSize: 8.5,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: C.accent,
    marginBottom: 14,
  },
  coverTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 30,
    lineHeight: 1.12,
    letterSpacing: -0.5,
    color: C.fg,
    marginBottom: 18,
    maxWidth: 420,
  },
  coverIntro: { fontSize: 11, lineHeight: 1.6, color: C.muted, maxWidth: 400 },
  coverRule: { borderBottomWidth: 0.75, borderBottomColor: C.line, marginTop: 28, marginBottom: 16 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  metaKey: { fontFamily: MONO, fontSize: 7.5, letterSpacing: 1.2, color: C.muted },
  metaVal: { fontFamily: MONO, fontSize: 7.5, letterSpacing: 1.2, color: C.fg },
  metaDivider: { width: 0.75, height: 9, backgroundColor: C.line, marginRight: 16 },

  /* Table of Contents */
  tocTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 22,
    color: C.fg,
    marginBottom: 20,
  },
  tocEntry: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  tocIndex: {
    fontFamily: MONO,
    fontSize: 8.5,
    color: C.accentDim,
    width: 24,
    marginTop: 1,
  },
  tocLabel: {
    fontFamily: SANS,
    fontSize: 10.5,
    color: C.fg,
    flex: 1,
  },
  tocNote: {
    fontFamily: MONO,
    fontSize: 8,
    color: C.muted,
    marginTop: 18,
  },

  /* Section header */
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sectionIndex: { fontFamily: MONO, fontSize: 9, color: C.accentDim, width: 16 },
  sectionTitle: {
    fontFamily: MONO,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.muted,
  },
  sectionLine: { flex: 1, height: 0.75, backgroundColor: C.line },

  /* Text */
  para: { marginBottom: 8, color: C.fg },
  muted: { marginBottom: 8, color: C.muted },
  lead: { fontSize: 11, lineHeight: 1.6, color: C.fg, marginBottom: 14 },

  /* Bullets */
  bulletRow: { flexDirection: "row", marginBottom: 5 },
  bulletMark: { fontFamily: MONO, fontSize: 10, color: C.accent, width: 12 },
  bulletText: { flex: 1, color: C.fg },

  /* Plain item rows */
  item: { marginBottom: 3, color: C.fg },
  itemMeta: { color: C.muted, marginBottom: 4, fontSize: 9.5 },

  /* Panel (deep dives) */
  panel: {
    backgroundColor: C.panel,
    borderWidth: 0.75,
    borderColor: C.line,
    borderLeftWidth: 2,
    borderLeftColor: C.accent,
    padding: 14,
    marginTop: 8,
    marginBottom: 14,
  },
  panelHead: { fontFamily: SANS, fontWeight: 600, fontSize: 12.5, color: C.fg, marginBottom: 8 },
  panelLabel: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.accentDim,
    marginTop: 8,
    marginBottom: 2,
  },
  panelPara: { color: C.fg, marginBottom: 2 },

  /* Weeks / workouts */
  weekTitle: { fontFamily: SANS, fontWeight: 600, fontSize: 12, color: C.fg, marginTop: 14, marginBottom: 2 },
  workoutTitle: { fontFamily: SANS, fontWeight: 600, fontSize: 10.5, color: C.accent, marginTop: 8, marginBottom: 3 },
  exName: { color: C.fg, marginBottom: 1 },
  exMeta: { fontFamily: MONO, fontSize: 8.5, color: C.muted, marginBottom: 4 },

  h3: { fontFamily: SANS, fontWeight: 600, fontSize: 11, color: C.fg, marginTop: 10, marginBottom: 3 },

  /* Plate-formula callout: left accent border to set it apart */
  callout: { borderLeftWidth: 2, borderLeftColor: C.accentDim, paddingLeft: 8 },

  /* Your Numbers */
  yourNumbersHeadline: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 16,
    color: C.accent,
    marginBottom: 6,
    lineHeight: 1.25,
  },
  metricsHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.accentDim,
    marginBottom: 2,
    marginTop: 8,
  },
  metricsHeaderCell: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.accentDim,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  metricsRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  metricsCell: {
    fontFamily: SANS,
    fontSize: 9.5,
    color: C.fg,
    paddingVertical: 5,
    paddingHorizontal: 4,
    lineHeight: 1.4,
  },
  metricsCellMuted: {
    fontFamily: SANS,
    fontSize: 9.5,
    color: C.muted,
    paddingVertical: 5,
    paddingHorizontal: 4,
    lineHeight: 1.4,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  milestoneWeek: {
    fontFamily: MONO,
    fontSize: 8.5,
    color: C.accentDim,
    width: 52,
    marginTop: 1,
  },
  milestoneMarker: {
    fontFamily: SANS,
    fontSize: 10,
    color: C.fg,
    flex: 1,
    lineHeight: 1.45,
  },

  /* Tracker sections inside the workbook */
  trackerBreak: { marginTop: 20 },
});

/* ─── Primitives ─────────────────────────────────────────────────────────────── */

function SectionHeader({ index, title }: { index: number; title: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionIndex}>{String(index).padStart(2, "0")}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletMark}>+</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function Panel({ dive }: { dive: DeepDive }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelHead}>{dive.heading}</Text>
      <Text style={styles.panelLabel}>The problem</Text>
      <Text style={styles.panelPara}>{dive.problem}</Text>
      <Text style={styles.panelLabel}>Why it matters</Text>
      <Text style={styles.panelPara}>{dive.why}</Text>
      <Text style={styles.panelLabel}>When you fix it</Text>
      <Text style={styles.panelPara}>{dive.whenFixed}</Text>
      <Text style={styles.panelLabel}>What to do</Text>
      {dive.actions.map((a, i) => (
        <Bullet key={i}>{a}</Bullet>
      ))}
    </View>
  );
}

/** A section that always starts on a fresh page. */
function Section({
  index,
  title,
  children,
  first,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <View break={!first}>
      <SectionHeader index={index} title={title} />
      {children}
    </View>
  );
}

/* ─── Table of contents entries ──────────────────────────────────────────────── */
const TOC_ENTRIES = [
  "Where you stand",
  "Your numbers",
  "Your biggest risks, in depth",
  "How your training works",
  "Start here: your first 7 days",
  "Your 8-week plan",
  "Your nutrition plan",
  "Your daily blueprint",
  "Sleep and stress recovery",
  "The 10-minute fallback",
  "How to know it is working",
  "When it gets hard",
  "Common questions",
  "Weekly recalibration",
  "Bonus playbooks",
  "Printable trackers: workout log",
  "Printable trackers: habit and measurement grids",
  "Printable trackers: grocery checklist and daily card",
];

/* ─── Document ───────────────────────────────────────────────────────────────── */

export function GuidePdfDocument({ guide }: { guide: GuideDoc }) {
  const n = guide.nutritionPlan;
  const yn = guide.yourNumbers;

  return (
    <Document
      title={guide.title}
      author={BRAND}
      subject="Your personalized 8-week protocol"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Cover ────────────────────────────────────────────────────────────
            No `fixed` running header/footer. See constraint comment at top. */}
        <View style={styles.coverMark}>
          <View style={styles.coverDot} />
          <Text style={styles.coverMarkText}>{BRAND}</Text>
        </View>
        <Text style={styles.coverKicker}>Personalized workbook</Text>
        <Text style={styles.coverTitle}>{guide.title}</Text>
        <Text style={styles.coverIntro}>{guide.intro}</Text>
        <View style={styles.coverRule} />
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaKey}>BUILT FROM </Text>
            <Text style={styles.metaVal}>YOUR SCAN</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaKey}>DURATION </Text>
            <Text style={styles.metaVal}>8 WEEKS</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaKey}>INCLUDES </Text>
            <Text style={styles.metaVal}>WORKBOOK + TRACKERS</Text>
          </View>
        </View>

        {/* ── Table of Contents ─────────────────────────────────────────────── */}
        <View break>
          <Text style={styles.tocTitle}>Contents</Text>
          {TOC_ENTRIES.map((entry, i) => (
            <View key={i} style={styles.tocEntry}>
              <Text style={styles.tocIndex}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={styles.tocLabel}>{entry}</Text>
            </View>
          ))}
          <Text style={styles.tocNote}>
            Page numbers omitted. This workbook is best read front to back.
          </Text>
        </View>

        {/* ── 01. Where you stand ──────────────────────────────────────────── */}
        <Section index={1} title="Where you stand">
          <Text style={styles.lead}>{guide.yourSituation}</Text>
          <Text style={trackerStyles.label}>The strategy</Text>
          <Text style={styles.para}>{guide.strategy}</Text>
          <Text style={trackerStyles.label}>What these 8 weeks deliver</Text>
          {guide.outcomes.map((o, i) => (
            <Bullet key={i}>{o}</Bullet>
          ))}
        </Section>

        {/* ── 02. Your numbers ─────────────────────────────────────────────── */}
        <Section index={2} title="Your numbers">
          <Text style={styles.yourNumbersHeadline}>{yn.reclaimedYearsHeadline}</Text>
          <Text style={styles.para}>{yn.summary}</Text>

          <Text style={trackerStyles.label}>Your starting estimates and targets</Text>
          <Text style={[styles.muted, { fontSize: 9, marginBottom: 6 }]}>
            Starting bands are estimated from your scan answers, not measured. Targets are goals, not guarantees.
          </Text>

          {/* Metrics table */}
          <View style={styles.metricsHeaderRow}>
            <Text style={[styles.metricsHeaderCell, { flex: 2 }]}>Metric</Text>
            <Text style={[styles.metricsHeaderCell, { flex: 2 }]}>Starting band</Text>
            <Text style={[styles.metricsHeaderCell, { flex: 2 }]}>8-week target</Text>
            <Text style={[styles.metricsHeaderCell, { flex: 3 }]}>How to get there</Text>
          </View>
          {yn.metrics.map((m, i) => (
            <View key={i} style={styles.metricsRow} wrap={false}>
              <Text style={[styles.metricsCell, { flex: 2 }]}>{m.label}</Text>
              <Text style={[styles.metricsCellMuted, { flex: 2 }]}>{m.startingBand}</Text>
              <Text style={[styles.metricsCell, { flex: 2, color: C.accent }]}>{m.target}</Text>
              <Text style={[styles.metricsCellMuted, { flex: 3 }]}>{m.how}</Text>
            </View>
          ))}

          <Text style={trackerStyles.label}>Milestones</Text>
          {yn.milestones.map((ms, i) => (
            <View key={i} style={styles.milestoneRow} wrap={false}>
              <Text style={styles.milestoneWeek}>{ms.week}</Text>
              <Text style={styles.milestoneMarker}>{ms.marker}</Text>
            </View>
          ))}
        </Section>

        {/* ── 03. Risk briefings ───────────────────────────────────────────── */}
        <Section index={3} title="Your biggest risks, in depth">
          <Text style={styles.muted}>
            For each of your largest modifiable risks: what is happening, why it
            costs you years, what improves when you fix it, and exactly what to do.
          </Text>
          {guide.riskBriefings.map((d, i) => (
            <Panel key={i} dive={d} />
          ))}
        </Section>

        {/* ── 04. Training ─────────────────────────────────────────────────── */}
        <Section index={4} title="How your training works">
          <Panel dive={guide.training.approach} />
          <Text style={trackerStyles.label}>Warm up first, every session</Text>
          {guide.training.warmup.map((m, i) => (
            <Bullet key={i}>
              {m.name}: {m.detail}
            </Bullet>
          ))}
          <Text style={trackerStyles.label}>How to progress</Text>
          {guide.training.progressionRules.map((r, i) => (
            <Bullet key={i}>{r}</Bullet>
          ))}
          <Text style={trackerStyles.label}>The deload week</Text>
          <Text style={styles.para}>{guide.training.deload}</Text>
          {/* Sessions shown once for all 8 weeks - no reprinting per week */}
          <Text style={trackerStyles.label}>Your sessions for all 8 weeks</Text>
          <Text style={styles.muted}>
            These are your sessions for all 8 weeks. Run them every week and add a little load or one more rep as you go. The movements stay the same; the numbers climb.
          </Text>
          {guide.training.workouts.map((wo, wi) => (
            <View key={wi} wrap={false}>
              <Text style={styles.workoutTitle}>
                {wo.day}: {wo.title}
              </Text>
              {wo.exercises.map((ex, ei) => (
                <View key={ei}>
                  <Text style={styles.exName}>
                    {ex.name}
                    <Text style={styles.exMeta}>
                      {"  "}
                      {ex.sets} x {ex.reps}, rest {ex.rest}
                    </Text>
                  </Text>
                  <Text style={styles.exMeta}>
                    {ex.cues}. Progress: {ex.progression}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </Section>

        {/* ── 05. First 7 days ─────────────────────────────────────────────── */}
        <Section index={5} title="Start here: your first 7 days">
          {guide.next7Days.map((d, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletMark}>{String(i + 1)}</Text>
              <Text style={styles.bulletText}>
                <Text style={{ color: C.accent }}>{d.day}. </Text>
                {d.action}
              </Text>
            </View>
          ))}
        </Section>

        {/* ── 06. 8-week plan ──────────────────────────────────────────────── */}
        <Section index={6} title="Your 8-week plan">
          {guide.weeks.map((w) => (
            <View key={w.week} wrap={false}>
              <Text style={styles.weekTitle}>{w.focus}</Text>
              <Text style={styles.muted}>{w.theme}</Text>
              <Text style={styles.muted}>
                Run your training sessions this week, adding a little where last week felt easy.
              </Text>
              <Text style={trackerStyles.label}>Nutrition focus</Text>
              <Text style={styles.item}>{w.nutritionFocus}</Text>
              <Text style={trackerStyles.label}>Habit</Text>
              <Text style={styles.item}>
                {w.habit.name} ({w.habit.trigger}). {w.habit.why}
              </Text>
              <Text style={styles.muted}>Checkpoint: {w.checkpoint}</Text>
            </View>
          ))}
        </Section>

        {/* ── 07. Nutrition ────────────────────────────────────────────────── */}
        <Section index={7} title="Your nutrition plan">
          <Panel dive={n.philosophy} />
          <Text style={trackerStyles.label}>Build every plate like this</Text>
          <Text style={[styles.para, styles.callout]}>{n.plateFormula}</Text>
          <Text style={trackerStyles.label}>Calibrated to your goal</Text>
          {n.calibration.map((c, i) => (
            <Bullet key={i}>{c}</Bullet>
          ))}
          <Text style={trackerStyles.label}>Your protein target</Text>
          <Text style={styles.para}>{n.proteinTarget}</Text>
          <Text style={trackerStyles.label}>Hydration</Text>
          <Text style={styles.para}>{n.hydration}</Text>
          <Text style={trackerStyles.label}>Principles</Text>
          {n.principles.map((p, i) => (
            <Bullet key={i}>{p}</Bullet>
          ))}
          {n.sampleDays.map((day, di) => (
            <View key={di} wrap={false}>
              <Text style={trackerStyles.label}>{day.label}</Text>
              <Text style={styles.item}>Breakfast: {day.breakfast}</Text>
              <Text style={styles.item}>Lunch: {day.lunch}</Text>
              <Text style={styles.item}>Dinner: {day.dinner}</Text>
              <Text style={styles.item}>Snacks: {day.snacks}</Text>
            </View>
          ))}
          <Text style={trackerStyles.label}>Swaps</Text>
          {n.swaps.map((s, i) => (
            <Text key={i} style={styles.item}>
              {s.from} {"->"} {s.to}
            </Text>
          ))}
          <Text style={trackerStyles.label}>Eating out without losing the week</Text>
          {n.eatingOut.map((e, i) => (
            <Bullet key={i}>{e}</Bullet>
          ))}
          <Text style={trackerStyles.label}>Grocery staples</Text>
          <Text style={styles.item}>{n.groceryStaples.join(", ")}</Text>
        </Section>

        {/* ── 08. Daily blueprint ──────────────────────────────────────────── */}
        <Section index={8} title="Your daily blueprint">
          {guide.dailyBlueprint.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={[styles.bulletMark, { fontFamily: MONO, color: C.accent, width: 56 }]}>
                {b.time}
              </Text>
              <Text style={styles.bulletText}>{b.activity}</Text>
            </View>
          ))}
        </Section>

        {/* ── 09. Sleep and stress ─────────────────────────────────────────── */}
        <Section index={9} title="Sleep and stress recovery">
          <Panel dive={guide.sleepAndStress.briefing} />
          <Text style={trackerStyles.label}>Your protocol</Text>
          {guide.sleepAndStress.protocol.map((p, i) => (
            <Bullet key={i}>{p}</Bullet>
          ))}
        </Section>

        {/* ── 10. 10-minute fallback ───────────────────────────────────────── */}
        <Section index={10} title="The 10-minute fallback">
          <Text style={styles.para}>{guide.tenMinutePlan.summary}</Text>
          {guide.tenMinutePlan.movements.map((m, i) => (
            <Bullet key={i}>
              {m.name}: {m.detail}
            </Bullet>
          ))}
        </Section>

        {/* ── 11. Progress ─────────────────────────────────────────────────── */}
        <Section index={11} title="How to know it is working">
          <Text style={styles.muted}>{guide.progressMarkers.summary}</Text>
          {guide.progressMarkers.markers.map((m, i) => (
            <Bullet key={i}>{m}</Bullet>
          ))}
        </Section>

        {/* ── 12. Troubleshooting ──────────────────────────────────────────── */}
        <Section index={12} title="When it gets hard">
          {guide.troubleshooting.map((t, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 8 }}>
              <Text style={styles.h3}>{t.problem}</Text>
              <Text style={styles.muted}>{t.fix}</Text>
            </View>
          ))}
        </Section>

        {/* ── 13. FAQ ──────────────────────────────────────────────────────── */}
        <Section index={13} title="Common questions">
          {guide.faqs.map((f, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 8 }}>
              <Text style={styles.h3}>{f.q}</Text>
              <Text style={styles.muted}>{f.a}</Text>
            </View>
          ))}
        </Section>

        {/* ── 14. Weekly recalibration ─────────────────────────────────────── */}
        <Section index={14} title="Weekly recalibration">
          <Text style={styles.para}>{guide.recalibration}</Text>
          <View style={styles.coverRule} />
          <Text style={styles.lead}>{guide.closing}</Text>
        </Section>

        {/* ── 15. Bonus playbooks ──────────────────────────────────────────── */}
        <Section index={15} title="Bonus playbooks">
          <Text style={styles.muted}>
            Four additional playbooks for the situations this plan does not cover day-to-day.
          </Text>
          {guide.bonusModules.map((mod, i) => (
            <Panel key={i} dive={mod} />
          ))}
        </Section>

        {/* ── 16. Workout log tracker ──────────────────────────────────────── */}
        <Section index={16} title="Printable tracker: workout log">
          <WorkoutLogGrid guide={guide} />
        </Section>

        {/* ── 17. Habit and measurement grids ──────────────────────────────── */}
        <Section index={17} title="Printable trackers: habit and measurement">
          <WeeklyHabitGrid guide={guide} />
          <View style={styles.trackerBreak} />
          <MeasurementTrackerGrid />
        </Section>

        {/* ── 18. Grocery checklist and daily card ─────────────────────────── */}
        <Section index={18} title="Printable trackers: grocery and daily card">
          <GroceryChecklist aisles={guide.trackers.groceryByAisle} />
          <View style={styles.trackerBreak} />
          <DailyChecklistCard items={guide.trackers.dailyChecklist} />
        </Section>
      </Page>
    </Document>
  );
}
