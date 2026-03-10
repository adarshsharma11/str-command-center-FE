# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Property management CRM (MOMA.HOUSE) for short-term rental management. React frontend with mock data throughout — backend integration pending. Branded as "STR Command & Control Platform."

## Build & Dev Commands

```bash
npm run dev        # Vite dev server on port 8080
npm run build      # Production build
npm run build:dev  # Development mode build
npm run lint       # ESLint (ESLint 9 flat config)
npm run preview    # Preview production build
```

No test suite is configured — no Jest/Vitest setup exists.

## Tech Stack

- **React 18** + TypeScript + Vite 5.4 (SWC compiler via `@vitejs/plugin-react-swc`)
- **Shadcn/UI** (Radix UI primitives + Tailwind CSS 3.4 + CVA)
- **TanStack Query 5** for server state
- **React Router DOM 6** for routing
- **React Hook Form + Zod** for form validation
- **Recharts** for charts, **@react-pdf/renderer** for PDF generation
- **Supabase JS** client configured but not actively connected

## Architecture

### Path Alias
`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

### App Shell
`App.tsx` sets up providers in this order: `QueryClientProvider` → `TooltipProvider` → Toasters → `AuthProvider` → `BrowserRouter`. Routes are split into `PublicRoute` (auth page) and `PrivateRoute` (all app pages). An `AuthWatcher` component handles unauthorized redirects.

### API Layer (`src/lib/api/`)
- `client.ts` — Fetch-based `ApiClient` class with Bearer token auth; auto-dispatches `auth:unauthorized` on 401/403
- `endpoints.ts` — Centralized endpoint constants under `/api/v1` prefix
- Each domain file (`dashboard.ts`, `reports.ts`, `booking.ts`, etc.) exports TanStack Query hooks (`useXxxQuery`, `useXxxMutation`) and fetch functions
- **All data is currently mock** — functions simulate network delay then return hardcoded data. Search for `// TODO: [ADARSH]` to find all backend connection points

### Auth (`src/context/AuthContext.tsx`)
- Dev mode (`VITE_DEV_MODE=true`): bypasses login entirely, uses fake token, shows "DEV MODE" badge in sidebar
- Production: token stored in localStorage via `lib/auth/token.ts`, inactivity logout after configurable timeout
- `useAuth()` hook provides `token`, `user`, `login()`, `registerAccount()`, `logout()`, `isDevMode`

### Layout (`src/components/Layout.tsx`)
- Desktop: fixed 64-wide sidebar with nav items array (add new pages by adding to `navItems`)
- Mobile: bottom tab bar showing first 5 nav items

### Component Organization
- `src/components/ui/` — 50+ Shadcn/UI primitives (configured via `components.json`, base color: slate)
- `src/components/{feature}/` — Feature-specific components (dashboard, calendar, reports, inbox, crews, automation, integrations, settings)
- `src/components/skeletons/` — Loading skeleton components
- `src/pages/` — Route-level page components, each wraps content in `<Layout>`

### State Management
- **Server state**: TanStack Query (query keys like `['dashboard-extended', from, to]`)
- **Auth state**: React Context (`AuthContext`)
- **UI preferences**: localStorage (dashboard section toggles via `useDashboardPreferences`)
- **Forms**: React Hook Form + Zod schemas

### Types (`src/types/`)
- `index.ts` — Core domain types: `Property`, `Booking`, `Task`, `Crew`, `AutomationRule`, `CalendarEvent`, `Message`, `Conversation` and associated union types (`Priority`, `TaskStatus`, `PlatformName`, etc.)
- `reports.ts` — Report-specific types

## Dev Mode

Set `VITE_DEV_MODE=true` in `.env.development` to:
- Skip authentication (fake token used automatically)
- Load mock data on all pages
- Show "DEV MODE" badge in sidebar
- Disable inactivity logout

Environment config lives in `src/config/env.ts` (reads `VITE_*` vars via `import.meta.env`).

## Backend Integration Status

All pages use mock data. The `Adarsh.md` file contains the full handoff guide with:
- Expected API response shapes for each endpoint
- SQL schemas for `scheduled_reports` and `property_pricing_config` tables
- List of files to modify for each integration task

Key files with TODO markers:
- `src/lib/api/dashboard.ts` — Dashboard metrics
- `src/lib/api/reports.ts` — 6 report types + email + scheduling
- `src/components/reports/ReportFilters.tsx` — Property/owner dropdowns
- `src/pages/Pricing.tsx` — Pricing config load/save + property fetching

## Styling

- Glacier theme with CSS custom properties defined in `src/index.css`
- Primary: `hsl(200 98% 39%)`, Secondary: `hsl(215 24% 26%)`
- Fonts: Inter (sans), Lora (serif), Space Mono (mono)
- Dark mode: class-based toggle
- Use Tailwind utility classes; colors reference CSS variables (e.g., `bg-primary`, `text-muted-foreground`)

## TypeScript Config

Loose settings for rapid development: `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`. ESLint also has `@typescript-eslint/no-unused-vars: off`.

## Key Conventions

- New UI components should use Shadcn/UI primitives from `components/ui/`
- API hooks follow pattern: export `useXxxQuery()` wrapping `useQuery()` with a `fetchXxx()` function
- Pages import `Layout` and handle loading states with skeleton components from `components/skeletons/`
- Navigation: add entries to the `navItems` array in `src/components/Layout.tsx`
