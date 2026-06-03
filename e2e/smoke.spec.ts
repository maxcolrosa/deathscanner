import { test, expect } from "@playwright/test";

test("full scan flow reaches the report and pitch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /find out when/i })
  ).toBeVisible();

  await page.getByRole("link", { name: /begin assessment/i }).click();

  // Age question
  await page.getByLabel("Age").fill("35");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Answer the remaining choice questions by picking the first option each.
  for (let i = 0; i < 7; i++) {
    // Scope to the radiogroup and pick the first radio option to avoid
    // strict-mode ambiguity when multiple radios are present.
    await page
      .getByRole("radiogroup")
      .first()
      .getByRole("radio")
      .first()
      .click();
    const label = i === 6 ? /run scan/i : "Next";
    const exact = i !== 6;
    await page.getByRole("button", { name: label, exact }).click();
  }

  // Report appears (waits out the analyzing animation).
  await expect(
    page.getByRole("heading", { name: /your projected expiry/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(page.getByText(/estimated date of death/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /get the protocol/i })).toBeVisible();
});
