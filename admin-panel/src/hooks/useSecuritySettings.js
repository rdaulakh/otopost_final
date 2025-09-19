import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors
const handleApiError = (error) => {
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw new Error(error.message || 'An unexpected error occurred');
};

// ============================================================================
// SECURITY METRICS HOOKS
// ============================================================================

// Get security metrics and overview
export const useSecurityMetrics = () => {
  return useQuery({
    queryKey: ['securityMetrics'],
    queryFn: async () => {
      try {
        const response = await api.get('/security-settings/metrics');
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time updates
    retry: 2
  });
};

// ============================================================================
// SECURITY EVENTS HOOKS
// ============================================================================

// Get security events with pagination and filtering
export const useSecurityEvents = (options = {}) => {
  const { page = 1, limit = 10, severity, type, status } = options;
  
  return useQuery({
    queryKey: ['securityEvents', page, limit, severity, type, status],
    queryFn: async () => {
      try {
        const params = { page, limit };
        if (severity) params.severity = severity;
        if (type) params.type = type;
        if (status) params.status = status;
        
        const response = await api.get('/security-settings/events', { params });
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time events
    retry: 2
  });
};

// ============================================================================
// AUDIT LOGS HOOKS
// ============================================================================

// Get audit logs with pagination and filtering
export const useAuditLogs = (options = {}) => {
  const { page = 1, limit = 10, action, user, result } = options;
  
  return useQuery({
    queryKey: ['auditLogs', page, limit, action, user, result],
    queryFn: async () => {
      try {
        const params = { page, limit };
        if (action) params.action = action;
        if (user) params.user = user;
        if (result) params.result = result;
        
        const response = await api.get('/security-settings/audit-logs', { params });
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 8 * 60 * 1000, // 8 minutes
    retry: 2
  });
};

// ============================================================================
// ACCESS CONTROL HOOKS
// ============================================================================

// Get access control settings
export const useAccessControl = () => {
  return useQuery({
    queryKey: ['accessControl'],
    queryFn: async () => {
      try {
        const response = await api.get('/security-settings/access-control');
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    retry: 2
  });
};

// Update access control settings
export const useUpdateAccessControl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (accessControl) => {
      try {
        const response = await api.put('/security-settings/access-control', { accessControl });
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessControl'] });
    }
  });
};

// ============================================================================
// PRIVACY SETTINGS HOOKS
// ============================================================================

// Get data privacy settings
export const usePrivacySettings = () => {
  return useQuery({
    queryKey: ['privacySettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/security-settings/privacy-settings');
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

// Update data privacy settings
export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (privacySettings) => {
      try {
        const response = await api.put('/security-settings/privacy-settings', { privacySettings });
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    }
  });
};

// ============================================================================
// SECURITY SCAN HOOKS
// ============================================================================

// Trigger security scan
export const useSecurityScan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.post('/security-settings/scan');
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      // Refresh security metrics after scan
      queryClient.invalidateQueries({ queryKey: ['securityMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['securityEvents'] });
    }
  });
};
