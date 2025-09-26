// Content Management Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { PAGINATION } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class ContentManagementService {
  // Get all content with pagination and filters
  async getContent(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        search = '',
        type = '',
        status = '',
        platform = '',
        organizationId = '',
        authorId = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...otherParams,
      });

      if (search) queryParams.append('search', search);
      if (type) queryParams.append('type', type);
      if (status) queryParams.append('status', status);
      if (platform) queryParams.append('platform', platform);
      if (organizationId) queryParams.append('organizationId', organizationId);
      if (authorId) queryParams.append('authorId', authorId);

      const response = await apiService.get(`${endpoints.content.list}?${queryParams}`);
      
      if (response.success) {
        debugLog('Content fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch content');
      }
    } catch (error) {
      debugLog('Get content error:', error);
      throw error;
    }
  }

  // Get content by ID
  async getContentById(contentId) {
    try {
      const response = await apiService.get(endpoints.content.get(contentId));
      
      if (response.success) {
        debugLog('Content fetched successfully:', response.data);
        return response.data.content;
      } else {
        throw new Error(response.message || 'Failed to fetch content');
      }
    } catch (error) {
      debugLog('Get content error:', error);
      throw error;
    }
  }

  // Get content statistics
  async getContentStats(params = {}) {
    try {
      const {
        timeRange = '30d',
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.content.stats}?${queryParams}`);
      
      if (response.success) {
        debugLog('Content stats fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch content statistics');
      }
    } catch (error) {
      debugLog('Get content stats error:', error);
      throw error;
    }
  }

  // Get content analytics
  async getContentAnalytics(contentId, params = {}) {
    try {
      const {
        timeRange = '30d',
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.content.analytics(contentId)}?${queryParams}`);
      
      if (response.success) {
        debugLog('Content analytics fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch content analytics');
      }
    } catch (error) {
      debugLog('Get content analytics error:', error);
      throw error;
    }
  }

  // Update content status
  async updateContentStatus(contentId, status) {
    try {
      const response = await apiService.put(endpoints.content.updateStatus(contentId), { status });
      
      if (response.success) {
        debugLog('Content status updated successfully');
        return response.data.content;
      } else {
        throw new Error(response.message || 'Failed to update content status');
      }
    } catch (error) {
      debugLog('Update content status error:', error);
      throw error;
    }
  }

  // Moderate content
  async moderateContent(contentId, moderationData) {
    try {
      const response = await apiService.post(endpoints.content.moderate(contentId), moderationData);
      
      if (response.success) {
        debugLog('Content moderated successfully');
        return response.data.content;
      } else {
        throw new Error(response.message || 'Failed to moderate content');
      }
    } catch (error) {
      debugLog('Moderate content error:', error);
      throw error;
    }
  }

  // Delete content
  async deleteContent(contentId, reason) {
    try {
      const response = await apiService.delete(endpoints.content.delete(contentId), { reason });
      
      if (response.success) {
        debugLog('Content deleted successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete content');
      }
    } catch (error) {
      debugLog('Delete content error:', error);
      throw error;
    }
  }

  // Get content performance metrics
  async getContentPerformance(params = {}) {
    try {
      const {
        timeRange = '30d',
        startDate = '',
        endDate = '',
        platform = '',
        type = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (platform) queryParams.append('platform', platform);
      if (type) queryParams.append('type', type);

      const response = await apiService.get(`${endpoints.content.performance}?${queryParams}`);
      
      if (response.success) {
        debugLog('Content performance fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch content performance');
      }
    } catch (error) {
      debugLog('Get content performance error:', error);
      throw error;
    }
  }

  // Get trending content
  async getTrendingContent(params = {}) {
    try {
      const {
        timeRange = '7d',
        limit = 20,
        platform = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        timeRange,
        limit: limit.toString(),
        ...otherParams,
      });

      if (platform) queryParams.append('platform', platform);

      const response = await apiService.get(`${endpoints.content.trending}?${queryParams}`);
      
      if (response.success) {
        debugLog('Trending content fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch trending content');
      }
    } catch (error) {
      debugLog('Get trending content error:', error);
      throw error;
    }
  }

  // Get content by platform
  async getContentByPlatform(platform, params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        status = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...otherParams,
      });

      if (status) queryParams.append('status', status);

      const response = await apiService.get(`${endpoints.content.byPlatform(platform)}?${queryParams}`);
      
      if (response.success) {
        debugLog('Platform content fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch platform content');
      }
    } catch (error) {
      debugLog('Get platform content error:', error);
      throw error;
    }
  }

  // Search content
  async searchContent(query, params = {}) {
    try {
      const {
        limit = 20,
        type = '',
        platform = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        ...otherParams,
      });

      if (type) queryParams.append('type', type);
      if (platform) queryParams.append('platform', platform);

      const response = await apiService.get(`${endpoints.content.search}?${queryParams}`);
      
      if (response.success) {
        debugLog('Content search completed successfully:', response.data);
        return response.data.content;
      } else {
        throw new Error(response.message || 'Failed to search content');
      }
    } catch (error) {
      debugLog('Search content error:', error);
      throw error;
    }
  }

  // Export content data
  async exportContent(params = {}) {
    try {
      const {
        format = 'csv',
        filters = {},
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        format,
        ...otherParams,
      });

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiService.get(`${endpoints.content.export}?${queryParams}`, {
        responseType: 'blob'
      });
      
      if (response.success) {
        debugLog('Content exported successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to export content');
      }
    } catch (error) {
      debugLog('Export content error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const contentManagementService = new ContentManagementService();

export default contentManagementService;
