// Deterministic, offline longevity model for The Longevity Scan parody.
// Presented to users as an "AI longevity model". Under the hood it is a
// transparent, deterministic actuarial-style estimate: no network, no
// randomness. Same inputs + same `today` => same output.
//
// Factor weights are decimals loosely grounded in real epidemiology so the
// estimate reads as credible. The quiz supports conditional follow-up questions
// (branching) and an unscored goal question, which drive a personalized,
// results-based pitch downstream.

export type QuestionKind = "age" | "choice";

export interface QuizOption {
  value: string;
  /** The answer the user picks (clinical, plain language). */
  label: string;
  /** Years added (positive) or subtracted (negative) from the baseline. */
  yearsDelta: number;
  /** One-line clinical rationale (used for the report's driver explanations). */
  detail: string;
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
  /** Conditional display: only shown when this returns true for current answers. */
  showIf?: (answers: Answers) => boolean;
  /** Present when kind === "choice". */
  options?: QuizOption[];
  /** Present when kind === "age". */
  min?: number;
  max?: number;
}

export type Answers = Record<string, string | number>;

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
  totalDelta: number;
  factors: RiskFactor[];
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

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "age",
    kind: "age",
    prompt: "What is your current age?",
    helper: "Used to calibrate your baseline mortality curve.",
    category: "Age",
    recoverable: false,
    min: MIN_AGE,
    max: MAX_AGE,
  },
  {
    id: "sex",
    kind: "choice",
    prompt: "What is your biological sex?",
    helper: "Baseline life expectancy differs measurably by sex.",
    category: "Biological sex",
    recoverable: false,
    options: [
      { value: "female", label: "Female", yearsDelta: 2.4, detail: "Females carry a higher baseline life expectancy." },
      { value: "male", label: "Male", yearsDelta: -2.4, detail: "Males carry a lower baseline life expectancy." },
    ],
  },
  {
    id: "smoking",
    kind: "choice",
    prompt: "Do you use tobacco or nicotine?",
    helper: "The single most studied modifiable mortality factor.",
    category: "Tobacco use",
    recoverable: true,
    options: [
      { value: "never", label: "Never used", yearsDelta: 0.4, detail: "Non-users retain full baseline pulmonary and vascular function." },
      { value: "former", label: "Quit over a year ago", yearsDelta: -1.2, detail: "Risk falls sharply after quitting but does not fully reset." },
      { value: "light", label: "Occasional or light use", yearsDelta: -3.5, detail: "Even light use elevates cardiovascular and cancer risk." },
      { value: "heavy", label: "Daily, half a pack or more", yearsDelta: -9.2, detail: "Heavy smoking is the largest single modifiable loss of years." },
    ],
  },
  {
    // Branching follow-up: only relevant if they use tobacco at all.
    id: "smoking_years",
    kind: "choice",
    prompt: "How long have you used tobacco?",
    helper: "Cumulative exposure compounds the risk.",
    category: "Tobacco exposure",
    recoverable: true,
    showIf: (a) => typeof a.smoking === "string" && a.smoking !== "never",
    options: [
      { value: "under5", label: "Less than 5 years", yearsDelta: -0.4, detail: "Shorter exposure means more of the damage is still reversible." },
      { value: "5to15", label: "5 to 15 years", yearsDelta: -1.3, detail: "Sustained exposure has begun to accumulate measurable risk." },
      { value: "over15", label: "More than 15 years", yearsDelta: -2.4, detail: "Long-term exposure compounds cardiovascular and pulmonary damage." },
    ],
  },
  {
    id: "bodycomp",
    kind: "choice",
    prompt: "How would you describe your body composition?",
    helper: "Estimated from your typical weight range and waistline.",
    category: "Body composition",
    recoverable: true,
    options: [
      { value: "lean", label: "Lean and physically fit", yearsDelta: 1.6, detail: "Healthy body fat and muscle mass lower metabolic and cardiac risk." },
      { value: "healthy", label: "Healthy weight", yearsDelta: 0.8, detail: "A normal weight range is protective." },
      { value: "over", label: "Carrying some excess weight", yearsDelta: -1.9, detail: "Excess adiposity raises cardiovascular and metabolic load." },
      { value: "obese", label: "Significantly overweight", yearsDelta: -4.6, detail: "Obesity is linked to diabetes, hypertension, and shorter lifespan." },
    ],
  },
  {
    id: "activity",
    kind: "choice",
    prompt: "How often do you exercise?",
    helper: "Cardiorespiratory fitness is among the strongest survival predictors.",
    category: "Physical activity",
    recoverable: true,
    options: [
      { value: "none", label: "Rarely or never", yearsDelta: -3.9, detail: "A sedentary lifestyle rivals smoking in mortality impact." },
      { value: "light", label: "1 to 2 days a week", yearsDelta: -1.2, detail: "Some activity helps but falls short of protective thresholds." },
      { value: "moderate", label: "3 to 4 days a week", yearsDelta: 1.8, detail: "Meets the activity guidelines associated with longer life." },
      { value: "high", label: "5 or more days a week", yearsDelta: 3.2, detail: "High cardiorespiratory fitness strongly predicts longevity." },
    ],
  },
  {
    // Branching follow-up: only when activity is low, to personalize the plan.
    id: "activity_barrier",
    kind: "choice",
    prompt: "What gets in the way of training?",
    helper: "Your plan is built around this.",
    category: "Training barrier",
    recoverable: false,
    scored: false,
    showIf: (a) => a.activity === "none" || a.activity === "light",
    options: [
      { value: "time", label: "I never have the time", yearsDelta: 0, detail: "Time-efficient sessions." },
      { value: "motivation", label: "I struggle to stay motivated", yearsDelta: 0, detail: "Accountability and momentum." },
      { value: "injury", label: "Past injury or pain", yearsDelta: 0, detail: "Low-impact progressions." },
      { value: "howto", label: "I never learned how", yearsDelta: 0, detail: "Guided, step-by-step start." },
    ],
  },
  {
    id: "diet",
    kind: "choice",
    prompt: "How would you rate your diet?",
    helper: "Based on processed food, vegetables, and added sugar.",
    category: "Diet quality",
    recoverable: true,
    options: [
      { value: "poor", label: "Mostly processed and fast food", yearsDelta: -3.4, detail: "Processed-heavy diets drive inflammation and metabolic disease." },
      { value: "average", label: "A mix of fresh and processed", yearsDelta: -0.6, detail: "An average diet still leaves measurable risk on the table." },
      { value: "good", label: "Mostly whole foods", yearsDelta: 1.6, detail: "Whole-food diets reduce cardiovascular and metabolic risk." },
      { value: "excellent", label: "Whole foods, low sugar, high vegetable", yearsDelta: 2.7, detail: "Mediterranean-style eating is consistently linked to longevity." },
    ],
  },
  {
    id: "alcohol",
    kind: "choice",
    prompt: "How much alcohol do you drink?",
    helper: "Measured in standard drinks per week.",
    category: "Alcohol intake",
    recoverable: true,
    options: [
      { value: "none", label: "I do not drink", yearsDelta: 0.4, detail: "Avoiding alcohol avoids related liver and cardiovascular risk." },
      { value: "light", label: "A few drinks a week", yearsDelta: -0.4, detail: "Light drinking carries a small but real risk." },
      { value: "moderate", label: "Most days", yearsDelta: -3.2, detail: "Regular drinking elevates liver, heart, and cancer risk." },
      { value: "heavy", label: "Heavily, most days", yearsDelta: -6.1, detail: "Heavy drinking sharply raises mortality across multiple systems." },
    ],
  },
  {
    id: "sleep",
    kind: "choice",
    prompt: "How many hours do you sleep on a typical night?",
    helper: "Both too little and too much sleep raise risk.",
    category: "Sleep",
    recoverable: true,
    options: [
      { value: "low", label: "Less than 5 hours", yearsDelta: -3.1, detail: "Chronic short sleep raises cardiovascular and metabolic risk." },
      { value: "belowavg", label: "5 to 6 hours", yearsDelta: -1.3, detail: "Slightly low sleep accumulates measurable risk over time." },
      { value: "optimal", label: "7 to 8 hours", yearsDelta: 1.3, detail: "Optimal sleep supports cardiovascular and immune health." },
      { value: "high", label: "More than 9 hours", yearsDelta: -0.9, detail: "Consistently long sleep can signal underlying issues." },
    ],
  },
  {
    id: "stress",
    kind: "choice",
    prompt: "How would you rate your day-to-day stress?",
    helper: "Sustained stress affects cardiovascular and immune function.",
    category: "Chronic stress",
    recoverable: true,
    options: [
      { value: "low", label: "Low and well managed", yearsDelta: 1.0, detail: "Low chronic stress supports cardiovascular health." },
      { value: "moderate", label: "Manageable most days", yearsDelta: -0.5, detail: "Moderate stress carries a small ongoing cost." },
      { value: "high", label: "Frequently high", yearsDelta: -1.8, detail: "Chronic high stress elevates cortisol and cardiovascular load." },
      { value: "severe", label: "Constant, with poor recovery", yearsDelta: -3.1, detail: "Sustained severe stress is linked to measurable mortality risk." },
    ],
  },
  {
    id: "genetics",
    kind: "choice",
    prompt: "How is longevity in your immediate family?",
    helper: "Genetics set a baseline you can work within, not change.",
    category: "Family history",
    recoverable: false,
    options: [
      { value: "poor", label: "Early deaths from heart disease or cancer", yearsDelta: -3.1, detail: "A family history of early disease raises baseline risk." },
      { value: "mixed", label: "About average", yearsDelta: -0.4, detail: "A typical family history is roughly neutral." },
      { value: "strong", label: "Many relatives lived into their 90s", yearsDelta: 3.0, detail: "Exceptional family longevity is strongly heritable." },
    ],
  },
  {
    // Unscored: collected to tailor the results-based pitch, never affects the estimate.
    id: "goal",
    kind: "choice",
    prompt: "What would you most like to improve?",
    helper: "We tailor your protocol to this.",
    category: "Goal",
    recoverable: false,
    scored: false,
    options: [
      { value: "fat", label: "Lose body fat", yearsDelta: 0, detail: "Fat loss focus." },
      { value: "strength", label: "Build strength and muscle", yearsDelta: 0, detail: "Strength focus." },
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

function toNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Concrete, results-based outcomes keyed off specific answers. Each candidate
// carries a weight (rough relevance) and a goal "theme" for goal-aligned ranking.
function deriveOutcomes(answers: Answers): { result: Outcome; theme: string; weight: number }[] {
  const out: { result: Outcome; theme: string; weight: number }[] = [];
  const add = (id: string, label: string, theme: string, weight: number) =>
    out.push({ result: { id, label }, theme, weight });

  switch (answers.bodycomp) {
    case "obese": add("fat", "Lose around 9 kg of body fat", "fat", 9); break;
    case "over": add("fat", "Lose around 5 kg of body fat", "fat", 6); break;
    case "healthy": add("muscle", "Build lean, visible muscle", "strength", 2); break;
    case "lean": add("muscle", "Add strength to an already lean frame", "strength", 1); break;
  }
  switch (answers.activity) {
    case "none": add("cardio", "Rebuild your cardiovascular fitness from the ground up", "heart", 8); break;
    case "light": add("cardio", "Sharpen your cardiovascular fitness", "heart", 5); break;
    default: add("cardio", "Push your fitness toward the top percentile", "heart", 2);
  }
  switch (answers.diet) {
    case "poor": add("energy", "Stabilize your energy and blood sugar", "energy", 6); break;
    case "average": add("energy", "Clean up the part of your diet that actually matters", "energy", 3); break;
  }
  switch (answers.sleep) {
    case "low": add("sleep", "Add 1 to 2 hours of restorative sleep", "energy", 6); break;
    case "belowavg": add("sleep", "Deepen and extend your sleep", "energy", 4); break;
  }
  switch (answers.stress) {
    case "severe": add("stress", "Bring your chronic stress back under control", "energy", 6); break;
    case "high": add("stress", "Lower your day-to-day stress load", "energy", 4); break;
  }
  switch (answers.alcohol) {
    case "heavy": add("liver", "Cut the alcohol load on your liver and heart", "heart", 6); break;
    case "moderate": add("liver", "Reduce alcohol's drag on your recovery", "heart", 3); break;
  }
  switch (answers.smoking) {
    case "heavy": add("lungs", "Start reversing smoking-related cardiovascular damage", "heart", 7); break;
    case "light":
    case "former": add("lungs", "Protect and rebuild lung and vascular function", "heart", 3); break;
  }

  // Always include a baseline longevity outcome so the list is never empty.
  add("longevity", "Move your projected date in the right direction", "heart", 0.5);
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
    const v = answers[q.id];
    if (v === undefined) continue;
    const s = String(v);
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
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
    signals.push("low cardiorespiratory output");
  if (answers.bodycomp === "over" || answers.bodycomp === "obese")
    signals.push("elevated body-fat markers");
  if (answers.diet === "poor" || answers.diet === "average")
    signals.push("dietary risk signal");
  if (answers.sleep === "low" || answers.sleep === "belowavg")
    signals.push("accumulated sleep debt");
  if (answers.stress === "high" || answers.stress === "severe")
    signals.push("chronic stress load");
  if (answers.alcohol === "moderate" || answers.alcohol === "heavy")
    signals.push("alcohol load");
  if (answers.genetics === "poor") signals.push("adverse family history");
  return signals;
}

/**
 * Compute the longevity result from quiz answers.
 * @param answers map of questionId -> selected value
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
    const selectedValue = answers[q.id];
    const option = q.options!.find((o) => o.value === selectedValue) ?? q.options![0];
    rawDelta += option.yearsDelta;
    factors.push({
      id: q.id,
      category: q.category,
      answerLabel: option.label,
      deltaYears: option.yearsDelta,
      recoverable: q.recoverable,
      detail: option.detail,
      impact: impactOf(option.yearsDelta),
    });
  }

  const totalDelta = round1(rawDelta);

  const positive = factors
    .filter((f) => f.deltaYears > 0)
    .reduce((sum, f) => sum + f.deltaYears, 0);
  const negativeMagnitude = factors
    .filter((f) => f.deltaYears < 0)
    .reduce((sum, f) => sum - f.deltaYears, 0);
  // Magnitude of only the negatives the user cannot change (sex, family history).
  const fixedNegativeMagnitude = factors
    .filter((f) => f.deltaYears < 0 && !f.recoverable)
    .reduce((sum, f) => sum - f.deltaYears, 0);

  const lifeExpectancyExact = projectLifeExpectancy(
    positive,
    negativeMagnitude,
    currentAge
  );
  const lifeExpectancy = round1(lifeExpectancyExact);
  const ageAtDeath = Math.floor(lifeExpectancy);

  const yearsRemaining = Math.max(0.5, lifeExpectancyExact - currentAge);
  const predictedDeathDate = addFractionalYears(today, yearsRemaining);

  // Years recoverable = the gain from neutralizing every modifiable negative,
  // measured through the same dampened curve so it stays consistent.
  const improvedLifeExpectancy = projectLifeExpectancy(
    positive,
    fixedNegativeMagnitude,
    currentAge
  );
  const recoverableYears = round1(
    Math.max(0, improvedLifeExpectancy - lifeExpectancyExact)
  );

  const topRisks = factors
    .filter((f) => f.recoverable && f.deltaYears < 0)
    .sort((a, b) => a.deltaYears - b.deltaYears)
    .slice(0, 3);

  const strengths = factors
    .filter((f) => f.deltaYears > 0)
    .sort((a, b) => b.deltaYears - a.deltaYears)
    .slice(0, 2);

  const primaryGoal =
    typeof answers.goal === "string" ? answers.goal : null;
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
