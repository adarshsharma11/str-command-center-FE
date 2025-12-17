import { useMutation, MutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type AuthResponse = {
  token?: string;
  user?: unknown;
  data?: {
    token?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    [key: string]: unknown;
  };
  success?: boolean;
  message?: string;
};

async function login(creds: LoginCredentials): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, { ...creds });
}

async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, { ...payload });
}

export function useLoginMutation(options?: MutationOptions<AuthResponse, Error, LoginCredentials>) {
  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationKey: ['auth', 'login'],
    mutationFn: (creds) => login({ ...creds }),
    retry: 1,
    ...options,
  });
}

export function useRegisterMutation(options?: MutationOptions<AuthResponse, Error, RegisterPayload>) {
  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationKey: ['auth', 'register'],
    mutationFn: (payload) => register({ ...payload }),
    retry: 1,
    ...options,
  });
}