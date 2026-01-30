import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Search Dialog (Command Palette)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/default");
  });

  test("opening search shows dialog or combobox", async ({ page }) => {
    const searchTrigger = page.getByRole("button", { name: /search|open command/i }).first();
    await expect(searchTrigger).toBeVisible({ timeout: 5000 });
    await searchTrigger.click();
    await expect(
      page
        .getByRole("dialog")
        .or(page.getByPlaceholder(/search|type to search/i))
        .or(page.getByRole("combobox")),
    ).toBeVisible({ timeout: 3000 });
  });

  test("can type in search input when open", async ({ page }) => {
    const searchTrigger = page.getByRole("button", { name: /search|open command/i }).first();
    await searchTrigger.click();
    const input = page.getByPlaceholder(/search|type/i).or(page.getByRole("combobox"));
    await expect(input).toBeVisible({ timeout: 3000 });
    await input.fill("dashboard");
    await expect(input).toHaveValue("dashboard");
  });

  test("escape closes search", async ({ page }) => {
    const searchTrigger = page.getByRole("button", { name: /search|open command/i }).first();
    await searchTrigger.click();
    await expect(page.getByRole("dialog").or(page.getByPlaceholder(/search/i))).toBeVisible({ timeout: 3000 });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
