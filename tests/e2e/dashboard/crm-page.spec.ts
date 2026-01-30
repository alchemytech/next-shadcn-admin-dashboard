import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Dashboard - CRM page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/crm");
  });

  test("overview cards section is visible", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("[data-slot=card], .rounded-xl").first()).toBeVisible({ timeout: 5000 });
  });

  test("insight cards or charts are present", async ({ page }) => {
    await expect(page.locator("canvas, .recharts-wrapper, [data-slot=card]").first()).toBeVisible({ timeout: 8000 });
  });

  test("operational or table cards section exists", async ({ page }) => {
    await expect(
      page
        .getByRole("main")
        .locator("div")
        .filter({ hasText: /revenue|leads|target/i })
        .first(),
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test("tables or data grids are present", async ({ page }) => {
    await expect(page.getByRole("table").or(page.locator("[role=grid]")).first()).toBeVisible({ timeout: 5000 });
  });

  test("page does not show error boundary", async ({ page }) => {
    await expect(page.getByText(/something went wrong|error/i)).not.toBeVisible();
  });
});
