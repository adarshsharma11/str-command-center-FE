import { Loader2 } from 'lucide-react';
import type { ReportType, ReportFilters } from '@/types/reports';
import { OwnerStatementPreview } from './OwnerStatementPreview';
import { BookingSummaryPreview } from './BookingSummaryPreview';
import { ServiceRevenuePreview } from './ServiceRevenuePreview';
import { ServiceProviderPreview } from './ServiceProviderPreview';
import { OccupancyPreview } from './OccupancyPreview';
import { PerformancePreview } from './PerformancePreview';
import {
  useOwnerStatementQuery,
  useBookingSummaryQuery,
  useServiceRevenueQuery,
  useServiceProviderQuery,
  useOccupancyReportQuery,
  usePerformanceReportQuery,
} from '@/lib/api/reports';

interface ReportPreviewProps {
  reportType: ReportType;
  filters: ReportFilters;
}

export function ReportPreview({ reportType, filters }: ReportPreviewProps) {
  // Fetch appropriate report data based on type
  const ownerStatement = useOwnerStatementQuery(filters, { enabled: reportType === 'owner-statement' });
  const bookingSummary = useBookingSummaryQuery(filters, { enabled: reportType === 'booking-summary' });
  const serviceRevenue = useServiceRevenueQuery(filters, { enabled: reportType === 'service-revenue' });
  const serviceProvider = useServiceProviderQuery(filters, { enabled: reportType === 'service-provider' });
  const occupancy = useOccupancyReportQuery(filters, { enabled: reportType === 'occupancy' });
  const performance = usePerformanceReportQuery(filters, { enabled: reportType === 'performance' });

  // Determine loading and error states
  const isLoading = {
    'owner-statement': ownerStatement.isLoading,
    'booking-summary': bookingSummary.isLoading,
    'service-revenue': serviceRevenue.isLoading,
    'service-provider': serviceProvider.isLoading,
    'occupancy': occupancy.isLoading,
    'performance': performance.isLoading,
  }[reportType];

  const error = {
    'owner-statement': ownerStatement.error,
    'booking-summary': bookingSummary.error,
    'service-revenue': serviceRevenue.error,
    'service-provider': serviceProvider.error,
    'occupancy': occupancy.error,
    'performance': performance.error,
  }[reportType];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load report: {error.message}</p>
      </div>
    );
  }

  // Render appropriate preview component
  switch (reportType) {
    case 'owner-statement':
      return ownerStatement.data?.data ? (
        <OwnerStatementPreview data={ownerStatement.data.data} />
      ) : null;

    case 'booking-summary':
      return bookingSummary.data?.data ? (
        <BookingSummaryPreview data={bookingSummary.data.data} />
      ) : null;

    case 'service-revenue':
      return serviceRevenue.data?.data ? (
        <ServiceRevenuePreview data={serviceRevenue.data.data} />
      ) : null;

    case 'service-provider':
      return serviceProvider.data?.data ? (
        <ServiceProviderPreview data={serviceProvider.data.data} />
      ) : null;

    case 'occupancy':
      return occupancy.data?.data ? (
        <OccupancyPreview data={occupancy.data.data} />
      ) : null;

    case 'performance':
      return performance.data?.data ? (
        <PerformancePreview data={performance.data.data} />
      ) : null;

    default:
      return null;
  }
}
