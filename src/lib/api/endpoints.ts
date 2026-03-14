export const API_PREFIX = "/v1" as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    OWNERS: `${API_PREFIX}/auth/owners`,
  },
  BOOKING : {
    LIST : `${API_PREFIX}/bookings`,
    SEND_WELCOME: `${API_PREFIX}/bookings/send-welcome`,
  },
  SERVICE_BOOKINGS: {
    CREATE: `${API_PREFIX}/service-bookings`,
    STATUS: `${API_PREFIX}/service-bookings/status`,
    RESPONSES: `${API_PREFIX}/service-bookings/responses`,
    RESPONSES_STREAM: `${API_PREFIX}/service-bookings/responses/stream`,
    RESPOND: `${API_PREFIX}/service-bookings/respond`,
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
    EXTENDED: `${API_PREFIX}/dashboard/extended`,
    FORECAST: `${API_PREFIX}/dashboard/forecast`,
    OCCUPANCY: `${API_PREFIX}/dashboard/occupancy`,
    REVENUE_TRENDS: `${API_PREFIX}/dashboard/revenue-trends`,
    CHANNEL_REVENUE: `${API_PREFIX}/dashboard/channel-revenue`,
    UPCOMING_EVENTS: `${API_PREFIX}/dashboard/upcoming-events`,
  },
  REPORTS: {
    OWNER_STATEMENT: `${API_PREFIX}/reports/owner-statement`,
    BOOKING_SUMMARY: `${API_PREFIX}/reports/booking-summary`,
    SERVICE_REVENUE: `${API_PREFIX}/reports/service-revenue`,
    SERVICE_PROVIDER: `${API_PREFIX}/reports/service-provider`,
    OCCUPANCY: `${API_PREFIX}/reports/occupancy`,
    PERFORMANCE: `${API_PREFIX}/reports/performance`,
    SEND_EMAIL: `${API_PREFIX}/reports/send-email`,
    SCHEDULED: `${API_PREFIX}/reports/scheduled`,
    DELETE_SCHEDULED: `${API_PREFIX}/reports/scheduled/:id`,
    TOGGLE_SCHEDULED: `${API_PREFIX}/reports/scheduled/:id`,
    SCHEDULED_DETAIL: `${API_PREFIX}/reports/scheduled/:id`,
  },
  EMAILS: {
    INBOX: `${API_PREFIX}/emails/inbox`,
    SENT: `${API_PREFIX}/emails/sent`,
    DETAIL: `${API_PREFIX}/emails/:id`,
    REPLY: `${API_PREFIX}/emails/:id/reply`,
  },
  PRICING: {
    SETTINGS: `${API_PREFIX}/pricing/settings`,
    RULES: `${API_PREFIX}/pricing/rules`,
    DELETE_RULE: `${API_PREFIX}/pricing/rules/:id`,
  },
  INTEGRATIONS: {
    // User endpoints
    LIST: `${API_PREFIX}/users`,
    CREATE: `${API_PREFIX}/users`,
    UPDATE: `${API_PREFIX}/users/:email`,
    PLATFORM_UPDATE: `${API_PREFIX}/users/platform/:platform`,
    USER_CONNECT: `${API_PREFIX}/users/:email/connect`,
    USER_TEST: `${API_PREFIX}/users/:email/test`,
    
    // Platform endpoints
    PLATFORM_CONNECT: `${API_PREFIX}/users/integrations/:platform/connect`,
    PLATFORM_DISCONNECT: `${API_PREFIX}/users/integrations/:platform`,
    PLATFORM_TEST: `${API_PREFIX}/users/integrations/:platform/test`,
  },
} as const;
