export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/mock',
  inactivityLogoutMs: Number(import.meta.env.VITE_INACTIVITY_LOGOUT_MS) || 24 * 60 * 60 * 1000,
};
