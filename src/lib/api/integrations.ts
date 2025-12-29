import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type PlatformType = 'airbnb' | 'vrbo' | 'booking_com' | 'booking' | 'verbo' | 'stripe';

export type IntegrationStatus = 'connected' | 'not_connected' | 'error' | 'testing' | 'active' | 'inactive';

export type IntegrationUser = {
  email: string;
  status: IntegrationStatus;
  platform?: PlatformType;
};

export type CreateIntegrationUserPayload = {
  email: string;
  password: string;
};

// Alias for platform credentials
export type PlatformCredentials = CreateIntegrationUserPayload;

export type ConnectionData = {
  email?: string;
  [key: string]: unknown;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export type IntegrationListResponse = {
  success?: boolean;
  message?: string;
  data: IntegrationUser[];
};

// --- User Integration API Functions ---

async function fetchIntegrationUsers(): Promise<IntegrationListResponse> {
  return apiClient.get<IntegrationListResponse>(ENDPOINTS.INTEGRATIONS.LIST);
}

async function createIntegrationUser(payload: CreateIntegrationUserPayload): Promise<ApiResponse<IntegrationUser>> {
  return apiClient.post<ApiResponse<IntegrationUser>>(ENDPOINTS.INTEGRATIONS.CREATE, payload);
}

async function connectIntegrationUser(email: string): Promise<ApiResponse<ConnectionData>> {
  const encodedEmail = encodeURIComponent(email);
  const endpoint = ENDPOINTS.INTEGRATIONS.USER_CONNECT.replace(':email', encodedEmail);
  return apiClient.post<ApiResponse<ConnectionData>>(endpoint);
}

// --- Platform Integration API Functions ---

async function connectPlatform(payload: { platform: PlatformType; credentials: PlatformCredentials }): Promise<ApiResponse<ConnectionData>> {
  const endpoint = ENDPOINTS.INTEGRATIONS.PLATFORM_CONNECT.replace(':platform', payload.platform);
  return apiClient.post<ApiResponse<ConnectionData>>(endpoint, payload.credentials);
}

async function disconnectPlatform(platform: PlatformType): Promise<ApiResponse<ConnectionData>> {
  const endpoint = ENDPOINTS.INTEGRATIONS.PLATFORM_DISCONNECT.replace(':platform', platform);
  return apiClient.delete<ApiResponse<ConnectionData>>(endpoint);
}

async function testPlatformConnection(payload: { platform: PlatformType; credentials: PlatformCredentials }): Promise<ApiResponse<ConnectionData>> {
  const endpoint = ENDPOINTS.INTEGRATIONS.PLATFORM_TEST.replace(':platform', payload.platform);
  return apiClient.post<ApiResponse<ConnectionData>>(endpoint, payload.credentials);
}

// --- React Query Hooks ---

export const useIntegrationUsersQuery = (options?: UseQueryOptions<IntegrationListResponse, Error>) => {
  return useQuery({
    queryKey: ['integration-users'],
    queryFn: fetchIntegrationUsers,
    ...options,
  });
};

export const useCreateIntegrationUserMutation = (options?: UseMutationOptions<ApiResponse<IntegrationUser>, Error, CreateIntegrationUserPayload>) => {
  return useMutation({
    mutationFn: createIntegrationUser,
    ...options,
  });
};

export const useConnectIntegrationUserMutation = (options?: UseMutationOptions<ApiResponse<ConnectionData>, Error, string>) => {
  return useMutation({
    mutationFn: connectIntegrationUser,
    ...options,
  });
};

// --- Platform Hooks ---

export const useConnectIntegrationMutation = (options?: UseMutationOptions<ApiResponse<ConnectionData>, Error, { platform: PlatformType; credentials: PlatformCredentials }>) => {
  return useMutation({
    mutationFn: connectPlatform,
    ...options,
  });
};

export const useDisconnectIntegrationMutation = (options?: UseMutationOptions<ApiResponse<ConnectionData>, Error, PlatformType>) => {
  return useMutation({
    mutationFn: disconnectPlatform,
    ...options,
  });
};

export const useTestConnectionMutation = (options?: UseMutationOptions<ApiResponse<ConnectionData>, Error, { platform: PlatformType; credentials: PlatformCredentials }>) => {
  return useMutation({
    mutationFn: testPlatformConnection,
    ...options,
  });
};
