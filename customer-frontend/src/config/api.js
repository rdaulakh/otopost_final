import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          // Token expired, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(new Error('Token expired'));
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('Network Error')) {
      console.error('Network error:', error.message);
      return Promise.reject({
        ...error,
        response: {
          data: {
            message: 'Failed to connect to authentication server. Please check if the backend is running.'
          }
        }
      });
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.warn('Unauthorized access - token cleared');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden:', error.response.data?.message);
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data?.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/customer/register',
    LOGOUT: '/auth/customer/logout',
    REFRESH: '/auth/customer/refresh-token',
    FORGOT_PASSWORD: '/auth/customer/forgot-password',
    RESET_PASSWORD: '/auth/customer/reset-password',
    VERIFY_EMAIL: '/auth/customer/verify-email',
  },
  
    // User Management
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/security/password',
    DELETE_ACCOUNT: '/users/account',
    SUBSCRIPTION: '/users/subscription',
    USAGE_STATS: '/users/stats',
  },

  // Profile specific endpoints
  PROFILE: {
    UPLOAD_AVATAR: '/profile/avatar',
    DELETE_AVATAR: '/users/profile', // Use PUT /users/profile to set profilePicture to null
  },
  
  // Content Management
  CONTENT: {
    LIST: '/content',
    CREATE: '/content',
    GET: (id) => `/content/${id}`,
    UPDATE: (id) => `/content/${id}`,
    DELETE: (id) => `/content/${id}`,
    PUBLISH: (id) => `/content/${id}/publish`,
    SCHEDULE: (id) => `/content/${id}/schedule`,
    DUPLICATE: (id) => `/content/${id}/duplicate`,
    ANALYTICS: (id) => `/content/${id}/analytics`,
  },
  
  // AI Services
  AI: {
    GENERATE_CONTENT: '/ai/generate-content',
    GENERATE_HASHTAGS: '/ai/generate-hashtags',
    GENERATE_CAPTION: '/ai/generate-caption',
    ANALYZE_TRENDS: '/ai/analyze-trends',
    ANALYZE_AUDIENCE: '/ai/analyze-audience',
    ANALYZE_COMPETITORS: '/ai/analyze-competitors',
    OPTIMIZE_PERFORMANCE: '/ai/optimize-performance',
    AGENTS: '/ai-agents',
    USAGE_STATS: '/ai/usage-stats',
    BATCH_GENERATE: '/ai/batch-generate',
  },
  
  // Social Media Profiles
  SOCIAL_PROFILES: {
    LIST: '/social-accounts',
    CONNECT: '/social-accounts/connect',
    DISCONNECT: (id) => `/api/social-accounts/${id}`,
    PUBLISH: '/social-accounts/publish',
    ANALYTICS: '/social-accounts/analytics',
    OAUTH: (platform) => `/api/social-accounts/oauth/${platform}`,
    WEBHOOK: (platform) => `/api/social-accounts/webhook/${platform}`,
    PLATFORMS: '/social-accounts/platforms',
  },
  
  // Media Management
  MEDIA: {
    UPLOAD_SINGLE: '/media/upload/single',
    UPLOAD_MULTIPLE: '/media/upload/multiple',
    UPLOAD_IMAGES: '/media/upload/images',
    UPLOAD_VIDEOS: '/media/upload/videos',
    GET_IMAGE: (filename) => `/api/media/images/${filename}`,
    GET_VIDEO: (filename) => `/api/media/videos/${filename}`,
    DELETE: (filename) => `/api/media/${filename}`,
    LIST: '/media',
  },
  
  // Campaigns
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET: (id) => `/api/campaigns/${id}`,
    UPDATE: (id) => `/api/campaigns/${id}`,
    DELETE: (id) => `/api/campaigns/${id}`,
    ANALYTICS: (id) => `/api/campaigns/${id}/analytics`,
    OPTIMIZE: (id) => `/api/campaigns/${id}/optimize`,
  },

  // Boosts
  BOOSTS: {
    LIST: '/boosts',
    CREATE: '/boosts',
    GET: (id) => `/api/boosts/${id}`,
    UPDATE: (id) => `/api/boosts/${id}`,
    DELETE: (id) => `/api/boosts/${id}`,
  },

  // Social Publishing
  SOCIAL_PUBLISHING: {
    ANALYTICS: (platform, postId) => `/api/social-publishing/analytics/${platform}/${postId}`,
    SCHEDULED_UPDATE: (id) => `/api/social-publishing/scheduled/${id}`,
    SCHEDULED_DELETE: (id) => `/api/social-publishing/scheduled/${id}`,
    TEST_CONNECTION: (platform) => `/api/social-publishing/test-connection/${platform}`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    CONTENT: '/analytics/content',
    SOCIAL_PROFILES: '/analytics/social-profiles',
    AUDIENCE: '/analytics/audience',
    ENGAGEMENT: '/analytics/engagement',
    PERFORMANCE: '/analytics/performance',
    EXPORT: '/analytics/export',
  },
  
  // Real-time Features
  REALTIME: {
    STATUS: '/realtime/status',
    NOTIFICATIONS: '/realtime/realtime',
    ANALYTICS_SUBSCRIBE: '/realtime/analytics/subscribe',
    ANALYTICS_UNSUBSCRIBE: '/realtime/analytics/unsubscribe',
    BROADCAST: '/realtime/broadcast',
    TEST_NOTIFICATION: '/realtime/test-notification',
  },
  
  // System
  SYSTEM: {
    HEALTH: '/health',
    STATUS: '/status',
  },
};

// Helper functions for common API operations
export const apiHelpers = {
  // Generic GET request
  get: (endpoint, params = {}) => {
    return apiClient.get(endpoint, { params });
  },
  
  // Generic POST request
  post: (endpoint, data = {}) => {
    return apiClient.post(endpoint, data);
  },
  
  // Generic PUT request
  put: (endpoint, data = {}) => {
    return apiClient.put(endpoint, data);
  },
  
  // Generic DELETE request
  delete: (endpoint) => {
    return apiClient.delete(endpoint);
  },
  
  // File upload with progress
  uploadFile: (endpoint, file, onProgress = () => {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      },
    });
  },
  
  // Multiple file upload
  uploadFiles: (endpoint, files, onProgress = () => {}) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    return apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      },
    });
  },
};

export default apiClient;
