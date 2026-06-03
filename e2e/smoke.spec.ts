import { test, expect } from "@playwright/test";

test("full scan flow reaches the report and pitch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /find out when/i })
  ).toBeVisible();

  await page.getByRole("link", { name: /begin/i }).click();

  // Age question
  await page.getByLabel("Age").fill("35");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Answer each choice question (picking the first option) until the final
  // step. The question count is dynamic because of branching follow-ups, so we
  // loop until the "Run Scan" button appears rather than counting.
  for (let i = 0; i < 25; i++) {
    await page
      .getByRole("radiogroup")
      .first()
      .getByRole("radio")
      .first()
      .click();

    const runScan = page.getByRole("button", { name: /run scan/i });
    if (await runScan.count()) {
      await runScan.click();
      break;
    }
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }

  // Report appears (waits out the analyzing animation).
  await expect(
    page.getByRole("heading", { name: /your estimated lifespan/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(page.getByText(/estimated date of death/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /get instant access/i })
  ).toBeVisible();
});

test("buying builds and shows the generated guide", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /begin/i }).click();

  await page.getByLabel("Age").fill("35");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  for (let i = 0; i < 25; i++) {
    await page
      .getByRole("radiogroup")
      .first()
      .getByRole("radio")
      .first()
      .click();
    const runScan = page.getByRole("button", { name: /run scan/i });
    if (await runScan.count()) {
      await runScan.click();
      break;
    }
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }

  await expect(
    page.getByRole("heading", { name: /your estimated lifespan/i })
  ).toBeVisible({ timeout: 15000 });

  // Start checkout (the first buy CTA).
  await page.getByRole("button", { name: /get instant access/i }).first().click();

  // Lands on the guide page. The stub generates fast enough that the building
  // screen may be skipped and the guide view rendered directly. Wait up to 15s
  // for either the building-screen h1 or the guide-view h1; then wait for the
  // final guide view regardless. "Your 8-week plan" is a <span> in SectionLabel,
  // not a heading element, so we use getByText.
  await expect(
    page.getByRole("heading", { name: /second wind protocol|being written/i })
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: /second wind protocol/i })
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByText(/your 8-week plan/i)
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByRole("link", { name: /download your pdf/i })
  ).toBeVisible();

  // The PDF actually renders at runtime (exercises @react-pdf renderToBuffer).
  const guideUrl = page.url();
  const pdf = await page.request.get(`${guideUrl}/pdf`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});
