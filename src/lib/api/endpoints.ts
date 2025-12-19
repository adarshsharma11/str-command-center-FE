export const API_PREFIX = "/api/v1" as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
  },
  BOOKING : {
    LIST : `${API_PREFIX}/bookings`,
  },
  PROPERTY : {
    LIST : `${API_PREFIX}/property`,
  },
  CATEGORIES: {
    LIST: `${API_PREFIX}/categories`,
    TREE: `${API_PREFIX}/categories/tree`,
  },
  CREWS: {
    LIST: `${API_PREFIX}/crews`,
  }
} as const;
