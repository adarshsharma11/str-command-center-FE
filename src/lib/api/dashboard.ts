import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

// --- Base Types ---

export type Metric = {
  value: number;
  percentage_change: number;
  trend_direction: 'up' | 'down' | 'neutral';
  label: string;
};

export type TopProperty = {
  name: string;
  revenue: number;
  bookings_count: number;
};

export type LuxuryServiceRevenue = {
  name: string;
  revenue: number;
  bookings_count: number;
};

export type GuestOrigin = {
  origin: string;
  bookings: number;
  revenue: number;
  percentage: number;
};

export type PriorityTask = {
  id: number;
  title: string;
  type: string;
  due_date: string;
  priority: string;
  status: string;
};

// --- Extended Dashboard Types ---

export type RevenueForecastPeriod = {
  period: '30d' | '60d' | '90d';
  confirmed_revenue: number;
  bookings_count: number;
  potential_revenue: number;
};

export type RevenueTrendPoint = {
  date: string;
  revenue: number;
  bookings: number;
};

export type PropertyOccupancy = {
  property_id: string;
  property_name: string;
  occupancy_rate: number;
  booked_nights: number;
  available_nights: number;
};

export type ChannelRevenue = {
  channel: string;
  revenue: number;
  percentage: number;
  bookings_count: number;
};

export type PaymentCollection = {
  paid: number;
  partial: number;
  pending: number;
  total: number;
};

export type UpcomingEvent = {
  id: string;
  type: 'check_in' | 'check_out';
  guest_name: string;
  property_name: string;
  property_id: string;
  date: string;
  time: string;
  guests_count: number;
  notes?: string;
};

// --- Dashboard Data Types ---

export type DashboardData = {
  total_revenue: Metric;
  property_revenue: Metric;
  service_revenue: Metric;
  active_bookings: Metric;
  top_performing_properties: TopProperty[];
  luxury_services_revenue: LuxuryServiceRevenue[];
  guest_origins: GuestOrigin[];
  priority_tasks: PriorityTask[];
};

export type DashboardDataExtended = DashboardData & {
  average_daily_rate: Metric;
  overall_occupancy_rate: Metric;
  pending_payments: Metric;
  revenue_forecast: RevenueForecastPeriod[];
  revenue_trends: {
    current_period: RevenueTrendPoint[];
    last_year_period: RevenueTrendPoint[];
  };
  occupancy_by_property: PropertyOccupancy[];
  revenue_by_channel: ChannelRevenue[];
  payment_collection: PaymentCollection;
  upcoming_check_ins: UpcomingEvent[];
  upcoming_check_outs: UpcomingEvent[];
};

export type DashboardResponse = {
  success: boolean;
  message: string;
  data: DashboardData;
};

export type DashboardExtendedResponse = {
  success: boolean;
  message: string;
  data: DashboardDataExtended;
};

// --- Mock Data ---
// TODO: [ADARSH] Remove mock data once backend API is connected
// These mocks demonstrate the expected API response structure

const MOCK_EXTENDED_DATA: DashboardDataExtended = {
  // Base metrics (keeping existing structure)
  total_revenue: { value: 125450, percentage_change: 12.5, trend_direction: 'up', label: 'Total Revenue' },
  property_revenue: { value: 98200, percentage_change: 8.3, trend_direction: 'up', label: 'Property Revenue' },
  service_revenue: { value: 27250, percentage_change: 22.1, trend_direction: 'up', label: 'Service Revenue' },
  active_bookings: { value: 24, percentage_change: -5, trend_direction: 'down', label: 'Active Bookings' },

  // New extended metrics
  average_daily_rate: { value: 385, percentage_change: 5.2, trend_direction: 'up', label: 'Avg Daily Rate' },
  overall_occupancy_rate: { value: 78.5, percentage_change: 3.1, trend_direction: 'up', label: 'Occupancy Rate' },
  pending_payments: { value: 18750, percentage_change: -15.3, trend_direction: 'down', label: 'Pending Payments' },

  // Revenue forecast
  revenue_forecast: [
    { period: '30d', confirmed_revenue: 45200, bookings_count: 12, potential_revenue: 8500 },
    { period: '60d', confirmed_revenue: 78400, bookings_count: 21, potential_revenue: 15200 },
    { period: '90d', confirmed_revenue: 102300, bookings_count: 28, potential_revenue: 24800 },
  ],

  // Revenue trends (weekly data for current year vs last year same period)
  revenue_trends: {
    current_period: [
      { date: '2024-01-01', revenue: 18500, bookings: 5 },
      { date: '2024-01-08', revenue: 22300, bookings: 6 },
      { date: '2024-01-15', revenue: 19800, bookings: 5 },
      { date: '2024-01-22', revenue: 28400, bookings: 8 },
      { date: '2024-01-29', revenue: 36450, bookings: 10 },
    ],
    last_year_period: [
      { date: '2023-01-01', revenue: 14200, bookings: 4 },
      { date: '2023-01-08', revenue: 17100, bookings: 5 },
      { date: '2023-01-15', revenue: 15500, bookings: 4 },
      { date: '2023-01-22', revenue: 19800, bookings: 5 },
      { date: '2023-01-29', revenue: 22600, bookings: 6 },
    ],
  },

  // Occupancy by property
  occupancy_by_property: [
    { property_id: '1', property_name: 'Ocean View Villa', occupancy_rate: 92, booked_nights: 27, available_nights: 30 },
    { property_id: '2', property_name: 'Mountain Retreat', occupancy_rate: 85, booked_nights: 25, available_nights: 30 },
    { property_id: '3', property_name: 'Downtown Loft', occupancy_rate: 78, booked_nights: 23, available_nights: 30 },
    { property_id: '4', property_name: 'Beachfront Condo', occupancy_rate: 73, booked_nights: 22, available_nights: 30 },
    { property_id: '5', property_name: 'Lakeside Cabin', occupancy_rate: 65, booked_nights: 19, available_nights: 30 },
  ],

  // Revenue by channel
  revenue_by_channel: [
    { channel: 'Airbnb', revenue: 62500, percentage: 49.8, bookings_count: 45 },
    { channel: 'Vrbo', revenue: 31200, percentage: 24.9, bookings_count: 22 },
    { channel: 'Direct', revenue: 21750, percentage: 17.3, bookings_count: 15 },
    { channel: 'Booking.com', revenue: 10000, percentage: 8.0, bookings_count: 8 },
  ],

  // Payment collection status
  payment_collection: {
    paid: 98450,
    partial: 8250,
    pending: 18750,
    total: 125450,
  },

  // Upcoming check-ins (today and tomorrow)
  upcoming_check_ins: [
    { id: '1', type: 'check_in', guest_name: 'John Smith', property_name: 'Ocean View Villa', property_id: '1', date: '2024-01-29', time: '15:00', guests_count: 4, notes: 'Late arrival expected' },
    { id: '2', type: 'check_in', guest_name: 'Emily Davis', property_name: 'Downtown Loft', property_id: '3', date: '2024-01-29', time: '14:00', guests_count: 2 },
    { id: '3', type: 'check_in', guest_name: 'Michael Chen', property_name: 'Mountain Retreat', property_id: '2', date: '2024-01-30', time: '16:00', guests_count: 6 },
  ],

  // Upcoming check-outs
  upcoming_check_outs: [
    { id: '4', type: 'check_out', guest_name: 'Sarah Johnson', property_name: 'Beachfront Condo', property_id: '4', date: '2024-01-29', time: '11:00', guests_count: 3 },
    { id: '5', type: 'check_out', guest_name: 'David Wilson', property_name: 'Ocean View Villa', property_id: '1', date: '2024-01-29', time: '10:00', guests_count: 2 },
    { id: '6', type: 'check_out', guest_name: 'Lisa Brown', property_name: 'Lakeside Cabin', property_id: '5', date: '2024-01-30', time: '11:00', guests_count: 4 },
  ],

  // Existing arrays (kept from original structure)
  top_performing_properties: [
    { name: 'Ocean View Villa', revenue: 32500, bookings_count: 12 },
    { name: 'Mountain Retreat', revenue: 28400, bookings_count: 10 },
    { name: 'Downtown Loft', revenue: 21300, bookings_count: 15 },
  ],
  luxury_services_revenue: [
    { name: 'Private Chef', revenue: 12500, bookings_count: 18 },
    { name: 'Spa & Massage', revenue: 8200, bookings_count: 24 },
    { name: 'Yacht Charter', revenue: 6550, bookings_count: 4 },
  ],
  guest_origins: [
    { origin: 'United States', bookings: 45, revenue: 68500, percentage: 54.6 },
    { origin: 'United Kingdom', bookings: 15, revenue: 24200, percentage: 19.3 },
    { origin: 'Canada', bookings: 12, revenue: 18500, percentage: 14.8 },
    { origin: 'Germany', bookings: 8, revenue: 14250, percentage: 11.3 },
  ],
  priority_tasks: [
    { id: 1, title: 'Prepare Ocean View for check-in', type: 'Cleaning', due_date: '2024-01-29', priority: 'P1', status: 'Pending' },
    { id: 2, title: 'Fix AC unit at Downtown Loft', type: 'Maintenance', due_date: '2024-01-30', priority: 'P2', status: 'In Progress' },
    { id: 3, title: 'Guest complaint - Mountain Retreat', type: 'Guest Issue', due_date: '2024-01-29', priority: 'P1', status: 'Pending' },
  ],
};

// --- API Functions ---

export async function fetchDashboardMetrics(): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>(ENDPOINTS.DASHBOARD.METRICS);
}

/**
 * Fetch extended dashboard metrics with all new analytics
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/dashboard/extended
 * Query params: from (date), to (date) for filtering the date range
 */
export async function fetchDashboardExtended(params?: { from?: string; to?: string }): Promise<DashboardExtendedResponse> {
  // TODO: [ADARSH] Replace mock with actual API call:
  // const queryString = params ? `?from=${params.from}&to=${params.to}` : '';
  // return apiClient.get<DashboardExtendedResponse>(`${ENDPOINTS.DASHBOARD.EXTENDED}${queryString}`);

  // Mock implementation for development
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: MOCK_EXTENDED_DATA,
  };
}

// --- Hooks ---

export function useDashboardMetricsQuery(options?: UseQueryOptions<DashboardResponse, Error>) {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard-metrics'],
    queryFn: () => fetchDashboardMetrics(),
    staleTime: 60_000, // 1 minute
    ...options,
  });
}

/**
 * Hook for fetching extended dashboard data with date range filtering
 * TODO: [ADARSH] This hook will call the extended endpoint once backend is ready
 */
export function useDashboardExtendedQuery(
  params?: { from?: string; to?: string },
  options?: Omit<UseQueryOptions<DashboardExtendedResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DashboardExtendedResponse, Error>({
    queryKey: ['dashboard-extended', params?.from, params?.to],
    queryFn: () => fetchDashboardExtended(params),
    staleTime: 60_000, // 1 minute
    ...options,
  });
}
