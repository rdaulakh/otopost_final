"""
Enhanced Agent Coordinator with Orchestral Workflow Support
Integrates the workflow engine and communication protocol for full orchestration
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from orchestrator.agent_coordinator import AgentCoordinator, coordinator
from orchestrator.workflow_engine import WorkflowEngine
from services.agent_communication import AgentCommunicationProtocol, communication_protocol
from agents.base_agent import BaseAgent
from utils.logger import log_workflow_execution, log_agent_communication

logger = logging.getLogger(__name__)

class EnhancedAgentCoordinator(AgentCoordinator):
    """Enhanced coordinator with orchestral workflow capabilities"""
    
    def __init__(self):
        super().__init__()
        self.workflow_engine: Optional[WorkflowEngine] = None
        self.communication_protocol: Optional[AgentCommunicationProtocol] = None
        self.agents_registry: Dict[str, BaseAgent] = {}
        
    async def start(self):
        """Start the enhanced coordinator with orchestral capabilities"""
        logger.info("Starting Enhanced Agent Coordinator with Orchestral Workflows...")
        
        # Start base coordinator
        await super().start()
        
        # Initialize workflow engine
        self.workflow_engine = WorkflowEngine(self.agents_registry)
        await self.workflow_engine.start()
        
        # Initialize communication protocol  
        self.communication_protocol = communication_protocol
        await self.communication_protocol.start()
        
        # Start orchestral monitoring
        asyncio.create_task(self._orchestral_monitor())
        
        logger.info("Enhanced Agent Coordinator with Orchestral Workflows started successfully")
    
    async def stop(self):
        """Stop the enhanced coordinator"""
        logger.info("Stopping Enhanced Agent Coordinator...")
        
        if self.workflow_engine:
            await self.workflow_engine.stop()
        
        if self.communication_protocol:
            await self.communication_protocol.stop()
        
        await super().stop()
        
        logger.info("Enhanced Agent Coordinator stopped")
    
    def register_agent_with_orchestration(self, agent: BaseAgent):
        """Register agent with full orchestration support"""
        agent_id = agent.agent_id
        agent_type = agent.agent_type.value
        
        # Register with base coordinator
        self.register_agent(agent_id, agent_type, agent.get_capabilities()["capabilities"])
        
        # Register with orchestral systems
        self.agents_registry[agent_type] = agent
        
        # Register for communication
        if self.communication_protocol:
            self.communication_protocol.register_agent(agent_id, self._create_message_callback(agent))
        
        logger.info(f"Agent {agent_id} registered with full orchestration support")
    
    def _create_message_callback(self, agent: BaseAgent):
        """Create message callback for agent communication"""
        async def callback(message):
            try:
                # Handle different message types
                if message.message_type.value == "task_handoff":
                    await self._handle_task_handoff(agent, message)
                elif message.message_type.value == "data_share":
                    await self._handle_data_share_notification(agent, message)
                elif message.message_type.value == "status_update":
                    await self._handle_status_update(agent, message)
                elif message.message_type.value == "request":
                    await self._handle_data_request(agent, message)
                
                log_agent_communication(
                    message.sender_agent, 
                    agent.agent_id, 
                    message.message_type.value, 
                    message.subject
                )
                
            except Exception as e:
                logger.error(f"Error handling message for agent {agent.agent_id}: {e}")
        
        return callback
    
    async def _handle_task_handoff(self, agent: BaseAgent, message):
        """Handle task handoff message"""
        handoff_id = message.data.get("handoff_id")
        if handoff_id and self.communication_protocol:
            handoff = self.communication_protocol.accept_handoff(handoff_id)
            if handoff:
                # Convert handoff to agent task and execute
                from agents.base_agent import create_agent_task
                task = await create_agent_task(
                    task_type=handoff.task_type,
                    organization_id=agent.organization_id,
                    input_data=handoff.task_data,
                    priority=handoff.priority,
                    context=handoff.context
                )
                
                # Execute task asynchronously
                asyncio.create_task(agent.execute_task(task))
                logger.info(f"Task handoff accepted and executed by {agent.agent_id}")
    
    async def _handle_data_share_notification(self, agent: BaseAgent, message):
        """Handle data share notification"""
        data_share_id = message.data.get("data_share_id")
        data_type = message.data.get("data_type")
        
        logger.info(f"Agent {agent.agent_id} notified of shared data: {data_type} (ID: {data_share_id})")
    
    async def _handle_status_update(self, agent: BaseAgent, message):
        """Handle status update from other agents"""
        sender = message.sender_agent
        status = message.data.get("status")
        details = message.data.get("details", {})
        
        logger.info(f"Status update received by {agent.agent_id} from {sender}: {status}")
    
    async def _handle_data_request(self, agent: BaseAgent, message):
        """Handle data request from other agents"""
        requesting_agent = message.sender_agent
        correlation_id = message.correlation_id
        request_data = message.data
        
        # This would be implemented based on agent capabilities
        logger.info(f"Data request received by {agent.agent_id} from {requesting_agent}")
    
    async def execute_orchestral_workflow(self, workflow_id: str, input_data: Dict[str, Any],
                                        organization_id: str, user_id: Optional[str] = None) -> str:
        """Execute an orchestral workflow"""
        if not self.workflow_engine:
            raise Exception("Workflow engine not initialized")
        
        execution_id = await self.workflow_engine.execute_workflow(
            workflow_id, input_data, organization_id, user_id
        )
        
        log_workflow_execution(
            execution_id, workflow_id, "started", organization_id,
            {"workflow_type": "orchestral", "steps": "multiple_agents"}
        )
        
        return execution_id
    
    def get_workflow_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a workflow execution"""
        if not self.workflow_engine:
            return None
        
        return self.workflow_engine.get_execution_status(execution_id)
    
    def list_available_workflows(self) -> List[Dict[str, Any]]:
        """List all available orchestral workflows"""
        if not self.workflow_engine:
            return []
        
        return self.workflow_engine.list_workflows()
    
    def get_active_workflows(self) -> List[Dict[str, Any]]:
        """Get all active workflow executions"""
        if not self.workflow_engine:
            return []
        
        return self.workflow_engine.get_active_executions()
    
    async def cancel_workflow(self, execution_id: str) -> bool:
        """Cancel a running workflow"""
        if not self.workflow_engine:
            return False
        
        return await self.workflow_engine.cancel_execution(execution_id)
    
    def get_communication_stats(self) -> Dict[str, Any]:
        """Get agent communication statistics"""
        if not self.communication_protocol:
            return {}
        
        return self.communication_protocol.get_communication_stats()
    
    async def broadcast_to_agents(self, sender_id: str, subject: str, data: Dict[str, Any]):
        """Broadcast message to all agents"""
        if self.communication_protocol:
            from services.agent_communication import broadcast_to_agents
            await broadcast_to_agents(sender_id, subject, data)
    
    async def share_data_between_agents(self, source_agent: str, data_type: str, 
                                      data: Any, metadata: Optional[Dict[str, Any]] = None):
        """Share data between agents"""
        if self.communication_protocol:
            from services.agent_communication import share_agent_data
            return await share_agent_data(source_agent, data_type, data, metadata)
        return None
    
    async def _orchestral_monitor(self):
        """Monitor orchestral operations"""
        while self.running:
            try:
                # Monitor workflow executions
                if self.workflow_engine:
                    active_workflows = self.workflow_engine.get_active_executions()
                    if active_workflows:
                        logger.debug(f"Active workflows: {len(active_workflows)}")
                
                # Monitor agent communications
                if self.communication_protocol:
                    comm_stats = self.communication_protocol.get_communication_stats()
                    logger.debug(f"Communication stats: {comm_stats}")
                
                await asyncio.sleep(60)  # Monitor every minute
                
            except Exception as e:
                logger.error(f"Error in orchestral monitor: {e}")
                await asyncio.sleep(60)
    
    def get_orchestral_status(self) -> Dict[str, Any]:
        """Get comprehensive orchestral status"""
        status = self.get_agent_status()
        
        # Add workflow engine status
        if self.workflow_engine:
            status["workflow_engine"] = {
                "active_executions": len(self.workflow_engine.get_active_executions()),
                "available_workflows": len(self.workflow_engine.list_workflows()),
                "execution_history": len(self.workflow_engine.execution_history)
            }
        
        # Add communication status
        if self.communication_protocol:
            status["communication"] = self.communication_protocol.get_communication_stats()
        
        status["orchestral_features"] = {
            "workflow_engine_enabled": self.workflow_engine is not None,
            "communication_enabled": self.communication_protocol is not None,
            "registered_agents": len(self.agents_registry),
            "orchestral_mode": True
        }
        
        return status

# Create enhanced coordinator instance
enhanced_coordinator = EnhancedAgentCoordinator()

