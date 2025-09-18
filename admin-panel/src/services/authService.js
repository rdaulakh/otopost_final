// Authentication Service
import apiService from './api.js';
import { endpoints } from '../config/api.js';
import { STORAGE_KEYS, USER_ROLES } from '../config/constants.js';
import { debugLog } from '../config/environment.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.initializeAuth();
  }

  // Initialize authentication state
  initializeAuth() {
    const token = this.getToken();
    const userData = this.getUserData();
    
    if (token && userData) {
      this.currentUser = userData;
      this.isAuthenticated = true;
      debugLog('Auth initialized with existing session');
    }
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Get stored user data
  getUserData() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  // Set user data
  setUserData(userData) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    this.currentUser = userData;
  }

  // Login
  async login(email, password) {
    try {
      debugLog('Attempting login for:', email);
      
      const response = await apiService.post(endpoints.auth.login, {
        email,
        password,
      });

      if (response.success) {
        const { user, token, refreshToken } = response.data;
        
        // Store tokens and user data
        apiService.setToken(token);
        if (refreshToken) {
          apiService.setRefreshToken(refreshToken);
        }
        this.setUserData(user);
        
        this.isAuthenticated = true;
        debugLog('Login successful for user:', user.email);
        
        return { success: true, user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      debugLog('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout
  async logout() {
    try {
      // Call logout endpoint if token exists
      if (this.getToken()) {
        await apiService.post(endpoints.auth.logout);
      }
    } catch (error) {
      debugLog('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and state
      apiService.clearTokens();
      this.currentUser = null;
      this.isAuthenticated = false;
      debugLog('User logged out');
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      if (!this.getToken()) {
        throw new Error('No authentication token');
      }

      const response = await apiService.get(endpoints.auth.me);
      
      if (response.success) {
        this.setUserData(response.data.user);
        this.isAuthenticated = true;
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to get user profile');
      }
    } catch (error) {
      debugLog('Get current user error:', error);
      // If token is invalid, clear auth state
      if (error.status === 401) {
        await this.logout();
      }
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiService.refreshToken();
      debugLog('Token refreshed successfully');
      return response;
    } catch (error) {
      debugLog('Token refresh failed:', error);
      await this.logout();
      throw error;
    }
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated && this.getToken() !== null;
  }

  // Get current user
  getCurrentUserData() {
    return this.currentUser;
  }

  // Check user role
  hasRole(role) {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  // Check if user is super admin
  isSuperAdmin() {
    return this.hasRole(USER_ROLES.SUPER_ADMIN);
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole(USER_ROLES.ADMIN) || this.isSuperAdmin();
  }

  // Check if user has permission
  hasPermission(permission) {
    if (!this.currentUser || !this.currentUser.permissions) return false;
    return this.currentUser.permissions.includes(permission);
  }

  // Check if user can access resource
  canAccess(resource, action = 'read') {
    if (this.isSuperAdmin()) return true;
    
    const permission = `${resource}:${action}`;
    return this.hasPermission(permission);
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(endpoints.auth.me, profileData);
      
      if (response.success) {
        this.setUserData(response.data.user);
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      debugLog('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        debugLog('Password changed successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      debugLog('Change password error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      
      if (response.success) {
        debugLog('Password reset email sent');
        return true;
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      debugLog('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        newPassword,
      });
      
      if (response.success) {
        debugLog('Password reset successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      debugLog('Reset password error:', error);
      throw error;
    }
  }

  // Validate session
  async validateSession() {
    try {
      if (!this.getToken()) {
        return false;
      }

      await this.getCurrentUser();
      return true;
    } catch (error) {
      debugLog('Session validation failed:', error);
      return false;
    }
  }

  // Auto-refresh token before expiry
  startTokenRefreshTimer() {
    // Refresh token every 50 minutes (assuming 1-hour expiry)
    const refreshInterval = 50 * 60 * 1000;
    
    setInterval(async () => {
      if (this.isUserAuthenticated()) {
        try {
          await this.refreshToken();
          debugLog('Token auto-refreshed');
        } catch (error) {
          debugLog('Auto token refresh failed:', error);
        }
      }
    }, refreshInterval);
  }

  // Listen for storage changes (multi-tab support)
  setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.ACCESS_TOKEN) {
        if (!event.newValue) {
          // Token was removed in another tab
          this.currentUser = null;
          this.isAuthenticated = false;
          window.location.reload();
        }
      }
    });
  }
}

// Create singleton instance
const authService = new AuthService();

// Start token refresh timer and storage listener
authService.startTokenRefreshTimer();
authService.setupStorageListener();

export default authService;

