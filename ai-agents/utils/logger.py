"""
Enhanced logging utilities for AI agents system with workflow support
"""

import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

# Create logs directory if it doesn't exist
Path("logs").mkdir(exist_ok=True)

def get_agent_logger(agent_type: str, organization_id: str) -> logging.Logger:
    """Get logger for specific agent"""
    logger_name = f"agent.{agent_type}.{organization_id}"
    logger = logging.getLogger(logger_name)
    
    if not logger.handlers:
        handler = logging.FileHandler(f"logs/{agent_type}_{organization_id}.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    return logger

def log_agent_activity(agent_type: str, activity: str, organization_id: str, data: Optional[Dict[str, Any]] = None):
    """Log agent activity"""
    logger = get_agent_logger(agent_type, organization_id)
    message = f"Activity: {activity}"
    if data:
        message += f" - Data: {json.dumps(data, default=str)}"
    logger.info(message)

def log_task_execution(task_id: str, agent_type: str, status: str, organization_id: str, metadata: Optional[Dict[str, Any]] = None):
    """Log task execution"""
    logger = get_agent_logger(agent_type, organization_id)
    message = f"Task {task_id} - Status: {status}"
    if metadata:
        message += f" - Metadata: {json.dumps(metadata, default=str)}"
    logger.info(message)

def log_error(error: Exception, context: Dict[str, Any], agent_type: str, organization_id: str):
    """Log error with context"""
    logger = get_agent_logger(agent_type, organization_id)
    message = f"Error: {str(error)} - Context: {json.dumps(context, default=str)}"
    logger.error(message)

def log_performance(agent_type: str, organization_id: str, metrics: Dict[str, Any]):
    """Log performance metrics"""
    logger = get_agent_logger(agent_type, organization_id)
    message = f"Performance Metrics: {json.dumps(metrics, default=str)}"
    logger.info(message)

def log_content_generation(organization_id: str, platform: str, content_type: str, success: bool):
    """Log content generation activity"""
    logger = get_agent_logger("content", organization_id)
    message = f"Content Generation - Platform: {platform}, Type: {content_type}, Success: {success}"
    logger.info(message)

def log_analytics_insight(organization_id: str, insight_type: str, confidence: float, impact: str):
    """Log analytics insight"""
    logger = get_agent_logger("analytics", organization_id)
    message = f"Analytics Insight - Type: {insight_type}, Confidence: {confidence}, Impact: {impact}"
    logger.info(message)

def log_workflow_execution(execution_id: str, workflow_id: str, status: str, organization_id: str, metadata: Optional[Dict[str, Any]] = None):
    """Log workflow execution"""
    logger = logging.getLogger("workflow.execution")
    
    if not logger.handlers:
        handler = logging.FileHandler("logs/workflow_execution.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    message = f"Workflow {workflow_id} (Execution: {execution_id}) - Status: {status} - Org: {organization_id}"
    if metadata:
        message += f" - Metadata: {json.dumps(metadata, default=str)}"
    logger.info(message)

def log_agent_communication(sender: str, recipient: str, message_type: str, subject: str):
    """Log agent communication"""
    logger = logging.getLogger("agent.communication")
    
    if not logger.handlers:
        handler = logging.FileHandler("logs/agent_communication.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    message = f"Communication - From: {sender} To: {recipient} Type: {message_type} Subject: {subject}"
    logger.info(message)


# Create default logger for backward compatibility
logger = logging.getLogger('ai_agents_system')
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


# Additional compatibility functions
def get_logger(name: str = 'ai_agents_system') -> logging.Logger:
    """Get logger by name"""
    return logging.getLogger(name)

def log_memory_operation(operation: str, **kwargs):
    """Log memory operations"""
    logger.info(f"Memory operation: {operation}", extra=kwargs)

def log_error(error: Exception, context: str = ""):
    """Log errors"""
    logger.error(f"Error in {context}: {str(error)}", exc_info=True)


def get_orchestral_logger(name: str = 'orchestral_system') -> logging.Logger:
    """Get orchestral logger"""
    logger = logging.getLogger(f"orchestral.{name}")
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

