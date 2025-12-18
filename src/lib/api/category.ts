import { useQuery, useMutation, type QueryOptions, type MutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

import { CrewApiItem } from '@/lib/api/crew';

export type CategoryApiItem = {
  id: number;
  name: string;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoryTreeNode = CategoryApiItem & {
  children?: CategoryTreeNode[];
  crews?: CrewApiItem[];
};

type CategoryListResponse = {
  success?: boolean;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  data: {
    data: CategoryApiItem[];
    page?: number;
    limit?: number;
    total?: number;
  } | CategoryApiItem[]; // support both shapes
};

type CategoryTreeResponse = {
  success?: boolean;
  message?: string;
  data: {
    tree: CategoryTreeNode[];
  };
};

export type CreateCategoryPayload = {
  name: string;
  parent_id?: number | null;
};

type CreateCategoryResponse = {
  success?: boolean;
  message?: string;
  data?: CategoryApiItem | Record<string, unknown>;
};

function normalizeList(resp: CategoryListResponse): CategoryApiItem[] {
  if (Array.isArray(resp.data)) return resp.data;
  const anyData = resp.data as Record<string, unknown> | undefined;
  const items = (anyData && Array.isArray((anyData as { items?: unknown }).items)) ? (anyData as { items: CategoryApiItem[] }).items : undefined;
  if (items) return items;
  const dataArr = (anyData && Array.isArray((anyData as { data?: unknown }).data)) ? (anyData as { data: CategoryApiItem[] }).data : undefined;
  if (dataArr) return dataArr;
  return [];
}

async function fetchCategories(page = 1, limit = 100): Promise<CategoryListResponse> {
  const qp = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return apiClient.get<CategoryListResponse>(`${ENDPOINTS.CATEGORIES.LIST}?${qp}`);
}

export function useCategoriesQuery(page = 1, limit = 100, options?: QueryOptions<CategoryListResponse>) {
  return useQuery<CategoryListResponse>({
    queryKey: ['categories', page, limit],
    queryFn: () => fetchCategories(page, limit),
    staleTime: 30_000,
    ...options,
  });
}

async function fetchCategoryTree(): Promise<CategoryTreeResponse> {
  return apiClient.get<CategoryTreeResponse>(ENDPOINTS.CATEGORIES.TREE);
}

export function useCategoryTreeQuery(options?: QueryOptions<CategoryTreeResponse>) {
  return useQuery<CategoryTreeResponse>({
    queryKey: ['categories', 'tree'],
    queryFn: () => fetchCategoryTree(),
    staleTime: 30_000,
    ...options,
  });
}

async function createCategory(payload: CreateCategoryPayload): Promise<CreateCategoryResponse> {
  return apiClient.post<CreateCategoryResponse>(ENDPOINTS.CATEGORIES.LIST, payload);
}

export function useCreateCategoryMutation(options?: MutationOptions<CreateCategoryResponse, Error, CreateCategoryPayload>) {
  return useMutation<CreateCategoryResponse, Error, CreateCategoryPayload>({
    mutationKey: ['categories', 'create'],
    mutationFn: (payload) => createCategory(payload),
    ...options,
  });
}

export const categoryUtils = { normalizeList };
