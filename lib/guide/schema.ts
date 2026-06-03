import { z } from "zod";

// --- Guide building blocks ---

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
  workouts: z.array(WorkoutSchema).min(1),
  nutritionFocus: z.string().min(1),
  habit: HabitSchema,
  checkpoint: z.string().min(1),
});

export const SwapSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export const NutritionPlanSchema = z.object({
  principles: z.array(z.string().min(1)).min(1),
  sampleDay: z.object({
    breakfast: z.string().min(1),
    lunch: z.string().min(1),
    dinner: z.string().min(1),
    snacks: z.string().min(1),
  }),
  swaps: z.array(SwapSchema).min(1),
  groceryStaples: z.array(z.string().min(1)).min(1),
});

export const BlueprintBlockSchema = z.object({
  time: z.string().min(1),
  activity: z.string().min(1),
});

export const SleepStressSchema = z.object({
  summary: z.string().min(1),
  protocol: z.array(z.string().min(1)).min(1),
});

export const MovementSchema = z.object({
  name: z.string().min(1),
  detail: z.string().min(1),
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

export const GuideDocSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  yourSituation: z.string().min(1),
  strategy: z.string().min(1),
  weeks: z.array(GuideWeekSchema).length(8),
  nutritionPlan: NutritionPlanSchema,
  dailyBlueprint: z.array(BlueprintBlockSchema).min(1),
  sleepAndStress: SleepStressSchema,
  tenMinutePlan: TenMinutePlanSchema,
  next7Days: z.array(DayActionSchema).length(7),
  troubleshooting: z.array(TroubleshootSchema).min(1),
  recalibration: z.string().min(1),
  outcomes: z.array(z.string().min(1)).min(1),
  closing: z.string().min(1),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type GuideWeek = z.infer<typeof GuideWeekSchema>;
export type GuideDoc = z.infer<typeof GuideDocSchema>;

// Loose validation for the raw scan answers carried into checkout. Keys are
// question ids; values are strings or numbers. Age must be present.
export const AnswersSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .refine((a) => a.age !== undefined, { message: "age is required" });
