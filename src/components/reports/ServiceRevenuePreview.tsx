import { Sparkles, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { ServiceRevenueData } from '@/types/reports';
import { cn } from '@/lib/utils';

interface ServiceRevenuePreviewProps {
  data: ServiceRevenueData;
}

const chartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
  bookings: { label: 'Bookings', color: 'hsl(var(--chart-2))' },
};

const SERVICE_ICONS: Record<string, string> = {
  'Culinary': '👨‍🍳',
  'Wellness': '💆',
  'Adventure': '⛵',
  'Transportation': '🚗',
  'Entertainment': '🎭',
};

export function ServiceRevenuePreview({ data }: ServiceRevenuePreviewProps) {
  const maxRevenue = Math.max(...data.services.map((s) => s.total_revenue));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.total_revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Bookings</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.total_bookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Service Types</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.services.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Service Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.services.map((service) => (
            <div key={service.service_name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {SERVICE_ICONS[service.service_type] || '✨'}
                  </span>
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.bookings_count} bookings · Avg {formatCurrency(service.average_price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex items-center gap-1',
                      service.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {service.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {service.trend >= 0 ? '+' : ''}{service.trend}%
                  </Badge>
                  <span className="font-semibold min-w-[80px] text-right">
                    {formatCurrency(service.total_revenue)}
                  </span>
                </div>
              </div>
              <Progress
                value={(service.total_revenue / maxRevenue) * 100}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.by_month}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(v) => formatCompactCurrency(v)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value as number) : value,
                          name === 'revenue' ? 'Revenue' : 'Bookings',
                        ]}
                      />
                    }
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Properties for Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_properties} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} />
                  <YAxis
                    type="category"
                    dataKey="property_name"
                    width={100}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => v.length > 15 ? v.slice(0, 13) + '...' : v}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    }
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
