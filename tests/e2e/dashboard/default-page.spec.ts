import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Dashboard - Default page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/default");
  });

  test("page has section cards area", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("[data-slot=card], .rounded-xl").first()).toBeVisible({ timeout: 5000 });
  });

  test("chart area is present", async ({ page }) => {
    await expect(page.locator("canvas, [role=img], .recharts-wrapper").first()).toBeVisible({ timeout: 8000 });
  });

  test("data table or table content is present", async ({ page }) => {
    await expect(page.getByRole("table").or(page.locator("[data-slot=data-table]")).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("table has column headers or rows", async ({ page }) => {
    const table = page.getByRole("table").first();
    await expect(table).toBeVisible({ timeout: 5000 });
    await expect(table.locator("th, td").first()).toBeVisible();
  });

  test("pagination or table controls exist when table is present", async ({ page }) => {
    const table = page.getByRole("table").first();
    if (await table.isVisible()) {
      await expect(
        page.getByRole("button", { name: /previous|next|page/i }).or(page.locator("[data-slot=pagination]")),
      ).toBeVisible({ timeout: 3000 });
    }
  });
});
