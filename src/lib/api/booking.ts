import { useQuery, QueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { CalendarBooking, VendorTask } from '@/components/calendar/types';

type BookingApiItem = {
  reservation_id: string;
  created_at: string;
  platform?: string;
  property_name?: string;
  guest_name?: string;
  check_in?: string;
  check_out?: string;
  nights?: number;
  reservation_status?: string;
  payment_status?: string;
  total_amount?: number;
};

type BookingApiResponse = {
  success: boolean;
  message?: string;
  timestamp?: string;
  data: {
    bookings: BookingApiItem[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export type ViewBooking = {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  platform: string;
  reservationStatus: string;
  paymentStatus: string;
  totalAmount: number;
};

function normalizePlatform(p?: string): string {
  if (!p) return 'Unknown';
  const x = p.toLowerCase();
  if (x === 'airbnb') return 'Airbnb';
  if (x === 'vrbo') return 'Vrbo';
  if (x === 'direct') return 'Direct';
  if (x === 'booking' || x === 'booking.com') return 'Booking.com';
  return p;
}

export function toViewBooking(b: BookingApiItem): ViewBooking {
  const checkInStr = b.check_in ?? b.created_at;
  const checkOutStr = b.check_out ?? b.check_in ?? b.created_at;
  return {
    id: b.reservation_id,
    guestName: b.guest_name ?? '—',
    propertyName: b.property_name ?? '—',
    checkIn: new Date(checkInStr),
    checkOut: new Date(checkOutStr),
    nights: typeof b.nights === 'number' ? b.nights : 0,
    platform: normalizePlatform(b.platform),
    reservationStatus: b.reservation_status ?? 'Confirmed',
    paymentStatus: b.payment_status ?? 'Paid',
    totalAmount: typeof b.total_amount === 'number' ? b.total_amount : 0,
  };
}

// Transform API booking to calendar booking format
export function toCalendarBooking(apiBooking: any): CalendarBooking {
  const platform = apiBooking.platform?.toLowerCase() || 'unknown';
  const normalizedPlatform = platform === 'booking.com' ? 'booking' : platform;
  
  return {
    id: apiBooking.reservation_id,
    propertyId: apiBooking.property_id || 'unknown',
    propertyName: apiBooking.property_name || 'Unknown Property',
    guestName: apiBooking.guest_name || 'Unknown Guest',
    checkIn: new Date(apiBooking.check_in_date || apiBooking.check_in || apiBooking.created_at),
    checkOut: new Date(apiBooking.check_out_date || apiBooking.check_out || apiBooking.created_at),
    channel: normalizedPlatform as 'airbnb' | 'vrbo' | 'direct' | 'booking',
    status: apiBooking.reservation_id === 'confirmed' ? 'confirmed' : 'pending',
    paymentStatus: 'paid', // Default as API doesn't provide this
    guestCount: apiBooking.number_of_guests || 1,
    guestEmail: apiBooking.guest_email || undefined,
    guestPhone: apiBooking.guest_phone || undefined,
    totalAmount: apiBooking.total_amount || 0,
    notes: `Booking from ${apiBooking.platform}`,
  };
}

// Transform API task to vendor task format
export function toVendorTask(apiTask: any, bookingId: string, propertyName?: string): VendorTask {
  return {
    id: `task-${apiTask.task_id}`,
    bookingId: bookingId,
    propertyId: apiTask.crews?.property_id || 'unknown',
    propertyName: propertyName || 'Unknown Property',
    vendorName: apiTask.crews?.name || 'Unknown Vendor',
    type: 'cleaning', // Default type as API doesn't provide this
    scheduledTime: new Date(apiTask.scheduled_date || apiTask.scheduledTime),
    duration: 60, // Default duration
    status: 'scheduled', // Default status
    notes: '',
  };
}

async function fetchBookings(page = 1, limit = 10): Promise<BookingApiResponse> {
  const qp = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return apiClient.get<BookingApiResponse>(`${ENDPOINTS.BOOKING.LIST}?${qp}&platform=airbnb`);
}

export function useBookingsQuery(page = 1, limit = 10, options?: QueryOptions<BookingApiResponse>) {
  return useQuery<BookingApiResponse>({
    queryKey: ['bookings', page, limit],
    queryFn: () => fetchBookings(page, limit),
    staleTime: 30_000,
    ...options,
  });
}

// Hook for calendar bookings with transformation
export function useCalendarBookingsQuery(page = 1, limit = 50, options?: QueryOptions<BookingApiResponse>) {
  return useQuery<BookingApiResponse>({
    queryKey: ['calendar-bookings', page, limit],
    queryFn: () => fetchBookings(page, limit),
    staleTime: 30_000,
    select: (data) => {
      // Transform bookings
      const bookings = data.data.bookings.map(toCalendarBooking);
      
      // Extract and transform vendor tasks from all bookings
      const vendorTasks: VendorTask[] = [];
      data.data.bookings.forEach((booking: any) => {
        if (booking.tasks && Array.isArray(booking.tasks)) {
          booking.tasks.forEach((task: any) => {
            vendorTasks.push(toVendorTask(task, booking.reservation_id, booking.property_name));
          });
        }
      });
      
      // Return flattened structure for easier consumption
      return {
        bookings,
        vendorTasks,
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total,
        total_pages: data.data.total_pages,
      };
    },
    ...options,
  });
}