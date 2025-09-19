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

export const useUserSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.USERS.PROFILE),
    select: (data) => data.data?.preferences || {},
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData) => apiHelpers.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings) => apiHelpers.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, { preferences: settings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.USERS.PROFILE),
    select: (data) => data.data?.preferences?.notifications || {},
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notifications) => apiHelpers.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, { 
      preferences: { notifications } 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
  });
};

export const useSubscriptionInfo = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_SUBSCRIPTION,
    queryFn: () => apiHelpers.get(API_ENDPOINTS.USERS.SUBSCRIPTION),
    select: (data) => data.data,
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (subscriptionData) => apiHelpers.put(API_ENDPOINTS.USERS.SUBSCRIPTION, subscriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_SUBSCRIPTION });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
    },
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


// Additional hooks for components that need them
export const useAuth = () => {
  // This should be implemented in a separate auth context
  // For now, return basic auth state
  return {
    user: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false
  };
};

export const useApi = () => {
  // Generic API hook
  return {
    get: apiHelpers.get,
    post: apiHelpers.post,
    put: apiHelpers.put,
    delete: apiHelpers.delete
  };
};

export const useCustomerApi = () => {
  // Customer-specific API hooks
  return {
    getProfile: () => apiHelpers.get(API_ENDPOINTS.USERS.PROFILE),
    updateProfile: (data) => apiHelpers.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data)
  };
};

export const useAccountSecurity = () => {
  return useQuery({
    queryKey: ['account-security'],
    queryFn: () => apiHelpers.get('/users/security'),
    select: (data) => data.data || {}
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (passwordData) => apiHelpers.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-security'] });
    }
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => apiHelpers.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT)
  });
};

export const useAIAnalysis = () => {
  return useQuery({
    queryKey: ['ai-analysis'],
    queryFn: () => apiHelpers.get('/ai/analysis'),
    select: (data) => data.data || {}
  });
};

export const useAIContentGeneration = () => {
  return useMutation({
    mutationFn: (data) => apiHelpers.post(API_ENDPOINTS.AI.GENERATE_CONTENT, data)
  });
};

export const useAIRecommendations = () => {
  return useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => apiHelpers.get('/ai/recommendations'),
    select: (data) => data.data || []
  });
};

// Campaign hooks
export const useCampaignList = (filters = {}) => {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => apiHelpers.get('/campaigns', filters),
    select: (data) => data.data || []
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignData) => apiHelpers.post('/campaigns', campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiHelpers.put(`/campaigns/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiHelpers.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });
};

export const useCampaignAnalytics = (campaignId) => {
  return useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: () => apiHelpers.get(`/campaigns/${campaignId}/analytics`),
    select: (data) => data.data || {},
    enabled: !!campaignId
  });
};

export const useCampaignStats = () => {
  return useQuery({
    queryKey: ['campaign-stats'],
    queryFn: () => apiHelpers.get('/campaigns/stats'),
    select: (data) => data.data || {}
  });
};

export const useCampaignOptimization = () => {
  return useMutation({
    mutationFn: (data) => apiHelpers.post('/campaigns/optimize', data)
  });
};

// Boost hooks
export const useActiveBoosts = () => {
  return useQuery({
    queryKey: ['active-boosts'],
    queryFn: () => apiHelpers.get('/boosts/active'),
    select: (data) => data.data || []
  });
};

export const useCreateBoost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (boostData) => apiHelpers.post('/boosts', boostData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-boosts'] });
    }
  });
};

export const useUpdateBoost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiHelpers.put(`/boosts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-boosts'] });
    }
  });
};

export const useDeleteBoost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => apiHelpers.delete(`/boosts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-boosts'] });
    }
  });
};

export const useBoostAnalytics = (boostId) => {
  return useQuery({
    queryKey: ['boost-analytics', boostId],
    queryFn: () => apiHelpers.get(`/boosts/${boostId}/analytics`),
    select: (data) => data.data || {},
    enabled: !!boostId
  });
};

export const useBoostPrediction = () => {
  return useMutation({
    mutationFn: (data) => apiHelpers.post('/boosts/predict', data)
  });
};

export const useBoostRecommendations = () => {
  return useQuery({
    queryKey: ['boost-recommendations'],
    queryFn: () => apiHelpers.get('/boosts/recommendations'),
    select: (data) => data.data || []
  });
};

// Content management hooks
export const useContentApprove = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contentId) => apiHelpers.post(`/content/${contentId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    }
  });
};

export const useContentReject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contentId) => apiHelpers.post(`/content/${contentId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    }
  });
};

export const useContentSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentId, scheduleData }) => apiHelpers.post(`/content/${contentId}/schedule`, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    }
  });
};

export const useContentBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (batchData) => apiHelpers.post('/content/batch', batchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    }
  });
};

// Strategy hooks
export const useStrategies = () => {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: () => apiHelpers.get('/strategies'),
    select: (data) => data.data || []
  });
};

export const useGenerateStrategy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (strategyData) => apiHelpers.post('/strategies/generate', strategyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    }
  });
};

export const useUpdateStrategy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiHelpers.put(`/strategies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    }
  });
};

export const useStrategyPerformance = (strategyId) => {
  return useQuery({
    queryKey: ['strategy-performance', strategyId],
    queryFn: () => apiHelpers.get(`/strategies/${strategyId}/performance`),
    select: (data) => data.data || {},
    enabled: !!strategyId
  });
};

// Performance and analytics hooks
export const usePerformanceAnalytics = (timeRange = '30d') => {
  return useQuery({
    queryKey: ['performance-analytics', timeRange],
    queryFn: () => apiHelpers.get(`/analytics/performance?timeRange=${timeRange}`),
    select: (data) => data.data || {}
  });
};

export const useRecentPosts = (limit = 10) => {
  return useQuery({
    queryKey: ['recent-posts', limit],
    queryFn: () => apiHelpers.get(`/content/recent?limit=${limit}`),
    select: (data) => data.data || []
  });
};

// Media upload hooks
export const useUploadMedia = () => {
  return useMutation({
    mutationFn: (file) => apiHelpers.uploadFile(API_ENDPOINTS.MEDIA.UPLOAD_SINGLE, file)
  });
};

// A/B Testing Hooks
export const useABTests = () => {
  return useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => apiHelpers.get('/api/ab-tests'),
    select: (data) => data.data,
  });
};

export const useABTestResults = (testId) => {
  return useQuery({
    queryKey: ['ab-test-results', testId],
    queryFn: () => apiHelpers.get(`/api/ab-tests/${testId}/results`),
    select: (data) => data.data,
    enabled: !!testId,
  });
};

export const useABTestMetrics = (testId) => {
  return useQuery({
    queryKey: ['ab-test-metrics', testId],
    queryFn: () => apiHelpers.get(`/api/ab-tests/${testId}/metrics`),
    select: (data) => data.data,
    enabled: !!testId,
  });
};

export const useCreateABTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testData) => apiHelpers.post('/api/ab-tests', testData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });

};

// ============================================================================
// DASHBOARD COMPATIBILITY HOOKS
// ============================================================================

// Social Profiles
export const useSocialProfiles = () => {
  return useQuery({
    queryKey: ['socialProfiles'],
    queryFn: async () => {
      try {
        const response = await apiHelpers.get('/customer-dashboard/social-profiles')
        return response.data
      } catch (error) {
        console.error('Social profiles error:', error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    retry: 2
  })
}

// Analytics Overview (alias for dashboard compatibility)
export const useAnalyticsOverview = (timeRange = '7d') => {
  return useQuery({
    queryKey: ['analyticsOverview', timeRange],
    queryFn: async () => {
      try {
        const response = await apiHelpers.get('/customer-dashboard/analytics', { params: { timeRange } })
        return response.data
      } catch (error) {
        console.error('Analytics overview error:', error)
        throw error
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 8 * 60 * 1000, // 8 minutes
    retry: 2
  })
}

// Content List (alias for dashboard compatibility)
export const useContentList = (options = {}) => {
  return useQuery({
    queryKey: ['contentList', options],
    queryFn: async () => {
      try {
        const response = await apiHelpers.get('/customer-dashboard/content', { params: options })
        return response.data
      } catch (error) {
        console.error('Content list error:', error)
        throw error
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 3 * 60 * 1000, // 3 minutes
    keepPreviousData: true,
    retry: 2
  })
}

// AI Agents (alias for dashboard compatibility)
export const useAIAgents = () => {
  return useQuery({
    queryKey: ['aiAgents'],
    queryFn: async () => {
      try {
        const response = await apiHelpers.get('/customer-dashboard/ai-agents')
        return response.data
      } catch (error) {
        console.error('AI agents error:', error)
        throw error
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    retry: 2
  })
}
