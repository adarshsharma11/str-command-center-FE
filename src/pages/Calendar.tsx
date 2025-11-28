import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { mockBookings, mockProperties } from '@/lib/mockData';
import type { PlatformName } from '@/types';

export default function Calendar() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformName | 'all'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // TODO: INTEGRATION STUB: Replace with Supabase query
  const bookings = mockBookings.filter(b => {
    const matchesProperty = selectedProperty === 'all' || b.propertyId === selectedProperty;
    const matchesPlatform = selectedPlatform === 'all' || b.platform === selectedPlatform;
    return matchesProperty && matchesPlatform;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-500';
      case 'Reserved': return 'bg-blue-500';
      case 'Blocked': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'border-l-4 border-green-500';
      case 'Partial': return 'border-l-4 border-orange-500';
      case 'Unpaid': return 'border-l-4 border-destructive';
      default: return '';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Multi-Calendar</h1>
            <p className="text-muted-foreground">View and manage all reservations</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Reservation
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {mockProperties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedPlatform === 'Airbnb' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('Airbnb')}
                >
                  Airbnb
                </Button>
                <Button
                  variant={selectedPlatform === 'Vrbo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('Vrbo')}
                >
                  Vrbo
                </Button>
                <Button
                  variant={selectedPlatform === 'Direct' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('Direct')}
                >
                  Direct
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bookings List View (Simplified Calendar) */}
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-4 rounded-lg bg-card border border-border hover:shadow-md transition-shadow ${getPaymentColor(booking.paymentStatus)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(booking.reservationStatus)}>
                          {booking.reservationStatus}
                        </Badge>
                        <Badge variant="outline">{booking.platform}</Badge>
                        <Badge variant="secondary">{booking.paymentStatus}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground">{booking.guestName}</h3>
                      <p className="text-sm text-muted-foreground">{booking.propertyName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.checkIn.toLocaleDateString()} → {booking.checkOut.toLocaleDateString()}
                        <span className="ml-2">({booking.nights} nights)</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${booking.totalAmount}</p>
                      <p className="text-xs text-muted-foreground">
                        Paid: ${booking.paidAmount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm text-muted-foreground">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span className="text-sm text-muted-foreground">Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-green-500" />
                <span className="text-sm text-muted-foreground">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-orange-500" />
                <span className="text-sm text-muted-foreground">Partial Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-destructive" />
                <span className="text-sm text-muted-foreground">Unpaid</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
