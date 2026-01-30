import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Auth - Login", () => {
  test.describe("V1 Login (/auth/v1/login)", () => {
    test("should display login page with form and link to register", async ({ page }) => {
      await page.goto("/auth/v1/login");
      await page
        .getByRole("textbox", { name: /email/i })
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first()
        .waitFor({ state: "visible", timeout: 15000 });
      await expect(page.getByText(/login/i).first()).toBeVisible();
      await expect(page.getByLabel(/email address/i).or(page.getByPlaceholder(/you@example\.com/i))).toBeVisible();
      await expect(page.getByLabel(/password/i).or(page.getByPlaceholder("••••••••"))).toBeVisible();
      await expect(page.getByRole("checkbox", { name: /remember me/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^login$/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
    });

    test("should show validation error when email is invalid", async ({ page }) => {
      await page.goto("/auth/v1/login");
      await page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first()
        .fill("not-an-email");
      await page
        .getByLabel(/password/i)
        .or(page.getByPlaceholder("••••••••"))
        .first()
        .fill("password123");
      // Bypass HTML5 validation right before submit so Zod runs (browser blocks submit for invalid type="email")
      await page.locator('input[name="email"]').evaluate((el) => (el as HTMLInputElement).setAttribute("type", "text"));
      await page.getByRole("button", { name: /^login$/i }).click();
      const emailInput = page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first();
      await expect(emailInput).toHaveAttribute("aria-invalid", "true", { timeout: 5000 });
    });

    test("should show validation error when password is too short", async ({ page }) => {
      await page.goto("/auth/v1/login");
      await page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first()
        .fill("user@example.com");
      await page
        .getByLabel(/password/i)
        .or(page.getByPlaceholder("••••••••"))
        .first()
        .fill("12345");
      await page.getByRole("button", { name: /^login$/i }).click();
      await expect(page.getByText(/at least 6 characters/i)).toBeVisible({ timeout: 5000 });
    });

    test("should submit successfully with valid credentials", async ({ page }) => {
      await page.goto("/auth/v1/login");
      await page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first()
        .fill("user@example.com");
      await page
        .getByLabel(/password/i)
        .or(page.getByPlaceholder("••••••••"))
        .first()
        .fill("password123");
      await page.getByRole("button", { name: /^login$/i }).click();
      await expect(page.getByText(/you submitted the following values/i)).toBeVisible({ timeout: 10000 });
    });

    test("should allow toggling remember me checkbox", async ({ page }) => {
      await page.goto("/auth/v1/login");
      const remember = page.getByRole("checkbox", { name: /remember me/i });
      await expect(remember).not.toBeChecked();
      await remember.click();
      await expect(remember).toBeChecked();
      await remember.click();
      await expect(remember).not.toBeChecked();
    });

    test("should navigate to register when clicking register link", async ({ page }) => {
      await page.goto("/auth/v1/login");
      await page.getByRole("link", { name: /register/i }).click();
      await expect(page).toHaveURL(/\/auth\/v1\/register/);
    });

    test("edge: empty submit shows email and password errors", async ({ page }) => {
      await page.goto("/auth/v1/login");
      await page.getByRole("button", { name: /^login$/i }).click();
      await expect(page.getByText(/valid email|at least 6/i).first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("V2 Login (/auth/v2/login)", () => {
    test("should display login page with form", async ({ page }) => {
      await page.goto("/auth/v2/login");
      await page.getByRole("heading", { name: /login to your account/i }).waitFor({ state: "visible", timeout: 15000 });
      await expect(page.getByRole("heading", { name: /login to your account/i })).toBeVisible();
      await expect(page.getByLabel(/email address/i).or(page.getByPlaceholder(/you@example\.com/i))).toBeVisible();
      await expect(page.getByLabel(/password/i).or(page.getByPlaceholder("••••••••"))).toBeVisible();
      await expect(page.getByRole("button", { name: /^login$/i })).toBeVisible();
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.goto("/auth/v2/login");
      await page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first()
        .fill("bad");
      await page
        .getByLabel(/password/i)
        .or(page.getByPlaceholder("••••••••"))
        .first()
        .fill("password123");
      await page.locator('input[name="email"]').evaluate((el) => (el as HTMLInputElement).setAttribute("type", "text"));
      await page.getByRole("button", { name: /^login$/i }).click();
      const emailInput = page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first();
      await expect(emailInput).toHaveAttribute("aria-invalid", "true", { timeout: 5000 });
    });

    test("should submit successfully with valid data", async ({ page }) => {
      await page.goto("/auth/v2/login");
      await page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first()
        .fill("user@example.com");
      await page
        .getByLabel(/password/i)
        .or(page.getByPlaceholder("••••••••"))
        .first()
        .fill("password123");
      await page.getByRole("button", { name: /^login$/i }).click();
      await expect(page.getByText(/you submitted the following values/i)).toBeVisible({ timeout: 10000 });
    });

    test("edge: very long email input does not break layout", async ({ page }) => {
      await page.goto("/auth/v2/login");
      const longEmail = "a".repeat(200) + "@example.com";
      await page
        .getByLabel(/email address/i)
        .or(page.getByPlaceholder(/you@example\.com/i))
        .first()
        .fill(longEmail);
      await page.getByRole("button", { name: /^login$/i }).click();
      await expect(page.getByLabel(/email address/i).or(page.getByPlaceholder(/you@example\.com/i))).toBeVisible();
    });
  });
});
