---
name: error-handling
description: "Error handling patterns, boundaries, and user feedback strategies"
---

# Error Handling Standards

## Error Handling Strategy

**Frontend errors:**
- User feedback (toast notifications)
- Error boundaries (component crashes)
- Form validation errors
- Network request failures

**Backend errors:**
- Server action errors
- API response errors
- Validation errors from server

## Error Boundaries

### Next.js Error Boundaries

Next.js provides automatic error boundaries via `error.tsx`:

```typescript
// app/dashboard/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription className="mt-2">
          {process.env.NODE_ENV === "development" 
            ? error.message 
            : "An unexpected error occurred. Please try again."}
        </AlertDescription>
        <Button onClick={reset} variant="outline" className="mt-4">
          Try again
        </Button>
      </Alert>
    </div>
  );
}
```

### Custom Error Boundary Component

```typescript
"use client";

import { Component, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || "An unexpected error occurred"}
          </AlertDescription>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
            className="mt-4"
          >
            Try again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

## Toast Notifications (sonner)

### Success Messages

```typescript
import { toast } from "sonner";

// Simple success
toast.success("Data saved successfully");

// With description
toast.success("User created", {
  description: "Welcome email has been sent",
});

// With action
toast.success("Item added to cart", {
  action: {
    label: "View cart",
    onClick: () => router.push("/cart"),
  },
});
```

### Error Messages

```typescript
// Simple error
toast.error("Failed to save data");

// With description
toast.error("Upload failed", {
  description: "File size exceeds 5MB limit",
});

// With retry action
toast.error("Connection failed", {
  action: {
    label: "Retry",
    onClick: () => retryConnection(),
  },
});
```

### Loading States

```typescript
// Show loading, update on completion
const promise = fetchData();

toast.promise(promise, {
  loading: "Loading...",
  success: (data) => `Successfully loaded ${data.length} items`,
  error: "Failed to load data",
});

// Manual control
const toastId = toast.loading("Uploading...");

try {
  await uploadFile();
  toast.success("Upload complete", { id: toastId });
} catch (error) {
  toast.error("Upload failed", { id: toastId });
}
```

## Network Request Error Handling

### With TanStack Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      toast.error("Failed to load users", {
        description: error.message,
      });
    },
  });
}

// In component
function UserList() {
  const { data, isLoading, isError, error } = useUsers();

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading users</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return <div>{/* Render users */}</div>;
}
```

### With Axios

```typescript
import axios from "axios";
import { toast } from "sonner";

// Configure axios instance with interceptors
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        toast.error("Unauthorized", {
          description: "Please log in again",
        });
        // Redirect to login
      } else if (status === 403) {
        toast.error("Forbidden", {
          description: "You don't have permission",
        });
      } else if (status === 404) {
        toast.error("Not found", {
          description: message,
        });
      } else if (status >= 500) {
        toast.error("Server error", {
          description: "Please try again later",
        });
      } else {
        toast.error("Request failed", {
          description: message,
        });
      }
    } else if (error.request) {
      // Request made but no response
      toast.error("Network error", {
        description: "Please check your connection",
      });
    } else {
      // Something else happened
      toast.error("Error", {
        description: error.message,
      });
    }

    return Promise.reject(error);
  }
);

export { api };
```

### Fetch with Error Handling

```typescript
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

// Usage
try {
  const data = await fetchData<User>("/api/user");
  toast.success("User loaded");
} catch (error) {
  toast.error("Failed to load user", {
    description: error instanceof Error ? error.message : "Unknown error",
  });
}
```

## Server Action Error Handling

### Server Action Pattern

```typescript
// server/server-actions.ts
"use server";

import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createUser(
  formData: FormData
): Promise<ActionResult<User>> {
  try {
    // Validate input
    const data = userSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
    });

    // Process
    const user = await db.user.create({ data });

    return { success: true, data: user };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    // Handle other errors
    console.error("Error creating user:", error);
    return {
      success: false,
      error: "Failed to create user",
    };
  }
}
```

### Client Usage

```typescript
"use client";

import { createUser } from "@/server/server-actions";
import { toast } from "sonner";

export function CreateUserForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createUser(formData);

      if (result.success) {
        toast.success("User created successfully");
        form.reset();
      } else {
        toast.error("Failed to create user", {
          description: result.error,
        });
      }
    });
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
```

## Form Validation Errors

### Field-Level Errors

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
    toast.success("Form submitted");
  } catch (error) {
    if (error instanceof APIError) {
      // Set field-specific errors from API
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        form.setError(field as any, { message: message as string });
      });
    } else {
      // Set root error for general failures
      form.setError("root", {
        message: "Failed to submit form",
      });
      toast.error("Failed to submit form");
    }
  }
};
```

### Display Validation Errors

```typescript
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} aria-invalid={!!form.formState.errors.email} />
      </FormControl>
      <FormMessage /> {/* Automatically shows error */}
    </FormItem>
  )}
/>

{/* Root error */}
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {form.formState.errors.root.message}
    </AlertDescription>
  </Alert>
)}
```

## Custom Error Types

### Define Error Classes

```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string[]>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}
```

### Type Guards

```typescript
function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

// Usage
try {
  await fetchData();
} catch (error) {
  if (isAPIError(error)) {
    toast.error(`API Error: ${error.status}`, {
      description: error.message,
    });
  } else if (isValidationError(error)) {
    Object.entries(error.fields).forEach(([field, messages]) => {
      toast.error(`Validation error in ${field}`, {
        description: messages.join(", "),
      });
    });
  } else {
    toast.error("An unexpected error occurred");
  }
}
```

## Graceful Degradation

### Empty States

```typescript
import { Empty } from "@/components/ui/empty";

function DataList({ data, isLoading, error }) {
  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Empty
        icon={<AlertCircle className="h-12 w-12" />}
        title="Failed to load data"
        description={error.message}
        action={
          <Button onClick={refetch}>Try again</Button>
        }
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty
        title="No data found"
        description="Start by adding your first item"
        action={
          <Button onClick={openCreateDialog}>Add item</Button>
        }
      />
    );
  }

  return <div>{/* Render data */}</div>;
}
```

### Skeleton Loading

```typescript
import { Skeleton } from "@/components/ui/skeleton";

function UserProfile({ userId }) {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## Logging and Monitoring

### Development Logging

```typescript
// Only in development
if (process.env.NODE_ENV === "development") {
  console.error("Error details:", error);
  console.log("Stack trace:", error.stack);
}
```

### Production Error Reporting

```typescript
// Log to error reporting service (e.g., Sentry, LogRocket)
function logError(error: Error, context?: Record<string, unknown>) {
  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // Sentry.captureException(error, { extra: context });
  } else {
    console.error("Error:", error, context);
  }
}

// Usage
try {
  await processData();
} catch (error) {
  logError(error as Error, {
    userId: user.id,
    action: "processData",
  });
  toast.error("Failed to process data");
}
```

## Error Handling Checklist

Before deploying:

- [ ] All async operations have try-catch blocks
- [ ] Network errors show user-friendly messages
- [ ] Error boundaries catch component crashes
- [ ] Loading states shown during async operations
- [ ] Empty states for no data scenarios
- [ ] Form validation errors displayed clearly
- [ ] Server errors handled gracefully
- [ ] Toast notifications for user feedback
- [ ] Errors logged appropriately
- [ ] Retry mechanisms where appropriate

## Best Practices

1. **Never swallow errors silently** - Always handle or log
2. **User-friendly messages** - Don't expose technical details to users
3. **Specific error types** - Use custom error classes
4. **Graceful degradation** - Show empty states, not broken UI
5. **Retry logic** - For transient failures
6. **Loading states** - Always show loading UI
7. **Toast notifications** - For user feedback
8. **Error boundaries** - Catch component crashes
9. **Log context** - Include relevant information with errors
10. **Test error cases** - Don't just test happy path

## References

See error handling in:
- @src/app/(main)/dashboard/error.tsx (error boundary)
- @src/app/(main)/auth/_components/login-form.tsx (form errors)
- Toast notifications with sonner (already configured)
