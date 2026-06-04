/**
 * recipe-book-pdf.tsx
 *
 * Standalone recipe book PDF for the Second Wind Protocol.
 * Contains every recipe in the user's recipe bank, grouped by meal type,
 * plus the full aisle-grouped shopping list.
 *
 * HARD CONSTRAINT: do NOT add `fixed` to any element.
 * @react-pdf 4.x throws "unsupported number" across many auto-broken pages
 * whenever a `fixed` element exists, which 500s the PDF routes.
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GuideDoc } from "@/lib/guide/schema";
import {
  SANS,
  C,
  trackerStyles,
  coverStyles,
  RecipeCard,
} from "@/components/guide/pdf-shared";

/* ─── Brand ──────────────────────────────────────────────────────────────────── */
const BRAND = "LONGEVITY SCAN";

/* ─── Meal order ─────────────────────────────────────────────────────────────── */
const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

/* ─── StyleSheet ─────────────────────────────────────────────────────────────── */
// Cover and section-header styles live in coverStyles (pdf-shared.tsx).
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
});

/* ─── Document ───────────────────────────────────────────────────────────────── */

export function RecipeBookPdfDocument({ guide }: { guide: GuideDoc }) {
  const bank = guide.recipeBank;

  return (
    <Document
      title="Second Wind Protocol - Recipe Book"
      author={BRAND}
      subject="Your personalized recipe book from the Second Wind Protocol"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Cover ─────────────────────────────────────────────────────────── */}
        <View style={coverStyles.coverMark}>
          <View style={coverStyles.coverDot} />
          <Text style={coverStyles.coverMarkText}>{BRAND}</Text>
        </View>
        <Text style={coverStyles.coverKicker}>Recipe book</Text>
        <Text style={coverStyles.coverTitle}>Second Wind Protocol Recipe Book</Text>
        <Text style={coverStyles.coverIntro}>
          High-protein, whole-food recipes selected for your goal and dietary preferences.
          Every recipe includes estimated macros per serving to keep your nutrition on track.
        </Text>
        <View style={coverStyles.coverRule} />
        <Text style={coverStyles.coverNote}>
          Calorie and protein figures are per-serving estimates. Actual values vary with
          ingredients and portion sizes. Not medical or dietary advice.
        </Text>

        {/* ── Recipes grouped by meal ───────────────────────────────────────── */}
        {MEAL_ORDER.map((meal) => {
          const recipes = bank.recipes.filter((r) => r.meal === meal);
          if (recipes.length === 0) return null;
          return (
            <View key={meal} break>
              <View style={coverStyles.sectionHead}>
                <Text style={coverStyles.sectionTitle}>{MEAL_LABEL[meal]}</Text>
                <View style={coverStyles.sectionLine} />
              </View>
              {recipes.map((recipe, i) => (
                <RecipeCard key={i} recipe={recipe} />
              ))}
            </View>
          );
        })}

        {/* ── Shopping list ─────────────────────────────────────────────────── */}
        <View break>
          <View style={coverStyles.sectionHead}>
            <Text style={coverStyles.sectionTitle}>Shopping list</Text>
            <View style={coverStyles.sectionLine} />
          </View>
          <Text style={coverStyles.muted}>
            All ingredients across your recipes, grouped by supermarket aisle.
            Print and bring to the store.
          </Text>
          {bank.shoppingList.map((aisle, ai) => (
            // wrap={false} keeps each aisle group on one page.
            // Safe because aisles hold a bounded number of items (a few to ~15).
            // If an aisle ever grows very large, remove wrap={false} here to allow it to split.
            <View key={ai} wrap={false}>
              <Text style={trackerStyles.aisleHeader}>{aisle.aisle}</Text>
              {aisle.items.map((item, ii) => (
                <View key={ii} style={trackerStyles.checkRow}>
                  <Text style={trackerStyles.checkBox}>[  ]</Text>
                  <Text style={trackerStyles.checkLabel}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
