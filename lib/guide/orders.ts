import { randomBytes } from "node:crypto";
import type { Answers } from "@/lib/longevity";
import type { GuideDoc } from "@/lib/guide/schema";

export type OrderStatus = "awaiting_payment" | "generating" | "ready" | "failed";

export interface OrderRow {
  id: string;
  token: string;
  answers: Answers;
  status: OrderStatus;
  guide: GuideDoc | null;
  model: string | null;
  error: string | null;
  created_at: string;
  // Payment fields (null until a Stripe checkout is paid).
  stripe_session_id?: string | null;
  customer_email?: string | null;
  paid_at?: string | null;
  emailed_at?: string | null;
}

export function newToken(): string {
  return randomBytes(24).toString("base64url");
}

function memoryEnabled(): boolean {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// In-process store for local dev, tests, and e2e. NOT shared across serverless
// instances; production must configure Supabase.
//
// Uses globalThis so the Map is shared across Turbopack's separate SSR and
// route-handler module runtime contexts in dev mode (they each get a fresh
// module instance but share the same globalThis object).
declare const globalThis: { __orderMemory?: Map<string, OrderRow> };
if (!globalThis.__orderMemory) {
  globalThis.__orderMemory = new Map<string, OrderRow>();
}
const memory: Map<string, OrderRow> = globalThis.__orderMemory;

export function __clearMemory(): void {
  memory.clear();
}

// Imported lazily so the in-memory path never pulls in the server-only client.
async function client() {
  const { supabaseServer } = await import("@/lib/supabase/server");
  return supabaseServer();
}

// `status` defaults to "generating" (today's direct path). A Stripe checkout
// creates the order as "awaiting_payment" and a verified payment flips it via
// markPaid().
export async function createOrder(
  answers: Answers,
  status: OrderStatus = "generating"
): Promise<OrderRow> {
  const token = newToken();
  if (memoryEnabled()) {
    const row: OrderRow = {
      id: token,
      token,
      answers,
      status,
      guide: null,
      model: null,
      error: null,
      created_at: new Date().toISOString(),
      stripe_session_id: null,
      customer_email: null,
      paid_at: null,
      emailed_at: null,
    };
    memory.set(token, row);
    return row;
  }
  const { data, error } = await (await client())
    .from("orders")
    .insert({ token, answers, status })
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

// Flip a pending order to "generating" after a verified payment. Returns true
// only on the transition that actually happened, so the caller knows whether to
// send the delivery email. Idempotent: it only acts when the order is currently
// "awaiting_payment", so the webhook and the success-page fallback can both run
// and exactly one wins. The Supabase path makes this atomic with a conditional
// update (eq status), avoiding a read-then-write race across instances.
export async function markPaid(
  token: string,
  payment: { sessionId: string; email: string | null }
): Promise<boolean> {
  if (memoryEnabled()) {
    const row = memory.get(token);
    if (!row || row.status !== "awaiting_payment") return false;
    row.status = "generating";
    row.stripe_session_id = payment.sessionId;
    row.customer_email = payment.email;
    row.paid_at = new Date().toISOString();
    return true;
  }
  const { data, error } = await (await client())
    .from("orders")
    .update({
      status: "generating",
      stripe_session_id: payment.sessionId,
      customer_email: payment.email,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("token", token)
    .eq("status", "awaiting_payment")
    .select("token");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function markEmailed(token: string): Promise<void> {
  const now = new Date().toISOString();
  if (memoryEnabled()) {
    const row = memory.get(token);
    if (row) row.emailed_at = now;
    return;
  }
  const { error } = await (await client())
    .from("orders")
    .update({ emailed_at: now, updated_at: now })
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
