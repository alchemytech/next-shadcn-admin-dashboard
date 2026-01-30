---
name: state-management
description: "Zustand state management patterns and best practices"
---

# State Management with Zustand

## State Management Strategy

**Local state**: `useState`, `useReducer`
**Shared state**: Zustand stores
**Server state**: TanStack Query
**Form state**: React Hook Form

## Zustand Basics

Already installed: `zustand` v5

### When to Use Zustand

Use Zustand for:
- Global UI state (theme, sidebar state, preferences)
- Shared application state
- State needed across multiple routes
- State that persists across navigation

**Don't use Zustand for:**
- Component-local state → Use `useState`
- Server data → Use TanStack Query
- Form data → Use React Hook Form

## Store Structure

### Creating a Store

```typescript
import { create } from "zustand";

// 1. Define state type
type StoreState = {
  count: number;
  user: User | null;
};

// 2. Define actions type
type StoreActions = {
  increment: () => void;
  decrement: () => void;
  setUser: (user: User | null) => void;
  reset: () => void;
};

// 3. Combine into store type
type Store = StoreState & StoreActions;

// 4. Create store
export const useStore = create<Store>((set) => ({
  // Initial state
  count: 0,
  user: null,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setUser: (user) => set({ user }),
  reset: () => set({ count: 0, user: null }),
}));
```

### File Organization

```typescript
// stores/counter/counter-store.ts
import { create } from "zustand";

type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

## Store Patterns

### Pattern 1: Separate State and Actions

```typescript
type State = {
  bears: number;
};

type Actions = {
  increase: (by: number) => void;
  reset: () => void;
};

const useStore = create<State & Actions>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  reset: () => set({ bears: 0 }),
}));
```

### Pattern 2: Slices (Multiple Stores Combined)

```typescript
type BearSlice = {
  bears: number;
  addBear: () => void;
};

type FishSlice = {
  fishes: number;
  addFish: () => void;
};

const createBearSlice = (set): BearSlice => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
});

const createFishSlice = (set): FishSlice => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
});

export const useBoundStore = create<BearSlice & FishSlice>((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}));
```

### Pattern 3: Async Actions

```typescript
type Store = {
  data: Data | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
};

export const useStore = create<Store>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

**Note:** For most data fetching, prefer TanStack Query over Zustand async actions.

## Persistence

### Local Storage Persistence

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Store = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export const useThemeStore = create<Store>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

See @src/stores/preferences/preferences-store.ts for a real example.

### Cookie Persistence

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCookie, setCookie } from "@/lib/cookie.client";

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // ... store definition
    }),
    {
      name: "store-cookie",
      storage: {
        getItem: (name) => {
          const cookie = getCookie(name);
          return cookie ? JSON.parse(cookie) : null;
        },
        setItem: (name, value) => {
          setCookie(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          setCookie(name, "", { maxAge: 0 });
        },
      },
    }
  )
);
```

## Using Stores in Components

### Selecting State

```typescript
// ❌ BAD: Subscribe to entire store
function Component() {
  const store = useStore(); // Re-renders on ANY state change
  return <div>{store.count}</div>;
}

// ✅ GOOD: Select only needed state
function Component() {
  const count = useStore((state) => state.count); // Re-renders only when count changes
  return <div>{count}</div>;
}

// ✅ GOOD: Select multiple values
function Component() {
  const { count, increment } = useStore((state) => ({
    count: state.count,
    increment: state.increment,
  }));
  return <button onClick={increment}>{count}</button>;
}
```

### Actions Only (No Re-renders)

```typescript
// ✅ GOOD: Subscribe to actions only (no re-renders)
function Component() {
  const increment = useStore((state) => state.increment);
  // Component won't re-render when other state changes
  return <button onClick={increment}>+1</button>;
}
```

### Computed Values

```typescript
// ✅ GOOD: Derive computed values in selector
function Component() {
  const total = useStore((state) => 
    state.items.reduce((sum, item) => sum + item.price, 0)
  );
  return <div>Total: ${total}</div>;
}
```

## Provider Pattern (Advanced)

For isolated store instances (e.g., in tests or nested contexts):

```typescript
// stores/counter/counter-provider.tsx
import { type ReactNode, createContext, useContext, useRef } from "react";
import { create, type StoreApi } from "zustand";

type CounterStore = {
  count: number;
  increment: () => void;
};

const CounterStoreContext = createContext<StoreApi<CounterStore> | null>(null);

export function CounterStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreApi<CounterStore>>();
  
  if (!storeRef.current) {
    storeRef.current = create<CounterStore>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  );
}

export function useCounterStore<T>(selector: (state: CounterStore) => T): T {
  const store = useContext(CounterStoreContext);
  if (!store) throw new Error("Missing CounterStoreProvider");
  return store(selector);
}
```

See @src/stores/preferences/preferences-provider.tsx for implementation.

## DevTools Integration

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useStore = create<Store>()(
  devtools(
    (set) => ({
      // ... store definition
    }),
    { name: "MyStore" }
  )
);
```

## Immer for Immutability (Optional)

For complex nested state updates:

```typescript
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Store = {
  nested: {
    deep: {
      value: number;
    };
  };
  updateDeep: (value: number) => void;
};

export const useStore = create<Store>()(
  immer((set) => ({
    nested: { deep: { value: 0 } },
    updateDeep: (value) =>
      set((state) => {
        state.nested.deep.value = value; // Mutate directly with immer
      }),
  }))
);
```

**Note:** Only use immer if needed. Simple state updates don't require it.

## Best Practices

### 1. Keep Stores Focused

```typescript
// ✅ GOOD: Single responsibility
useThemeStore    // Theme preferences
useAuthStore     // Authentication state
useSidebarStore  // Sidebar state

// ❌ BAD: Giant store
useAppStore // Everything
```

### 2. Co-locate Related State

```typescript
// ✅ GOOD: Related state together
type CartStore = {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};
```

### 3. Type Everything

```typescript
// ✅ GOOD: Fully typed
type Store = {
  count: number;
  increment: () => void;
};

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// ❌ BAD: No types
export const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 4. Actions Should Be Pure

```typescript
// ✅ GOOD: Pure action
increment: () => set((state) => ({ count: state.count + 1 }))

// ❌ BAD: Side effects in action (use separate function)
increment: () => {
  analytics.track("increment");
  set((state) => ({ count: state.count + 1 }));
}

// ✅ BETTER: Separate concerns
const trackIncrement = () => analytics.track("increment");

increment: () => {
  trackIncrement();
  set((state) => ({ count: state.count + 1 }));
}
```

### 5. Reset Store State

```typescript
type Store = {
  count: number;
  user: User | null;
  reset: () => void;
};

const initialState = {
  count: 0,
  user: null,
};

export const useStore = create<Store>((set) => ({
  ...initialState,
  reset: () => set(initialState),
}));
```

## Testing Stores

```typescript
import { renderHook, act } from "@testing-library/react";
import { useStore } from "./store";

test("should increment count", () => {
  const { result } = renderHook(() => useStore());

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

## Real Examples

See these files for production patterns:
- @src/stores/preferences/preferences-store.ts (persistence, provider)
- @src/stores/preferences/preferences-provider.tsx (provider pattern)

## Zustand vs Other Solutions

**Use Zustand for:**
- Global UI state
- User preferences
- Cross-route state

**Use useState for:**
- Component-local state
- Temporary UI state
- Form inputs (or React Hook Form)

**Use TanStack Query for:**
- Server data
- API state
- Caching and revalidation

**Use React Hook Form for:**
- Form state
- Form validation
- Complex forms

Keep state management **simple and appropriate** to the use case.
