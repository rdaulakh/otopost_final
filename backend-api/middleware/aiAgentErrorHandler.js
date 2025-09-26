const asyncHandler = require('express-async-handler');

// AI Agent specific error types
class AIAgentError extends Error {
  constructor(message, agentName, statusCode = 500) {
    super(message);
    this.name = 'AIAgentError';
    this.agentName = agentName;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

class WorkflowError extends Error {
  constructor(message, workflowId, step, statusCode = 500) {
    super(message);
    this.name = 'WorkflowError';
    this.workflowId = workflowId;
    this.step = step;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

class OpenAIError extends Error {
  constructor(message, statusCode = 503) {
    super(message);
    this.name = 'OpenAIError';
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

// Enhanced error handler for AI agents
const aiAgentErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[AI Agent Error Handler]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    agentName: err.agentName,
    workflowId: err.workflowId,
    step: err.step,
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id
  });

  // OpenAI API errors
  if (err.name === 'OpenAIError' || err.message?.includes('OpenAI')) {
    error = new OpenAIError(
      'AI service is temporarily unavailable. Please try again in a few moments.',
      503
    );
  }

  // AI Agent specific errors
  if (err.name === 'AIAgentError') {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: 'AI Agent Error',
      message: err.message,
      agentName: err.agentName,
      timestamp: err.timestamp,
      details: {
        type: 'agent_error',
        recoverable: true,
        suggestedAction: 'Please try again or contact support if the issue persists'
      }
    });
  }

  // Workflow specific errors
  if (err.name === 'WorkflowError') {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: 'Workflow Error',
      message: err.message,
      workflowId: err.workflowId,
      step: err.step,
      timestamp: err.timestamp,
      details: {
        type: 'workflow_error',
        recoverable: true,
        suggestedAction: 'The workflow can be restarted from the beginning'
      }
    });
  }

  // OpenAI specific errors
  if (err.name === 'OpenAIError') {
    return res.status(err.statusCode || 503).json({
      success: false,
      error: 'AI Service Error',
      message: err.message,
      timestamp: err.timestamp,
      details: {
        type: 'external_service_error',
        recoverable: true,
        suggestedAction: 'AI service is temporarily unavailable. Please try again in a few moments.'
      }
    });
  }

  // MongoDB/Database errors
  if (err.name === 'MongoError' || err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Database Error',
      message: 'There was an issue with data processing',
      details: {
        type: 'database_error',
        recoverable: true,
        suggestedAction: 'Please check your input and try again'
      }
    });
  }

  // JWT/Authentication errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication Error',
      message: 'Please log in again',
      details: {
        type: 'auth_error',
        recoverable: true,
        suggestedAction: 'Please refresh the page and log in again'
      }
    });
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please wait before trying again.',
      details: {
        type: 'rate_limit_error',
        recoverable: true,
        suggestedAction: 'Please wait a few minutes before making another request'
      }
    });
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'External service is temporarily unavailable',
      details: {
        type: 'network_error',
        recoverable: true,
        suggestedAction: 'Please try again in a few moments'
      }
    });
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong. Please try again.' 
      : error.message,
    details: {
      type: 'unknown_error',
      recoverable: false,
      suggestedAction: 'Please contact support if this issue persists'
    },
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// Wrapper for AI agent operations
const withAIAgentErrorHandling = (agentName) => {
  return (fn) => {
    return asyncHandler(async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        // Wrap the error with AI agent context
        const aiError = new AIAgentError(
          error.message || `${agentName} encountered an error`,
          agentName,
          error.statusCode || 500
        );
        next(aiError);
      }
    });
  };
};

// Wrapper for workflow operations
const withWorkflowErrorHandling = (workflowId, step) => {
  return (fn) => {
    return asyncHandler(async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        // Wrap the error with workflow context
        const workflowError = new WorkflowError(
          error.message || `Workflow step ${step} failed`,
          workflowId,
          step,
          error.statusCode || 500
        );
        next(workflowError);
      }
    });
  };
};

// Validation error handler
const validateAIRequest = (requiredFields = []) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: {
          type: 'validation_error',
          recoverable: true,
          suggestedAction: 'Please provide all required fields and try again',
          missingFields
        }
      });
    }
    
    next();
  };
};

// Rate limiting for AI operations
const aiRateLimit = (maxRequests = 10, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return next();
    
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate Limit Exceeded',
        message: `Too many AI requests. Maximum ${maxRequests} requests per ${windowMs/1000} seconds.`,
        details: {
          type: 'rate_limit_error',
          recoverable: true,
          suggestedAction: `Please wait ${Math.ceil((windowMs - (now - validRequests[0]))/1000)} seconds before trying again`,
          retryAfter: Math.ceil((windowMs - (now - validRequests[0]))/1000)
        }
      });
    }
    
    // Add current request
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    next();
  };
};

module.exports = {
  aiAgentErrorHandler,
  withAIAgentErrorHandling,
  withWorkflowErrorHandling,
  validateAIRequest,
  aiRateLimit,
  AIAgentError,
  WorkflowError,
  OpenAIError
};
