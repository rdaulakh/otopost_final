import os
import sys
from typing import Optional
from loguru import logger
from config.settings import settings

class AIAgentLogger:
    def __init__(self):
        self.setup_logger()
    
    def setup_logger(self):
        """Configure loguru logger with custom settings."""
        # Remove default handler
        logger.remove()
        
        # Console logging
        if settings.enable_console_logging:
            logger.add(
                sys.stdout,
                level=settings.log_level,
                format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>",
                colorize=True,
                backtrace=True,
                diagnose=True
            )
        
        # File logging
        if settings.enable_file_logging:
            # Ensure log directory exists
            log_dir = os.path.dirname(settings.log_file)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir, exist_ok=True)
            
            logger.add(
                settings.log_file,
                level=settings.log_level,
                format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
                rotation="100 MB",
                retention="30 days",
                compression="zip",
                backtrace=True,
                diagnose=True
            )
        
        # Add custom context for AI agents
        logger.configure(
            extra={
                "agent_type": None,
                "organization_id": None,
                "task_id": None,
                "user_id": None
            }
        )
    
    def get_agent_logger(self, agent_type: str, organization_id: Optional[str] = None):
        """Get a logger instance with agent context."""
        return logger.bind(
            agent_type=agent_type,
            organization_id=organization_id
        )
    
    def get_task_logger(self, task_id: str, agent_type: str, organization_id: Optional[str] = None):
        """Get a logger instance with task context."""
        return logger.bind(
            task_id=task_id,
            agent_type=agent_type,
            organization_id=organization_id
        )

# Global logger instance
ai_logger = AIAgentLogger()

# Convenience functions
def get_logger(name: str = "ai_agent"):
    """Get a basic logger instance."""
    return logger.bind(name=name)

def get_agent_logger(agent_type: str, organization_id: Optional[str] = None):
    """Get a logger with agent context."""
    return ai_logger.get_agent_logger(agent_type, organization_id)

def get_task_logger(task_id: str, agent_type: str, organization_id: Optional[str] = None):
    """Get a logger with task context."""
    return ai_logger.get_task_logger(task_id, agent_type, organization_id)

# Log performance metrics
def log_performance(func):
    """Decorator to log function performance."""
    def wrapper(*args, **kwargs):
        import time
        start_time = time.time()
        
        func_logger = logger.bind(function=func.__name__)
        func_logger.info(f"Starting {func.__name__}")
        
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            func_logger.info(f"Completed {func.__name__} in {execution_time:.2f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            func_logger.error(f"Failed {func.__name__} after {execution_time:.2f}s: {str(e)}")
            raise
    
    return wrapper

# Log agent activities
def log_agent_activity(agent_type: str, activity: str, organization_id: Optional[str] = None, **kwargs):
    """Log agent activity with structured data."""
    agent_logger = get_agent_logger(agent_type, organization_id)
    agent_logger.info(f"Agent Activity: {activity}", **kwargs)

# Log task execution
def log_task_execution(task_id: str, agent_type: str, status: str, organization_id: Optional[str] = None, **kwargs):
    """Log task execution status."""
    task_logger = get_task_logger(task_id, agent_type, organization_id)
    task_logger.info(f"Task {status}: {task_id}", **kwargs)

# Log errors with context
def log_error(error: Exception, context: dict = None, agent_type: Optional[str] = None, organization_id: Optional[str] = None):
    """Log errors with additional context."""
    error_logger = logger.bind(
        agent_type=agent_type,
        organization_id=organization_id,
        error_type=type(error).__name__,
        **(context or {})
    )
    error_logger.error(f"Error occurred: {str(error)}")

# Log API calls
def log_api_call(api_name: str, endpoint: str, status_code: int, response_time: float, agent_type: Optional[str] = None):
    """Log API calls with performance metrics."""
    api_logger = logger.bind(
        api_name=api_name,
        endpoint=endpoint,
        status_code=status_code,
        response_time=response_time,
        agent_type=agent_type
    )
    
    if status_code < 400:
        api_logger.info(f"API call successful: {api_name} {endpoint}")
    else:
        api_logger.warning(f"API call failed: {api_name} {endpoint} - Status: {status_code}")

# Log memory operations
def log_memory_operation(operation: str, collection: str, document_count: int, agent_type: Optional[str] = None):
    """Log memory/vector database operations."""
    memory_logger = logger.bind(
        operation=operation,
        collection=collection,
        document_count=document_count,
        agent_type=agent_type
    )
    memory_logger.info(f"Memory operation: {operation} on {collection} ({document_count} documents)")

# Log content generation
def log_content_generation(content_type: str, platform: str, success: bool, agent_type: Optional[str] = None, **kwargs):
    """Log content generation activities."""
    content_logger = logger.bind(
        content_type=content_type,
        platform=platform,
        success=success,
        agent_type=agent_type,
        **kwargs
    )
    
    if success:
        content_logger.info(f"Content generated successfully: {content_type} for {platform}")
    else:
        content_logger.error(f"Content generation failed: {content_type} for {platform}")

# Log social media interactions
def log_social_interaction(platform: str, interaction_type: str, success: bool, agent_type: Optional[str] = None, **kwargs):
    """Log social media platform interactions."""
    social_logger = logger.bind(
        platform=platform,
        interaction_type=interaction_type,
        success=success,
        agent_type=agent_type,
        **kwargs
    )
    
    if success:
        social_logger.info(f"Social interaction successful: {interaction_type} on {platform}")
    else:
        social_logger.error(f"Social interaction failed: {interaction_type} on {platform}")

# Log analytics and insights
def log_analytics_insight(insight_type: str, metric_name: str, value: float, agent_type: Optional[str] = None, **kwargs):
    """Log analytics insights and metrics."""
    analytics_logger = logger.bind(
        insight_type=insight_type,
        metric_name=metric_name,
        value=value,
        agent_type=agent_type,
        **kwargs
    )
    analytics_logger.info(f"Analytics insight: {insight_type} - {metric_name}: {value}")

# Log learning and optimization
def log_learning_event(event_type: str, improvement: float, confidence: float, agent_type: Optional[str] = None, **kwargs):
    """Log learning and optimization events."""
    learning_logger = logger.bind(
        event_type=event_type,
        improvement=improvement,
        confidence=confidence,
        agent_type=agent_type,
        **kwargs
    )
    learning_logger.info(f"Learning event: {event_type} - Improvement: {improvement:.2%}, Confidence: {confidence:.2%}")

# Export main logger
__all__ = [
    'logger',
    'get_logger',
    'get_agent_logger', 
    'get_task_logger',
    'log_performance',
    'log_agent_activity',
    'log_task_execution',
    'log_error',
    'log_api_call',
    'log_memory_operation',
    'log_content_generation',
    'log_social_interaction',
    'log_analytics_insight',
    'log_learning_event'
]

