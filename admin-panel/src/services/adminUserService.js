// Admin User Management Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { PAGINATION } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class AdminUserService {
  // Get all users with pagination and filters
  async getUsers(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        search = '',
        role = '',
        status = '',
        organizationId = '',
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
      if (role) queryParams.append('role', role);
      if (status) queryParams.append('status', status);
      if (organizationId) queryParams.append('organizationId', organizationId);

      const response = await apiService.get(`${endpoints.adminUsers.list}?${queryParams}`);
      
      if (response.success) {
        debugLog('Users fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      debugLog('Get users error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(userId) {
    try {
      const response = await apiService.get(endpoints.adminUsers.get(userId));
      
      if (response.success) {
        debugLog('User fetched successfully:', response.data);
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to fetch user');
      }
    } catch (error) {
      debugLog('Get user error:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(params = {}) {
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

      const response = await apiService.get(`${endpoints.adminUsers.stats}?${queryParams}`);
      
      if (response.success) {
        debugLog('User stats fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user statistics');
      }
    } catch (error) {
      debugLog('Get user stats error:', error);
      throw error;
    }
  }

  // Get user activity
  async getUserActivity(userId, params = {}) {
    try {
      const {
        limit = 50,
        startDate = '',
        endDate = '',
        ...otherParams
      } = params;

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        ...otherParams,
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`${endpoints.adminUsers.getActivity(userId)}?${queryParams}`);
      
      if (response.success) {
        debugLog('User activity fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user activity');
      }
    } catch (error) {
      debugLog('Get user activity error:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await apiService.put(endpoints.adminUsers.updateStatus(userId), { status });
      
      if (response.success) {
        debugLog('User status updated successfully');
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      debugLog('Update user status error:', error);
      throw error;
    }
  }

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await apiService.put(endpoints.adminUsers.updatePermissions(userId), { permissions });
      
      if (response.success) {
        debugLog('User permissions updated successfully');
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to update user permissions');
      }
    } catch (error) {
      debugLog('Update user permissions error:', error);
      throw error;
    }
  }

  // Impersonate user (for support purposes)
  async impersonateUser(userId, reason) {
    try {
      const response = await apiService.post(endpoints.adminUsers.impersonate(userId), { reason });
      
      if (response.success) {
        debugLog('User impersonation started successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to impersonate user');
      }
    } catch (error) {
      debugLog('Impersonate user error:', error);
      throw error;
    }
  }

  // Export users data
  async exportUsers(params = {}) {
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

      const response = await apiService.get(`${endpoints.adminUsers.export}?${queryParams}`, {
        responseType: 'blob'
      });
      
      if (response.success) {
        debugLog('Users exported successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to export users');
      }
    } catch (error) {
      debugLog('Export users error:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query, params = {}) {
    try {
      const {
        limit = 10,
        fields = ['username', 'email', 'firstName', 'lastName'],
      } = params;

      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        fields: fields.join(','),
      });

      const response = await apiService.get(`${endpoints.adminUsers.list}/search?${queryParams}`);
      
      if (response.success) {
        debugLog('User search completed successfully:', response.data);
        return response.data.users;
      } else {
        throw new Error(response.message || 'Failed to search users');
      }
    } catch (error) {
      debugLog('Search users error:', error);
      throw error;
    }
  }

  // Get user engagement metrics
  async getUserEngagement(userId, params = {}) {
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

      const response = await apiService.get(`${endpoints.adminUsers.getEngagement(userId)}?${queryParams}`);
      
      if (response.success) {
        debugLog('User engagement fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user engagement');
      }
    } catch (error) {
      debugLog('Get user engagement error:', error);
      throw error;
    }
  }

  // Get user content performance
  async getUserContentPerformance(userId, params = {}) {
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

      const response = await apiService.get(`${endpoints.adminUsers.getContentPerformance(userId)}?${queryParams}`);
      
      if (response.success) {
        debugLog('User content performance fetched successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user content performance');
      }
    } catch (error) {
      debugLog('Get user content performance error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const adminUserService = new AdminUserService();

export default adminUserService;
