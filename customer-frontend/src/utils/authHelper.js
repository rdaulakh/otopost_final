// Authentication Helper Utilities
// This file provides helper functions for managing authentication in the frontend

export const authHelper = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user && user !== 'undefined');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Get stored user data
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData && userData !== 'undefined' ? JSON.parse(userData) : null;
  },

  // Store authentication data
  setAuthData: (user, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear authentication data
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  // Get authorization header
  getAuthHeader: () => {
    const token = authHelper.getToken();
    return token ? `Bearer ${token}` : null;
  },

  // Redirect to login if not authenticated
  requireAuth: () => {
    if (!authHelper.isAuthenticated()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
};

export default authHelper;











