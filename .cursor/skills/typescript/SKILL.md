---
name: typescript
description: "TypeScript standards, type safety rules, and best practices for strict mode development"
---

# TypeScript Rules

## Strict Mode Requirements

Project uses **strict TypeScript mode** per @tsconfig.json

All code must comply with:
- `strict: true`
- `noEmit: true`
- `isolatedModules: true`

## Type Safety Rules

### Never Use `any`

```typescript
// ❌ FORBIDDEN
function processData(data: any) {
  return data.value;
}

// ✅ Required: Use proper types
function processData(data: { value: string }) {
  return data.value;
}

// ✅ Or use generics
function processData<T extends { value: string }>(data: T) {
  return data.value;
}

// ✅ Or unknown for truly unknown types
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return (data as { value: string }).value;
  }
  throw new Error("Invalid data");
}
```

### Prefer Type Over Interface

Use `type` for most cases, `interface` only when needed:

```typescript
// ✅ Good: Use type for objects
type User = {
  id: string;
  name: string;
  email: string;
};

// ✅ Good: Use type for unions
type Status = "pending" | "approved" | "rejected";

// ✅ Good: Interface for class contracts or when you need declaration merging
interface Repository<T> {
  find(id: string): Promise<T>;
  save(entity: T): Promise<void>;
}
```

### Type Inference

Let TypeScript infer when obvious:

```typescript
// ✅ Good: Let TypeScript infer
const count = 42;
const items = ["apple", "banana"];
const user = { name: "John", age: 30 };

// ❌ Bad: Unnecessary annotation (violates Biome's noInferrableTypes)
const count: number = 42;

// ✅ Good: Explicit when needed
const user: User = await fetchUser();
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

## Type Definitions

### Component Props

Always define prop types explicitly:

```typescript
// ✅ Good: Explicit prop type
type ButtonProps = {
  variant?: "default" | "destructive" | "outline";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ variant = "default", size = "default", children, onClick }: ButtonProps) {
  // Implementation
}

// ✅ Also good: Extending HTML attributes
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline";
  size?: "default" | "sm" | "lg";
};
```

### Use const assertions

```typescript
// ✅ Good: Use 'as const' for literal types
const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number]; // 'pending' | 'approved' | 'rejected'

// ✅ Good: Const objects
const CONFIG = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
} as const;
```

### Avoid Type Assertions

Only use when absolutely necessary:

```typescript
// ❌ Avoid: Unsafe assertion
const data = response.data as User;

// ✅ Better: Validate with Zod
import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const data = userSchema.parse(response.data);

// ✅ Or use type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value
  );
}

if (isUser(response.data)) {
  // TypeScript knows it's User here
}
```

## Generic Types

### Keep Generics Simple

```typescript
// ✅ Good: Simple, clear generic
function identity<T>(value: T): T {
  return value;
}

// ✅ Good: Constrained generic
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// ❌ Bad: Over-complicated
function transform<
  T extends Record<string, unknown>,
  K extends keyof T,
  R extends T[K],
  U = Partial<R>
>(input: T, key: K): U {
  // Too complex
}
```

## Type Narrowing

### Use Type Guards

```typescript
// ✅ Good: Type guard function
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string
    return value.toUpperCase();
  }
}

// ✅ Good: Discriminated unions
type Result =
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function handleResult(result: Result) {
  if (result.status === "success") {
    console.log(result.data); // TypeScript knows data exists
  } else {
    console.error(result.error); // TypeScript knows error exists
  }
}
```

## React-Specific Types

### Event Handlers

```typescript
import type { ChangeEvent, FormEvent, MouseEvent } from "react";

// ✅ Good: Specific event types
function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

function handleChange(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value);
}

function handleClick(e: MouseEvent<HTMLButtonElement>) {
  console.log(e.currentTarget);
}
```

### Component Types

```typescript
import type { ComponentProps, ReactNode, FC } from "react";

// ✅ Good: Using ComponentProps
type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

// ✅ Good: Explicit function component
type CardProps = {
  title: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// ❌ Avoid: FC type (deprecated pattern)
export const Card: FC<CardProps> = ({ title, children }) => {
  // Old pattern, avoid
};
```

## Utility Types

Use TypeScript's built-in utility types:

```typescript
// ✅ Good: Utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserWithoutId = Omit<User, "id">;
type UserIdAndName = Pick<User, "id" | "name">;
type ReadonlyUser = Readonly<User>;

// ✅ Good: ReturnType and Parameters
type FetchUserReturn = ReturnType<typeof fetchUser>;
type FetchUserParams = Parameters<typeof fetchUser>;
```

## Type Files Organization

### Co-locate Types

```typescript
// ✅ Good: Types in same file (small number)
type User = {
  id: string;
  name: string;
};

export function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

### Separate Types File

When types are shared across multiple files:

```typescript
// types.ts
export type User = {
  id: string;
  name: string;
  email: string;
};

export type UserRole = "admin" | "user" | "guest";

// user-card.tsx
import type { User } from "./types";

export function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

## Zod Integration

Prefer Zod schemas for runtime validation and type inference:

```typescript
import { z } from "zod";

// ✅ Good: Define schema, infer type
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user", "guest"]),
});

// Infer TypeScript type from Zod schema
type User = z.infer<typeof userSchema>;

// Use for validation
function parseUser(data: unknown): User {
  return userSchema.parse(data);
}
```

See @src/app/(main)/dashboard/default/_components/schema.ts for examples.

## Type Safety Best Practices

1. **Enable strict mode**: Already configured in @tsconfig.json
2. **No implicit any**: Let TypeScript catch missing types
3. **Validate external data**: Use Zod for API responses, form data
4. **Use const assertions**: For literal types and readonly values
5. **Leverage type inference**: Don't over-annotate
6. **Prefer type guards**: Over type assertions
7. **Use discriminated unions**: For state machines and variants
8. **Export types separately**: Use `import type` where possible

## Path Aliases

Use configured path alias from @tsconfig.json:

```typescript
// ✅ Good: Use @/ alias
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/stores/preferences/preferences-store";

// ❌ Bad: Relative imports from deep files
import { Button } from "../../../../../components/ui/button";
```

## Type Checking

Before committing, ensure types are valid:

```bash
npm run build  # Validates TypeScript compilation
```
