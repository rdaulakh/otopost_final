"""
AI Agents Coordinator
Manages communication and coordination between different AI agents
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentStatus(Enum):
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    OFFLINE = "offline"

class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4

@dataclass
class Task:
    id: str
    agent_type: str
    priority: TaskPriority
    data: Dict[str, Any]
    created_at: datetime
    deadline: Optional[datetime] = None
    retries: int = 0
    max_retries: int = 3

@dataclass
class AgentInfo:
    agent_id: str
    agent_type: str
    status: AgentStatus
    capabilities: List[str]
    current_task: Optional[Task] = None
    last_heartbeat: datetime = None
    performance_metrics: Dict[str, Any] = None

class AgentCoordinator:
    """
    Coordinates communication and task distribution between AI agents
    """
    
    def __init__(self):
        self.agents: Dict[str, AgentInfo] = {}
        self.task_queue: List[Task] = []
        self.completed_tasks: List[Task] = []
        self.failed_tasks: List[Task] = []
        self.running = False
        
    async def start(self):
        """Start the coordinator"""
        logger.info("Starting AI Agents Coordinator...")
        self.running = True
        
        # Start background tasks
        asyncio.create_task(self._monitor_agents())
        asyncio.create_task(self._process_task_queue())
        asyncio.create_task(self._cleanup_completed_tasks())
        
        logger.info("AI Agents Coordinator started successfully")
    
    async def stop(self):
        """Stop the coordinator"""
        logger.info("Stopping AI Agents Coordinator...")
        self.running = False
        logger.info("AI Agents Coordinator stopped")
    
    def register_agent(self, agent_id: str, agent_type: str, capabilities: List[str]):
        """Register a new agent"""
        agent_info = AgentInfo(
            agent_id=agent_id,
            agent_type=agent_type,
            status=AgentStatus.IDLE,
            capabilities=capabilities,
            last_heartbeat=datetime.now(),
            performance_metrics={}
        )
        
        self.agents[agent_id] = agent_info
        logger.info(f"Registered agent: {agent_id} ({agent_type})")
    
    def unregister_agent(self, agent_id: str):
        """Unregister an agent"""
        if agent_id in self.agents:
            del self.agents[agent_id]
            logger.info(f"Unregistered agent: {agent_id}")
    
    def update_agent_status(self, agent_id: str, status: AgentStatus, current_task: Optional[Task] = None):
        """Update agent status"""
        if agent_id in self.agents:
            self.agents[agent_id].status = status
            self.agents[agent_id].current_task = current_task
            self.agents[agent_id].last_heartbeat = datetime.now()
    
    def submit_task(self, agent_type: str, data: Dict[str, Any], priority: TaskPriority = TaskPriority.MEDIUM, 
                   deadline: Optional[datetime] = None) -> str:
        """Submit a new task"""
        task_id = f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.task_queue)}"
        
        task = Task(
            id=task_id,
            agent_type=agent_type,
            priority=priority,
            data=data,
            created_at=datetime.now(),
            deadline=deadline
        )
        
        # Insert task in priority order
        inserted = False
        for i, existing_task in enumerate(self.task_queue):
            if priority.value > existing_task.priority.value:
                self.task_queue.insert(i, task)
                inserted = True
                break
        
        if not inserted:
            self.task_queue.append(task)
        
        logger.info(f"Submitted task: {task_id} for {agent_type}")
        return task_id
    
    async def _monitor_agents(self):
        """Monitor agent health and status"""
        while self.running:
            try:
                current_time = datetime.now()
                
                for agent_id, agent_info in self.agents.items():
                    # Check if agent is responsive
                    if agent_info.last_heartbeat:
                        time_since_heartbeat = current_time - agent_info.last_heartbeat
                        if time_since_heartbeat > timedelta(minutes=5):
                            logger.warning(f"Agent {agent_id} hasn't responded in {time_since_heartbeat}")
                            agent_info.status = AgentStatus.OFFLINE
                    
                    # Check for stuck tasks
                    if agent_info.current_task and agent_info.status == AgentStatus.BUSY:
                        task_age = current_time - agent_info.current_task.created_at
                        if task_age > timedelta(hours=1):  # Task running for more than 1 hour
                            logger.warning(f"Task {agent_info.current_task.id} has been running for {task_age}")
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in agent monitoring: {e}")
                await asyncio.sleep(30)
    
    async def _process_task_queue(self):
        """Process tasks from the queue"""
        while self.running:
            try:
                if self.task_queue:
                    # Find available agent for the highest priority task
                    task = self.task_queue[0]
                    available_agent = self._find_available_agent(task.agent_type)
                    
                    if available_agent:
                        # Assign task to agent
                        self.task_queue.pop(0)
                        available_agent.current_task = task
                        available_agent.status = AgentStatus.BUSY
                        
                        logger.info(f"Assigned task {task.id} to agent {available_agent.agent_id}")
                        
                        # Here you would typically send the task to the agent
                        # For now, we'll simulate task execution
                        asyncio.create_task(self._simulate_task_execution(task, available_agent))
                    else:
                        logger.warning(f"No available agent for task {task.id}")
                        await asyncio.sleep(5)
                else:
                    await asyncio.sleep(1)
                    
            except Exception as e:
                logger.error(f"Error processing task queue: {e}")
                await asyncio.sleep(5)
    
    def _find_available_agent(self, agent_type: str) -> Optional[AgentInfo]:
        """Find an available agent of the specified type"""
        for agent_info in self.agents.values():
            if (agent_info.agent_type == agent_type and 
                agent_info.status == AgentStatus.IDLE):
                return agent_info
        return None
    
    async def _simulate_task_execution(self, task: Task, agent: AgentInfo):
        """Simulate task execution (replace with actual agent communication)"""
        try:
            logger.info(f"Executing task {task.id} with agent {agent.agent_id}")
            
            # Simulate task execution time
            await asyncio.sleep(2)
            
            # Mark task as completed
            task.completed_at = datetime.now()
            self.completed_tasks.append(task)
            
            # Update agent status
            agent.current_task = None
            agent.status = AgentStatus.IDLE
            
            logger.info(f"Task {task.id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error executing task {task.id}: {e}")
            
            # Handle task failure
            task.retries += 1
            if task.retries < task.max_retries:
                # Retry task
                self.task_queue.insert(0, task)
                logger.info(f"Retrying task {task.id} (attempt {task.retries + 1})")
            else:
                # Mark task as failed
                self.failed_tasks.append(task)
                logger.error(f"Task {task.id} failed after {task.max_retries} retries")
            
            # Update agent status
            agent.current_task = None
            agent.status = AgentStatus.IDLE
    
    async def _cleanup_completed_tasks(self):
        """Clean up old completed tasks"""
        while self.running:
            try:
                current_time = datetime.now()
                cutoff_time = current_time - timedelta(hours=24)
                
                # Remove old completed tasks
                self.completed_tasks = [
                    task for task in self.completed_tasks 
                    if task.completed_at and task.completed_at > cutoff_time
                ]
                
                # Remove old failed tasks
                self.failed_tasks = [
                    task for task in self.failed_tasks 
                    if task.created_at > cutoff_time
                ]
                
                await asyncio.sleep(3600)  # Clean up every hour
                
            except Exception as e:
                logger.error(f"Error cleaning up tasks: {e}")
                await asyncio.sleep(3600)
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        return {
            agent_id: {
                "agent_type": agent.agent_type,
                "status": agent.status.value,
                "capabilities": agent.capabilities,
                "current_task": agent.current_task.id if agent.current_task else None,
                "last_heartbeat": agent.last_heartbeat.isoformat() if agent.last_heartbeat else None,
                "performance_metrics": agent.performance_metrics
            }
            for agent_id, agent in self.agents.items()
        }
    
    def get_task_queue_status(self) -> Dict[str, Any]:
        """Get status of task queue"""
        return {
            "pending_tasks": len(self.task_queue),
            "completed_tasks": len(self.completed_tasks),
            "failed_tasks": len(self.failed_tasks),
            "queue": [
                {
                    "id": task.id,
                    "agent_type": task.agent_type,
                    "priority": task.priority.value,
                    "created_at": task.created_at.isoformat(),
                    "deadline": task.deadline.isoformat() if task.deadline else None
                }
                for task in self.task_queue
            ]
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics"""
        total_tasks = len(self.completed_tasks) + len(self.failed_tasks)
        success_rate = len(self.completed_tasks) / total_tasks if total_tasks > 0 else 0
        
        return {
            "total_tasks_processed": total_tasks,
            "successful_tasks": len(self.completed_tasks),
            "failed_tasks": len(self.failed_tasks),
            "success_rate": success_rate,
            "active_agents": len([a for a in self.agents.values() if a.status == AgentStatus.IDLE]),
            "busy_agents": len([a for a in self.agents.values() if a.status == AgentStatus.BUSY])
        }

# Global coordinator instance
coordinator = AgentCoordinator()

async def main():
    """Main function for testing"""
    await coordinator.start()
    
    # Register some test agents
    coordinator.register_agent("intelligence_1", "intelligence", ["trend_analysis", "competitor_research"])
    coordinator.register_agent("content_1", "content", ["content_generation", "content_optimization"])
    coordinator.register_agent("strategy_1", "strategy", ["content_planning", "campaign_strategy"])
    
    # Submit some test tasks
    coordinator.submit_task("intelligence", {"action": "analyze_trends", "topic": "AI"}, TaskPriority.HIGH)
    coordinator.submit_task("content", {"action": "generate_post", "topic": "AI trends"}, TaskPriority.MEDIUM)
    coordinator.submit_task("strategy", {"action": "plan_campaign", "campaign_type": "product_launch"}, TaskPriority.LOW)
    
    # Run for a while
    await asyncio.sleep(30)
    
    # Print status
    print("Agent Status:", json.dumps(coordinator.get_agent_status(), indent=2))
    print("Task Queue Status:", json.dumps(coordinator.get_task_queue_status(), indent=2))
    print("Performance Metrics:", json.dumps(coordinator.get_performance_metrics(), indent=2))
    
    await coordinator.stop()

if __name__ == "__main__":
    asyncio.run(main())

