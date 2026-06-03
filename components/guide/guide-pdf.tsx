import fs from "node:fs";
import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { DeepDive, GuideDoc } from "@/lib/guide/schema";

/* ─── Brand ──────────────────────────────────────────────────────────────────
   The diagnostic system that generated this protocol. Update here when the
   brand name changes; this is the only place the PDF names it. */
const BRAND = "LONGEVITY SCAN";

/* ─── Fonts ───────────────────────────────────────────────────────────────────
   Register the real Geist family so the PDF matches the product. We only
   register if the static TTFs are present on disk; otherwise fall back to the
   built-in PDF fonts so rendering never hard-fails. */
const FONT_DIR = path.join(process.cwd(), "node_modules/geist/dist/fonts");
const FONTS_OK = (() => {
  try {
    return fs.existsSync(path.join(FONT_DIR, "geist-sans/Geist-Regular.ttf"));
  } catch {
    return false;
  }
})();

if (FONTS_OK) {
  Font.register({
    family: "Geist",
    fonts: [
      { src: path.join(FONT_DIR, "geist-sans/Geist-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "geist-sans/Geist-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "geist-sans/Geist-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FONT_DIR, "geist-sans/Geist-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "GeistMono",
    fonts: [
      { src: path.join(FONT_DIR, "geist-mono/GeistMono-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "geist-mono/GeistMono-Medium.ttf"), fontWeight: 500 },
    ],
  });
}
// Keep words intact: react-pdf hyphenates mid-word by default, which looks broken.
Font.registerHyphenationCallback((word) => [word]);

const SANS = FONTS_OK ? "Geist" : "Helvetica";
const MONO = FONTS_OK ? "GeistMono" : "Courier";

/* ─── Monitor palette (mirrors app/globals.css) ─────────────────────────────── */
const C = {
  bg: "#070b0d",
  panel: "#0c1418",
  line: "#16242b",
  fg: "#d7e3e6",
  muted: "#6b8088",
  accent: "#2ee6c9",
  accentDim: "#1c8377",
  alert: "#ff453a",
} as const;

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

  /* Labels */
  label: {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: C.accent,
    marginTop: 14,
    marginBottom: 5,
  },

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

/* A section that always starts on a fresh page. */
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

/* ─── Document ───────────────────────────────────────────────────────────────── */

export function GuidePdfDocument({ guide }: { guide: GuideDoc }) {
  const n = guide.nutritionPlan;
  return (
    <Document
      title={guide.title}
      author={BRAND}
      subject="Your personalized 8-week protocol"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Cover ──
            Note: this guide deliberately uses no `fixed` running header/footer.
            @react-pdf 4.x miscomputes layout for `fixed` elements across this
            many auto-broken pages and throws "unsupported number", which would
            500 the PDF download route. Page identity lives on the cover instead. */}
        <View style={styles.coverMark}>
          <View style={styles.coverDot} />
          <Text style={styles.coverMarkText}>{BRAND}</Text>
        </View>
        <Text style={styles.coverKicker}>Personalized protocol</Text>
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
            <Text style={styles.metaKey}>STATUS </Text>
            <Text style={styles.metaVal}>CONFIDENTIAL</Text>
          </View>
        </View>

        {/* ── Overview ── */}
        <Section index={1} title="Where you stand">
          <Text style={styles.lead}>{guide.yourSituation}</Text>
          <Text style={styles.label}>The strategy</Text>
          <Text style={styles.para}>{guide.strategy}</Text>
          <Text style={styles.label}>What these 8 weeks deliver</Text>
          {guide.outcomes.map((o, i) => (
            <Bullet key={i}>{o}</Bullet>
          ))}
        </Section>

        {/* ── Risk briefings ── */}
        <Section index={2} title="Your biggest risks, in depth">
          <Text style={styles.muted}>
            For each of your largest modifiable risks: what is happening, why it
            costs you years, what improves when you fix it, and exactly what to do.
          </Text>
          {guide.riskBriefings.map((d, i) => (
            <Panel key={i} dive={d} />
          ))}
        </Section>

        {/* ── Training ── */}
        <Section index={3} title="How your training works">
          <Panel dive={guide.training.approach} />
          <Text style={styles.label}>Warm up first, every session</Text>
          {guide.training.warmup.map((m, i) => (
            <Bullet key={i}>
              {m.name}: {m.detail}
            </Bullet>
          ))}
          <Text style={styles.label}>How to progress</Text>
          {guide.training.progressionRules.map((r, i) => (
            <Bullet key={i}>{r}</Bullet>
          ))}
          <Text style={styles.label}>The deload week</Text>
          <Text style={styles.para}>{guide.training.deload}</Text>
        </Section>

        {/* ── First 7 days ── */}
        <Section index={4} title="Start here: your first 7 days">
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

        {/* ── 8-week plan ── */}
        <Section index={5} title="Your 8-week plan">
          {guide.weeks.map((w) => (
            <View key={w.week} wrap={false}>
              <Text style={styles.weekTitle}>{w.focus}</Text>
              <Text style={styles.muted}>{w.theme}</Text>
              {w.workouts.map((wo, wi) => (
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
              <Text style={styles.label}>Nutrition focus</Text>
              <Text style={styles.item}>{w.nutritionFocus}</Text>
              <Text style={styles.label}>Habit</Text>
              <Text style={styles.item}>
                {w.habit.name} ({w.habit.trigger}). {w.habit.why}
              </Text>
              <Text style={styles.muted}>Checkpoint: {w.checkpoint}</Text>
            </View>
          ))}
        </Section>

        {/* ── Nutrition ── */}
        <Section index={6} title="Your nutrition plan">
          <Panel dive={n.philosophy} />
          <Text style={styles.label}>Your protein target</Text>
          <Text style={styles.para}>{n.proteinTarget}</Text>
          <Text style={styles.label}>Hydration</Text>
          <Text style={styles.para}>{n.hydration}</Text>
          <Text style={styles.label}>Principles</Text>
          {n.principles.map((p, i) => (
            <Bullet key={i}>{p}</Bullet>
          ))}
          {n.sampleDays.map((day, di) => (
            <View key={di} wrap={false}>
              <Text style={styles.label}>{day.label}</Text>
              <Text style={styles.item}>Breakfast: {day.breakfast}</Text>
              <Text style={styles.item}>Lunch: {day.lunch}</Text>
              <Text style={styles.item}>Dinner: {day.dinner}</Text>
              <Text style={styles.item}>Snacks: {day.snacks}</Text>
            </View>
          ))}
          <Text style={styles.label}>Swaps</Text>
          {n.swaps.map((s, i) => (
            <Text key={i} style={styles.item}>
              {s.from} {"->"} {s.to}
            </Text>
          ))}
          <Text style={styles.label}>Eating out without losing the week</Text>
          {n.eatingOut.map((e, i) => (
            <Bullet key={i}>{e}</Bullet>
          ))}
          <Text style={styles.label}>Grocery staples</Text>
          <Text style={styles.item}>{n.groceryStaples.join(", ")}</Text>
        </Section>

        {/* ── Daily blueprint ── */}
        <Section index={7} title="Your daily blueprint">
          {guide.dailyBlueprint.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={[styles.bulletMark, { fontFamily: MONO, color: C.accent, width: 56 }]}>
                {b.time}
              </Text>
              <Text style={styles.bulletText}>{b.activity}</Text>
            </View>
          ))}
        </Section>

        {/* ── Sleep and stress ── */}
        <Section index={8} title="Sleep and stress recovery">
          <Panel dive={guide.sleepAndStress.briefing} />
          <Text style={styles.label}>Your protocol</Text>
          {guide.sleepAndStress.protocol.map((p, i) => (
            <Bullet key={i}>{p}</Bullet>
          ))}
        </Section>

        {/* ── Fallback ── */}
        <Section index={9} title="The 10-minute fallback">
          <Text style={styles.para}>{guide.tenMinutePlan.summary}</Text>
          {guide.tenMinutePlan.movements.map((m, i) => (
            <Bullet key={i}>
              {m.name}: {m.detail}
            </Bullet>
          ))}
        </Section>

        {/* ── Progress ── */}
        <Section index={10} title="How to know it is working">
          <Text style={styles.muted}>{guide.progressMarkers.summary}</Text>
          {guide.progressMarkers.markers.map((m, i) => (
            <Bullet key={i}>{m}</Bullet>
          ))}
        </Section>

        {/* ── Troubleshooting ── */}
        <Section index={11} title="When it gets hard">
          {guide.troubleshooting.map((t, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 8 }}>
              <Text style={styles.h3}>{t.problem}</Text>
              <Text style={styles.muted}>{t.fix}</Text>
            </View>
          ))}
        </Section>

        {/* ── FAQ ── */}
        <Section index={12} title="Common questions">
          {guide.faqs.map((f, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 8 }}>
              <Text style={styles.h3}>{f.q}</Text>
              <Text style={styles.muted}>{f.a}</Text>
            </View>
          ))}
        </Section>

        {/* ── Close ── */}
        <Section index={13} title="Weekly recalibration">
          <Text style={styles.para}>{guide.recalibration}</Text>
          <View style={styles.coverRule} />
          <Text style={styles.lead}>{guide.closing}</Text>
        </Section>
      </Page>
    </Document>
  );
}
