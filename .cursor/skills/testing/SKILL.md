---
name: testing
description: "Playwright E2E testing standards and best practices"
---

# Testing Standards

## Testing Strategy

**E2E Testing**: Playwright
**Component Testing**: Playwright (component tests)
**No Unit Tests**: Prefer E2E tests for better confidence

Already configured: @playwright.config.ts

## Playwright E2E Tests

### Test File Structure

```typescript
// tests/e2e/feature-name.spec.ts
import { test, expect } from "@playwright/test";
import { loginAsUser } from "./fixtures";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto("/feature");
  });

  test("should do something", async ({ page }) => {
    // Test implementation
  });

  test("should handle error case", async ({ page }) => {
    // Test implementation
  });
});
```

### Location

All tests in `@tests/e2e/` directory:

```
tests/
└── e2e/
    ├── auth/
    │   ├── login.spec.ts
    │   └── register.spec.ts
    ├── dashboard/
    │   ├── crm-page.spec.ts
    │   ├── default-page.spec.ts
    │   └── finance-page.spec.ts
    ├── components/
    │   ├── theme-and-layout.spec.ts
    │   └── search-dialog.spec.ts
    ├── fixtures.ts
    ├── edge-cases.spec.ts
    └── navigation.spec.ts
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test("user can login", async ({ page }) => {
  // Navigate
  await page.goto("/login");

  // Interact
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  // Assert
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Dashboard");
});
```

### Selectors Best Practices

```typescript
// ✅ GOOD: Use data-testid
<Button data-testid="submit-button">Submit</Button>
await page.click('[data-testid="submit-button"]');

// ✅ GOOD: Use role selectors
await page.click('button:has-text("Submit")');
await page.getByRole("button", { name: "Submit" }).click();

// ✅ GOOD: Use label text
await page.fill('input[name="email"]', "user@example.com");
await page.getByLabel("Email").fill("user@example.com");

// ❌ BAD: Class names (fragile)
await page.click('.btn-primary');

// ❌ BAD: Complex CSS selectors
await page.click('div.container > div:nth-child(2) > button');
```

### Waiting for Elements

```typescript
// ✅ GOOD: Auto-waiting
await page.click("button"); // Waits until clickable

// ✅ GOOD: Explicit wait for element
await page.waitForSelector('[data-testid="success-message"]');

// ✅ GOOD: Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/dashboard"]'),
]);

// ✅ GOOD: Wait for API response
await page.waitForResponse((response) => 
  response.url().includes("/api/users") && response.status() === 200
);
```

### Assertions

```typescript
// ✅ GOOD: Various assertion types
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveTitle("Dashboard");
await expect(page.locator("h1")).toBeVisible();
await expect(page.locator("h1")).toContainText("Dashboard");
await expect(page.locator("h1")).toHaveText("Dashboard");
await expect(page.locator("input")).toHaveValue("test");
await expect(page.locator("button")).toBeDisabled();
await expect(page.locator('[data-testid="success"]')).toHaveClass(/success/);

// ✅ GOOD: Count elements
await expect(page.locator(".item")).toHaveCount(5);

// ✅ GOOD: Check attribute
await expect(page.locator("a")).toHaveAttribute("href", "/about");
```

## Test Fixtures

### Reusable Setup

```typescript
// tests/e2e/fixtures.ts
import type { Page } from "@playwright/test";

export async function loginAsUser(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

// Usage in tests
import { loginAsUser } from "./fixtures";

test("user can view profile", async ({ page }) => {
  await loginAsUser(page);
  await page.click('[data-testid="profile-link"]');
  // ...
});
```

### Custom Fixtures

```typescript
import { test as base } from "@playwright/test";

type Fixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: login before test
    await page.goto("/login");
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Provide authenticated page to test
    await use(page);

    // Teardown: logout after test
    await page.click('[data-testid="logout"]');
  },
});

// Usage
test("can access protected page", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/settings");
  await expect(authenticatedPage).toHaveURL("/settings");
});
```

## Testing Patterns

### Form Testing

```typescript
test("form validation works", async ({ page }) => {
  await page.goto("/contact");

  // Submit empty form
  await page.click('button[type="submit"]');

  // Check validation errors
  await expect(page.locator('[data-testid="email-error"]')).toContainText(
    "Email is required"
  );

  // Fill form correctly
  await page.fill('input[name="name"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.fill('textarea[name="message"]', "Hello!");

  // Submit
  await page.click('button[type="submit"]');

  // Check success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Navigation Testing

```typescript
test("sidebar navigation works", async ({ page }) => {
  await page.goto("/dashboard");

  // Click sidebar link
  await page.click('[data-testid="nav-settings"]');
  await expect(page).toHaveURL("/dashboard/settings");

  // Click another link
  await page.click('[data-testid="nav-profile"]');
  await expect(page).toHaveURL("/dashboard/profile");

  // Breadcrumbs work
  await expect(page.locator('[data-testid="breadcrumb"]')).toContainText("Profile");
});
```

### Data Table Testing

```typescript
test("data table interactions", async ({ page }) => {
  await page.goto("/dashboard/users");

  // Check table loaded
  await expect(page.locator("table")).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(10);

  // Sort by column
  await page.click('th:has-text("Name")');
  await expect(page.locator("tbody tr:first-child td:first-child")).toContainText(
    "Alice"
  );

  // Filter
  await page.fill('[data-testid="search-input"]', "john");
  await expect(page.locator("tbody tr")).toHaveCount(2);

  // Pagination
  await page.click('[data-testid="next-page"]');
  await expect(page).toHaveURL(/page=2/);
});
```

### Modal/Dialog Testing

```typescript
test("dialog opens and closes", async ({ page }) => {
  await page.goto("/dashboard");

  // Dialog not visible initially
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();

  // Open dialog
  await page.click('[data-testid="open-dialog"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Close with button
  await page.click('[data-testid="close-dialog"]');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();

  // Open again
  await page.click('[data-testid="open-dialog"]');

  // Close with Escape
  await page.keyboard.press("Escape");
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

### Toast Notification Testing

```typescript
test("shows success toast", async ({ page }) => {
  await page.goto("/dashboard");

  // Trigger action that shows toast
  await page.click('[data-testid="save-button"]');

  // Check toast appears
  await expect(page.locator('[data-sonner-toast]')).toContainText(
    "Saved successfully"
  );

  // Wait for toast to disappear
  await expect(page.locator('[data-sonner-toast]')).not.toBeVisible({
    timeout: 5000,
  });
});
```

## Test Organization

### Group Related Tests

```typescript
test.describe("User Authentication", () => {
  test.describe("Login", () => {
    test("successful login", async ({ page }) => {
      // Test
    });

    test("failed login", async ({ page }) => {
      // Test
    });
  });

  test.describe("Registration", () => {
    test("successful registration", async ({ page }) => {
      // Test
    });

    test("validation errors", async ({ page }) => {
      // Test
    });
  });
});
```

### Shared Setup/Teardown

```typescript
test.describe("Dashboard Tests", () => {
  test.beforeAll(async ({ browser }) => {
    // Run once before all tests
  });

  test.beforeEach(async ({ page }) => {
    // Run before each test
    await page.goto("/dashboard");
  });

  test.afterEach(async ({ page }) => {
    // Run after each test
    await page.close();
  });

  test.afterAll(async () => {
    // Run once after all tests
  });

  test("test 1", async ({ page }) => {
    // Test
  });

  test("test 2", async ({ page }) => {
    // Test
  });
});
```

## Running Tests

### Commands

```bash
# Run all tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# CI mode
npm run test:e2e:ci
```

### Debug Tests

```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Debug specific test
npx playwright test tests/e2e/auth/login.spec.ts --debug

# Show trace viewer
npx playwright show-trace trace.zip
```

## Test Data

### Use Data Attributes

```typescript
// Component
<Button data-testid="submit-button">Submit</Button>

// Test
await page.click('[data-testid="submit-button"]');
```

### Mock API Responses

```typescript
test("handles API error", async ({ page }) => {
  // Mock API error
  await page.route("**/api/users", (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    })
  );

  await page.goto("/users");

  // Check error message displayed
  await expect(page.locator('[data-testid="error"]')).toContainText(
    "Failed to load users"
  );
});

// Mock successful response
test("displays users", async ({ page }) => {
  await page.route("**/api/users", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]),
    })
  );

  await page.goto("/users");

  await expect(page.locator('[data-testid="user-name"]')).toHaveCount(2);
});
```

## Accessibility Testing

```typescript
test("page is keyboard accessible", async ({ page }) => {
  await page.goto("/dashboard");

  // Tab to first element
  await page.keyboard.press("Tab");

  // Check focus is visible
  const focusedElement = await page.locator(":focus");
  await expect(focusedElement).toBeVisible();

  // Tab through interactive elements
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  // Activate with Enter
  await page.keyboard.press("Enter");
});

test("screen reader landmarks", async ({ page }) => {
  await page.goto("/dashboard");

  // Check semantic HTML
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("nav")).toBeVisible();
  await expect(page.locator("header")).toBeVisible();

  // Check ARIA labels
  await expect(page.locator('[aria-label="Main navigation"]')).toBeVisible();
});
```

## Best Practices

1. **Test user flows, not implementation** - Test what users do
2. **Use semantic selectors** - Roles, labels, text content
3. **Auto-waiting is preferred** - Don't use arbitrary timeouts
4. **One assertion per test** - Keep tests focused (or related assertions)
5. **Independent tests** - Tests should not depend on each other
6. **Use fixtures for setup** - Reuse common setup code
7. **Mock external APIs** - Don't hit real APIs in tests
8. **Test edge cases** - Empty states, errors, loading states
9. **Keep tests fast** - Parallel execution, efficient selectors
10. **Descriptive test names** - Clearly state what is tested

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e:ci
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Checklist

Before committing features:

- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Form validation tested
- [ ] Loading states tested
- [ ] Empty states tested
- [ ] Navigation tested
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Tests are independent
- [ ] Tests pass in CI

## References

See existing test patterns:
- @tests/e2e/auth/ (authentication tests)
- @tests/e2e/dashboard/ (page tests)
- @tests/e2e/components/ (component tests)
- @tests/e2e/fixtures.ts (reusable fixtures)
- @playwright.config.ts (Playwright configuration)
