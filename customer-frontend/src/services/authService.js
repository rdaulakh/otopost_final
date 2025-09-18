import apiClient, { API_ENDPOINTS } from '../config/api.js';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Login user
  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      this.token = token;
      this.user = user;

      return { success: true, user, token };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      this.token = token;
      this.user = user;

      return { success: true, user, token };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.token = null;
      this.user = null;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
      const { token } = response.data;
      
      localStorage.setItem('authToken', token);
      this.token = token;
      
      return { success: true, token };
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      this.logout();
      return { success: false };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset email sent',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword,
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset successful',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed',
      };
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token,
      });
      
      return {
        success: true,
        message: response.data.message || 'Email verified successfully',
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Email verification failed',
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
      
      const { user } = response.data;
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      this.user = user;
      
      return { success: true, user };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed',
      };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      
      return {
        success: true,
        message: response.data.message || 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed',
      };
    }
  }

  // Delete account
  async deleteAccount(password) {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT, {
        data: { password },
      });
      
      // Clear local storage after successful deletion
      this.logout();
      
      return {
        success: true,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Account deletion failed',
      };
    }
  }

  // Get user subscription info
  async getSubscription() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.SUBSCRIPTION);
      return { success: true, subscription: response.data };
    } catch (error) {
      console.error('Get subscription error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get subscription info',
      };
    }
  }

  // Get user usage statistics
  async getUsageStats() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.USAGE_STATS);
      return { success: true, stats: response.data };
    } catch (error) {
      console.error('Get usage stats error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get usage statistics',
      };
    }
  }

  // Initialize auth state from localStorage
  initializeAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        this.token = token;
        this.user = JSON.parse(user);
        return true;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
        return false;
      }
    }
    
    return false;
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
