import { useQuery, useMutation, type QueryOptions, type MutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import * as yup from 'yup';

type PropertyApiItem = {
  id: number;
  name?: string;
  address?: string;
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
  iCalUrl: string;
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
    address: p.address || '—',
    internalStatus: internal,
    iCalUrl: p.ical_feed_url || '',
  };
}

function toPropertyListings(p: PropertyApiItem): PropertyListingView[] {
  const base = {
    propertyId: String(p.id),
    syncStatus: 'Pending' as const,
    trustScore: 0,
    iCalUrl: p.ical_feed_url || '',
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

export function useAllPropertiesQuery(options?: QueryOptions<PropertyListResponse>) {
  return useQuery<PropertyListResponse>({
    queryKey: ['properties', 'all'],
    queryFn: () => fetchProperties(1, 100),
    staleTime: 30_000,
    ...options,
  });
}

// Create Property
export type CreatePropertyPayload = {
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  address?: string;
  airbnb_id?: string;
  vrbo_id?: string;
  booking_id?: string;
};

type CreatePropertyResponse = {
  success?: boolean;
  message?: string;
  data?: PropertyApiItem | Record<string, unknown>;
};

async function createProperty(payload: CreatePropertyPayload): Promise<CreatePropertyResponse> {
  return apiClient.post<CreatePropertyResponse>(ENDPOINTS.PROPERTY.LIST, payload);
}

export function useCreatePropertyMutation(options?: MutationOptions<CreatePropertyResponse, Error, CreatePropertyPayload>) {
  return useMutation<CreatePropertyResponse, Error, CreatePropertyPayload>({
    mutationKey: ['properties', 'create'],
    mutationFn: (payload) => createProperty(payload),
    ...options,
  });
}

export const propertyMappers = { toViewProperty, toPropertyListings };

// Yup validation schema for property creation
export const createPropertySchema = yup.object({
  name: yup.string()
    .required('Property name is required')
    .min(3, 'Property name must be at least 3 characters')
    .max(100, 'Property name must not exceed 100 characters'),
  address: yup.string()
    .optional()
    .max(200, 'Address must not exceed 200 characters'),
  status: yup.string()
    .oneOf(['active', 'inactive', 'maintenance'], 'Status must be Active, Inactive, or Maintenance')
    .required('Status is required'),
  airbnb_id: yup.string()
    .optional()
    .max(50, 'Airbnb ID must not exceed 50 characters'),
  vrbo_id: yup.string()
    .optional()
    .max(50, 'Vrbo ID must not exceed 50 characters'),
  booking_id: yup.string()
    .optional()
    .max(50, 'Booking.com ID must not exceed 50 characters'),
});

export type CreatePropertyFormData = yup.InferType<typeof createPropertySchema>;
