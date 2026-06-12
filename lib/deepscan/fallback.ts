// Deterministic, offline Deepscan builder. Used when ANTHROPIC_API_KEY is not
// configured (dev, e2e, CI) and as the fallback if the AI call fails, so a
// buyer always receives a complete report. Same inputs => same output.
//
// Mirrors the 28-question intake in questions.ts: ~12 markers, 7 narrative
// sections each with concrete actions, and an ordered priority list.

import type { Answers, ScanResult } from "@/lib/longevity";
import { toValues } from "@/lib/longevity";
import { deepscanLabel } from "@/lib/deepscan/questions";
import type { DeepscanMarker, DeepscanReport, DeepscanSection } from "@/lib/deepscan/schema";

type Deep = Record<string, string | string[]>;
type Status = DeepscanMarker["status"];

function one(deep: Deep, id: string): string {
  return toValues(deep[id])[0] ?? "";
}

function many(deep: Deep, id: string): string[] {
  return toValues(deep[id]).filter((v) => v !== "none");
}

// Per-question status maps. Anything not listed defaults to "watch".
const STATUS: Record<string, Record<string, Status>> = {
  ds_waist_m: { low: "optimal", mid: "watch", high: "flag", unknown: "watch" },
  ds_waist_f: { low: "optimal", mid: "watch", high: "flag", unknown: "watch" },
  ds_weight_trend: { steady: "optimal", creep: "watch", jump: "flag", swing: "watch" },
  ds_strength: { easy: "optimal", slow: "watch", doubt: "flag", no: "flag" },
  ds_rhr: { under60: "optimal", "60to70": "optimal", "70to80": "watch", over80: "flag", unknown: "watch" },
  ds_bp: { normal: "optimal", borderline: "watch", high: "flag", unknown: "watch" },
  ds_stairs: { fine: "optimal", harder: "optimal", winded: "watch", avoid: "flag" },
  ds_protein: { most: "optimal", daily: "watch", rare: "flag", unknown: "watch" },
  ds_sugar: { none: "optimal", one: "watch", few: "flag", heavy: "flag" },
  ds_veg: { high: "optimal", mid: "watch", low: "flag", none: "flag" },
  ds_water: { low: "flag", mid: "watch", high: "optimal" },
  ds_caffeine: { none: "optimal", light: "optimal", moderate: "watch", heavy: "flag" },
  ds_sleep_schedule: { consistent: "optimal", weekend: "watch", chaos: "flag" },
  ds_wake: { fresh: "optimal", groggy: "watch", tired: "flag", exhausted: "flag" },
  ds_sitting: { low: "optimal", mid: "watch", high: "flag", extreme: "flag" },
};

function status(deep: Deep, id: string): Status {
  return STATUS[id]?.[one(deep, id)] ?? "watch";
}

function marker(deep: Deep, id: string, name: string, note: string): DeepscanMarker {
  return {
    name,
    band: deepscanLabel(id, one(deep, id)) || "Not provided",
    status: status(deep, id),
    note,
  };
}

const RHR_NOTES: Record<string, string> = {
  under60: "A low resting rate points at a heart that does not have to work hard. Keep it.",
  "60to70": "Inside the healthy range. Conditioning work will push it lower.",
  "70to80": "Slightly elevated. This usually drops within 6 to 8 weeks of regular conditioning.",
  over80: "An elevated resting rate is one of the most consistent early warning markers there is.",
  unknown: "Worth measuring this week. It is the cheapest heart marker you have.",
};

const BP_NOTES: Record<string, string> = {
  normal: "Normal pressure protects every organ downstream. Hold it there.",
  borderline: "Borderline pressure responds fast to training, sodium, and sleep. This is winnable.",
  high: "High pressure quietly wears your arteries every day it stays up. Treat this as priority one with your doctor.",
  unknown: "Unmeasured pressure is unmanaged pressure. Get a reading this month.",
};

function waistNote(value: string): string {
  switch (value) {
    case "low": return "Your waist band sits in the lower-risk range for your sex.";
    case "mid": return "This band carries measurably higher metabolic risk. The fat-loss levers in your plan target it directly.";
    case "high": return "Waist size in this band is one of the strongest predictors of metabolic disease. It is also one of the most reversible.";
    default: return "Measure once, at the belly button, relaxed. You want a real baseline before week one.";
  }
}

export function buildDeepscanFallback(
  result: ScanResult,
  answers: Answers,
  deep: Deep
): DeepscanReport {
  const male = answers.sex === "male";
  const waistId = male ? "ds_waist_m" : "ds_waist_f";

  /* ── Markers ───────────────────────────────────────────────────────────── */

  const markers: DeepscanMarker[] = [
    marker(deep, waistId, "Waist circumference", waistNote(one(deep, waistId))),
    marker(deep, "ds_weight_trend", "5-year weight trajectory",
      one(deep, "ds_weight_trend") === "steady"
        ? "A flat trajectory means your habits and your metabolism are at peace. Rare, and worth protecting."
        : one(deep, "ds_weight_trend") === "swing"
          ? "Yo-yo cycles usually mean diets that work until they end. Your plan is built around habits that do not end."
          : "A slow creep is how most people gain 30 lbs without ever deciding to. Catching it now is the whole game."),
    marker(deep, "ds_strength", "Functional strength",
      status(deep, "ds_strength") === "optimal"
        ? "Real carrying strength. Strength predicts survival better than almost any lab value."
        : "Strength you can use is the marker here, and it responds to training within weeks at any age."),
    marker(deep, "ds_rhr", "Resting heart rate", RHR_NOTES[one(deep, "ds_rhr")] ?? "Worth a baseline measurement."),
    marker(deep, "ds_bp", "Blood pressure", BP_NOTES[one(deep, "ds_bp")] ?? "Get a current reading."),
    marker(deep, "ds_stairs", "Cardio recovery",
      status(deep, "ds_stairs") === "optimal"
        ? "Stair recovery is a usable proxy for VO2 max, and yours is holding."
        : "Getting winded on two flights puts your aerobic base below where your heart wants it. It rebuilds fast."),
    marker(deep, "ds_protein", "Protein intake",
      one(deep, "ds_protein") === "most"
        ? "Protein at most meals protects muscle, which protects everything else."
        : "Under-eating protein makes every other goal harder. Your plan fixes this first."),
    marker(deep, "ds_sugar", "Liquid sugar load",
      one(deep, "ds_sugar") === "none"
        ? "No liquid sugar. The single easiest metabolic win, already banked."
        : "Sugar you drink hits your blood faster than sugar you chew and never registers as food. Cutting it is the highest-leverage diet edit there is."),
    marker(deep, "ds_water", "Hydration",
      one(deep, "ds_water") === "high"
        ? "Adequate hydration. One less thing dragging on energy and appetite."
        : "Low hydration reads as fatigue and hunger. The cheapest fix on this list."),
    marker(deep, "ds_caffeine", "Stimulant load",
      one(deep, "ds_caffeine") === "heavy"
        ? "At this dose, caffeine is borrowing energy from tomorrow and taxing your sleep to pay for it."
        : "Within a range your sleep can absorb, as long as the last dose lands before mid-afternoon."),
    marker(deep, "ds_sleep_schedule", "Sleep consistency",
      one(deep, "ds_sleep_schedule") === "consistent"
        ? "A fixed sleep window is the strongest free recovery tool there is, and you already use it."
        : "An irregular sleep window gives you jet lag without the travel. Anchoring your wake time is the fix."),
    marker(deep, "ds_sitting", "Sedentary hours",
      one(deep, "ds_sitting") === "low"
        ? "Low sitting time blunts the risk that training alone cannot undo."
        : "Long sitting blocks circulation and blunts the benefit of your workouts. Movement snacks in your plan break it up."),
  ];

  /* ── Sections ──────────────────────────────────────────────────────────── */

  const digestion = many(deep, "ds_digestion");
  const pain = many(deep, "ds_pain");

  const bodySection: DeepscanSection = {
    title: "Body composition and strength",
    body: [
      one(deep, waistId) === "high" || one(deep, waistId) === "mid"
        ? "Your waist band is the number to track, because it follows visceral fat, the kind packed around your organs that drives metabolic disease. It moves within weeks of consistent training and protein, well before the bathroom scale tells a story."
        : "Your waist band is not the limiting factor, which frees your plan to chase strength and capacity instead of damage control.",
      one(deep, "ds_weight_trend") === "creep" || one(deep, "ds_weight_trend") === "jump"
        ? "The weight trend matters more than the weight: a climb over five years means the current routine has a built-in surplus, and the plan interrupts it with protein-first meals and progressive training rather than another short diet."
        : "Your weight history suggests your baseline habits roughly balance, so the plan's job is recomposition, trading fat for muscle at the same scale weight.",
      status(deep, "ds_strength") === "optimal"
        ? "Your functional strength is an asset. Muscle is the organ of longevity: it stores glucose, protects joints, and keeps you independent at 80."
        : "The grocery-bag test you just failed on paper is the one to retake in 8 weeks. Strength returns faster than any other marker, and every workout in your plan is built around the lifts that bring it back.",
      one(deep, "ds_mobility") === "far"
        ? "Your toe-touch result says your posterior chain is locked up, which makes training feel worse than it should. The warm-up sequence in your plan is not optional for you."
        : "Mobility is workable, so the warm-ups in your plan will hold it while the load climbs.",
    ].join(" "),
    actions: [
      "Take three baseline numbers this week: waist at the belly button, body weight, and the grocery-bag stair test.",
      one(deep, waistId) === "unknown"
        ? "Measure your waist once, relaxed, and write it down. Re-measure every 2 weeks, same conditions."
        : "Re-measure your waist every 2 weeks, same time of day, and judge the plan by that number, not the scale.",
      status(deep, "ds_strength") === "optimal"
        ? "Add a small amount of load or one rep to your main lifts each week. Strength you do not push, you lose."
        : "Do your plan's strength sessions before anything else on the schedule. They are your highest-return hours.",
    ],
  };

  const vitalsSection: DeepscanSection = {
    title: "Cardiometabolic picture",
    body: [
      `Your scan put your estimate at ${result.lifeExpectancy.toFixed(1)} years, and the vitals you just reported explain part of why.`,
      one(deep, "ds_bp") === "high" || one(deep, "ds_rhr") === "over80"
        ? "Your pressure and resting rate are doing more work than they should. That pattern is exactly what conditioning, weight loss, and sodium control reverse fastest, and it is also the one worth a doctor's eyes now, not after the 90 days."
        : "Your pressure and resting rate do not show an acute red flag, so the job is protecting that margin while the bigger levers move.",
      one(deep, "ds_stairs") === "winded" || one(deep, "ds_stairs") === "avoid"
        ? "Getting winded on stairs is your aerobic base talking. VO2 max, which stair tolerance loosely tracks, is among the strongest predictors of lifespan ever measured, and it is trainable at every age."
        : "Your stair recovery suggests a workable aerobic base, which your plan's conditioning blocks will push higher.",
      one(deep, "ds_bloodwork") === "long" || one(deep, "ds_bloodwork") === "never"
        ? "You are also flying blind on blood work. A standard panel is cheap, and it turns this report's estimates into measurements."
        : "Your recent blood work means you have real numbers to compare against in 90 days. Use them.",
    ].join(" "),
    actions: [
      one(deep, "ds_bp") === "high"
        ? "Book a blood pressure review with your doctor this month. The plan supports treatment; it does not replace it."
        : one(deep, "ds_bp") === "unknown"
          ? "Get a blood pressure reading this month. A pharmacy machine is fine for a baseline."
          : "Re-check your blood pressure at the end of the 90 days and bank the comparison.",
      one(deep, "ds_rhr") === "unknown"
        ? "Measure your resting heart rate three mornings this week, before coffee, and keep the average."
        : "Track your resting heart rate weekly. A falling number is your plan working, in real time.",
      one(deep, "ds_bloodwork") === "long" || one(deep, "ds_bloodwork") === "never"
        ? "Ask your doctor for a standard panel: lipids, fasting glucose or A1c, and a metabolic panel. Do it before week 4 so you can re-test after the 90 days."
        : "Keep your last panel handy and re-test after the 90 days. That before-and-after is the proof.",
    ],
  };

  const fuelSection: DeepscanSection = {
    title: "Fueling",
    body: [
      one(deep, "ds_protein") === "most"
        ? "Protein intake looks solid, so the diet work is about quality and timing rather than rebuilding the basics."
        : "The single biggest diet gap is protein. Until most meals carry a real serving, fat loss eats muscle and hunger stays in charge.",
      one(deep, "ds_sugar") === "few" || one(deep, "ds_sugar") === "heavy"
        ? "Your liquid sugar habit is quietly outspending everything else: drinks bypass fullness signals entirely, so the calories land without the satisfaction. Swapping them is worth more than any superfood you could add."
        : "With liquid sugar under control, your blood glucose has one less rollercoaster to ride each day.",
      one(deep, "ds_veg") === "low" || one(deep, "ds_veg") === "none"
        ? "Vegetable intake is low, which costs you fiber, and fiber is what keeps blood sugar flat and hunger honest between meals."
        : "Your produce intake gives the plan a fiber base to build on.",
      one(deep, "ds_latenight") === "most"
        ? "Eating right before bed splits your night between digestion and recovery, and recovery loses. Pulling your last meal earlier is one of the cheapest sleep upgrades available."
        : "Your meal timing leaves your nights free for actual recovery.",
      digestion.length > 0
        ? `You flagged ${digestion.length > 1 ? "digestive symptoms" : "a digestive symptom"} worth tracking against specific foods for two weeks; patterns usually show up fast.`
        : "No recurring digestive complaints, which removes a whole class of confounders from the plan.",
    ].join(" "),
    actions: [
      one(deep, "ds_protein") === "most"
        ? "Keep protein anchored at every meal and let the recipe bank handle variety."
        : "Put a palm-sized serving of protein in your first meal of the day, every day, starting tomorrow.",
      one(deep, "ds_sugar") === "few" || one(deep, "ds_sugar") === "heavy"
        ? "Swap every sugary drink after the first one for water or a zero-sugar version. One edit, hundreds of calories a day."
        : "Hold the line on liquid sugar; it is your biggest banked win.",
      one(deep, "ds_water") === "low"
        ? "Drink a full glass of water with every meal and one mid-morning. Boring, and it works."
        : "Keep water near your desk so hydration never depends on remembering.",
      one(deep, "ds_latenight") === "most"
        ? "Close the kitchen 2 hours before bed at least 5 nights a week."
        : "Keep your last meal where it is; the gap before bed is working for you.",
    ],
  };

  const recoverySection: DeepscanSection = {
    title: "Recovery and sleep",
    body: [
      one(deep, "ds_sleep_schedule") === "chaos"
        ? "Your sleep window moves around enough to give you permanent social jet lag. The body runs repairs on a schedule; when bed and wake times drift, deep sleep gets cut first, and deep sleep is where the physical recovery happens."
        : one(deep, "ds_sleep_schedule") === "weekend"
          ? "Weekday discipline with weekend drift is the most common sleep pattern there is, and the Monday grogginess you probably feel is the bill for it."
          : "A consistent sleep window is the strongest free recovery tool there is, and you already run one.",
      one(deep, "ds_wake") === "tired" || one(deep, "ds_wake") === "exhausted"
        ? "Waking up tired regardless of duration says the problem is quality, not just hours: late food, screens, caffeine timing, and an irregular window are the usual suspects, and you can fix all four without a gadget."
        : "Your mornings suggest your sleep quality is broadly intact, which makes everything else in the plan cheaper.",
      one(deep, "ds_screens") === "always"
        ? "Falling asleep to a screen trains your brain to need stimulation to switch off, and the light itself delays melatonin. This is the habit to break first."
        : "Your screen habits before bed are not the bottleneck.",
      one(deep, "ds_energy") === "wired"
        ? "Wired at night and dead in the morning is the signature of a stress rhythm running backwards. The evening wind-down protocol in your plan is built for exactly this."
        : one(deep, "ds_energy") === "crash"
          ? "Your afternoon crash is a blood sugar swing, not a character flaw. Front-loading protein and slowing your morning carbs flattens it inside two weeks."
          : "Your daytime energy pattern gives the plan something to build on rather than something to rescue.",
    ].join(" "),
    actions: [
      one(deep, "ds_sleep_schedule") === "consistent"
        ? "Protect your fixed wake time through the whole 90 days, weekends included."
        : "Fix your wake time first, same time every day including weekends, and let bedtime follow.",
      one(deep, "ds_screens") === "always" || one(deep, "ds_screens") === "most"
        ? "Phone out of reach for the last 30 minutes before sleep. Replace it with anything on paper."
        : "Keep screens out of the last half hour; it is working.",
      one(deep, "ds_caffeine") === "heavy" || one(deep, "ds_caffeine") === "moderate"
        ? "Land your last caffeine dose before 2 pm. At your intake, that one change usually improves deep sleep within a week."
        : "Keep caffeine where it is; it is not touching your sleep window.",
    ],
  };

  const mindSection: DeepscanSection = {
    title: "Stress and mind",
    body: [
      one(deep, "ds_workload") === "extreme" || one(deep, "ds_workload") === "heavy"
        ? "Your working hours put you in the range where stress stops being a feeling and starts being a physiology problem: elevated cortisol, worse sleep, and stored abdominal fat. The plan cannot shrink your job, but it can armor you against it."
        : "Your working hours leave room for recovery, which most people in this funnel do not have. Use it.",
      one(deep, "ds_downtime") === "none"
        ? "Almost no real downtime means your nervous system never leaves work mode. Recovery is not a luxury here; it is the mechanism that makes the training work."
        : "You have downtime available; the plan's job is making sure some of it actually recovers you.",
      one(deep, "ds_racing") === "most"
        ? "A racing mind most nights is your day spilling into your sleep. The wind-down protocol and the training itself, which burns off stress chemistry directly, are your two tools."
        : "Your off-switch works most nights, which protects everything downstream.",
      "Exercise is the most reliable anxiety treatment that does not need a prescription; the sessions in your plan are doing double duty here.",
    ].join(" "),
    actions: [
      one(deep, "ds_downtime") === "none"
        ? "Block one hour, twice a week, that belongs to nothing and no one. Treat it like a meeting."
        : "Spend at least one block of downtime each week moving: a walk counts.",
      one(deep, "ds_racing") === "most" || one(deep, "ds_racing") === "some"
        ? "Before bed, write tomorrow's three tasks on paper. Externalizing the list is the fastest off-switch there is."
        : "Keep your evening routine; your off-switch is intact.",
    ],
  };

  const movementSection: DeepscanSection = {
    title: "Movement",
    body: [
      one(deep, "ds_sitting") === "high" || one(deep, "ds_sitting") === "extreme"
        ? "The sitting hours are the silent problem. Three workouts a week cannot outrun eleven hours a day in a chair, because long sitting suppresses the enzymes that clear fat from your blood regardless of how hard you trained that morning."
        : "Your sitting load is manageable, which means the formal sessions carry most of the work and recovery between them stays clean.",
      one(deep, "ds_steps") === "desk" || one(deep, "ds_steps") === "still"
        ? "Outside workouts you barely move, so your non-exercise burn, which dwarfs what any session torches, is running near zero. Walking is the cheapest lever you have."
        : "Your background movement is doing real metabolic work for free.",
      pain.length > 0
        ? `You flagged ${pain.map((p) => deepscanLabel("ds_pain", p).toLowerCase()).join(" and ")}. Your plan already routes around painful patterns with joint-friendly swaps, and most regular aches fade as the supporting muscle comes back.`
        : "No recurring joint limits, so your plan can progress load on the standard track without workarounds.",
    ].join(" "),
    actions: [
      one(deep, "ds_sitting") === "high" || one(deep, "ds_sitting") === "extreme"
        ? "Break up your sitting: two minutes of movement every 45 minutes, on a timer, no exceptions."
        : "Keep your movement breaks; they are protecting your training investment.",
      one(deep, "ds_steps") === "desk" || one(deep, "ds_steps") === "still"
        ? "Add a 10-minute walk after your largest meal of the day. It blunts the glucose spike and adds up to real mileage."
        : "Keep your daily movement and let the plan's sessions stack on top of it.",
      pain.length > 0
        ? "Use the easier variations in your exercise library for any movement that provokes a flagged joint, and progress only when it is pain-free."
        : "Progress your lifts on the standard track and revisit form videos when anything feels off.",
    ],
  };

  const hormoneSection: DeepscanSection = male
    ? {
        title: "Hormonal signals",
        body: [
          one(deep, "ds_hormone_m") === "low"
            ? "Morning energy and drive clearly down over a year is the classic low-testosterone pattern, and the honest news is that lifestyle moves it more than most men expect: strength training, body fat reduction, and protected sleep are the three strongest natural levers, and your plan leads with all three."
            : one(deep, "ds_hormone_m") === "down"
              ? "Slightly falling drive at your age is common and usually reversible. Strength work, body fat reduction, and consistent sleep are the levers, and your plan is already weighted toward them."
              : "Your drive and morning energy are holding, which suggests your hormonal output is keeping pace. Strength training will keep it there.",
          one(deep, "ds_meds") === "multi"
            ? "With multiple daily prescriptions, loop your doctor in before changing training or diet aggressively; the plan is built to complement treatment, not replace it."
            : "Nothing in your medication picture changes the standard progression.",
          one(deep, "ds_supplements") === "full"
            ? "A full supplement shelf usually means a few things working and many things not. The Supplement Truth playbook in your kit sorts them honestly."
            : "On supplements, the boring answer holds: vitamin D, creatine, and protein cover most of what actually has evidence behind it.",
        ].join(" "),
        actions: [
          "Run the first 4 weeks of strength work without skipping; it is your most powerful natural hormonal lever.",
          one(deep, "ds_hormone_m") === "low" || one(deep, "ds_hormone_m") === "down"
            ? "If symptoms persist after 90 days of consistent execution, ask your doctor for a morning testosterone panel."
            : "Re-take this assessment after the 90 days and compare your morning-energy answer.",
        ],
      }
    : {
        title: "Hormonal stage",
        body: [
          many(deep, "ds_hormone_f").length > 0
            ? "The symptoms you flagged are common through the hormonal transition and they respond to the unglamorous things: strength training to defend bone and muscle, protein to hold lean mass, and a consistent sleep window to steady the system. Your plan treats those as non-negotiable, not optional."
            : "You reported no active hormonal symptoms, so the plan focuses on the long game: strength work and protein intake now are what protect bone density and muscle later.",
          "From your mid-thirties on, women lose muscle and bone faster than men unless they load them; lifting is the countermeasure, not the risk.",
          one(deep, "ds_meds") === "multi"
            ? "With multiple daily prescriptions, loop your doctor in before changing training or diet aggressively; the plan complements treatment, it does not replace it."
            : "Nothing in your medication picture changes the standard progression.",
        ].join(" "),
        actions: [
          "Treat the strength sessions as the non-negotiable core of your plan; they are what protect bone and muscle through every hormonal stage.",
          many(deep, "ds_hormone_f").length > 0
            ? "If flagged symptoms become disruptive, raise them with your doctor; effective options exist and the plan works alongside them."
            : "Keep protein at every meal; it is the quiet lever that holds lean mass as hormones shift.",
        ],
      };

  const sections = [bodySection, vitalsSection, fuelSection, recoverySection, mindSection, movementSection, hormoneSection];

  /* ── Priorities ────────────────────────────────────────────────────────── */

  const priorities: string[] = [];
  if (one(deep, "ds_bp") === "high") priorities.push("Get your blood pressure into a doctor's hands this month, then let the plan's conditioning work support the treatment.");
  if (one(deep, "ds_protein") === "rare" || one(deep, "ds_protein") === "unknown") priorities.push("Put a real serving of protein in your first meal of the day, every day, starting tomorrow.");
  if (one(deep, "ds_sugar") === "few" || one(deep, "ds_sugar") === "heavy") priorities.push("Cut liquid sugar to one drink a day, then to none. It is the highest-leverage diet edit available to you.");
  if (one(deep, "ds_sitting") === "high" || one(deep, "ds_sitting") === "extreme") priorities.push("Break up your sitting: two minutes of movement every 45 minutes, on a timer, no exceptions.");
  if (one(deep, "ds_sleep_schedule") === "chaos") priorities.push("Fix your wake time, same time every day including weekends, and hold it for two weeks before judging it.");
  if (one(deep, "ds_caffeine") === "heavy") priorities.push("Cap caffeine at two cups and land the last one before 2 pm.");
  if (one(deep, "ds_rhr") === "unknown" || one(deep, "ds_bp") === "unknown") priorities.push("Take your baseline numbers this week: resting heart rate and a blood pressure reading. You cannot steer what you do not measure.");
  for (const risk of result.topRisks) {
    if (priorities.length >= 5) break;
    priorities.push(`Start on your ${risk.category.toLowerCase()}: ${risk.detail}`);
  }
  while (priorities.length < 3) {
    priorities.push("Run week one of your plan exactly as written before changing anything.");
  }

  /* ── Summary ───────────────────────────────────────────────────────────── */

  const flagCount = markers.filter((m) => m.status === "flag").length;
  const optimalCount = markers.filter((m) => m.status === "optimal").length;

  return {
    summary: [
      `This Deepscan read ${markers.length} self-reported markers against your scan profile: ${optimalCount} look solid, ${flagCount} ${flagCount === 1 ? "needs" : "need"} direct attention, and the rest are worth watching.`,
      male
        ? "The picture is a familiar one for men your age: the levers that move your number are concrete, and most of them respond inside the 90 days."
        : "The picture is a familiar one for women your age: the levers that move your number are concrete, and most of them respond inside the 90 days.",
      result.topRisks[0]
        ? `The single biggest drag remains your ${result.topRisks[0].category.toLowerCase()}, and everything below is ordered around fixing it.`
        : "With no dominant risk, the work is consolidation: protect what is working and push the margins.",
    ].join(" "),
    markers,
    sections,
    priorities: priorities.slice(0, 5),
    disclaimer:
      "This Deepscan is generated from your self-reported answers. It is an educational estimate, not a medical test, diagnosis, or treatment advice. For medical concerns, talk to your doctor.",
  };
}
