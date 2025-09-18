// Error Handling Utilities
import { debugLog } from '../../config/environment.js';

// Error types
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Custom error class
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

// Error handler class
export class ErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.listeners = [];
  }

  // Add error listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove error listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners
  notifyListeners(error) {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  // Handle error
  handle(error, context = {}) {
    const processedError = this.processError(error, context);
    
    // Add to queue
    this.addToQueue(processedError);
    
    // Log error
    this.logError(processedError);
    
    // Notify listeners
    this.notifyListeners(processedError);
    
    return processedError;
  }

  // Process raw error into AppError
  processError(error, context = {}) {
    if (error instanceof AppError) {
      return { ...error, context };
    }

    // Handle different error types
    if (error.response) {
      // HTTP error
      return this.handleHTTPError(error, context);
    }

    if (error.request) {
      // Network error
      return new AppError(
        'Network error occurred. Please check your connection.',
        ERROR_TYPES.NETWORK,
        ERROR_SEVERITY.HIGH,
        { originalError: error.message, context }
      );
    }

    if (error.name === 'ValidationError') {
      return new AppError(
        error.message,
        ERROR_TYPES.VALIDATION,
        ERROR_SEVERITY.LOW,
        { originalError: error, context }
      );
    }

    // Generic error
    return new AppError(
      error.message || 'An unexpected error occurred',
      ERROR_TYPES.UNKNOWN,
      ERROR_SEVERITY.MEDIUM,
      { originalError: error, context }
    );
  }

  // Handle HTTP errors
  handleHTTPError(error, context = {}) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    switch (status) {
      case 400:
        return new AppError(
          data?.message || 'Bad request',
          ERROR_TYPES.VALIDATION,
          ERROR_SEVERITY.LOW,
          { status, data, context }
        );
      
      case 401:
        return new AppError(
          'Authentication required. Please log in.',
          ERROR_TYPES.AUTHENTICATION,
          ERROR_SEVERITY.HIGH,
          { status, data, context }
        );
      
      case 403:
        return new AppError(
          'You do not have permission to perform this action.',
          ERROR_TYPES.AUTHORIZATION,
          ERROR_SEVERITY.MEDIUM,
          { status, data, context }
        );
      
      case 404:
        return new AppError(
          data?.message || 'Resource not found',
          ERROR_TYPES.NOT_FOUND,
          ERROR_SEVERITY.LOW,
          { status, data, context }
        );
      
      case 429:
        return new AppError(
          'Too many requests. Please try again later.',
          ERROR_TYPES.RATE_LIMIT,
          ERROR_SEVERITY.MEDIUM,
          { status, data, context }
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return new AppError(
          'Server error occurred. Please try again later.',
          ERROR_TYPES.SERVER,
          ERROR_SEVERITY.HIGH,
          { status, data, context }
        );
      
      default:
        return new AppError(
          data?.message || `HTTP Error ${status}`,
          ERROR_TYPES.SERVER,
          ERROR_SEVERITY.MEDIUM,
          { status, data, context }
        );
    }
  }

  // Add error to queue
  addToQueue(error) {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Log error
  logError(error) {
    const logData = {
      timestamp: error.timestamp,
      type: error.type,
      severity: error.severity,
      message: error.message,
      details: error.details,
      stack: error.stack,
    };

    switch (error.severity) {
      case ERROR_SEVERITY.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logData);
        break;
      case ERROR_SEVERITY.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case ERROR_SEVERITY.LOW:
        debugLog('ℹ️ LOW SEVERITY ERROR:', logData);
        break;
      default:
        console.log('📝 ERROR:', logData);
    }
  }

  // Get error queue
  getErrorQueue() {
    return [...this.errorQueue];
  }

  // Clear error queue
  clearErrorQueue() {
    this.errorQueue = [];
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byType: {},
      bySeverity: {},
      recent: this.errorQueue.slice(-10),
    };

    this.errorQueue.forEach(error => {
      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Utility functions
export const handleError = (error, context = {}) => {
  return errorHandler.handle(error, context);
};

export const createError = (message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, details = null) => {
  return new AppError(message, type, severity, details);
};

export const isNetworkError = (error) => {
  return error.type === ERROR_TYPES.NETWORK || 
         (error.details?.originalError && !error.details.originalError.response);
};

export const isAuthError = (error) => {
  return error.type === ERROR_TYPES.AUTHENTICATION || 
         error.type === ERROR_TYPES.AUTHORIZATION;
};

export const isValidationError = (error) => {
  return error.type === ERROR_TYPES.VALIDATION;
};

export const isServerError = (error) => {
  return error.type === ERROR_TYPES.SERVER;
};

export const getErrorMessage = (error) => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorDetails = (error) => {
  if (error instanceof AppError) {
    return error.details;
  }
  
  return {
    originalError: error,
    timestamp: new Date().toISOString(),
  };
};

// Error boundary helper
export const withErrorBoundary = (Component, fallbackComponent = null) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      const appError = handleError(error, { errorInfo });
      this.setState({ error: appError });
    }

    render() {
      if (this.state.hasError) {
        if (fallbackComponent) {
          return fallbackComponent(this.state.error);
        }
        
        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{getErrorMessage(this.state.error)}</p>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
};

export default errorHandler;

