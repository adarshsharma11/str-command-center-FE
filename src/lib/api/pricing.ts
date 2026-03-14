import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export interface PricingSettings {
  weekend_boost: number;
  seasonal_strength: number;
  island_discount: number;
}

export interface PricingRule {
  id: number;
  property_id?: string;
  rule_name: string;
  rule_type: 'seasonal' | 'holiday' | 'weekend' | 'island' | 'last_minute';
  multiplier: number;
  discount_percentage?: number;
  start_date?: string;
  end_date?: string;
  status: boolean;
  created_at: string;
  updated_at?: string;
}

export type CreatePricingRulePayload = Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>;

type PricingSettingsResponse = {
  success: boolean;
  message?: string;
  data: PricingSettings;
};

type PricingRuleListResponse = {
  success: boolean;
  message?: string;
  data: PricingRule[];
};

type PricingRuleResponse = {
  success: boolean;
  message?: string;
  data: PricingRule;
};

// --- API Functions ---

export async function fetchPricingSettings(): Promise<PricingSettingsResponse> {
  return apiClient.get<PricingSettingsResponse>(ENDPOINTS.PRICING.SETTINGS);
}

export async function updatePricingSettings(settings: PricingSettings): Promise<PricingSettingsResponse> {
  return apiClient.post<PricingSettingsResponse>(ENDPOINTS.PRICING.SETTINGS, settings);
}

export async function fetchPricingRules(propertyId?: string): Promise<PricingRuleListResponse> {
  const url = propertyId ? `${ENDPOINTS.PRICING.RULES}?property_id=${propertyId}` : ENDPOINTS.PRICING.RULES;
  return apiClient.get<PricingRuleListResponse>(url);
}

export async function createPricingRule(rule: CreatePricingRulePayload): Promise<PricingRuleResponse> {
  return apiClient.post<PricingRuleResponse>(ENDPOINTS.PRICING.RULES, rule);
}

export async function deletePricingRule(id: number): Promise<{ success: boolean }> {
  const endpoint = ENDPOINTS.PRICING.DELETE_RULE.replace(':id', id.toString());
  return apiClient.delete<{ success: boolean }>(endpoint);
}

// --- Hooks ---

export function usePricingSettingsQuery(options?: UseQueryOptions<PricingSettingsResponse, Error>) {
  return useQuery<PricingSettingsResponse, Error>({
    queryKey: ['pricing-settings'],
    queryFn: fetchPricingSettings,
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function usePricingRulesQuery(propertyId?: string, options?: UseQueryOptions<PricingRuleListResponse, Error>) {
  return useQuery<PricingRuleListResponse, Error>({
    queryKey: ['pricing-rules', propertyId],
    queryFn: () => fetchPricingRules(propertyId),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useUpdatePricingSettingsMutation(options?: UseMutationOptions<PricingSettingsResponse, Error, PricingSettings>) {
  return useMutation<PricingSettingsResponse, Error, PricingSettings>({
    mutationFn: updatePricingSettings,
    ...options,
  });
}

export function useCreatePricingRuleMutation(options?: UseMutationOptions<PricingRuleResponse, Error, CreatePricingRulePayload>) {
  return useMutation<PricingRuleResponse, Error, CreatePricingRulePayload>({
    mutationFn: createPricingRule,
    ...options,
  });
}

export function useDeletePricingRuleMutation(options?: UseMutationOptions<{ success: boolean }, Error, number>) {
  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: deletePricingRule,
    ...options,
  });
}
