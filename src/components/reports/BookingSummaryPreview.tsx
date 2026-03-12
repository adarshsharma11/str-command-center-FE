import { CalendarDays, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { BookingSummaryData } from '@/types/reports';
import { format, parseISO } from 'date-fns';

interface BookingSummaryPreviewProps {
  data: BookingSummaryData;
}

const CHANNEL_COLORS: Record<string, string> = {
  'Airbnb': 'hsl(350, 85%, 55%)',
  'Vrbo': 'hsl(210, 90%, 50%)',
  'Direct': 'hsl(150, 70%, 45%)',
  'Booking.com': 'hsl(215, 80%, 45%)',
};

const chartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
};

const STATUS_COLORS: Record<string, string> = {
  'Completed': 'bg-green-500/10 text-green-700 border-green-200',
  'Active': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'Upcoming': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'Cancelled': 'bg-red-500/10 text-red-700 border-red-200',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  'Paid': 'bg-green-500/10 text-green-700',
  'Partial': 'bg-yellow-500/10 text-yellow-700',
  'Pending': 'bg-orange-500/10 text-orange-700',
  'Refunded': 'bg-red-500/10 text-red-700',
};

export function BookingSummaryPreview({ data }: BookingSummaryPreviewProps) {
  const byChannel = data?.by_channel || [];
  const byProperty = data?.by_property || [];
  const bookings = data?.bookings || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Bookings</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.total_bookings || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.total_revenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Total Nights</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.total_nights || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Avg Booking Value</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.average_booking_value || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            {byChannel.length > 0 ? (
              <>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byChannel.map((c) => ({
                          ...c,
                          fill: CHANNEL_COLORS[c.channel] || 'hsl(var(--chart-1))',
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="revenue"
                        nameKey="channel"
                      >
                        {byChannel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.channel] || 'hsl(var(--chart-1))'} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatCurrency(value as number)}
                          />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {byChannel.map((channel) => (
                    <div key={channel.channel} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHANNEL_COLORS[channel.channel] }}
                      />
                      <span>{channel.channel}</span>
                      <span className="text-muted-foreground">({channel.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No channel data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Property */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Property</CardTitle>
          </CardHeader>
          <CardContent>
            {byProperty.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byProperty} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} />
                    <YAxis
                      type="category"
                      dataKey="property_name"
                      width={100}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => (v || '').length > 15 ? v.slice(0, 13) + '...' : (v || '')}
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
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No property data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-center">Nights</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {booking.property_name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.guest_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.guest_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(parseISO(booking.check_in), 'MMM d')} -{' '}
                      {format(parseISO(booking.check_out), 'MMM d')}
                    </TableCell>
                    <TableCell className="text-center">{booking.nights}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{ borderColor: CHANNEL_COLORS[booking.channel], color: CHANNEL_COLORS[booking.channel] }}
                      >
                        {booking.channel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[booking.status]}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={PAYMENT_STATUS_COLORS[booking.payment_status]}>
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(booking.total_amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
