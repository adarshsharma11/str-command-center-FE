// Added by Agent 2 — connects to REAL backend APIs
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { DispatchTask, TaskResponse, ServiceCategory } from '@/types/dispatch';

// ============================================================
// TASK STATUS — fetches all cleaning + service tasks
// ============================================================
type TaskStatusResponse = {
  success: boolean;
  data: DispatchTask[];
};

async function fetchTaskStatus(): Promise<TaskStatusResponse> {
  return apiClient.get<TaskStatusResponse>(ENDPOINTS.SERVICE_BOOKINGS.STATUS);
}

export function useTaskStatusQuery() {
  return useQuery<TaskStatusResponse>({
    queryKey: ['dispatch-tasks'],
    queryFn: fetchTaskStatus,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ============================================================
// RESPONSE LOG — accept/reject history
// ============================================================
type ResponseLogResponse = {
  success: boolean;
  data: TaskResponse[];
};

async function fetchResponseLog(limit = 50): Promise<ResponseLogResponse> {
  return apiClient.get<ResponseLogResponse>(
    `${ENDPOINTS.SERVICE_BOOKINGS.RESPONSES}?limit=${limit}`
  );
}

export function useResponseLogQuery(limit = 50) {
  return useQuery<ResponseLogResponse>({
    queryKey: ['dispatch-responses', limit],
    queryFn: () => fetchResponseLog(limit),
    staleTime: 15_000,
  });
}

// ============================================================
// PROVIDER RESPOND — PUBLIC endpoint (no auth)
// ============================================================
type RespondResponse = {
  success: boolean;
  message: string;
  task_id: string;
  status: string;
};

export async function respondToTask(
  taskId: string,
  type: 'cleaning' | 'service',
  action: 'accept' | 'reject'
): Promise<RespondResponse> {
  const params = new URLSearchParams({ task_id: taskId, type, action });
  // Use relative URL so it works via nginx proxy on production
  const url = `/api${ENDPOINTS.SERVICE_BOOKINGS.RESPOND}?${params.toString()}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useRespondToTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    RespondResponse,
    Error,
    { taskId: string; type: 'cleaning' | 'service'; action: 'accept' | 'reject' }
  >({
    mutationFn: ({ taskId, type, action }) => respondToTask(taskId, type, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-responses'] });
    },
  });
}

// ============================================================
// SERVICE CATEGORIES — CRUD (requires auth)
// ============================================================
type CategoriesResponse = {
  success: boolean;
  data: ServiceCategory[];
};

async function fetchServiceCategories(): Promise<CategoriesResponse> {
  return apiClient.get<CategoriesResponse>(ENDPOINTS.SERVICE_CATEGORIES.LIST);
}

export function useServiceCategoriesQuery() {
  return useQuery<CategoriesResponse>({
    queryKey: ['service-categories'],
    queryFn: fetchServiceCategories,
    staleTime: 60_000,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    { success: boolean; data: ServiceCategory },
    Error,
    Omit<ServiceCategory, 'id'>
  >({
    mutationFn: (data) =>
      apiClient.post(ENDPOINTS.SERVICE_CATEGORIES.LIST, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    { success: boolean; data: ServiceCategory },
    Error,
    { id: number; data: Partial<ServiceCategory> }
  >({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`${ENDPOINTS.SERVICE_CATEGORIES.LIST}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: (id) =>
      apiClient.delete(`${ENDPOINTS.SERVICE_CATEGORIES.LIST}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

// ============================================================
// SSE — real-time response stream
// ============================================================
export function createResponseStream(
  onMessage: (data: TaskResponse) => void,
  onError?: (err: Event) => void
): EventSource {
  // Use relative URL so it works via nginx proxy on production
  const url = `/api${ENDPOINTS.SERVICE_BOOKINGS.RESPONSES_STREAM}`;
  const es = new EventSource(url);
  es.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      onMessage(parsed);
    } catch {
      // ignore parse errors
    }
  };
  if (onError) es.onerror = onError;
  return es;
}
