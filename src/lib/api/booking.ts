import { useQuery, QueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

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

async function fetchBookings(page = 1, limit = 10): Promise<BookingApiResponse> {
  const qp = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return apiClient.get<BookingApiResponse>(`${ENDPOINTS.BOOKING.LIST}?${qp}`);
}

export function useBookingsQuery(page = 1, limit = 10, options?: QueryOptions<BookingApiResponse>) {
  return useQuery<BookingApiResponse>({
    queryKey: ['bookings', page, limit],
    queryFn: () => fetchBookings(page, limit),
    staleTime: 30_000,
    ...options,
  });
}