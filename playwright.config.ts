import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // global-setup mints the site-gate unlock cookie into this storageState, so
  // every test starts already past the password gate.
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    storageState: "./e2e/.auth/state.json",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      ...process.env,
      // Known password for the site gate so global-setup can mint a matching
      // unlock cookie; keeps e2e off whatever real value is in .env.local.
      SITE_PASSWORD: "e2e-unlock-password",
      // Force the in-process order store so e2e never touches a real Supabase.
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      // Force the no-payment fallback so the smoke test exercises direct
      // generation and never redirects to real Stripe Checkout.
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      // Keep e2e hermetic: no real email sends during the run (capture would
      // otherwise hit Resend for the test address).
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
      // Force the deterministic Deepscan engine: no real (slow, billed) AI
      // calls from the smoke test even when .env.local has a live key.
      ANTHROPIC_API_KEY: "",
    },
  },
});
