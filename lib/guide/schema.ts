import { z } from "zod";
import { DeepscanRecordSchema } from "@/lib/deepscan/schema";

// --- Guide building blocks ---

// The core "depth" unit, reused across the guide. Every major section walks the
// reader through: what is happening (problem), why it costs them (why), what
// changes when they fix it (whenFixed), and exactly what to do (actions).
export const DeepDiveSchema = z.object({
  heading: z.string().min(1),
  problem: z.string().min(1),
  why: z.string().min(1),
  whenFixed: z.string().min(1),
  actions: z.array(z.string().min(1)).min(2),
});

export const ExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.string().min(1),
  reps: z.string().min(1),
  rest: z.string().min(1),
  cues: z.string().min(1),
  progression: z.string().min(1),
});

export const WorkoutSchema = z.object({
  day: z.string().min(1),
  title: z.string().min(1),
  exercises: z.array(ExerciseSchema).min(1),
});

export const HabitSchema = z.object({
  name: z.string().min(1),
  trigger: z.string().min(1),
  why: z.string().min(1),
});

export const GuideWeekSchema = z.object({
  week: z.number().int().min(1).max(8),
  theme: z.string().min(1),
  focus: z.string().min(1),
  nutritionFocus: z.string().min(1),
  habit: HabitSchema,
  checkpoint: z.string().min(1),
});

export const SwapSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export const MovementSchema = z.object({
  name: z.string().min(1),
  detail: z.string().min(1),
});

export const SampleDaySchema = z.object({
  label: z.string().min(1),
  breakfast: z.string().min(1),
  lunch: z.string().min(1),
  dinner: z.string().min(1),
  snacks: z.string().min(1),
});

export const NutritionPlanSchema = z.object({
  philosophy: DeepDiveSchema,
  // "Build every plate like this" formula using hand-portion guidance.
  plateFormula: z.string().min(1),
  proteinTarget: z.string().min(1),
  hydration: z.string().min(1),
  // Goal-specific calibration cues (1-3 concrete nudges keyed to the user's goal).
  calibration: z.array(z.string().min(1)).min(1),
  principles: z.array(z.string().min(1)).min(1),
  sampleDays: z.array(SampleDaySchema).min(2),
  swaps: z.array(SwapSchema).min(1),
  groceryStaples: z.array(z.string().min(1)).min(1),
  eatingOut: z.array(z.string().min(1)).min(2),
});

export const TrainingPlanSchema = z.object({
  approach: DeepDiveSchema,
  workouts: z.array(WorkoutSchema).min(1),
  warmup: z.array(MovementSchema).min(2),
  progressionRules: z.array(z.string().min(1)).min(2),
  deload: z.string().min(1),
});

export const BlueprintBlockSchema = z.object({
  time: z.string().min(1),
  activity: z.string().min(1),
});

export const SleepStressSchema = z.object({
  briefing: DeepDiveSchema,
  protocol: z.array(z.string().min(1)).min(1),
});

export const TenMinutePlanSchema = z.object({
  summary: z.string().min(1),
  movements: z.array(MovementSchema).min(1),
});

export const DayActionSchema = z.object({
  day: z.string().min(1),
  action: z.string().min(1),
});

export const TroubleshootSchema = z.object({
  problem: z.string().min(1),
  fix: z.string().min(1),
});

export const FaqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const ProgressMarkersSchema = z.object({
  summary: z.string().min(1),
  markers: z.array(z.string().min(1)).min(3),
});

// --- Your Numbers dashboard ---

export const YourNumbersMetricSchema = z.object({
  label: z.string().min(1),
  // Framed as an estimate band, never as a measured personal data point.
  startingBand: z.string().min(1),
  target: z.string().min(1),
  how: z.string().min(1),
});

export const YourNumbersMilestoneSchema = z.object({
  week: z.string().min(1),
  marker: z.string().min(1),
});

export const YourNumbersSchema = z.object({
  summary: z.string().min(1),
  reclaimedYearsHeadline: z.string().min(1),
  metrics: z.array(YourNumbersMetricSchema).min(4),
  // Exactly 3 milestones: week 2, week 4, week 8.
  milestones: z.array(YourNumbersMilestoneSchema).length(3),
});

// --- Trackers (derived data for printable tracker templates) ---

export const GroceryAisleSchema = z.object({
  aisle: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const TrackersSchema = z.object({
  groceryByAisle: z.array(GroceryAisleSchema).min(1),
  dailyChecklist: z.array(z.string().min(1)).min(3),
});

// --- Exercise library (Layer B) ---

// Each entry covers one movement the plan can prescribe. Names must match
// exactly what build-guide.ts helper functions emit (lowerBody / pushEx / etc.)
// so that per-user selection finds them by exact string match.
export const ExerciseEntrySchema = z.object({
  name: z.string().min(1),
  pattern: z.string().min(1),   // e.g. "Squat" | "Push" | "Hinge" | "Pull" | "Core" | "Conditioning"
  targets: z.string().min(1),
  setup: z.array(z.string().min(1)).min(1),
  execution: z.array(z.string().min(1)).min(1),
  mistakes: z.array(z.string().min(1)).min(1),
  easier: z.string().min(1),
  harder: z.string().min(1),
  learn: z.string().min(1),
});

// --- Recipe bank (Layer A) ---

// Calories and proteinG are clearly ESTIMATES per serving, as noted in the
// recipe data and in any rendered copy.
export const RecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  meal: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  tags: z.array(z.string().min(1)).min(1),
  servings: z.number().int().positive(),
  timeMins: z.number().int().positive(),
  // Per-serving estimates.
  calories: z.number().int().positive(),
  proteinG: z.number().int().positive(),
  ingredients: z.array(z.string().min(1)).min(1),
  steps: z.array(z.string().min(1)).min(1),
  note: z.string().optional(),
});

export const RecipeBankSchema = z.object({
  // A personalised subset from the full library. Normal output is 16 recipes
  // (4 breakfast + 4 lunch + 5 dinner + 3 snack); min(8) is the validation
  // floor, not the expected output size.
  recipes: z.array(RecipeSchema).min(8),
  // Consolidated ingredient list from the selected recipes, aisle-grouped.
  shoppingList: z.array(GroceryAisleSchema).min(1),
});

// --- 90-day program arc (Layer D) ---

// One entry per phase of the 90-day program arc.
export const ProgramPhaseSchema = z.object({
  name: z.string().min(1),
  weeks: z.string().min(1),
  focus: z.string().min(1),
  whatChanges: z.string().min(1),
});

// One monthly review block. checkpoints describe what to measure/assess;
// adjustRules give concrete decision rules so the reader knows exactly what
// to do with the data.
export const MonthlyReviewSchema = z.object({
  month: z.string().min(1),
  checkpoints: z.array(z.string().min(1)).min(2),
  adjustRules: z.array(z.string().min(1)).min(2),
});

export const ProgramArcSchema = z.object({
  // 1-2 sentences framing the 90-day journey as a coherent transformation arc.
  summary: z.string().min(1),
  // At least 4 phases: Foundation, Build, Push, Maintenance.
  phases: z.array(ProgramPhaseSchema).min(4),
  // One review block per month; at least 3 to cover the full 90-day arc.
  monthlyReviews: z.array(MonthlyReviewSchema).min(3),
});

// --- Science & authority layer (Layer C) ---

// One entry per major modifiable lever. mechanism explains WHY the lever works
// at a physiology level a smart non-specialist can follow. evidence describes
// what the research broadly shows without fabricating specific citations.
export const ScienceEntrySchema = z.object({
  lever: z.string().min(1),
  mechanism: z.string().min(1),
  evidence: z.string().min(1),
});

export const ScienceNotesSchema = z.object({
  // 1-2 sentence framing lightly tied to the user's top risks.
  summary: z.string().min(1),
  // One line: general educational information, not medical advice.
  disclaimer: z.string().min(1),
  entries: z.array(ScienceEntrySchema).min(6),
});

export const GuideDocSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  yourSituation: z.string().min(1),
  strategy: z.string().min(1),
  // Personalized deep dives on the user's biggest modifiable risks.
  riskBriefings: z.array(DeepDiveSchema).min(3),
  training: TrainingPlanSchema,
  weeks: z.array(GuideWeekSchema).length(8),
  nutritionPlan: NutritionPlanSchema,
  dailyBlueprint: z.array(BlueprintBlockSchema).min(1),
  sleepAndStress: SleepStressSchema,
  tenMinutePlan: TenMinutePlanSchema,
  progressMarkers: ProgressMarkersSchema,
  next7Days: z.array(DayActionSchema).length(7),
  troubleshooting: z.array(TroubleshootSchema).min(1),
  faqs: z.array(FaqSchema).min(4),
  recalibration: z.string().min(1),
  outcomes: z.array(z.string().min(1)).min(1),
  closing: z.string().min(1),
  // Workbook additions (Layer 1).
  yourNumbers: YourNumbersSchema,
  // Exactly 4 bonus playbooks reusing the DeepDive shape.
  bonusModules: z.array(DeepDiveSchema).length(4),
  trackers: TrackersSchema,
  // Layer A: real recipe and meal bank, personalised by goal/diet/bodycomp.
  recipeBank: RecipeBankSchema,
  // Layer B: exercise library covering every movement the plan can prescribe.
  exerciseLibrary: z.array(ExerciseEntrySchema).min(1),
  // Layer C: science and authority layer with per-lever mechanism explanations.
  scienceNotes: ScienceNotesSchema,
  // Layer D: 90-day program arc with phase breakdown and monthly progress reviews.
  programArc: ProgramArcSchema,
  // The AI Deepscan, attached after the buyer completes the post-purchase
  // intake (lib/deepscan). Absent until they run it; one run per purchase.
  deepscan: DeepscanRecordSchema.optional(),
});

export type DeepDive = z.infer<typeof DeepDiveSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type Movement = z.infer<typeof MovementSchema>;
export type SampleDay = z.infer<typeof SampleDaySchema>;
export type GuideWeek = z.infer<typeof GuideWeekSchema>;
export type YourNumbersMetric = z.infer<typeof YourNumbersMetricSchema>;
export type YourNumbersMilestone = z.infer<typeof YourNumbersMilestoneSchema>;
export type YourNumbers = z.infer<typeof YourNumbersSchema>;
export type GroceryAisle = z.infer<typeof GroceryAisleSchema>;
export type Trackers = z.infer<typeof TrackersSchema>;
export type ExerciseEntry = z.infer<typeof ExerciseEntrySchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type RecipeBank = z.infer<typeof RecipeBankSchema>;
export type ScienceEntry = z.infer<typeof ScienceEntrySchema>;
export type ScienceNotes = z.infer<typeof ScienceNotesSchema>;
export type ProgramPhase = z.infer<typeof ProgramPhaseSchema>;
export type MonthlyReview = z.infer<typeof MonthlyReviewSchema>;
export type ProgramArc = z.infer<typeof ProgramArcSchema>;
export type GuideDoc = z.infer<typeof GuideDocSchema>;

// Validation for the raw scan answers carried into checkout / capture. Keys are
// question ids; values are strings, numbers, or string[] (multi-select). Age
// must be present. Bounded on every axis (key length, value length, array
// length, total keys) so this public sink cannot be used to store oversized
// JSONB: real answers are short option ids well within these caps.
export const AnswersSchema = z
  .record(
    z.string().max(40),
    z.union([
      z.string().max(80),
      z.number(),
      z.array(z.string().max(80)).max(20),
    ])
  )
  .refine((a) => Object.keys(a).length <= 40, { message: "too many answers" })
  .refine((a) => a.age !== undefined, { message: "age is required" });
