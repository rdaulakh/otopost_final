import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiHelpers, API_ENDPOINTS } from '../config/api.js';
import { QUERY_KEYS } from '../providers/QueryProvider.jsx';

// User Profile Hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.USERS.PROFILE),
    select: (data) => data.data,
  });
};

export const useUserSubscription = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_SUBSCRIPTION,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.USERS.SUBSCRIPTION),
    select: (data) => data.data,
  });
};

export const useUserUsageStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_USAGE_STATS,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.USERS.USAGE_STATS),
    select: (data) => data.data,
  });
};

// Content Management Hooks
export const useContentList = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONTENT_LIST, filters],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.CONTENT.LIST, filters),
    select: (data) => data.data,
  });
};

export const useContentDetail = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.CONTENT_DETAIL(id),
    queryFn: () => apiHelpers.get(API_ENDPOINTS.CONTENT.GET(id)),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useContentAnalytics = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.CONTENT_ANALYTICS(id),
    queryFn: () => apiHelpers.get(API_ENDPOINTS.CONTENT.ANALYTICS(id)),
    select: (data) => data.data,
    enabled: !!id,
  });
};

// Content Mutations
export const useCreateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contentData) => apiHelpers.post(API_ENDPOINTS.CONTENT.CREATE, contentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTENT_LIST });
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiHelpers.put(API_ENDPOINTS.CONTENT.UPDATE(id), data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTENT_LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTENT_DETAIL(variables.id) });
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiHelpers.delete(API_ENDPOINTS.CONTENT.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTENT_LIST });
    },
  });
};

export const usePublishContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publishData }) => apiHelpers.post(API_ENDPOINTS.CONTENT.PUBLISH(id), publishData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTENT_LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTENT_DETAIL(variables.id) });
    },
  });
};

// AI Service Hooks
export const useAIAgents = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_AGENTS,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.AI.AGENTS),
    select: (data) => data.data,
  });
};

export const useAIUsageStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AI_USAGE_STATS,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.AI.USAGE_STATS),
    select: (data) => data.data,
  });
};

// AI Mutations
export const useGenerateContent = () => {
  return useMutation({
    mutationFn: (promptData) => apiHelpers.post(API_ENDPOINTS.AI.GENERATE_CONTENT, promptData),
  });
};

export const useGenerateHashtags = () => {
  return useMutation({
    mutationFn: (hashtagData) => apiHelpers.post(API_ENDPOINTS.AI.GENERATE_HASHTAGS, hashtagData),
  });
};

export const useGenerateCaption = () => {
  return useMutation({
    mutationFn: (captionData) => apiHelpers.post(API_ENDPOINTS.AI.GENERATE_CAPTION, captionData),
  });
};

export const useAnalyzeTrends = () => {
  return useMutation({
    mutationFn: (trendData) => apiHelpers.post(API_ENDPOINTS.AI.ANALYZE_TRENDS, trendData),
  });
};

export const useAnalyzeAudience = () => {
  return useMutation({
    mutationFn: (audienceData) => apiHelpers.post(API_ENDPOINTS.AI.ANALYZE_AUDIENCE, audienceData),
  });
};

export const useAnalyzeCompetitors = () => {
  return useMutation({
    mutationFn: (competitorData) => apiHelpers.post(API_ENDPOINTS.AI.ANALYZE_COMPETITORS, competitorData),
  });
};

export const useOptimizePerformance = () => {
  return useMutation({
    mutationFn: (performanceData) => apiHelpers.post(API_ENDPOINTS.AI.OPTIMIZE_PERFORMANCE, performanceData),
  });
};

// Social Media Hooks
export const useSocialProfiles = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SOCIAL_PROFILES,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.SOCIAL_PROFILES.LIST),
    select: (data) => data.data,
  });
};

export const useSocialPlatforms = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SOCIAL_PLATFORMS,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.SOCIAL_PROFILES.PLATFORMS),
    select: (data) => data.data,
  });
};

export const useSocialAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.SOCIAL_ANALYTICS, filters],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.SOCIAL_PROFILES.ANALYTICS, filters),
    select: (data) => data.data,
  });
};

// Social Media Mutations
export const useConnectSocialProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (connectionData) => apiHelpers.post(API_ENDPOINTS.SOCIAL_PROFILES.CONNECT, connectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL_PROFILES });
    },
  });
};

export const useDisconnectSocialProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiHelpers.delete(API_ENDPOINTS.SOCIAL_PROFILES.DISCONNECT(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOCIAL_PROFILES });
    },
  });
};

export const usePublishToSocial = () => {
  return useMutation({
    mutationFn: (publishData) => apiHelpers.post(API_ENDPOINTS.SOCIAL_PROFILES.PUBLISH, publishData),
  });
};

// Analytics Hooks
export const useAnalyticsOverview = (timeRange = '30d') => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_OVERVIEW, timeRange],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.ANALYTICS.OVERVIEW, { timeRange }),
    select: (data) => data.data,
  });
};

export const useAnalyticsContent = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_CONTENT, filters],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.ANALYTICS.CONTENT, filters),
    select: (data) => data.data,
  });
};

export const useAnalyticsAudience = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_AUDIENCE, filters],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.ANALYTICS.AUDIENCE, filters),
    select: (data) => data.data,
  });
};

export const useAnalyticsEngagement = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_ENGAGEMENT, filters],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.ANALYTICS.ENGAGEMENT, filters),
    select: (data) => data.data,
  });
};

export const useAnalyticsPerformance = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS_PERFORMANCE, filters],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.ANALYTICS.PERFORMANCE, filters),
    select: (data) => data.data,
  });
};

// Media Management Hooks
export const useMediaList = (filters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.MEDIA_LIST, filters],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.MEDIA.LIST, filters),
    select: (data) => data.data,
  });
};

// Media Mutations
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, onProgress }) => 
      apiHelpers.uploadFile(API_ENDPOINTS.MEDIA.UPLOAD_SINGLE, file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDIA_LIST });
    },
  });
};

export const useUploadFiles = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ files, onProgress }) => 
      apiHelpers.uploadFiles(API_ENDPOINTS.MEDIA.UPLOAD_MULTIPLE, files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDIA_LIST });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (filename) => apiHelpers.delete(API_ENDPOINTS.MEDIA.DELETE(filename)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDIA_LIST });
    },
  });
};

// Avatar Mutations
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, onProgress }) => 
      apiHelpers.uploadFile(API_ENDPOINTS.PROFILE.UPLOAD_AVATAR, file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
};

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiHelpers.delete(API_ENDPOINTS.PROFILE.DELETE_AVATAR),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
};

// Real-time Hooks
export const useRealtimeStatus = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REALTIME_STATUS,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.REALTIME.STATUS),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: QUERY_KEYS.REALTIME_NOTIFICATIONS,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.REALTIME.NOTIFICATIONS),
    select: (data) => data.data,
  });
};

// System Health Hook
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => apiHelpers.get(API_ENDPOINTS.SYSTEM.HEALTH),
    select: (data) => data.data,
    refetchInterval: 60000, // Refetch every minute
  });
};

// Custom hook for handling API errors
export const useApiError = () => {
  const handleError = (error) => {
    console.error('API Error:', error);
    
    // You can add global error handling logic here
    // For example, showing toast notifications, logging to external service, etc.
    
    if (error?.response?.status === 401) {
      // Handle unauthorized error
      console.log('User unauthorized, redirecting to login...');
    } else if (error?.response?.status >= 500) {
      // Handle server errors
      console.log('Server error occurred');
    }
    
    return error?.response?.data?.message || 'An error occurred';
  };
  
  return { handleError };
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = (queryKey, updateFn) => {
  const queryClient = useQueryClient();
  
  const optimisticUpdate = async (newData) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey });
    
    // Snapshot the previous value
    const previousData = queryClient.getQueryData(queryKey);
    
    // Optimistically update to the new value
    queryClient.setQueryData(queryKey, (old) => updateFn(old, newData));
    
    // Return a context object with the snapshotted value
    return { previousData };
  };
  
  const rollback = (context) => {
    queryClient.setQueryData(queryKey, context.previousData);
  };
  
  return { optimisticUpdate, rollback };
};
