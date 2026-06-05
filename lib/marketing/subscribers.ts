import { randomUUID } from "node:crypto";
import type { Answers } from "@/lib/longevity";

// Marketing subscriber store. Mirrors lib/guide/orders.ts: Supabase when
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, otherwise an in-process
// in-memory store for local dev, tests, and e2e (NOT shared across serverless
// instances; production must configure Supabase).

export interface Subscriber {
  id: string;
  email: string;
  consented: boolean;
  answers: Answers;
  currency: string;
  created_at: string;
  unsubscribed_at: string | null;
}

export interface UpsertSubscriberInput {
  email: string;
  consented: boolean;
  answers: Answers;
  currency: string;
}

function memoryEnabled(): boolean {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Normalize so the same human is one row regardless of casing/whitespace.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// In-process store keyed by normalized email. Uses globalThis so the Map is
// shared across Turbopack's separate SSR and route-handler module runtime
// contexts in dev mode (each gets a fresh module instance but shares globalThis).
declare const globalThis: { __subscriberMemory?: Map<string, Subscriber> };
if (!globalThis.__subscriberMemory) {
  globalThis.__subscriberMemory = new Map<string, Subscriber>();
}
const memory: Map<string, Subscriber> = globalThis.__subscriberMemory;

export function __clearSubscriberMemory(): void {
  memory.clear();
}

// Imported lazily so the in-memory path never pulls in the server-only client.
async function client() {
  const { supabaseServer } = await import("@/lib/supabase/server");
  return supabaseServer();
}

// Insert or update by unique email. On conflict we refresh consented / answers /
// currency (the latest scan wins and an opt-in can be granted on a return visit).
export async function upsertSubscriber(
  input: UpsertSubscriberInput
): Promise<Subscriber> {
  const email = normalizeEmail(input.email);
  if (memoryEnabled()) {
    const existing = memory.get(email);
    const row: Subscriber = {
      id: existing?.id ?? randomUUID(),
      email,
      consented: input.consented,
      answers: input.answers,
      currency: input.currency,
      created_at: existing?.created_at ?? new Date().toISOString(),
      unsubscribed_at: existing?.unsubscribed_at ?? null,
    };
    memory.set(email, row);
    return row;
  }
  const { data, error } = await (await client())
    .from("subscribers")
    .upsert(
      {
        email,
        consented: input.consented,
        answers: input.answers,
        currency: input.currency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Subscriber;
}

export async function getSubscriberByEmail(
  email: string
): Promise<Subscriber | null> {
  const normalized = normalizeEmail(email);
  if (memoryEnabled()) return memory.get(normalized) ?? null;
  const { data, error } = await (await client())
    .from("subscribers")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Subscriber) ?? null;
}

export async function markUnsubscribed(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();
  if (memoryEnabled()) {
    const row = memory.get(normalized);
    if (row) row.unsubscribed_at = now;
    return;
  }
  const { error } = await (await client())
    .from("subscribers")
    .update({ unsubscribed_at: now, updated_at: now })
    .eq("email", normalized);
  if (error) throw new Error(error.message);
}
