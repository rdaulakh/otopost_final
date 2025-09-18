// User Management Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { PAGINATION } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class UserService {
  // Get all users with pagination and filters
  async getUsers(params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        search = '',
        status = '',
        role = '',
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
      if (status) queryParams.append('status', status);
      if (role) queryParams.append('role', role);

      const response = await apiService.get(`${endpoints.users.list}?${queryParams}`);
      
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
      const response = await apiService.get(endpoints.users.get(userId));
      
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

  // Create new user
  async createUser(userData) {
    try {
      const response = await apiService.post(endpoints.users.create, userData);
      
      if (response.success) {
        debugLog('User created successfully:', response.data);
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (error) {
      debugLog('Create user error:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await apiService.put(endpoints.users.update(userId), userData);
      
      if (response.success) {
        debugLog('User updated successfully:', response.data);
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (error) {
      debugLog('Update user error:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await apiService.delete(endpoints.users.delete(userId));
      
      if (response.success) {
        debugLog('User deleted successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      debugLog('Delete user error:', error);
      throw error;
    }
  }

  // Bulk delete users
  async bulkDeleteUsers(userIds) {
    try {
      const response = await apiService.post('/users/bulk-delete', { userIds });
      
      if (response.success) {
        debugLog('Users bulk deleted successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete users');
      }
    } catch (error) {
      debugLog('Bulk delete users error:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await apiService.patch(endpoints.users.update(userId), { status });
      
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

  // Get user statistics
  async getUserStats() {
    try {
      const response = await apiService.get(endpoints.users.stats);
      
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

  // Export users
  async exportUsers(params = {}) {
    try {
      const {
        format = 'csv',
        filters = {},
        fields = [],
      } = params;

      const queryParams = new URLSearchParams({
        format,
        ...filters,
      });

      if (fields.length > 0) {
        queryParams.append('fields', fields.join(','));
      }

      await apiService.downloadFile(
        `${endpoints.users.export}?${queryParams}`,
        `users_export_${new Date().toISOString().split('T')[0]}.${format}`
      );

      debugLog('Users exported successfully');
      return true;
    } catch (error) {
      debugLog('Export users error:', error);
      throw error;
    }
  }

  // Import users
  async importUsers(file) {
    try {
      const response = await apiService.uploadFile('/users/import', file);
      
      if (response.success) {
        debugLog('Users imported successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to import users');
      }
    } catch (error) {
      debugLog('Import users error:', error);
      throw error;
    }
  }

  // Send invitation email
  async sendInvitation(email, role = 'user') {
    try {
      const response = await apiService.post('/users/invite', { email, role });
      
      if (response.success) {
        debugLog('Invitation sent successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send invitation');
      }
    } catch (error) {
      debugLog('Send invitation error:', error);
      throw error;
    }
  }

  // Resend invitation
  async resendInvitation(userId) {
    try {
      const response = await apiService.post(`/users/${userId}/resend-invitation`);
      
      if (response.success) {
        debugLog('Invitation resent successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to resend invitation');
      }
    } catch (error) {
      debugLog('Resend invitation error:', error);
      throw error;
    }
  }

  // Get user activity log
  async getUserActivity(userId, params = {}) {
    try {
      const {
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        startDate = '',
        endDate = '',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get(`/users/${userId}/activity?${queryParams}`);
      
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

  // Reset user password
  async resetUserPassword(userId) {
    try {
      const response = await apiService.post(`/users/${userId}/reset-password`);
      
      if (response.success) {
        debugLog('User password reset successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to reset user password');
      }
    } catch (error) {
      debugLog('Reset user password error:', error);
      throw error;
    }
  }

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await apiService.patch(endpoints.users.update(userId), { permissions });
      
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

  // Get user roles
  async getUserRoles() {
    try {
      const response = await apiService.get('/users/roles');
      
      if (response.success) {
        debugLog('User roles fetched successfully:', response.data);
        return response.data.roles;
      } else {
        throw new Error(response.message || 'Failed to fetch user roles');
      }
    } catch (error) {
      debugLog('Get user roles error:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query, params = {}) {
    try {
      const {
        limit = 10,
        fields = ['name', 'email'],
      } = params;

      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        fields: fields.join(','),
      });

      const response = await apiService.get(`/users/search?${queryParams}`);
      
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
}

// Create singleton instance
const userService = new UserService();

export default userService;

