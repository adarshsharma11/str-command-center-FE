import { Building2, DollarSign, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/dashboardCalculations';
import type { OwnerStatementData } from '@/types/reports';
import { format, parseISO } from 'date-fns';

interface OwnerStatementPreviewProps {
  data: OwnerStatementData;
}

// TODO: [INTERN] Replace with actual services data from API
const MOCK_SERVICES_BY_PROPERTY: Record<string, { name: string; revenue: number; bookings: number }[]> = {
  '1': [
    { name: 'Private Chef', revenue: 1800, bookings: 3 },
    { name: 'Spa & Massage', revenue: 900, bookings: 2 },
  ],
  '2': [
    { name: 'Private Chef', revenue: 1200, bookings: 2 },
    { name: 'Ski Guide', revenue: 600, bookings: 1 },
  ],
};

export function OwnerStatementPreview({ data }: OwnerStatementPreviewProps) {
  // Calculate total services revenue
  const totalServicesRevenue = data.properties.reduce((sum, p) => {
    const services = MOCK_SERVICES_BY_PROPERTY[p.property_id] || [];
    return sum + services.reduce((s, svc) => s + svc.revenue, 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Statement Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Owner Statement</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {format(parseISO(data.period_start), 'MMMM d, yyyy')} -{' '}
                {format(parseISO(data.period_end), 'MMMM d, yyyy')}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {data.properties.length} Properties
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{data.owner_name}</p>
              <p className="text-sm text-muted-foreground">{data.owner_email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(data.total_revenue + totalServicesRevenue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Net Payout</p>
                <p className="text-lg font-bold">{formatCurrency(data.total_payout)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Rental Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.total_revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Services</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalServicesRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Expenses</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.total_expenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Mgmt Fee ({data.management_fee_percentage}%)
              </span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.management_fee)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Property Breakdown */}
      {data.properties.map((property) => {
        const services = MOCK_SERVICES_BY_PROPERTY[property.property_id] || [];
        const servicesTotal = services.reduce((sum, s) => sum + s.revenue, 0);

        return (
          <Card key={property.property_id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{property.property_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{property.property_address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Net Revenue</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(property.net_revenue + servicesTotal)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Occupancy</p>
                  <p className="font-semibold">{property.occupancy_rate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Nights Booked</p>
                  <p className="font-semibold">{property.nights_booked}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Avg Daily Rate</p>
                  <p className="font-semibold">{formatCurrency(property.average_daily_rate)}</p>
                </div>
              </div>

              {/* Bookings Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-center">Nights</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.bookings.map((booking) => (
                    <TableRow key={booking.booking_id}>
                      <TableCell className="font-medium">{booking.guest_name}</TableCell>
                      <TableCell className="text-sm">
                        {format(parseISO(booking.check_in), 'MMM d')} -{' '}
                        {format(parseISO(booking.check_out), 'MMM d')}
                      </TableCell>
                      <TableCell className="text-center">{booking.nights}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {booking.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(booking.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Services rows integrated into bookings table */}
                  {services.map((service, idx) => (
                    <TableRow key={`service-${idx}`} className="bg-purple-50/50 dark:bg-purple-900/10">
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          {service.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {service.bookings} booking{service.bookings > 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                          Service
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-purple-600">
                        {formatCurrency(service.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator />

              {/* Property Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rental Revenue</span>
                    <span className="font-medium">{formatCurrency(property.total_revenue)}</span>
                  </div>
                  {servicesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Services Revenue</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(servicesTotal)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Channel Fees</span>
                    <span className="font-medium text-red-500">
                      -{formatCurrency(property.channel_fees)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cleaning</span>
                    <span className="font-medium text-red-500">
                      -{formatCurrency(property.cleaning_expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance</span>
                    <span className="font-medium text-red-500">
                      -{formatCurrency(property.maintenance_expenses)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
