import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { mockBookings } from '@/lib/mockData';

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // TODO: INTEGRATION STUB: Replace with Supabase query
  const bookings = mockBookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || b.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || b.reservationStatus === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const statusColors = {
    Confirmed: 'bg-green-500 text-white',
    Reserved: 'bg-blue-500 text-white',
    Blocked: 'bg-muted text-muted-foreground',
  };

  const paymentColors = {
    Paid: 'bg-green-500 text-white',
    Partial: 'bg-orange-500 text-white',
    Unpaid: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">View and manage all reservations</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by guest or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="Airbnb">Airbnb</SelectItem>
                  <SelectItem value="Vrbo">Vrbo</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Nights</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="font-medium">{booking.guestName}</TableCell>
                      <TableCell>{booking.propertyName}</TableCell>
                      <TableCell>{booking.checkIn.toLocaleDateString()}</TableCell>
                      <TableCell>{booking.checkOut.toLocaleDateString()}</TableCell>
                      <TableCell>{booking.nights}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[booking.reservationStatus]}>
                          {booking.reservationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentColors[booking.paymentStatus]}>
                          {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${booking.totalAmount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
