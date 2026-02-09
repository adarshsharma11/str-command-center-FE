# STR Command Center - Frontend

Property management CRM for short-term rentals (MOMA.HOUSE branding).

## Tech Stack
- React 18 + TypeScript + Vite
- TanStack Query for API state
- Shadcn/UI + Tailwind CSS
- Recharts for data visualization
- React Hook Form + Zod for forms

## Project Structure
```
src/
  components/     # Reusable UI components
    ui/           # Shadcn primitives
    dashboard/    # Dashboard-specific charts
    reports/      # Report preview components
  pages/          # Route pages
  lib/api/        # API hooks and mock data
  types/          # TypeScript definitions
  hooks/          # Custom React hooks
  context/        # React contexts (Auth)
  config/         # Environment config
```

## Key Pages
- `/dashboard` - Analytics overview with KPIs, charts
- `/reports` - 6 report types with preview, email, schedule
- `/pricing` - Dynamic pricing algorithm per property
- `/properties`, `/bookings`, `/calendar`, `/inbox`, `/crews`, `/automation`, `/settings`

## Development Mode
Set `VITE_DEV_MODE=true` in `.env.development` to bypass auth and use mock data.

## Patterns to Follow
- API hooks in `lib/api/*.ts` use TanStack Query
- Mock data pattern: `useMockData()` returns realistic data shapes
- Forms: React Hook Form + Zod schema + Shadcn Form components
- Charts: Recharts with `ChartContainer` wrapper from `ui/chart.tsx`

## What's Mock Data vs Real
- Dashboard extended data: Mock (`lib/api/dashboard.ts`)
- Reports data: Mock (`lib/api/reports.ts`)
- Pricing config: Mock (in-component)
- Properties/Owners lists: Mock (TODO markers)

Look for `// TODO: [INTERN]` comments for backend connection points.

## Build Commands
```bash
npm run dev      # Dev server with hot reload
npm run build    # Production build
npm run preview  # Preview production build
```

## Recent Changes (Feb 2026)
1. Dashboard enhancement with new charts (revenue trends, occupancy, channel split)
2. Reports page with 6 report types + email/schedule dialogs
3. Pricing page with dynamic pricing algorithm
4. Dev mode authentication bypass
5. Simplified KPI cards (removed "vs last period")
