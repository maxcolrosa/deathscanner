import { describe, it, expect } from "vitest";
import { GuideDocSchema, AnswersSchema } from "@/lib/guide/schema";

function validExercise() {
  return {
    name: "Goblet squat",
    sets: "3",
    reps: "8-10",
    rest: "75s",
    cues: "Chest tall, knees tracking over toes",
    progression: "Add 2.5 kg once you hit 10 clean reps",
  };
}

function validDeepDive(heading: string) {
  return {
    heading,
    problem: "Here is the problem, described plainly.",
    why: "Here is why it costs you years.",
    whenFixed: "Here is what improves when you fix it.",
    actions: ["Do the first concrete thing", "Then do the second concrete thing"],
  };
}

function validWeek(week: number) {
  return {
    week,
    theme: `Week ${week} theme`,
    focus: `Week ${week} focus`,
    nutritionFocus: "Protein at every meal",
    habit: {
      name: "Post-lunch walk",
      trigger: "Right after lunch",
      why: "Stacks an easy win onto an existing cue",
    },
    checkpoint: "You completed both sessions",
  };
}

const validGuide = {
  title: "The Second Wind Protocol",
  intro: "Built from your scan.",
  yourSituation: "You are sedentary with elevated body fat.",
  strategy: "We attack activity first, then diet.",
  riskBriefings: [
    validDeepDive("Your fitness is the lever"),
    validDeepDive("Your diet is leaking years"),
    validDeepDive("Sleep is undercutting recovery"),
  ],
  training: {
    approach: validDeepDive("How the plan builds you"),
    workouts: [
      { day: "Monday", title: "Full body A", exercises: [validExercise()] },
    ],
    warmup: [
      { name: "Easy cardio", detail: "3 minutes" },
      { name: "Glute bridges", detail: "10 reps" },
    ],
    progressionRules: ["Add reps before load", "Deload every fourth week"],
    deload: "Every fourth week, drop to two-thirds load.",
  },
  weeks: Array.from({ length: 8 }, (_, i) => validWeek(i + 1)),
  nutritionPlan: {
    philosophy: validDeepDive("Your diet is close but leaking"),
    plateFormula: "Half your plate vegetables, a palm of protein, a fist of whole-food carbs, a thumb of healthy fat.",
    proteinTarget: "A palm of protein at every meal. For most adults this lands around 1.6 to 2.0 g per kg of bodyweight.",
    hydration: "Drink water through the day, more on training days.",
    calibration: ["Pair protein with every meal to steady blood sugar"],
    principles: ["Aim for roughly 1.6 g protein per kg"],
    sampleDays: [
      {
        label: "A training day",
        breakfast: "Eggs and oats",
        lunch: "Chicken and rice",
        dinner: "Salmon and greens",
        snacks: "Greek yogurt",
      },
      {
        label: "A rest day",
        breakfast: "Omelette",
        lunch: "Big salad with protein",
        dinner: "Stir-fry",
        snacks: "Fruit and nuts",
      },
    ],
    swaps: [{ from: "Soda", to: "Sparkling water" }],
    groceryStaples: ["Eggs", "Chicken", "Oats"],
    eatingOut: ["Decide before you arrive", "Double the vegetables"],
  },
  dailyBlueprint: [{ time: "07:00", activity: "Wake, water, short walk" }],
  sleepAndStress: {
    briefing: validDeepDive("Your sleep is undercutting everything"),
    protocol: ["Fixed wake time", "No screens 30 minutes before bed"],
  },
  tenMinutePlan: {
    summary: "No-excuses fallback.",
    movements: [{ name: "Bodyweight squat", detail: "2 minutes" }],
  },
  progressMarkers: {
    summary: "You do not need a lab to know this is working.",
    markers: ["Waistband fit", "Resting heart rate", "Afternoon energy"],
  },
  next7Days: Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    action: `Do task ${i + 1}`,
  })),
  troubleshooting: [{ problem: "No time", fix: "Use the 10-minute plan" }],
  faqs: [
    { q: "Do I need a gym?", a: "No." },
    { q: "How long until results?", a: "Two to eight weeks." },
    { q: "What if I miss a day?", a: "Nothing is ruined." },
    { q: "Will the date change?", a: "Change the inputs and it does." },
  ],
  recalibration: "Tighten weekly.",
  outcomes: ["Lose around 5 kg of body fat"],
  closing: "You started today. Keep going.",
  yourNumbers: {
    summary: "Track these six numbers over the 90-day program.",
    reclaimedYearsHeadline: "Around 9 recoverable years are on the table. These are the numbers that move them.",
    metrics: [
      { label: "Resting heart rate", startingBand: "Estimated 72 to 82 bpm", target: "Goal: drop 5 to 10 bpm", how: "Zone 2 cardio and sleep" },
      { label: "Weight trend", startingBand: "Estimated: your starting point", target: "Goal: lose around 5%", how: "Track the weekly trend" },
      { label: "Daily protein", startingBand: "Estimated: below target", target: "Goal: a palm at every meal", how: "Plan your protein sources when you shop" },
      { label: "Daily steps", startingBand: "Estimated 4,000 to 7,000 steps", target: "Build to 8,000 steps a day", how: "Short walk after each meal" },
    ],
    milestones: [
      { week: "Week 2", marker: "Sleep better and afternoon energy is steadier." },
      { week: "Week 4", marker: "Clothes feel different and measurements are moving." },
      { week: "Week 8", marker: "Numbers are visibly shifting and habits are locked in." },
    ],
  },
  bonusModules: [
    validDeepDive("The Plateau Protocol"),
    validDeepDive("Travel and Holiday Survival Kit"),
    validDeepDive("The Supplement Truth"),
    validDeepDive("Life After Your 90 Days"),
  ],
  trackers: {
    groceryByAisle: [
      { aisle: "Protein", items: ["Eggs", "Chicken or tofu"] },
      { aisle: "Produce", items: ["Fruit"] },
    ],
    dailyChecklist: [
      "At least 10 minutes of movement",
      "Protein at every meal",
      "Hit your step target",
    ],
  },
  recipeBank: {
    recipes: Array.from({ length: 8 }, (_, i) => ({
      id: `r${i + 1}`,
      name: `Recipe ${i + 1}`,
      meal: (["breakfast", "lunch", "dinner", "snack"] as const)[i % 4],
      tags: ["high-protein", "quick"],
      servings: 1,
      timeMins: 15,
      calories: 400,
      proteinG: 35,
      ingredients: ["200 g chicken breast", "1 tablespoon olive oil"],
      steps: ["Cook the chicken in the oil.", "Season and serve."],
      note: "Estimates: 400 kcal, 35 g protein per serving.",
    })),
    shoppingList: [
      { aisle: "Protein", items: ["Chicken breast", "Eggs"] },
    ],
  },
  exerciseLibrary: [
    {
      name: "Goblet squat",
      pattern: "Squat",
      targets: "Quadriceps, glutes, and hamstrings.",
      setup: ["Hold a dumbbell at chest height.", "Stand feet shoulder-width apart."],
      execution: ["Brace your core.", "Squat down to parallel.", "Drive through your heels to stand."],
      mistakes: ["Heels rising off the floor.", "Chest falling forward."],
      easier: "Use a lighter dumbbell.",
      harder: "Increase the dumbbell weight each week.",
      learn: "Search 'goblet squat tutorial' for a side-on demo.",
    },
  ],
  scienceNotes: {
    summary: "Your scan flagged cardiorespiratory fitness as your highest-impact area. The science below explains why these levers work at a physiological level.",
    disclaimer: "This section is general educational information about health and exercise science. It is not medical advice.",
    entries: [
      {
        lever: "Cardiorespiratory fitness",
        mechanism: "Higher fitness improves how efficiently your heart and lungs deliver oxygen to working muscles, lowering resting heart rate and blood pressure.",
        evidence: "A large cohort study by Mandsager et al. published in JAMA Network Open in 2018 found that low cardiorespiratory fitness was associated with a higher risk of all-cause mortality than most other traditional risk factors.",
      },
      {
        lever: "Strength and muscle mass",
        mechanism: "Skeletal muscle is the largest site of glucose disposal, absorbing blood sugar after meals and keeping insulin working properly.",
        evidence: "Large meta-analyses consistently show that higher muscle strength is associated with lower all-cause mortality.",
      },
      {
        lever: "Protein intake",
        mechanism: "Protein provides the amino acids muscles use to repair and rebuild after training, supporting muscle protein synthesis.",
        evidence: "Systematic reviews consistently show that protein intakes around 1.6 to 2.2 g per kg of body weight per day maximise muscle-building responses to training.",
      },
      {
        lever: "Progressive overload",
        mechanism: "Muscles adapt only when exposed to a demand that slightly exceeds what they are accustomed to.",
        evidence: "The US Physical Activity Guidelines and WHO Physical Activity Guidelines both recommend muscle-strengthening at progressive intensity on at least two days per week.",
      },
      {
        lever: "Sleep",
        mechanism: "During deep sleep the body releases growth hormone, repairs muscle tissue, and resets cortisol and hunger hormones.",
        evidence: "Major sleep bodies recommend seven or more hours per night for adults based on consistent evidence linking shorter sleep to higher rates of obesity, diabetes, and cardiovascular disease.",
      },
      {
        lever: "Daily movement and NEAT",
        mechanism: "Non-exercise activity thermogenesis (NEAT) accounts for more daily calorie expenditure than structured workouts for most people.",
        evidence: "The WHO Physical Activity Guidelines note that any amount of additional physical activity confers health benefit beyond being sedentary.",
      },
    ],
  },
  programArc: {
    summary: "This 90-day arc builds the habits and physical base in weeks 1 to 4, applies progressive overload and tighter nutrition through weeks 5 to 12, and then hands off to a sustainable maintenance pattern.",
    phases: [
      {
        name: "Foundation",
        weeks: "Weeks 1 to 4",
        focus: "Establish the movement patterns, sleep schedule, and protein habits.",
        whatChanges: "Load stays light and volume builds from two to three sets per movement.",
      },
      {
        name: "Build",
        weeks: "Weeks 5 to 8",
        focus: "Progressive overload takes over. Each session adds a small increment of load, reps, or duration.",
        whatChanges: "Training volume increases to three to four working sets per movement. Nutrition portions tighten slightly.",
      },
      {
        name: "Push",
        weeks: "Weeks 9 to 12",
        focus: "Consolidate the gains from the first two months and drive intensity.",
        whatChanges: "Conditioning frequency increases. Strength sessions keep three to four sets at a higher load than Foundation.",
      },
      {
        name: "Maintenance",
        weeks: "Beyond week 12",
        focus: "Sustain the gains, prevent regression, and recalibrate for the next cycle.",
        whatChanges: "Training volume reduces slightly to be sustainable long term. A measurement review every four weeks keeps the trend honest.",
      },
    ],
    monthlyReviews: [
      {
        month: "Month 1 review (end of week 4)",
        checkpoints: [
          "Weigh and measure your waist on the same morning, in the same conditions, three days in a row and take the average.",
          "Review your training log: how many sessions did you complete out of the planned total?",
        ],
        adjustRules: [
          "Completed fewer than 70 percent of planned sessions: keep the load and structure identical for two more weeks rather than progressing.",
          "Sleep score below 6: fix the sleep before tightening any training or nutrition variable.",
        ],
      },
      {
        month: "Month 2 review (end of week 8)",
        checkpoints: [
          "Repeat the waist and weight measurement from month 1 and compare the trends, not the single numbers.",
          "Training log review: are working weights or rep counts higher than they were four weeks ago?",
        ],
        adjustRules: [
          "Progress has stalled for two consecutive weeks: take a deload week at two-thirds of normal load and effort.",
          "All metrics are moving: add one new variable only, an extra training day or a longer conditioning block.",
        ],
      },
      {
        month: "Month 3 review (end of week 12)",
        checkpoints: [
          "Full dashboard review: compare all six metrics to your Day 1 starting bands.",
          "Training log review across all 12 weeks: what is your average session completion rate?",
        ],
        adjustRules: [
          "Use the 90-day data to identify your next one or two focus areas.",
          "If all metrics are moving and the habits are locked in: start a second 90-day block with one new progressive variable.",
        ],
      },
    ],
  },
};

describe("GuideDocSchema", () => {
  it("accepts a fully-formed guide", () => {
    expect(() => GuideDocSchema.parse(validGuide)).not.toThrow();
  });

  it("rejects a guide without exactly 8 weeks", () => {
    expect(() =>
      GuideDocSchema.parse({ ...validGuide, weeks: validGuide.weeks.slice(0, 6) })
    ).toThrow();
  });

  it("rejects next7Days that is not exactly 7 entries", () => {
    expect(() =>
      GuideDocSchema.parse({ ...validGuide, next7Days: validGuide.next7Days.slice(0, 5) })
    ).toThrow();
  });

  it("rejects a malformed exercise (missing sets)", () => {
    const bad = structuredClone(validGuide);
    delete (bad.training.workouts[0].exercises[0] as Record<string, unknown>).sets;
    expect(() => GuideDocSchema.parse(bad)).toThrow();
  });

  it("rejects a missing top-level section", () => {
    const { nutritionPlan, ...bad } = validGuide;
    void nutritionPlan;
    expect(() => GuideDocSchema.parse(bad)).toThrow();
  });
});

describe("AnswersSchema", () => {
  it("accepts answers with age", () => {
    expect(() => AnswersSchema.parse({ age: 35, smoking: "never" })).not.toThrow();
  });
  it("rejects answers without age", () => {
    expect(() => AnswersSchema.parse({ smoking: "never" })).toThrow();
  });
});
