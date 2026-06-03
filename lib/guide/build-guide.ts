import type { Answers, ScanResult } from "@/lib/longevity";
import { PRODUCT } from "@/lib/product";
import type { GuideDoc, GuideWeek, Workout, Exercise } from "@/lib/guide/schema";

type Level = "beginner" | "intermediate";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function ex(
  name: string,
  sets: string,
  reps: string,
  rest: string,
  cues: string,
  progression: string
): Exercise {
  return { name, sets, reps, rest, cues, progression };
}

function lowerBody(level: Level, injury: boolean): Exercise {
  if (injury)
    return ex("Box squat to a chair", "3", "8-10", "75s", "Sit back to the chair, stand tall, no knee pain", "Lower the chair height as you get stronger");
  if (level === "beginner")
    return ex("Goblet squat", "3", "8-10", "75s", "Chest tall, knees tracking over your toes", "Add 2.5 kg once you hit 10 clean reps");
  return ex("Back squat", "4", "5-8", "120s", "Brace, full depth, drive through mid-foot", "Add a small amount of load each week you complete all sets");
}

function pushEx(level: Level, injury: boolean): Exercise {
  if (injury)
    return ex("Incline push-up on a counter", "3", "8-12", "60s", "Body in a straight line, full range, pain-free", "Lower the surface height over time");
  if (level === "beginner")
    return ex("Push-up or incline push-up", "3", "6-12", "60s", "Ribs down, full range", "Progress toward floor push-ups, then add reps");
  return ex("Bench or dumbbell press", "4", "6-10", "90s", "Shoulder blades set, control the way down", "Add load when you clear the top of the rep range");
}

function hingeEx(level: Level, injury: boolean): Exercise {
  if (injury)
    return ex("Glute bridge", "3", "10-12", "60s", "Squeeze your glutes at the top, ribs down", "Progress to single-leg bridges");
  if (level === "beginner")
    return ex("Dumbbell Romanian deadlift", "3", "8-10", "75s", "Hinge at the hips, flat back, slight knee bend", "Add load as your hinge stays clean");
  return ex("Romanian deadlift", "4", "6-8", "120s", "Push the hips back, bar close, flat back", "Add load weekly while keeping a flat back");
}

function pullEx(level: Level, injury: boolean): Exercise {
  if (injury)
    return ex("Band row", "3", "12-15", "45s", "Pull to the ribs, shoulders down", "Use a thicker band over time");
  if (level === "beginner")
    return ex("One-arm dumbbell row", "3", "8-12", "60s", "Pull to the hip, no torso twist", "Add reps first, then load");
  return ex("Bent-over row", "4", "6-10", "90s", "Flat back, pull to the belly button", "Add load each week you complete all sets");
}

function coreEx(injury: boolean): Exercise {
  if (injury)
    return ex("Dead bug", "3", "8 per side", "45s", "Keep your low back flat to the floor the whole time", "Slow the tempo and add reps");
  return ex("Plank", "3", "30-45s", "45s", "Glutes and abs tight, straight line", "Add 5 to 10 seconds each week");
}

function conditioning(goal: string | null, injury: boolean): Exercise {
  if (injury)
    return ex("Brisk walk", "1", "20-25 min", "n/a", "A quick pace you can still talk through", "Add 5 minutes each week");
  if (goal === "heart")
    return ex("Zone 2 cardio, bike row or fast walk", "1", "25-30 min", "n/a", "Easy, nose-breathing pace", "Add 5 minutes each week");
  return ex("Intervals, bike row or hill walk", "1", "8 rounds of 30s hard, 60s easy", "n/a", "Hard but controlled efforts", "Add one interval each week");
}

function daysPerWeek(activity: string): number {
  if (activity === "high") return 4;
  if (activity === "none") return 2;
  return 3;
}

function buildWorkouts(level: Level, injury: boolean, goal: string | null, activity: string): Workout[] {
  const A: Workout = {
    day: "Monday",
    title: "Full body strength A",
    exercises: [lowerBody(level, injury), pushEx(level, injury), pullEx(level, injury), coreEx(injury)],
  };
  const B: Workout = {
    day: "Wednesday",
    title: "Full body strength B",
    exercises: [hingeEx(level, injury), pushEx(level, injury), pullEx(level, injury), coreEx(injury)],
  };
  const C: Workout = {
    day: "Friday",
    title: "Conditioning and core",
    exercises: [conditioning(goal, injury), coreEx(injury)],
  };
  const D: Workout = {
    day: "Saturday",
    title: "Strength C",
    exercises: [lowerBody(level, injury), hingeEx(level, injury), pullEx(level, injury)],
  };
  const n = daysPerWeek(activity);
  if (n === 2) return [A, B];
  if (n === 4) return [A, B, C, D];
  return [A, B, C];
}

function proteinTarget(bodycomp: string): string {
  if (bodycomp === "obese" || bodycomp === "over")
    return "a palm of protein at every meal, leaning to the larger side of your palm";
  return "a palm of protein at every meal";
}

function buildNutritionPlan(diet: string, goal: string | null, bodycomp: string) {
  const principles: string[] = [
    `Eat ${proteinTarget(bodycomp)}`,
    "Build each plate around protein, vegetables, and a whole-food carb",
    "Stop eating about three hours before bed",
  ];
  if (diet === "poor")
    principles.push("Replace one processed meal a day with a whole-food version. That single change does most of the work");
  else if (diet === "average")
    principles.push("Tighten the twenty percent that matters: cut the daily snacks and liquid calories first");
  else principles.push("You already eat well. Time more of your carbs around training and keep protein high");

  const swaps: { from: string; to: string }[] = [];
  if (diet === "poor") {
    swaps.push({ from: "Soda or juice", to: "Sparkling water with lime" });
    swaps.push({ from: "Fast-food lunch", to: "A pre-built protein and salad bowl" });
    swaps.push({ from: "Evening chips or sweets", to: "Greek yogurt with berries" });
  } else if (diet === "average") {
    swaps.push({ from: "Afternoon snack run", to: "Pre-portioned nuts or fruit" });
    swaps.push({ from: "A second sugary coffee", to: "Black coffee or one with milk" });
  } else {
    swaps.push({ from: "Mindless weekend grazing", to: "A planned bigger meal you actually enjoy" });
  }

  const carbNote = goal === "strength" ? "extra rice or potatoes on training days" : "a fist of whole-food carbs";
  const sampleDay = {
    breakfast: "Three eggs or Greek yogurt, oats, and a handful of berries",
    lunch: `Chicken or tofu, ${carbNote}, and a big salad`,
    dinner: "Salmon, lean beef, or beans with potatoes and greens",
    snacks: goal === "fat" ? "Greek yogurt, or vegetables and hummus" : "Greek yogurt, or fruit with a few nuts",
  };
  const groceryStaples = [
    "Eggs",
    "Chicken or tofu",
    "Greek yogurt",
    "Oats",
    "Rice or potatoes",
    "Frozen vegetables",
    "Olive oil",
    "Fruit",
  ];
  return { principles, sampleDay, swaps, groceryStaples };
}

function buildSleepAndStress(sleep: string, stress: string) {
  const protocol: string[] = ["Set one fixed wake time, seven days a week"];
  if (sleep === "low" || sleep === "belowavg") {
    protocol.push("Get to bed thirty minutes earlier than usual, starting tonight");
    protocol.push("No screens for thirty minutes before bed, and dim the lights");
  } else {
    protocol.push("Protect your current sleep window and keep screens out of the last thirty minutes");
  }
  if (stress === "high" || stress === "severe") {
    protocol.push("Two minutes of slow breathing when stress spikes, four counts in and six out");
    protocol.push("One daily walk outside with no phone");
  } else {
    protocol.push("One short daily walk outside to keep stress in check");
  }
  const summary =
    sleep === "low" || sleep === "belowavg"
      ? "Your sleep is the first lever. Win the nights and the training and eating get easier."
      : "Your sleep is decent. We protect it and use stress control to support recovery.";
  return { summary, protocol };
}

function buildTenMinutePlan(barrier: string, injury: boolean) {
  if (injury)
    return {
      summary: "On hard days, move without aggravating anything.",
      movements: [
        { name: "Easy mobility flow", detail: "4 minutes" },
        { name: "Glute bridges and dead bugs", detail: "4 minutes" },
        { name: "Slow breathing", detail: "2 minutes" },
      ],
    };
  return {
    summary: barrier === "time" ? "Built for the no-time days, this still counts." : "On the days life wins, this is the minimum that still counts.",
    movements: [
      { name: "Bodyweight squats", detail: "2 minutes" },
      { name: "Push-ups or incline push-ups", detail: "3 rounds" },
      { name: "Brisk walk or march in place", detail: "3 minutes" },
      { name: "Slow breathing", detail: "2 minutes" },
    ],
  };
}

function buildNext7Days(barrier: string, injury: boolean) {
  const base = [
    { day: "Day 1", action: "Do the 10-minute plan and set your fixed wake time" },
    { day: "Day 2", action: "Walk for 15 to 20 minutes and hit protein at every meal" },
    { day: "Day 3", action: "Run Week 1 strength session A" },
    { day: "Day 4", action: "Walk, then do tonight's wind-down routine" },
    { day: "Day 5", action: "Run Week 1 strength session B" },
    { day: "Day 6", action: "Make one swap from your nutrition list" },
    { day: "Day 7", action: "Review the week and write down one win" },
  ];
  if (barrier === "motivation") base[0] = { day: "Day 1", action: "Do only the first two minutes of the 10-minute plan. Starting is the win" };
  if (barrier === "time") base[1] = { day: "Day 2", action: "Two 10-minute walks instead of one long one, plus protein at every meal" };
  if (injury) base[2] = { day: "Day 3", action: "Run Week 1 session A with the low-impact variants, stopping before any pain" };
  return base;
}

function buildTroubleshooting(barrier: string) {
  const t = [
    { problem: "No time this week", fix: "Fall back to the 10-minute plan; it still counts" },
    { problem: "Lost motivation", fix: "Shrink the task. Do only the first two minutes" },
    { problem: "Sore or run down", fix: "Swap a strength day for a walk and a full night of sleep" },
  ];
  if (barrier === "injury")
    t.unshift({ problem: "An old injury flares up", fix: "Use the low-impact variant and stop before pain. Never push through joint pain" });
  if (barrier === "howto")
    t.unshift({ problem: "Not sure how an exercise works", fix: "Search the exercise name plus the word form, and copy a slow demo before adding load" });
  return t;
}

function weekHabit(i: number, barrier: string) {
  const habits = [
    { name: "Post-lunch walk", trigger: "Right after you finish lunch", why: "Stacks movement onto a cue you already have" },
    { name: "Protein at breakfast", trigger: "First thing, with your coffee", why: "Sets up the whole day of eating" },
    { name: "Fixed wake time", trigger: "Your alarm, the same time daily", why: "Anchors your sleep and your energy" },
    { name: "Ten-minute evening wind-down", trigger: "After dinner", why: "Protects your sleep window" },
    { name: "Two-minute breathing reset", trigger: "When stress spikes", why: "Keeps stress from derailing the day" },
    { name: "Daily step target", trigger: "A mid-afternoon reminder", why: "Adds easy movement without a workout" },
    { name: "Plan tomorrow's first meal", trigger: "While cleaning up dinner", why: "Removes a morning decision" },
    { name: "Weekly check-in", trigger: "Sunday evening", why: "Locks in what worked before the new week" },
  ];
  if (barrier === "motivation" && i === 0)
    return { name: "The two-minute start", trigger: "When you do not feel like training", why: "Starting is the habit. Two minutes almost always becomes more" };
  return habits[i % habits.length];
}

// Deterministic, offline guide generation. Branches on the user's answers so it
// reads as personalized, with no network or AI call.
export function buildGuide(result: ScanResult, answers: Answers): GuideDoc {
  const activity = str(answers.activity) || "moderate";
  const diet = str(answers.diet) || "average";
  const bodycomp = str(answers.bodycomp) || "healthy";
  const sleep = str(answers.sleep) || "optimal";
  const stress = str(answers.stress) || "moderate";
  const barrier = str(answers.activity_barrier);
  const injury = barrier === "injury";
  const goal = result.primaryGoal;
  const level: Level = activity === "none" || activity === "light" ? "beginner" : "intermediate";
  const risks = result.topRisks.length
    ? result.topRisks.map((r) => r.category)
    : ["Physical activity", "Diet quality", "Sleep"];

  const workouts = buildWorkouts(level, injury, goal, activity);
  const days = daysPerWeek(activity);

  const goalLine: Record<string, string> = {
    fat: "lose body fat and keep the muscle that keeps you healthy",
    strength: "build real strength and muscle",
    energy: "get your energy and sleep back",
    heart: "protect your heart and add years",
  };
  const goalText = goal && goalLine[goal] ? goalLine[goal] : "add years and feel better";

  const weeks: GuideWeek[] = Array.from({ length: 8 }, (_, i) => {
    const target = risks[i % risks.length];
    const block = i < 2 ? "Foundation" : i < 5 ? "Build" : "Push";
    return {
      week: i + 1,
      theme: `${block}: ${target.toLowerCase()}`,
      focus: `Week ${i + 1}: ${target}`,
      workouts,
      nutritionFocus:
        i < 2
          ? "Lock in protein at every meal and your first swap"
          : i < 5
            ? "Hold your swaps and add a vegetable to two meals a day"
            : "Tighten portions slightly and keep protein high",
      habit: weekHabit(i, barrier),
      checkpoint: `You completed ${days} sessions and kept your habit on most days`,
    };
  });

  return {
    title: PRODUCT.name,
    intro: `This plan is built from your scan. It is calibrated to where you are now, a ${level === "beginner" ? "simple, beginner-friendly" : "step-up"} program to help you ${goalText}.`,
    yourSituation: `At ${result.currentAge}, your largest modifiable risks are ${risks.slice(0, 2).join(" and ").toLowerCase()}. ${injury ? "Because you flagged a past injury, every movement here has a low-impact version. " : ""}That is where your recoverable years come from.`,
    strategy: `We attack ${risks[0].toLowerCase()} first because it is costing you the most, then work down your list. Training is ${days} days a week, eating is built around protein and whole foods, and the plan tightens as your numbers move.`,
    weeks,
    nutritionPlan: buildNutritionPlan(diet, goal, bodycomp),
    dailyBlueprint: [
      { time: "07:00", activity: "Wake at your fixed time, water, ten minutes of light movement" },
      { time: "12:30", activity: "Protein-forward lunch, then a short walk" },
      { time: "18:00", activity: "Training session on training days, otherwise a walk" },
      { time: "21:30", activity: "Screens off, ten-minute wind-down, lights out" },
    ],
    sleepAndStress: buildSleepAndStress(sleep, stress),
    tenMinutePlan: buildTenMinutePlan(barrier, injury),
    next7Days: buildNext7Days(barrier, injury),
    troubleshooting: buildTroubleshooting(barrier),
    recalibration: "Each week the plan tightens as your numbers move. Add a little load or a little distance, repeat what worked, and replace what did not.",
    outcomes: result.outcomes.map((o) => o.label),
    closing: "The date you saw assumes you change nothing. You already changed something by starting. Keep going.",
  };
}
