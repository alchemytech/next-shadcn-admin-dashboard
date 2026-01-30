---
name: accessibility
description: "WCAG 2.1 AA accessibility requirements and best practices"
---

# Accessibility (A11y) Standards

## Critical: WCAG 2.1 AA Compliance

All components must meet **WCAG 2.1 Level AA** standards.

## Semantic HTML

### Use Correct HTML Elements

```typescript
// ✅ GOOD: Semantic HTML
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

<footer>
  <p>&copy; 2024</p>
</footer>

// ❌ BAD: Div soup
<div className="nav">
  <div className="link" onClick={...}>Home</div>
</div>

<div className="main">
  <div className="article">
    <div className="title">Title</div>
    <div>Content</div>
  </div>
</div>
```

### Heading Hierarchy

```typescript
// ✅ GOOD: Proper hierarchy
<h1>Page Title</h1>
<section>
  <h2>Section Title</h2>
  <h3>Subsection</h3>
</section>

// ❌ BAD: Skipping levels
<h1>Page Title</h1>
<h4>Section</h4> {/* Skips h2, h3 */}
```

## Keyboard Navigation

### All Interactive Elements Must Be Keyboard Accessible

```typescript
// ✅ GOOD: Button is natively keyboard accessible
<Button onClick={handleClick}>Click Me</Button>

// ❌ BAD: Div is not keyboard accessible
<div onClick={handleClick}>Click Me</div>

// ✅ FIX: Add role and keyboard handlers
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click Me
</div>
```

### Focus Management

```typescript
// ✅ GOOD: Visible focus indicator
<Button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click Me
</Button>

// ✅ GOOD: Trap focus in modal
import { Dialog } from "@/components/ui/dialog";

<Dialog> {/* Automatically traps focus */}
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>
```

### Skip Links

```typescript
// ✅ GOOD: Skip to main content
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

## ARIA Attributes

### Use ARIA When Semantic HTML Isn't Enough

```typescript
// ✅ GOOD: ARIA label for icon button
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// ✅ GOOD: ARIA describedby for additional context
<Input
  id="email"
  aria-describedby="email-error"
/>
{error && <p id="email-error" className="text-sm text-destructive">{error}</p>}

// ✅ GOOD: ARIA live regions
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Common ARIA Patterns

```typescript
// Loading state
<Button disabled aria-busy="true">
  <Spinner className="mr-2 h-4 w-4" />
  Loading...
</Button>

// Expanded/collapsed state
<Button
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
  onClick={toggle}
>
  Menu
</Button>
<div id="dropdown-menu" hidden={!isOpen}>
  {/* Menu items */}
</div>

// Selected state
<button
  role="tab"
  aria-selected={isActive}
  aria-controls="panel-1"
>
  Tab 1
</button>

// Invalid state
<Input
  aria-invalid={!!error}
  aria-errormessage={error ? "error-message" : undefined}
/>
{error && <p id="error-message" role="alert">{error}</p>}
```

## Form Accessibility

### Labels and Inputs

```typescript
// ✅ GOOD: Proper label association
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// ✅ GOOD: Using Field component (from shadcn/ui)
<Field
  label="Email"
  error={errors.email?.message}
  required
>
  <Input {...register("email")} />
</Field>

// ❌ BAD: No label
<Input placeholder="Email" /> {/* Placeholder is not a label */}
```

### Error Messages

```typescript
// ✅ GOOD: Accessible error messages
<div>
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    aria-invalid={!!errors.password}
    aria-describedby={errors.password ? "password-error" : undefined}
  />
  {errors.password && (
    <p id="password-error" role="alert" className="text-sm text-destructive">
      {errors.password.message}
    </p>
  )}
</div>
```

### Required Fields

```typescript
// ✅ GOOD: Indicate required fields
<Label htmlFor="name">
  Name <span aria-label="required">*</span>
</Label>
<Input id="name" required aria-required="true" />
```

## Color Contrast

### Minimum Contrast Ratios (WCAG AA)

- **Normal text**: 4.5:1
- **Large text** (18pt+): 3:1
- **UI components**: 3:1

```typescript
// ✅ GOOD: Using design tokens ensures contrast
<Button variant="default">Primary Action</Button>
<p className="text-foreground">Content text</p>
<p className="text-muted-foreground">Secondary text</p>

// ❌ BAD: Custom colors without contrast checking
<p className="text-gray-400">Low contrast text</p>
```

### Never Rely on Color Alone

```typescript
// ❌ BAD: Only color indicates status
<span className="text-green-500">Success</span>

// ✅ GOOD: Icon + color + text
<span className="flex items-center text-green-500">
  <CheckCircle className="mr-1 h-4 w-4" />
  <span>Success</span>
</span>
```

## Images and Media

### Alt Text

```typescript
// ✅ GOOD: Descriptive alt text
<img src="/user.jpg" alt="John Doe, Software Engineer" />

// ✅ GOOD: Decorative images
<img src="/decoration.svg" alt="" role="presentation" />

// ❌ BAD: Missing or poor alt text
<img src="/user.jpg" alt="image" />
<img src="/user.jpg" /> {/* Missing alt */}
```

### Icon Accessibility

```typescript
import { Settings } from "lucide-react";

// ✅ GOOD: Icon with label
<Button>
  <Settings className="mr-2 h-4 w-4" />
  Settings
</Button>

// ✅ GOOD: Icon-only with aria-label
<Button aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>

// ❌ BAD: Icon-only without label
<Button>
  <Settings className="h-4 w-4" />
</Button>
```

## Screen Reader Support

### Visually Hidden Content

```typescript
// ✅ GOOD: Screen reader only text
<span className="sr-only">Additional context for screen readers</span>

// ✅ GOOD: Skip navigation
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Announce Dynamic Content

```typescript
// ✅ GOOD: Live regions for status updates
<div role="status" aria-live="polite">
  {isLoading ? "Loading..." : "Content loaded"}
</div>

// ✅ GOOD: Alert for errors
<div role="alert" aria-live="assertive">
  {error && error.message}
</div>
```

## Interactive Components

### Buttons vs Links

```typescript
// ✅ GOOD: Button for actions
<Button onClick={handleSubmit}>Submit</Button>

// ✅ GOOD: Link for navigation
<Link href="/about">About</Link>

// ❌ BAD: Link styled as button for actions
<a href="#" onClick={handleClick}>Submit</a>

// ❌ BAD: Button for navigation
<Button onClick={() => router.push("/about")}>About</Button>
```

### Modals and Dialogs

```typescript
// ✅ GOOD: Dialog component (from shadcn/ui)
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Dialog Title</DialogTitle>
    <DialogDescription>Dialog description</DialogDescription>
    {/* Content */}
  </DialogContent>
</Dialog>

// Features:
// - Traps focus automatically
// - Closes on Escape
// - Returns focus on close
// - Proper ARIA attributes
```

### Tooltips

```typescript
// ✅ GOOD: Tooltip for supplementary info
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Additional information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// ❌ BAD: Essential info in tooltip only
// Tooltips should be supplementary, not primary information source
```

## Data Tables

### Accessible Tables

```typescript
// ✅ GOOD: Semantic table with headers
<table>
  <caption>User List</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
    </tr>
  </tbody>
</table>

// ✅ GOOD: TanStack Table with accessibility
const table = useReactTable({
  // Includes proper ARIA attributes automatically
});
```

See @src/components/data-table/ for accessible table implementations.

## Testing Accessibility

### Manual Testing

1. **Keyboard navigation**: Tab through all interactive elements
2. **Screen reader**: Test with VoiceOver (Mac) or NVDA (Windows)
3. **Zoom**: Test at 200% zoom level
4. **High contrast**: Enable high contrast mode

### Automated Testing

Consider adding accessibility testing to Playwright tests:

```typescript
import { test, expect } from "@playwright/test";

test("page should be keyboard accessible", async ({ page }) => {
  await page.goto("/");
  
  // Tab to first focusable element
  await page.keyboard.press("Tab");
  
  // Check focus is visible
  const focusedElement = await page.locator(":focus");
  await expect(focusedElement).toBeVisible();
});
```

## shadcn/ui Accessibility

All shadcn/ui components are built with Radix UI primitives, which include:
- Keyboard navigation
- Focus management
- ARIA attributes
- Screen reader support

When using shadcn components, accessibility is largely handled automatically.

## Accessibility Checklist

Before committing components:

- [ ] Semantic HTML elements used
- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators
- [ ] ARIA attributes where needed
- [ ] Forms have proper labels
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Not relying on color alone
- [ ] Screen reader tested
- [ ] Keyboard navigation tested

## Resources

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Radix UI Accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
