import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GuideDoc } from "@/lib/guide/schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#0b1417", lineHeight: 1.5 },
  h1: { fontSize: 22, marginBottom: 8 },
  h2: { fontSize: 13, marginTop: 18, marginBottom: 6, color: "#0a8f7d" },
  intro: { marginBottom: 8, color: "#3a4a4f" },
  weekTitle: { fontSize: 12, marginTop: 8 },
  item: { marginBottom: 2 },
});

export function GuidePdfDocument({ guide }: { guide: GuideDoc }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{guide.title}</Text>
        <Text style={styles.intro}>{guide.intro}</Text>

        <Text style={styles.h2}>What these 8 weeks deliver</Text>
        {guide.outcomes.map((o, i) => (
          <Text key={i} style={styles.item}>- {o}</Text>
        ))}

        <Text style={styles.h2}>Your 8-week plan</Text>
        {guide.weeks.map((w) => (
          <View key={w.week} wrap={false}>
            <Text style={styles.weekTitle}>{w.focus}</Text>
            {w.sessions.map((s, i) => (
              <Text key={i} style={styles.item}>- {s}</Text>
            ))}
            <Text style={styles.item}>{w.note}</Text>
          </View>
        ))}

        <Text style={styles.h2}>The metabolic reset</Text>
        <Text style={styles.item}>{guide.nutritionReset.summary}</Text>
        {[...guide.nutritionReset.eatList, ...guide.nutritionReset.rhythm].map((x, i) => (
          <Text key={i} style={styles.item}>- {x}</Text>
        ))}

        <Text style={styles.h2}>Sleep and stress recovery</Text>
        <Text style={styles.item}>{guide.sleepStress.summary}</Text>
        {guide.sleepStress.practices.map((x, i) => (
          <Text key={i} style={styles.item}>- {x}</Text>
        ))}

        <Text style={styles.h2}>The 10-minute daily routine</Text>
        <Text style={styles.item}>{guide.dailyTenMinute.summary}</Text>
        {guide.dailyTenMinute.movements.map((x, i) => (
          <Text key={i} style={styles.item}>- {x}</Text>
        ))}

        <Text style={styles.h2}>Weekly recalibration</Text>
        <Text style={styles.item}>{guide.recalibration}</Text>
      </Page>
    </Document>
  );
}
