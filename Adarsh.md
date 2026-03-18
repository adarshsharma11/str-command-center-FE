# Adarsh - Implementation Handoff Guide

Hey Adarsh! This document tracks the backend integration status for the MOMA.HOUSE CRM frontend. The app uses the Portgas DB backend — all API calls go through `/api/v1/*`. No Supabase.

**Last updated: March 18, 2026**

---

## Current Production Status

The app is live at **http://146.190.165.203/** with real data flowing through multiple pages.

### What's Already Working (DONE)

| Page | Status | Notes |
|------|--------|-------|
| **Dashboard** | LIVE with real data | All KPIs, charts, forecasts showing real booking/revenue data |
| **Calendar** | LIVE | Connected to bookings API |
| **Properties** | LIVE | Connected to properties API |
| **Bookings** | LIVE | Connected to bookings API |
| **Inbox** | LIVE | Connected to emails API |
| **Reports** | LIVE | Owner Statement, Booking Summary, etc. pulling real data |
| **Dispatch** | LIVE | Service bookings/responses working (SSE stream has minor errors, non-blocking) |
| **Crews** | LIVE | Connected to crews API |
| **Automation** | LIVE | Activity rules API connected |
| **Settings/Integrations** | LIVE | User/platform integration endpoints working |
| **Login/Auth** | LIVE | Fernet-encrypted passwords, JWT tokens, 24hr expiry |

### What Still Needs Backend Work

| Page | What's Needed |
|------|--------------|
| **Pricing** | Load/save pricing config per property, fetch booked dates from API |
| **Reports - Email** | `POST /api/v1/reports/send-email` — generate PDF + send email |
| **Reports - Scheduling** | CRUD for `scheduled_reports` table (create, list, toggle, delete) |
| **Report Filters** | Fetch real property/owner lists for filter dropdowns |

---

## Dashboard Backend — What Was Fixed (March 18, 2026)

### Round 1 — Core dashboard
The `dashboard_service.py` was rewritten to fix two critical issues:

1. **`_get_services_revenue()`** was querying a nonexistent `services` table — fixed to use `service_category` table instead
2. **`get_extended_metrics()` method didn't exist** — added full implementation with ~15 SQL helper methods

### Round 2 — Four additional dashboard fixes (same day)

The backend (`dashboard_service.py`) was updated again with 4 new features, and the frontend was updated to consume them:

1. **Guest Origins** — New `_get_guest_origins()` / `_get_guest_origins_in_range()` methods derive guest countries from phone country codes using a `PHONE_COUNTRY_MAP` (35+ country code mappings). Now shows "India — 6 bookings — $8,800" etc.
2. **Upcoming Check-outs** — Extended lookahead window from 2 days to 7 days in `_get_upcoming_events()`. Check-outs now show on the dashboard (previously empty).
3. **Priority Tasks** — New `_get_priority_tasks()` method pulls pending tasks from `cleaning_tasks` table + generates check-in prep tasks from upcoming bookings. Frontend maps backend priorities (`urgent`/`high`/`medium`/`low`) to P1–P4.
4. **Revenue Trends Weekly/Monthly Toggle** — `_get_revenue_trends()` now returns 4 arrays: `current_period` (weekly), `last_year_period` (weekly), `current_period_monthly`, `last_year_period_monthly`. Frontend `RevenueTrendChart.tsx` switches data source on toggle.

The dashboard now returns real data from PostgreSQL:
- **Total Revenue**: ~$15K this month (13 bookings across Airbnb + VRBO)
- **Revenue by Channel**: Airbnb 80% / VRBO 20%
- **3 properties**: Exquisite Midcentury Retreat, Satori Retreat House, Joshua Tree Mansion
- **5 service categories**: Test1, Airport Transfer, Massage Therapy, Bartender, Concierge Service
- **Guest Origins**: India (derived from +91 phone codes)
- **Priority Tasks**: Cleaning tasks + check-in prep tasks
- **Upcoming events**: Check-ins and check-outs within 7-day window

Files modified on server: `/var/www/app/Email-parser/src/api/services/dashboard_service.py`
Frontend files: `RevenueTrendChart.tsx`, `dashboard.ts` (types), `Dashboard.tsx` (props + priority mapping)

---

## Remaining TODO Items

### Pricing Page (`/src/pages/Pricing.tsx`)

```typescript
// TODO: [ADARSH] Fetch properties from API
// TODO: [ADARSH] Replace with actual booking data from API
// TODO: [ADARSH] Load/save pricing config from Portgas DB
// TODO: [ADARSH] Save calculated prices to Portgas DB
```

Needs a `property_pricing_config` table:
```sql
CREATE TABLE property_pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  weekend_boost INTEGER NOT NULL DEFAULT 20,
  seasonal_strength INTEGER NOT NULL DEFAULT 75,
  island_discount INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id)
);
```

### Report Email (`POST /api/v1/reports/send-email`)

```typescript
{
  report_type: 'owner-statement' | 'booking-summary' | ...,
  filters: { from: string, to: string, ... },
  recipients: string[],
  subject?: string,
  message?: string,
  attach_pdf: boolean
}
```

Backend should: generate report data, create PDF, send email to recipients.

### Scheduled Reports (CRUD)

```
POST   /api/v1/reports/scheduled     — Create
GET    /api/v1/reports/scheduled     — List all
PATCH  /api/v1/reports/scheduled/:id — Toggle active
DELETE /api/v1/reports/scheduled/:id — Delete
```

Needs a `scheduled_reports` table:
```sql
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  report_type TEXT NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly')),
  recipients TEXT[] NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Report Filters (`/src/components/reports/ReportFilters.tsx`)

```typescript
// TODO: [ADARSH] Replace with actual API call to fetch properties
// TODO: [ADARSH] Replace with actual API call to fetch owners
```

---

## Architecture Quick Reference

- **Frontend**: React 18 + TypeScript + Vite, deployed at `/var/www/app/str-command-center-FE/dist/`
- **Backend**: Python FastAPI, deployed at `/var/www/app/Email-parser/`
- **Database**: PostgreSQL 16 at `localhost:5432/str_command_center`
- **Nginx**: proxies `/api/` → `http://127.0.0.1:8000`
- **Process**: gunicorn + uvicorn workers (PID-based, no systemd unit)
- **Build & Deploy**: `VITE_DEV_MODE=false VITE_API_BASE_URL="/api" npm run build` then rsync dist/
- **Restart backend**: `kill -HUP <gunicorn-master-pid>` to graceful-reload workers

---

## Testing Locally

1. Set `VITE_DEV_MODE=true` in `.env.development`
2. Run `npm run dev`
3. "DEV MODE" badge appears in sidebar, mock data used throughout

---

## Questions?

The frontend gracefully handles missing/partial API data — all fields use `?? 0` and `?? []` fallbacks so the dashboard won't crash even if some backend endpoints are incomplete.
