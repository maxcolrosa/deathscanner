import { describe, it, expect, beforeEach } from "vitest";
import {
  enqueueDrip,
  listDueJobs,
  markJobSent,
  markJobCanceled,
  __clearEmailJobMemory,
} from "@/lib/marketing/email-jobs";

const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearEmailJobMemory();
});

describe("drip queue (in-memory)", () => {
  it("schedules a value (+1d) and a winback (+2d) job, due at the right times", async () => {
    const t0 = Date.now();
    await enqueueDrip("a@b.com", t0);

    expect(await listDueJobs(t0)).toHaveLength(0); // nothing due immediately

    const dueDay1 = await listDueJobs(t0 + DAY + 3600_000);
    expect(dueDay1.map((j) => j.kind)).toEqual(["value"]);

    const dueDay3 = await listDueJobs(t0 + 3 * DAY);
    expect(new Set(dueDay3.map((j) => j.kind))).toEqual(new Set(["value", "winback"]));
  });

  it("is idempotent per (email, kind), including case/whitespace", async () => {
    const t0 = Date.now();
    await enqueueDrip("A@B.com ", t0);
    await enqueueDrip("a@b.com", t0);
    expect(await listDueJobs(t0 + 3 * DAY)).toHaveLength(2);
  });

  it("drops sent and canceled jobs from the due list", async () => {
    const t0 = Date.now();
    await enqueueDrip("c@d.com", t0);
    const due = await listDueJobs(t0 + 3 * DAY);
    expect(due).toHaveLength(2);
    await markJobSent(due[0].id);
    await markJobCanceled(due[1].id);
    expect(await listDueJobs(t0 + 3 * DAY)).toHaveLength(0);
  });
});
