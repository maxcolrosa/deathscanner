import { QUESTIONS, type Answers, type ScanResult } from "@/lib/longevity";
import { PRODUCT, INCLUDED } from "@/lib/product";

const GOAL_LABEL: Record<string, string> = {
  fat: "Lose body fat",
  strength: "Build strength and muscle",
  energy: "More energy and better sleep",
  heart: "Protect their heart and live longer",
};

function optionLabel(questionId: string, value: unknown): string | null {
  const q = QUESTIONS.find((x) => x.id === questionId);
  const opt = q?.options?.find((o) => o.value === value);
  return opt?.label ?? null;
}

// Long, cache-friendly system instructions. Kept stable across users so the
// prompt cache hits. Defines the persona, the specificity mandate, and the
// structure to emit.
export function buildSystemPrompt(): string {
  const included = INCLUDED.map((i) => `- ${i.label}: ${i.note}`).join("\n");
  return [
    `You are an elite strength and longevity coach. You personally reviewed this client's lifestyle scan and you are writing "${PRODUCT.name}", their bespoke 8-week protocol.`,
    `Return your answer ONLY by calling the emit_guide tool with structured JSON. Write nothing outside the tool call.`,
    ``,
    `This is a paid product. It must be specific, prescriptive, and genuinely worth the price. The reader should feel it was written for them, and should always know exactly what to do next. Never write generic advice they could get free from a search engine.`,
    ``,
    `The protocol must deliver everything the client was promised:`,
    included,
    ``,
    `Hard rules:`,
    `- Exactly 8 weeks. Order them so the client's highest-impact modifiable risks are addressed first, then down the list in order.`,
    `- Every workout exercise must include concrete sets, reps, rest, a form cue, and how to progress it next time. Use real exercise names.`,
    `- Calibrate difficulty to the client's level: a true beginner if they are sedentary or never learned to train; low-impact progressions if they have a past injury; time-efficient sessions if their barrier is time; accountability and tiny wins if their barrier is motivation.`,
    `- Nutrition must name real foods and rough portions, not vague advice. Swaps must be specific to what they eat now.`,
    `- next7Days must give exactly seven concrete daily actions they can start immediately.`,
    `- Reference the client's actual answers throughout. Be specific.`,
    `- No medical claims, no diagnoses, no calorie obsession.`,
    `- Never use em-dashes (no long dash characters). Use commas, periods, or hyphens.`,
  ].join("\n");
}

export function buildUserPrompt(result: ScanResult, answers: Answers): string {
  const goal = result.primaryGoal
    ? GOAL_LABEL[result.primaryGoal] ?? result.primaryGoal
    : "General longevity";
  const barrier = optionLabel("activity_barrier", answers.activity_barrier);
  const topRisks = result.topRisks
    .map((r, i) => `${i + 1}. ${r.category} (their answer: ${r.answerLabel}) - ${r.detail}`)
    .join("\n");
  const strengths =
    result.strengths.map((s) => `- ${s.category}: ${s.answerLabel}`).join("\n") ||
    "- None notable";
  const levels = result.factors.map((f) => `- ${f.category}: ${f.answerLabel}`).join("\n");
  const outcomes = result.outcomes.map((o) => `- ${o.label}`).join("\n");

  return [
    `Client profile:`,
    `- Age: ${result.currentAge}`,
    `- Primary goal: ${goal}`,
    barrier
      ? `- Training barrier (shape the plan around this): ${barrier}`
      : `- Training barrier: not specified`,
    `- Recoverable years if they fix their modifiable risks: about ${result.recoverableYears}`,
    ``,
    `Highest-impact modifiable risks (attack in this exact order):`,
    topRisks || "None notable",
    ``,
    `Already working in their favor (build on these):`,
    strengths,
    ``,
    `Every scored factor and the client's answer (use these to calibrate intensity):`,
    levels,
    ``,
    `Promised outcomes to deliver against:`,
    outcomes,
    ``,
    `Write this client's bespoke 8-week protocol now via emit_guide. Be specific enough that they could start today without asking a single follow-up question.`,
  ].join("\n");
}

export function buildGuidePrompt(
  result: ScanResult,
  answers: Answers
): { system: string; user: string } {
  return { system: buildSystemPrompt(), user: buildUserPrompt(result, answers) };
}
