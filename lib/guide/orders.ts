import { randomBytes } from "node:crypto";
import type { Answers } from "@/lib/longevity";
import type { GuideDoc } from "@/lib/guide/schema";

export type OrderStatus = "generating" | "ready" | "failed";

export interface OrderRow {
  id: string;
  token: string;
  answers: Answers;
  status: OrderStatus;
  guide: GuideDoc | null;
  model: string | null;
  error: string | null;
  created_at: string;
}

export function newToken(): string {
  return randomBytes(24).toString("base64url");
}

function memoryEnabled(): boolean {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// In-process store for local dev, tests, and e2e. NOT shared across serverless
// instances; production must configure Supabase.
const memory = new Map<string, OrderRow>();
export function __clearMemory(): void {
  memory.clear();
}

// Imported lazily so the in-memory path never pulls in the server-only client.
async function client() {
  const { supabaseServer } = await import("@/lib/supabase/server");
  return supabaseServer();
}

export async function createOrder(answers: Answers): Promise<OrderRow> {
  const token = newToken();
  if (memoryEnabled()) {
    const row: OrderRow = {
      id: token,
      token,
      answers,
      status: "generating",
      guide: null,
      model: null,
      error: null,
      created_at: new Date().toISOString(),
    };
    memory.set(token, row);
    return row;
  }
  const { data, error } = await (await client())
    .from("orders")
    .insert({ token, answers, status: "generating" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as OrderRow;
}

export async function getOrderByToken(token: string): Promise<OrderRow | null> {
  if (memoryEnabled()) return memory.get(token) ?? null;
  const { data, error } = await (await client())
    .from("orders")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as OrderRow) ?? null;
}

export async function markReady(token: string, guide: GuideDoc, model: string): Promise<void> {
  if (memoryEnabled()) {
    const row = memory.get(token);
    if (row) {
      row.status = "ready";
      row.guide = guide;
      row.model = model;
    }
    return;
  }
  const { error } = await (await client())
    .from("orders")
    .update({ status: "ready", guide, model, updated_at: new Date().toISOString() })
    .eq("token", token);
  if (error) throw new Error(error.message);
}

export async function markFailed(token: string, message: string): Promise<void> {
  if (memoryEnabled()) {
    const row = memory.get(token);
    if (row) {
      row.status = "failed";
      row.error = message;
    }
    return;
  }
  const { error } = await (await client())
    .from("orders")
    .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
    .eq("token", token);
  if (error) throw new Error(error.message);
}
