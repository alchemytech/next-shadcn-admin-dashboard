---
name: security-frontend
description: "Frontend security best practices, XSS prevention, and safe data handling"
---

# Frontend Security Standards

## Critical Security Principles

1. **Never trust client-side data** - Always validate on server
2. **Sanitize user input** - Prevent XSS attacks
3. **Protect sensitive data** - Never expose secrets in client code
4. **Use HTTPS only** - All production traffic must be encrypted
5. **Validate on both sides** - Client validation is UX, not security

## XSS (Cross-Site Scripting) Prevention

### React's Built-in Protection

React automatically escapes content:

```typescript
// ✅ SAFE: React escapes by default
<div>{userInput}</div>
<p>{user.name}</p>

// ❌ DANGEROUS: dangerouslySetInnerHTML bypasses protection
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### When You Must Use HTML

Only if absolutely necessary:

```typescript
import DOMPurify from "dompurify"; // Would need to install - AVOID

// ❌ AVOID: Installing sanitization libraries
// Instead, redesign to not need raw HTML

// If truly unavoidable, sanitize server-side
<div dangerouslySetInnerHTML={{ __html: sanitizedFromServer }} />
```

### Safe Alternatives to HTML

```typescript
// ❌ BAD: Raw HTML
<div dangerouslySetInnerHTML={{ __html: content }} />

// ✅ GOOD: Markdown (use existing libraries if needed)
// Or better: structured data
<div>
  {content.paragraphs.map((p, i) => (
    <p key={i}>{p}</p>
  ))}
</div>
```

## Input Validation & Sanitization

### Client-Side Validation (UX Only)

```typescript
import { z } from "zod";

// ✅ GOOD: Zod schemas for client validation
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  website: z.string().url().optional(),
});

// Client validation is for UX, not security
// Always validate on server too
```

### Prevent SQL Injection (Server-Side)

Even though this is a frontend project, be aware:

```typescript
// ❌ NEVER: String concatenation for queries
// This happens on server, but be aware
const query = `SELECT * FROM users WHERE id = ${userId}`; // Vulnerable!

// ✅ ALWAYS: Use parameterized queries (server-side)
// This is handled by your backend/ORM
```

### URL Validation

```typescript
import { z } from "zod";

// ✅ GOOD: Validate URLs
const urlSchema = z.string().url();

// Check for safe protocols
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Usage
<a href={isSafeUrl(link) ? link : "#"} rel="noopener noreferrer">
  Link
</a>
```

## Sensitive Data Protection

### Environment Variables

```typescript
// ✅ GOOD: Public env vars (prefixed with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ BAD: Exposing secrets
const apiKey = process.env.API_SECRET_KEY; // NOT prefixed - won't work in client

// Note: Only NEXT_PUBLIC_* vars are exposed to browser
// Never put secrets in NEXT_PUBLIC_* variables
```

### Local Storage Security

```typescript
// ❌ BAD: Storing sensitive data
localStorage.setItem("creditCard", cardNumber);
localStorage.setItem("password", password);
localStorage.setItem("apiKey", key);

// ✅ GOOD: Only store non-sensitive preferences
localStorage.setItem("theme", "dark");
localStorage.setItem("sidebarCollapsed", "true");

// For authentication tokens, use httpOnly cookies (server-side)
```

### Cookie Security

```typescript
// Cookies should be set server-side with proper flags:
// - httpOnly: true (prevent JavaScript access)
// - secure: true (HTTPS only)
// - sameSite: "strict" or "lax" (CSRF protection)

// ✅ GOOD: Reading cookies (safe)
import { getCookie } from "@/lib/cookie.client";

const theme = getCookie("theme"); // Non-sensitive data only

// ❌ BAD: Storing tokens in accessible cookies
// Auth tokens should be httpOnly and set by server
```

## Authentication & Authorization

### Token Handling

```typescript
// ❌ BAD: Storing tokens in localStorage
localStorage.setItem("authToken", token);

// ✅ GOOD: Tokens in httpOnly cookies (server-managed)
// Client code should not directly handle auth tokens

// ✅ GOOD: Check authentication status
const { data: user } = useQuery({
  queryKey: ["currentUser"],
  queryFn: fetchCurrentUser, // Server validates token
});
```

### Protected Routes

```typescript
// middleware.ts or layout.tsx
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser(); // Server-side check

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
```

### Role-Based Access

```typescript
// ✅ GOOD: Check permissions server-side
async function deleteUser(userId: string) {
  "use server";

  const currentUser = await getCurrentUser();
  
  if (currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.user.delete({ where: { id: userId } });
}

// Client-side checks are for UX only
function DeleteButton({ userId }: { userId: string }) {
  const { data: user } = useCurrentUser();

  // Hide button for non-admins (UX)
  if (user?.role !== "admin") {
    return null;
  }

  return (
    <Button onClick={() => deleteUser(userId)}>
      Delete
    </Button>
  );
}
```

## CSRF (Cross-Site Request Forgery) Protection

### SameSite Cookies

```typescript
// Server-side cookie settings:
// - sameSite: "strict" or "lax"
// - CSRF tokens for state-changing operations

// Next.js handles much of this automatically
```

### External Links

```typescript
// ✅ GOOD: Prevent tabnapping
<a
  href={externalUrl}
  target="_blank"
  rel="noopener noreferrer" // Prevents window.opener access
>
  External Link
</a>

// ✅ GOOD: Use Next.js Link for internal navigation
import Link from "next/link";

<Link href="/dashboard">Dashboard</Link>
```

## Content Security Policy (CSP)

### Next.js Configuration

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

## File Upload Security

### Validate File Types

```typescript
import { z } from "zod";

const fileSchema = z
  .custom<FileList>()
  .refine((files) => files?.length === 1, "File is required")
  .refine(
    (files) => {
      const file = files?.[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      return allowedTypes.includes(file?.type);
    },
    "Only JPEG, PNG, and WebP images are allowed"
  )
  .refine(
    (files) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      return files?.[0]?.size <= maxSize;
    },
    "File size must be less than 5MB"
  );

// ✅ GOOD: Validate file type and size
function FileUpload() {
  const form = useForm({
    resolver: zodResolver(z.object({ file: fileSchema })),
  });

  return (
    <form>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        {...form.register("file")}
      />
    </form>
  );
}
```

### Server-Side File Validation

Always validate file type on server:

```typescript
// Server action
"use server";

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;

  // Validate MIME type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  // Validate file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File too large");
  }

  // Validate file header (magic bytes) - more reliable than MIME type
  const buffer = await file.arrayBuffer();
  // Check magic bytes here...

  // Process file
}
```

## Rate Limiting (Client-Side)

### Debounce User Actions

```typescript
import { useMemo } from "react";

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function SearchInput() {
  const handleSearch = useMemo(
    () =>
      debounce((query: string) => {
        // API call
        fetchResults(query);
      }, 300),
    []
  );

  return <Input onChange={(e) => handleSearch(e.target.value)} />;
}
```

### Throttle Requests

```typescript
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage
const handleScroll = useMemo(
  () =>
    throttle(() => {
      // Expensive operation
      checkScrollPosition();
    }, 100),
  []
);
```

## Third-Party Scripts

### Use Next.js Script Component

```typescript
import Script from "next/script";

// ✅ GOOD: Load external scripts safely
<Script
  src="https://trusted-cdn.com/script.js"
  strategy="lazyOnload"
  onLoad={() => console.log("Script loaded")}
/>

// Strategy options:
// - "beforeInteractive": Critical scripts
// - "afterInteractive": Analytics (default)
// - "lazyOnload": Non-critical scripts
```

### Verify Script Integrity

```typescript
// ✅ GOOD: Use SRI (Subresource Integrity)
<Script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-hash-here"
  crossOrigin="anonymous"
/>
```

## API Security

### Secure Headers

```typescript
// API routes should set secure headers
export async function GET(request: Request) {
  const response = new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });

  return response;
}
```

### Input Validation

```typescript
// ✅ GOOD: Validate all inputs
export async function POST(request: Request) {
  const body = await request.json();

  // Validate with Zod
  const schema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
  });

  try {
    const validatedData = schema.parse(body);
    // Process data
  } catch (error) {
    return new Response("Invalid input", { status: 400 });
  }
}
```

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

### Monitor Dependencies

```typescript
// .github/dependabot.yml (if using GitHub)
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

## Security Checklist

Before deploying:

- [ ] No secrets in client-side code
- [ ] Environment variables properly scoped (NEXT_PUBLIC_* only for public)
- [ ] All user input validated (client and server)
- [ ] XSS prevention (avoid dangerouslySetInnerHTML)
- [ ] External links have rel="noopener noreferrer"
- [ ] File uploads validated (type, size, content)
- [ ] Authentication handled server-side
- [ ] Authorization checks on all protected actions
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Dependencies updated and audited
- [ ] Rate limiting on API endpoints (server-side)

## Best Practices

1. **Defense in depth** - Multiple layers of security
2. **Principle of least privilege** - Minimal permissions
3. **Validate everything** - Never trust user input
4. **Fail securely** - Default to deny
5. **Keep dependencies updated** - Patch vulnerabilities
6. **Use established libraries** - Don't roll your own crypto
7. **Server-side validation** - Client validation is UX only
8. **Secure by default** - Safe configurations
9. **Log security events** - Monitor for attacks
10. **Regular security audits** - Test your defenses

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/app/building-your-application/security
- MDN Web Security: https://developer.mozilla.org/en-US/docs/Web/Security
