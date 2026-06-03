import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GuideDoc } from "@/lib/guide/schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#0b1417", lineHeight: 1.5 },
  h1: { fontSize: 22, marginBottom: 6 },
  h2: { fontSize: 13, marginTop: 16, marginBottom: 6, color: "#0a8f7d" },
  para: { marginBottom: 6, color: "#1f2d31" },
  muted: { marginBottom: 6, color: "#3a4a4f" },
  item: { marginBottom: 2 },
  weekTitle: { fontSize: 12, marginTop: 10, marginBottom: 2 },
  exTitle: { fontSize: 11, marginTop: 4 },
  exMeta: { color: "#3a4a4f", marginBottom: 2 },
  label: { fontSize: 9, color: "#0a8f7d", marginTop: 4, marginBottom: 1 },
});

export function GuidePdfDocument({ guide }: { guide: GuideDoc }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{guide.title}</Text>
        <Text style={styles.para}>{guide.intro}</Text>
        <Text style={styles.muted}>{guide.yourSituation}</Text>
        <Text style={styles.muted}>{guide.strategy}</Text>

        <Text style={styles.h2}>What these 8 weeks deliver</Text>
        {guide.outcomes.map((o, i) => (
          <Text key={i} style={styles.item}>- {o}</Text>
        ))}

        <Text style={styles.h2}>Start here: your first 7 days</Text>
        {guide.next7Days.map((d, i) => (
          <Text key={i} style={styles.item}>{d.day}: {d.action}</Text>
        ))}

        <Text style={styles.h2}>Your 8-week plan</Text>
        {guide.weeks.map((w) => (
          <View key={w.week} wrap={false}>
            <Text style={styles.weekTitle}>{w.focus}</Text>
            <Text style={styles.muted}>{w.theme}</Text>
            {w.workouts.map((wo, wi) => (
              <View key={wi}>
                <Text style={styles.exTitle}>{wo.day}: {wo.title}</Text>
                {wo.exercises.map((ex, ei) => (
                  <View key={ei}>
                    <Text style={styles.item}>{ex.name}: {ex.sets} x {ex.reps}, rest {ex.rest}</Text>
                    <Text style={styles.exMeta}>{ex.cues}. Progress: {ex.progression}</Text>
                  </View>
                ))}
              </View>
            ))}
            <Text style={styles.item}>Nutrition focus: {w.nutritionFocus}</Text>
            <Text style={styles.item}>Habit: {w.habit.name} ({w.habit.trigger}). {w.habit.why}</Text>
            <Text style={styles.muted}>Checkpoint: {w.checkpoint}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Your nutrition plan</Text>
        {guide.nutritionPlan.principles.map((p, i) => (
          <Text key={i} style={styles.item}>- {p}</Text>
        ))}
        <Text style={styles.label}>A day on the plan</Text>
        <Text style={styles.item}>Breakfast: {guide.nutritionPlan.sampleDay.breakfast}</Text>
        <Text style={styles.item}>Lunch: {guide.nutritionPlan.sampleDay.lunch}</Text>
        <Text style={styles.item}>Dinner: {guide.nutritionPlan.sampleDay.dinner}</Text>
        <Text style={styles.item}>Snacks: {guide.nutritionPlan.sampleDay.snacks}</Text>
        <Text style={styles.label}>Swaps</Text>
        {guide.nutritionPlan.swaps.map((s, i) => (
          <Text key={i} style={styles.item}>{s.from} {">"} {s.to}</Text>
        ))}
        <Text style={styles.label}>Grocery staples</Text>
        <Text style={styles.item}>{guide.nutritionPlan.groceryStaples.join(", ")}</Text>

        <Text style={styles.h2}>Your daily blueprint</Text>
        {guide.dailyBlueprint.map((b, i) => (
          <Text key={i} style={styles.item}>{b.time}  {b.activity}</Text>
        ))}

        <Text style={styles.h2}>Sleep and stress recovery</Text>
        <Text style={styles.para}>{guide.sleepAndStress.summary}</Text>
        {guide.sleepAndStress.protocol.map((p, i) => (
          <Text key={i} style={styles.item}>- {p}</Text>
        ))}

        <Text style={styles.h2}>The 10-minute fallback</Text>
        <Text style={styles.para}>{guide.tenMinutePlan.summary}</Text>
        {guide.tenMinutePlan.movements.map((m, i) => (
          <Text key={i} style={styles.item}>- {m.name}: {m.detail}</Text>
        ))}

        <Text style={styles.h2}>When it gets hard</Text>
        {guide.troubleshooting.map((t, i) => (
          <View key={i}>
            <Text style={styles.item}>{t.problem}</Text>
            <Text style={styles.muted}>{t.fix}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Weekly recalibration</Text>
        <Text style={styles.para}>{guide.recalibration}</Text>
        <Text style={styles.para}>{guide.closing}</Text>
      </Page>
    </Document>
  );
}
