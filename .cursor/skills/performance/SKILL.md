---
name: performance
description: "Performance optimization guidelines and best practices for React and Next.js"
---

# Performance Guidelines

## Core Performance Principles

1. **Ship less JavaScript** - Every byte counts
2. **Lazy load when possible** - Don't load what you don't need
3. **Optimize images** - Use Next.js Image component
4. **Minimize re-renders** - Use React optimization hooks
5. **Code split** - Break up large bundles

## Next.js Optimizations

### Image Optimization

```typescript
import Image from "next/image";

// ✅ GOOD: Use Next.js Image component
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For LCP image
/>

// ✅ GOOD: Lazy load images below fold
<Image
  src="/feature.jpg"
  alt="Feature"
  width={800}
  height={400}
  loading="lazy"
/>

// ❌ BAD: Regular img tag
<img src="/hero.jpg" alt="Hero" />
```

### Font Optimization

Already configured in @src/lib/fonts/registry.ts:

```typescript
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Fonts are optimized and self-hosted by Next.js
```

### Dynamic Imports

```typescript
import dynamic from "next/dynamic";

// ✅ GOOD: Lazy load heavy components
const HeavyChart = dynamic(() => import("@/components/heavy-chart"), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false, // Disable SSR if not needed
});

// ✅ GOOD: Lazy load modal content
const UserModal = dynamic(() => import("@/components/user-modal"));

function Dashboard() {
  return (
    <div>
      <HeavyChart data={data} />
    </div>
  );
}
```

### Route Prefetching

```typescript
import Link from "next/link";

// ✅ GOOD: Automatic prefetching
<Link href="/dashboard" prefetch>
  Dashboard
</Link>

// ✅ GOOD: Disable for low-priority routes
<Link href="/settings" prefetch={false}>
  Settings
</Link>
```

## React Optimization

### Memoization with React.memo

```typescript
import { memo } from "react";

// ✅ GOOD: Memoize expensive components
type Props = {
  items: Item[];
  onItemClick: (id: string) => void;
};

const ItemList = memo(function ItemList({ items, onItemClick }: Props) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

// Custom comparison function
const ItemList = memo(
  function ItemList({ items }: Props) {
    // Component
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.items.length === nextProps.items.length;
  }
);
```

### useMemo Hook

```typescript
import { useMemo } from "react";

function DataTable({ data, filter }: Props) {
  // ✅ GOOD: Memoize expensive calculations
  const filteredData = useMemo(() => {
    return data.filter((item) => item.category === filter);
  }, [data, filter]); // Only recalculate when dependencies change

  // ✅ GOOD: Memoize complex objects
  const tableConfig = useMemo(
    () => ({
      columns: generateColumns(),
      sorting: defaultSorting,
    }),
    []
  );

  return <Table data={filteredData} config={tableConfig} />;
}
```

### useCallback Hook

```typescript
import { useCallback } from "react";

function Parent() {
  // ❌ BAD: Function recreated on every render
  const handleClick = (id: string) => {
    console.log(id);
  };

  // ✅ GOOD: Stable function reference
  const handleClick = useCallback((id: string) => {
    console.log(id);
  }, []); // No dependencies - function never changes

  // ✅ GOOD: With dependencies
  const handleUpdate = useCallback(
    (id: string) => {
      updateItem(id, { status: currentStatus });
    },
    [currentStatus] // Recreate when status changes
  );

  return <ChildComponent onClick={handleClick} onUpdate={handleUpdate} />;
}
```

### Avoid Unnecessary Re-renders

```typescript
// ❌ BAD: Creates new object on every render
<Component config={{ theme: "dark", size: "lg" }} />

// ✅ GOOD: Stable reference
const config = { theme: "dark", size: "lg" };
<Component config={config} />

// ❌ BAD: Creates new array on every render
<List items={data.map((item) => item.id)} />

// ✅ GOOD: Memoize array
const ids = useMemo(() => data.map((item) => item.id), [data]);
<List items={ids} />
```

## Bundle Size Optimization

### Analyze Bundle

```bash
# Build and analyze
npm run build

# Check bundle sizes in output
# Route sizes are shown after build
```

### Import Only What You Need

```typescript
// ❌ BAD: Imports entire library
import _ from "lodash";

// ✅ GOOD: No lodash needed (use native JS or implement)
// See @03-dependency-discipline.mdc

// ❌ BAD: Imports all icons
import * as Icons from "lucide-react";

// ✅ GOOD: Import specific icons
import { Settings, User, Home } from "lucide-react";
```

### Tree Shaking

```typescript
// ✅ GOOD: ES modules enable tree shaking
import { Button } from "@/components/ui/button";

// ❌ BAD: CommonJS can't be tree-shaken
const Button = require("@/components/ui/button");
```

## Data Fetching Performance

### TanStack Query Optimizations

```typescript
import { useQuery } from "@tanstack/react-query";

// ✅ GOOD: Configure staleTime and cacheTime
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// ✅ GOOD: Prefetch data
export function prefetchUsers() {
  queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

// ✅ GOOD: Optimistic updates
export function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      // Optimistically update cache
      await queryClient.cancelQueries({ queryKey: ["users", newUser.id] });
      const previousUser = queryClient.getQueryData(["users", newUser.id]);
      queryClient.setQueryData(["users", newUser.id], newUser);
      return { previousUser };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(["users", newUser.id], context?.previousUser);
    },
  });
}
```

### Pagination

```typescript
// ✅ GOOD: Paginate large datasets
function useUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => fetchUsers({ page, pageSize }),
    keepPreviousData: true, // Keep old data while fetching new
  });
}

// ✅ GOOD: Infinite scroll
import { useInfiniteQuery } from "@tanstack/react-query";

function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ["users"],
    queryFn: ({ pageParam = 0 }) => fetchUsers({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });
}
```

## Rendering Performance

### Virtualization for Long Lists

```typescript
// For very long lists (1000+ items), consider virtualization
// But first try: pagination, infinite scroll, or filtering

// If list is truly needed:
// Use react-window or @tanstack/react-virtual (if you add them)
// But avoid adding dependencies if possible
```

### Suspense Boundaries

```typescript
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ GOOD: Suspense for async components
export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-[400px]" />}>
      <AsyncComponent />
    </Suspense>
  );
}

// ✅ GOOD: Multiple suspense boundaries
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <Charts />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </div>
  );
}
```

### Key Prop Optimization

```typescript
// ✅ GOOD: Stable keys
{items.map((item) => (
  <Item key={item.id} {...item} />
))}

// ❌ BAD: Index as key (if list can change)
{items.map((item, index) => (
  <Item key={index} {...item} />
))}

// ✅ OK: Index as key (if list is static)
{staticItems.map((item, index) => (
  <Item key={index} {...item} />
))}
```

## CSS Performance

### TailwindCSS Optimization

Already optimized by TailwindCSS v4:

- Purges unused styles in production
- Minimal CSS bundle size
- JIT compilation

### Avoid Inline Styles

```typescript
// ❌ BAD: Inline styles create new objects
<div style={{ padding: "16px", margin: "8px" }}>

// ✅ GOOD: Use Tailwind classes
<div className="p-4 m-2">
```

### CSS-in-JS Performance

Avoid CSS-in-JS libraries when possible:

```typescript
// ❌ AVOID: CSS-in-JS adds runtime overhead
import styled from "styled-components";
const Button = styled.button`padding: 16px;`;

// ✅ GOOD: Tailwind + CVA (zero runtime)
import { cva } from "class-variance-authority";
const button = cva("p-4");
```

## Animation Performance

### Use CSS Transforms

```typescript
// ✅ GOOD: GPU-accelerated properties
<div className="transition-transform duration-300 hover:translate-x-2">

// ❌ BAD: Layout-triggering properties
<div className="transition-all duration-300 hover:left-2">
```

### Debounce Expensive Operations

```typescript
import { useCallback, useRef } from "react";

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// Usage
const handleSearch = useDebounce((query: string) => {
  fetchResults(query);
}, 300);
```

## State Management Performance

### Zustand Optimizations

```typescript
// ✅ GOOD: Select only needed state
const count = useStore((state) => state.count);

// ❌ BAD: Subscribe to entire store
const store = useStore();

// ✅ GOOD: Shallow equality for objects
import { shallow } from "zustand/shallow";

const { name, age } = useStore(
  (state) => ({ name: state.name, age: state.age }),
  shallow
);
```

## Monitoring Performance

### React DevTools Profiler

```bash
# Use React DevTools Profiler to identify:
# - Components that re-render frequently
# - Slow renders
# - Unnecessary renders
```

### Web Vitals

```typescript
// Next.js automatically tracks Core Web Vitals
// View in browser console or analytics
```

### Lighthouse

```bash
# Run Lighthouse audit
npm run build
npm start
# Then run Lighthouse in Chrome DevTools
```

## Performance Checklist

Before deploying:

- [ ] Images optimized with Next.js Image
- [ ] Heavy components lazy-loaded
- [ ] Expensive computations memoized
- [ ] Callback functions stable (useCallback)
- [ ] Long lists paginated or virtualized
- [ ] Bundle size analyzed
- [ ] Unnecessary dependencies removed
- [ ] Fonts optimized
- [ ] TanStack Query configured properly
- [ ] No unnecessary re-renders
- [ ] Lighthouse score > 90

## Best Practices

1. **Measure first** - Profile before optimizing
2. **Start simple** - Don't over-optimize early
3. **Progressive enhancement** - Basic functionality first
4. **Lazy load** - Load code when needed
5. **Memoize selectively** - Only expensive operations
6. **Optimize images** - Biggest wins for LCP
7. **Minimize JavaScript** - Less code, faster loads
8. **Use production builds** - Dev builds are slower
9. **Monitor continuously** - Track performance over time
10. **Test on slow devices** - Don't just test on latest hardware

## Performance Budget

Target metrics:
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TBT** (Total Blocking Time): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Bundle size**: < 200KB initial JS

## References

- Web Vitals: https://web.dev/vitals/
- Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing
- React Optimization: https://react.dev/learn/render-and-commit
