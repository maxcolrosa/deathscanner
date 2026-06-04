import { type Answers, type ScanResult, toValues } from "@/lib/longevity";
import { PRODUCT } from "@/lib/product";
import type {
  GuideDoc,
  GuideWeek,
  Workout,
  Exercise,
  DeepDive,
  Movement,
  SampleDay,
} from "@/lib/guide/schema";

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

/* ─── Deep-dive briefings ────────────────────────────────────────────────────
   Each major risk gets the problem / why / what-changes / actions treatment,
   personalized to the user's actual answer. Selected and ordered by severity. */

function activityBriefing(activity: string, days: number): DeepDive {
  const sedentary = activity === "none";
  return {
    heading: "Your fitness is the single biggest lever",
    problem: sedentary
      ? "You told us you rarely or never train. That places your cardiorespiratory fitness in the lowest band, the one where mortality risk climbs the fastest and muscle quietly leaves every year."
      : "You move once or twice a week. It is better than nothing, but it sits below the threshold where exercise actually starts protecting your heart, brain, and metabolism.",
    why: "Low cardiorespiratory fitness predicts early death about as strongly as smoking. An undertrained body loses muscle and insulin sensitivity, your heart pumps less efficiently, and everyday tasks start to feel heavier, which makes you move even less. It is a downward spiral with a measurable cost in years.",
    whenFixed: "Moving from the bottom fitness group to even average cuts all-cause mortality sharply, and most of that gain shows up within weeks. Your resting heart rate drops, your sleep deepens, your mood lifts, and the years you reclaim are active, capable ones rather than frail ones.",
    actions: [
      `Train ${days} days a week using the plan in this guide, starting exactly at your level, not where you wish you were`,
      "On non-training days, walk. Aim for 7,000 to 9,000 steps, broken into chunks if needed",
      "Treat the 10-minute fallback as your floor: on your worst day you still do something",
      "Add one small progression every week: a little load, one more rep, or a few more minutes",
    ],
  };
}

function dietBriefing(diet: string): DeepDive {
  const poor = diet === "poor";
  return {
    heading: poor ? "Your diet is mostly working against you" : "Your diet is close, but leaking years",
    problem: poor
      ? "Most of what you eat is processed or fast food. That means a steady drip of refined carbs, industrial oils, and very little protein or fibre."
      : "You eat a mix of fresh and processed food. The fresh part helps, but the processed twenty percent, the snacks, the liquid calories, the late-night grazing, is where the damage hides.",
    why: "Processed-heavy eating drives chronic inflammation, insulin resistance, and slow weight gain around the organs that matters most. It also crowds out protein and fibre, the two things that keep you full, hold onto muscle, and steady your blood sugar. Over years this is the engine behind type 2 diabetes, high blood pressure, and heart disease.",
    whenFixed: "Shift the base of your plate to protein, vegetables, and whole-food carbs and the effects compound fast: steadier energy, fewer cravings, easier fat loss, and blood markers that move in the right direction within a month or two. You are not chasing a perfect diet, just a defensible one.",
    actions: [
      poor
        ? "Replace one processed meal a day with a whole-food version. That single swap does most of the work"
        : "Cut the daily snack and the liquid calories first; that is your highest-leverage twenty percent",
      "Build every plate around a palm of protein, a fist of whole-food carbs, and two handfuls of vegetables",
      "Stop eating roughly three hours before bed to protect sleep and blood sugar",
      "Shop the staples list once a week so the easy choice is the default choice",
    ],
  };
}

function bodycompBriefing(bodycomp: string): DeepDive {
  const obese = bodycomp === "obese";
  return {
    heading: "Excess body fat is doing quiet damage",
    problem: obese
      ? "You are carrying a significant amount of excess weight. The fat that matters most is the visceral fat packed around your liver, pancreas, and heart."
      : "You are carrying some excess weight. Even a moderate amount of visceral fat changes how your body handles sugar and blood pressure.",
    why: "Visceral fat is metabolically active: it pumps out inflammatory signals, pushes up blood pressure, and drives insulin resistance. That is the common root of diabetes, fatty liver, and cardiovascular disease, the conditions that take the most years off the table.",
    whenFixed: "You do not need to reach a six-pack to win here. Losing even 5 to 10 percent of your body weight measurably lowers blood pressure, blood sugar, and inflammation. Joints stop aching, energy climbs, and your projected date moves in the right direction.",
    actions: [
      "Prioritize protein and strength training so the weight you lose is fat, not muscle",
      "Aim for slow, steady loss of around 0.5 kg a week; faster is mostly water and muscle",
      "Use the daily blueprint to stack movement into the gaps in your day",
      "Track the trend with how your clothes fit, not a daily number on the scale",
    ],
  };
}

function sleepBriefing(sleep: string): DeepDive {
  return {
    heading: "Your sleep is undercutting everything else",
    problem:
      sleep === "low"
        ? "You sleep under five hours on a typical night. That is well into the range where the body cannot fully recover."
        : "You sleep five to six hours most nights. It feels survivable, but it leaves a recovery debt that compounds.",
    why: "Short sleep raises cortisol and appetite hormones, blunts insulin sensitivity, and weakens your immune system. It also sabotages the other levers: undertrained, underfed, and stressed all get worse when you are tired, because tired people skip workouts and reach for sugar.",
    whenFixed: "Add even an hour of quality sleep and the rest of the plan gets easier almost overnight. Cravings fall, training recovers, mood steadies, and the cardiovascular strain of short sleep starts to reverse. Sleep is the cheapest performance upgrade you have.",
    actions: [
      "Set one fixed wake time, seven days a week, including weekends",
      "Get to bed thirty minutes earlier than usual, starting tonight",
      "No screens for the last thirty minutes, and keep the room dark and cool",
      "Keep caffeine to before midday so it is out of your system by bedtime",
    ],
  };
}

function stressBriefing(stress: string): DeepDive {
  return {
    heading: "Chronic stress is taxing your heart",
    problem:
      stress === "severe"
        ? "You described constant stress with poor recovery. Your nervous system rarely gets to stand down."
        : "Your stress runs high most days. The spikes are normal; the problem is that they never fully switch off.",
    why: "Sustained stress keeps cortisol and blood pressure elevated, drives belly-fat storage, disrupts sleep, and pushes you toward food and drink for relief. Left unmanaged for years, it is a genuine cardiovascular risk factor, not just a mood problem.",
    whenFixed: "You cannot delete stress, but you can change how your body carries it. A few minutes of daily down-regulation lowers resting heart rate and blood pressure, improves sleep, and makes the cravings and the short fuse easier to manage.",
    actions: [
      "Two minutes of slow breathing when stress spikes: four counts in, six counts out",
      "One daily walk outside with no phone, ideally in daylight",
      "Protect one genuine recovery block a week that is not work and not chores",
      "Use training as a release valve, not another box to perform in",
    ],
  };
}

function smokingBriefing(smoking: string): DeepDive {
  const heavy = smoking === "heavy";
  return {
    heading: "Tobacco is your largest single risk",
    problem: heavy
      ? "You use tobacco daily. Of everything in your scan, this is the biggest single subtraction from your projected lifespan."
      : "You use tobacco, even if lightly. There is no safe amount; light and occasional use still raises cardiovascular and cancer risk.",
    why: "Smoking damages the lining of your blood vessels, accelerates plaque, and multiplies the risk of the cancers and heart disease that end lives early. It also quietly degrades fitness, recovery, and sleep, working against every other change you make.",
    whenFixed: "The repair starts fast. Within weeks circulation and lung function improve; within a year the excess heart-disease risk roughly halves. No other single change buys back as many years, which is why your plan supports it directly.",
    actions: [
      "Set a quit date inside the next two weeks and tell one person",
      "Use the training sessions as your replacement ritual when a craving hits",
      "Ask your doctor or pharmacist about nicotine replacement or medication; it doubles success rates",
      "Expect a few hard weeks, then a steep, permanent payoff",
    ],
  };
}

function alcoholBriefing(alcohol: string): DeepDive {
  const heavy = alcohol === "heavy";
  return {
    heading: "Alcohol is dragging on your recovery",
    problem: heavy
      ? "You drink heavily most days. That is a constant load on your liver, heart, and sleep."
      : "You drink most days. The amount sounds moderate, but daily is the pattern that adds up.",
    why: "Regular alcohol disrupts deep sleep, adds empty calories, raises blood pressure, and over time strains the liver and heart while raising cancer risk. It also blunts training recovery, so you get less back from the work you put in.",
    whenFixed: "Cut the daily drink and sleep deepens within days, fat loss gets easier, and blood pressure drifts down. You do not have to go dry forever; you have to break the every-night default.",
    actions: [
      "Set three or four alcohol-free nights a week to start, and keep them non-negotiable",
      "Never drink in the last three hours before bed, where it does the most damage to sleep",
      "Swap one drink for sparkling water with lime; the ritual matters more than the alcohol",
      "Keep it out of the house on training days",
    ],
  };
}

function conditionsBriefing(conditions: string[]): DeepDive {
  const named = conditions
    .filter((c) => c !== "none")
    .map((c) =>
      c === "highbp" ? "high blood pressure" : c === "cholesterol" ? "high cholesterol" : "blood-sugar dysregulation"
    );
  const list = named.length > 1 ? `${named.slice(0, -1).join(", ")} and ${named.slice(-1)}` : named[0];
  return {
    heading: "Your diagnosed markers are highly responsive",
    problem: `You flagged ${list}. These are not background facts; they are the dials that most directly move your cardiovascular risk, and they respond to how you live.`,
    why: "Raised blood pressure, cholesterol, and blood sugar are the front line of heart disease and stroke. They tend to travel together, feed each other, and worsen silently for years before they announce themselves.",
    whenFixed: "These markers are unusually responsive to exactly the levers in this guide: losing visceral fat, training, cutting processed food and alcohol, and sleeping. Many people watch them improve enough that their doctor revisits the conversation about medication.",
    actions: [
      "Make the nutrition and training plan non-negotiable; this is where these numbers move",
      "Keep taking any prescribed medication, and re-test with your doctor as your habits change",
      "Cut added salt, processed food, and alcohol first; they hit blood pressure fastest",
      "Track your numbers over months, not days, and let the trend tell the story",
    ],
  };
}

function socialBriefing(social: string): DeepDive {
  return {
    heading: "Social connection protects your health",
    problem:
      social === "lonely"
        ? "You told us you often feel lonely or disconnected. That is not just a feeling; it registers in your body."
        : "You feel somewhat isolated. Modern life makes that easy, and it carries a real health cost.",
    why: "Chronic loneliness raises stress hormones, blood pressure, and inflammation, and in large studies it predicts mortality on a scale comparable to smoking. We are wired to co-regulate with other people; without that, the body stays subtly on guard.",
    whenFixed: "Rebuilding a few reliable connections lowers stress reactivity, improves sleep and mood, and makes every other habit stickier, because people who feel supported follow through. Accountability is not a nice-to-have; it is a mechanism.",
    actions: [
      "Schedule one real-world social contact a week and treat it like an appointment",
      "Train with one other person, or share your weekly check-in with someone",
      "Join the community thread that comes with this plan and post your first win",
      "Replace some passive screen time with a message or a call to someone who matters",
    ],
  };
}

// Foundational briefings used to guarantee at least three, even for a clean profile.
function foundationBriefings(days: number): DeepDive[] {
  return [
    activityBriefing("light", days),
    {
      heading: "Protein and muscle are your longevity insurance",
      problem: "Most people lose muscle steadily from their thirties onward, and most diets quietly under-deliver protein.",
      why: "Muscle is metabolic armor: it stores glucose, protects your joints, and strongly predicts independence and survival in later life. Lose it and everything from blood sugar to balance gets worse.",
      whenFixed: "Eating enough protein and lifting twice a week holds and rebuilds muscle, which keeps your metabolism resilient and your future self strong and mobile.",
      actions: [
        "Eat a palm of protein at every meal, every day",
        "Lift at least twice a week using the plan here",
        "Progress the load or reps a little each week so the muscle has a reason to stay",
      ],
    },
    sleepBriefing("belowavg"),
  ];
}

function buildRiskBriefings(answers: Answers, result: ScanResult): DeepDive[] {
  const days = daysPerWeek(str(answers.activity) || "moderate");
  const conditions = toValues(answers.conditions);
  const candidates: { sev: number; dive: DeepDive }[] = [];
  const add = (sev: number, dive: DeepDive) => candidates.push({ sev, dive });

  if (answers.smoking === "heavy") add(9.5, smokingBriefing("heavy"));
  else if (answers.smoking && answers.smoking !== "never") add(4.5, smokingBriefing(str(answers.smoking)));
  if (answers.activity === "none") add(8, activityBriefing("none", days));
  else if (answers.activity === "light") add(5, activityBriefing("light", days));
  if (answers.alcohol === "heavy") add(7, alcoholBriefing("heavy"));
  else if (answers.alcohol === "moderate") add(4, alcoholBriefing("moderate"));
  if (answers.bodycomp === "obese") add(7, bodycompBriefing("obese"));
  else if (answers.bodycomp === "over") add(3.5, bodycompBriefing("over"));
  if (answers.diet === "poor") add(6, dietBriefing("poor"));
  else if (answers.diet === "average") add(2.5, dietBriefing("average"));
  if (answers.sleep === "low") add(5.5, sleepBriefing("low"));
  else if (answers.sleep === "belowavg") add(2.8, sleepBriefing("belowavg"));
  if (answers.stress === "severe") add(5, stressBriefing("severe"));
  else if (answers.stress === "high") add(2.6, stressBriefing("high"));
  if (conditions.some((c) => c !== "none")) add(6.5, conditionsBriefing(conditions));
  if (answers.social === "lonely") add(4, socialBriefing("lonely"));
  else if (answers.social === "some") add(2.2, socialBriefing("some"));

  void result;
  const chosen = candidates.sort((a, b) => b.sev - a.sev).slice(0, 5).map((c) => c.dive);
  if (chosen.length >= 3) return chosen;

  // Pad to the minimum of three with foundational briefings not already covered.
  const headings = new Set(chosen.map((d) => d.heading));
  for (const f of foundationBriefings(days)) {
    if (chosen.length >= 3) break;
    if (!headings.has(f.heading)) {
      chosen.push(f);
      headings.add(f.heading);
    }
  }
  return chosen;
}

/* ─── Training plan ──────────────────────────────────────────────────────── */

function buildTrainingPlan(level: Level, injury: boolean, days: number, workouts: Workout[]) {
  const approach: DeepDive = {
    heading: "How this plan actually builds you",
    problem:
      level === "beginner"
        ? "Most beginner programs fail in one of two ways: too much too soon, so you burn out or get hurt, or too little, so nothing changes."
        : "Plateaus come from training hard but never progressively, doing the same sessions at the same effort week after week.",
    why: "Muscle and fitness only adapt when you give them a reason to: a stimulus slightly beyond what they are used to, repeated and then nudged upward. That is progressive overload, and it is the one principle every working program shares.",
    whenFixed: "Apply it correctly and progress becomes almost boring in its reliability: a little more each week, recovered properly, compounding into real strength, a leaner frame, and a heart and metabolism that work like someone years younger.",
    actions: [
      `Train ${days} days a week, full-body, leaving one or two reps in reserve on each set`,
      "Warm up first; it is short, and it is where you stay injury-free",
      "Log every session so 'a little more than last week' is a fact, not a guess",
      injury
        ? "Use the low-impact variant of any movement and stop before pain, never through it"
        : "When a movement feels easy across all sets, add load or a rep next time",
    ],
  };
  const warmup: Movement[] = [
    { name: "Easy cardio to raise your temperature", detail: "3 minutes of brisk walking, marching, or easy bike" },
    { name: "World's greatest stretch", detail: "5 slow reps per side" },
    { name: "Glute bridges and bodyweight squats", detail: "10 of each" },
    { name: "Two light ramp-up sets of your first lift", detail: "Before your working weight" },
  ];
  const progressionRules = [
    "Hit the top of the rep range on every set? Add load next session, usually the smallest jump available.",
    "Add reps before you add weight: work from the bottom of the range to the top, then increase the load and drop back down.",
    "Could not complete your sets two sessions in a row? Hold the weight, or drop it ten percent and rebuild.",
    "Form breaks before the last rep? That set is done. Quality reps are the only ones that count.",
  ];
  const deload =
    "Every fourth or fifth week, take a lighter week: same sessions, roughly two-thirds of the load and effort. It feels like a step back and is actually where the adaptation catches up. Then resume where you left off.";
  return { approach, workouts, warmup, progressionRules, deload };
}

/* ─── Nutrition plan ─────────────────────────────────────────────────────── */

function proteinTarget(bodycomp: string): string {
  if (bodycomp === "obese" || bodycomp === "over")
    return "a palm of protein at every meal, leaning to the larger side of your palm";
  return "a palm of protein at every meal";
}

function buildNutritionPlan(diet: string, goal: string | null, bodycomp: string) {
  const philosophy = dietBriefing(diet);
  const principles: string[] = [
    `Eat ${proteinTarget(bodycomp)}`,
    "Build each plate around protein, vegetables, and a whole-food carb",
    "Stop eating about three hours before bed",
    "Eighty percent consistent beats one hundred percent for a week and then quitting",
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
    swaps.push({ from: "Pastry breakfast", to: "Eggs or yogurt with oats" });
  } else if (diet === "average") {
    swaps.push({ from: "Afternoon snack run", to: "Pre-portioned nuts or fruit" });
    swaps.push({ from: "A second sugary coffee", to: "Black coffee or one with milk" });
    swaps.push({ from: "Refined white carbs", to: "The whole-grain or potato version" });
  } else {
    swaps.push({ from: "Mindless weekend grazing", to: "A planned bigger meal you actually enjoy" });
    swaps.push({ from: "Under-eating protein on busy days", to: "A protein shake as the backup" });
  }

  const carbNote = goal === "strength" ? "extra rice or potatoes on training days" : "a fist of whole-food carbs";
  const sampleDays: SampleDay[] = [
    {
      label: "A training day",
      breakfast: "Three eggs or Greek yogurt, oats, and a handful of berries",
      lunch: `Chicken or tofu, ${carbNote}, and a big salad`,
      dinner: "Salmon, lean beef, or beans with potatoes and greens",
      snacks: goal === "fat" ? "Greek yogurt, or vegetables and hummus" : "Greek yogurt, or fruit with a few nuts",
    },
    {
      label: "A rest day",
      breakfast: "Veggie omelette or a high-protein yogurt bowl",
      lunch: "Big mixed salad with two palms of protein and olive oil",
      dinner: "Stir-fry with tofu or chicken, plenty of vegetables, a smaller scoop of rice",
      snacks: "A piece of fruit and a small handful of nuts",
    },
    {
      label: "An eating-out day",
      breakfast: "Keep it normal at home so the meal out is the only variable",
      lunch: "Grilled protein, double the vegetables, dressing on the side",
      dinner: "A sensible main you enjoy, one drink at most, and skip the bread basket",
      snacks: "None needed; you planned the bigger meal in",
    },
  ];
  const groceryStaples = [
    "Eggs",
    "Chicken or tofu",
    "Greek yogurt",
    "Oats",
    "Rice or potatoes",
    "Frozen vegetables",
    "Olive oil",
    "Fruit",
    "Tinned fish or beans",
    "Nuts",
  ];
  const eatingOut = [
    "Decide what you will order before you arrive, while you are not hungry",
    "Anchor the plate to a grilled or roasted protein and double the vegetables",
    "Cap it at one drink, and ask for water alongside",
    "You do not need to be perfect; you need to not undo the whole week in one sitting",
  ];
  const hydration =
    "Drink water through the day, roughly two to three litres for most adults, more on training days. Thirst often masquerades as hunger and as the mid-afternoon energy crash; a glass of water before you reach for a snack settles which one it really is.";
  return {
    philosophy,
    proteinTarget: proteinTarget(bodycomp),
    hydration,
    principles,
    sampleDays,
    swaps,
    groceryStaples,
    eatingOut,
  };
}

/* ─── Sleep and stress ───────────────────────────────────────────────────── */

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
  protocol.push("Keep caffeine before midday so it is gone by bedtime");

  // The briefing leans on whichever of sleep or stress is the bigger problem.
  const sleepIsWorse = sleep === "low" || sleep === "belowavg";
  const briefing = sleepIsWorse ? sleepBriefing(sleep) : stressBriefing(stress === "" ? "high" : stress);
  return { briefing, protocol };
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

function buildProgressMarkers(goal: string | null) {
  const markers = [
    "How your waistband and your fitted clothes feel, checked once a week, not daily",
    "Your resting heart rate first thing in the morning, trending down over weeks",
    "Energy at 3pm: steady instead of a crash and a craving",
    "Stairs and hills: less breathless than a month ago",
    "Strength on the log: more reps or load on the same movements",
    "Sleep quality and morning mood, the quiet markers that move first",
  ];
  if (goal === "fat") markers.unshift("The trend line of your weekly average weight, not any single morning");
  if (goal === "strength") markers.unshift("Working weights climbing on your main lifts week to week");
  return {
    summary:
      "You do not need a lab or a smartwatch to know this is working. The body gives you honest, free signals if you watch the right ones over weeks rather than days.",
    markers: markers.slice(0, 6),
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
    { problem: "No time this week", fix: "Fall back to the 10-minute plan; it still counts. Two short walks beat one skipped session" },
    { problem: "Lost motivation", fix: "Shrink the task. Do only the first two minutes; momentum almost always carries you further" },
    { problem: "Sore or run down", fix: "Swap a strength day for a walk and a full night of sleep, then resume" },
    { problem: "The scale will not move", fix: "Judge a fortnight, not a morning. Check the trend, your measurements, and your protein before changing anything" },
    { problem: "Travelling or away from home", fix: "Bodyweight circuit in the room, protein at every meal, and walk the new place" },
  ];
  if (barrier === "injury")
    t.unshift({ problem: "An old injury flares up", fix: "Use the low-impact variant and stop before pain. Never push through joint pain" });
  if (barrier === "howto")
    t.unshift({ problem: "Not sure how an exercise works", fix: "Search the exercise name plus the word form, and copy a slow demo before adding load" });
  return t;
}

function buildFaqs(level: Level, injury: boolean, goal: string | null, days: number) {
  const faqs = [
    {
      q: "Do I need a gym?",
      a:
        level === "beginner"
          ? "No. The plan runs on a pair of adjustable dumbbells, a bench or sturdy chair, and a resistance band. A gym is a nice-to-have, not a requirement."
          : "A basic gym or a home setup with adjustable dumbbells and a bench covers everything here. Use what you have and progress the load over time.",
    },
    {
      q: "How long until I see results?",
      a: "Energy, sleep, and mood usually shift within the first two weeks. Visible changes in the mirror and on your measurements tend to show around weeks four to eight if you stay consistent.",
    },
    {
      q: `Why only ${days} training days a week?`,
      a: "Because the plan you actually do beats the perfect plan you abandon. " +
        (days <= 2
          ? "Two well-run full-body sessions plus daily walking is enough to drive real change at your starting point."
          : "Three to four full-body sessions hit the sweet spot of stimulus and recovery for most people. You can add a session later once this is a habit."),
    },
    {
      q: "What if I miss a day or a whole week?",
      a: "Nothing is ruined. Do not try to make it up or punish yourself; just start the next session as planned. Consistency over months is what moves your numbers, not any single week.",
    },
    {
      q: injury ? "I have an old injury, is this safe?" : "Do I need supplements?",
      a: injury
        ? "Every movement in this plan has a low-impact variant, and the rule is simple: work in a pain-free range and stop before pain, never through it. If a movement consistently hurts, skip it and see a physio."
        : "No supplement replaces protein, sleep, and training. If your diet is short on protein, a basic whey or plant protein powder is a convenient backup. Creatine and vitamin D are the two with the most evidence behind them, but they are optional.",
    },
    {
      q: "Is the date from my scan really going to change?",
      a:
        "The estimate assumes you keep living the way you do now. It is a projection, not a sentence. Change the inputs, the modifiable habits this plan targets, and a model fed those new inputs returns a later date. That is the entire point of the plan." +
        (goal === "heart" ? " Protecting your heart is exactly where the biggest gains sit." : ""),
    },
  ];
  return faqs;
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

// Phase-based themes keep weeks coherent as a training progression.
// Risk personalization lives in riskBriefings/yourSituation/strategy; it
// must not bleed into the weekly grid where it would read as mismatched
// (e.g. "Week 3: Tobacco use" paired with a strength session).
const PHASE_THEME: Record<string, string> = {
  Foundation: "Groove the movement patterns, lock in protein, and protect your sleep.",
  Build: "Add load and volume each session, tighten nutrition, and build the streak.",
  Push: "Drive intensity, consolidate the habits, and finish strong.",
};

// Deterministic, offline guide generation. Branches on the user's answers so it
// reads as personalized, with no network or AI call.
export function buildGuide(result: ScanResult, answers: Answers): GuideDoc {
  const activity = str(answers.activity) || "moderate";
  const diet = str(answers.diet) || "average";
  const bodycomp = str(answers.bodycomp) || "healthy";
  const sleep = str(answers.sleep) || "optimal";
  const stress = str(answers.stress) || "moderate";
  const barriers = toValues(answers.activity_barrier);
  const injury = barriers.includes("injury");
  const barrier = injury ? "injury" : barriers[0] ?? "";
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
    const block = i < 2 ? "Foundation" : i < 5 ? "Build" : "Push";
    return {
      week: i + 1,
      theme: PHASE_THEME[block],
      focus: `Week ${i + 1}: ${block}`,
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
    intro: `This plan is built from your scan. It is calibrated to where you are now, a ${level === "beginner" ? "simple, beginner-friendly" : "step-up"} program to help you ${goalText}. Everything here is sequenced, so you always know the single next thing to do.`,
    yourSituation: `At ${result.currentAge}, your largest modifiable risks are ${risks.slice(0, 2).join(" and ").toLowerCase()}. ${injury ? "Because you flagged a past injury, every movement here has a low-impact version. " : ""}That is where your recoverable years come from, and it is where this plan spends its energy first.`,
    strategy: `We attack ${risks[0].toLowerCase()} first because it is costing you the most, then work down your list in order of impact. Training is ${days} days a week, eating is built around protein and whole foods, and the plan tightens as your numbers move. You do not do everything at once; you stack one win on the last.`,
    riskBriefings: buildRiskBriefings(answers, result),
    training: buildTrainingPlan(level, injury, days, workouts),
    weeks,
    nutritionPlan: buildNutritionPlan(diet, goal, bodycomp),
    dailyBlueprint: [
      { time: "07:00", activity: "Wake at your fixed time, water, ten minutes of light movement" },
      { time: "12:30", activity: "Protein-forward lunch, then a short walk" },
      { time: "15:00", activity: "Water and a protein-forward snack to head off the afternoon crash" },
      { time: "18:00", activity: "Training session on training days, otherwise a walk" },
      { time: "21:30", activity: "Screens off, ten-minute wind-down, lights out" },
    ],
    sleepAndStress: buildSleepAndStress(sleep, stress),
    tenMinutePlan: buildTenMinutePlan(barrier, injury),
    progressMarkers: buildProgressMarkers(goal),
    next7Days: buildNext7Days(barrier, injury),
    troubleshooting: buildTroubleshooting(barrier),
    faqs: buildFaqs(level, injury, goal, days),
    recalibration: "Each week the plan tightens as your numbers move. Add a little load or a little distance, repeat what worked, and replace what did not. Every fourth or fifth week, take the lighter deload week so your body can catch up and consolidate the gains.",
    outcomes: result.outcomes.map((o) => o.label),
    closing: "The date you saw assumes you change nothing. You already changed something by starting. Pick Day 1, do the first small thing, and let the plan carry the rest. Keep going.",
  };
}
