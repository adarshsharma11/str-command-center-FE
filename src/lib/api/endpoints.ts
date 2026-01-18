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
  SERVICE_CATEGORIES: {
    LIST: `${API_PREFIX}/service-categories`,
    DETAIL: `${API_PREFIX}/service-categories/:id`,
    STATUS: `${API_PREFIX}/service-categories/:id/status`,
  },
  ACTIVITY_RULES: {
    LIST: `${API_PREFIX}/activity-rules`,
    DETAIL: `${API_PREFIX}/activity-rules/:id`,
    STATUS: `${API_PREFIX}/activity-rules/:id/status`,
    LOGS: `${API_PREFIX}/automation/logs`,
  },
  DASHBOARD: {
    METRICS: `${API_PREFIX}/dashboard`,
  },
  EMAILS: {
    INBOX: `${API_PREFIX}/emails/inbox`,
    DETAIL: `${API_PREFIX}/emails/:id`,
    REPLY: `${API_PREFIX}/emails/:id/reply`,
  },
  INTEGRATIONS: {
    // User endpoints
    LIST: `${API_PREFIX}/users`,
    CREATE: `${API_PREFIX}/users`,
    USER_CONNECT: `${API_PREFIX}/users/:email/connect`,
    USER_TEST: `${API_PREFIX}/users/:email/test`,
    
    // Platform endpoints
    PLATFORM_CONNECT: `${API_PREFIX}/users/integrations/:platform/connect`,
    PLATFORM_DISCONNECT: `${API_PREFIX}/users/integrations/:platform`,
    PLATFORM_TEST: `${API_PREFIX}/users/integrations/:platform/test`,
  },
} as const;
