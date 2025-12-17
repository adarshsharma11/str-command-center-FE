export const API_PREFIX = "/api/v1" as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
  },
  BOOKING : {
    LIST : `${API_PREFIX}/bookings`,
  }
} as const;