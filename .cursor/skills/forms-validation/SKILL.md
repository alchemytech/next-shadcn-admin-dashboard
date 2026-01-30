---
name: forms-validation
description: "React Hook Form + Zod patterns for type-safe forms and validation"
---

# Forms & Validation

## Form Libraries

**Form State**: React Hook Form v7
**Validation**: Zod v3
**Integration**: @hookform/resolvers

All are already installed per @package.json.

## Basic Form Pattern

### 1. Define Zod Schema

```typescript
import { z } from "zod";

// Define validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

// Infer TypeScript type from schema
type LoginFormData = z.infer<typeof loginSchema>;
```

### 2. Create Form with React Hook Form

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle form submission
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
```

## Using shadcn/ui Form Components

### Recommended: Use Form Components

shadcn/ui provides Form components built on React Hook Form:

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function ProfileForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Zod Validation Patterns

### Common Validations

```typescript
import { z } from "zod";

const schema = z.object({
  // Required string
  name: z.string().min(1, "Name is required"),

  // Email
  email: z.string().email("Invalid email address"),

  // Number with range
  age: z.number().int().min(18).max(120),

  // Optional field
  nickname: z.string().optional(),

  // Nullable field
  middleName: z.string().nullable(),

  // Default value
  role: z.string().default("user"),

  // Enum
  status: z.enum(["active", "inactive", "pending"]),

  // Boolean
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),

  // Array
  tags: z.array(z.string()).min(1, "At least one tag required"),

  // Nested object
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
  }),

  // Union
  contact: z.union([
    z.string().email(),
    z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  ]),

  // Custom validation
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),

  // Dependent fields
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### Async Validation

```typescript
const schema = z.object({
  username: z.string().refine(
    async (username) => {
      // Check if username is available
      const response = await fetch(`/api/check-username?username=${username}`);
      const { available } = await response.json();
      return available;
    },
    { message: "Username is already taken" }
  ),
});
```

### Transform Values

```typescript
const schema = z.object({
  // Transform string to number
  age: z.string().transform((val) => Number.parseInt(val, 10)),

  // Trim whitespace
  email: z.string().email().transform((val) => val.trim().toLowerCase()),

  // Parse date
  birthdate: z.string().transform((val) => new Date(val)),
});
```

## Advanced Form Patterns

### Controlled Components

```typescript
import { Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Controller
  control={form.control}
  name="country"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Country</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Dynamic Fields (Arrays)

```typescript
import { useFieldArray } from "react-hook-form";

const schema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
    })
  ),
});

type FormData = z.infer<typeof schema>;

export function ItemsForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      items: [{ name: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2">
            <FormField
              control={form.control}
              name={`items.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => append({ name: "", quantity: 1 })}
        >
          Add Item
        </Button>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### File Upload

```typescript
const schema = z.object({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= 5000000,
      "Max file size is 5MB"
    )
    .refine(
      (files) => ["image/jpeg", "image/png"].includes(files?.[0]?.type),
      "Only .jpg and .png formats are supported"
    ),
});

<FormField
  control={form.control}
  name="avatar"
  render={({ field: { value, onChange, ...field } }) => (
    <FormItem>
      <FormLabel>Avatar</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => onChange(e.target.files)}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Form State Management

### Watch Field Values

```typescript
const email = form.watch("email");

// Watch multiple fields
const { email, password } = form.watch(["email", "password"]);

// Watch all fields
const allValues = form.watch();
```

### Programmatic Field Updates

```typescript
// Set single field
form.setValue("email", "new@example.com");

// Set multiple fields
form.reset({
  email: "",
  password: "",
});

// Set with validation
form.setValue("email", "new@example.com", {
  shouldValidate: true,
  shouldDirty: true,
});
```

### Form State Flags

```typescript
const {
  formState: {
    errors,       // Validation errors
    isSubmitting, // Form is submitting
    isValid,      // Form is valid
    isDirty,      // Form has been modified
    isSubmitSuccessful, // Last submission was successful
    touchedFields, // Fields that have been touched
  },
} = form;
```

## Server Actions Integration

```typescript
"use client";

import { useActionState } from "react";
import { loginAction } from "@/server/server-actions";

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await loginAction(data);
    
    if (!result.success) {
      // Set server errors
      form.setError("root", {
        type: "server",
        message: result.error,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

## Error Handling

### Display Errors

```typescript
// Field-level error
{errors.email && (
  <p className="text-sm text-destructive">{errors.email.message}</p>
)}

// With FormMessage component
<FormMessage /> {/* Automatically shows field error */}

// Root-level error (form-wide)
{errors.root && (
  <Alert variant="destructive">
    <AlertDescription>{errors.root.message}</AlertDescription>
  </Alert>
)}
```

### Set Errors Programmatically

```typescript
// Single field error
form.setError("email", {
  type: "manual",
  message: "This email is already registered",
});

// Multiple errors
form.setError("root.serverError", {
  type: "server",
  message: "Something went wrong",
});
```

## Validation Modes

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur",     // Validate on blur
  // mode: "onChange",   // Validate on change
  // mode: "onSubmit",   // Validate on submit only (default)
  // mode: "onTouched",  // Validate after first blur
  // mode: "all",        // Validate on blur and change
});
```

## Loading States

```typescript
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? (
    <>
      <Spinner className="mr-2 h-4 w-4" />
      Submitting...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

## Toast Notifications

```typescript
import { toast } from "sonner";

const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
    toast.success("Form submitted successfully");
    form.reset();
  } catch (error) {
    toast.error("Failed to submit form");
  }
};
```

## Best Practices

1. **Always use Zod schemas** - Define schema, infer types
2. **Use Form components** - shadcn Form provides better DX
3. **Validate on blur** - Better UX than onChange
4. **Show loading states** - Disable submit and show spinner
5. **Handle server errors** - Use root-level errors
6. **Reset after success** - Clear form after successful submission
7. **Type everything** - Use `z.infer<typeof schema>`
8. **Accessibility** - Use proper labels, error messages, ARIA

## Real Examples

See form implementations:
- @src/app/(main)/auth/_components/login-form.tsx
- @src/app/(main)/auth/_components/register-form.tsx

## Schema Files

Co-locate schemas with components or in separate `schema.ts`:
- @src/app/(main)/dashboard/default/_components/schema.ts
- @src/app/(main)/dashboard/crm/_components/schema.ts
