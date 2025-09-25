#!/usr/bin/env python3
"""
Orchestral AI Agents Service - Enhanced with workflow orchestration
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import orchestral components
from orchestrator.enhanced_agent_coordinator import enhanced_coordinator
from services.agent_communication import AgentCommunication
from orchestrator.workflow_engine import WorkflowEngine
from utils.logger import get_orchestral_logger

logger = get_orchestral_logger("orchestral_service")

app = FastAPI(
    title="Orchestral AI Agents Service",
    description="Enhanced AI Agents with Workflow Orchestration",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Request models
class WorkflowExecuteRequest(BaseModel):
    workflow_id: str
    organization_id: str
    input_data: Dict[str, Any]
    priority: Optional[str] = "normal"

class AgentMessageRequest(BaseModel):
    from_agent: str
    to_agent: str
    message: str
    data: Optional[Dict[str, Any]] = None

# Initialize orchestral system
enhanced_coordinator.initialize()

@app.get("/")
async def root():
    return {
        "service": "Orchestral AI Agents Service",
        "version": "2.0.0",
        "status": "active",
        "features": ["workflow_orchestration", "agent_communication", "real_time_monitoring"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "orchestral_system": "active",
        "workflow_engine": "active",
        "agent_communication": "active",
        "timestamp": datetime.now().isoformat()
    }

# Orchestral Workflow Endpoints
@app.get("/orchestral/workflows")
async def list_workflows():
    """List available orchestral workflows"""
    try:
        workflows = enhanced_coordinator.workflow_engine.get_available_workflows()
        return {
            "success": True,
            "workflows": workflows,
            "count": len(workflows),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error listing workflows: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestral/workflows/execute")
async def execute_workflow(request: WorkflowExecuteRequest):
    """Execute an orchestral workflow"""
    try:
        logger.info(f"Executing workflow: {request.workflow_id} for org: {request.organization_id}")
        
        execution_id = await enhanced_coordinator.workflow_engine.execute_workflow(
            workflow_id=request.workflow_id,
            organization_id=request.organization_id,
            input_data=request.input_data,
            priority=request.priority
        )
        
        return {
            "success": True,
            "execution_id": execution_id,
            "workflow_id": request.workflow_id,
            "status": "started",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error executing workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/workflows/{execution_id}/status")
async def get_workflow_status(execution_id: str):
    """Get workflow execution status"""
    try:
        status = enhanced_coordinator.workflow_engine.get_workflow_status(execution_id)
        return {
            "success": True,
            "execution_id": execution_id,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/workflows/active")
async def get_active_workflows():
    """Get currently active workflows"""
    try:
        active_workflows = enhanced_coordinator.workflow_engine.get_active_workflows()
        return {
            "success": True,
            "active_workflows": active_workflows,
            "count": len(active_workflows),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting active workflows: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestral/workflows/{execution_id}/cancel")
async def cancel_workflow(execution_id: str):
    """Cancel workflow execution"""
    try:
        result = await enhanced_coordinator.workflow_engine.cancel_workflow(execution_id)
        return {
            "success": True,
            "execution_id": execution_id,
            "cancelled": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error cancelling workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/status")
async def get_orchestral_status():
    """Get orchestral system status"""
    try:
        agent_count = len(enhanced_coordinator.agents)
        workflow_status = enhanced_coordinator.workflow_engine.get_system_status()
        communication_status = enhanced_coordinator.communication.get_stats()
        
        return {
            "success": True,
            "status": "active",
            "agents": {
                "total": agent_count,
                "active": agent_count,
                "registered": list(enhanced_coordinator.agents.keys())
            },
            "workflow_engine": workflow_status,
            "communication": communication_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting orchestral status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/communication/stats")
async def get_communication_stats():
    """Get agent communication statistics"""
    try:
        stats = enhanced_coordinator.communication.get_stats()
        return {
            "success": True,
            "communication_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting communication stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestral/communication/send")
async def send_agent_message(request: AgentMessageRequest):
    """Send message between agents"""
    try:
        result = await enhanced_coordinator.communication.send_message(
            from_agent=request.from_agent,
            to_agent=request.to_agent,
            message=request.message,
            data=request.data
        )
        
        return {
            "success": True,
            "message_sent": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error sending agent message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/agents")
async def list_agents():
    """List all registered orchestral agents"""
    try:
        agents = []
        for agent_id, agent_info in enhanced_coordinator.agents.items():
            agent_status = {
                "agent_id": agent_id,
                "type": agent_info.get("type", "unknown"),
                "organization_id": agent_info.get("organization_id", ""),
                "status": "active",
                "orchestral_features": ["communication", "workflow_participation"],
                "last_activity": agent_info.get("last_activity", "")
            }
            agents.append(agent_status)
            
        return {
            "success": True,
            "agents": agents,
            "total_count": len(agents),
            "orchestral_enabled": True,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error listing agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("Starting Orchestral AI Agents Service on port 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")
