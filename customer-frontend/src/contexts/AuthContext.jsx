import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService.js';

// Create auth context
const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  refreshToken: async () => {},
});

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const isInitialized = authService.initializeAuth();
        if (isInitialized) {
          setUser(authService.getCurrentUser());
          setToken(authService.getToken());
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error in context:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error in context:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error in context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Profile update error in context:', error);
      return { success: false, error: 'Profile update failed' };
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken();
      
      if (result.success) {
        setToken(result.token);
        return { success: true };
      } else {
        // If refresh fails, logout user
        await logout();
        return { success: false };
      }
    } catch (error) {
      console.error('Token refresh error in context:', error);
      await logout();
      return { success: false };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error in context:', error);
      return { success: false, error: 'Failed to send reset email' };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Reset password error in context:', error);
      return { success: false, error: 'Password reset failed' };
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      return await authService.verifyEmail(token);
    } catch (error) {
      console.error('Email verification error in context:', error);
      return { success: false, error: 'Email verification failed' };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      return await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error in context:', error);
      return { success: false, error: 'Password change failed' };
    }
  };

  // Delete account function
  const deleteAccount = async (password) => {
    try {
      const result = await authService.deleteAccount(password);
      
      if (result.success) {
        setUser(null);
        setToken(null);
      }
      
      return result;
    } catch (error) {
      console.error('Delete account error in context:', error);
      return { success: false, error: 'Account deletion failed' };
    }
  };

  // Context value
  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // Redirect to login or show login component
      return <div>Please log in to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;
