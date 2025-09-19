import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';

// Get post history with filtering and pagination
export const usePostHistory = (filters = {}) => {
  return useQuery({
    queryKey: ['postHistory', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/post-history?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get post history analytics
export const usePostHistoryAnalytics = (timeRange = '30d') => {
  return useQuery({
    queryKey: ['postHistoryAnalytics', timeRange],
    queryFn: async () => {
      const response = await api.get(`/post-history/analytics?timeRange=${timeRange}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get single post details
export const usePostDetails = (postId) => {
  return useQuery({
    queryKey: ['postDetails', postId],
    queryFn: async () => {
      const response = await api.get(`/post-history/${postId}`);
      return response.data;
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};

// Delete single post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId) => {
      const response = await api.delete(`/post-history/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postHistory'] });
      queryClient.invalidateQueries({ queryKey: ['postHistoryAnalytics'] });
    },
  });
};

// Bulk delete posts
export const useBulkDeletePosts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postIds) => {
      const response = await api.delete('/post-history/bulk', {
        data: { postIds }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postHistory'] });
      queryClient.invalidateQueries({ queryKey: ['postHistoryAnalytics'] });
    },
  });
};

// Export post history
export const useExportPostHistory = () => {
  return useMutation({
    mutationFn: async ({ format, filters = {} }) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/post-history/export/${format}?${params.toString()}`);
      return response.data;
    },
  });
};
