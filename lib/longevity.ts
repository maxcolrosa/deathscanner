// Deterministic, offline "AI" engine for The Longevity Scan parody.
// No network, no randomness. Same inputs + same `today` => same output.

export type QuestionKind = "age" | "choice";

export interface QuizOption {
  value: string;
  label: string;
  /** Years added (positive) or subtracted (negative) from base life expectancy. */
  yearsDelta: number;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  helper?: string;
  /** Whether losses from this factor are framed as recoverable via the guide. */
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
  label: string;
  deltaYears: number;
  recoverable: boolean;
}

export interface ScanResult {
  currentAge: number;
  lifeExpectancy: number;
  ageAtDeath: number;
  predictedDeathDate: Date;
  totalDelta: number;
  factors: RiskFactor[];
  recoverableYears: number;
}

export const BASE_LIFE_EXPECTANCY = 79;
export const MIN_AGE = 13;
export const MAX_AGE = 100;
export const MAX_LIFE_EXPECTANCY = 105;

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "age",
    kind: "age",
    prompt: "What is your current age?",
    helper: "We need a baseline. Be honest. The machine knows.",
    recoverable: false,
    min: MIN_AGE,
    max: MAX_AGE,
  },
  {
    id: "activity",
    kind: "choice",
    prompt: "How physically active are you?",
    recoverable: true,
    options: [
      { value: "sedentary", label: "I avoid stairs on principle", yearsDelta: -4 },
      { value: "light", label: "The occasional walk to the fridge", yearsDelta: -1 },
      { value: "moderate", label: "I move on purpose a few times a week", yearsDelta: 2 },
      { value: "high", label: "The gym is my entire personality", yearsDelta: 4 },
    ],
  },
  {
    id: "diet",
    kind: "choice",
    prompt: "How would you describe your diet?",
    recoverable: true,
    options: [
      { value: "ultraprocessed", label: "Beige, fried, and delivered", yearsDelta: -5 },
      { value: "mixed", label: "A bit of everything, mostly chaos", yearsDelta: -1 },
      { value: "balanced", label: "Real food, most of the time", yearsDelta: 2 },
      { value: "clean", label: "I have opinions about olive oil", yearsDelta: 4 },
    ],
  },
  {
    id: "sleep",
    kind: "choice",
    prompt: "How much do you sleep per night?",
    recoverable: true,
    options: [
      { value: "under5", label: "Under 5 hours, who needs it", yearsDelta: -4 },
      { value: "5to6", label: "5 to 6 hours", yearsDelta: -2 },
      { value: "7to8", label: "7 to 8 glorious hours", yearsDelta: 3 },
      { value: "over9", label: "9 plus hours (suspicious)", yearsDelta: 0 },
    ],
  },
  {
    id: "smoking",
    kind: "choice",
    prompt: "Do you smoke or vape?",
    recoverable: true,
    options: [
      { value: "heavy", label: "Like a chimney", yearsDelta: -9 },
      { value: "social", label: "Only when stressed (always)", yearsDelta: -3 },
      { value: "vape", label: "Just the vape, it is basically water", yearsDelta: -2 },
      { value: "never", label: "Never touched it", yearsDelta: 1 },
    ],
  },
  {
    id: "alcohol",
    kind: "choice",
    prompt: "How much do you drink?",
    recoverable: true,
    options: [
      { value: "heavy", label: "Brunch is a personality", yearsDelta: -6 },
      { value: "regular", label: "A few most nights", yearsDelta: -2 },
      { value: "occasional", label: "Socially, sometimes", yearsDelta: 0 },
      { value: "never", label: "I do not drink", yearsDelta: 1 },
    ],
  },
  {
    id: "stress",
    kind: "choice",
    prompt: "What is your stress level?",
    recoverable: true,
    options: [
      { value: "constant", label: "My jaw is clenched right now", yearsDelta: -4 },
      { value: "frequent", label: "Frequently frazzled", yearsDelta: -2 },
      { value: "managed", label: "Mostly under control", yearsDelta: 1 },
      { value: "zen", label: "Disturbingly calm", yearsDelta: 3 },
    ],
  },
  {
    id: "genetics",
    kind: "choice",
    prompt: "How long do people in your family tend to live?",
    helper: "Genetics. The one thing the protocol cannot fix.",
    recoverable: false,
    options: [
      { value: "short", label: "Everyone retired early, permanently", yearsDelta: -5 },
      { value: "average", label: "A normal, forgettable lifespan", yearsDelta: 0 },
      { value: "long", label: "Great-grandma is still winning arguments at 99", yearsDelta: 5 },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date.getTime());
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function toNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Compute the parody longevity result from quiz answers.
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
  let totalDelta = 0;

  for (const q of QUESTIONS) {
    if (q.kind !== "choice") continue;
    const selectedValue = answers[q.id];
    const option = q.options!.find((o) => o.value === selectedValue) ?? q.options![0];
    totalDelta += option.yearsDelta;
    factors.push({
      id: q.id,
      label: option.label,
      deltaYears: option.yearsDelta,
      recoverable: q.recoverable,
    });
  }

  const lifeExpectancy = clamp(
    Math.round(BASE_LIFE_EXPECTANCY + totalDelta),
    currentAge + 1,
    MAX_LIFE_EXPECTANCY
  );

  const predictedDeathDate = addYears(today, lifeExpectancy - currentAge);

  const recoverableYears = factors
    .filter((f) => f.recoverable && f.deltaYears < 0)
    .reduce((sum, f) => sum - f.deltaYears, 0);

  return {
    currentAge,
    lifeExpectancy,
    ageAtDeath: lifeExpectancy,
    predictedDeathDate,
    totalDelta,
    factors,
    recoverableYears,
  };
}
