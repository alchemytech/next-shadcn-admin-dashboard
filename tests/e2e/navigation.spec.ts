import { expect } from "@playwright/test";

import { test } from "./fixtures";

test.describe("Navigation", () => {
  test("external home redirects to /dashboard/default", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard\/default/);
  });

  test("dashboard default page loads", async ({ page }) => {
    await page.goto("/dashboard/default");
    await expect(page).toHaveURL("/dashboard/default");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("dashboard crm page loads", async ({ page }) => {
    await page.goto("/dashboard/crm");
    await expect(page).toHaveURL("/dashboard/crm");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("dashboard finance page loads", async ({ page }) => {
    await page.goto("/dashboard/finance");
    await expect(page).toHaveURL("/dashboard/finance");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("dashboard coming-soon page loads", async ({ page }) => {
    await page.goto("/dashboard/coming-soon");
    await expect(page).toHaveURL("/dashboard/coming-soon");
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });

  test("unauthorized page shows message and link", async ({ page }) => {
    await page.goto("/unauthorized");
    await expect(page.getByRole("heading", { name: /unauthorized access/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /go to homepage/i })).toBeVisible();
  });

  test("not-found page shows 404 message and go back home", async ({ page }) => {
    await page.goto("/non-existent-route-xyz");
    await expect(page.getByText(/page not found/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /go back home/i })).toBeVisible();
  });

  test("unauthorized Go to Homepage navigates to dashboard", async ({ page }) => {
    await page.goto("/unauthorized");
    await page.getByRole("link", { name: /go to homepage/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("not-found Go back home navigates to dashboard/default", async ({ page }) => {
    await page.goto("/non-existent-route");
    await page.getByRole("link", { name: /go back home/i }).click();
    await expect(page).toHaveURL("/dashboard/default");
  });
});
