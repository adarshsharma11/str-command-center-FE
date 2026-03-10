import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { ReportPDFDocument, type ReportPDFData } from '@/components/reports/ReportPDF';
import type { ReportType, ReportFilters } from '@/types/reports';
import {
  fetchOwnerStatement,
  fetchBookingSummary,
  fetchServiceRevenue,
  fetchServiceProvider,
  fetchOccupancyReport,
  fetchPerformanceReport,
} from '@/lib/api/reports';

const REPORT_TITLES: Record<ReportType, string> = {
  'owner-statement': 'Owner-Statement',
  'booking-summary': 'Booking-Summary',
  'service-revenue': 'Service-Revenue',
  'service-provider': 'Service-Provider',
  'occupancy': 'Occupancy-Report',
  'performance': 'Performance-Comparison',
};

async function fetchReportData(reportType: ReportType, filters: ReportFilters): Promise<ReportPDFData> {
  switch (reportType) {
    case 'owner-statement': {
      const res = await fetchOwnerStatement(filters);
      return { type: 'owner-statement', data: res.data };
    }
    case 'booking-summary': {
      const res = await fetchBookingSummary(filters);
      return { type: 'booking-summary', data: res.data };
    }
    case 'service-revenue': {
      const res = await fetchServiceRevenue(filters);
      return { type: 'service-revenue', data: res.data };
    }
    case 'service-provider': {
      const res = await fetchServiceProvider(filters);
      return { type: 'service-provider', data: res.data };
    }
    case 'occupancy': {
      const res = await fetchOccupancyReport(filters);
      return { type: 'occupancy', data: res.data };
    }
    case 'performance': {
      const res = await fetchPerformanceReport(filters);
      return { type: 'performance', data: res.data };
    }
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}

export async function downloadReportPDF(reportType: ReportType, filters: ReportFilters): Promise<void> {
  const reportData = await fetchReportData(reportType, filters);
  const doc = createElement(ReportPDFDocument, { report: reportData });
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${REPORT_TITLES[reportType]}-${filters.from || 'report'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateReportPDFBase64(reportType: ReportType, filters: ReportFilters): Promise<string> {
  const reportData = await fetchReportData(reportType, filters);
  const doc = createElement(ReportPDFDocument, { report: reportData });
  const blob = await pdf(doc).toBlob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
