import { describe, it, expect } from "vitest";
import { signWinbackToken, verifyWinbackToken } from "@/lib/marketing/winback";

const DAY = 24 * 60 * 60 * 1000;

describe("winback token", () => {
  it("round-trips email + currency", () => {
    const token = signWinbackToken("a@b.com", "GBP");
    expect(verifyWinbackToken(token)).toEqual({ email: "a@b.com", currency: "GBP" });
  });

  it("normalizes the email to lowercase", () => {
    const token = signWinbackToken("Person@Example.COM", "USD");
    expect(verifyWinbackToken(token)?.email).toBe("person@example.com");
  });

  it("rejects a tampered signature", () => {
    const token = signWinbackToken("a@b.com", "USD");
    expect(verifyWinbackToken(token + "x")).toBeNull();
  });

  it("rejects a forged payload kept with a stale signature", () => {
    const token = signWinbackToken("a@b.com", "USD");
    const sig = token.slice(token.indexOf(".") + 1);
    const forgedPayload = Buffer.from(
      `winback:evil@x.com:USD:${Date.now() + 100000}`
    ).toString("base64url");
    expect(verifyWinbackToken(`${forgedPayload}.${sig}`)).toBeNull();
  });

  it("rejects an expired token (TTL 7 days)", () => {
    const signedEightDaysAgo = Date.now() - 8 * DAY;
    const token = signWinbackToken("a@b.com", "USD", signedEightDaysAgo);
    expect(verifyWinbackToken(token)).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(verifyWinbackToken("garbage")).toBeNull();
    expect(verifyWinbackToken("")).toBeNull();
  });
});
