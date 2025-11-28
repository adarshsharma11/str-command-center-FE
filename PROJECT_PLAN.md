# STR Command & Control Platform - Project Plan

## Architecture Overview
**Tech Stack**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Supabase (via Lovable Cloud)
**Design**: Glacier theme, mobile-first, premium aesthetic

## Core Data Models

### Property
- id: string
- name: string
- address: string
- ownerId: string
- internalStatus: 'Active' | 'Inactive' | 'Maintenance'

### Listing
- id: string
- propertyId: string
- platformName: 'Airbnb' | 'Vrbo' | 'Direct'
- platformListingId: string
- syncStatus: 'Synced' | 'Error' | 'Pending'
- trustScore: number (0-100)

### Task
- id: string
- priority: 'P1' | 'P2' | 'P3' | 'P4'
- type: 'Cleaning' | 'Maintenance' | 'Guest Issue'
- assignedCrewId: string
- bookingId: string
- status: 'Pending' | 'In Progress' | 'Completed'
- completionLog?: { completedBy: string; completedAt: Date }

### Rule (Automation)
- id: string
- triggerEvent: 'NewBooking' | 'CheckOut' | 'MessageReceived'
- condition: string
- action: 'SendMessage' | 'CreateTask' | 'NotifyCrew'
- isActive: boolean

### Booking
- id: string
- propertyId: string
- guestName: string
- checkIn: Date
- checkOut: Date
- platform: string
- reservationStatus: 'Confirmed' | 'Reserved' | 'Blocked'
- paymentStatus: 'Paid' | 'Partial' | 'Unpaid'

## Pages Implemented

1. **/auth** - Authentication (login/signup via Supabase Auth)
2. **/dashboard** - KPI cards, priority task widget, alert feed
3. **/calendar** - Multi-calendar with color-coded reservations, filters
4. **/inbox** - Unified messaging inbox with guest insights panel
5. **/crews** - Crew/vendor management with drag-and-drop task queue
6. **/automation** - Visual rule builder, message templates, execution logs
7. **/properties** - Property list with linking UI for OTA connections
8. **/bookings** - Comprehensive reservations data table
9. **/settings** - Auth, API keys, preferences

## Key Features

- **Property Linking UI**: Map multiple OTA listings to single property
- **Multi-Calendar**: High-density scheduler with Color Tapes (dual status visualization)
- **Unified Inbox**: Aggregated messaging with contextual guest insights
- **Drag & Drop Crews**: Visual task assignment with priority queues
- **Visual Automation Builder**: Low-code IF-THEN rule configuration
- **Mobile-First**: Responsive across all breakpoints

## Implementation Phases

### Phase 1: Foundation ✅
- Project setup with Vite + React + TypeScript
- Glacier theme implementation
- Supabase Cloud integration
- Auth flow

### Phase 2: Core Pages (Current)
- Dashboard with KPIs
- Calendar view
- Inbox with messaging
- Properties management

### Phase 3: Advanced Features
- Crew management with D&D
- Automation rule builder
- Bookings table
- Settings panel

## Cookie Crumbs & TODOs

All backend interactions use mock data stubs with clear TODO markers:
- `// TODO: INTEGRATION STUB: Replace with Supabase API call`
- `// TODO: AI AGENT: Implement AI-powered feature`

## Design Tokens

Using Glacier theme with semantic color tokens:
- Primary: hsl(200 98% 39%) - Vibrant blue
- Secondary: hsl(215 24% 26%) - Deep slate
- All colors defined in design system (index.css)
- No direct color classes in components
