// The AI Deepscan generator. The ONLY place in the app that makes a real AI
// call: Claude Haiku writes the buyer's marker-by-marker analysis from their
// scan + deepscan answers. Without ANTHROPIC_API_KEY (dev, e2e, CI), or if the
// call fails for any reason, the deterministic offline builder takes over so a
// paying buyer always gets a complete report.
//
// Cost per run (claude-haiku-4-5 at $1/MTok in, $5/MTok out): ~2K input
// tokens + a 6K output cap => about $0.03 worst case. Pricing in
// lib/product.ts budgets $0.03.

import Anthropic from "@anthropic-ai/sdk";
import {
  computeResult,
  getActiveQuestions,
  toValues,
  type Answers,
} from "@/lib/longevity";
import { getDeepscanQuestions, deepscanLabel } from "@/lib/deepscan/questions";
import { buildDeepscanFallback } from "@/lib/deepscan/fallback";
import {
  DeepscanReportSchema,
  type DeepscanAnswers,
  type DeepscanReport,
} from "@/lib/deepscan/schema";

export const DEEPSCAN_AI_MODEL = "claude-haiku-4-5-20251001";
export const DEEPSCAN_FALLBACK_MODEL = "deterministic-v1";

const SYSTEM_PROMPT = `You write the "AI Deepscan" readout for The Second Wind Protocol, a personalized 90-day fitness program. The buyer completed a longevity scan and a deeper intake; you turn those self-reported answers into a clear, personal written analysis of their health markers, diet, and lifestyle.

Voice: deadpan-clinical, direct, plain American English. Punchy sentences. Address the reader as "you". Confident but never insulting, never alarmist. Use imperial units (lbs, inches, Fahrenheit). Never use em-dashes; use commas, periods, or hyphens.

Hard rules:
- Everything is an ESTIMATE from self-reported answers. Never present a value as measured or diagnosed.
- Never diagnose a condition, name a disease the user did not report, or give medication advice. For anything medical, point them to their doctor.
- Do not fabricate studies, statistics, or citations. General mechanistic claims only.
- Tie observations back to the user's own answers, and where natural, to their 90-day plan (strength training, conditioning, protein, sleep window, movement breaks). The plan exists and they own it.
- Tailor tone and emphasis to the user's sex where it is genuinely relevant (heart disease framing and testosterone for men; bone density, muscle retention, and hormonal stage for women). Do not force it where it is not relevant.

The buyer answered a 28-question intake across seven areas (body composition, heart and vitals, fueling, recovery and sleep, stress and mind, movement, hormones and medical). Use ALL of it: the report must feel like every answer was read. Reference their specific answers, explain what each pattern means mechanistically in plain language, and make every recommendation concrete enough to start tomorrow (amounts, times, frequencies). Where answers interact (e.g. heavy caffeine + broken sleep + afternoon crash), connect them explicitly; those connections are the most valuable thing you write.

Output JSON with exactly these fields:
- summary: 3-4 sentences, the overall readout: how many markers look solid vs need attention, the dominant pattern you see, and the single most important thing to fix.
- markers: 8 to 12 rows. Each: name (the marker), band (their reported band, e.g. "60 to 70 bpm"), status (one of "optimal", "watch", "flag"), note (1-2 sentences of interpretation specific to them).
- sections: 6 to 7 narrative sections, each with title, a body of 4-7 sentences, and actions (2-4 concrete, specific steps for that area). Cover: body composition and strength, cardiometabolic picture, fueling, recovery and sleep, stress and mind, movement, and hormonal signals (sex-appropriate).
- priorities: 4 to 5 ordered, concrete "do this first" actions, most important first, each one sentence.
- disclaimer: one sentence stating this is an educational estimate from self-reported answers, not medical advice.`;

// Structured-output JSON schema (additionalProperties: false on every object;
// no numeric/array constraints, which structured outputs does not support).
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    markers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          band: { type: "string" },
          status: { type: "string", enum: ["optimal", "watch", "flag"] },
          note: { type: "string" },
        },
        required: ["name", "band", "status", "note"],
        additionalProperties: false,
      },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "body", "actions"],
        additionalProperties: false,
      },
    },
    priorities: { type: "array", items: { type: "string" } },
    disclaimer: { type: "string" },
  },
  required: ["summary", "markers", "sections", "priorities", "disclaimer"],
  additionalProperties: false,
} as const;

/** Serialize the full profile the model writes from. */
function buildProfile(answers: Answers, deep: DeepscanAnswers): string {
  const result = computeResult(answers);
  const lines: string[] = [];

  lines.push("SCAN RESULT (deterministic model output):");
  lines.push(`- Age: ${result.currentAge}`);
  lines.push(`- Sex: ${answers.sex === "male" ? "male" : "female"}`);
  lines.push(`- Estimated life expectancy: ${result.lifeExpectancy.toFixed(1)} years (${Math.abs(result.yearsVsAverage).toFixed(1)} years ${result.yearsVsAverage < 0 ? "below" : "above"} the average for their age and sex)`);
  lines.push(`- Recoverable years if modifiable risks are fixed: ${result.recoverableYears.toFixed(1)}`);
  if (result.topRisks.length) {
    lines.push(`- Top modifiable risks: ${result.topRisks.map((r) => r.category).join(", ")}`);
  }

  lines.push("");
  lines.push("SCAN ANSWERS:");
  for (const q of getActiveQuestions(answers)) {
    if (q.kind === "age") continue;
    const labels = toValues(answers[q.id])
      .map((v) => q.options?.find((o) => o.value === v)?.label)
      .filter(Boolean);
    if (labels.length) lines.push(`- ${q.category}: ${labels.join("; ")}`);
  }

  lines.push("");
  lines.push("DEEPSCAN INTAKE ANSWERS:");
  for (const q of getDeepscanQuestions(answers)) {
    const labels = toValues(deep[q.id]).map((v) => deepscanLabel(q.id, v));
    if (labels.length) lines.push(`- ${q.prompt} ${labels.join("; ")}`);
  }

  return lines.join("\n");
}

/** House style bans em-dashes; the model occasionally emits them anyway. */
function stripEmDashes<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\s*[—–]\s*/g, ", ") as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => stripEmDashes(v)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripEmDashes(v)])
    ) as T;
  }
  return value;
}

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function runWithHaiku(
  answers: Answers,
  deep: DeepscanAnswers
): Promise<DeepscanReport> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: DEEPSCAN_AI_MODEL,
    max_tokens: 6000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Write the AI Deepscan for this buyer.\n\n${buildProfile(answers, deep)}`,
      },
    ],
  });

  if (response.stop_reason !== "end_turn") {
    throw new Error(`deepscan: unexpected stop_reason ${response.stop_reason}`);
  }
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return DeepscanReportSchema.parse(stripEmDashes(JSON.parse(text)));
}

/**
 * Generate the Deepscan report. Returns the report plus which engine produced
 * it. Never throws on AI failure: the deterministic builder is the safety net.
 */
export async function runDeepscan(
  answers: Answers,
  deep: DeepscanAnswers
): Promise<{ report: DeepscanReport; model: string }> {
  if (aiConfigured()) {
    try {
      const report = await runWithHaiku(answers, deep);
      return { report, model: DEEPSCAN_AI_MODEL };
    } catch (e) {
      console.error("deepscan: AI generation failed, using fallback", e);
    }
  }
  const report = buildDeepscanFallback(computeResult(answers), answers, deep);
  return { report: DeepscanReportSchema.parse(report), model: DEEPSCAN_FALLBACK_MODEL };
}
