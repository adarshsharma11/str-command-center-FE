import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ReportType,
  ReportFilters,
  OwnerStatementData,
  BookingSummaryData,
  ServiceRevenueData,
  ServiceProviderData,
  OccupancyReportData,
  PerformanceReportData,
  ScheduledReport,
  EmailReportRequest,
  ReportResponse,
  ScheduledReportsResponse,
  ScheduleFrequency,
} from '@/types/reports';

// --- Mock Data ---
// TODO: [ADARSH] Remove mock data once backend API is connected
// These mocks demonstrate the expected API response structure

const MOCK_OWNER_STATEMENT: OwnerStatementData = {
  owner_id: 'owner-1',
  owner_name: 'Robert Williams',
  owner_email: 'robert.williams@email.com',
  period_start: '2024-01-01',
  period_end: '2024-01-31',
  properties: [
    {
      property_id: '1',
      property_name: 'Ocean View Villa',
      property_address: '123 Coastal Drive, Miami, FL 33139',
      bookings: [
        { booking_id: 'B001', guest_name: 'John Smith', check_in: '2024-01-05', check_out: '2024-01-10', nights: 5, revenue: 2250, channel: 'Airbnb', channel_fee: 67.50, cleaning_fee: 150 },
        { booking_id: 'B002', guest_name: 'Emily Davis', check_in: '2024-01-15', check_out: '2024-01-20', nights: 5, revenue: 2250, channel: 'Vrbo', channel_fee: 56.25, cleaning_fee: 150 },
        { booking_id: 'B003', guest_name: 'Michael Chen', check_in: '2024-01-22', check_out: '2024-01-28', nights: 6, revenue: 2700, channel: 'Direct', channel_fee: 0, cleaning_fee: 150 },
      ],
      total_revenue: 7200,
      channel_fees: 123.75,
      cleaning_fees_collected: 450,
      cleaning_expenses: 360,
      maintenance_expenses: 250,
      other_expenses: 75,
      net_revenue: 6841.25,
      occupancy_rate: 53.3,
      nights_booked: 16,
      average_daily_rate: 450,
    },
    {
      property_id: '2',
      property_name: 'Mountain Retreat',
      property_address: '456 Highland Road, Aspen, CO 81611',
      bookings: [
        { booking_id: 'B004', guest_name: 'Sarah Johnson', check_in: '2024-01-08', check_out: '2024-01-15', nights: 7, revenue: 4200, channel: 'Airbnb', channel_fee: 126, cleaning_fee: 200 },
        { booking_id: 'B005', guest_name: 'David Wilson', check_in: '2024-01-20', check_out: '2024-01-27', nights: 7, revenue: 4200, channel: 'Vrbo', channel_fee: 105, cleaning_fee: 200 },
      ],
      total_revenue: 8400,
      channel_fees: 231,
      cleaning_fees_collected: 400,
      cleaning_expenses: 320,
      maintenance_expenses: 0,
      other_expenses: 50,
      net_revenue: 8199,
      occupancy_rate: 46.7,
      nights_booked: 14,
      average_daily_rate: 600,
    },
  ],
  total_revenue: 15600,
  total_expenses: 1155.75,
  total_payout: 12916.21,
  management_fee: 1528.04,
  management_fee_percentage: 10,
};

const MOCK_BOOKING_SUMMARY: BookingSummaryData = {
  period_start: '2024-01-01',
  period_end: '2024-01-31',
  total_bookings: 24,
  total_revenue: 45800,
  total_nights: 142,
  average_booking_value: 1908.33,
  bookings: [
    { booking_id: 'B001', property_name: 'Ocean View Villa', guest_name: 'John Smith', guest_email: 'john@email.com', check_in: '2024-01-05', check_out: '2024-01-10', nights: 5, guests: 4, total_amount: 2250, channel: 'Airbnb', status: 'Completed', payment_status: 'Paid', created_at: '2024-01-02' },
    { booking_id: 'B002', property_name: 'Mountain Retreat', guest_name: 'Emily Davis', guest_email: 'emily@email.com', check_in: '2024-01-08', check_out: '2024-01-15', nights: 7, guests: 6, total_amount: 4200, channel: 'Vrbo', status: 'Completed', payment_status: 'Paid', created_at: '2024-01-03' },
    { booking_id: 'B003', property_name: 'Downtown Loft', guest_name: 'Michael Chen', guest_email: 'michael@email.com', check_in: '2024-01-12', check_out: '2024-01-15', nights: 3, guests: 2, total_amount: 750, channel: 'Direct', status: 'Completed', payment_status: 'Paid', created_at: '2024-01-08' },
    { booking_id: 'B004', property_name: 'Beachfront Condo', guest_name: 'Sarah Johnson', guest_email: 'sarah@email.com', check_in: '2024-01-18', check_out: '2024-01-25', nights: 7, guests: 4, total_amount: 3150, channel: 'Airbnb', status: 'Active', payment_status: 'Partial', created_at: '2024-01-10' },
    { booking_id: 'B005', property_name: 'Lakeside Cabin', guest_name: 'David Wilson', guest_email: 'david@email.com', check_in: '2024-01-22', check_out: '2024-01-28', nights: 6, guests: 8, total_amount: 2400, channel: 'Booking.com', status: 'Upcoming', payment_status: 'Pending', created_at: '2024-01-15' },
  ],
  by_channel: [
    { channel: 'Airbnb', count: 12, revenue: 22800 },
    { channel: 'Vrbo', count: 6, revenue: 12500 },
    { channel: 'Direct', count: 4, revenue: 6800 },
    { channel: 'Booking.com', count: 2, revenue: 3700 },
  ],
  by_property: [
    { property_id: '1', property_name: 'Ocean View Villa', count: 6, revenue: 13500 },
    { property_id: '2', property_name: 'Mountain Retreat', count: 5, revenue: 12000 },
    { property_id: '3', property_name: 'Downtown Loft', count: 5, revenue: 8200 },
    { property_id: '4', property_name: 'Beachfront Condo', count: 4, revenue: 7100 },
    { property_id: '5', property_name: 'Lakeside Cabin', count: 4, revenue: 5000 },
  ],
};

const MOCK_SERVICE_REVENUE: ServiceRevenueData = {
  period_start: '2024-01-01',
  period_end: '2024-01-31',
  total_revenue: 27250,
  total_bookings: 46,
  services: [
    { service_type: 'Culinary', service_name: 'Private Chef', total_revenue: 12500, bookings_count: 18, average_price: 694.44, trend: 15.2 },
    { service_type: 'Wellness', service_name: 'Spa & Massage', total_revenue: 8200, bookings_count: 24, average_price: 341.67, trend: 8.5 },
    { service_type: 'Adventure', service_name: 'Yacht Charter', total_revenue: 6550, bookings_count: 4, average_price: 1637.50, trend: -3.2 },
  ],
  by_month: [
    { month: '2024-01', revenue: 27250, bookings: 46 },
  ],
  top_properties: [
    { property_id: '1', property_name: 'Ocean View Villa', revenue: 9800, bookings: 15 },
    { property_id: '2', property_name: 'Mountain Retreat', revenue: 7200, bookings: 12 },
    { property_id: '4', property_name: 'Beachfront Condo', revenue: 5500, bookings: 10 },
  ],
};

const MOCK_SERVICE_PROVIDER: ServiceProviderData = {
  provider_id: 'prov-1',
  provider_name: 'Chef Marco Rossi',
  provider_email: 'marco@privatechef.com',
  provider_phone: '+1 (555) 123-4567',
  service_type: 'Private Chef',
  period_start: '2024-01-01',
  period_end: '2024-01-31',
  jobs: [
    { job_id: 'J001', date: '2024-01-05', property_name: 'Ocean View Villa', guest_name: 'John Smith', service_details: 'Italian Dinner for 4', amount: 450, tip: 90, status: 'completed' },
    { job_id: 'J002', date: '2024-01-08', property_name: 'Mountain Retreat', guest_name: 'Sarah Johnson', service_details: 'Brunch for 6', amount: 380, tip: 50, status: 'completed' },
    { job_id: 'J003', date: '2024-01-12', property_name: 'Beachfront Condo', guest_name: 'Michael Chen', service_details: 'Seafood Dinner for 8', amount: 720, tip: 100, status: 'completed' },
    { job_id: 'J004', date: '2024-01-15', property_name: 'Ocean View Villa', guest_name: 'Emily Davis', service_details: 'Anniversary Dinner for 2', amount: 350, tip: 75, status: 'completed' },
    { job_id: 'J005', date: '2024-01-20', property_name: 'Lakeside Cabin', guest_name: 'David Wilson', service_details: 'BBQ for 10', amount: 550, status: 'completed' },
    { job_id: 'J006', date: '2024-01-25', property_name: 'Downtown Loft', guest_name: 'Lisa Brown', service_details: 'Cooking Class', amount: 280, tip: 40, status: 'completed' },
  ],
  total_revenue: 2730,
  total_jobs: 6,
  commission_rate: 15,
  commission_amount: 409.50,
  net_payout: 2675.50, // includes tips
  average_job_value: 455,
};

const MOCK_OCCUPANCY: OccupancyReportData = {
  period_start: '2024-01-01',
  period_end: '2024-01-31',
  overall_occupancy: 78.5,
  total_available_nights: 155,
  total_booked_nights: 122,
  properties: [
    { property_id: '1', property_name: 'Ocean View Villa', property_address: '123 Coastal Drive', occupancy_rate: 92, available_nights: 31, booked_nights: 28, blocked_nights: 0, revenue: 12600, average_daily_rate: 450 },
    { property_id: '2', property_name: 'Mountain Retreat', property_address: '456 Highland Road', occupancy_rate: 85, available_nights: 31, booked_nights: 26, blocked_nights: 2, revenue: 15600, average_daily_rate: 600 },
    { property_id: '3', property_name: 'Downtown Loft', property_address: '789 Main Street', occupancy_rate: 78, available_nights: 31, booked_nights: 24, blocked_nights: 0, revenue: 6000, average_daily_rate: 250 },
    { property_id: '4', property_name: 'Beachfront Condo', property_address: '321 Beach Blvd', occupancy_rate: 73, available_nights: 31, booked_nights: 22, blocked_nights: 3, revenue: 7700, average_daily_rate: 350 },
    { property_id: '5', property_name: 'Lakeside Cabin', property_address: '654 Lake Road', occupancy_rate: 65, available_nights: 31, booked_nights: 20, blocked_nights: 0, revenue: 5000, average_daily_rate: 250 },
  ],
  by_month: [
    { month: '2024-01', occupancy: 78.5, nights_booked: 122 },
  ],
};

const MOCK_PERFORMANCE: PerformanceReportData = {
  current_period: {
    start: '2024-01-01',
    end: '2024-01-31',
    label: 'January 2024',
    total_revenue: 45800,
    total_bookings: 24,
    average_daily_rate: 385,
    occupancy_rate: 78.5,
    total_nights: 122,
  },
  previous_period: {
    start: '2023-12-01',
    end: '2023-12-31',
    label: 'December 2023',
    total_revenue: 42300,
    total_bookings: 22,
    average_daily_rate: 365,
    occupancy_rate: 72.3,
    total_nights: 116,
  },
  comparison_type: 'month',
  metrics_comparison: [
    { metric: 'Total Revenue', current_value: 45800, previous_value: 42300, change: 3500, change_percentage: 8.3, trend: 'up' },
    { metric: 'Total Bookings', current_value: 24, previous_value: 22, change: 2, change_percentage: 9.1, trend: 'up' },
    { metric: 'Average Daily Rate', current_value: 385, previous_value: 365, change: 20, change_percentage: 5.5, trend: 'up' },
    { metric: 'Occupancy Rate', current_value: 78.5, previous_value: 72.3, change: 6.2, change_percentage: 8.6, trend: 'up' },
  ],
  revenue_trend: [
    { date: 'Week 1', current: 11500, previous: 10200 },
    { date: 'Week 2', current: 12300, previous: 11800 },
    { date: 'Week 3', current: 10800, previous: 9500 },
    { date: 'Week 4', current: 11200, previous: 10800 },
  ],
  occupancy_trend: [
    { date: 'Week 1', current: 82, previous: 75 },
    { date: 'Week 2', current: 85, previous: 78 },
    { date: 'Week 3', current: 72, previous: 68 },
    { date: 'Week 4', current: 75, previous: 68 },
  ],
};

const MOCK_SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'sched-1',
    report_type: 'owner-statement',
    name: 'Monthly Owner Statement',
    frequency: 'monthly',
    next_run: '2024-02-01',
    last_run: '2024-01-01',
    recipients: ['owner@email.com', 'accountant@email.com'],
    filters: { from: '', to: '', ownerIds: ['owner-1'] },
    created_at: '2023-06-15',
    is_active: true,
  },
  {
    id: 'sched-2',
    report_type: 'booking-summary',
    name: 'Weekly Booking Summary',
    frequency: 'weekly',
    next_run: '2024-02-05',
    last_run: '2024-01-29',
    recipients: ['manager@str.com'],
    filters: { from: '', to: '' },
    created_at: '2023-08-20',
    is_active: true,
  },
];

// --- API Functions ---

/**
 * Fetch Owner Statement Report
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/reports/owner-statement
 * Query params: from, to, propertyIds (comma-separated), ownerIds (comma-separated)
 */
export async function fetchOwnerStatement(filters: ReportFilters): Promise<ReportResponse<OwnerStatementData>> {
  // TODO: [ADARSH] Uncomment when backend is ready:
  // const params = new URLSearchParams({ from: filters.from, to: filters.to });
  // if (filters.propertyIds?.length) params.append('propertyIds', filters.propertyIds.join(','));
  // if (filters.ownerIds?.length) params.append('ownerIds', filters.ownerIds.join(','));
  // return apiClient.get<ReportResponse<OwnerStatementData>>(`${ENDPOINTS.REPORTS.OWNER_STATEMENT}?${params}`);

  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    data: MOCK_OWNER_STATEMENT,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Fetch Booking Summary Report
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/reports/booking-summary
 */
export async function fetchBookingSummary(filters: ReportFilters): Promise<ReportResponse<BookingSummaryData>> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    data: MOCK_BOOKING_SUMMARY,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Fetch Service Revenue Report
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/reports/service-revenue
 */
export async function fetchServiceRevenue(filters: ReportFilters): Promise<ReportResponse<ServiceRevenueData>> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    data: MOCK_SERVICE_REVENUE,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Fetch Service Provider Report
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/reports/service-provider
 * Query params: from, to, providerId
 */
export async function fetchServiceProvider(filters: ReportFilters): Promise<ReportResponse<ServiceProviderData>> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    data: MOCK_SERVICE_PROVIDER,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Fetch Occupancy Report
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/reports/occupancy
 */
export async function fetchOccupancyReport(filters: ReportFilters): Promise<ReportResponse<OccupancyReportData>> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    data: MOCK_OCCUPANCY,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Fetch Performance Report
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/reports/performance
 * Query params: from, to, comparison (month|quarter|year)
 */
export async function fetchPerformanceReport(filters: ReportFilters): Promise<ReportResponse<PerformanceReportData>> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    data: MOCK_PERFORMANCE,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Send report via email
 * TODO: [ADARSH] Connect to backend API at POST /api/v1/reports/send-email
 * Body: { reportType, filters, recipients[], subject?, message?, attachPdf }
 */
export async function sendReportEmail(request: EmailReportRequest & { pdf_base64?: string }): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`${ENDPOINTS.REPORTS.SEND_EMAIL}`, request);
}

/**
 * Fetch scheduled reports
 * TODO: [ADARSH] Connect to backend API at GET /api/v1/reports/scheduled
 */
export async function fetchScheduledReports(): Promise<ScheduledReportsResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    success: true,
    data: MOCK_SCHEDULED_REPORTS,
  };
}

/**
 * Create a scheduled report
 * TODO: [ADARSH] Connect to backend API at POST /api/v1/reports/scheduled
 */
export async function createScheduledReport(data: {
  report_type: ReportType;
  name: string;
  frequency: ScheduleFrequency;
  recipients: string[];
  filters: ReportFilters;
}): Promise<{ success: boolean; data: ScheduledReport }> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const newReport: ScheduledReport = {
    id: `sched-${Date.now()}`,
    ...data,
    next_run: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    is_active: true,
  };
  return { success: true, data: newReport };
}

/**
 * Delete a scheduled report
 * TODO: [ADARSH] Connect to backend API at DELETE /api/v1/reports/scheduled/:id
 */
export async function deleteScheduledReport(id: string): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}

/**
 * Toggle scheduled report active status
 * TODO: [ADARSH] Connect to backend API at PATCH /api/v1/reports/scheduled/:id
 */
export async function toggleScheduledReport(id: string, isActive: boolean): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}

// --- React Query Hooks ---

export function useOwnerStatementQuery(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<ReportResponse<OwnerStatementData>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ReportResponse<OwnerStatementData>, Error>({
    queryKey: ['report', 'owner-statement', filters],
    queryFn: () => fetchOwnerStatement(filters),
    staleTime: 5 * 60_000, // 5 minutes
    ...options,
  });
}

export function useBookingSummaryQuery(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<ReportResponse<BookingSummaryData>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ReportResponse<BookingSummaryData>, Error>({
    queryKey: ['report', 'booking-summary', filters],
    queryFn: () => fetchBookingSummary(filters),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useServiceRevenueQuery(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<ReportResponse<ServiceRevenueData>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ReportResponse<ServiceRevenueData>, Error>({
    queryKey: ['report', 'service-revenue', filters],
    queryFn: () => fetchServiceRevenue(filters),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useServiceProviderQuery(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<ReportResponse<ServiceProviderData>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ReportResponse<ServiceProviderData>, Error>({
    queryKey: ['report', 'service-provider', filters],
    queryFn: () => fetchServiceProvider(filters),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useOccupancyReportQuery(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<ReportResponse<OccupancyReportData>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ReportResponse<OccupancyReportData>, Error>({
    queryKey: ['report', 'occupancy', filters],
    queryFn: () => fetchOccupancyReport(filters),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function usePerformanceReportQuery(
  filters: ReportFilters,
  options?: Omit<UseQueryOptions<ReportResponse<PerformanceReportData>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ReportResponse<PerformanceReportData>, Error>({
    queryKey: ['report', 'performance', filters],
    queryFn: () => fetchPerformanceReport(filters),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useScheduledReportsQuery(
  options?: Omit<UseQueryOptions<ScheduledReportsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ScheduledReportsResponse, Error>({
    queryKey: ['scheduled-reports'],
    queryFn: fetchScheduledReports,
    staleTime: 60_000,
    ...options,
  });
}

export function useSendReportEmailMutation(
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, EmailReportRequest>
) {
  return useMutation<{ success: boolean; message: string }, Error, EmailReportRequest>({
    mutationFn: sendReportEmail,
    ...options,
  });
}

export function useCreateScheduledReportMutation(
  options?: UseMutationOptions<{ success: boolean; data: ScheduledReport }, Error, {
    report_type: ReportType;
    name: string;
    frequency: ScheduleFrequency;
    recipients: string[];
    filters: ReportFilters;
  }>
) {
  return useMutation({
    mutationFn: createScheduledReport,
    ...options,
  });
}

export function useDeleteScheduledReportMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  return useMutation({
    mutationFn: deleteScheduledReport,
    ...options,
  });
}

export function useToggleScheduledReportMutation(
  options?: UseMutationOptions<{ success: boolean }, Error, { id: string; isActive: boolean }>
) {
  return useMutation({
    mutationFn: ({ id, isActive }) => toggleScheduledReport(id, isActive),
    ...options,
  });
}
