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

// Long, cache-friendly instructions. Cached by the model wrapper. Keep this
// stable across users so the prompt cache hits.
export function buildSystemPrompt(): string {
  const included = INCLUDED.map((i) => `- ${i.label}: ${i.note}`).join("\n");
  return [
    `You are an expert strength and longevity coach writing "${PRODUCT.name}", a personalized 8-week protocol for one client, based on their lifestyle scan.`,
    `Return your answer ONLY by calling the emit_guide tool with structured JSON. Do not write prose outside the tool call.`,
    ``,
    `The protocol must deliver every item the client was promised:`,
    included,
    ``,
    `Rules:`,
    `- Exactly 8 weeks. Order the weeks so the client's highest-impact modifiable risks are addressed first, then down the list.`,
    `- Shape the 10-minute daily routine around the client's stated training barrier.`,
    `- Be concrete and practical. No medical claims, no calorie math, no diagnoses.`,
    `- Plain, direct, encouraging tone.`,
    `- Never use em-dashes (no "-" long dash characters). Use commas, periods, or hyphens.`,
  ].join("\n");
}

export function buildUserPrompt(result: ScanResult, answers: Answers): string {
  const goal = result.primaryGoal ? GOAL_LABEL[result.primaryGoal] ?? result.primaryGoal : "General longevity";
  const barrier = optionLabel("activity_barrier", answers.activity_barrier);
  const topRisks = result.topRisks
    .map((r, i) => `${i + 1}. ${r.category} (${r.answerLabel}) - ${r.detail}`)
    .join("\n");
  const strengths = result.strengths.map((s) => `- ${s.category}: ${s.answerLabel}`).join("\n") || "- None notable";
  const levels = result.factors.map((f) => `- ${f.category}: ${f.answerLabel}`).join("\n");
  const outcomes = result.outcomes.map((o) => `- ${o.label}`).join("\n");

  return [
    `Client profile:`,
    `- Age: ${result.currentAge}`,
    `- Primary goal: ${goal}`,
    barrier ? `- Training barrier: ${barrier}` : `- Training barrier: not specified`,
    ``,
    `Highest-impact modifiable risks (attack in this order):`,
    topRisks || "None notable",
    ``,
    `Already working in their favor:`,
    strengths,
    ``,
    `All scored factors and the client's answers:`,
    levels,
    ``,
    `Promised outcomes to deliver against:`,
    outcomes,
    ``,
    `Write the personalized 8-week protocol now via emit_guide.`,
  ].join("\n");
}

export function buildGuidePrompt(result: ScanResult, answers: Answers): { system: string; user: string } {
  return { system: buildSystemPrompt(), user: buildUserPrompt(result, answers) };
}
