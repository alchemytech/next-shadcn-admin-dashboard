import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Auth - Register", () => {
  test.describe("V1 Register (/auth/v1/register)", () => {
    test("should display register form with email, password, confirm password", async ({ page }) => {
      await page.goto("/auth/v1/register");
      await expect(page).toHaveURL(/\/auth\/v1\/register/);
      await page.getByRole("button", { name: /^register$/i }).waitFor({ state: "visible", timeout: 15000 });
      await expect(page.getByRole("button", { name: /^register$/i })).toBeVisible();
      await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
      await expect(page.getByPlaceholder("••••••••")).toHaveCount(2); // password + confirm
    });

    test("should show error when passwords do not match", async ({ page }) => {
      await page.goto("/auth/v1/register");
      await page.getByPlaceholder(/you@example\.com/i).fill("user@example.com");
      await page.getByPlaceholder("••••••••").first().fill("password123");
      await page.getByPlaceholder("••••••••").nth(1).fill("different456");
      await page.getByRole("button", { name: /^register$/i }).click();
      await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute("aria-invalid", "true", {
        timeout: 5000,
      });
    });

    test("should show error when password is too short", async ({ page }) => {
      await page.goto("/auth/v1/register");
      await page.getByPlaceholder(/you@example\.com/i).fill("user@example.com");
      await page.getByPlaceholder("••••••••").first().fill("12345");
      await page.getByPlaceholder("••••••••").nth(1).fill("12345");
      await page.getByRole("button", { name: /^register$/i }).click();
      await expect(page.locator('input[name="password"]')).toHaveAttribute("aria-invalid", "true", { timeout: 5000 });
    });

    test("should submit successfully when all fields valid", async ({ page }) => {
      await page.goto("/auth/v1/register");
      await page.getByPlaceholder(/you@example\.com/i).fill("newuser@example.com");
      await page.getByPlaceholder("••••••••").first().fill("password123");
      await page.getByPlaceholder("••••••••").nth(1).fill("password123");
      await page.getByRole("button", { name: /^register$/i }).click();
      await expect(page.getByText(/you submitted the following values/i)).toBeVisible({ timeout: 10000 });
    });

    test("edge: empty submit shows validation errors", async ({ page }) => {
      await page.goto("/auth/v1/register");
      await page.getByRole("button", { name: /^register$/i }).click();
      await expect(page.getByText(/valid email|at least 6|passwords/i).first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("V2 Register (/auth/v2/register)", () => {
    test("should display register form", async ({ page }) => {
      await page.goto("/auth/v2/register");
      await expect(page).toHaveURL(/\/auth\/v2\/register/);
      await page.getByRole("button", { name: /^register$/i }).waitFor({ state: "visible", timeout: 15000 });
      await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
      await expect(page.getByPlaceholder("••••••••")).toHaveCount(2);
    });

    test("should show error for password mismatch", async ({ page }) => {
      await page.goto("/auth/v2/register");
      await page.getByPlaceholder(/you@example\.com/i).fill("user@example.com");
      await page.getByPlaceholder("••••••••").first().fill("password123");
      await page.getByPlaceholder("••••••••").nth(1).fill("nomatch");
      await page.getByRole("button", { name: /^register$/i }).click();
      await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute("aria-invalid", "true", {
        timeout: 5000,
      });
    });

    test("should submit successfully with matching passwords", async ({ page }) => {
      await page.goto("/auth/v2/register");
      await page.getByPlaceholder(/you@example\.com/i).fill("user2@example.com");
      await page.getByPlaceholder("••••••••").first().fill("securepass123");
      await page.getByPlaceholder("••••••••").nth(1).fill("securepass123");
      await page.getByRole("button", { name: /^register$/i }).click();
      await expect(page.getByText(/you submitted the following values/i)).toBeVisible({ timeout: 10000 });
    });
  });
});
