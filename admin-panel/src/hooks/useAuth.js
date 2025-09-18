// Authentication Hook
import { useState, useEffect, useContext, createContext } from 'react';
import authService from '../services/authService.js';
import { handleError, isAuthError } from '../utils/errors/errorHandler.js';
import { debugLog } from '../config/environment.js';

// Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      debugLog('Auth initialized:', currentUser);
    } catch (error) {
      debugLog('Auth initialization failed:', error);
      // Don't set error for initialization failure
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      setUser(response.user);
      
      debugLog('Login successful:', response.user);
      return response;
    } catch (error) {
      const appError = handleError(error, { action: 'login' });
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
      debugLog('Logout successful');
    } catch (error) {
      const appError = handleError(error, { action: 'logout' });
      setError(appError);
      // Still clear user on logout error
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      setUser(response.user);
      return response;
    } catch (error) {
      const appError = handleError(error, { action: 'refreshToken' });
      if (isAuthError(appError)) {
        setUser(null);
      }
      throw appError;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      
      debugLog('Profile updated:', updatedUser);
      return updatedUser;
    } catch (error) {
      const appError = handleError(error, { action: 'updateProfile' });
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.changePassword(passwordData);
      debugLog('Password changed successfully');
    } catch (error) {
      const appError = handleError(error, { action: 'changePassword' });
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// useAuthGuard Hook - for protecting routes
export const useAuthGuard = (requiredRole = null) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  const hasAccess = () => {
    if (!isAuthenticated) return false;
    if (!requiredRole) return true;
    
    const roleHierarchy = {
      'user': 1,
      'moderator': 2,
      'admin': 3,
      'super_admin': 4,
    };
    
    const userLevel = roleHierarchy[user?.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };
  
  return {
    user,
    loading,
    isAuthenticated,
    hasAccess: hasAccess(),
    requiredRole,
  };
};

// usePermissions Hook - for checking specific permissions
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };
  
  const hasAllPermissions = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };
  
  return {
    permissions: user?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default useAuth;

