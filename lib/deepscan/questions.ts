// The AI Deepscan intake: a full second assessment taken AFTER purchase, on
// the guide page. 28 questions per buyer, organized into named sections and
// walked one at a time (wizard UX, like the main quiz). Unscored - they never
// touch the death-date estimate - they exist to feed the AI analysis.
// Branching is on the buyer's biological sex from the original scan answers.

import type { Answers } from "@/lib/longevity";
import { toValues } from "@/lib/longevity";

export interface DeepscanOption {
  value: string;
  label: string;
}

export interface DeepscanQuestion {
  id: string;
  /** Section label shown in the wizard header (e.g. "Heart and vitals"). */
  section: string;
  prompt: string;
  helper?: string;
  multi?: boolean;
  /** "exclusive" option value on multi questions (selecting it clears others). */
  exclusiveValue?: string;
  /** Restrict to one sex (reads the scan's `sex` answer). Omit = everyone. */
  sex?: "male" | "female";
  options: DeepscanOption[];
}

const BODY = "Body composition";
const VITALS = "Heart and vitals";
const FUEL = "Fueling";
const RECOVERY = "Recovery and sleep";
const MIND = "Stress and mind";
const MOVEMENT = "Movement";
const MEDICAL = "Hormones and medical";

export const DEEPSCAN_QUESTIONS: DeepscanQuestion[] = [
  // ── Body composition ─────────────────────────────────────────────────────
  {
    id: "ds_waist_m",
    section: BODY,
    prompt: "Where does your waist measure, at the belly button?",
    helper: "Waist size predicts metabolic risk better than weight does. Estimate from your pant size if you have to.",
    sex: "male",
    options: [
      { value: "low", label: "Under 35 inches" },
      { value: "mid", label: "35 to 40 inches" },
      { value: "high", label: "Over 40 inches" },
      { value: "unknown", label: "Not sure" },
    ],
  },
  {
    id: "ds_waist_f",
    section: BODY,
    prompt: "Where does your waist measure, at the belly button?",
    helper: "Waist size predicts metabolic risk better than weight does. Estimate from your pant size if you have to.",
    sex: "female",
    options: [
      { value: "low", label: "Under 31 inches" },
      { value: "mid", label: "31 to 35 inches" },
      { value: "high", label: "Over 35 inches" },
      { value: "unknown", label: "Not sure" },
    ],
  },
  {
    id: "ds_weight_trend",
    section: BODY,
    prompt: "Over the last 5 years, your weight has...",
    options: [
      { value: "steady", label: "Stayed steady or dropped" },
      { value: "creep", label: "Crept up slowly, 5 to 15 lbs" },
      { value: "jump", label: "Jumped up, 15 lbs or more" },
      { value: "swing", label: "Swung up and down" },
    ],
  },
  {
    id: "ds_strength",
    section: BODY,
    prompt: "Could you carry two heavy grocery bags up three flights of stairs without stopping?",
    helper: "Functional strength is one of the most honest markers you can self-test.",
    options: [
      { value: "easy", label: "Easily" },
      { value: "slow", label: "Probably, but slowly" },
      { value: "doubt", label: "I doubt it" },
      { value: "no", label: "No chance" },
    ],
  },
  {
    id: "ds_mobility",
    section: BODY,
    prompt: "Standing with straight legs, how close can you get to touching your toes?",
    options: [
      { value: "full", label: "Palms or fingers to the floor" },
      { value: "close", label: "Within a few inches" },
      { value: "far", label: "Not even close" },
    ],
  },

  // ── Heart and vitals ─────────────────────────────────────────────────────
  {
    id: "ds_rhr",
    section: VITALS,
    prompt: "What is your resting heart rate?",
    helper: "Check your watch or count your pulse for 30 seconds while sitting still, then double it.",
    options: [
      { value: "under60", label: "Under 60 bpm" },
      { value: "60to70", label: "60 to 70 bpm" },
      { value: "70to80", label: "70 to 80 bpm" },
      { value: "over80", label: "Over 80 bpm" },
      { value: "unknown", label: "I do not know" },
    ],
  },
  {
    id: "ds_bp",
    section: VITALS,
    prompt: "The last time your blood pressure was checked, it was...",
    options: [
      { value: "normal", label: "Normal" },
      { value: "borderline", label: "Borderline or elevated" },
      { value: "high", label: "High" },
      { value: "unknown", label: "It has not been checked in years" },
    ],
  },
  {
    id: "ds_stairs",
    section: VITALS,
    prompt: "After two flights of stairs at a normal pace, you are...",
    options: [
      { value: "fine", label: "Barely aware of it" },
      { value: "harder", label: "Breathing harder, but fine" },
      { value: "winded", label: "Properly winded" },
      { value: "avoid", label: "I avoid stairs when I can" },
    ],
  },
  {
    id: "ds_bloodwork",
    section: VITALS,
    prompt: "When was your last full blood panel?",
    helper: "Cholesterol, blood sugar, the standard workup from a doctor.",
    options: [
      { value: "recent", label: "Within the last year" },
      { value: "while", label: "1 to 3 years ago" },
      { value: "long", label: "Longer than that" },
      { value: "never", label: "Never had one" },
    ],
  },

  // ── Fueling ──────────────────────────────────────────────────────────────
  {
    id: "ds_protein",
    section: FUEL,
    prompt: "How often does a meal include a real serving of protein?",
    helper: "A palm-sized portion of meat, fish, eggs, or the plant equivalent.",
    options: [
      { value: "most", label: "Almost every meal" },
      { value: "daily", label: "About once a day" },
      { value: "rare", label: "Rarely" },
      { value: "unknown", label: "I have no idea" },
    ],
  },
  {
    id: "ds_veg",
    section: FUEL,
    prompt: "Servings of vegetables or fruit on a normal day?",
    options: [
      { value: "high", label: "4 or more" },
      { value: "mid", label: "2 to 3" },
      { value: "low", label: "Maybe 1" },
      { value: "none", label: "Most days, none" },
    ],
  },
  {
    id: "ds_sugar",
    section: FUEL,
    prompt: "Sugary drinks on a normal day?",
    helper: "Soda, sweetened coffee drinks, juice, energy drinks.",
    options: [
      { value: "none", label: "None" },
      { value: "one", label: "One" },
      { value: "few", label: "2 to 3" },
      { value: "heavy", label: "4 or more" },
    ],
  },
  {
    id: "ds_latenight",
    section: FUEL,
    prompt: "How often do you eat within 2 hours of going to bed?",
    options: [
      { value: "rare", label: "Rarely" },
      { value: "some", label: "A few nights a week" },
      { value: "most", label: "Most nights" },
    ],
  },
  {
    id: "ds_water",
    section: FUEL,
    prompt: "How much plain water do you actually drink a day?",
    options: [
      { value: "low", label: "A glass or two" },
      { value: "mid", label: "4 to 7 glasses" },
      { value: "high", label: "8 or more" },
    ],
  },
  {
    id: "ds_caffeine",
    section: FUEL,
    prompt: "How much caffeine on a normal day?",
    helper: "Coffee, energy drinks, and pre-workout all count.",
    options: [
      { value: "none", label: "None" },
      { value: "light", label: "1 to 2 cups" },
      { value: "moderate", label: "3 to 4 cups" },
      { value: "heavy", label: "5 or more" },
    ],
  },

  // ── Recovery and sleep ───────────────────────────────────────────────────
  {
    id: "ds_sleep_schedule",
    section: RECOVERY,
    prompt: "Your bed and wake times are...",
    helper: "Consistency matters almost as much as duration.",
    options: [
      { value: "consistent", label: "About the same every day" },
      { value: "weekend", label: "Consistent on weekdays, off on weekends" },
      { value: "chaos", label: "All over the place" },
    ],
  },
  {
    id: "ds_screens",
    section: RECOVERY,
    prompt: "The last 30 minutes before sleep usually involve a screen?",
    options: [
      { value: "rare", label: "Rarely" },
      { value: "most", label: "Most nights" },
      { value: "always", label: "Every night, I fall asleep to one" },
    ],
  },
  {
    id: "ds_wake",
    section: RECOVERY,
    prompt: "How do you wake up most mornings?",
    options: [
      { value: "fresh", label: "Refreshed and ready" },
      { value: "groggy", label: "Groggy, fine within an hour" },
      { value: "tired", label: "Tired until midday" },
      { value: "exhausted", label: "Exhausted, no matter how long I slept" },
    ],
  },
  {
    id: "ds_energy",
    section: RECOVERY,
    prompt: "Which best describes your energy through the day?",
    options: [
      { value: "steady", label: "Steady from morning to night" },
      { value: "crash", label: "Fine until the afternoon crash" },
      { value: "wired", label: "Wired at night, dead in the morning" },
      { value: "drained", label: "Dragging pretty much all day" },
    ],
  },

  // ── Stress and mind ──────────────────────────────────────────────────────
  {
    id: "ds_workload",
    section: MIND,
    prompt: "Hours worked in a normal week?",
    options: [
      { value: "light", label: "Under 40" },
      { value: "standard", label: "40 to 50" },
      { value: "heavy", label: "50 to 60" },
      { value: "extreme", label: "More than 60" },
    ],
  },
  {
    id: "ds_downtime",
    section: MIND,
    prompt: "Real downtime, with nothing you have to do, per week?",
    options: [
      { value: "plenty", label: "Most evenings and weekends" },
      { value: "some", label: "A few hours" },
      { value: "none", label: "Almost none" },
    ],
  },
  {
    id: "ds_racing",
    section: MIND,
    prompt: "When you try to switch off at night, your mind...",
    options: [
      { value: "quiet", label: "Goes quiet" },
      { value: "some", label: "Races some nights" },
      { value: "most", label: "Races most nights" },
    ],
  },

  // ── Movement ─────────────────────────────────────────────────────────────
  {
    id: "ds_sitting",
    section: MOVEMENT,
    prompt: "How many hours a day are you sitting?",
    helper: "Desk, car, couch. Add it all up.",
    options: [
      { value: "low", label: "Under 4 hours" },
      { value: "mid", label: "4 to 8 hours" },
      { value: "high", label: "8 to 11 hours" },
      { value: "extreme", label: "More than 11 hours" },
    ],
  },
  {
    id: "ds_steps",
    section: MOVEMENT,
    prompt: "Outside of workouts, a normal day has you...",
    options: [
      { value: "active", label: "On your feet most of the day" },
      { value: "walking", label: "Getting decent walking in" },
      { value: "desk", label: "Mostly at a desk and in the car" },
      { value: "still", label: "Barely leaving the chair" },
    ],
  },
  {
    id: "ds_pain",
    section: MOVEMENT,
    prompt: "Any joints that regularly ache or limit you?",
    helper: "Check all that apply. The plan routes around them.",
    multi: true,
    exclusiveValue: "none",
    options: [
      { value: "knees", label: "Knees" },
      { value: "back", label: "Lower back" },
      { value: "shoulders", label: "Shoulders or neck" },
      { value: "none", label: "Nothing regular" },
    ],
  },

  // ── Hormones and medical ─────────────────────────────────────────────────
  {
    id: "ds_hormone_m",
    section: MEDICAL,
    prompt: "Compared to a year ago, your morning energy and drive are...",
    helper: "Morning energy tracks testosterone output more honestly than anything else you can self-report.",
    sex: "male",
    options: [
      { value: "same", label: "The same or better" },
      { value: "down", label: "Slightly down" },
      { value: "low", label: "Clearly down" },
    ],
  },
  {
    id: "ds_hormone_f",
    section: MEDICAL,
    prompt: "Any of these over the last few months?",
    helper: "Check all that apply. These shape how the plan handles recovery and training intensity.",
    multi: true,
    exclusiveValue: "none",
    sex: "female",
    options: [
      { value: "flashes", label: "Hot flashes or night sweats" },
      { value: "sleep", label: "Sleep that breaks up at night" },
      { value: "mood", label: "Mood swings" },
      { value: "cycle", label: "Irregular cycles" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "ds_digestion",
    section: MEDICAL,
    prompt: "Any of these after eating, more weeks than not?",
    helper: "Check all that apply.",
    multi: true,
    exclusiveValue: "none",
    options: [
      { value: "bloat", label: "Bloating" },
      { value: "reflux", label: "Reflux or heartburn" },
      { value: "irregular", label: "Irregular digestion" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "ds_meds",
    section: MEDICAL,
    prompt: "How many daily prescription medications are you on?",
    options: [
      { value: "none", label: "None" },
      { value: "one", label: "One" },
      { value: "multi", label: "Two or more" },
    ],
  },
  {
    id: "ds_supplements",
    section: MEDICAL,
    prompt: "What does your supplement shelf look like?",
    options: [
      { value: "none", label: "Empty" },
      { value: "basic", label: "A multivitamin, maybe vitamin D" },
      { value: "targeted", label: "A few targeted ones" },
      { value: "full", label: "A full shelf of them" },
    ],
  },
];

/** The questions this buyer should see, given their scan answers (sex branch). */
export function getDeepscanQuestions(scanAnswers: Answers): DeepscanQuestion[] {
  const sex = scanAnswers.sex === "male" ? "male" : "female";
  return DEEPSCAN_QUESTIONS.filter((q) => !q.sex || q.sex === sex);
}

/** The ordered, unique section names for a buyer's question set. */
export function deepscanSections(scanAnswers: Answers): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of getDeepscanQuestions(scanAnswers)) {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      out.push(q.section);
    }
  }
  return out;
}

/** Label for a selected option (falls back to the raw value). */
export function deepscanLabel(questionId: string, value: string): string {
  const q = DEEPSCAN_QUESTIONS.find((x) => x.id === questionId);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}

/** True when every active question has a valid answer (and nothing extra). */
export function validateDeepscanAnswers(
  scanAnswers: Answers,
  deep: Record<string, string | string[]>
): boolean {
  const active = getDeepscanQuestions(scanAnswers);
  const activeIds = new Set(active.map((q) => q.id));
  for (const key of Object.keys(deep)) {
    if (!activeIds.has(key)) return false;
  }
  for (const q of active) {
    const values = toValues(deep[q.id]);
    if (values.length === 0) return false;
    if (!q.multi && values.length > 1) return false;
    if (!values.every((v) => q.options.some((o) => o.value === v))) return false;
  }
  return true;
}
