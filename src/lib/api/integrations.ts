import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type PlatformType = 'airbnb' | 'vrbo' | 'booking_com' | 'stripe';

export type IntegrationStatus = 'connected' | 'not_connected' | 'error' | 'testing';

export type IntegrationApiItem = {
  id: number;
  platform: PlatformType;
  status: IntegrationStatus;
  email?: string;
  last_sync_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type PlatformCredentials = {
  email: string;
  password: string;
};

export type ConnectIntegrationPayload = {
  platform: PlatformType;
  credentials: PlatformCredentials;
};

export type TestConnectionPayload = {
  platform: PlatformType;
  credentials?: PlatformCredentials;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type IntegrationListResponse = {
  success?: boolean;
  message?: string;
  data: IntegrationApiItem[];
};



async function connectIntegration(payload: ConnectIntegrationPayload): Promise<ApiResponse<IntegrationApiItem>> {
  const { platform, credentials } = payload;
  const encodedEmail = encodeURIComponent(credentials.email);
  const endpoint = ENDPOINTS.INTEGRATIONS.CONNECT.replace(':email', encodedEmail);
  return apiClient.post<ApiResponse<IntegrationApiItem>>(
    endpoint,
    { platform, ...credentials }
  );
}

async function disconnectIntegration(platform: PlatformType): Promise<ApiResponse<void>> {
  const endpoint = ENDPOINTS.INTEGRATIONS.DISCONNECT.replace(':platform', platform);
  return apiClient.delete<ApiResponse<void>>(endpoint);
}

async function testConnection(payload: TestConnectionPayload): Promise<ApiResponse<{ status: 'success' | 'failed' }>> {
  const { platform, credentials } = payload;
  
  if (credentials) {
    const encodedEmail = encodeURIComponent(credentials.email);
    const endpoint = ENDPOINTS.INTEGRATIONS.CONNECT.replace(':email', encodedEmail);
    return apiClient.post<ApiResponse<{ status: 'success' | 'failed' }>>(endpoint, { platform, ...credentials });
  } else {
    const endpoint = ENDPOINTS.INTEGRATIONS.DISCONNECT.replace(':platform', platform);
    return apiClient.post<ApiResponse<{ status: 'success' | 'failed' }>>(`${endpoint}/test`);
  }
}

// React Query Hooks
export const useConnectIntegrationMutation = (options?: UseMutationOptions<ApiResponse<IntegrationApiItem>, Error, ConnectIntegrationPayload>) => {
  return useMutation({
    mutationFn: connectIntegration,
    ...options,
  });
};

export const useDisconnectIntegrationMutation = (options?: UseMutationOptions<ApiResponse<void>, Error, PlatformType>) => {
  return useMutation({
    mutationFn: disconnectIntegration,
    ...options,
  });
};

// ============================================================
// TEST CONNECTION MUTATION
// Tests if platform credentials are valid
// Returns { status: 'success' | 'failed' }
// ============================================================
export const useTestConnectionMutation = (options?: UseMutationOptions<ApiResponse<{ status: 'success' | 'failed' }>, Error, TestConnectionPayload>) => {
  return useMutation({
    mutationFn: testConnection,
    ...options,
  });
};