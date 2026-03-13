import { Building2, Calendar, Moon, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { OccupancyReportData } from '@/types/reports';
import { cn } from '@/lib/utils';

interface OccupancyPreviewProps {
  data: OccupancyReportData;
}

const chartConfig: ChartConfig = {
  occupancy: { label: 'Occupancy %', color: 'hsl(var(--chart-1))' },
  nights: { label: 'Nights Booked', color: 'hsl(var(--chart-2))' },
};

function getOccupancyColor(rate: number): string {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getOccupancyBg(rate: number): string {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function OccupancyPreview({ data }: OccupancyPreviewProps) {
  const properties = data?.properties || [];
  const byMonth = data?.by_month || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Overall Occupancy</span>
            </div>
            <p className={cn('text-3xl font-bold mt-2', getOccupancyColor(data.overall_occupancy || 0))}>
              {data.overall_occupancy || 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Available Nights</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.total_available_nights || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Booked Nights</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.total_booked_nights || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Properties</span>
            </div>
            <p className="text-2xl font-bold mt-2">{properties.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy by Property Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupancy by Property</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={properties} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    type="category"
                    dataKey="property_name"
                    width={130}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => (v || '').length > 18 ? v.slice(0, 16) + '...' : (v || '')}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, _, props) => {
                          const item = props.payload;
                          return [
                            `${value}% (${item.booked_nights}/${item.available_nights} nights)`,
                            'Occupancy',
                          ];
                        }}
                      />
                    }
                  />
                  <Bar dataKey="occupancy_rate" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {properties.map((entry, index) => (
                      <rect
                        key={`bar-${index}`}
                        fill={entry.occupancy_rate >= 80 ? 'hsl(var(--chart-1))' : entry.occupancy_rate >= 60 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-5))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No occupancy data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="text-center">Occupancy</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-center">Booked</TableHead>
                <TableHead className="text-center">Blocked</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ADR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length > 0 ? (
                properties.map((property) => (
                  <TableRow key={property.property_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{property.property_name}</p>
                        <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {property.property_address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16">
                          <Progress
                            value={property.occupancy_rate}
                            className={cn('h-2', getOccupancyBg(property.occupancy_rate))}
                          />
                        </div>
                        <span className={cn('font-medium', getOccupancyColor(property.occupancy_rate))}>
                          {property.occupancy_rate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{property.available_nights}</TableCell>
                    <TableCell className="text-center font-medium text-green-600">
                      {property.booked_nights}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {property.blocked_nights}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(property.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(property.average_daily_rate)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No property data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      {byMonth.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === 'occupancy' ? `${value}%` : `${value} nights`,
                          name === 'occupancy' ? 'Occupancy' : 'Nights Booked',
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
