# Next.js Admin Template with TypeScript & Shadcn UI

**Alchemy Tech** - Includes multiple dashboards, authentication layouts, customizable theme presets, and more.

<img src="https://github.com/arhamkhnz/next-shadcn-admin-dashboard/blob/main/media/dashboard.png?version=5" alt="Dashboard Screenshot">

Most admin templates I found, free or paid, felt cluttered, outdated, or too rigid. I built this as a cleaner alternative with features often missing in others, such as theme toggling and layout controls, while keeping the design modern, minimal, and flexible.

I've taken design inspiration from various sources. If you'd like credit for something specific, feel free to open an issue or reach out.

> **View demo:** [studio admin](https://next-shadcn-admin-dashboard.vercel.app)

> [!TIP]
> I'm also working on Nuxt.js, Svelte, and React (Vite + TanStack Router) versions of this dashboard. They'll be live soon.

## Features

- Built with Next.js 16, TypeScript, Tailwind CSS v4, and Shadcn UI
- Responsive and mobile-friendly
- Customizable theme presets (light/dark modes with color schemes like Tangerine, Brutalist, and more)
- Flexible layouts (collapsible sidebar, variable content widths)
- Authentication flows and screens
- Prebuilt dashboards (Default, CRM, Finance) with more coming soon
- Role-Based Access Control (RBAC) with config-driven UI and multi-tenant support *(planned)*

> [!NOTE]
> The default dashboard uses the **shadcn neutral** theme.
> It also includes additional color presets inspired by [Tweakcn](https://tweakcn.com):
>
> - Tangerine
> - Neo Brutalism
> - Soft Pop
>
> You can create more presets by following the same structure as the existing ones.

> Looking for the **Next.js 15** version?
> Check out the [`archive/next15`](https://github.com/arhamkhnz/next-shadcn-admin-dashboard/tree/archive/next15) branch.
> This branch contains the setup prior to upgrading to Next 16 and the React Compiler.

> Looking for the **Next.js 14 + Tailwind CSS v3** version?
> Check out the [`archive/next14-tailwindv3`](https://github.com/arhamkhnz/next-shadcn-admin-dashboard/tree/archive/next14-tailwindv3) branch.
> It has a different color theme and is not actively maintained, but I try to keep it updated with major changes.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI**: Shadcn UI (Radix UI primitives), lucide-react
- **State**: Zustand
- **Forms & Validation**: React Hook Form, Zod, @hookform/resolvers
- **Data**: TanStack Query, TanStack Table, axios
- **Testing**: Playwright (E2E)
- **Tooling**: Biome (lint/format), Husky + lint-staged

See `package.json` for the full dependency list. The project follows **dependency discipline**: no new dependencies are added without explicit approval; existing packages and native APIs are used instead.

## Screens

### Available
- Default Dashboard
- CRM Dashboard
- Finance Dashboard
- Authentication (4 screens)

### Coming Soon
- Analytics Dashboard
- eCommerce Dashboard
- Academy Dashboard
- Logistics Dashboard
- Email Page
- Chat Page
- Calendar Page
- Kanban Board
- Invoice Page
- Users Management
- Roles Management

## Colocation File System Architecture

This project follows a **colocation-based architecture**: each feature keeps its own pages, components, and logic inside its route folder. Shared UI, hooks, and configuration live at the top level, making the codebase modular, scalable, and easier to maintain as the app grows.

- **Route groups**: `(main)` for authenticated routes, `(external)` for public routes
- **Feature components**: Live in `_components` next to the route (e.g. `dashboard/crm/_components/`)
- **Shared UI**: `@/components/ui/` — shadcn/ui components; **do not edit these directly**; extend via wrappers or composition

For a full breakdown of the structure with examples, see the [Next Colocation Template](https://github.com/arhamkhnz/next-colocation-template).

## Project Standards

Code in this repo is expected to be:

- **Typed**: TypeScript strict mode; no `any`
- **Accessible**: WCAG 2.1 AA (semantic HTML, keyboard nav, ARIA, focus management)
- **Maintainable**: Clear naming, single responsibility, no unnecessary dependencies
- **Validated**: Build must pass before committing

**Critical conventions:**

- Do **not** add new dependencies without explicit approval; use existing packages or native APIs
- Do **not** edit files under `@/components/ui/` directly; extend or compose instead
- Always run **`npm run build`** after making changes

Detailed standards live in **`.cursor/rules/`** (Cursor rules) and **`.cursor/skills/`** (architecture, TypeScript, UI, accessibility, Tailwind, state, forms, error handling, security, performance, testing, code quality). See [.cursor/rules/README.md](.cursor/rules/README.md) for an overview.

## Getting Started

You can run this project locally, or deploy it instantly with Vercel.

### Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farhamkhnz%2Fnext-shadcn-admin-dashboard)

_Deploy your own copy with one click._

### Run locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/arhamkhnz/next-shadcn-admin-dashboard.git
   ```

2. **Navigate into the project**
   ```bash
   cd next-shadcn-admin-dashboard
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

Your app will be at [http://localhost:3000](http://localhost:3000).

### Code quality and build

- **Lint and format** (Biome):
  ```bash
  npm run check          # Check only
  npm run check:fix      # Auto-fix and format
  ```
- **Build** (required before committing):
  ```bash
  npm run build
  ```
- **E2E tests** (Playwright):
  ```bash
  npm run test:e2e       # Local (browser UI)
  npm run test:e2e:ci   # CI (e.g. chromium only)
  ```

Pre-commit runs lint-staged (Biome check --write). Ensure `npm run build` and, when relevant, `npm run test:e2e:ci` pass before pushing.

For more on Biome rules and options, see the [Biome documentation](https://biomejs.dev/).

---

> [!IMPORTANT]
> This project is updated frequently. If you're working from a fork or an older clone, pull the latest changes before syncing. Some updates may include breaking changes.

---

Contributions are welcome. Feel free to open issues, feature requests, or start a discussion.

**Happy Vibe Coding!**
