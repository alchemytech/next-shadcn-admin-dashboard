import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Dashboard - Finance page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/finance");
  });

  test("tabs Overview is visible and selected by default", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /overview/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /overview/i })).toHaveAttribute("data-state", "active");
  });

  test("KPI cards are present (Primary Account, Net Worth, etc.)", async ({ page }) => {
    await expect(page.getByText(/primary account|net worth|monthly cash flow|savings rate/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("cash flow or chart section is visible", async ({ page }) => {
    await expect(
      page
        .getByText(/cash flow|spending|income/i)
        .or(page.locator("canvas"))
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Activity and Insights tabs are present (may be disabled)", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /activity/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /insights/i })).toBeVisible();
  });

  test("switching to Overview tab shows overview content", async ({ page }) => {
    await page.getByRole("tab", { name: /overview/i }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  });

  test("card overview or spending breakdown is present", async ({ page }) => {
    await expect(page.getByText(/card overview|spending breakdown|income reliability/i).first()).toBeVisible({
      timeout: 5000,
    });
  });
});
