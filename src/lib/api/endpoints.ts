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
  },
  INTEGRATIONS: {
    LIST: `${API_PREFIX}/users`,
    CONNECT: `${API_PREFIX}/users/:email/connect`,
    TEST: `${API_PREFIX}/users/:email/test`,
    DISCONNECT: `${API_PREFIX}/users/integrations/:platform`,
  },
} as const;
