import {
  FileText,
  CalendarDays,
  Sparkles,
  BarChart3,
  TrendingUp,
  ArrowRight,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReportType } from '@/types/reports';

interface ReportTypeSelectorProps {
  onSelect: (type: ReportType) => void;
}

const REPORT_TYPES: {
  type: ReportType;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
}[] = [
  {
    type: 'owner-statement',
    title: 'Owner Statement',
    description: 'Revenue, expenses, and payout breakdown for property owners. Perfect for monthly owner reporting.',
    icon: FileText,
    color: 'text-blue-500',
  },
  {
    type: 'booking-summary',
    title: 'Booking Summary',
    description: 'Comprehensive list of all bookings with guest details, dates, and payment status.',
    icon: CalendarDays,
    color: 'text-green-500',
  },
  {
    type: 'service-revenue',
    title: 'Service Revenue',
    description: 'Breakdown of luxury services revenue including private chef, spa, yacht charters, and more.',
    icon: Sparkles,
    color: 'text-purple-500',
  },
  {
    type: 'service-provider',
    title: 'Service Provider Statement',
    description: 'Invoice-style statement for individual service providers showing jobs, earnings, and payouts.',
    icon: User,
    color: 'text-indigo-500',
  },
  {
    type: 'occupancy',
    title: 'Occupancy Report',
    description: 'Property occupancy rates, available nights, and booked nights analysis.',
    icon: BarChart3,
    color: 'text-orange-500',
  },
  {
    type: 'performance',
    title: 'Performance Comparison',
    description: 'Compare performance metrics month-over-month or year-over-year to track growth.',
    icon: TrendingUp,
    color: 'text-cyan-500',
  },
];

export function ReportTypeSelector({ onSelect }: ReportTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select Report Type</h2>
        <p className="text-sm text-muted-foreground">
          Choose the type of report you want to generate
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <Card
            key={report.type}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => onSelect(report.type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-muted ${report.color}`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base mt-3">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {report.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
