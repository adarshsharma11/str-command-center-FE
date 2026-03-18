import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Mail, Loader2 } from 'lucide-react';
import { useBookingsQuery, toViewBooking, type ViewBooking, useSendWelcomeMutation } from '@/lib/api/booking';
import { BookingsPageSkeleton } from '@/components/skeletons/BookingsListSkeleton';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [selectedBooking, setSelectedBooking] = useState<ViewBooking | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useBookingsQuery(page, limit, {
    platform: platformFilter,
    status: statusFilter,
    search: searchTerm,
  });

  const sendWelcome = useSendWelcomeMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Welcome message sent successfully!");
      setIsModalOpen(false);
      setGuestEmail('');
      setGuestPhone('');
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send welcome message.");
    }
  });

  const handleOpenDetails = (booking: ViewBooking) => {
     setSelectedBooking(booking);
     setGuestEmail(booking.guestEmail || '');
     setGuestPhone(booking.guestPhone || '');
     setIsModalOpen(true);
   };

  const handleSendWelcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || (!guestEmail && !guestPhone)) return;

    sendWelcome.mutate({
      reservation_id: selectedBooking.id,
      guest_email: guestEmail || undefined,
      guest_phone: guestPhone || undefined,
    });
  };
  
  const apiBookings = data?.data?.bookings ?? [];
  const totalItems = data?.data?.total ?? 0;
  // Fallback calculation for totalPages if the API doesn't provide it
  const totalPages = data?.data?.total_pages ?? (Math.ceil(totalItems / limit) || 1);
  
  const bookings: ViewBooking[] = apiBookings.map(toViewBooking);

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
      {isLoading ? (
        <BookingsPageSkeleton />
      ) : (
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">New Bookings</h1>
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
                    <SelectItem value="Booking">Booking</SelectItem>
                    <SelectItem value="Plumguide">Plumguide</SelectItem>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-accent/50">
                        <TableCell className="font-medium">{booking.guestName}</TableCell>
                        <TableCell>{booking.propertyName}</TableCell>
                        <TableCell>{booking.checkIn ? format(booking.checkIn, 'MM/dd/yyyy') : '—'}</TableCell>
                        <TableCell>{booking.checkOut ? format(booking.checkOut, 'MM/dd/yyyy') : '—'}</TableCell>
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
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-primary/5 hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all duration-200"
                            onClick={() => handleOpenDetails(booking)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Guest Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.guestName} {selectedBooking?.guestEmail ? `(${selectedBooking.guestEmail})` : ''}
            </DialogTitle>
            <DialogDescription>
              Add or update guest information for reservation {selectedBooking?.id}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendWelcome}>
            <div className="grid gap-4 py-4">
              {selectedBooking?.guestEmail && (
                <div className="flex justify-end">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                    Mail exist
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="guest-name" className="text-right">
                  Guest
                </Label>
                <Input
                  id="guest-name"
                  value={selectedBooking?.guestName || ''}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter guest email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter guest phone (e.g. +1234567890)"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={sendWelcome.isPending || (!guestEmail && !guestPhone)}
                className="w-full sm:w-auto"
              >
                {sendWelcome.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Welcome Message
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
