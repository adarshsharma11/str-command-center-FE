import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, Mail, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useBookingsQuery, toViewBooking, type ViewBooking, useSendWelcomeMutation, useDeleteBookingMutation } from '@/lib/api/booking';
import { BookingsPageSkeleton } from '@/components/skeletons/BookingsListSkeleton';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof ViewBooking; direction: 'asc' | 'desc' } | null>(null);

  const queryClient = useQueryClient();
  const [bookingToDelete, setBookingToDelete] = useState<{ id: string, name: string } | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<ViewBooking | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useBookingsQuery(page, limit, {
    platform: platformFilter,
    status: statusFilter,
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

  const deleteBookingMutation = useDeleteBookingMutation({
    onSuccess: () => {
      toast.success('Booking deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setBookingToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete booking.');
      setBookingToDelete(null);
    }
  });

  const handleDeleteConfirm = () => {
    if (bookingToDelete) {
      deleteBookingMutation.mutate(bookingToDelete.id);
    }
  };

  const apiBookings = data?.data?.bookings ?? [];
  const totalItems = data?.data?.total ?? 0;
  // Fallback calculation for totalPages if the API doesn't provide it
  const totalPages = data?.data?.total_pages ?? (Math.ceil(totalItems / limit) || 1);

  const bookings: ViewBooking[] = apiBookings.map(toViewBooking);

  let displayedBookings = [...bookings];

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    displayedBookings = displayedBookings.filter(b =>
      b.guestName?.toLowerCase().includes(lowerSearch)
    );
  }

  if (sortConfig) {
    displayedBookings.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      if (aVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bVal == null) return sortConfig.direction === 'asc' ? 1 : -1;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: keyof ViewBooking) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortableHead = ({ label, sortKey, align = 'left' }: { label: string, sortKey: keyof ViewBooking, align?: 'left' | 'right' }) => {
    const isActive = sortConfig?.key === sortKey;
    return (
      <TableHead
        className={`cursor-pointer group hover:bg-muted/50 transition-colors ${align === 'right' ? 'text-right' : ''}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className={`flex items-center gap-1.5 text-nowrap select-none ${align === 'right' ? 'justify-end' : ''}`}>
          {label}
          {isActive ? (
            sortConfig.direction === 'asc' ?
              <ArrowUp className="h-4 w-4 text-primary animate-in slide-in-from-bottom-2 fade-in duration-200" /> :
              <ArrowDown className="h-4 w-4 text-primary animate-in slide-in-from-top-2 fade-in duration-200" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </TableHead>
    );
  };

  const statusColors: Record<string, string> = {
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
                      <SortableHead label="Guest" sortKey="guestName" />
                      <SortableHead label="Property" sortKey="propertyName" />
                      <SortableHead label="Check-in" sortKey="checkIn" />
                      <SortableHead label="Check-out" sortKey="checkOut" />
                      <SortableHead label="Nights" sortKey="nights" />
                      <SortableHead label="Platform" sortKey="platform" />
                      <SortableHead label="Status" sortKey="reservationStatus" />
                      <SortableHead label="Payment" sortKey="paymentStatus" />
                      <SortableHead label="Amount" sortKey="totalAmount" align="right" />
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedBookings.length > 0 ? displayedBookings.map((booking) => (
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
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-primary/5 hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all duration-200"
                              onClick={() => handleOpenDetails(booking)}
                            >
                              Notify
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={() => setBookingToDelete({ id: booking.id, name: booking.guestName })}
                              disabled={deleteBookingMutation.isPending && bookingToDelete?.id === booking.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                          {searchTerm ? `No bookings found matching "${searchTerm}".` : "No bookings found."}
                        </TableCell>
                      </TableRow>
                    )}
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

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={!!bookingToDelete}
        onOpenChange={(open) => !open && !deleteBookingMutation.isPending && setBookingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the booking for <strong>{bookingToDelete?.name}</strong> and remove its data from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBookingMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={deleteBookingMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteBookingMutation.isPending ? 'Deleting...' : 'Delete Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
