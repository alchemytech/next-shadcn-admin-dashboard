import { test as base } from "@playwright/test";

/**
 * Shared fixtures for E2E tests.
 * Extend with auth state, API mocks, etc. as needed.
 */
export const test = base.extend<Record<string, never>>({});

export { expect } from "@playwright/test";
