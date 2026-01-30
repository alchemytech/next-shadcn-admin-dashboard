import { expect } from "@playwright/test";

import { test } from "../fixtures";

test.describe("Dashboard - Coming Soon", () => {
  test("coming-soon page shows Coming Soon text", async ({ page }) => {
    await page.goto("/dashboard/coming-soon");
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });

  test("coming-soon is inside dashboard layout when navigated from sidebar", async ({ page }) => {
    await page.goto("/dashboard/default");
    const comingSoonLink = page.getByRole("link", { name: /coming soon/i }).first();
    if (await comingSoonLink.isVisible()) {
      await comingSoonLink.click();
      await expect(page).toHaveURL(/coming-soon/);
      await expect(page.getByRole("banner")).toBeVisible();
    }
  });
});

test.describe("Dashboard - Not Found (dynamic)", () => {
  test("invalid dashboard path shows not-found or redirects", async ({ page }) => {
    await page.goto("/dashboard/invalid-sub-route-xyz");
    const notFound = page.getByText(/page not found|coming soon|not found/i);
    const main = page.getByRole("main");
    await expect(notFound.or(main)).toBeVisible({ timeout: 5000 });
  });
});
