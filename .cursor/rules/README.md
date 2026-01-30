# Cursor Rules

This directory contains **Cursor rules** for the Next.js Admin Dashboard project. Rules are always applied and define critical constraints and workflows. Detailed, topic-specific guidance lives in **Skills** (`.cursor/skills/`), which the agent reads when relevant to the task.

## Rule Files (Always Applied)

These three rule files have `alwaysApply: true` and are in effect for every AI session.

### 00-project-core.mdc

**Project fundamentals, forbidden actions, and expected output quality.**

- Defines what Cursor must **NEVER** do (no new deps, no `any`, no placeholder code, etc.)
- Sets quality expectations: clean, typed, accessible, testable, maintainable, production-ready
- Mandatory workflow: read first, use existing deps, follow patterns, build after changes, check lints, test
- References project context: Next.js 16, React 19, TypeScript strict, Tailwind v4, shadcn/ui, Zustand, etc.

### 03-dependency-discipline.mdc

**CRITICAL – Dependency management.**

- **NEVER add new dependencies** without explicit user permission
- Use only what’s in `package.json` and native browser/Node APIs
- Lists installed dependencies by category (UI, forms, state, testing, etc.)
- Common scenarios and solutions (e.g. use `date-fns` instead of moment, `crypto.randomUUID()` instead of uuid)
- Pre-commit checklist: no new deps, build passes, lints pass

### 13-build-validation.mdc

**MANDATORY – Build and validation workflow.**

- **Always run `npm run build`** after code changes
- Pre-commit flow: `npm run check` → `npm run build` → `npm run test:e2e:ci` (if applicable)
- What the build catches (TypeScript, imports, config, circular deps)
- Biome checks (`npm run check` / `npm run check:fix`)
- Common build issues and fixes, CI/CD notes, production checklist

## Skills (On-Demand Guidance)

Detailed standards and patterns for specific domains live in **`.cursor/skills/`**. The agent uses a skill when the task involves that domain (e.g. you mention architecture, forms, or testing), or when you reference it (e.g. `@skills` or a specific skill).

| Skill | Path | When to use |
|-------|------|-------------|
| **Architecture** | `skills/architecture/SKILL.md` | Folder structure, routes, App Router, component organization |
| **TypeScript** | `skills/typescript/SKILL.md` | Strict mode, types, React types, Zod |
| **UI Components** | `skills/ui-components/SKILL.md` | shadcn/ui, composition, lucide-react |
| **Accessibility** | `skills/accessibility/SKILL.md` | WCAG 2.1 AA, semantics, keyboard, ARIA |
| **TailwindCSS** | `skills/tailwindcss/SKILL.md` | v4, design tokens, CVA, responsive, dark mode |
| **State Management** | `skills/state-management/SKILL.md` | Zustand, selectors, persistence |
| **Forms & Validation** | `skills/forms-validation/SKILL.md` | React Hook Form, Zod, shadcn Form |
| **Error Handling** | `skills/error-handling/SKILL.md` | Error boundaries, sonner, server actions |
| **Security (Frontend)** | `skills/security-frontend/SKILL.md` | XSS, validation, sensitive data |
| **Performance** | `skills/performance/SKILL.md` | Next.js and React optimizations, bundle size |
| **Testing** | `skills/testing/SKILL.md` | Playwright E2E, structure, fixtures, a11y tests |
| **Code Quality** | `skills/code-quality/SKILL.md` | Naming, DRY, refactoring, maintainability |

Rules enforce **what must always be true** (no new deps, build after changes, core “never do” list). Skills provide **how to do it** in each area (patterns, examples, file layout).

## Using Rules and Skills

### For AI (Cursor)

- **Rules**: Loaded automatically; all three apply every session.
- **Skills**: Loaded when the agent infers the task touches that topic, or when you reference them (e.g. `@skills/architecture`).

### For Developers

- Read **rules** to understand non‑negotiable constraints and workflow.
- Read **skills** to understand patterns and standards for a given area (architecture, forms, testing, etc.).

## Modifying Rules

When updating rules:

1. Keep each rule focused on one concern.
2. Use concrete examples (✅ Good / ❌ Bad).
3. Reference existing files with `@filename`.
4. Use `.mdc` frontmatter: `description`, `alwaysApply`, and optionally `globs`.
5. Update this README when adding or removing rules.

When adding or changing skills, ensure each skill has a clear `name` and `description` in its frontmatter so the agent can select it appropriately.

## Key Principles

### Critical rules

1. **No new dependencies** without user permission → `03-dependency-discipline.mdc`
2. **No `any`** in TypeScript → `00-project-core.mdc` (details in `skills/typescript`)
3. **Always build after changes** → `13-build-validation.mdc`
4. **Do not edit `@/components/ui/`** directly → `skills/ui-components`
5. **WCAG 2.1 AA** for accessibility → `skills/accessibility`

### Expected quality

Every generated code should be:

- Clean and readable  
- Fully typed (no `any`)  
- Accessible (WCAG 2.1 AA)  
- Testable  
- Maintainable  
- Production-ready  

## Project tech stack

- **Framework**: Next.js 16, App Router (React 19)
- **Language**: TypeScript (strict)
- **Styling**: TailwindCSS v4
- **UI**: shadcn/ui (Radix UI)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Data**: TanStack Query
- **Testing**: Playwright (E2E)
- **Lint/format**: Biome

See `package.json` for the full dependency list.

## Quick reference

```bash
# Lint and format
npm run check
npm run check:fix

# Build (run after changes)
npm run build

# E2E tests
npm run test:e2e
npm run test:e2e:ci

# Development
npm run dev
```

## Contributing

When adding or changing conventions:

1. Prefer **skills** for new topic-specific guidance; add **rules** only for universal constraints.
2. Keep rules short and actionable; put examples and long text in skills.
3. Reference real files in the repo.
4. Update this README when you add or remove rules or significant skills.

## Resources

- [Cursor Rules documentation](https://cursor.com/docs/context/rules)
- Project overview: `README.md` in the project root
- Contributing: `CONTRIBUTING.md`
