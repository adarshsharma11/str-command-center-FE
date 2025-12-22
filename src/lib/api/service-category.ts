import { useQuery, useMutation, type QueryOptions, type MutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type ServiceCategory = {
  id: number;
  category_name: string;
  price?: string | null;
  time?: string | null;
  status: boolean;
  created_at?: string;
  updated_at?: string | null;
};

export type CreateServiceCategoryPayload = {
  category_name: string;
  price?: string;
  time?: string;
  status?: boolean;
};

export type UpdateServiceCategoryPayload = Partial<CreateServiceCategoryPayload>;

type ServiceCategoryListResponse = {
  success: boolean;
  message?: string;
  data: ServiceCategory[];
};

type ServiceCategoryResponse = {
  success: boolean;
  message?: string;
  data: ServiceCategory;
};

// --- API Functions ---

export async function fetchServiceCategories(): Promise<ServiceCategoryListResponse> {
  return apiClient.get<ServiceCategoryListResponse>(ENDPOINTS.SERVICE_CATEGORIES.LIST);
}

async function fetchServiceCategory(id: number): Promise<ServiceCategoryResponse> {
  const endpoint = ENDPOINTS.SERVICE_CATEGORIES.DETAIL.replace(':id', id.toString());
  return apiClient.get<ServiceCategoryResponse>(endpoint);
}

async function createServiceCategory(payload: CreateServiceCategoryPayload): Promise<ServiceCategoryResponse> {
  return apiClient.post<ServiceCategoryResponse>(ENDPOINTS.SERVICE_CATEGORIES.LIST, payload);
}

async function updateServiceCategory(id: number, payload: UpdateServiceCategoryPayload): Promise<ServiceCategoryResponse> {
  const endpoint = ENDPOINTS.SERVICE_CATEGORIES.DETAIL.replace(':id', id.toString());
  return apiClient.put<ServiceCategoryResponse>(endpoint, payload);
}

async function updateServiceCategoryStatus(id: number, isActive: boolean): Promise<ServiceCategoryResponse> {
  const endpoint = ENDPOINTS.SERVICE_CATEGORIES.STATUS.replace(':id', id.toString());
  return apiClient.patch<ServiceCategoryResponse>(endpoint, { status: isActive });
}

// --- Hooks ---

export function useServiceCategoriesQuery(options?: QueryOptions<ServiceCategoryListResponse>) {
  return useQuery<ServiceCategoryListResponse>({
    queryKey: ['service-categories'],
    queryFn: () => fetchServiceCategories(),
    staleTime: 30_000,
    ...options,
  });
}

export function useServiceCategoryQuery(id: number, options?: QueryOptions<ServiceCategoryResponse>) {
  return useQuery<ServiceCategoryResponse>({
    queryKey: ['service-categories', id],
    queryFn: () => fetchServiceCategory(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateServiceCategoryMutation(options?: MutationOptions<ServiceCategoryResponse, Error, CreateServiceCategoryPayload>) {
  return useMutation<ServiceCategoryResponse, Error, CreateServiceCategoryPayload>({
    mutationKey: ['service-categories', 'create'],
    mutationFn: (payload) => createServiceCategory(payload),
    ...options,
  });
}

export function useUpdateServiceCategoryMutation(options?: MutationOptions<ServiceCategoryResponse, Error, { id: number; payload: UpdateServiceCategoryPayload }>) {
  return useMutation<ServiceCategoryResponse, Error, { id: number; payload: UpdateServiceCategoryPayload }>({
    mutationKey: ['service-categories', 'update'],
    mutationFn: ({ id, payload }) => updateServiceCategory(id, payload),
    ...options,
  });
}

export function useUpdateServiceCategoryStatusMutation(options?: MutationOptions<ServiceCategoryResponse, Error, { id: number; isActive: boolean }>) {
  return useMutation<ServiceCategoryResponse, Error, { id: number; isActive: boolean }>({
    mutationKey: ['service-categories', 'update-status'],
    mutationFn: ({ id, isActive }) => updateServiceCategoryStatus(id, isActive),
    ...options,
  });
}
