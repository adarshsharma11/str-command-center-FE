# Adarsh - Implementation Handoff Guide

Hey Adarsh! This document explains the latest frontend updates and what changed in this PR. **Important: We've removed Supabase entirely.** The app now uses the Portgas DB backend — all API calls go through the existing Express API layer (`/api/v1/*`). No Supabase client, no Supabase auth, no Supabase anything.

---

## What's In This PR

This PR merges the enhanced frontend (pricing, reports, dashboard) into the main branch. It also:

1. **Removes Supabase** — deleted `@supabase/supabase-js` dependency and `src/integrations/supabase/` directory
2. **Merges your recent backend work** — booking API improvements, property refresh, CI/CD pipeline, psql upgrade (PRs #5 and #6)
3. **Adds null safety** — all dashboard data fields use `?? 0` and `?? []` so they won't crash if the backend returns partial data
4. **Adds dynamic property loading** in Testing page via `useAllPropertiesQuery` (falls back to mock if API unavailable)

### Files that changed in the merge:
- `.github/workflows/deploy.yaml` — your CI/CD (kept as-is)
- `src/lib/api/booking.ts` — your booking API improvements (kept as-is)
- `src/lib/api/endpoints.ts` — merged endpoint additions from both sides
- `src/lib/api/property.ts` — your property API fixes (kept as-is)
- `src/pages/Bookings.tsx` — your bookings page improvements (kept as-is)
- `src/pages/Calendar.tsx`, `Properties.tsx` — your backend integration (kept as-is)
- `src/pages/Dashboard.tsx` — **merged**: our enhanced UI + your null safety
- `src/pages/Testing.tsx` — **merged**: our polling + your dynamic property loading

---

## Summary of Frontend Changes (New Stuff)

### 1. Dashboard Enhancement
- **New charts**: Revenue Trends (year-over-year comparison), Occupancy by Property, Revenue by Channel
- **Simplified KPI cards**: Removed "vs last period" comparisons
- **Customization**: Users can toggle which sections to show (saved in localStorage)
- **Date range picker**: Filter dashboard by date period

### 2. Reports Page (`/reports`)
**6 report types:**
1. Owner Statement - Revenue/expenses per property for owners (services integrated directly into booking tables)
2. Booking Summary - All bookings in date range
3. Service Revenue - Luxury services breakdown
4. Service Provider Statement - Invoice-style for service providers
5. Occupancy Report - Occupancy rates by property
6. Performance Comparison - Compare any month/year against any other period (user-selectable)

**Features:**
- Preview each report with charts and tables
- Schedule recurring reports (weekly/monthly/quarterly)
- Email reports to recipients
- Performance Comparison now has month/year dropdowns to choose comparison period

### 3. Pricing Page (`/pricing`)
Two tabs:

**Tab 1: AI Optimization**
- Calendar view per property showing AI-calculated prices
- Shows "Booked" for taken dates, AI price for available dates
- Algorithm factors: seasonality, day-of-week (Sat +20%, Mon/Tue -10%), lead time, holidays

**Tab 2: Manual Config**
- User-configurable pricing rules with 3 simple sliders:
  - **Weekend Boost** (0-50%): Price increase for Fri/Sat nights
  - **Seasonal Strength** (0-100%): How much to follow seasonal patterns
  - **Island Discount** (0-30%): Discount for isolated available nights between bookings
    - 3-night island: base discount
    - 2-night island: 1.33x the base discount
    - 1-night island: 1.5x the base discount
- 14-day preview table showing calculated prices with factor breakdown

### 4. Dev Mode
- Set `VITE_DEV_MODE=true` in `.env.development` to bypass login
- Shows "DEV MODE" badge in sidebar
- Uses mock data throughout

---

## What You Need To Do

Look for `// TODO: [ADARSH]` comments throughout the codebase. Here's the complete list:

### Dashboard API (`/src/lib/api/dashboard.ts`)

```typescript
// TODO: [ADARSH] Connect to real API endpoint
// Expected endpoint: GET /api/v1/dashboard/extended
// Query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD
```

**Expected Response Shape:**
```typescript
{
  // Existing fields...
  average_daily_rate: { value: number, label: string },
  overall_occupancy_rate: { value: number, label: string },
  revenue_forecast: [
    { period: '30d', confirmed_revenue: number, bookings_count: number },
    { period: '60d', confirmed_revenue: number, bookings_count: number },
    { period: '90d', confirmed_revenue: number, bookings_count: number }
  ],
  revenue_trends: {
    current_period: [{ date: string, revenue: number }],
    last_year_period: [{ date: string, revenue: number }]
  },
  occupancy_by_property: [
    { property_id: string, property_name: string, occupancy_rate: number }
  ],
  revenue_by_channel: [
    { channel: string, revenue: number, percentage: number }
  ],
  payment_collection: { paid: number, partial: number, pending: number },
  upcoming_check_ins: [...],
  upcoming_check_outs: [...]
}
```

### Reports API (`/src/lib/api/reports.ts`)

**Endpoints needed:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/reports/owner-statement` | GET | Owner statement data |
| `/api/v1/reports/booking-summary` | GET | Booking list |
| `/api/v1/reports/service-revenue` | GET | Service revenue breakdown |
| `/api/v1/reports/service-provider` | GET | Provider jobs & payouts |
| `/api/v1/reports/occupancy` | GET | Occupancy rates |
| `/api/v1/reports/performance` | GET | Performance comparison |
| `/api/v1/reports/send-email` | POST | Send report via email |
| `/api/v1/reports/scheduled` | CRUD | Scheduled reports |

**Query params for all GET endpoints:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)
- `propertyIds`: Comma-separated property IDs (optional)
- `ownerIds`: Comma-separated owner IDs (optional)

**Performance Comparison specific params:**
- `compareMonth`: Month number (0-11) for comparison period
- `compareYear`: Year (e.g., 2023) for comparison period

### Report Filters (`/src/components/reports/ReportFilters.tsx`)

```typescript
// TODO: [ADARSH] Replace with actual API call to fetch properties
const MOCK_PROPERTIES = [...];

// TODO: [ADARSH] Replace with actual API call to fetch owners
const MOCK_OWNERS = [...];
```

### Pricing Page (`/src/pages/Pricing.tsx`)

```typescript
// TODO: [ADARSH] Fetch properties from API
const MOCK_PROPERTIES = [...];

// TODO: [ADARSH] Replace with actual booking data from API
const MOCK_BOOKED_DATES = {...};

// TODO: [ADARSH] Load/save pricing config from Portgas DB
// Table: property_pricing_config
// Columns: property_id, min_price, max_price, weekend_premium, last_minute_discount,
//          high_demand_threshold, high_demand_surge, created_at, updated_at

// TODO: [ADARSH] Save calculated prices to Portgas DB
// Suggestion: Create a property_daily_prices table with columns:
// property_id, date, base_price, ai_price, manual_price, factors (JSONB), created_at
```

### Email Integration

The email dialog calls `useSendReportEmailMutation` which expects:

```typescript
POST /api/v1/reports/send-email
{
  report_type: 'owner-statement' | 'booking-summary' | ...,
  filters: { from: string, to: string, ... },
  recipients: string[],
  subject?: string,
  message?: string,
  attach_pdf: boolean
}
```

The backend should:
1. Generate the report data
2. Create PDF attachment (if attach_pdf is true)
3. Send email to all recipients

### Scheduled Reports

CRUD endpoints for scheduled reports:

```typescript
// Create
POST /api/v1/reports/scheduled
{
  report_type: string,
  name: string,
  frequency: 'weekly' | 'monthly' | 'quarterly',
  recipients: string[],
  filters: { ... }
}

// List
GET /api/v1/reports/scheduled

// Toggle active
PATCH /api/v1/reports/scheduled/:id
{ is_active: boolean }

// Delete
DELETE /api/v1/reports/scheduled/:id
```

---

## Database Tables Needed

### `scheduled_reports`
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

### `property_pricing_config`
```sql
CREATE TABLE property_pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  weekend_boost INTEGER NOT NULL DEFAULT 20,        -- % increase for Fri/Sat
  seasonal_strength INTEGER NOT NULL DEFAULT 75,    -- 0-100% how much to follow seasonal patterns
  island_discount INTEGER NOT NULL DEFAULT 10,      -- base % discount for island dates (3-night)
  -- Island discount multipliers: 2-night = 1.33x, 1-night = 1.5x
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id)
);
```

---

## Testing Locally

1. Make sure you have `.env.development` with `VITE_DEV_MODE=true`
2. Run `npm run dev`
3. You'll see "DEV MODE" badge in sidebar
4. All pages work with mock data

---

## Files You'll Modify Most

| File | What to do |
|------|-----------|
| `/src/lib/api/dashboard.ts` | Replace mock data with real API calls |
| `/src/lib/api/reports.ts` | Replace mock data with real API calls |
| `/src/components/reports/ReportFilters.tsx` | Fetch properties/owners from API |
| `/src/components/reports/PerformancePreview.tsx` | Connect comparison period selector to API |
| `/src/pages/Pricing.tsx` | Load/save pricing config, fetch properties |

---

## Quick Wins (Easy Tasks)

1. Replace `MOCK_PROPERTIES` and `MOCK_OWNERS` with API calls (4 places)
2. Add properties endpoint to fetch list with IDs
3. Wire up existing email infrastructure to report emails

---

---

## Round 3 — Clean Slate, Forecast Fix & Crew Pricing

This round covers four backend tasks. The frontend for all of these is already built and merged — you just need the API/DB side.

---

### 1. Delete Property Endpoint

Add a `DELETE /api/v1/property/:id` endpoint.

- **Soft delete preferred** — add a `deleted_at TIMESTAMPTZ` column to the `properties` table (or mark `is_active = false`). Booking history tied to deleted properties must not be lost.
- Return `{ success: true }` on success, appropriate error otherwise.
- Frontend is ready: the Properties page has a delete button with a confirmation dialog, and the mutation hook (`useDeletePropertyMutation`) is already wired up in `src/lib/api/property.ts`.

---

### 2. Dashboard Property Filtering

The `GET /api/v1/dashboard/extended` endpoint currently aggregates data across **all** bookings, including bookings for properties that were parsed from emails but never formally added to the Properties tab.

**Required change:** All dashboard queries must JOIN against the `properties` table and only include data where the booking's property matches a registered, non-deleted property.

Rules:
- If a property was parsed from an email but hasn't been added to the Properties tab → exclude its data from the dashboard.
- If a property has been soft-deleted (`deleted_at IS NOT NULL`) → exclude its data from the dashboard.

**Affected response fields** (all of them need the property filter):
- `total_revenue`
- `property_revenue`
- `service_revenue`
- `active_bookings`
- `average_daily_rate`
- `overall_occupancy_rate`
- `revenue_forecast`
- `revenue_trends`
- `occupancy_by_property`
- `revenue_by_channel`
- `payment_collection`
- `upcoming_check_ins`
- `upcoming_check_outs`
- `top_performing_properties`
- `luxury_services_revenue`
- `guest_origins`
- `priority_tasks`

---

### 3. Revenue Forecast Fix

The current implementation fakes the forecast numbers using multipliers (30d actual, 60d = actual × 0.6, 90d = actual × 0.3). Replace this with real future-looking queries.

**Required logic:**

```sql
-- 30-day confirmed revenue
SELECT COALESCE(SUM(total_amount), 0) AS confirmed_revenue,
       COUNT(*) AS bookings_count
FROM bookings
WHERE check_in_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
  AND property_id IN (SELECT id FROM properties WHERE deleted_at IS NULL);

-- Same pattern for 60-day and 90-day windows
```

Each forecast period object should contain:
- `confirmed_revenue` — sum of `total_amount` for confirmed bookings in the window
- `bookings_count` — count of those bookings
- `potential_revenue` — sum of pending/unconfirmed bookings in the same window (if booking status tracking exists; otherwise return `0`)

**Do not round** numbers to clean multiples — return actual amounts.

The response shape stays the same:
```json
{
  "revenue_forecast": [
    { "period": "30d", "confirmed_revenue": 12345.67, "bookings_count": 8, "potential_revenue": 0 },
    { "period": "60d", "confirmed_revenue": 23456.78, "bookings_count": 15, "potential_revenue": 0 },
    { "period": "90d", "confirmed_revenue": 31000.00, "bookings_count": 21, "potential_revenue": 0 }
  ]
}
```

---

### 4. Crews Table: Add Price & Time Columns

The Crews page now displays `price` and `time` fields on both category headers and individual member rows. The edit dialog also lets users set these values. The backend needs to store them.

**Database migration:**
```sql
ALTER TABLE crews ADD COLUMN price VARCHAR DEFAULT NULL;
ALTER TABLE crews ADD COLUMN time VARCHAR DEFAULT NULL;
```

These are free-text strings (e.g., `"$150"`, `"2 hours"`) — not numeric — because they are display-only values set by the user.

**Endpoints to update:**

| Endpoint | Change |
|----------|--------|
| `POST /api/v1/crews` | Accept `price` and `time` in request body |
| `PATCH /api/v1/crews/:id` | Accept `price` and `time` in request body |
| `GET /api/v1/categories/tree` | Include `price` and `time` in each crew object |

Frontend is ready: `EditMemberDialog` and `Crews.tsx` already send and display these fields. The `CrewApiItem` type in `src/lib/api/crew.ts` includes `price` and `time`.

---

### Frontend Files Modified in This PR

These are the files changed on the frontend side for this round — listed here so you know what's already done:

| File | What changed |
|------|-------------|
| `src/lib/api/endpoints.ts` | Added property DELETE endpoint constant |
| `src/lib/api/property.ts` | Added `deleteProperty()` function and `useDeletePropertyMutation` hook |
| `src/pages/Properties.tsx` | Added delete button with confirmation dialog |
| `src/lib/api/crew.ts` | Added `price` and `time` to `CrewApiItem` type |
| `src/components/crews/EditMemberDialog.tsx` | Added price/time input fields |
| `src/pages/Crews.tsx` | Displays price/time on category headers and member rows |
| `src/types/index.ts` | Added `price` and `time` to `CrewMember` interface |
| `index.html` | Updated favicon, removed Lovable references |

---

## Questions?

All the mock data structures mirror exactly what the API should return. Use them as your API contract.

Good luck!
