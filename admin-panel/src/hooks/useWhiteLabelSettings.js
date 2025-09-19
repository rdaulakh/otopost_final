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
// WHITE LABEL INSTANCES HOOKS
// ============================================================================

// Get all white label instances
export const useWhiteLabelInstances = (options = {}) => {
  const { page = 1, limit = 10, status, plan } = options;
  
  return useQuery({
    queryKey: ['whiteLabelInstances', page, limit, status, plan],
    queryFn: async () => {
      try {
        const params = { page, limit };
        if (status) params.status = status;
        if (plan) params.plan = plan;
        
        const response = await api.get('/white-label/instances', { params });
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

// Create new white label instance
export const useCreateWhiteLabelInstance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (instanceData) => {
      try {
        const response = await api.post('/white-label/instances', instanceData);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiteLabelInstances'] });
    }
  });
};

// Update white label instance
export const useUpdateWhiteLabelInstance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      try {
        const response = await api.put(`/white-label/instances/${id}`, updates);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiteLabelInstances'] });
    }
  });
};

// Delete white label instance
export const useDeleteWhiteLabelInstance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      try {
        const response = await api.delete(`/white-label/instances/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiteLabelInstances'] });
    }
  });
};

// ============================================================================
// EMAIL TEMPLATES HOOKS
// ============================================================================

// Get all email templates
export const useEmailTemplates = (options = {}) => {
  const { category, status } = options;
  
  return useQuery({
    queryKey: ['emailTemplates', category, status],
    queryFn: async () => {
      try {
        const params = {};
        if (category) params.category = category;
        if (status) params.status = status;
        
        const response = await api.get('/white-label/email-templates', { params });
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    retry: 2
  });
};

// Create new email template
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateData) => {
      try {
        const response = await api.post('/white-label/email-templates', templateData);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    }
  });
};

// Update email template
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      try {
        const response = await api.put(`/white-label/email-templates/${id}`, updates);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    }
  });
};

// Delete email template
export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      try {
        const response = await api.delete(`/white-label/email-templates/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    }
  });
};

// ============================================================================
// BRANDING SETTINGS HOOKS
// ============================================================================

// Get branding settings for an instance
export const useBrandingSettings = (instanceId) => {
  return useQuery({
    queryKey: ['brandingSettings', instanceId],
    queryFn: async () => {
      try {
        const response = await api.get(`/white-label/instances/${instanceId}/branding`);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    enabled: !!instanceId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

// Update branding settings for an instance
export const useUpdateBrandingSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ instanceId, ...brandingData }) => {
      try {
        const response = await api.put(`/white-label/instances/${instanceId}/branding`, brandingData);
        return response.data.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brandingSettings', variables.instanceId] });
      queryClient.invalidateQueries({ queryKey: ['whiteLabelInstances'] });
    }
  });
};
