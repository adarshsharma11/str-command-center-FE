# Adarsh - Implementation Handoff Guide

Hey Adarsh! This document explains all the recent changes and what you need to do to connect them to the Supabase backend.

---

## Summary of Changes

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

Look for `// TODO: [INTERN]` comments throughout the codebase. Here's the complete list:

### Dashboard API (`/src/lib/api/dashboard.ts`)

```typescript
// TODO: [INTERN] Connect to real Supabase endpoint
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
// TODO: [INTERN] Replace with actual API call to fetch properties
const MOCK_PROPERTIES = [...];

// TODO: [INTERN] Replace with actual API call to fetch owners
const MOCK_OWNERS = [...];
```

### Pricing Page (`/src/pages/Pricing.tsx`)

```typescript
// TODO: [INTERN] Fetch properties from API
const MOCK_PROPERTIES = [...];

// TODO: [INTERN] Replace with actual booking data from API
const MOCK_BOOKED_DATES = {...};

// TODO: [INTERN] Load/save pricing config from Supabase
// Table: property_pricing_config
// Columns: property_id, min_price, max_price, weekend_premium, last_minute_discount,
//          high_demand_threshold, high_demand_surge, created_at, updated_at

// TODO: [INTERN] Save calculated prices to Supabase
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
  user_id UUID REFERENCES auth.users(id),
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

## Questions?

All the mock data structures mirror exactly what the API should return. Use them as your API contract.

Good luck!
