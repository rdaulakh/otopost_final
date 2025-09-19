import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createApiClient = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const useContentManagement = () => {
  const [contentStats, setContentStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    scheduled: 0,
    flagged: 0,
    ai_generated: 0,
    content_types: {},
    platform_distribution: {},
    total_engagement: {},
    moderation: {}
  });
  
  const [contentList, setContentList] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [analytics, setAnalytics] = useState({
    overview: {},
    top_performing: [],
    content_type_performance: {},
    platform_performance: {},
    moderation_stats: {}
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContentStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get('/content-management/stats');
      
      if (response.data.success) {
        setContentStats(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch content statistics');
      }
    } catch (err) {
      console.error('Error fetching content stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch content statistics');
      
      // Fallback to mock data if API fails
      const mockStats = {
        total: 247,
        published: 156,
        draft: 34,
        pending: 23,
        approved: 18,
        rejected: 12,
        scheduled: 4,
        flagged: 8,
        ai_generated: 89,
        content_types: {
          text: 98,
          image: 87,
          video: 45,
          carousel: 17
        },
        platform_distribution: {
          instagram: 134,
          facebook: 123,
          linkedin: 89,
          twitter: 156,
          tiktok: 67,
          youtube: 34
        },
        total_engagement: {
          likes: 45678,
          comments: 12345,
          shares: 8901,
          views: 234567,
          clicks: 15678
        },
        moderation: {
          pending_review: 23,
          flagged_content: 8,
          reviewed_today: 15
        }
      };
      setContentStats(mockStats);
      return mockStats;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContentList = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/content-management/list?${queryParams}`);
      
      if (response.data.success) {
        setContentList(response.data.data.content);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch content list');
      }
    } catch (err) {
      console.error('Error fetching content list:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch content list');
      
      // Fallback to mock content
      const mockContent = [
        {
          id: 'content_1',
          title: 'Summer Marketing Campaign Launch',
          description: 'Engaging content designed to drive brand awareness and customer engagement.',
          content_type: 'image',
          status: 'published',
          platforms: ['instagram', 'facebook'],
          author: {
            id: 'user_1',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            avatar: '/api/placeholder/40/40'
          },
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          engagement: {
            likes: 234,
            comments: 45,
            shares: 23,
            views: 1234,
            clicks: 89
          },
          moderation: {
            flagged: false,
            reviewed: true,
            reviewer: 'admin@platform.com'
          },
          ai_generated: true,
          ai_score: 87.5
        },
        {
          id: 'content_2',
          title: 'Product Feature Announcement',
          description: 'High-quality visual content showcasing our latest product features.',
          content_type: 'video',
          status: 'pending',
          platforms: ['linkedin', 'twitter'],
          author: {
            id: 'user_2',
            name: 'Michael Chen',
            email: 'michael@example.com',
            avatar: '/api/placeholder/40/40'
          },
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          published_at: null,
          engagement: {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            clicks: 0
          },
          moderation: {
            flagged: false,
            reviewed: false,
            reviewer: null
          },
          ai_generated: false,
          ai_score: 0
        }
      ];
      setContentList(mockContent);
      return { content: mockContent, pagination: { current: 1, pages: 1, total: 2, limit: 20 } };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContentDetails = useCallback(async (contentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/content-management/${contentId}`);
      
      if (response.data.success) {
        setSelectedContent(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch content details');
      }
    } catch (err) {
      console.error('Error fetching content details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch content details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveContent = useCallback(async (contentId, reason = 'Approved by admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/content-management/${contentId}/approve`, { reason });
      
      if (response.data.success) {
        // Update local state
        setContentList(prev => prev.map(content => 
          content.id === contentId 
            ? { ...content, status: 'approved', approved_at: new Date().toISOString() }
            : content
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to approve content');
      }
    } catch (err) {
      console.error('Error approving content:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectContent = useCallback(async (contentId, reason = 'Rejected by admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/content-management/${contentId}/reject`, { reason });
      
      if (response.data.success) {
        // Update local state
        setContentList(prev => prev.map(content => 
          content.id === contentId 
            ? { ...content, status: 'rejected', rejected_at: new Date().toISOString() }
            : content
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to reject content');
      }
    } catch (err) {
      console.error('Error rejecting content:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reject content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContent = useCallback(async (contentId, reason = 'Deleted by admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.delete(`/content-management/${contentId}`, { 
        data: { reason }
      });
      
      if (response.data.success) {
        // Remove from local state
        setContentList(prev => prev.filter(content => content.id !== contentId));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete content');
      }
    } catch (err) {
      console.error('Error deleting content:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkContentAction = useCallback(async (contentIds, action, reason = 'Bulk action by admin') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/content-management/bulk-action', {
        content_ids: contentIds,
        action,
        reason
      });
      
      if (response.data.success) {
        // Update local state based on action
        setContentList(prev => prev.map(content => {
          if (contentIds.includes(content.id)) {
            switch (action) {
              case 'approve':
                return { ...content, status: 'approved' };
              case 'reject':
                return { ...content, status: 'rejected' };
              case 'publish':
                return { ...content, status: 'published' };
              case 'flag':
                return { ...content, moderation: { ...content.moderation, flagged: true } };
              case 'unflag':
                return { ...content, moderation: { ...content.moderation, flagged: false } };
              default:
                return content;
            }
          }
          return content;
        }));
        
        // Remove deleted content
        if (action === 'delete') {
          setContentList(prev => prev.filter(content => !contentIds.includes(content.id)));
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to perform bulk action');
      }
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError(err.response?.data?.message || err.message || 'Failed to perform bulk action');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportContent = useCallback(async (format = 'csv', filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.post('/content-management/export', { format, filters });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to export content');
      }
    } catch (err) {
      console.error('Error exporting content:', err);
      setError(err.response?.data?.message || err.message || 'Failed to export content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateContent = useCallback(async (contentId, action, reason = 'Moderated by admin', flags = []) => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.put(`/content-management/${contentId}/moderate`, {
        action,
        reason,
        flags
      });
      
      if (response.data.success) {
        // Update local state
        setContentList(prev => prev.map(content => 
          content.id === contentId 
            ? { 
                ...content, 
                moderation: { 
                  ...content.moderation, 
                  flagged: action === 'flag',
                  reviewed: action === 'review',
                  flags: action === 'flag' ? flags : []
                }
              }
            : content
        ));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to moderate content');
      }
    } catch (err) {
      console.error('Error moderating content:', err);
      setError(err.response?.data?.message || err.message || 'Failed to moderate content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (timeRange = '30d', contentType = 'all', platform = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = createApiClient();
      const response = await api.get(`/content-management/analytics/overview?timeRange=${timeRange}&contentType=${contentType}&platform=${platform}`);
      
      if (response.data.success) {
        setAnalytics(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch analytics');
      
      // Fallback to mock analytics
      const mockAnalytics = {
        overview: {
          total_content: 247,
          total_engagement: 67890,
          total_reach: 234567,
          total_impressions: 456789,
          avg_engagement_rate: 4.2
        },
        top_performing: [],
        content_type_performance: {
          text: { count: 98, avg_engagement: 3.8 },
          image: { count: 87, avg_engagement: 4.5 },
          video: { count: 45, avg_engagement: 5.2 }
        },
        platform_performance: {
          instagram: { count: 134, avg_engagement: 4.8 },
          facebook: { count: 123, avg_engagement: 3.9 },
          linkedin: { count: 89, avg_engagement: 3.2 }
        },
        moderation_stats: {
          flagged_content: 8,
          pending_review: 23,
          ai_generated: 89,
          avg_ai_score: 78.5
        }
      };
      setAnalytics(mockAnalytics);
      return mockAnalytics;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async (filters = {}) => {
    await Promise.all([
      fetchContentStats(),
      fetchContentList(filters),
      fetchAnalytics()
    ]);
  }, [fetchContentStats, fetchContentList, fetchAnalytics]);

  return {
    // Data
    contentStats,
    contentList,
    selectedContent,
    analytics,
    
    // State
    loading,
    error,
    
    // Actions
    fetchContentStats,
    fetchContentList,
    fetchContentDetails,
    approveContent,
    rejectContent,
    deleteContent,
    bulkContentAction,
    exportContent,
    moderateContent,
    fetchAnalytics,
    refreshAllData,
    setSelectedContent
  };
};

export default useContentManagement;
