import { test, expect, type Page } from "@playwright/test";

// Walk the quiz, picking the first option of each step. The question count is
// dynamic (branching follow-ups) and questions can be single-select (radios) or
// multi-select (checkboxes), so we pick whichever control is present and loop
// until the "Run Scan" button appears.
async function completeScan(page: Page) {
  await page.getByLabel("Age").fill("35");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  for (let i = 0; i < 30; i++) {
    const radio = page.getByRole("radio").first();
    const checkbox = page.getByRole("checkbox").first();
    if (await radio.count()) {
      await radio.click();
    } else if (await checkbox.count()) {
      await checkbox.click();
    }

    const runScan = page.getByRole("button", { name: /run scan/i });
    if (await runScan.count()) {
      await runScan.click();
      break;
    }
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
}

// After the analysis, an email wall gates the result. Submit an email to unlock
// it (capture uses the in-memory store + no-op email under the e2e env).
async function passEmailGate(page: Page) {
  const emailInput = page.getByLabel("Email", { exact: true });
  await emailInput.waitFor({ state: "visible", timeout: 15000 });
  await emailInput.fill("e2e@example.com");
  await page.getByRole("button", { name: /unlock my results/i }).click();
}

test("full scan flow reaches the report and pitch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /has a\s+deadline/i })
  ).toBeVisible();

  await page.getByRole("link", { name: /reveal my date/i }).first().click();

  await completeScan(page);
  await passEmailGate(page);

  // Report appears (waits out the analyzing animation).
  await expect(
    page.getByRole("heading", { name: /how long you have left/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(page.getByText(/estimated date of death/i)).toBeVisible();
  // The population anchor line is rendered with the estimate.
  await expect(page.getByText(/the average for your age and sex/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /get instant access/i })
  ).toBeVisible();
});

test("buying builds and shows the generated guide", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /reveal my date/i }).first().click();

  await completeScan(page);
  await passEmailGate(page);

  await expect(
    page.getByRole("heading", { name: /how long you have left/i })
  ).toBeVisible({ timeout: 15000 });

  // Start checkout via the report's direct CTA (no scroll-jump).
  await page.getByRole("button", { name: /build my plan/i }).first().click();

  // The build is deliberately paced, so the building screen shows first.
  await expect(
    page.getByRole("heading", { name: /being written/i })
  ).toBeVisible({ timeout: 15000 });

  // Then the finished guide renders. "Your week-by-week plan" is a <span> in
  // SectionLabel, not a heading, so target it via text.
  await expect(
    page.getByRole("heading", { name: /second wind protocol/i })
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByText("Your week-by-week plan", { exact: true })
  ).toBeVisible({ timeout: 20000 });
  // New depth sections are present.
  await expect(page.getByText(/your biggest risks, in depth/i)).toBeVisible();
  await expect(page.getByText("Your numbers", { exact: true })).toBeVisible();
  // The download kit offers the workbook plus the tracker pack and quick-start.
  await expect(
    page.getByRole("link", { name: /download your workbook pdf/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /printable tracker pack/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /one-page quick-start/i })
  ).toBeVisible();

  // Every asset actually renders at runtime (exercises @react-pdf
  // renderToBuffer for each document, the guard against fixed-element crashes).
  const guideUrl = page.url();
  for (const asset of ["workbook", "trackers", "quickstart"]) {
    const pdf = await page.request.get(`${guideUrl}/download/${asset}`);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toContain("application/pdf");
  }

  // The AI Deepscan is offered on the guide page as a step-through wizard.
  // Begin it, answer every question (first option each), and the report
  // renders (deterministic offline engine under e2e, since ANTHROPIC_API_KEY
  // is forced empty in playwright.config.ts).
  await expect(page.getByText("AI Deepscan", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /begin my deepscan/i }).click();

  for (let i = 0; i < 40; i++) {
    const group = page.locator("[data-deepscan-question]");
    const radio = group.getByRole("radio").first();
    if (await radio.count()) {
      await radio.click();
    } else {
      await group.getByRole("checkbox").first().click();
    }

    const run = page.getByRole("button", { name: /run my deepscan/i });
    if (await run.count()) {
      await run.click();
      break;
    }
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }

  await expect(page.getByText(/deepscan complete/i)).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByText("Your markers", { exact: true })).toBeVisible();
  await expect(page.getByText("Fix these first", { exact: true })).toBeVisible();
  // Section action lists render ("Do this" appears once per section).
  expect(await page.getByText("Do this", { exact: true }).count()).toBeGreaterThanOrEqual(5);
});
