import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, BarChart3, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { PerformanceReportData, MetricComparison } from '@/types/reports';
import { cn } from '@/lib/utils';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface PerformancePreviewProps {
  data: PerformanceReportData;
}

const MONTHS = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

// Generate years from 2020 to current year
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2019 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
})).reverse();

// TODO: [ADARSH] This function generates mock data for comparison periods
// Replace with actual API call that accepts comparison period parameters
function generateComparisonData(
  currentData: PerformanceReportData,
  comparisonMonth: number,
  comparisonYear: number
): PerformanceReportData {
  const comparisonDate = new Date(comparisonYear, comparisonMonth, 1);
  const monthStart = startOfMonth(comparisonDate);
  const monthEnd = endOfMonth(comparisonDate);
  const monthLabel = format(comparisonDate, 'MMMM yyyy');

  // Generate slightly varied mock data for the comparison period
  const varianceFactor = 0.85 + Math.random() * 0.2; // 85% to 105% of current
  const prevRevenue = Math.round(currentData.current_period.total_revenue * varianceFactor);
  const prevBookings = Math.round(currentData.current_period.total_bookings * varianceFactor);
  const prevADR = Math.round(currentData.current_period.average_daily_rate * varianceFactor);
  const prevOccupancy = Math.round(currentData.current_period.occupancy_rate * varianceFactor * 10) / 10;
  const prevNights = Math.round(currentData.current_period.total_nights * varianceFactor);

  // Calculate changes
  const revenueChange = currentData.current_period.total_revenue - prevRevenue;
  const revenuePct = prevRevenue > 0 ? ((revenueChange / prevRevenue) * 100) : 0;
  const bookingsChange = currentData.current_period.total_bookings - prevBookings;
  const bookingsPct = prevBookings > 0 ? ((bookingsChange / prevBookings) * 100) : 0;
  const adrChange = currentData.current_period.average_daily_rate - prevADR;
  const adrPct = prevADR > 0 ? ((adrChange / prevADR) * 100) : 0;
  const occChange = currentData.current_period.occupancy_rate - prevOccupancy;
  const occPct = prevOccupancy > 0 ? ((occChange / prevOccupancy) * 100) : 0;

  return {
    ...currentData,
    previous_period: {
      start: format(monthStart, 'yyyy-MM-dd'),
      end: format(monthEnd, 'yyyy-MM-dd'),
      label: monthLabel,
      total_revenue: prevRevenue,
      total_bookings: prevBookings,
      average_daily_rate: prevADR,
      occupancy_rate: prevOccupancy,
      total_nights: prevNights,
    },
    metrics_comparison: [
      {
        metric: 'Total Revenue',
        current_value: currentData.current_period.total_revenue,
        previous_value: prevRevenue,
        change: revenueChange,
        change_percentage: Math.round(revenuePct * 10) / 10,
        trend: revenuePct >= 0 ? 'up' : 'down'
      },
      {
        metric: 'Total Bookings',
        current_value: currentData.current_period.total_bookings,
        previous_value: prevBookings,
        change: bookingsChange,
        change_percentage: Math.round(bookingsPct * 10) / 10,
        trend: bookingsPct >= 0 ? 'up' : 'down'
      },
      {
        metric: 'Average Daily Rate',
        current_value: currentData.current_period.average_daily_rate,
        previous_value: prevADR,
        change: adrChange,
        change_percentage: Math.round(adrPct * 10) / 10,
        trend: adrPct >= 0 ? 'up' : 'down'
      },
      {
        metric: 'Occupancy Rate',
        current_value: currentData.current_period.occupancy_rate,
        previous_value: prevOccupancy,
        change: Math.round(occChange * 10) / 10,
        change_percentage: Math.round(occPct * 10) / 10,
        trend: occPct >= 0 ? 'up' : 'down'
      },
    ],
    revenue_trend: [
      { date: 'Week 1', current: currentData.revenue_trend[0]?.current || 11500, previous: Math.round((currentData.revenue_trend[0]?.current || 11500) * varianceFactor) },
      { date: 'Week 2', current: currentData.revenue_trend[1]?.current || 12300, previous: Math.round((currentData.revenue_trend[1]?.current || 12300) * varianceFactor) },
      { date: 'Week 3', current: currentData.revenue_trend[2]?.current || 10800, previous: Math.round((currentData.revenue_trend[2]?.current || 10800) * varianceFactor) },
      { date: 'Week 4', current: currentData.revenue_trend[3]?.current || 11200, previous: Math.round((currentData.revenue_trend[3]?.current || 11200) * varianceFactor) },
    ],
    occupancy_trend: [
      { date: 'Week 1', current: currentData.occupancy_trend[0]?.current || 82, previous: Math.round((currentData.occupancy_trend[0]?.current || 82) * varianceFactor) },
      { date: 'Week 2', current: currentData.occupancy_trend[1]?.current || 85, previous: Math.round((currentData.occupancy_trend[1]?.current || 85) * varianceFactor) },
      { date: 'Week 3', current: currentData.occupancy_trend[2]?.current || 72, previous: Math.round((currentData.occupancy_trend[2]?.current || 72) * varianceFactor) },
      { date: 'Week 4', current: currentData.occupancy_trend[3]?.current || 75, previous: Math.round((currentData.occupancy_trend[3]?.current || 75) * varianceFactor) },
    ],
  };
}

const chartConfig: ChartConfig = {
  current: { label: 'Current Period', color: 'hsl(var(--chart-1))' },
  previous: { label: 'Previous Period', color: 'hsl(var(--chart-2))' },
};

function getTrendIcon(trend: 'up' | 'down' | 'neutral') {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

function getTrendColor(trend: 'up' | 'down' | 'neutral') {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
}

function formatMetricValue(metric: string, value: number): string {
  if (metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('rate')) {
    return formatCurrency(value);
  }
  if (metric.toLowerCase().includes('occupancy')) {
    return `${value}%`;
  }
  return value.toString();
}

export function PerformancePreview({ data }: PerformancePreviewProps) {
  // Defensive checks for data
  const currentPeriod = data?.current_period || {
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    label: 'Current Period',
    total_revenue: 0,
    total_bookings: 0,
    average_daily_rate: 0,
    occupancy_rate: 0,
    total_nights: 0
  };

  // Default to previous month from current period
  const defaultPrevMonth = subMonths(new Date(currentPeriod.start), 1);
  const [comparisonMonth, setComparisonMonth] = useState<string>(String(defaultPrevMonth.getMonth()));
  const [comparisonYear, setComparisonYear] = useState<string>(String(defaultPrevMonth.getFullYear()));

  // Generate comparison data based on selected month/year
  const comparisonData = useMemo(() => {
    return generateComparisonData(data, parseInt(comparisonMonth), parseInt(comparisonYear));
  }, [data, comparisonMonth, comparisonYear]);

  const metricsComparison = comparisonData?.metrics_comparison || [];
  const revenueTrend = comparisonData?.revenue_trend || [];
  const occupancyTrend = comparisonData?.occupancy_trend || [];

  return (
    <div className="space-y-6">
      {/* Period Comparison Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Badge variant="default">Current Period</Badge>
              <p className="text-lg font-semibold mt-2">{comparisonData.current_period.label}</p>
              <p className="text-sm text-muted-foreground">
                {comparisonData.current_period.start} - {comparisonData.current_period.end}
              </p>
            </div>
            <div className="space-y-1 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Compare To</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select value={comparisonMonth} onValueChange={setComparisonMonth}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={comparisonYear} onValueChange={setComparisonYear}>
                  <SelectTrigger className="w-[90px] h-9">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {comparisonData.previous_period.start} - {comparisonData.previous_period.end}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsComparison.map((metric) => (
          <Card key={metric.metric}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{metric.metric}</span>
                {getTrendIcon(metric.trend)}
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatMetricValue(metric.metric, metric.current_value)}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn('text-xs', getTrendColor(metric.trend))}
                  >
                    {metric.change_percentage >= 0 ? '+' : ''}
                    {metric.change_percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Previous:</span>
                  <span className="font-medium">
                    {formatMetricValue(metric.metric, metric.previous_value)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Trends Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Revenue Comparison Trend
              <Badge variant="outline" className="font-normal text-xs">
                {comparisonData.current_period.label} vs {comparisonData.previous_period.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueTrend.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity="0.1"/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity="0.1"/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [
                            formatCurrency(value as number),
                            name === 'current' ? comparisonData.current_period.label : comparisonData.previous_period.label,
                          ]}
                        />
                      }
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="current"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#colorCurrent)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="previous"
                      stroke="hsl(var(--chart-2))"
                      fillOpacity={1}
                      fill="url(#colorPrevious)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No revenue trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Occupancy Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Occupancy Comparison Trend
              <Badge variant="outline" className="font-normal text-xs">
                {comparisonData.current_period.label} vs {comparisonData.previous_period.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {occupancyTrend.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [
                            `${value}%`,
                            name === 'current' ? comparisonData.current_period.label : comparisonData.previous_period.label,
                          ]}
                        />
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No occupancy trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Period Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Current Period</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(comparisonData.current_period.total_revenue)}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Total Bookings</span>
                  <span className="font-medium">{comparisonData.current_period.total_bookings}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Average Daily Rate</span>
                  <span className="font-medium">{formatCurrency(comparisonData.current_period.average_daily_rate)}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Occupancy Rate</span>
                  <span className="font-medium">{comparisonData.current_period.occupancy_rate}%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Total Nights</span>
                  <span className="font-medium">{comparisonData.current_period.total_nights}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">{comparisonData.previous_period.label}</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(comparisonData.previous_period.total_revenue)}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Total Bookings</span>
                  <span className="font-medium">{comparisonData.previous_period.total_bookings}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Average Daily Rate</span>
                  <span className="font-medium">{formatCurrency(comparisonData.previous_period.average_daily_rate)}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Occupancy Rate</span>
                  <span className="font-medium">{comparisonData.previous_period.occupancy_rate}%</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">Total Nights</span>
                  <span className="font-medium">{comparisonData.previous_period.total_nights}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
