"""
Agent Communication Protocol
Enables real-time communication and data sharing between agents
"""

import asyncio
import logging
import json
import uuid
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

class MessageType(Enum):
    REQUEST = "request"
    RESPONSE = "response"  
    NOTIFICATION = "notification"
    BROADCAST = "broadcast"
    DATA_SHARE = "data_share"
    TASK_HANDOFF = "task_handoff"
    STATUS_UPDATE = "status_update"

class MessagePriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

@dataclass
class AgentMessage:
    """Message structure for agent communication"""
    id: str
    message_type: MessageType
    sender_agent: str
    recipient_agent: Optional[str]  # None for broadcast
    subject: str
    data: Dict[str, Any]
    priority: MessagePriority
    created_at: datetime
    expires_at: Optional[datetime] = None
    correlation_id: Optional[str] = None  # For request-response correlation
    workflow_id: Optional[str] = None
    organization_id: Optional[str] = None

@dataclass
class DataShare:
    """Structure for sharing data between agents"""
    id: str
    source_agent: str
    data_type: str
    data: Any
    metadata: Dict[str, Any]
    created_at: datetime
    ttl_seconds: int = 3600  # 1 hour default

@dataclass
class TaskHandoff:
    """Structure for handing off tasks between agents"""
    id: str
    source_agent: str
    target_agent: str
    task_type: str
    task_data: Dict[str, Any]
    context: Dict[str, Any]
    priority: int
    deadline: Optional[datetime] = None
    handoff_reason: str = ""

class AgentCommunicationProtocol:
    """Manages communication between agents"""
    
    def __init__(self):
        self.message_queue: Dict[str, List[AgentMessage]] = {}  # agent_id -> messages
        self.subscriptions: Dict[str, List[Callable]] = {}  # agent_id -> callbacks
        self.broadcast_subscriptions: List[Callable] = []
        self.shared_data: Dict[str, DataShare] = {}
        self.pending_handoffs: Dict[str, TaskHandoff] = {}
        self.message_history: List[AgentMessage] = []
        self.running = False
        
        logger.info("Agent Communication Protocol initialized")
    
    async def start(self):
        """Start the communication protocol"""
        self.running = True
        asyncio.create_task(self._message_processor())
        asyncio.create_task(self._cleanup_expired_data())
        logger.info("Agent Communication Protocol started")
    
    async def stop(self):
        """Stop the communication protocol"""
        self.running = False
        logger.info("Agent Communication Protocol stopped")
    
    def register_agent(self, agent_id: str, callback: Optional[Callable] = None):
        """Register an agent for communication"""
        if agent_id not in self.message_queue:
            self.message_queue[agent_id] = []
        
        if callback:
            if agent_id not in self.subscriptions:
                self.subscriptions[agent_id] = []
            self.subscriptions[agent_id].append(callback)
        
        logger.info(f"Registered agent {agent_id} for communication")
    
    def subscribe_to_broadcasts(self, callback: Callable):
        """Subscribe to broadcast messages"""
        self.broadcast_subscriptions.append(callback)
    
    async def send_message(self, message: AgentMessage) -> bool:
        """Send a message to an agent or broadcast"""
        try:
            message.id = str(uuid.uuid4())
            message.created_at = datetime.utcnow()
            
            # Store in history
            self.message_history.append(message)
            
            if message.recipient_agent:
                # Direct message
                if message.recipient_agent in self.message_queue:
                    self.message_queue[message.recipient_agent].append(message)
                    
                    # Notify subscribers
                    if message.recipient_agent in self.subscriptions:
                        for callback in self.subscriptions[message.recipient_agent]:
                            try:
                                await callback(message)
                            except Exception as e:
                                logger.error(f"Error in message callback: {e}")
                    
                    logger.info(f"Message sent from {message.sender_agent} to {message.recipient_agent}")
                    return True
                else:
                    logger.warning(f"Recipient agent {message.recipient_agent} not registered")
                    return False
            else:
                # Broadcast message
                for agent_id, queue in self.message_queue.items():
                    if agent_id != message.sender_agent:  # Don't send to sender
                        queue.append(message)
                
                # Notify broadcast subscribers
                for callback in self.broadcast_subscriptions:
                    try:
                        await callback(message)
                    except Exception as e:
                        logger.error(f"Error in broadcast callback: {e}")
                
                logger.info(f"Broadcast message sent from {message.sender_agent}")
                return True
                
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return False
    
    async def get_messages(self, agent_id: str, limit: int = 10) -> List[AgentMessage]:
        """Get messages for an agent"""
        if agent_id not in self.message_queue:
            return []
        
        messages = self.message_queue[agent_id][-limit:]
        return messages
    
    async def get_unread_messages(self, agent_id: str) -> List[AgentMessage]:
        """Get unread messages for an agent"""
        if agent_id not in self.message_queue:
            return []
        
        # For now, return all messages (in production, track read status)
        messages = self.message_queue[agent_id].copy()
        # Clear the queue after retrieving
        self.message_queue[agent_id] = []
        return messages
    
    async def share_data(self, source_agent: str, data_type: str, data: Any, 
                        metadata: Optional[Dict[str, Any]] = None, ttl_seconds: int = 3600) -> str:
        """Share data that other agents can access"""
        
        data_share = DataShare(
            id=str(uuid.uuid4()),
            source_agent=source_agent,
            data_type=data_type,
            data=data,
            metadata=metadata or {},
            created_at=datetime.utcnow(),
            ttl_seconds=ttl_seconds
        )
        
        self.shared_data[data_share.id] = data_share
        
        # Notify other agents about data sharing
        notification = AgentMessage(
            id=str(uuid.uuid4()),
            message_type=MessageType.DATA_SHARE,
            sender_agent=source_agent,
            recipient_agent=None,  # Broadcast
            subject=f"Data shared: {data_type}",
            data={
                "data_share_id": data_share.id,
                "data_type": data_type,
                "metadata": metadata or {}
            },
            priority=MessagePriority.NORMAL,
            created_at=datetime.utcnow()
        )
        
        await self.send_message(notification)
        
        logger.info(f"Data shared by {source_agent}: {data_type}")
        return data_share.id
    
    def get_shared_data(self, data_share_id: str) -> Optional[DataShare]:
        """Get shared data by ID"""
        return self.shared_data.get(data_share_id)
    
    def get_shared_data_by_type(self, data_type: str, source_agent: Optional[str] = None) -> List[DataShare]:
        """Get shared data by type and optionally by source agent"""
        results = []
        for data_share in self.shared_data.values():
            if data_share.data_type == data_type:
                if source_agent is None or data_share.source_agent == source_agent:
                    results.append(data_share)
        return results
    
    async def handoff_task(self, source_agent: str, target_agent: str, task_type: str,
                          task_data: Dict[str, Any], context: Dict[str, Any], 
                          priority: int = 5, deadline: Optional[datetime] = None,
                          handoff_reason: str = "") -> str:
        """Hand off a task from one agent to another"""
        
        handoff = TaskHandoff(
            id=str(uuid.uuid4()),
            source_agent=source_agent,
            target_agent=target_agent,
            task_type=task_type,
            task_data=task_data,
            context=context,
            priority=priority,
            deadline=deadline,
            handoff_reason=handoff_reason
        )
        
        self.pending_handoffs[handoff.id] = handoff
        
        # Send handoff message
        message = AgentMessage(
            id=str(uuid.uuid4()),
            message_type=MessageType.TASK_HANDOFF,
            sender_agent=source_agent,
            recipient_agent=target_agent,
            subject=f"Task handoff: {task_type}",
            data={
                "handoff_id": handoff.id,
                "task_type": task_type,
                "task_data": task_data,
                "context": context,
                "priority": priority,
                "deadline": deadline.isoformat() if deadline else None,
                "handoff_reason": handoff_reason
            },
            priority=MessagePriority.HIGH,
            created_at=datetime.utcnow()
        )
        
        await self.send_message(message)
        
        logger.info(f"Task handed off from {source_agent} to {target_agent}: {task_type}")
        return handoff.id
    
    def get_pending_handoffs(self, target_agent: str) -> List[TaskHandoff]:
        """Get pending task handoffs for an agent"""
        return [handoff for handoff in self.pending_handoffs.values() 
                if handoff.target_agent == target_agent]
    
    def accept_handoff(self, handoff_id: str) -> Optional[TaskHandoff]:
        """Accept a task handoff"""
        if handoff_id in self.pending_handoffs:
            handoff = self.pending_handoffs.pop(handoff_id)
            logger.info(f"Task handoff accepted: {handoff_id}")
            return handoff
        return None
    
    async def send_status_update(self, agent_id: str, status: str, details: Dict[str, Any]):
        """Send status update to other agents"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            message_type=MessageType.STATUS_UPDATE,
            sender_agent=agent_id,
            recipient_agent=None,  # Broadcast
            subject=f"Status update from {agent_id}",
            data={
                "status": status,
                "details": details,
                "timestamp": datetime.utcnow().isoformat()
            },
            priority=MessagePriority.NORMAL,
            created_at=datetime.utcnow()
        )
        
        await self.send_message(message)
    
    async def request_data(self, requesting_agent: str, target_agent: str, 
                          data_request: Dict[str, Any]) -> str:
        """Request data from another agent"""
        correlation_id = str(uuid.uuid4())
        
        message = AgentMessage(
            id=str(uuid.uuid4()),
            message_type=MessageType.REQUEST,
            sender_agent=requesting_agent,
            recipient_agent=target_agent,
            subject="Data request",
            data=data_request,
            priority=MessagePriority.NORMAL,
            created_at=datetime.utcnow(),
            correlation_id=correlation_id
        )
        
        await self.send_message(message)
        return correlation_id
    
    async def respond_to_request(self, responding_agent: str, requesting_agent: str,
                               correlation_id: str, response_data: Dict[str, Any]):
        """Respond to a data request"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            message_type=MessageType.RESPONSE,
            sender_agent=responding_agent,
            recipient_agent=requesting_agent,
            subject="Data response",
            data=response_data,
            priority=MessagePriority.NORMAL,
            created_at=datetime.utcnow(),
            correlation_id=correlation_id
        )
        
        await self.send_message(message)
    
    async def _message_processor(self):
        """Background task to process messages"""
        while self.running:
            try:
                # Clean up expired messages
                current_time = datetime.utcnow()
                
                for agent_id, messages in self.message_queue.items():
                    # Remove expired messages
                    self.message_queue[agent_id] = [
                        msg for msg in messages 
                        if not msg.expires_at or msg.expires_at > current_time
                    ]
                
                await asyncio.sleep(10)  # Process every 10 seconds
                
            except Exception as e:
                logger.error(f"Error in message processor: {e}")
                await asyncio.sleep(10)
    
    async def _cleanup_expired_data(self):
        """Clean up expired shared data"""
        while self.running:
            try:
                current_time = datetime.utcnow()
                
                # Clean up expired shared data
                expired_ids = []
                for data_id, data_share in self.shared_data.items():
                    age_seconds = (current_time - data_share.created_at).total_seconds()
                    if age_seconds > data_share.ttl_seconds:
                        expired_ids.append(data_id)
                
                for data_id in expired_ids:
                    del self.shared_data[data_id]
                
                if expired_ids:
                    logger.info(f"Cleaned up {len(expired_ids)} expired data shares")
                
                # Clean up old message history (keep last 1000 messages)
                if len(self.message_history) > 1000:
                    self.message_history = self.message_history[-1000:]
                
                await asyncio.sleep(300)  # Clean up every 5 minutes
                
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
                await asyncio.sleep(300)
    
    def get_communication_stats(self) -> Dict[str, Any]:
        """Get communication statistics"""
        total_messages = len(self.message_history)
        message_types = {}
        
        for msg in self.message_history[-100:]:  # Last 100 messages
            msg_type = msg.message_type.value
            message_types[msg_type] = message_types.get(msg_type, 0) + 1
        
        return {
            "total_messages": total_messages,
            "active_agents": len(self.message_queue),
            "shared_data_items": len(self.shared_data),
            "pending_handoffs": len(self.pending_handoffs),
            "message_types_last_100": message_types,
            "broadcast_subscribers": len(self.broadcast_subscriptions)
        }

# Global communication protocol instance
communication_protocol = AgentCommunicationProtocol()

# Helper functions for agents
async def send_agent_message(sender: str, recipient: str, subject: str, 
                           data: Dict[str, Any], priority: MessagePriority = MessagePriority.NORMAL):
    """Helper function to send a message between agents"""
    message = AgentMessage(
        id=str(uuid.uuid4()),
        message_type=MessageType.NOTIFICATION,
        sender_agent=sender,
        recipient_agent=recipient,
        subject=subject,
        data=data,
        priority=priority,
        created_at=datetime.utcnow()
    )
    return await communication_protocol.send_message(message)

async def broadcast_to_agents(sender: str, subject: str, data: Dict[str, Any]):
    """Helper function to broadcast a message to all agents"""
    message = AgentMessage(
        id=str(uuid.uuid4()),
        message_type=MessageType.BROADCAST,
        sender_agent=sender,
        recipient_agent=None,
        subject=subject,
        data=data,
        priority=MessagePriority.NORMAL,
        created_at=datetime.utcnow()
    )
    return await communication_protocol.send_message(message)

async def share_agent_data(agent: str, data_type: str, data: Any, 
                          metadata: Optional[Dict[str, Any]] = None):
    """Helper function to share data between agents"""
    return await communication_protocol.share_data(agent, data_type, data, metadata)

async def get_agent_data(data_type: str, source_agent: Optional[str] = None):
    """Helper function to get shared data"""
    return communication_protocol.get_shared_data_by_type(data_type, source_agent)

