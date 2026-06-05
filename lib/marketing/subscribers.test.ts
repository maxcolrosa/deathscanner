import { describe, it, expect, beforeEach } from "vitest";
import {
  upsertSubscriber,
  getSubscriberByEmail,
  markUnsubscribed,
  __clearSubscriberMemory,
} from "@/lib/marketing/subscribers";

// No Supabase env in the test process -> in-memory backend.
beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearSubscriberMemory();
});

const answers = { age: 40, smoking: "never", activity: "none", goal: "fat" };

describe("subscribers store (in-memory)", () => {
  it("creates a subscriber and reads it back", async () => {
    const row = await upsertSubscriber({
      email: "a@b.com",
      consented: false,
      answers,
      currency: "USD",
    });
    expect(row.email).toBe("a@b.com");
    expect(row.consented).toBe(false);
    const fetched = await getSubscriberByEmail("a@b.com");
    expect(fetched?.answers).toEqual(answers);
  });

  it("normalizes email to lowercase + trimmed, so it is one row", async () => {
    await upsertSubscriber({ email: "  Person@Example.COM ", consented: false, answers, currency: "USD" });
    const a = await getSubscriberByEmail("person@example.com");
    const b = await getSubscriberByEmail("PERSON@EXAMPLE.COM");
    expect(a?.email).toBe("person@example.com");
    expect(b?.id).toBe(a?.id);
  });

  it("upsert by email keeps the id but updates consent + answers", async () => {
    const first = await upsertSubscriber({ email: "c@d.com", consented: false, answers, currency: "USD" });
    const second = await upsertSubscriber({
      email: "c@d.com",
      consented: true,
      answers: { ...answers, goal: "cardio" },
      currency: "GBP",
    });
    expect(second.id).toBe(first.id); // same human, one row
    expect(second.consented).toBe(true);
    expect(second.currency).toBe("GBP");
    const fetched = await getSubscriberByEmail("c@d.com");
    expect(fetched?.consented).toBe(true);
  });

  it("markUnsubscribed records the timestamp", async () => {
    await upsertSubscriber({ email: "e@f.com", consented: true, answers, currency: "USD" });
    await markUnsubscribed("e@f.com");
    expect((await getSubscriberByEmail("e@f.com"))?.unsubscribed_at).toBeTruthy();
  });

  it("returns null for an unknown email", async () => {
    expect(await getSubscriberByEmail("nobody@nowhere.com")).toBeNull();
  });
});
