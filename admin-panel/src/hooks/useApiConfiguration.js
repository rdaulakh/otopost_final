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
// API KEYS HOOKS
// ============================================================================

// Get all API keys
export const useApiKeys = () => {
  return useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      try {
        const response = await api.get('/api-configuration/api-keys');
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

// Create new API key
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (keyData) => {
      try {
        const response = await api.post('/api-configuration/api-keys', keyData);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });
};

// Update API key
export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      try {
        const response = await api.put(`/api-configuration/api-keys/${id}`, updates);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });
};

// Delete API key
export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      try {
        const response = await api.delete(`/api-configuration/api-keys/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });
};

// ============================================================================
// ENDPOINTS STATUS HOOKS
// ============================================================================

// Get API endpoints status
export const useApiEndpoints = () => {
  return useQuery({
    queryKey: ['apiEndpoints'],
    queryFn: async () => {
      try {
        const response = await api.get('/api-configuration/endpoints');
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time status
    retry: 2
  });
};

// ============================================================================
// RATE LIMITS HOOKS
// ============================================================================

// Get rate limits configuration
export const useRateLimits = () => {
  return useQuery({
    queryKey: ['rateLimits'],
    queryFn: async () => {
      try {
        const response = await api.get('/api-configuration/rate-limits');
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

// Update rate limits configuration
export const useUpdateRateLimits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rateLimits) => {
      try {
        const response = await api.put('/api-configuration/rate-limits', { rateLimits });
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rateLimits'] });
    }
  });
};

// ============================================================================
// AUTHENTICATION SETTINGS HOOKS
// ============================================================================

// Get authentication settings
export const useAuthSettings = () => {
  return useQuery({
    queryKey: ['authSettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/api-configuration/auth-settings');
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

// Update authentication settings
export const useUpdateAuthSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (authSettings) => {
      try {
        const response = await api.put('/api-configuration/auth-settings', { authSettings });
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authSettings'] });
    }
  });
};

// ============================================================================
// WEBHOOK SETTINGS HOOKS
// ============================================================================

// Get webhook settings
export const useWebhookSettings = () => {
  return useQuery({
    queryKey: ['webhookSettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/api-configuration/webhook-settings');
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

// Update webhook settings
export const useUpdateWebhookSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (webhookSettings) => {
      try {
        const response = await api.put('/api-configuration/webhook-settings', { webhookSettings });
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhookSettings'] });
    }
  });
};
