---
name: code-quality
description: "Code quality standards, clean code principles, and maintainability guidelines"
---

# Code Quality Standards

## Core Principles

1. **Readability** - Code is read more than written
2. **Simplicity** - Simple solutions over clever ones
3. **Consistency** - Follow established patterns
4. **Maintainability** - Easy to change and extend
5. **Testability** - Easy to test and verify

## Clean Code Practices

### Naming Conventions

```typescript
// ✅ GOOD: Descriptive, clear names
function calculateUserMonthlyRevenue(userId: string) { }
const isUserAuthenticated = true;
const userSubscriptionStatus = "active";

// ❌ BAD: Vague, unclear names
function calc(id: string) { }
const flag = true;
const status = "active";

// ✅ GOOD: Boolean names
const isLoading = false;
const hasPermission = true;
const canEdit = false;
const shouldRender = true;

// ❌ BAD: Boolean names
const loading = false;
const permission = true;
const edit = false;

// ✅ GOOD: Function names (verb + noun)
function fetchUserData() { }
function validateEmail() { }
function formatDate() { }

// ❌ BAD: Function names
function user() { }
function email() { }
function date() { }
```

### Function Size

```typescript
// ✅ GOOD: Small, focused function
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ❌ BAD: Long function doing too much
function processOrder(order: Order) {
  // 100+ lines of code
  // Multiple responsibilities
  // Hard to test and understand
}

// ✅ BETTER: Break into smaller functions
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateTotal(order.items);
  applyDiscount(order, total);
  createInvoice(order);
  sendConfirmationEmail(order);
}
```

**Rule of thumb:**
- Functions: < 50 lines
- Components: < 300 lines
- Files: < 500 lines

### Single Responsibility

```typescript
// ❌ BAD: Multiple responsibilities
function handleUserUpdate(userId: string, data: UserData) {
  // Validate data
  // Update database
  // Send email notification
  // Log activity
  // Update cache
  // Trigger webhooks
}

// ✅ GOOD: Single responsibility
function updateUser(userId: string, data: UserData) {
  validateUserData(data);
  return db.user.update({ where: { id: userId }, data });
}

function notifyUserUpdate(user: User) {
  sendEmailNotification(user);
  logActivity("user.updated", user);
  invalidateUserCache(user.id);
  triggerWebhook("user.updated", user);
}
```

### DRY (Don't Repeat Yourself)

```typescript
// ❌ BAD: Repeated code
function formatUserName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

function formatAdminName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

function formatGuestName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

// ✅ GOOD: Extract common logic
function formatFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

// Use for all cases
const userName = formatFullName(user.firstName, user.lastName);
const adminName = formatFullName(admin.firstName, admin.lastName);
const guestName = formatFullName(guest.firstName, guest.lastName);
```

### YAGNI (You Aren't Gonna Need It)

```typescript
// ❌ BAD: Over-engineering for future needs
type User = {
  id: string;
  name: string;
  email: string;
  // Added for potential future use
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: {
    theme?: string;
    language?: string;
    timezone?: string;
    notifications?: Record<string, boolean>;
  };
  metadata?: Record<string, unknown>;
};

// ✅ GOOD: Only what's needed now
type User = {
  id: string;
  name: string;
  email: string;
};

// Add fields when actually needed
```

## Code Organization

### Import Organization

Biome automatically organizes imports:

```typescript
// 1. React
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

// 2. Next.js
import Link from "next/link";
import { useRouter } from "next/navigation";

// 3. External packages
import { useForm } from "react-hook-form";
import { z } from "zod";

// 4. Internal (@/)
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores/store";

// 5. Relative imports
import { helper } from "./utils";
import type { Props } from "./types";
```

Run `npm run check:fix` to auto-organize.

### File Structure

```typescript
// 1. Imports
import { ... } from "...";

// 2. Types/Interfaces
type Props = { ... };
type State = { ... };

// 3. Constants
const DEFAULT_VALUE = 42;
const API_URL = "...";

// 4. Helper functions (if small)
function helper() { ... }

// 5. Main component/function
export function Component() { ... }

// 6. Sub-components (if needed)
Component.Header = function Header() { ... };
```

### Folder Organization

Follow established structure in @01-architecture.mdc:

```
feature/
├── _components/       # Feature-specific components
│   ├── component-a.tsx
│   ├── component-b.tsx
│   └── index.ts      # Barrel export (optional)
├── schema.ts         # Zod schemas
├── types.ts          # TypeScript types
├── utils.ts          # Utility functions
├── config.ts         # Configuration
└── page.tsx          # Page entry point
```

## Comments & Documentation

### When to Comment

```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Using setTimeout instead of setInterval to prevent overlapping requests
setTimeout(fetchData, 1000);

// ✅ GOOD: Document complex algorithms
/**
 * Calculates compound interest using the formula:
 * A = P(1 + r/n)^(nt)
 * where P = principal, r = rate, n = compounds per year, t = years
 */
function calculateCompoundInterest(principal: number, rate: number, years: number) {
  // Implementation
}

// ❌ BAD: Obvious comments
// Set count to 0
const count = 0;

// Loop through items
items.forEach((item) => { ... });

// ✅ BETTER: Self-documenting code (no comment needed)
const initialCount = 0;
items.forEach(processItem);
```

### TSDoc for Public APIs

```typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user data
 * @throws {APIError} When the user is not found
 */
export async function fetchUser(userId: string): Promise<User> {
  // Implementation
}

/**
 * Button component with multiple variants
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Click me
 * </Button>
 * ```
 */
export function Button({ variant, size, children }: ButtonProps) {
  // Implementation
}
```

### TODO Comments

```typescript
// ✅ GOOD: Actionable TODOs
// TODO: Add pagination when dataset grows beyond 1000 items
// TODO: [TECH-123] Refactor to use new API endpoint
// TODO: @username Review error handling for edge case

// ❌ BAD: Vague TODOs
// TODO: Fix this
// TODO: Improve performance
// TODO: Make this better
```

## Error Handling Quality

### Specific Error Messages

```typescript
// ❌ BAD: Generic errors
throw new Error("Something went wrong");
throw new Error("Invalid input");

// ✅ GOOD: Specific errors
throw new Error(`User with ID ${userId} not found`);
throw new Error(`Email "${email}" is not a valid email address`);
throw new Error(`Password must be at least 8 characters, got ${password.length}`);
```

### Error Recovery

```typescript
// ✅ GOOD: Graceful error handling
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    // Log error for debugging
    console.error("Failed to fetch user:", error);
    
    // Show user-friendly message
    toast.error("Failed to load user data. Please try again.");
    
    // Return fallback or rethrow
    return null;
  }
}
```

## Performance Considerations

### Avoid Premature Optimization

```typescript
// ❌ BAD: Premature optimization
const memoizedValue = useMemo(() => {
  return simpleValue * 2; // Unnecessary memoization
}, [simpleValue]);

// ✅ GOOD: Only memoize expensive operations
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => {
    // Complex calculation
    return acc + complexOperation(item);
  }, 0);
}, [data]);
```

### Measure Before Optimizing

```typescript
// ✅ GOOD: Measure first
console.time("data-processing");
const result = processData(largeDataset);
console.timeEnd("data-processing");
// If slow, then optimize

// Use React DevTools Profiler
// Use Lighthouse
// Use Chrome DevTools Performance tab
```

## Code Smell Detection

### Long Parameter Lists

```typescript
// ❌ BAD: Too many parameters
function createUser(
  name: string,
  email: string,
  age: number,
  city: string,
  country: string,
  phoneNumber: string,
  address: string
) { }

// ✅ GOOD: Use object parameter
type CreateUserParams = {
  name: string;
  email: string;
  age: number;
  location: {
    city: string;
    country: string;
  };
  contact: {
    phone: string;
    address: string;
  };
};

function createUser(params: CreateUserParams) { }
```

### Deep Nesting

```typescript
// ❌ BAD: Deep nesting
function processOrder(order: Order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.user) {
          if (order.user.isVerified) {
            // Process order
          }
        }
      }
    }
  }
}

// ✅ GOOD: Early returns
function processOrder(order: Order) {
  if (!order) return;
  if (!order.items || order.items.length === 0) return;
  if (!order.user || !order.user.isVerified) return;
  
  // Process order
}
```

### Magic Numbers

```typescript
// ❌ BAD: Magic numbers
setTimeout(fetchData, 300);
if (items.length > 100) { }
const discountRate = 0.15;

// ✅ GOOD: Named constants
const DEBOUNCE_DELAY_MS = 300;
const MAX_ITEMS_PER_PAGE = 100;
const STANDARD_DISCOUNT_RATE = 0.15;

setTimeout(fetchData, DEBOUNCE_DELAY_MS);
if (items.length > MAX_ITEMS_PER_PAGE) { }
const discountRate = STANDARD_DISCOUNT_RATE;
```

## Consistency

### Follow Project Patterns

```typescript
// If project uses this pattern:
export function Component({ prop1, prop2 }: Props) {
  return <div>...</div>;
}

// Don't introduce different pattern:
// export const Component: FC<Props> = ({ prop1, prop2 }) => {
//   return <div>...</div>;
// };
```

### Consistent Naming

```typescript
// ✅ GOOD: Consistent naming
const userId = "123";
const userName = "John";
const userEmail = "john@example.com";

// ❌ BAD: Inconsistent naming
const userId = "123";
const nameOfUser = "John";
const user_email = "john@example.com";
```

## Code Review Checklist

Before requesting review:

- [ ] Code follows project patterns
- [ ] Function/component names are clear and descriptive
- [ ] No magic numbers or strings
- [ ] No code duplication
- [ ] Error handling is appropriate
- [ ] Comments explain WHY, not WHAT
- [ ] No unnecessary complexity
- [ ] TypeScript types are properly defined
- [ ] Imports are organized
- [ ] Biome checks pass
- [ ] Build succeeds

## Refactoring Guidelines

### When to Refactor

1. **Before adding new feature** - Clean up surrounding code
2. **When fixing bugs** - Improve code quality
3. **When code becomes hard to understand** - Simplify
4. **When patterns emerge** - Extract common code

### Refactoring Safely

```typescript
// 1. Ensure tests pass (if available)
npm run test:e2e

// 2. Make small, incremental changes
// 3. Test after each change
// 4. Commit frequently

// 5. Use TypeScript to catch errors
npm run build
```

## Best Practices Summary

1. **Write code for humans** - Readability matters
2. **Keep it simple** - Avoid unnecessary complexity
3. **Be consistent** - Follow project conventions
4. **Test your code** - Write tests for critical paths
5. **Refactor regularly** - Don't accumulate technical debt
6. **Review your own code** - Before submitting PR
7. **Learn from feedback** - Incorporate review comments
8. **Stay updated** - Learn new patterns and practices
9. **Document complex logic** - Help future maintainers
10. **Measure, don't guess** - Profile before optimizing

## Resources

- Clean Code by Robert C. Martin
- Refactoring by Martin Fowler
- React documentation: https://react.dev
- TypeScript handbook: https://www.typescriptlang.org/docs/
- Project rules: @.cursor/rules/
