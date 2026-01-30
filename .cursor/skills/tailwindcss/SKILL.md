---
name: tailwindcss
description: "TailwindCSS v4 standards, design tokens, and styling best practices"
---

# TailwindCSS Standards

## TailwindCSS v4

Project uses **TailwindCSS v4** with `@tailwindcss/postcss` plugin.

Configuration: @postcss.config.mjs

## Design Tokens

### Use CSS Variables

TailwindCSS v4 uses CSS variables defined in @src/app/globals.css:

```css
@theme {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  --color-primary: hsl(222.2 47.4% 11.2%);
  /* ... more tokens */
}
```

### Tailwind Classes Map to Tokens

```typescript
// ✅ GOOD: Using design tokens
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ BAD: Hardcoded colors
<div className="bg-white text-black">
  <h1 className="text-blue-900">Title</h1>
</div>
```

### Available Tokens

**Colors:**
- `background` / `foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `border` / `input` / `ring`

**Radii:**
- `radius` (default)
- `radius-sm` / `radius-md` / `radius-lg`

**Chart Colors:**
- `chart-1` through `chart-5`

## Utility-First Approach

### Prefer Tailwind Classes

```typescript
// ✅ GOOD: Tailwind utilities
<div className="flex items-center justify-between p-4 rounded-lg bg-card">
  <h2 className="text-lg font-semibold">Title</h2>
</div>

// ❌ BAD: Inline styles
<div style={{ display: "flex", padding: "16px", borderRadius: "8px" }}>
  <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Title</h2>
</div>

// ❌ BAD: Custom CSS classes (unless absolutely necessary)
<div className="custom-card">
  <h2 className="custom-title">Title</h2>
</div>
```

## Class Organization

### Use Consistent Ordering

Follow Tailwind's recommended order:

1. **Layout**: display, position, z-index
2. **Sizing**: width, height, max-width, etc.
3. **Spacing**: margin, padding
4. **Typography**: font, text color, alignment
5. **Visual**: background, border, shadow
6. **Interaction**: cursor, pointer-events
7. **Transitions**: transition, animation
8. **Responsive**: breakpoints
9. **States**: hover, focus, active, disabled

```typescript
// ✅ GOOD: Organized classes
<button className="
  flex items-center justify-center
  w-full
  px-4 py-2
  text-sm font-medium text-white
  bg-primary
  border border-transparent
  rounded-md
  cursor-pointer
  transition-colors
  hover:bg-primary/90
  focus:outline-none focus:ring-2 focus:ring-ring
  disabled:opacity-50 disabled:pointer-events-none
">
  Click Me
</button>
```

### Use cn() for Dynamic Classes

Import from `@/lib/utils`:

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class",
  className, // Allow external overrides
)} />
```

The `cn()` utility uses `clsx` and `tailwind-merge` to:
1. Conditionally apply classes
2. Merge and deduplicate Tailwind classes
3. Resolve conflicting utilities

```typescript
// ✅ GOOD: cn() resolves conflicts
cn("px-2 py-1", "px-4") // Result: "py-1 px-4" (px-4 wins)

// ✅ GOOD: Conditional classes
cn({
  "bg-primary": isPrimary,
  "bg-secondary": isSecondary,
  "text-white": isPrimary || isSecondary,
})
```

## Responsive Design

### Mobile-First Approach

```typescript
// ✅ GOOD: Mobile-first
<div className="
  flex flex-col
  md:flex-row
  lg:items-center
">
  Content
</div>

// ❌ BAD: Desktop-first (avoid)
<div className="
  flex-row lg:flex-row md:flex-col sm:flex-col
">
  Content
</div>
```

### Breakpoints

```typescript
// Default breakpoints in Tailwind v4
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Desktops
xl: 1280px  // Large desktops
2xl: 1536px // Extra large screens

// Usage
<div className="
  w-full
  sm:w-1/2
  md:w-1/3
  lg:w-1/4
">
  Responsive width
</div>
```

## Component Variants

### Use CVA for Complex Components

Already installed: `class-variance-authority`

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base classes
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    // Variants
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    // Default variants
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Type-safe props
type ButtonProps = VariantProps<typeof buttonVariants> & {
  // Additional props
};

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

## Common Patterns

### Flexbox Layouts

```typescript
// Horizontal centering
<div className="flex items-center justify-center">

// Vertical stack
<div className="flex flex-col gap-4">

// Space between
<div className="flex items-center justify-between">

// Wrap
<div className="flex flex-wrap gap-2">
```

### Grid Layouts

```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
```

### Spacing

```typescript
// Consistent gaps
<div className="space-y-4"> {/* Vertical spacing */}
<div className="space-x-2"> {/* Horizontal spacing */}
<div className="gap-4">     {/* Flex/Grid gap */}

// Padding and margin
<div className="p-4">   {/* All sides: 1rem */}
<div className="px-6">  {/* Horizontal: 1.5rem */}
<div className="py-2">  {/* Vertical: 0.5rem */}
<div className="pt-8">  {/* Top only: 2rem */}
```

### Typography

```typescript
// Heading scales
<h1 className="text-4xl font-bold tracking-tight">
<h2 className="text-3xl font-semibold">
<h3 className="text-2xl font-semibold">
<h4 className="text-xl font-medium">

// Body text
<p className="text-base text-foreground">
<p className="text-sm text-muted-foreground">

// Line height
<p className="leading-7">     {/* 1.75rem */}
<p className="leading-relaxed"> {/* 1.625 */}
```

### Borders and Shadows

```typescript
// Borders
<div className="border border-border rounded-lg">
<div className="border-b border-border">

// Shadows
<div className="shadow-sm">  {/* Subtle */}
<div className="shadow-md">  {/* Medium */}
<div className="shadow-lg">  {/* Large */}
```

## Dark Mode

### Use Design Tokens

TailwindCSS automatically handles dark mode via CSS variables:

```typescript
// ✅ GOOD: Tokens adapt to theme
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Text</p>
</div>

// CSS variables change based on theme automatically
// No need for dark: prefix when using design tokens
```

### Manual Dark Mode Classes (if needed)

```typescript
// Only use dark: prefix for custom cases
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">Text</p>
</div>

// But prefer design tokens:
<div className="bg-background text-foreground">
  <p>Text</p>
</div>
```

## Theme Customization

Custom theme presets in @src/styles/presets/:
- `brutalist.css`
- `soft-pop.css`
- `tangerine.css`

Users can switch themes via preferences.

## Performance

### Avoid Arbitrary Values (When Possible)

```typescript
// ✅ GOOD: Use scale values
<div className="p-4 text-lg">

// ❌ AVOID: Arbitrary values (unless necessary)
<div className="p-[17px] text-[19px]">

// ✅ OK: When needed for specific designs
<div className="w-[calc(100%-2rem)]">
```

### Extract Repeated Patterns

```typescript
// ❌ BAD: Repeated long class strings
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm">

// ✅ GOOD: Use shadcn Card component
import { Card } from "@/components/ui/card";

<Card>
<Card>
<Card>
```

## Animations

### Use Tailwind Animations

```typescript
// Built-in animations
<div className="animate-spin">      {/* Spinner */}
<div className="animate-pulse">     {/* Loading state */}
<div className="animate-bounce">    {/* Attention */}

// Transitions
<div className="transition-colors hover:bg-accent">
<div className="transition-all duration-300 ease-in-out">
```

### Custom Animations

Use `tw-animate-css` (already installed):

```typescript
// See @package.json - tw-animate-css provides additional animations
```

## Best Practices

1. **Use design tokens**: Always prefer `bg-background` over `bg-white`
2. **Mobile-first**: Start with mobile, add larger breakpoints
3. **Use cn()**: For combining and deduplicating classes
4. **Leverage CVA**: For components with multiple variants
5. **Avoid inline styles**: Use Tailwind utilities instead
6. **Consistent spacing**: Use spacing scale (4, 8, 12, 16, etc.)
7. **Semantic colors**: Use `primary`, `destructive`, etc., not `red-500`
8. **Focus states**: Always include focus styles for accessibility

## References

- @src/app/globals.css (design tokens)
- @src/lib/utils.ts (cn utility)
- @src/components/ui/ (CVA examples)
- @postcss.config.mjs (Tailwind v4 config)
