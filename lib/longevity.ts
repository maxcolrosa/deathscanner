// Deterministic, offline longevity model for The Longevity Scan parody.
// Presented to users as an "AI longevity model". Under the hood it is a
// transparent, deterministic actuarial-style estimate: no network, no
// randomness. Same inputs + same `today` => same output.
//
// Factor weights are decimals loosely grounded in real epidemiology so the
// estimate and its breakdown read as credible (heavy smoking ~ -9 yrs, chronic
// stress ~ -1.8 yrs, etc.) rather than cartoonish.

export type QuestionKind = "age" | "choice";

export interface QuizOption {
  value: string;
  /** The answer the user picks (clinical, plain language). */
  label: string;
  /** Years added (positive) or subtracted (negative) from the baseline. */
  yearsDelta: number;
  /** One-line clinical rationale shown in the report breakdown. */
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
}

export interface ScanResult {
  currentAge: number;
  /** National-average baseline the model starts from. */
  baseLifeExpectancy: number;
  /** Final estimate, one decimal. */
  lifeExpectancy: number;
  /** Whole-year age at death (floor of lifeExpectancy). */
  ageAtDeath: number;
  /** Specific projected month/year. */
  predictedDeathDate: Date;
  /** Sum of all factor adjustments, one decimal. */
  totalDelta: number;
  factors: RiskFactor[];
  /** Years of loss attributable to modifiable factors, one decimal. */
  recoverableYears: number;
  /** The biggest reversible losses, worst first (max 3) for personalization. */
  topRecoverable: RiskFactor[];
}

export const BASE_LIFE_EXPECTANCY = 79;
export const MIN_AGE = 18;
export const MAX_AGE = 99;
export const MAX_LIFE_EXPECTANCY = 102;

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
      {
        value: "female",
        label: "Female",
        yearsDelta: 2.4,
        detail: "Females carry a higher baseline life expectancy.",
      },
      {
        value: "male",
        label: "Male",
        yearsDelta: -2.4,
        detail: "Males carry a lower baseline life expectancy.",
      },
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
      {
        value: "never",
        label: "Never used",
        yearsDelta: 0.4,
        detail: "Non-users retain full baseline pulmonary and vascular function.",
      },
      {
        value: "former",
        label: "Quit over a year ago",
        yearsDelta: -1.2,
        detail: "Risk falls sharply after quitting but does not fully reset.",
      },
      {
        value: "light",
        label: "Occasional or light use",
        yearsDelta: -3.5,
        detail: "Even light use elevates cardiovascular and cancer risk.",
      },
      {
        value: "heavy",
        label: "Daily, half a pack or more",
        yearsDelta: -9.2,
        detail: "Heavy smoking is the largest single modifiable loss of years.",
      },
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
      {
        value: "lean",
        label: "Lean and physically fit",
        yearsDelta: 1.6,
        detail: "Healthy body fat and muscle mass lower metabolic and cardiac risk.",
      },
      {
        value: "healthy",
        label: "Healthy weight",
        yearsDelta: 0.8,
        detail: "A normal weight range is protective.",
      },
      {
        value: "over",
        label: "Carrying some excess weight",
        yearsDelta: -1.9,
        detail: "Excess adiposity raises cardiovascular and metabolic load.",
      },
      {
        value: "obese",
        label: "Significantly overweight",
        yearsDelta: -4.6,
        detail: "Obesity is linked to diabetes, hypertension, and shorter lifespan.",
      },
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
      {
        value: "none",
        label: "Rarely or never",
        yearsDelta: -3.9,
        detail: "A sedentary lifestyle rivals smoking in mortality impact.",
      },
      {
        value: "light",
        label: "1 to 2 days a week",
        yearsDelta: -1.2,
        detail: "Some activity helps but falls short of protective thresholds.",
      },
      {
        value: "moderate",
        label: "3 to 4 days a week",
        yearsDelta: 1.8,
        detail: "Meets the activity guidelines associated with longer life.",
      },
      {
        value: "high",
        label: "5 or more days a week",
        yearsDelta: 3.2,
        detail: "High cardiorespiratory fitness strongly predicts longevity.",
      },
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
      {
        value: "poor",
        label: "Mostly processed and fast food",
        yearsDelta: -3.4,
        detail: "Processed-heavy diets drive inflammation and metabolic disease.",
      },
      {
        value: "average",
        label: "A mix of fresh and processed",
        yearsDelta: -0.6,
        detail: "An average diet still leaves measurable risk on the table.",
      },
      {
        value: "good",
        label: "Mostly whole foods",
        yearsDelta: 1.6,
        detail: "Whole-food diets reduce cardiovascular and metabolic risk.",
      },
      {
        value: "excellent",
        label: "Whole foods, low sugar, high vegetable",
        yearsDelta: 2.7,
        detail: "Mediterranean-style eating is consistently linked to longevity.",
      },
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
      {
        value: "none",
        label: "I do not drink",
        yearsDelta: 0.4,
        detail: "Avoiding alcohol avoids related liver and cardiovascular risk.",
      },
      {
        value: "light",
        label: "A few drinks a week",
        yearsDelta: -0.4,
        detail: "Light drinking carries a small but real risk.",
      },
      {
        value: "moderate",
        label: "Most days",
        yearsDelta: -3.2,
        detail: "Regular drinking elevates liver, heart, and cancer risk.",
      },
      {
        value: "heavy",
        label: "Heavily, most days",
        yearsDelta: -6.1,
        detail: "Heavy drinking sharply raises mortality across multiple systems.",
      },
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
      {
        value: "low",
        label: "Less than 5 hours",
        yearsDelta: -3.1,
        detail: "Chronic short sleep raises cardiovascular and metabolic risk.",
      },
      {
        value: "belowavg",
        label: "5 to 6 hours",
        yearsDelta: -1.3,
        detail: "Slightly low sleep accumulates measurable risk over time.",
      },
      {
        value: "optimal",
        label: "7 to 8 hours",
        yearsDelta: 1.3,
        detail: "Optimal sleep supports cardiovascular and immune health.",
      },
      {
        value: "high",
        label: "More than 9 hours",
        yearsDelta: -0.9,
        detail: "Consistently long sleep can signal underlying issues.",
      },
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
      {
        value: "low",
        label: "Low and well managed",
        yearsDelta: 1.0,
        detail: "Low chronic stress supports cardiovascular health.",
      },
      {
        value: "moderate",
        label: "Manageable most days",
        yearsDelta: -0.5,
        detail: "Moderate stress carries a small ongoing cost.",
      },
      {
        value: "high",
        label: "Frequently high",
        yearsDelta: -1.8,
        detail: "Chronic high stress elevates cortisol and cardiovascular load.",
      },
      {
        value: "severe",
        label: "Constant, with poor recovery",
        yearsDelta: -3.1,
        detail: "Sustained severe stress is linked to measurable mortality risk.",
      },
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
      {
        value: "poor",
        label: "Early deaths from heart disease or cancer",
        yearsDelta: -3.1,
        detail: "A family history of early disease raises baseline risk.",
      },
      {
        value: "mixed",
        label: "About average",
        yearsDelta: -0.4,
        detail: "A typical family history is roughly neutral.",
      },
      {
        value: "strong",
        label: "Many relatives lived into their 90s",
        yearsDelta: 3.0,
        detail: "Exceptional family longevity is strongly heritable.",
      },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
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
    if (q.kind !== "choice") continue;
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
    });
  }

  const totalDelta = round1(rawDelta);
  const lifeExpectancyExact = clamp(
    BASE_LIFE_EXPECTANCY + rawDelta,
    currentAge + 0.5,
    MAX_LIFE_EXPECTANCY
  );
  const lifeExpectancy = round1(lifeExpectancyExact);
  const ageAtDeath = Math.floor(lifeExpectancy);

  const yearsRemaining = Math.max(0.5, lifeExpectancyExact - currentAge);
  const predictedDeathDate = addFractionalYears(today, yearsRemaining);

  const recoverableYears = round1(
    factors
      .filter((f) => f.recoverable && f.deltaYears < 0)
      .reduce((sum, f) => sum - f.deltaYears, 0)
  );

  const topRecoverable = factors
    .filter((f) => f.recoverable && f.deltaYears < 0)
    .sort((a, b) => a.deltaYears - b.deltaYears)
    .slice(0, 3);

  return {
    currentAge,
    baseLifeExpectancy: BASE_LIFE_EXPECTANCY,
    lifeExpectancy,
    ageAtDeath,
    predictedDeathDate,
    totalDelta,
    factors,
    recoverableYears,
    topRecoverable,
  };
}
