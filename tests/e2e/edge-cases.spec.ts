import { expect } from "@playwright/test";

import { test } from "./fixtures";

test.describe("Edge cases and resilience", () => {
  test("direct dashboard root redirects or shows content", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("main").or(page.getByText(/coming soon/i))).toBeVisible({ timeout: 5000 });
  });

  test("auth v2 login with XSS-like input does not break page", async ({ page }) => {
    await page.goto("/auth/v2/login");
    await page.getByLabel(/email address/i).fill("<script>alert(1)</script>@test.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /^login$/i }).click();
    await expect(page.getByText(/valid email|you submitted/i)).toBeVisible({ timeout: 5000 });
  });

  test("very long URL path returns 404 or handled route", async ({ page }) => {
    const response = await page.goto("/dashboard/" + "a".repeat(200));
    const status = response?.status() ?? 0;
    expect([200, 404]).toContain(status);
  });

  test("repeated rapid navigation between dashboard pages", async ({ page }) => {
    await page.goto("/dashboard/default");
    for (let i = 0; i < 3; i++) {
      await page.goto("/dashboard/crm");
      await expect(page).toHaveURL("/dashboard/crm");
      await page.goto("/dashboard/finance");
      await expect(page).toHaveURL("/dashboard/finance");
      await page.goto("/dashboard/default");
      await expect(page).toHaveURL("/dashboard/default");
    }
  });

  test("back button after navigation works", async ({ page }) => {
    await page.goto("/dashboard/default");
    await page.goto("/dashboard/crm");
    await page.goBack();
    await expect(page).toHaveURL("/dashboard/default");
  });
});
