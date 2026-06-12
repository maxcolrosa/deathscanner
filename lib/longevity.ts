// Deterministic, offline longevity model for the Vivrun parody.
// Presented to users as an "AI longevity model". Under the hood it is a
// transparent, deterministic actuarial-style estimate: no network, no
// randomness. Same inputs + same `today` => same output.
//
// Factor weights are decimals loosely grounded in real epidemiology so the
// estimate reads as credible. The quiz supports conditional follow-up questions
// (branching), multi-select questions (single + scored), and an unscored goal
// question, which drive a personalized, results-based pitch downstream.

export type QuestionKind = "age" | "choice";

/** A single answer value. Multi-select questions store a string[]. */
export type AnswerValue = string | number | string[];

export interface QuizOption {
  value: string;
  /** The answer the user picks (clinical, plain language). */
  label: string;
  /** Years added (positive) or subtracted (negative) from the baseline. */
  yearsDelta: number;
  /** One-line clinical rationale (used for the report's driver explanations). */
  detail: string;
  /** On a multi-select question, selecting this clears all other options
   *  (and vice versa). Used for the "None of these" choice. */
  exclusive?: boolean;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  /** Informational subtext that makes the question feel like a real assessment. */
  helper?: string;
  /** Topic label used in the report breakdown (e.g. "Tobacco use"). */
  category: string;
  /** Whether losses from this factor are modifiable (reversible via the guide). */
  recoverable: boolean;
  /** If false, the answer is collected for personalization but never scored. */
  scored?: boolean;
  /** Allow selecting more than one option. Each selection is scored. */
  multi?: boolean;
  /** Conditional display: only shown when this returns true for current answers. */
  showIf?: (answers: Answers) => boolean;
  /** Present when kind === "choice". */
  options?: QuizOption[];
  /** Present when kind === "age". */
  min?: number;
  max?: number;
}

export type Answers = Record<string, AnswerValue>;

export interface RiskFactor {
  id: string;
  category: string;
  /** The user's selected answer. */
  answerLabel: string;
  deltaYears: number;
  recoverable: boolean;
  detail: string;
  /** Qualitative impact band derived from the magnitude of deltaYears. */
  impact: "high" | "moderate" | "minor";
}

export interface Outcome {
  id: string;
  label: string;
}

export interface ScanResult {
  currentAge: number;
  baseLifeExpectancy: number;
  /** Final estimate, one decimal. */
  lifeExpectancy: number;
  ageAtDeath: number;
  predictedDeathDate: Date;
  /** Population average for the user's age and sex (the anchor for "X under average"). */
  averageLifeExpectancy: number;
  /** Signed difference vs. average. Negative = below average. */
  yearsVsAverage: number;
  totalDelta: number;
  factors: RiskFactor[];
  /** Years the user could add back by fixing every modifiable factor (capped, believable). */
  recoverableYears: number;
  /** Biggest modifiable losses, worst first (max 3). */
  topRisks: RiskFactor[];
  /** Strongest protective factors, best first (max 2). */
  strengths: RiskFactor[];
  /** Concrete, results-based outcomes derived from the answers (max 4). */
  outcomes: Outcome[];
  /** The user's stated primary goal, if answered. */
  primaryGoal: string | null;
  /** Deterministic per-user "model confidence" for display (90 to 97). */
  modelConfidence: number;
}

export const BASE_LIFE_EXPECTANCY = 79;
export const MIN_AGE = 18;
export const MAX_AGE = 99;
export const MAX_LIFE_EXPECTANCY = 102;

// Negative factors are summed then passed through a diminishing-returns curve so
// that a profile where everything is bad does not stack linearly into an
// implausibly early death. The penalty asymptotically approaches NEG_CAP.
const NEG_CAP = 22;
const NEG_SCALE = 18;

// Recoverable years are framed as "what you could add back". Because the loss
// curve compresses, the raw gap to a fully-optimized profile can be large, so we
// pass it through its own believable curve and floor it for anyone with real
// modifiable risk (so the headline reads 9+ for typical users) while staying 0
// for someone already optimal.
const REC_CAP = 15;
const REC_SCALE = 9;
const REC_FLOOR = 9;
const REC_FLOOR_THRESHOLD = 3;

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "age",
    kind: "age",
    prompt: "How old are you?",
    helper: "Sets the starting point for your survival curve.",
    category: "Age",
    recoverable: false,
    min: MIN_AGE,
    max: MAX_AGE,
  },
  {
    id: "sex",
    kind: "choice",
    prompt: "What is your biological sex?",
    helper: "Baseline life expectancy is measurably different by sex.",
    category: "Biological sex",
    recoverable: false,
    options: [
      { value: "female", label: "Female", yearsDelta: 2.4, detail: "Women start with a higher baseline life expectancy." },
      { value: "male", label: "Male", yearsDelta: -2.4, detail: "Men start with a lower baseline life expectancy." },
    ],
  },
  {
    id: "bodycomp",
    kind: "choice",
    prompt: "Which of these best matches your body right now?",
    helper: "Go by how your clothes fit and what you see in the mirror, not a number on a scale.",
    category: "Body composition",
    recoverable: true,
    options: [
      { value: "lean", label: "Lean and in shape", yearsDelta: 1.6, detail: "Low body fat and real muscle cut your heart and metabolic risk." },
      { value: "healthy", label: "Pretty average", yearsDelta: 0.8, detail: "A normal weight range works in your favor." },
      { value: "over", label: "Carrying some extra weight", yearsDelta: -1.9, detail: "Extra body fat puts more load on your heart and metabolism." },
      { value: "obese", label: "A lot of extra weight", yearsDelta: -4.6, detail: "Heavy excess weight is tied to diabetes, high blood pressure, and a shorter life." },
    ],
  },
  {
    id: "activity",
    kind: "choice",
    prompt: "In a normal week, how often do you train hard enough to sweat or get out of breath?",
    helper: "Count workouts that raise your heart rate: lifting, running, hard cardio, or sports. Walking the dog does not count.",
    category: "Physical activity",
    recoverable: true,
    options: [
      { value: "none", label: "Pretty much never", yearsDelta: -3.9, detail: "Sitting all day hits your lifespan about as hard as smoking does." },
      { value: "light", label: "Once or twice a week", yearsDelta: -1.2, detail: "A little movement helps, but it is not enough to move the needle." },
      { value: "moderate", label: "3 to 4 days a week", yearsDelta: 1.8, detail: "This hits the activity level tied to a longer life." },
      { value: "high", label: "5 or more days a week", yearsDelta: 3.2, detail: "High fitness is one of the strongest signs of a long life." },
    ],
  },
  {
    // Branching follow-up: only when activity is low. Multi-select so we can
    // build the plan around every real barrier (unscored personalization).
    id: "activity_barrier",
    kind: "choice",
    prompt: "What actually gets in the way of working out?",
    helper: "Check all that apply. We build your plan around these.",
    category: "Training barrier",
    recoverable: false,
    scored: false,
    multi: true,
    showIf: (a) => a.activity === "none" || a.activity === "light",
    options: [
      { value: "time", label: "I never have the time", yearsDelta: 0, detail: "Short, time-efficient workouts." },
      { value: "motivation", label: "I cannot stay motivated", yearsDelta: 0, detail: "Built-in accountability and momentum." },
      { value: "injury", label: "An old injury or pain", yearsDelta: 0, detail: "Low-impact, joint-friendly progressions." },
      { value: "howto", label: "I never learned how", yearsDelta: 0, detail: "A guided, step-by-step start." },
    ],
  },
  {
    id: "diet",
    kind: "choice",
    prompt: "On a normal day, what does most of your food look like?",
    helper: "Picture a typical weekday, not a holiday: drive-thru and soda, or real food you cooked yourself.",
    category: "Diet quality",
    recoverable: true,
    options: [
      { value: "poor", label: "Mostly fast food and takeout", yearsDelta: -3.4, detail: "A diet heavy on processed food fuels inflammation and metabolic disease." },
      { value: "average", label: "Half real food, half junk", yearsDelta: -0.6, detail: "An average diet still leaves real risk on the table." },
      { value: "good", label: "Mostly real, whole food", yearsDelta: 1.6, detail: "Eating mostly whole food lowers your heart and metabolic risk." },
      { value: "excellent", label: "Clean, low sugar, lots of veggies", yearsDelta: 2.7, detail: "Eating this way is tied again and again to a longer life." },
    ],
  },
  {
    id: "alcohol",
    kind: "choice",
    prompt: "In a normal week, how much alcohol do you drink?",
    helper: "One drink means a beer, a glass of wine, or a single shot. Add up a typical week.",
    category: "Alcohol intake",
    recoverable: true,
    options: [
      { value: "none", label: "I do not drink", yearsDelta: 0.4, detail: "Skipping alcohol skips the liver and heart risk that comes with it." },
      { value: "light", label: "A few drinks a week", yearsDelta: -0.4, detail: "A few drinks a week carries a small but real cost." },
      { value: "moderate", label: "Most days", yearsDelta: -3.2, detail: "Drinking most days raises your liver, heart, and cancer risk." },
      { value: "heavy", label: "A lot, most days", yearsDelta: -6.1, detail: "Heavy drinking sharply raises your risk of dying across the board." },
    ],
  },
  {
    id: "smoking",
    kind: "choice",
    prompt: "Do you currently smoke or vape?",
    helper: "Cigarettes, vapes, or other tobacco. This is the single most studied habit for how long you live.",
    category: "Tobacco use",
    recoverable: true,
    options: [
      { value: "never", label: "Never have", yearsDelta: 0.4, detail: "Never smoking keeps your lungs and blood vessels at full strength." },
      { value: "former", label: "Quit over a year ago", yearsDelta: -1.2, detail: "Risk drops fast after you quit, but it does not fully reset." },
      { value: "light", label: "Once in a while", yearsDelta: -3.5, detail: "Even once in a while raises your heart and cancer risk." },
      { value: "heavy", label: "Every day, half a pack or more", yearsDelta: -9.2, detail: "Heavy smoking is the single biggest chunk of years you can win back." },
    ],
  },
  {
    // Branching follow-up: only relevant if they use tobacco at all.
    id: "smoking_years",
    kind: "choice",
    prompt: "In total, how many years have you smoked or vaped?",
    helper: "Add up all the years you have used it, even if you had breaks. The longer it ran, the more it stacks up.",
    category: "Tobacco exposure",
    recoverable: true,
    showIf: (a) => typeof a.smoking === "string" && a.smoking !== "never",
    options: [
      { value: "under5", label: "Less than 5 years", yearsDelta: -0.4, detail: "Less time smoking means more of the damage can still be undone." },
      { value: "5to15", label: "5 to 15 years", yearsDelta: -1.3, detail: "Years of smoking have started to stack up real risk." },
      { value: "over15", label: "More than 15 years", yearsDelta: -2.4, detail: "Decades of smoking pile up damage to your heart and lungs." },
    ],
  },
  {
    id: "sleep",
    kind: "choice",
    prompt: "On a normal night, how many hours do you actually sleep?",
    helper: "Time asleep, not time in bed. Both too little and too much work against you.",
    category: "Sleep",
    recoverable: true,
    options: [
      { value: "low", label: "Less than 5 hours", yearsDelta: -3.1, detail: "Running on too little sleep raises your heart and metabolic risk." },
      { value: "belowavg", label: "5 to 6 hours", yearsDelta: -1.3, detail: "A little short on sleep adds up over the years." },
      { value: "optimal", label: "7 to 8 hours", yearsDelta: 1.3, detail: "The sweet spot for your heart and immune system." },
      { value: "high", label: "More than 9 hours", yearsDelta: -0.9, detail: "Always needing 9-plus hours can be a sign something else is off." },
    ],
  },
  {
    id: "stress",
    kind: "choice",
    prompt: "Thinking about the last month, how stressed have you felt most days?",
    helper: "Go by a normal month, not your single worst week. Long-term stress wears on your heart and immune system.",
    category: "Chronic stress",
    recoverable: true,
    options: [
      { value: "low", label: "Low, I have got a handle on it", yearsDelta: 1.0, detail: "Low ongoing stress is good for your heart." },
      { value: "moderate", label: "Manageable most days", yearsDelta: -0.5, detail: "A moderate stress load carries a small steady cost." },
      { value: "high", label: "High a lot of the time", yearsDelta: -1.8, detail: "High stress keeps cortisol up and strains your heart." },
      { value: "severe", label: "Constant, and I never recover", yearsDelta: -3.1, detail: "Nonstop stress with no recovery is tied to a real rise in mortality." },
    ],
  },
  {
    // Multi-select, scored: each diagnosed condition adds its own weighted risk
    // through the same dampening curve. "None diagnosed" is exclusive.
    id: "conditions",
    kind: "choice",
    prompt: "Has a doctor ever diagnosed you with any of these?",
    helper: "Check all that apply, even if it is managed with medication. These are common, and most can be turned around.",
    category: "Diagnosed conditions",
    recoverable: true,
    multi: true,
    options: [
      { value: "highbp", label: "High blood pressure", yearsDelta: -2.2, detail: "High blood pressure quietly wears on your heart and arteries." },
      { value: "cholesterol", label: "High cholesterol", yearsDelta: -1.8, detail: "High cholesterol speeds up plaque building in your arteries." },
      { value: "prediabetes", label: "Type 2 or pre-diabetes", yearsDelta: -3.0, detail: "Blood sugar that runs high slowly damages your blood vessels." },
      { value: "none", label: "None of these", yearsDelta: 0.8, detail: "No diagnosed heart or metabolic conditions.", exclusive: true },
    ],
  },
  {
    // Branching, female only: hormonal stage. Estrogen status genuinely shifts
    // cardiovascular and bone risk, so this is scored (small, fixed weights).
    id: "hormonal_female",
    kind: "choice",
    prompt: "Which best describes your hormonal stage right now?",
    helper: "Estrogen protects your heart and bones. As it declines, your risk profile shifts, and the right plan shifts with it.",
    category: "Hormonal stage",
    recoverable: false,
    showIf: (a) => a.sex === "female",
    options: [
      { value: "pre", label: "Regular cycles", yearsDelta: 0.4, detail: "Estrogen is still protecting your heart and bones." },
      { value: "peri", label: "Perimenopause, things are changing", yearsDelta: -0.5, detail: "The hormonal transition starts shifting heart and bone risk." },
      { value: "post", label: "Post-menopause", yearsDelta: -1.1, detail: "After menopause, heart and bone risk climb faster without countermeasures." },
      { value: "unsure", label: "Not sure", yearsDelta: 0, detail: "Hormonal stage unconfirmed." },
    ],
  },
  {
    // Branching, male only: testosterone-pattern symptoms. Multi-select and
    // recoverable: training, sleep, and body composition genuinely move these.
    id: "hormonal_male",
    kind: "choice",
    prompt: "Over the last year, have you noticed any of these?",
    helper: "Check all that apply. Falling testosterone shows up as lost drive, lost strength, and slow recovery, and most of it is reversible.",
    category: "Hormonal signals",
    recoverable: true,
    multi: true,
    showIf: (a) => a.sex === "male",
    options: [
      { value: "drive", label: "Lower drive or libido", yearsDelta: -0.5, detail: "Falling drive often tracks falling testosterone, and testosterone tracks how you live." },
      { value: "strength", label: "Losing strength or muscle", yearsDelta: -0.6, detail: "Muscle you do not defend after 30 quietly disappears, and strength predicts survival." },
      { value: "fatigue", label: "Tired even after a full night", yearsDelta: -0.5, detail: "Waking up tired points at recovery and hormone output running low." },
      { value: "none", label: "None of these", yearsDelta: 0.5, detail: "No low-testosterone pattern reported.", exclusive: true },
    ],
  },
  {
    // Social connection: one of the strongest, most modifiable survival
    // predictors, and self-reportable without any measurement.
    id: "social",
    kind: "choice",
    prompt: "How connected do you feel to the people around you?",
    helper: "Think about whether you have people you can lean on. It is one of the best-studied predictors of a long life.",
    category: "Social connection",
    recoverable: true,
    options: [
      { value: "strong", label: "Strong, I have people I lean on", yearsDelta: 1.4, detail: "Close relationships are tied again and again to a longer life." },
      { value: "few", label: "A few close people", yearsDelta: 0.4, detail: "Having a few people you can count on protects you." },
      { value: "some", label: "Kind of on my own", yearsDelta: -1.6, detail: "Not having much connection raises your heart and mortality risk." },
      { value: "lonely", label: "Lonely a lot of the time", yearsDelta: -2.8, detail: "Chronic loneliness rivals smoking in some studies." },
    ],
  },
  {
    id: "genetics",
    kind: "choice",
    prompt: "How long do blood relatives in your family usually live?",
    helper: "Think parents and grandparents. Your genes set a starting point you cannot change, but you can work with.",
    category: "Family history",
    recoverable: false,
    options: [
      { value: "poor", label: "Early deaths from heart disease or cancer", yearsDelta: -3.1, detail: "Early disease in the family raises your starting risk." },
      { value: "mixed", label: "About average", yearsDelta: -0.4, detail: "A typical family history is roughly a wash." },
      { value: "strong", label: "Lots of them lived into their 90s", yearsDelta: 3.0, detail: "Long life that runs in the family is strongly inherited." },
    ],
  },
  {
    // Unscored: collected to tailor the results-based pitch, never affects the
    // estimate. Multi-select so the plan can serve more than one goal.
    id: "goal",
    kind: "choice",
    prompt: "What do you most want to fix first?",
    helper: "Check all that apply. We build your plan around these.",
    category: "Goal",
    recoverable: false,
    scored: false,
    multi: true,
    options: [
      { value: "fat", label: "Lose body fat", yearsDelta: 0, detail: "Fat loss focus." },
      { value: "strength", label: "Get stronger and build muscle", yearsDelta: 0, detail: "Strength focus." },
      { value: "energy", label: "More energy and better sleep", yearsDelta: 0, detail: "Energy focus." },
      { value: "heart", label: "Protect my heart and live longer", yearsDelta: 0, detail: "Longevity focus." },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Normalize any answer value into a list of selected option values. */
export function toValues(value: AnswerValue | undefined): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") return [value];
  return [];
}

/** Diminishing-returns penalty for stacked negative factors. */
function dampenedPenalty(negMagnitude: number): number {
  return NEG_CAP * (1 - Math.exp(-negMagnitude / NEG_SCALE));
}

/**
 * Project life expectancy from positive and negative contributions.
 * Positives add linearly; negatives are compressed so the worst case bottoms
 * out around BASE - NEG_CAP rather than free-falling.
 */
function projectLifeExpectancy(
  positive: number,
  negativeMagnitude: number,
  age: number
): number {
  return clamp(
    BASE_LIFE_EXPECTANCY + positive - dampenedPenalty(negativeMagnitude),
    age + 0.5,
    MAX_LIFE_EXPECTANCY
  );
}

function isScored(q: QuizQuestion): boolean {
  return q.scored !== false;
}

function isActive(q: QuizQuestion, answers: Answers): boolean {
  return !q.showIf || q.showIf(answers);
}

/** The ordered list of questions to show given the current answers (branching). */
export function getActiveQuestions(answers: Answers): QuizQuestion[] {
  return QUESTIONS.filter((q) => isActive(q, answers));
}

function impactOf(deltaYears: number): RiskFactor["impact"] {
  const m = Math.abs(deltaYears);
  if (m >= 3) return "high";
  if (m >= 1.5) return "moderate";
  return "minor";
}

/** Add a fractional number of years to a date, resolved to month precision. */
function addFractionalYears(date: Date, years: number): Date {
  const wholeYears = Math.floor(years);
  const extraMonths = Math.round((years - wholeYears) * 12);
  const result = new Date(date.getTime());
  result.setFullYear(result.getFullYear() + wholeYears);
  result.setMonth(result.getMonth() + extraMonths);
  return result;
}

function toNumber(value: AnswerValue | undefined): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** The scored options a user selected for a question (handles single + multi). */
function selectedOptions(q: QuizQuestion, answers: Answers): QuizOption[] {
  const values = toValues(answers[q.id]);
  if (values.length === 0) {
    // Defensive default for single-select questions left unanswered.
    return q.multi ? [] : [q.options![0]];
  }
  return values
    .map((v) => q.options!.find((o) => o.value === v))
    .filter((o): o is QuizOption => Boolean(o));
}

// Concrete, results-based outcomes keyed off specific answers. Each candidate
// carries a weight (rough relevance) and a goal "theme" for goal-aligned ranking.
function deriveOutcomes(answers: Answers): { result: Outcome; theme: string; weight: number }[] {
  const out: { result: Outcome; theme: string; weight: number }[] = [];
  const add = (id: string, label: string, theme: string, weight: number) =>
    out.push({ result: { id, label }, theme, weight });

  switch (answers.bodycomp) {
    case "obese": add("fat", "Drop around 20 lbs of body fat", "fat", 9); break;
    case "over": add("fat", "Drop around 10 lbs of body fat", "fat", 6); break;
    case "healthy": add("muscle", "Build lean, visible muscle", "strength", 2); break;
    case "lean": add("muscle", "Add strength to an already lean frame", "strength", 1); break;
  }
  switch (answers.activity) {
    case "none": add("cardio", "Rebuild your heart and lung fitness from scratch", "heart", 8); break;
    case "light": add("cardio", "Sharpen your heart and lung fitness", "heart", 5); break;
    default: add("cardio", "Push your fitness into the top tier", "heart", 2);
  }
  switch (answers.diet) {
    case "poor": add("energy", "Steady out your energy and blood sugar", "energy", 6); break;
    case "average": add("energy", "Fix the part of your diet that actually matters", "energy", 3); break;
  }
  switch (answers.sleep) {
    case "low": add("sleep", "Get 1 to 2 more hours of real sleep", "energy", 6); break;
    case "belowavg": add("sleep", "Sleep deeper and longer", "energy", 4); break;
  }
  switch (answers.stress) {
    case "severe": add("stress", "Get your stress back under control", "energy", 6); break;
    case "high": add("stress", "Bring your day-to-day stress down", "energy", 4); break;
  }
  switch (answers.alcohol) {
    case "heavy": add("liver", "Take the alcohol load off your liver and heart", "heart", 6); break;
    case "moderate": add("liver", "Stop alcohol from dragging down your recovery", "heart", 3); break;
  }
  switch (answers.smoking) {
    case "heavy": add("lungs", "Start undoing the damage smoking did to your heart", "heart", 7); break;
    case "light":
    case "former": add("lungs", "Protect and rebuild your lungs and blood vessels", "heart", 3); break;
  }
  const conditions = toValues(answers.conditions);
  if (conditions.includes("prediabetes")) add("metabolic", "Pull your blood sugar back toward normal", "heart", 7);
  if (conditions.includes("highbp")) add("bp", "Bring your blood pressure down without more pills", "heart", 6);
  // Gender-specific outcomes keyed to the hormonal follow-ups.
  const maleSignals = toValues(answers.hormonal_male).filter((v) => v !== "none");
  if (maleSignals.length >= 2) add("hormones", "Rebuild the drive, strength, and recovery you have been losing", "strength", 7);
  else if (maleSignals.length === 1) add("hormones", "Reverse the early signs of falling testosterone", "strength", 5);
  if (answers.hormonal_female === "peri" || answers.hormonal_female === "post")
    add("hormones", "Protect your heart and bones through the hormonal shift", "heart", 6);
  if (answers.social === "lonely" || answers.social === "some")
    add("connection", "Rebuild the connections that protect your health", "energy", 5);

  // Always include a baseline longevity outcome so the list is never empty.
  add("longevity", "Push your date in the right direction", "heart", 0.5);
  return out;
}

const GOAL_THEME: Record<string, string> = {
  fat: "fat",
  strength: "strength",
  energy: "energy",
  heart: "heart",
};

// Deterministic per-user confidence (90 to 97): same answers give the same
// figure, different people generally differ, so it does not look hardcoded.
function confidenceFromAnswers(answers: Answers): number {
  let hash = 0;
  for (const q of QUESTIONS) {
    for (const v of toValues(answers[q.id])) {
      for (let i = 0; i < v.length; i++) {
        hash = (hash * 31 + v.charCodeAt(i)) >>> 0;
      }
    }
    if (typeof answers[q.id] === "number") {
      hash = (hash * 31 + Math.round(answers[q.id] as number)) >>> 0;
    }
  }
  return 90 + (hash % 8);
}

// Short answer-derived phrases woven into the (cosmetic) analysis log so the
// sequence reads as relevant to this specific user.
export function analysisSignals(answers: Answers): string[] {
  const signals: string[] = [];
  if (answers.smoking && answers.smoking !== "never") signals.push("tobacco exposure");
  if (answers.activity === "none" || answers.activity === "light")
    signals.push("low fitness output");
  if (answers.bodycomp === "over" || answers.bodycomp === "obese")
    signals.push("elevated body-fat markers");
  if (answers.diet === "poor" || answers.diet === "average")
    signals.push("poor diet quality");
  if (answers.sleep === "low" || answers.sleep === "belowavg")
    signals.push("built-up sleep debt");
  if (answers.stress === "high" || answers.stress === "severe")
    signals.push("chronic stress load");
  if (answers.alcohol === "moderate" || answers.alcohol === "heavy")
    signals.push("alcohol load");
  const conditions = toValues(answers.conditions);
  if (conditions.some((c) => c !== "none")) signals.push("metabolic markers");
  if (answers.social === "some" || answers.social === "lonely")
    signals.push("social isolation");
  if (answers.genetics === "poor") signals.push("family history risk");
  if (toValues(answers.hormonal_male).some((v) => v !== "none"))
    signals.push("low-testosterone pattern");
  if (answers.hormonal_female === "peri" || answers.hormonal_female === "post")
    signals.push("hormonal-stage risk shift");
  return signals;
}

/**
 * Compute the longevity result from quiz answers.
 * @param answers map of questionId -> selected value(s)
 * @param today injectable current date (defaults to now) for deterministic tests
 */
export function computeResult(answers: Answers, today: Date = new Date()): ScanResult {
  const ageQuestion = QUESTIONS.find((q) => q.kind === "age")!;
  const currentAge = clamp(
    Math.round(toNumber(answers[ageQuestion.id])),
    ageQuestion.min ?? MIN_AGE,
    ageQuestion.max ?? MAX_AGE
  );

  const factors: RiskFactor[] = [];
  let rawDelta = 0;

  for (const q of QUESTIONS) {
    if (q.kind !== "choice" || !isScored(q) || !isActive(q, answers)) continue;
    for (const option of selectedOptions(q, answers)) {
      rawDelta += option.yearsDelta;
      factors.push({
        // Multi-select questions yield one factor per selection.
        id: q.multi ? `${q.id}:${option.value}` : q.id,
        category: q.multi ? option.label : q.category,
        answerLabel: option.label,
        deltaYears: option.yearsDelta,
        recoverable: q.recoverable,
        detail: option.detail,
        impact: impactOf(option.yearsDelta),
      });
    }
  }

  const totalDelta = round1(rawDelta);

  const positive = factors
    .filter((f) => f.deltaYears > 0)
    .reduce((sum, f) => sum + f.deltaYears, 0);
  const negativeMagnitude = factors
    .filter((f) => f.deltaYears < 0)
    .reduce((sum, f) => sum - f.deltaYears, 0);

  const lifeExpectancyExact = projectLifeExpectancy(
    positive,
    negativeMagnitude,
    currentAge
  );
  const lifeExpectancy = round1(lifeExpectancyExact);
  const ageAtDeath = Math.floor(lifeExpectancy);

  // Death date is derived from the displayed (rounded) estimate so the date and
  // the "around N years old" figure always agree.
  const yearsRemaining = Math.max(0.5, lifeExpectancy - currentAge);
  const predictedDeathDate = addFractionalYears(today, yearsRemaining);

  // Population anchor: baseline for this person's age and sex, ignoring the
  // lifestyle they can change. Drives the "X years under average" line.
  const sexDelta = (QUESTIONS.find((q) => q.id === "sex")!.options!.find(
    (o) => o.value === answers.sex
  )?.yearsDelta) ?? 0;
  const averageLifeExpectancy = round1(BASE_LIFE_EXPECTANCY + sexDelta);
  const yearsVsAverage = round1(lifeExpectancy - averageLifeExpectancy);

  // Recoverable years = the gain from upgrading every modifiable factor to its
  // best option (fixed factors held as-is), measured through the same curve and
  // then through its own believable ceiling.
  let improvedPositive = 0;
  let improvedNegMag = 0;
  for (const q of QUESTIONS) {
    if (q.kind !== "choice" || !isScored(q) || !isActive(q, answers)) continue;
    if (q.recoverable) {
      const best = Math.max(...q.options!.map((o) => o.yearsDelta));
      if (best > 0) improvedPositive += best;
      else improvedNegMag += -best;
    } else {
      for (const o of selectedOptions(q, answers)) {
        if (o.yearsDelta > 0) improvedPositive += o.yearsDelta;
        else improvedNegMag += -o.yearsDelta;
      }
    }
  }
  const improvedLifeExpectancy = projectLifeExpectancy(
    improvedPositive,
    improvedNegMag,
    currentAge
  );
  const rawRecover = Math.max(0, improvedLifeExpectancy - lifeExpectancyExact);
  const curvedRecover = REC_CAP * (1 - Math.exp(-rawRecover / REC_SCALE));
  const recoverableYears = round1(
    Math.min(
      REC_CAP,
      rawRecover > REC_FLOOR_THRESHOLD ? Math.max(REC_FLOOR, curvedRecover) : curvedRecover
    )
  );

  const topRisks = factors
    .filter((f) => f.recoverable && f.deltaYears < 0)
    .sort((a, b) => a.deltaYears - b.deltaYears)
    .slice(0, 3);

  const strengths = factors
    .filter((f) => f.deltaYears > 0)
    .sort((a, b) => b.deltaYears - a.deltaYears)
    .slice(0, 2);

  const goals = toValues(answers.goal);
  const primaryGoal = goals[0] ?? null;
  const goalTheme = primaryGoal ? GOAL_THEME[primaryGoal] : undefined;

  const outcomes = deriveOutcomes(answers)
    .map((o) => ({ ...o, weight: o.weight + (goalTheme && o.theme === goalTheme ? 5 : 0) }))
    .sort((a, b) => b.weight - a.weight)
    .filter((o, i, arr) => arr.findIndex((x) => x.result.id === o.result.id) === i)
    .slice(0, 4)
    .map((o) => o.result);

  return {
    currentAge,
    baseLifeExpectancy: BASE_LIFE_EXPECTANCY,
    lifeExpectancy,
    ageAtDeath,
    predictedDeathDate,
    averageLifeExpectancy,
    yearsVsAverage,
    totalDelta,
    factors,
    recoverableYears,
    topRisks,
    strengths,
    outcomes,
    primaryGoal,
    modelConfidence: confidenceFromAnswers(answers),
  };
}
