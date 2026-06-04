import { z } from "zod";

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
});

export type DeepDive = z.infer<typeof DeepDiveSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type Movement = z.infer<typeof MovementSchema>;
export type SampleDay = z.infer<typeof SampleDaySchema>;
export type GuideWeek = z.infer<typeof GuideWeekSchema>;
export type YourNumbersMetric = z.infer<typeof YourNumbersMetricSchema>;
export type YourNumbers = z.infer<typeof YourNumbersSchema>;
export type GroceryAisle = z.infer<typeof GroceryAisleSchema>;
export type Trackers = z.infer<typeof TrackersSchema>;
export type GuideDoc = z.infer<typeof GuideDocSchema>;

// Loose validation for the raw scan answers carried into checkout. Keys are
// question ids; values are strings, numbers, or string[] (multi-select). Age
// must be present.
export const AnswersSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.array(z.string())]))
  .refine((a) => a.age !== undefined, { message: "age is required" });
