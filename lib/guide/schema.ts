import { z } from "zod";

export const GuideWeekSchema = z.object({
  week: z.number().int().min(1).max(8),
  focus: z.string().min(1),
  sessions: z.array(z.string().min(1)).min(1),
  note: z.string().min(1),
});

export const GuideDocSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  goalFocus: z.string().min(1),
  weeks: z.array(GuideWeekSchema).length(8),
  nutritionReset: z.object({
    summary: z.string().min(1),
    eatList: z.array(z.string().min(1)).min(1),
    rhythm: z.array(z.string().min(1)).min(1),
  }),
  sleepStress: z.object({
    summary: z.string().min(1),
    practices: z.array(z.string().min(1)).min(1),
  }),
  dailyTenMinute: z.object({
    summary: z.string().min(1),
    movements: z.array(z.string().min(1)).min(1),
  }),
  recalibration: z.string().min(1),
  outcomes: z.array(z.string().min(1)).min(1),
});

export type GuideWeek = z.infer<typeof GuideWeekSchema>;
export type GuideDoc = z.infer<typeof GuideDocSchema>;

// Loose validation for the raw scan answers carried into checkout. Keys are
// question ids; values are strings or numbers. Age must be present.
export const AnswersSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .refine((a) => a.age !== undefined, { message: "age is required" });
