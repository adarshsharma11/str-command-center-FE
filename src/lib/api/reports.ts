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

// --- API Functions ---

/**
 * Fetch Owners List for Filters
 */
export async function fetchOwners(): Promise<{ success: boolean; data: { id: number; first_name: string; last_name: string; email: string }[] }> {
  return apiClient.get(ENDPOINTS.AUTH.OWNERS);
}

/**
 * Fetch Owner Statement Report
 */
export async function fetchOwnerStatement(filters: ReportFilters): Promise<ReportResponse<OwnerStatementData>> {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.propertyIds?.length) params.append('propertyIds', filters.propertyIds.join(','));
  if (filters.ownerIds?.length) params.append('ownerIds', filters.ownerIds.join(','));
  
  return apiClient.get<ReportResponse<OwnerStatementData>>(`${ENDPOINTS.REPORTS.OWNER_STATEMENT}?${params}`);
}

/**
 * Fetch Booking Summary Report
 */
export async function fetchBookingSummary(filters: ReportFilters): Promise<ReportResponse<BookingSummaryData>> {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.propertyIds?.length) params.append('propertyIds', filters.propertyIds.join(','));
  
  return apiClient.get<ReportResponse<BookingSummaryData>>(`${ENDPOINTS.REPORTS.BOOKING_SUMMARY}?${params}`);
}

/**
 * Fetch Service Revenue Report
 */
export async function fetchServiceRevenue(filters: ReportFilters): Promise<ReportResponse<ServiceRevenueData>> {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.propertyIds?.length) params.append('propertyIds', filters.propertyIds.join(','));
  
  return apiClient.get<ReportResponse<ServiceRevenueData>>(`${ENDPOINTS.REPORTS.SERVICE_REVENUE}?${params}`);
}

/**
 * Fetch Service Provider Report
 */
export async function fetchServiceProvider(filters: ReportFilters): Promise<ReportResponse<ServiceProviderData>> {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.providerId) params.append('providerId', filters.providerId);
  
  return apiClient.get<ReportResponse<ServiceProviderData>>(`${ENDPOINTS.REPORTS.SERVICE_PROVIDER}?${params}`);
}

/**
 * Fetch Occupancy Report
 */
export async function fetchOccupancyReport(filters: ReportFilters): Promise<ReportResponse<OccupancyReportData>> {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.propertyIds?.length) params.append('propertyIds', filters.propertyIds.join(','));
  
  return apiClient.get<ReportResponse<OccupancyReportData>>(`${ENDPOINTS.REPORTS.OCCUPANCY}?${params}`);
}

/**
 * Fetch Performance Report
 */
export async function fetchPerformanceReport(filters: ReportFilters): Promise<ReportResponse<PerformanceReportData>> {
  const params = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.propertyIds?.length) params.append('propertyIds', filters.propertyIds.join(','));
  
  return apiClient.get<ReportResponse<PerformanceReportData>>(`${ENDPOINTS.REPORTS.PERFORMANCE}?${params}`);
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
  return apiClient.get(ENDPOINTS.REPORTS.SCHEDULED);
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
  return apiClient.post(ENDPOINTS.REPORTS.SCHEDULED, data);
}

/**
 * Delete a scheduled report
 * TODO: [ADARSH] Connect to backend API at DELETE /api/v1/reports/scheduled/:id
 */
export async function deleteScheduledReport(id: string): Promise<{ success: boolean }> {
  const url = ENDPOINTS.REPORTS.DELETE_SCHEDULED.replace(':id', id);
  return apiClient.delete(url);
}

/**
 * Toggle scheduled report active status
 * TODO: [ADARSH] Connect to backend API at PATCH /api/v1/reports/scheduled/:id
 */
export async function toggleScheduledReport(id: string, isActive: boolean): Promise<{ success: boolean }> {
  const url = ENDPOINTS.REPORTS.TOGGLE_SCHEDULED.replace(':id', id);
  return apiClient.patch(url, { is_active: isActive });
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
