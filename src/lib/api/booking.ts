import { useQuery, QueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { CalendarBooking, VendorTask } from '@/components/calendar/types';
import { parseAsLocalTime } from '@/lib/utils';

type BookingApiItem = {
  reservation_id: string;
  created_at: string;
  platform?: string;
  property_name?: string;
  guest_name?: string;
  check_in?: string;
  check_out?: string;
  check_in_date?: string;
  check_out_date?: string;
  night?: number;
  reservation_status?: string;
  payment_status?: string;
  total_amount?: number;
  property_id?: string;
  number_of_guests?: number;
  guest_email?: string;
  guest_phone?: string;
  
};

type BookingApiResponse = {
  success: boolean;
  message?: string;
  timestamp?: string;
  data: {
    bookings: BookingApiItem[];
    vendorTasks: VendorTask[];
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
  // Prioritize check_in_date/check_out_date, then check_in/check_out, then created_at
  const checkInStr = b.check_in_date || b.check_in || b.created_at;
  const checkOutStr = b.check_out_date || b.check_out || b.check_in || b.created_at;
  
  return {
    id: b.reservation_id,
    guestName: b.guest_name ?? '—',
    propertyName: b.property_name ?? '—',
    checkIn: parseAsLocalTime(checkInStr),
    checkOut: parseAsLocalTime(checkOutStr),
    nights: typeof b.night === 'number' ? b.night : 0,
    platform: normalizePlatform(b.platform),
    reservationStatus: b.reservation_status ?? 'Confirmed',
    paymentStatus: (!b.total_amount) ? 'Pending' : (b.payment_status ?? 'Paid'),
    totalAmount: typeof b.total_amount === 'number' ? b.total_amount : 0,
  };
}

// Transform API booking to calendar booking format
export function toCalendarBooking(apiBooking: BookingApiItem): CalendarBooking {
  const platform = apiBooking.platform?.toLowerCase() || 'unknown';
  const normalizedPlatform = platform === 'booking.com' ? 'booking' : platform;
  
  // Debug log to check incoming date values
  if (process.env.NODE_ENV === 'development') {
    console.log('Booking dates debug:', {
      id: apiBooking.reservation_id,
      check_in_date: apiBooking.check_in_date,
      check_in: apiBooking.check_in,
      created_at: apiBooking.created_at
    });
  }

  return {
    id: apiBooking.reservation_id,
    propertyId: apiBooking.property_id || 'unknown',
    propertyName: apiBooking.property_name || 'Unknown Property',
    guestName: apiBooking.guest_name || 'Unknown Guest',
    checkIn: parseAsLocalTime(apiBooking.check_in_date || apiBooking.check_in || apiBooking.created_at),
    checkOut: parseAsLocalTime(apiBooking.check_out_date || apiBooking.check_out || apiBooking.created_at),
    channel: normalizedPlatform as 'airbnb' | 'vrbo' | 'direct' | 'booking',
    status: apiBooking.reservation_id === 'confirmed' ? 'confirmed' : 'pending',
    paymentStatus: (apiBooking.total_amount === 0 || !apiBooking.total_amount) ? 'pending' : 'paid',
    guestCount: apiBooking.number_of_guests || 1,
    guestEmail: apiBooking.guest_email || undefined,
    guestPhone: apiBooking.guest_phone || undefined,
    totalAmount: apiBooking.total_amount || 0,
    notes: `Booking from ${apiBooking.platform}`,
  };
}

// Transform API task to vendor task format
export function toVendorTask(apiTask: {
  task_id: string;
  scheduled_date?: string;
  scheduledTime?: string;
  crews?: {
    property_id?: string;
    name?: string;
  };
}, bookingId: string, propertyName?: string): VendorTask {
  return {
    id: `task-${apiTask.task_id}`,
    bookingId: bookingId,
    propertyId: apiTask.crews?.property_id || 'unknown',
    propertyName: propertyName || 'Unknown Property',
    vendorName: apiTask.crews?.name || 'Unknown Vendor',
    type: 'cleaning',
    scheduledTime: parseAsLocalTime(apiTask.scheduled_date || apiTask.scheduledTime),
    duration: 60,
    status: 'scheduled',
    notes: '',
  };
}

type BookingFilters = {
  platform?: string;
  status?: string;
  search?: string;
};

async function fetchBookings(page = 1, limit = 100, filters?: BookingFilters): Promise<BookingApiResponse> {
  const params = new URLSearchParams({ 
    page: String(page), 
    limit: String(limit) 
  });
  
  if (filters?.platform && filters.platform !== 'all') {
    params.append('platform', filters.platform);
  }
  
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  
  if (filters?.search) {
    params.append('search', filters.search);
  }

  return apiClient.get<BookingApiResponse>(`${ENDPOINTS.BOOKING.LIST}?${params.toString()}`);
}

export function useBookingsQuery(
  page = 1, 
  limit = 10, 
  filters?: BookingFilters,
  options?: QueryOptions<BookingApiResponse>
) {
  return useQuery<BookingApiResponse>({
    queryKey: ['bookings', page, limit, filters],
    queryFn: () => fetchBookings(page, limit, filters),
    staleTime: 30_000,
    ...options,
  });
}

// ============================================================
// CALENDAR BOOKINGS HOOK
// Transforms API response into calendar-friendly format
// Returns { bookings, vendorTasks, page, limit, total, total_pages }
// ============================================================
type CalendarBookingsResult = {
  bookings: CalendarBooking[];
  vendorTasks: VendorTask[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export function useCalendarBookingsQuery(page = 1, limit = 50, options?: Omit<QueryOptions<CalendarBookingsResult>, 'queryKey' | 'queryFn'>) {
  return useQuery<CalendarBookingsResult>({
    queryKey: ['calendar-bookings', page, limit],
    queryFn: async () => {
      const data = await fetchBookings(page, limit);
      
      // Transform bookings to calendar format
      const bookings = data.data.bookings.map(toCalendarBooking);
      
      // Extract and transform vendor tasks from all bookings
      const vendorTasks: VendorTask[] = [];
      data.data.bookings.forEach((booking: BookingApiItem & { tasks?: Array<{
        task_id: string;
        scheduled_date?: string;
        scheduledTime?: string;
        crews?: {
          property_id?: string;
          name?: string;
        };
      }> }) => {
        if (booking.tasks && Array.isArray(booking.tasks)) {
          booking.tasks.forEach((task) => {
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
    staleTime: 30_000,
    ...options,
  });
}