import { useQuery, QueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

type PropertyApiItem = {
  id: number;
  name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  airbnb_id?: string;
  vrbo_id?: string;
  booking_id?: string;
  ical_feed_url?: string;
};

type PropertyListResponse = {
  success?: boolean;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  data: {
    data: PropertyApiItem[];
    page?: number;
    limit?: number;
    total?: number;
  };
};

export type PropertyView = {
  id: string;
  name: string;
  address: string;
  internalStatus: 'Active' | 'Inactive' | 'Maintenance';
};

export type PropertyListingView = {
  id: string;
  propertyId: string;
  platformName: 'Airbnb' | 'Vrbo' | 'Booking.com';
  platformListingId: string;
  syncStatus: 'Synced' | 'Pending' | 'Error';
  trustScore: number;
  lastSyncedAt: Date;
};

function toViewProperty(p: PropertyApiItem): PropertyView {
  const status = (p.status || '').toLowerCase();
  const internal: PropertyView['internalStatus'] = status === 'active' ? 'Active' : status === 'maintenance' ? 'Maintenance' : 'Inactive';
  return {
    id: String(p.id),
    name: p.name || '—',
    address: '—',
    internalStatus: internal,
  };
}

function toPropertyListings(p: PropertyApiItem): PropertyListingView[] {
  const base = {
    propertyId: String(p.id),
    syncStatus: 'Pending' as const,
    trustScore: 0,
    lastSyncedAt: new Date(p.updated_at || p.created_at || Date.now()),
  };
  const rows: PropertyListingView[] = [];
  if (p.airbnb_id) {
    rows.push({ id: `${p.id}-airbnb`, platformName: 'Airbnb', platformListingId: p.airbnb_id, ...base });
  }
  if (p.vrbo_id) {
    rows.push({ id: `${p.id}-vrbo`, platformName: 'Vrbo', platformListingId: p.vrbo_id, ...base });
  }
  if (p.booking_id) {
    rows.push({ id: `${p.id}-booking`, platformName: 'Booking.com', platformListingId: p.booking_id, ...base });
  }
  return rows;
}

async function fetchProperties(page = 1, limit = 10): Promise<PropertyListResponse> {
  const qp = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return apiClient.get<PropertyListResponse>(`${ENDPOINTS.PROPERTY.LIST}?${qp}`);
}

export function usePropertiesQuery(page = 1, limit = 10, options?: QueryOptions<PropertyListResponse>) {
  return useQuery<PropertyListResponse>({
    queryKey: ['properties', page, limit],
    queryFn: () => fetchProperties(page, limit),
    staleTime: 30_000,
    ...options,
  });
}

export const propertyMappers = { toViewProperty, toPropertyListings };