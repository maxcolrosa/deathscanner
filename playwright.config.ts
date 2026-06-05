import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      ...process.env,
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
    },
  },
});
