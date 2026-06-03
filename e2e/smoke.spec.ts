import { test, expect } from "@playwright/test";

const CHOICE_QUESTIONS = 9;

test("full scan flow reaches the report and pitch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /find out when/i })
  ).toBeVisible();

  await page.getByRole("link", { name: /begin/i }).click();

  // Age question
  await page.getByLabel("Age").fill("35");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Answer each choice question by picking the first option.
  for (let i = 0; i < CHOICE_QUESTIONS; i++) {
    // Scope to the radiogroup and pick the first radio option to avoid
    // strict-mode ambiguity when multiple radios are present.
    await page
      .getByRole("radiogroup")
      .first()
      .getByRole("radio")
      .first()
      .click();
    const isLast = i === CHOICE_QUESTIONS - 1;
    const label = isLast ? /run scan/i : "Next";
    await page.getByRole("button", { name: label, exact: !isLast }).click();
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
