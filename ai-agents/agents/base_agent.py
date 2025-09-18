import asyncio
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime
import json
import uuid
from dataclasses import dataclass, asdict

from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain.schema import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain.callbacks.base import BaseCallbackHandler

from config.settings import settings, AgentType, get_agent_config
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_agent_activity, log_task_execution, log_error, log_performance

@dataclass
class AgentTask:
    """Represents a task for an AI agent."""
    id: str
    type: str
    priority: int
    organization_id: str
    user_id: Optional[str]
    input_data: Dict[str, Any]
    context: Dict[str, Any]
    created_at: datetime
    deadline: Optional[datetime] = None
    dependencies: List[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.metadata is None:
            self.metadata = {}

@dataclass
class AgentResponse:
    """Represents a response from an AI agent."""
    task_id: str
    agent_type: str
    success: bool
    result: Any
    confidence: float
    execution_time: float
    tokens_used: int
    cost: float
    error: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class AgentCallbackHandler(BaseCallbackHandler):
    """Custom callback handler for agent monitoring."""
    
    def __init__(self, agent_type: str, organization_id: str):
        self.agent_type = agent_type
        self.organization_id = organization_id
        self.logger = get_agent_logger(agent_type, organization_id)
        self.start_time = None
        self.tokens_used = 0
        
    def on_chain_start(self, serialized: Dict[str, Any], inputs: Dict[str, Any], **kwargs):
        self.start_time = datetime.utcnow()
        self.logger.info(f"Agent chain started: {serialized.get('name', 'unknown')}")
        
    def on_chain_end(self, outputs: Dict[str, Any], **kwargs):
        if self.start_time:
            duration = (datetime.utcnow() - self.start_time).total_seconds()
            self.logger.info(f"Agent chain completed in {duration:.2f}s")
            
    def on_chain_error(self, error: Exception, **kwargs):
        self.logger.error(f"Agent chain error: {str(error)}")
        
    def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs):
        self.logger.debug(f"LLM call started with {len(prompts)} prompts")
        
    def on_llm_end(self, response, **kwargs):
        if hasattr(response, 'llm_output') and response.llm_output:
            token_usage = response.llm_output.get('token_usage', {})
            self.tokens_used += token_usage.get('total_tokens', 0)
            self.logger.debug(f"LLM call completed. Tokens used: {token_usage}")

class BaseAgent(ABC):
    """Base class for all AI agents."""
    
    def __init__(self, agent_type: AgentType, organization_id: str):
        self.agent_type = agent_type
        self.organization_id = organization_id
        self.config = get_agent_config(agent_type)
        self.logger = get_agent_logger(agent_type.value, organization_id)
        
        # Initialize LangChain components
        self.llm = None
        self.agent_executor = None
        self.memory = None
        self.callback_handler = None
        
        # Agent state
        self.is_initialized = False
        self.is_busy = False
        self.current_task = None
        self.performance_metrics = {
            "tasks_completed": 0,
            "tasks_failed": 0,
            "average_execution_time": 0.0,
            "total_tokens_used": 0,
            "total_cost": 0.0,
            "success_rate": 0.0
        }
        
    async def initialize(self):
        """Initialize the agent with LangChain components."""
        try:
            self.logger.info(f"Initializing {self.config['name']}...")
            
            # Initialize LLM
            self.llm = ChatOpenAI(
                model=self.config.get('model', settings.default_model.value),
                temperature=self.config.get('temperature', settings.temperature),
                max_tokens=self.config.get('max_tokens', settings.max_tokens),
                openai_api_key=settings.openai_api_key,
                openai_api_base=settings.openai_api_base
            )
            
            # Initialize memory
            self.memory = ConversationBufferWindowMemory(
                k=10,  # Keep last 10 interactions
                memory_key="chat_history",
                return_messages=True
            )
            
            # Initialize callback handler
            self.callback_handler = AgentCallbackHandler(
                self.agent_type.value, 
                self.organization_id
            )
            
            # Create agent prompt
            prompt = await self._create_agent_prompt()
            
            # Initialize tools
            tools = await self._initialize_tools()
            
            # Create agent
            agent = create_openai_functions_agent(
                llm=self.llm,
                tools=tools,
                prompt=prompt
            )
            
            # Create agent executor
            self.agent_executor = AgentExecutor(
                agent=agent,
                tools=tools,
                memory=self.memory,
                callbacks=[self.callback_handler],
                verbose=settings.debug,
                max_iterations=5,
                max_execution_time=settings.agent_timeout
            )
            
            self.is_initialized = True
            self.logger.info(f"{self.config['name']} initialized successfully")
            
            # Store initialization in memory
            await self._store_agent_memory(
                f"Agent {self.config['name']} initialized with model {self.config.get('model')}",
                "initialization",
                importance=0.8
            )
            
        except Exception as e:
            log_error(e, {
                "context": f"Failed to initialize {self.agent_type.value}",
                "organization_id": self.organization_id
            }, self.agent_type.value, self.organization_id)
            raise
    
    @abstractmethod
    async def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the agent's system prompt."""
        pass
    
    @abstractmethod
    async def _initialize_tools(self) -> List:
        """Initialize agent-specific tools."""
        pass
    
    @abstractmethod
    async def _process_task(self, task: AgentTask) -> Any:
        """Process a specific task (implemented by subclasses)."""
        pass
    
    async def execute_task(self, task: AgentTask) -> AgentResponse:
        """Execute a task and return response."""
        if not self.is_initialized:
            await self.initialize()
            
        if self.is_busy:
            raise Exception(f"Agent {self.agent_type.value} is currently busy")
            
        self.is_busy = True
        self.current_task = task
        start_time = datetime.utcnow()
        
        try:
            log_task_execution(task.id, self.agent_type.value, "started", self.organization_id)
            
            # Load relevant memories
            await self._load_relevant_memories(task)
            
            # Process the task
            result = await self._process_task(task)
            
            # Calculate metrics
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            tokens_used = self.callback_handler.tokens_used if self.callback_handler else 0
            cost = self._calculate_cost(tokens_used)
            
            # Create response
            response = AgentResponse(
                task_id=task.id,
                agent_type=self.agent_type.value,
                success=True,
                result=result,
                confidence=self._calculate_confidence(result),
                execution_time=execution_time,
                tokens_used=tokens_used,
                cost=cost
            )
            
            # Update performance metrics
            await self._update_performance_metrics(response)
            
            # Store task result in memory
            await self._store_task_result(task, response)
            
            log_task_execution(task.id, self.agent_type.value, "completed", self.organization_id, {
                "execution_time": execution_time,
                "tokens_used": tokens_used,
                "cost": cost
            })
            
            return response
            
        except Exception as e:
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            response = AgentResponse(
                task_id=task.id,
                agent_type=self.agent_type.value,
                success=False,
                result=None,
                confidence=0.0,
                execution_time=execution_time,
                tokens_used=0,
                cost=0.0,
                error=str(e)
            )
            
            await self._update_performance_metrics(response)
            
            log_task_execution(task.id, self.agent_type.value, "failed", self.organization_id, {
                "error": str(e),
                "execution_time": execution_time
            })
            
            return response
            
        finally:
            self.is_busy = False
            self.current_task = None
    
    async def _load_relevant_memories(self, task: AgentTask):
        """Load relevant memories for the task."""
        try:
            # Create query from task input
            query_parts = []
            if task.input_data.get('content'):
                query_parts.append(task.input_data['content'])
            if task.input_data.get('platform'):
                query_parts.append(f"platform: {task.input_data['platform']}")
            if task.type:
                query_parts.append(f"task: {task.type}")
                
            query = " ".join(query_parts)
            
            if query:
                memories = await chroma_manager.retrieve_agent_memory(
                    self.agent_type,
                    self.organization_id,
                    query,
                    limit=5
                )
                
                # Add memories to context
                if memories:
                    memory_context = "\n".join([
                        f"Memory: {memory['content']}" 
                        for memory in memories
                    ])
                    
                    # Add to agent memory
                    self.memory.chat_memory.add_message(
                        SystemMessage(content=f"Relevant memories:\n{memory_context}")
                    )
                    
        except Exception as e:
            self.logger.warning(f"Failed to load memories: {str(e)}")
    
    async def _store_agent_memory(self, content: str, memory_type: str, importance: float = 0.5):
        """Store information in agent memory."""
        try:
            await chroma_manager.store_agent_memory(
                self.agent_type,
                self.organization_id,
                content,
                memory_type,
                importance
            )
        except Exception as e:
            self.logger.warning(f"Failed to store memory: {str(e)}")
    
    async def _store_task_result(self, task: AgentTask, response: AgentResponse):
        """Store task result in memory for future reference."""
        try:
            memory_content = f"Task: {task.type}\nInput: {json.dumps(task.input_data)}\nResult: {json.dumps(response.result) if response.success else 'Failed'}\nConfidence: {response.confidence}"
            
            await self._store_agent_memory(
                memory_content,
                "task_result",
                importance=response.confidence
            )
        except Exception as e:
            self.logger.warning(f"Failed to store task result: {str(e)}")
    
    def _calculate_cost(self, tokens_used: int) -> float:
        """Calculate cost based on tokens used."""
        # Simplified cost calculation (adjust based on actual pricing)
        model = self.config.get('model', settings.default_model.value)
        
        if 'gpt-4' in model:
            cost_per_token = 0.00003  # $0.03 per 1K tokens
        elif 'gpt-3.5' in model:
            cost_per_token = 0.000002  # $0.002 per 1K tokens
        else:
            cost_per_token = 0.00001  # Default rate
            
        return tokens_used * cost_per_token
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score for the result."""
        # Base confidence calculation (can be overridden by subclasses)
        if result is None:
            return 0.0
        
        # Simple heuristic based on result completeness
        if isinstance(result, dict):
            filled_fields = sum(1 for v in result.values() if v is not None and v != "")
            total_fields = len(result)
            return filled_fields / total_fields if total_fields > 0 else 0.5
        elif isinstance(result, str):
            return min(len(result) / 100, 1.0)  # Longer responses = higher confidence
        else:
            return 0.7  # Default confidence
    
    async def _update_performance_metrics(self, response: AgentResponse):
        """Update agent performance metrics."""
        try:
            if response.success:
                self.performance_metrics["tasks_completed"] += 1
            else:
                self.performance_metrics["tasks_failed"] += 1
            
            # Update averages
            total_tasks = self.performance_metrics["tasks_completed"] + self.performance_metrics["tasks_failed"]
            
            # Update average execution time
            current_avg = self.performance_metrics["average_execution_time"]
            self.performance_metrics["average_execution_time"] = (
                (current_avg * (total_tasks - 1) + response.execution_time) / total_tasks
            )
            
            # Update totals
            self.performance_metrics["total_tokens_used"] += response.tokens_used
            self.performance_metrics["total_cost"] += response.cost
            
            # Update success rate
            self.performance_metrics["success_rate"] = (
                self.performance_metrics["tasks_completed"] / total_tasks
            )
            
            # Store performance pattern
            if response.success:
                await chroma_manager.store_performance_pattern(
                    self.organization_id,
                    f"Agent {self.agent_type.value} completed task with {response.confidence:.2f} confidence",
                    "task_completion",
                    "system",
                    "confidence",
                    response.confidence,
                    response.confidence,
                    1
                )
                
        except Exception as e:
            self.logger.warning(f"Failed to update performance metrics: {str(e)}")
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current agent status."""
        return {
            "agent_type": self.agent_type.value,
            "organization_id": self.organization_id,
            "is_initialized": self.is_initialized,
            "is_busy": self.is_busy,
            "current_task_id": self.current_task.id if self.current_task else None,
            "performance_metrics": self.performance_metrics,
            "config": self.config
        }
    
    async def reset_memory(self):
        """Reset agent memory."""
        if self.memory:
            self.memory.clear()
        self.logger.info("Agent memory reset")
    
    async def shutdown(self):
        """Shutdown the agent gracefully."""
        self.logger.info(f"Shutting down {self.config['name']}...")
        
        if self.is_busy and self.current_task:
            self.logger.warning("Agent is busy, waiting for current task to complete...")
            # In a real implementation, you might want to wait or cancel the task
        
        self.is_initialized = False
        self.logger.info(f"{self.config['name']} shutdown complete")

# Utility functions for agent management
async def create_agent_task(
    task_type: str,
    organization_id: str,
    input_data: Dict[str, Any],
    user_id: Optional[str] = None,
    priority: int = 5,
    context: Optional[Dict[str, Any]] = None,
    deadline: Optional[datetime] = None,
    dependencies: Optional[List[str]] = None
) -> AgentTask:
    """Create a new agent task."""
    return AgentTask(
        id=str(uuid.uuid4()),
        type=task_type,
        priority=priority,
        organization_id=organization_id,
        user_id=user_id,
        input_data=input_data,
        context=context or {},
        created_at=datetime.utcnow(),
        deadline=deadline,
        dependencies=dependencies or []
    )

def serialize_agent_response(response: AgentResponse) -> Dict[str, Any]:
    """Serialize agent response for storage or transmission."""
    return asdict(response)

