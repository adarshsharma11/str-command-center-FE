// Report type definitions for the Reports module

export type ReportType =
  | 'owner-statement'
  | 'booking-summary'
  | 'service-revenue'
  | 'service-provider'
  | 'occupancy'
  | 'performance';

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

export type ComparisonType = 'month' | 'quarter' | 'year';

export type ScheduleFrequency = 'weekly' | 'monthly' | 'quarterly';

// Owner Statement Report
export interface OwnerStatementData {
  owner_id: string;
  owner_name: string;
  owner_email: string;
  period_start: string;
  period_end: string;
  properties: OwnerPropertyStatement[];
  services_summary?: { name: string; count: number; revenue: number }[];
  rental_revenue: number;
  services_revenue: number;
  total_revenue: number;
  total_expenses: number;
  total_payout: number;
  management_fee: number;
  management_fee_percentage: number;
}

export interface OwnerPropertyStatement {
  property_id: string;
  property_name: string;
  property_address: string;
  bookings: OwnerBookingItem[];
  total_revenue: number;
  rental_revenue: number;
  services_revenue: number;
  channel_fees: number;
  cleaning_fees_collected: number;
  cleaning_expenses: number;
  maintenance_expenses: number;
  other_expenses: number;
  net_revenue: number;
  occupancy_rate: number;
  nights_booked: number;
  average_daily_rate: number;
  services_summary?: { name: string; count: number; revenue: number }[];
}

export interface OwnerBookingItem {
  booking_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  revenue: number;
  services_revenue?: number;
  services?: { service_id: string; service_name: string; price: number }[];
  channel: string;
  channel_fee: number;
  cleaning_fee: number;
}

// Booking Summary Report
export interface BookingSummaryData {
  period_start: string;
  period_end: string;
  total_bookings: number;
  total_revenue: number;
  total_nights: number;
  average_booking_value: number;
  bookings: BookingSummaryItem[];
  by_channel: { channel: string; count: number; revenue: number }[];
  by_property: { property_id: string; property_name: string; count: number; revenue: number }[];
}

export interface BookingSummaryItem {
  booking_id: string;
  property_name: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_amount: number;
  channel: string;
  status: string;
  payment_status: string;
  created_at: string;
}

// Service Revenue Report
export interface ServiceRevenueData {
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_bookings: number;
  services: ServiceRevenueItem[];
  by_month: { month: string; revenue: number; bookings: number }[];
  top_properties: { property_id: string; property_name: string; revenue: number; bookings: number }[];
}

export interface ServiceRevenueItem {
  service_type: string;
  service_name: string;
  total_revenue: number;
  bookings_count: number;
  average_price: number;
  trend: number; // percentage change from previous period
}

// Occupancy Report
export interface OccupancyReportData {
  period_start: string;
  period_end: string;
  overall_occupancy: number;
  total_available_nights: number;
  total_booked_nights: number;
  properties: PropertyOccupancyItem[];
  by_month: { month: string; occupancy: number; nights_booked: number }[];
}

export interface PropertyOccupancyItem {
  property_id: string;
  property_name: string;
  property_address: string;
  occupancy_rate: number;
  available_nights: number;
  booked_nights: number;
  blocked_nights: number;
  revenue: number;
  average_daily_rate: number;
}

// Service Provider Report (Invoice-style for individual providers)
export interface ServiceProviderData {
  provider_id: string;
  provider_name: string;
  provider_email: string;
  provider_phone?: string;
  service_type: string;
  period_start: string;
  period_end: string;
  jobs: ServiceProviderJob[];
  total_revenue: number;
  total_jobs: number;
  commission_rate: number;
  commission_amount: number;
  net_payout: number;
  average_job_value: number;
}

export interface ServiceProviderJob {
  job_id: string;
  date: string;
  property_name: string;
  guest_name: string;
  service_details: string;
  amount: number;
  tip?: number;
  status: 'completed' | 'pending' | 'cancelled';
}

// Performance Comparison Report
export interface PerformanceReportData {
  current_period: PerformancePeriod;
  previous_period: PerformancePeriod;
  comparison_type: ComparisonType;
  metrics_comparison: MetricComparison[];
  revenue_trend: { date: string; current: number; previous: number }[];
  occupancy_trend: { date: string; current: number; previous: number }[];
}

export interface PerformancePeriod {
  start: string;
  end: string;
  label: string;
  total_revenue: number;
  total_bookings: number;
  average_daily_rate: number;
  occupancy_rate: number;
  total_nights: number;
}

export interface MetricComparison {
  metric: string;
  current_value: number;
  previous_value: number;
  change: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

// Report Filters
export interface ReportFilters {
  from: string;
  to: string;
  propertyIds?: string[];
  ownerIds?: string[];
  comparison?: ComparisonType;
}

// Scheduled Report
export interface ScheduledReport {
  id: string;
  report_type: ReportType;
  name: string;
  frequency: ScheduleFrequency;
  next_run: string;
  last_run?: string;
  recipients: string[];
  filters: ReportFilters;
  created_at: string;
  is_active: boolean;
}

// Email Report Request
export interface EmailReportRequest {
  report_type: ReportType;
  filters: ReportFilters;
  recipients: string[];
  subject?: string;
  message?: string;
  attach_pdf: boolean;
}

// API Response Types
export interface ReportResponse<T> {
  success: boolean;
  data: T;
  generated_at: string;
}

export interface ScheduledReportsResponse {
  success: boolean;
  data: ScheduledReport[];
}
