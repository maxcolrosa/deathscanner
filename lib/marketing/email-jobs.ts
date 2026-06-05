import { randomUUID } from "node:crypto";

// The drip send-queue. Mirrors lib/guide/orders.ts: Supabase when configured,
// else an in-process store for dev/tests. The instant report email is sent
// inline at capture; this queue holds the two SCHEDULED follow-ups (value at
// +1 day, win-back at +2 days). A Vercel Cron processes due jobs idempotently.

export type EmailJobKind = "value" | "winback";

export interface EmailJob {
  id: string;
  email: string;
  kind: EmailJobKind;
  send_after: string; // ISO
  sent_at: string | null;
  canceled_at: string | null;
  created_at: string;
}

// Schedule, relative to enrollment.
const SCHEDULE: { kind: EmailJobKind; delayMs: number }[] = [
  { kind: "value", delayMs: 1 * 24 * 60 * 60 * 1000 },
  { kind: "winback", delayMs: 2 * 24 * 60 * 60 * 1000 },
];

function memoryEnabled(): boolean {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

declare const globalThis: { __emailJobMemory?: Map<string, EmailJob> };
if (!globalThis.__emailJobMemory) {
  globalThis.__emailJobMemory = new Map<string, EmailJob>();
}
const memory: Map<string, EmailJob> = globalThis.__emailJobMemory;

export function __clearEmailJobMemory(): void {
  memory.clear();
}

async function client() {
  const { supabaseServer } = await import("@/lib/supabase/server");
  return supabaseServer();
}

async function existingKinds(email: string): Promise<Set<EmailJobKind>> {
  if (memoryEnabled()) {
    const kinds = new Set<EmailJobKind>();
    for (const job of memory.values()) {
      if (job.email === email) kinds.add(job.kind);
    }
    return kinds;
  }
  const { data, error } = await (await client())
    .from("email_jobs")
    .select("kind")
    .eq("email", email);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.kind as EmailJobKind));
}

// Enroll a consented subscriber into the drip. Idempotent per (email, kind): a
// second scan by the same person does not double-schedule.
export async function enqueueDrip(email: string, now = Date.now()): Promise<void> {
  const normalized = normalizeEmail(email);
  const already = await existingKinds(normalized);
  const toAdd = SCHEDULE.filter((s) => !already.has(s.kind));
  if (toAdd.length === 0) return;

  if (memoryEnabled()) {
    for (const s of toAdd) {
      const id = randomUUID();
      memory.set(id, {
        id,
        email: normalized,
        kind: s.kind,
        send_after: new Date(now + s.delayMs).toISOString(),
        sent_at: null,
        canceled_at: null,
        created_at: new Date(now).toISOString(),
      });
    }
    return;
  }
  const rows = toAdd.map((s) => ({
    email: normalized,
    kind: s.kind,
    send_after: new Date(now + s.delayMs).toISOString(),
  }));
  const { error } = await (await client()).from("email_jobs").insert(rows);
  if (error) throw new Error(error.message);
}

// Jobs that are due and not yet sent or canceled.
export async function listDueJobs(now = Date.now()): Promise<EmailJob[]> {
  const nowIso = new Date(now).toISOString();
  if (memoryEnabled()) {
    return [...memory.values()].filter(
      (j) => !j.sent_at && !j.canceled_at && j.send_after <= nowIso
    );
  }
  const { data, error } = await (await client())
    .from("email_jobs")
    .select("*")
    .is("sent_at", null)
    .is("canceled_at", null)
    .lte("send_after", nowIso);
  if (error) throw new Error(error.message);
  return (data ?? []) as EmailJob[];
}

export async function markJobSent(id: string): Promise<void> {
  const now = new Date().toISOString();
  if (memoryEnabled()) {
    const job = memory.get(id);
    if (job) job.sent_at = now;
    return;
  }
  const { error } = await (await client())
    .from("email_jobs")
    .update({ sent_at: now })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markJobCanceled(id: string): Promise<void> {
  const now = new Date().toISOString();
  if (memoryEnabled()) {
    const job = memory.get(id);
    if (job) job.canceled_at = now;
    return;
  }
  const { error } = await (await client())
    .from("email_jobs")
    .update({ canceled_at: now })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
