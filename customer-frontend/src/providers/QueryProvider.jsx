import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that unused/inactive cache data remains in memory
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time in milliseconds that cache data remains in memory
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
    },
  },
});

// Query keys for consistent caching
export const QUERY_KEYS = {
  // User related
  USER_PROFILE: ['user', 'profile'],
  USER_SUBSCRIPTION: ['user', 'subscription'],
  USER_USAGE_STATS: ['user', 'usage-stats'],
  
  // Content related
  CONTENT_LIST: ['content', 'list'],
  CONTENT_DETAIL: (id) => ['content', 'detail', id],
  CONTENT_ANALYTICS: (id) => ['content', 'analytics', id],
  
  // AI related
  AI_AGENTS: ['ai', 'agents'],
  AI_USAGE_STATS: ['ai', 'usage-stats'],
  
  // Social profiles
  SOCIAL_PROFILES: ['social-profiles', 'list'],
  SOCIAL_PLATFORMS: ['social-profiles', 'platforms'],
  SOCIAL_ANALYTICS: ['social-profiles', 'analytics'],
  
  // Analytics
  ANALYTICS_OVERVIEW: ['analytics', 'overview'],
  ANALYTICS_CONTENT: ['analytics', 'content'],
  ANALYTICS_AUDIENCE: ['analytics', 'audience'],
  ANALYTICS_ENGAGEMENT: ['analytics', 'engagement'],
  ANALYTICS_PERFORMANCE: ['analytics', 'performance'],
  
  // Media
  MEDIA_LIST: ['media', 'list'],
  
  // Real-time
  REALTIME_STATUS: ['realtime', 'status'],
  REALTIME_NOTIFICATIONS: ['realtime', 'notifications'],
};

// Query client provider component
export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

// Export query client for use in components
export { queryClient };

// Utility functions for common query operations
export const queryUtils = {
  // Invalidate queries by key
  invalidateQueries: (queryKey) => {
    return queryClient.invalidateQueries({ queryKey });
  },
  
  // Remove queries by key
  removeQueries: (queryKey) => {
    return queryClient.removeQueries({ queryKey });
  },
  
  // Set query data
  setQueryData: (queryKey, data) => {
    return queryClient.setQueryData(queryKey, data);
  },
  
  // Get query data
  getQueryData: (queryKey) => {
    return queryClient.getQueryData(queryKey);
  },
  
  // Prefetch query
  prefetchQuery: (queryKey, queryFn, options = {}) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options,
    });
  },
  
  // Clear all queries
  clear: () => {
    return queryClient.clear();
  },
  
  // Reset queries
  resetQueries: (queryKey) => {
    return queryClient.resetQueries({ queryKey });
  },
};

export default QueryProvider;
