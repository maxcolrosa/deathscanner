import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { UNLOCK_COOKIE, unlockToken } from "../lib/site-gate";

// The dev server under test runs with SITE_PASSWORD set to this value (see the
// webServer env in playwright.config.ts). We mint the matching unlock cookie up
// front and hand it to every test via storageState, so the smoke test starts
// past the site-wide gate instead of driving the /unlock page on every run.
export const E2E_PASSWORD = "e2e-unlock-password";

const STATE_PATH = path.resolve("e2e/.auth/state.json");

export default async function globalSetup() {
  const token = await unlockToken(E2E_PASSWORD);
  const state = {
    cookies: [
      {
        name: UNLOCK_COOKIE,
        value: token,
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };
  await mkdir(path.dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state));
}
