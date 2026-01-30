---
name: ui-components
description: "UI component standards, shadcn/ui usage, and component composition patterns"
---

# UI Components & Design System

## shadcn/ui Components

### Core Principle: DO NOT EDIT

Components in `@/components/ui/` are **generated and managed by shadcn CLI**.

```bash
# ✅ Add new components
npx shadcn@latest add button

# ❌ NEVER manually edit ui components
```

### Extending shadcn Components

To customize, use composition not modification:

```typescript
// ❌ BAD: Editing ui/button.tsx directly
// Don't modify @/components/ui/button.tsx

// ✅ GOOD: Create wrapper component
import { Button } from "@/components/ui/button";

type IconButtonProps = ComponentProps<typeof Button> & {
  icon: LucideIcon;
  iconPosition?: "left" | "right";
};

export function IconButton({ icon: Icon, iconPosition = "left", children, ...props }: IconButtonProps) {
  return (
    <Button {...props}>
      {iconPosition === "left" && <Icon className="mr-2 h-4 w-4" />}
      {children}
      {iconPosition === "right" && <Icon className="ml-2 h-4 w-4" />}
    </Button>
  );
}
```

### Available Components

Check @components.json for installed components:

- **Layout**: Card, Separator, Resizable, Sheet, Sidebar
- **Forms**: Form, Input, Textarea, Select, Checkbox, Radio, Switch
- **Feedback**: Alert, Toast (Sonner), Dialog, Drawer
- **Navigation**: Command, Tabs, Breadcrumb, Navigation Menu
- **Data Display**: Table, Avatar, Badge, Progress, Skeleton
- **Overlay**: Dropdown Menu, Context Menu, Popover, Hover Card, Tooltip

## Component Structure

### Anatomy of a Component

```typescript
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1. Define variants with CVA
const componentVariants = cva(
  "base-classes", // Base styles
  {
    variants: {
      variant: {
        default: "variant-classes",
        secondary: "secondary-classes",
      },
      size: {
        default: "size-classes",
        sm: "small-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2. Define prop types
type ComponentProps = ComponentProps<"div"> &
  VariantProps<typeof componentVariants> & {
    // Additional props
  };

// 3. Implement component
export function Component({ variant, size, className, ...props }: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

### Component Organization

```typescript
// 1. Imports (organized by Biome)
import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 2. Types/Interfaces
type Props = {
  title: string;
  children: ReactNode;
};

// 3. Component
export function Component({ title, children }: Props) {
  // Hooks
  const [state, setState] = useState(false);

  // Event handlers
  const handleClick = () => {
    setState(!state);
  };

  // Render
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// 4. Sub-components (if needed)
Component.Header = function ComponentHeader({ children }: { children: ReactNode }) {
  return <header>{children}</header>;
};
```

## Component Reusability

### When to Create a Component

Create reusable component when:
- Used in 3+ places
- Complex logic (50+ lines)
- Clear single responsibility
- Needs independent testing

**Don't create premature abstractions:**

```typescript
// ❌ BAD: Over-abstraction for single use
<GenericCard type="user" data={user} renderHeader={...} renderFooter={...} />

// ✅ GOOD: Specific component
<UserCard user={user} />
```

### Composition Patterns

#### 1. Compound Components

```typescript
export function Card({ children, className }: CardProps) {
  return <div className={cn("card", className)}>{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: ReactNode }) {
  return <header className="card-header">{children}</header>;
};

Card.Body = function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: ReactNode }) {
  return <footer className="card-footer">{children}</footer>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

#### 2. Render Props

```typescript
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
};

export function List<T>({ items, renderItem, emptyState }: ListProps<T>) {
  if (items.length === 0) {
    return <>{emptyState || <p>No items</p>}</>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  emptyState={<EmptyState />}
/>
```

#### 3. Slot Pattern

```typescript
type CardProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function Card({ header, footer, children }: CardProps) {
  return (
    <div className="card">
      {header && <header className="card-header">{header}</header>}
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </div>
  );
}

// Usage
<Card
  header={<h2>Title</h2>}
  footer={<Button>Action</Button>}
>
  Content
</Card>
```

## Styling Standards

### Use Class Variance Authority (CVA)

Already installed and configured:

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Use cn() Utility

Combine classnames with `cn()` from `@/lib/utils`:

```typescript
import { cn } from "@/lib/utils";

// Merges and deduplicates Tailwind classes
<div className={cn(
  "base-class",
  isActive && "active-class",
  className // Allow external overrides
)} />
```

### TailwindCSS v4 Patterns

See @06-tailwindcss.mdc for detailed Tailwind rules.

## Icon Usage

### Use lucide-react

Already installed:

```typescript
import { User, Settings, ChevronRight, X } from "lucide-react";

<Button>
  <Settings className="mr-2 h-4 w-4" />
  Settings
</Button>
```

### Icon Sizing Standards

```typescript
// Small icons (inline with text)
<Icon className="h-4 w-4" />

// Medium icons (buttons)
<Icon className="h-5 w-5" />

// Large icons (headers, emphasis)
<Icon className="h-6 w-6" />

// Extra large icons (empty states)
<Icon className="h-12 w-12" />
```

### Simple Icons (Brand Icons)

For brand icons, use `@/components/simple-icon.tsx`:

```typescript
import { SimpleIcon } from "@/components/simple-icon";

<SimpleIcon name="github" />
<SimpleIcon name="google" className="h-5 w-5" />
```

## Data Table Components

Custom data table components in `@/components/data-table/`:

- Uses `@tanstack/react-table`
- Drag-and-drop support with `@dnd-kit`
- Column resizing, sorting, filtering
- Pagination component

See @src/app/(main)/dashboard/default/ for usage examples.

## Client vs Server Components

### Default to Server Components

```typescript
// ✅ Server Component (default)
export function Header() {
  return <header>Header</header>;
}
```

### Use Client Components When Needed

Only add `"use client"` when using:
- React hooks (useState, useEffect, etc.)
- Event handlers
- Browser APIs
- Context providers
- Third-party libraries requiring client

```typescript
// ✅ Client Component (needed for state)
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Optimize Client Boundary

Push `"use client"` as deep as possible:

```typescript
// ❌ BAD: Entire page is client
"use client";

export default function Page() {
  return (
    <div>
      <Header />
      <Counter /> {/* Only this needs client */}
      <Footer />
    </div>
  );
}

// ✅ GOOD: Only interactive component is client
export default function Page() {
  return (
    <div>
      <Header /> {/* Server */}
      <Counter /> {/* Client */}
      <Footer /> {/* Server */}
    </div>
  );
}
```

## Component Documentation

### Self-Documenting Code

```typescript
type ButtonProps = {
  /** Button visual style */
  variant?: "default" | "destructive" | "outline";
  /** Button size */
  size?: "default" | "sm" | "lg";
  /** Makes button full width */
  fullWidth?: boolean;
  /** Loading state - shows spinner and disables button */
  isLoading?: boolean;
};
```

## References

See component patterns in:
- @src/components/ui/ (shadcn components)
- @src/components/data-table/ (data table components)
- @src/app/(main)/dashboard/_components/sidebar/ (sidebar components)
