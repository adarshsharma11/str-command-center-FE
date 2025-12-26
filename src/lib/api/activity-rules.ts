import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type ActivityRuleCondition = {
  field: string;
  operator: string;
  value: number | string | boolean;
};

export type ActivityRule = {
  id: number;
  rule_name: string;
  slug_name: string;
  condition: ActivityRuleCondition;
  priority: string;
  description?: string;
  status: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type CreateActivityRulePayload = {
  rule_name: string;
  slug_name: string;
  condition: ActivityRuleCondition;
  priority: string;
  description?: string;
  status: boolean;
};

export type UpdateActivityRulePayload = Partial<CreateActivityRulePayload>;

type ActivityRuleListResponse = {
  success: boolean;
  message?: string;
  data: ActivityRule[];
};

type ActivityRuleResponse = {
  success: boolean;
  message?: string;
  data: ActivityRule;
};

// --- API Functions ---

export async function fetchActivityRules(): Promise<ActivityRuleListResponse> {
  return apiClient.get<ActivityRuleListResponse>(ENDPOINTS.ACTIVITY_RULES.LIST);
}

export async function fetchActivityRule(id: number): Promise<ActivityRuleResponse> {
  const endpoint = ENDPOINTS.ACTIVITY_RULES.DETAIL.replace(':id', id.toString());
  return apiClient.get<ActivityRuleResponse>(endpoint);
}

export async function createActivityRule(payload: CreateActivityRulePayload): Promise<ActivityRuleResponse> {
  return apiClient.post<ActivityRuleResponse>(ENDPOINTS.ACTIVITY_RULES.LIST, payload);
}

export async function updateActivityRule(id: number, payload: UpdateActivityRulePayload): Promise<ActivityRuleResponse> {
  const endpoint = ENDPOINTS.ACTIVITY_RULES.DETAIL.replace(':id', id.toString());
  return apiClient.put<ActivityRuleResponse>(endpoint, payload);
}

export async function updateActivityRuleStatus(id: number, enable: boolean): Promise<ActivityRuleResponse> {
  const endpoint = ENDPOINTS.ACTIVITY_RULES.STATUS.replace(':id', id.toString());
  return apiClient.patch<ActivityRuleResponse>(endpoint, undefined, { enable });
}

// --- Hooks ---

export function useActivityRulesQuery(options?: UseQueryOptions<ActivityRuleListResponse, Error>) {
  return useQuery<ActivityRuleListResponse, Error>({
    queryKey: ['activity-rules'],
    queryFn: () => fetchActivityRules(),
    staleTime: 30_000,
    ...options,
  });
}

export function useActivityRuleQuery(id: number, options?: UseQueryOptions<ActivityRuleResponse, Error>) {
  return useQuery<ActivityRuleResponse, Error>({
    queryKey: ['activity-rules', id],
    queryFn: () => fetchActivityRule(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateActivityRuleMutation(options?: UseMutationOptions<ActivityRuleResponse, Error, CreateActivityRulePayload>) {
  return useMutation<ActivityRuleResponse, Error, CreateActivityRulePayload>({
    mutationKey: ['activity-rules', 'create'],
    mutationFn: (payload) => createActivityRule(payload),
    ...options,
  });
}

export function useUpdateActivityRuleMutation(options?: UseMutationOptions<ActivityRuleResponse, Error, { id: number; payload: UpdateActivityRulePayload }>) {
  return useMutation<ActivityRuleResponse, Error, { id: number; payload: UpdateActivityRulePayload }>({
    mutationKey: ['activity-rules', 'update'],
    mutationFn: ({ id, payload }) => updateActivityRule(id, payload),
    ...options,
  });
}

export function useUpdateActivityRuleStatusMutation(options?: UseMutationOptions<ActivityRuleResponse, Error, { id: number; enable: boolean }>) {
  return useMutation<ActivityRuleResponse, Error, { id: number; enable: boolean }>({
    mutationKey: ['activity-rules', 'status'],
    mutationFn: ({ id, enable }) => updateActivityRuleStatus(id, enable),
    ...options,
  });
}
