import { createContext, useContext, useMemo, useState } from 'react';
import { getToken, setToken as persistToken, clearToken } from '@/lib/auth/token';
import { useLoginMutation, useRegisterMutation, type LoginCredentials, type RegisterPayload, type AuthResponse } from '@/lib/api/auth';

// ============================================================
// DEV MODE AUTH BYPASS
// Set this to true to bypass authentication during development
// This allows testing the app without needing backend servers running
// TODO: Your coders can toggle this or use an env variable
// ============================================================
const DEV_MODE_BYPASS_AUTH = true;

type AuthContextValue = {
  token: string | null;
  user: unknown | null;
  login: (creds: LoginCredentials) => Promise<AuthResponse>;
  registerAccount: (creds: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  isDevMode: boolean; // Flag to indicate dev mode is active
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // If DEV_MODE_BYPASS_AUTH is true, use a fake token
  const [token, setToken] = useState<string | null>(() => {
    if (DEV_MODE_BYPASS_AUTH) {
      return 'dev-mode-token'; // Fake token for dev mode
    }
    return getToken();
  });
  const [user, setUser] = useState<unknown | null>(DEV_MODE_BYPASS_AUTH ? { email: 'dev@test.com', name: 'Dev User' } : null);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isDevMode: DEV_MODE_BYPASS_AUTH,
    async login(creds) {
      // In dev mode, just return a fake successful response
      if (DEV_MODE_BYPASS_AUTH) {
        const fakeResponse: AuthResponse = { success: true, token: 'dev-mode-token', data: { email: creds.email } };
        setToken('dev-mode-token');
        setUser({ email: creds.email });
        return fakeResponse;
      }
      
      const res = await loginMutation.mutateAsync({ ...creds });
      const t = (res.token ?? res.data?.token) ?? null;
      if (t) {
        setToken(t);
        persistToken(t);
      }
      setUser(res.data ?? null);
      return res;
    },
    async registerAccount(creds) {
      // In dev mode, just return a fake successful response
      if (DEV_MODE_BYPASS_AUTH) {
        const fakeResponse: AuthResponse = { success: true, token: 'dev-mode-token', data: { email: creds.email } };
        setToken('dev-mode-token');
        setUser({ email: creds.email });
        return fakeResponse;
      }
      
      const res = await registerMutation.mutateAsync({ ...creds });
      const t = (res.token ?? res.data?.token) ?? null;
      if (t) {
        setToken(t);
        persistToken(t);
      }
      setUser(res.data ?? null);
      return res;
    },
    logout() {
      clearToken();
      setToken(null);
      setUser(null);
    },
  }), [token, user, loginMutation, registerMutation]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}