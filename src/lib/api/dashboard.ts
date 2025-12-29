import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

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

export type DashboardResponse = {
  success: boolean;
  message: string;
  data: DashboardData;
};

// --- API Functions ---

export async function fetchDashboardMetrics(): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>(ENDPOINTS.DASHBOARD.METRICS);
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
