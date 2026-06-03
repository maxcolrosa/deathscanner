import type { ScanResult } from "@/lib/longevity";
import { PRODUCT } from "@/lib/product";
import type { GuideDoc, GuideWeek } from "@/lib/guide/schema";

// Deterministic, offline guide in the full GuideDoc shape. Powers the stub
// generator (no API key) and the tests. No randomness, no network.
export function buildFixtureGuide(result: ScanResult): GuideDoc {
  const risks = result.topRisks.length
    ? result.topRisks.map((r) => r.category)
    : ["Physical activity", "Diet quality", "Sleep"];

  const weeks: GuideWeek[] = Array.from({ length: 8 }, (_, i) => {
    const target = risks[i % risks.length];
    return {
      week: i + 1,
      theme: `Build the base for ${target.toLowerCase()}`,
      focus: `Week ${i + 1}: ${target}`,
      workouts: [
        {
          day: "Monday",
          title: "Full body strength A",
          exercises: [
            {
              name: "Goblet squat",
              sets: "3",
              reps: "8-10",
              rest: "75s",
              cues: "Chest tall, knees tracking over your toes",
              progression: "Add 2.5 kg once you hit 10 clean reps",
            },
            {
              name: "Incline push-up",
              sets: "3",
              reps: "6-12",
              rest: "60s",
              cues: "Ribs down, full range",
              progression: "Lower the incline as you get stronger",
            },
          ],
        },
        {
          day: "Thursday",
          title: "Full body strength B",
          exercises: [
            {
              name: "Dumbbell Romanian deadlift",
              sets: "3",
              reps: "8-10",
              rest: "75s",
              cues: "Hinge at the hips, keep a flat back",
              progression: "Add load when your form holds",
            },
            {
              name: "One-arm dumbbell row",
              sets: "3",
              reps: "8-12",
              rest: "60s",
              cues: "Pull to the hip, no torso twist",
              progression: "Add reps first, then load",
            },
          ],
        },
      ],
      nutritionFocus: "Protein at every meal and a vegetable at two of them",
      habit: {
        name: "Post-lunch walk",
        trigger: "Right after you finish lunch",
        why: "Stacks movement onto a cue you already have, so it sticks",
      },
      checkpoint: "You finished both sessions and hit protein on most days",
    };
  });

  return {
    title: PRODUCT.name,
    intro: `This plan is built from your scan. It leads with ${risks[0].toLowerCase()}, the biggest drag on your projection, then works down your list in order of impact.`,
    yourSituation: `At ${result.currentAge}, your largest modifiable risks are ${risks
      .slice(0, 2)
      .join(" and ")
      .toLowerCase()}. That is where your recoverable years come from.`,
    strategy: `We go after ${risks[0].toLowerCase()} first because it is costing you the most, then layer in the rest once the first change holds.`,
    weeks,
    nutritionPlan: {
      principles: [
        "Eat protein at every meal, roughly a palm-sized portion",
        "Build each plate around protein, vegetables, and a whole-food carb",
        "Stop eating about three hours before bed",
      ],
      sampleDay: {
        breakfast: "Three eggs, oats, and a handful of berries",
        lunch: "Chicken, rice, and a big salad",
        dinner: "Salmon or tofu with potatoes and greens",
        snacks: "Greek yogurt, or fruit with a few nuts",
      },
      swaps: [
        { from: "Soda or juice", to: "Sparkling water with lime" },
        { from: "Chips", to: "Greek yogurt or edamame" },
      ],
      groceryStaples: [
        "Eggs",
        "Chicken",
        "Oats",
        "Rice",
        "Frozen vegetables",
        "Greek yogurt",
        "Olive oil",
      ],
    },
    dailyBlueprint: [
      { time: "07:00", activity: "Wake at a fixed time, water, ten minutes of light movement" },
      { time: "12:30", activity: "Protein-forward lunch, then a short walk" },
      { time: "18:00", activity: "Training session on training days" },
      { time: "21:30", activity: "Screens off, ten-minute wind-down, lights out" },
    ],
    sleepAndStress: {
      summary:
        "Get your nights and your nervous system back first; everything else gets easier.",
      protocol: [
        "Set one fixed wake time, seven days a week",
        "No screens for thirty minutes before bed",
        "Two minutes of slow breathing when stress spikes",
      ],
    },
    tenMinutePlan: {
      summary: "On the days life wins, this is the minimum that still counts.",
      movements: [
        { name: "Bodyweight squats", detail: "2 minutes at an easy pace" },
        { name: "Push-ups or incline push-ups", detail: "3 rounds of what you can do" },
        { name: "Slow breathing", detail: "2 minutes to finish" },
      ],
    },
    next7Days: [
      { day: "Day 1", action: "Do the 10-minute plan and set your fixed wake time" },
      { day: "Day 2", action: "Walk for 15 minutes and hit protein at every meal" },
      { day: "Day 3", action: "Run Week 1 strength session A" },
      { day: "Day 4", action: "Walk, then do the wind-down routine tonight" },
      { day: "Day 5", action: "Run Week 1 strength session B" },
      { day: "Day 6", action: "Make one swap from the nutrition list" },
      { day: "Day 7", action: "Review the week and write down one win" },
    ],
    troubleshooting: [
      { problem: "No time this week", fix: "Fall back to the 10-minute plan; it still counts" },
      { problem: "Lost motivation", fix: "Shrink the task. Do only the first two minutes" },
      { problem: "Sore or run down", fix: "Swap a strength day for a walk and a full night of sleep" },
    ],
    recalibration:
      "Each week the plan tightens as your numbers move. Repeat what worked, replace what did not.",
    outcomes: result.outcomes.map((o) => o.label),
    closing:
      "The date you saw assumes you change nothing. You already changed something by starting. Keep going.",
  };
}
