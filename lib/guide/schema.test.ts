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
    workouts: [
      { day: "Monday", title: "Full body A", exercises: [validExercise()] },
    ],
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
    proteinTarget: "A palm of protein at every meal",
    hydration: "Drink water through the day, more on training days.",
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
    delete (bad.weeks[0].workouts[0].exercises[0] as Record<string, unknown>).sets;
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
