// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const endpoints = {
  // Authentication
  auth: {
    adminLogin: '/auth/admin/login',
    adminLogout: '/auth/admin/logout',
    adminRefresh: '/auth/admin/refresh-token',
    customerLogin: '/auth/customer/login',
    customerRegister: '/auth/customer/register',
    customerLogout: '/auth/customer/logout',
    customerRefresh: '/auth/customer/refresh-token',
    me: '/auth/customer/me',
  },
  
  // Admin User Management
  adminUsers: {
    list: '/admin/users',
    get: (id) => `/admin/users/${id}`,
    stats: '/admin/users/stats',
    export: '/admin/users/export',
    getActivity: (id) => `/admin/users/${id}/activity`,
    updateStatus: (id) => `/admin/users/${id}/status`,
    updatePermissions: (id) => `/admin/users/${id}/permissions`,
    impersonate: (id) => `/admin/users/${id}/impersonate`,
    getEngagement: (id) => `/admin/users/${id}/engagement`,
    getContentPerformance: (id) => `/admin/users/${id}/content-performance`
  },
  
  // Admin Organizations
  adminOrganizations: {
    list: '/admin/organizations',
    create: '/admin/organizations',
    get: (id) => `/admin/organizations/${id}`,
    stats: '/admin/organizations/stats',
    analytics: (id) => `/admin/organizations/${id}/analytics`,
    updateStatus: (id) => `/admin/organizations/${id}/status`,
    updateSubscription: (id) => `/admin/organizations/${id}/subscription`,
    resetUsage: (id) => `/admin/organizations/${id}/reset-usage`,
  },
  
  // Admin Analytics
  adminAnalytics: {
    dashboard: '/admin/analytics/dashboard',
    platformUsage: '/admin/analytics/platform-usage',
    revenue: '/admin/analytics/revenue',
    aiPerformance: '/admin/analytics/ai-performance',
    customReport: '/admin/analytics/custom-report',
  },
  
  // Plans Management
  plans: {
    list: '/plans',
    get: (id) => `/plans/${id}`,
    create: '/plans',
    update: (id) => `/plans/${id}`,
    delete: (id) => `/plans/${id}`,
    toggleStatus: (id) => `/plans/${id}/toggle-status`,
  },
  
  // Subscriptions
  subscriptions: {
    list: '/admin/subscriptions',
    create: '/admin/subscriptions',
    get: (id) => `/admin/subscriptions/${id}`,
    update: (id) => `/admin/subscriptions/${id}`,
    stats: '/admin/subscriptions/stats',
    analytics: '/admin/subscriptions/analytics',
    plans: '/admin/subscriptions/plans',
    cancel: (id) => `/admin/subscriptions/${id}/cancel`,
    reactivate: (id) => `/admin/subscriptions/${id}/reactivate`,
    renew: (id) => `/admin/subscriptions/${id}/renew`,
  },
  
  // Content Management
  content: {
    list: '/content',
    create: '/content',
    get: (id) => `/content/${id}`,
    update: (id) => `/content/${id}`,
    delete: (id) => `/content/${id}`,
    calendar: '/content/calendar',
    schedule: (id) => `/content/${id}/schedule`,
    approve: (id) => `/content/${id}/approve`,
    addComment: (id) => `/content/${id}/comments`,
    generateAI: '/content/generate',
    stats: '/content/stats',
    analytics: (id) => `/content/${id}/analytics`,
    updateStatus: (id) => `/content/${id}/status`,
    moderate: (id) => `/content/${id}/moderate`,
    performance: '/content/performance',
    trending: '/content/trending',
    byPlatform: (platform) => `/content/platform/${platform}`,
    search: '/content/search',
    export: '/content/export'
  },
  
  // Social Accounts
  socialAccounts: {
    list: '/social-accounts',
    get: (id) => `/social-accounts/${id}`,
    stats: '/social-accounts/stats',
    needingSync: '/social-accounts/needing-sync',
    connect: '/social-accounts/connect',
    update: (id) => `/social-accounts/${id}`,
    refreshToken: (id) => `/social-accounts/${id}/refresh-token`,
    updateAnalytics: (id) => `/social-accounts/${id}/analytics`,
    sync: (id) => `/social-accounts/${id}/sync`,
    disconnect: (id) => `/social-accounts/${id}`,
  },
  
  // Templates
  templates: {
    list: '/templates',
    get: (id) => `/templates/${id}`,
    create: '/templates',
    update: (id) => `/templates/${id}`,
    delete: (id) => `/templates/${id}`,
    stats: '/templates/stats',
    public: '/templates/public',
    categories: '/templates/categories',
    duplicate: (id) => `/templates/${id}/duplicate`,
    use: (id) => `/templates/${id}/use`,
    archive: (id) => `/templates/${id}/archive`,
    restore: (id) => `/templates/${id}/restore`,
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    get: (id) => `/notifications/${id}`,
    stats: '/notifications/stats',
    preferences: '/notifications/preferences',
    updatePreferences: '/notifications/preferences',
    markAsRead: (id) => `/notifications/${id}/read`,
    archive: (id) => `/notifications/${id}/archive`,
    markAllRead: '/notifications/mark-all-read',
    createCustom: '/notifications/custom',
    bulkCreate: '/notifications/bulk',
    cleanupExpired: '/notifications/cleanup-expired',
  },
  
  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    revenue: '/analytics/revenue',
    users: '/analytics/users',
    system: '/analytics/system',
    content: '/analytics/content',
    campaigns: '/analytics/campaigns',
    aiAgents: '/analytics/ai-agents',
  },
  
  // System Health
  system: {
    health: '/health',
    metrics: '/system/metrics',
    alerts: '/system/alerts',
  },
  
  // Support
  support: {
    tickets: '/support/tickets',
    create: '/support/tickets',
    update: (id) => `/support/tickets/${id}`,
  },
  
  // Team Management
  team: {
    members: '/team/members',
    invite: '/team/invite',
    roles: '/team/roles',
  },
  
  // Platform Configuration
  platform: {
    settings: '/platform/settings',
    agents: '/ai-agents',
    features: '/platform/features',
    integrations: '/integrations',
    notifications: '/notifications',
  },
  
  // Campaigns
  campaigns: {
    list: '/campaigns',
    create: '/campaigns',
    get: (id) => `/campaigns/${id}`,
    update: (id) => `/campaigns/${id}`,
    delete: (id) => `/campaigns/${id}`,
    start: (id) => `/campaigns/${id}/start`,
    pause: (id) => `/campaigns/${id}/pause`,
    stop: (id) => `/campaigns/${id}/stop`,
  },
  
  // Organizations
  organizations: {
    list: '/organizations',
    create: '/organizations',
    get: (id) => `/organizations/${id}`,
    update: (id) => `/organizations/${id}`,
    delete: (id) => `/organizations/${id}`,
    members: (id) => `/organizations/${id}/members`,
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Request Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export default apiConfig;

