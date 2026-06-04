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

test("full scan flow reaches the report and pitch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /find out when/i })
  ).toBeVisible();

  await page.getByRole("link", { name: /begin/i }).first().click();

  await completeScan(page);

  // Report appears (waits out the analyzing animation).
  await expect(
    page.getByRole("heading", { name: /your estimated lifespan/i })
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
  await page.getByRole("link", { name: /begin/i }).first().click();

  await completeScan(page);

  await expect(
    page.getByRole("heading", { name: /your estimated lifespan/i })
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
});
