import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { GuideDocSchema } from "@/lib/guide/schema";

export const GUIDE_MODEL = "claude-sonnet-4-6";

// zod v4 -> JSON Schema for the tool's input_schema.
const GUIDE_JSON_SCHEMA = z.toJSONSchema(GuideDocSchema) as Anthropic.Tool["input_schema"];

// Calls Claude with a cached system prompt and forces structured output via a
// single tool. Returns the raw tool input (validated by the caller).
export async function requestGuide(system: string, user: string): Promise<unknown> {
  const anthropic = new Anthropic();
  const res = await anthropic.messages.create({
    model: GUIDE_MODEL,
    max_tokens: 8000,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    tools: [
      {
        name: "emit_guide",
        description: "Return the personalized 8-week protocol as structured data.",
        input_schema: GUIDE_JSON_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "emit_guide" },
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Model did not return a guide");
  }
  return block.input;
}
