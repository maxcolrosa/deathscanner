import { describe, it, expect } from "vitest";
import {
  signResultToken,
  verifyResultToken,
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from "@/lib/marketing/email-links";

const DAY = 24 * 60 * 60 * 1000;

describe("result token", () => {
  it("round-trips email + currency", () => {
    const token = signResultToken("a@b.com", "GBP");
    expect(verifyResultToken(token)).toEqual({ email: "a@b.com", currency: "GBP" });
  });

  it("normalizes the email to lowercase", () => {
    const token = signResultToken("Person@Example.COM", "USD");
    expect(verifyResultToken(token)?.email).toBe("person@example.com");
  });

  it("rejects a tampered signature", () => {
    const token = signResultToken("a@b.com", "USD");
    expect(verifyResultToken(token + "x")).toBeNull();
  });

  it("rejects a forged payload kept with a stale signature", () => {
    const token = signResultToken("a@b.com", "USD");
    const sig = token.slice(token.indexOf(".") + 1);
    const forged = Buffer.from(
      `result:evil@x.com:USD:${Date.now() + 100000}`
    ).toString("base64url");
    expect(verifyResultToken(`${forged}.${sig}`)).toBeNull();
  });

  it("rejects an expired token (TTL 7 days)", () => {
    const eightDaysAgo = Date.now() - 8 * DAY;
    const token = signResultToken("a@b.com", "USD", eightDaysAgo);
    expect(verifyResultToken(token)).toBeNull();
  });

  it("does not verify as an unsubscribe token (purpose-bound)", () => {
    const token = signResultToken("a@b.com", "USD");
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(verifyResultToken("garbage")).toBeNull();
    expect(verifyResultToken("")).toBeNull();
  });
});

describe("unsubscribe token", () => {
  it("round-trips the email", () => {
    const token = signUnsubscribeToken("a@b.com");
    expect(verifyUnsubscribeToken(token)).toBe("a@b.com");
  });

  it("normalizes the email to lowercase", () => {
    const token = signUnsubscribeToken("Person@Example.COM");
    expect(verifyUnsubscribeToken(token)).toBe("person@example.com");
  });

  it("rejects a tampered signature", () => {
    const token = signUnsubscribeToken("a@b.com");
    expect(verifyUnsubscribeToken(token + "x")).toBeNull();
  });

  it("does not verify as a result token (purpose-bound)", () => {
    const token = signUnsubscribeToken("a@b.com");
    expect(verifyResultToken(token)).toBeNull();
  });
});
