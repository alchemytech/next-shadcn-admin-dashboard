import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Theme and Layout Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/default");
  });

  test("theme switcher opens menu or toggles theme", async ({ page }) => {
    const themeButton = page.getByRole("button", { name: /theme|light|dark|system/i }).first();
    await expect(themeButton).toBeVisible({ timeout: 5000 });
    await themeButton.click();
    const menu = page
      .getByRole("menu")
      .or(page.getByRole("listbox"))
      .or(page.getByText(/light|dark|system/i).first());
    await expect(menu).toBeVisible({ timeout: 3000 });
  });

  test("html has data-theme or class for theme", async ({ page }) => {
    const html = page.locator("html");
    await expect(html)
      .toHaveAttribute("class", /.+/)
      .or(await expect(html).toHaveAttribute("data-theme", /.+/));
  });
});
