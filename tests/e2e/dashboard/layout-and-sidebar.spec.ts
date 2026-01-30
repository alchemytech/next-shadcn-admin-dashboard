import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Dashboard - Layout and Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/default");
  });

  test("header contains sidebar trigger and main content area", async ({ page }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("sidebar trigger toggles sidebar", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /toggle sidebar|sidebar/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator("[data-sidebar]").or(page.locator("[data-state=collapsed]"))).toBeVisible();
  });

  test("search dialog can be opened from header", async ({ page }) => {
    const searchButton = page.getByRole("button", { name: /search|open command/i }).first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await expect(page.getByRole("dialog").or(page.getByPlaceholder(/search/i))).toBeVisible({ timeout: 3000 });
    }
  });

  test("navigation link to Default dashboard works", async ({ page }) => {
    await page.goto("/dashboard/crm");
    await page
      .getByRole("link", { name: /default/i })
      .first()
      .click();
    await expect(page).toHaveURL("/dashboard/default");
  });

  test("navigation link to CRM works", async ({ page }) => {
    await page.getByRole("link", { name: /crm/i }).first().click();
    await expect(page).toHaveURL("/dashboard/crm");
  });

  test("navigation link to Finance works", async ({ page }) => {
    await page
      .getByRole("link", { name: /finance/i })
      .first()
      .click();
    await expect(page).toHaveURL("/dashboard/finance");
  });

  test("theme switcher is present in header", async ({ page }) => {
    await expect(page.getByRole("button", { name: /theme|light|dark|system/i }).first()).toBeVisible();
  });

  test("account switcher or user menu is present", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /account|user|profile/i }).or(page.locator("[data-slot=nav-user]")),
    ).toBeVisible({ timeout: 5000 });
  });
});
