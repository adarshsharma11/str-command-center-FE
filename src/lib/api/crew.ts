import { useMutation, useQuery, type MutationOptions, type QueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type CrewApiItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  category_id: number;
  created_at?: string;
  updated_at?: string;
};

export type CreateCrewPayload = {
  active: boolean;
  email: string;
  name: string;
  phone: string;
  role: string;
  category_id: number;
};

export type UpdateCrewPayload = Partial<CreateCrewPayload>;

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type CrewListResponse = {
  success?: boolean;
  message?: string;
  data: {
    data: CrewApiItem[];
    total?: number;
    page?: number;
    limit?: number;
  } | CrewApiItem[];
};

async function fetchCrews(): Promise<CrewListResponse> {
  return apiClient.get<CrewListResponse>(ENDPOINTS.CREWS.LIST);
}

export function useCrewsQuery(options?: QueryOptions<CrewListResponse>) {
  return useQuery<CrewListResponse>({
    queryKey: ['crews'],
    queryFn: () => fetchCrews(),
    ...options,
  });
}

async function createCrew(payload: CreateCrewPayload): Promise<ApiResponse<CrewApiItem>> {
  return apiClient.post<ApiResponse<CrewApiItem>>(ENDPOINTS.CREWS.LIST, payload);
}

async function updateCrew(id: number, payload: UpdateCrewPayload): Promise<ApiResponse<CrewApiItem>> {
  return apiClient.patch<ApiResponse<CrewApiItem>>(`${ENDPOINTS.CREWS.LIST}/${id}`, payload);
}

export function useCreateCrewMutation(options?: MutationOptions<ApiResponse<CrewApiItem>, Error, CreateCrewPayload>) {
  return useMutation<ApiResponse<CrewApiItem>, Error, CreateCrewPayload>({
    mutationKey: ['crews', 'create'],
    mutationFn: (payload) => createCrew(payload),
    ...options,
  });
}

export function useUpdateCrewMutation(options?: MutationOptions<ApiResponse<CrewApiItem>, Error, { id: number; data: UpdateCrewPayload }>) {
  return useMutation<ApiResponse<CrewApiItem>, Error, { id: number; data: UpdateCrewPayload }>({
    mutationKey: ['crews', 'update'],
    mutationFn: ({ id, data }) => updateCrew(id, data),
    ...options,
  });
}

