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
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
    // User Management
  USERS: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
    CHANGE_PASSWORD: '/users/password',
    DELETE_ACCOUNT: '/users/me',
    SUBSCRIPTION: '/users/subscription',
    USAGE_STATS: '/users/stats',
  },

  // Profile specific endpoints
  PROFILE: {
    UPLOAD_AVATAR: '/profile/avatar',
    DELETE_AVATAR: '/profile/avatar',
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
    AGENTS: '/ai/agents',
    USAGE_STATS: '/ai/usage-stats',
    BATCH_GENERATE: '/ai/batch-generate',
  },
  
  // Social Media Profiles
  SOCIAL_PROFILES: {
    LIST: '/social-profiles',
    CONNECT: '/social-profiles/connect',
    DISCONNECT: (id) => `/social-profiles/${id}`,
    PUBLISH: '/social-profiles/publish',
    ANALYTICS: '/social-profiles/analytics',
    OAUTH: (platform) => `/social-profiles/oauth/${platform}`,
    WEBHOOK: (platform) => `/social-profiles/webhook/${platform}`,
    PLATFORMS: '/social-profiles/platforms',
  },
  
  // Media Management
  MEDIA: {
    UPLOAD_SINGLE: '/media/upload/single',
    UPLOAD_MULTIPLE: '/media/upload/multiple',
    UPLOAD_IMAGES: '/media/upload/images',
    UPLOAD_VIDEOS: '/media/upload/videos',
    GET_IMAGE: (filename) => `/media/images/${filename}`,
    GET_VIDEO: (filename) => `/media/videos/${filename}`,
    DELETE: (filename) => `/media/${filename}`,
    LIST: '/media',
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
    NOTIFICATIONS: '/realtime/notifications',
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
