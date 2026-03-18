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
  revenue: number | null;
};

export type LuxuryServiceRevenue = {
  name: string;
  value: number;
};

export type GuestOrigin = {
  name: string;
  value: number;
};

export type PriorityTask = {
  id: number;
  reservation_id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  due_date: string;
  property: string;
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
    current_period_monthly?: RevenueTrendPoint[];
    last_year_period_monthly?: RevenueTrendPoint[];
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

// --- API Functions ---



export async function fetchDashboardMetrics(): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>(ENDPOINTS.DASHBOARD.METRICS);
}

/**
 * Fetch extended dashboard metrics with all new analytics
 */
export async function fetchDashboardExtended(params?: { from?: string; to?: string }): Promise<DashboardExtendedResponse> {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get<DashboardExtendedResponse>(`${ENDPOINTS.DASHBOARD.EXTENDED}${queryString}`);
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
