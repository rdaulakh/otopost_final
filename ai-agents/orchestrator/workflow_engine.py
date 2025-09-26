"""
Orchestral Workflow Engine
Coordinates multi-agent workflows with real data flow and task handoffs
"""

import asyncio
import logging
import json
import uuid
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict, field
from enum import Enum
import copy

from agents.base_agent import BaseAgent, AgentTask, AgentResponse, create_agent_task
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_workflow_execution

logger = logging.getLogger(__name__)

class WorkflowStatus(Enum):
    PENDING = "pending"
    RUNNING = "running" 
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"

class StepStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class WorkflowStep:
    """Represents a single step in an orchestral workflow"""
    id: str
    agent_type: str
    task_type: str
    input_mapping: Dict[str, str]  # Maps workflow data to agent input
    output_mapping: Dict[str, str]  # Maps agent output to workflow data
    dependencies: List[str] = field(default_factory=list)
    condition: Optional[str] = None  # Conditional execution
    timeout: int = 300  # 5 minutes default
    retry_count: int = 0
    max_retries: int = 2
    status: StepStatus = StepStatus.PENDING
    agent_task_id: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

@dataclass
class WorkflowData:
    """Shared data structure for workflow execution"""
    input_data: Dict[str, Any]
    intermediate_data: Dict[str, Any] = field(default_factory=dict)
    final_result: Optional[Any] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass 
class WorkflowExecution:
    """Represents a running workflow instance"""
    id: str
    workflow_id: str
    organization_id: str
    user_id: Optional[str]
    status: WorkflowStatus
    steps: List[WorkflowStep]
    workflow_data: WorkflowData
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    current_step_index: int = 0

class WorkflowDefinition:
    """Defines an orchestral workflow template"""
    
    def __init__(self, workflow_id: str, name: str, description: str, 
                 steps: List[WorkflowStep], input_schema: Dict[str, Any],
                 output_schema: Dict[str, Any]):
        self.workflow_id = workflow_id
        self.name = name
        self.description = description
        self.steps = steps
        self.input_schema = input_schema
        self.output_schema = output_schema

class WorkflowEngine:
    """Orchestral Workflow Engine for coordinating multi-agent tasks"""
    
    def __init__(self, agent_registry: Dict[str, BaseAgent]):
        self.agent_registry = agent_registry
        self.workflow_definitions: Dict[str, WorkflowDefinition] = {}
        self.active_executions: Dict[str, WorkflowExecution] = {}
        self.execution_history: List[WorkflowExecution] = []
        self.running = False
        
        # Initialize built-in workflows
        self._register_builtin_workflows()
        
        logger.info("Workflow Engine initialized")
    
    def _register_builtin_workflows(self):
        """Register built-in orchestral workflows"""
        
        # Complete Strategy Generation Workflow
        strategy_workflow = WorkflowDefinition(
            workflow_id="complete_strategy_generation",
            name="Complete Strategy Generation",
            description="Full orchestral workflow involving all agents for comprehensive strategy creation",
            steps=[
                WorkflowStep(
                    id="intelligence_analysis",
                    agent_type="intelligence",
                    task_type="market_intelligence",
                    input_mapping={
                        "organization_id": "organization_id",
                        "target_audience": "target_audience",
                        "platforms": "platforms",
                        "objectives": "objectives",
                        "industry": "industry"
                    },
                    output_mapping={
                        "market_insights": "intelligence.market_insights",
                        "competitor_analysis": "intelligence.competitor_analysis", 
                        "audience_insights": "intelligence.audience_insights",
                        "trend_analysis": "intelligence.trend_analysis"
                    }
                ),
                WorkflowStep(
                    id="analytics_framework",
                    agent_type="analytics", 
                    task_type="kpi_framework",
                    input_mapping={
                        "organization_id": "organization_id",
                        "objectives": "objectives",
                        "platforms": "platforms",
                        "market_insights": "intelligence.market_insights"
                    },
                    output_mapping={
                        "kpi_framework": "analytics.kpi_framework",
                        "measurement_plan": "analytics.measurement_plan",
                        "baseline_metrics": "analytics.baseline_metrics"
                    },
                    dependencies=["intelligence_analysis"]
                ),
                WorkflowStep(
                    id="content_strategy",
                    agent_type="content",
                    task_type="content_planning",
                    input_mapping={
                        "organization_id": "organization_id",
                        "platforms": "platforms",
                        "objectives": "objectives",
                        "audience_insights": "intelligence.audience_insights",
                        "competitor_analysis": "intelligence.competitor_analysis"
                    },
                    output_mapping={
                        "content_pillars": "content.content_pillars",
                        "content_calendar": "content.content_calendar",
                        "content_guidelines": "content.content_guidelines"
                    },
                    dependencies=["intelligence_analysis"]
                ),
                WorkflowStep(
                    id="engagement_strategy", 
                    agent_type="engagement",
                    task_type="engagement_planning",
                    input_mapping={
                        "organization_id": "organization_id",
                        "platforms": "platforms",
                        "audience_insights": "intelligence.audience_insights",
                        "content_pillars": "content.content_pillars"
                    },
                    output_mapping={
                        "engagement_tactics": "engagement.engagement_tactics",
                        "community_guidelines": "engagement.community_guidelines",
                        "response_templates": "engagement.response_templates"
                    },
                    dependencies=["intelligence_analysis", "content_strategy"]
                ),
                WorkflowStep(
                    id="learning_optimization",
                    agent_type="learning",
                    task_type="optimization_planning",
                    input_mapping={
                        "organization_id": "organization_id",
                        "kpi_framework": "analytics.kpi_framework",
                        "content_calendar": "content.content_calendar"
                    },
                    output_mapping={
                        "ab_test_plan": "learning.ab_test_plan",
                        "optimization_schedule": "learning.optimization_schedule",
                        "learning_metrics": "learning.learning_metrics"
                    },
                    dependencies=["analytics_framework", "content_strategy"]
                ),
                WorkflowStep(
                    id="execution_planning",
                    agent_type="execution", 
                    task_type="publishing_strategy",
                    input_mapping={
                        "organization_id": "organization_id",
                        "platforms": "platforms",
                        "content_calendar": "content.content_calendar",
                        "engagement_tactics": "engagement.engagement_tactics"
                    },
                    output_mapping={
                        "publishing_schedule": "execution.publishing_schedule",
                        "automation_rules": "execution.automation_rules",
                        "quality_gates": "execution.quality_gates"
                    },
                    dependencies=["content_strategy", "engagement_strategy"]
                ),
                WorkflowStep(
                    id="strategy_synthesis",
                    agent_type="strategy",
                    task_type="strategy_synthesis",
                    input_mapping={
                        "organization_id": "organization_id",
                        "intelligence_data": "intelligence",
                        "analytics_data": "analytics", 
                        "content_data": "content",
                        "engagement_data": "engagement",
                        "learning_data": "learning",
                        "execution_data": "execution"
                    },
                    output_mapping={
                        "final_strategy": "strategy.final_strategy"
                    },
                    dependencies=["intelligence_analysis", "analytics_framework", "content_strategy", 
                                "engagement_strategy", "learning_optimization", "execution_planning"]
                )
            ],
            input_schema={
                "organization_id": {"type": "string", "required": True},
                "user_id": {"type": "string", "required": False},
                "objectives": {"type": "array", "required": True},
                "platforms": {"type": "array", "required": True},
                "target_audience": {"type": "string", "required": True},
                "timeframe": {"type": "string", "required": False, "default": "30d"},
                "industry": {"type": "string", "required": False}
            },
            output_schema={
                "strategy": {"type": "object"},
                "execution_plan": {"type": "object"},
                "monitoring_framework": {"type": "object"}
            }
        )
        
        # Content Creation Workflow
        content_workflow = WorkflowDefinition(
            workflow_id="intelligent_content_creation",
            name="Intelligent Content Creation",
            description="Orchestral content creation with intelligence, optimization, and engagement",
            steps=[
                WorkflowStep(
                    id="trend_analysis",
                    agent_type="intelligence",
                    task_type="trend_analysis",
                    input_mapping={
                        "organization_id": "organization_id",
                        "platform": "platform",
                        "topic": "topic",
                        "target_audience": "target_audience"
                    },
                    output_mapping={
                        "trending_topics": "intelligence.trending_topics",
                        "hashtag_recommendations": "intelligence.hashtag_recommendations",
                        "optimal_timing": "intelligence.optimal_timing"
                    }
                ),
                WorkflowStep(
                    id="content_generation",
                    agent_type="content",
                    task_type="content_creation",
                    input_mapping={
                        "organization_id": "organization_id",
                        "platform": "platform",
                        "topic": "topic",
                        "trending_topics": "intelligence.trending_topics",
                        "hashtag_recommendations": "intelligence.hashtag_recommendations"
                    },
                    output_mapping={
                        "generated_content": "content.generated_content"
                    },
                    dependencies=["trend_analysis"]
                ),
                WorkflowStep(
                    id="content_optimization",
                    agent_type="learning",
                    task_type="content_optimization", 
                    input_mapping={
                        "organization_id": "organization_id",
                        "content": "content.generated_content",
                        "platform": "platform"
                    },
                    output_mapping={
                        "optimized_content": "learning.optimized_content",
                        "performance_prediction": "learning.performance_prediction"
                    },
                    dependencies=["content_generation"]
                ),
                WorkflowStep(
                    id="engagement_enhancement",
                    agent_type="engagement",
                    task_type="engagement_optimization",
                    input_mapping={
                        "organization_id": "organization_id",
                        "content": "learning.optimized_content",
                        "platform": "platform"
                    },
                    output_mapping={
                        "final_content": "engagement.final_content",
                        "engagement_strategy": "engagement.engagement_strategy"
                    },
                    dependencies=["content_optimization"]
                ),
                WorkflowStep(
                    id="schedule_publishing",
                    agent_type="execution",
                    task_type="schedule_content",
                    input_mapping={
                        "organization_id": "organization_id",
                        "content": "engagement.final_content",
                        "platform": "platform", 
                        "optimal_timing": "intelligence.optimal_timing"
                    },
                    output_mapping={
                        "publishing_plan": "execution.publishing_plan"
                    },
                    dependencies=["engagement_enhancement"]
                )
            ],
            input_schema={
                "organization_id": {"type": "string", "required": True},
                "platform": {"type": "string", "required": True},
                "topic": {"type": "string", "required": True},
                "target_audience": {"type": "string", "required": False}
            },
            output_schema={
                "content": {"type": "object"},
                "publishing_plan": {"type": "object"}
            }
        )
        
        # Performance Analysis Workflow
        performance_workflow = WorkflowDefinition(
            workflow_id="performance_analysis_optimization",
            name="Performance Analysis & Optimization", 
            description="Comprehensive performance analysis with learning and optimization recommendations",
            steps=[
                WorkflowStep(
                    id="data_collection",
                    agent_type="analytics",
                    task_type="performance_analysis",
                    input_mapping={
                        "organization_id": "organization_id",
                        "platforms": "platforms",
                        "timeframe": "timeframe"
                    },
                    output_mapping={
                        "performance_data": "analytics.performance_data",
                        "key_metrics": "analytics.key_metrics"
                    }
                ),
                WorkflowStep(
                    id="intelligence_insights",
                    agent_type="intelligence", 
                    task_type="performance_intelligence",
                    input_mapping={
                        "organization_id": "organization_id",
                        "performance_data": "analytics.performance_data",
                        "platforms": "platforms"
                    },
                    output_mapping={
                        "insights": "intelligence.insights",
                        "benchmarking": "intelligence.benchmarking"
                    },
                    dependencies=["data_collection"]
                ),
                WorkflowStep(
                    id="learning_analysis",
                    agent_type="learning",
                    task_type="pattern_analysis",
                    input_mapping={
                        "organization_id": "organization_id",
                        "performance_data": "analytics.performance_data",
                        "insights": "intelligence.insights"
                    },
                    output_mapping={
                        "patterns": "learning.patterns",
                        "recommendations": "learning.recommendations"
                    },
                    dependencies=["data_collection", "intelligence_insights"]
                ),
                WorkflowStep(
                    id="strategy_updates",
                    agent_type="strategy",
                    task_type="strategy_optimization",
                    input_mapping={
                        "organization_id": "organization_id",
                        "performance_data": "analytics.performance_data",
                        "insights": "intelligence.insights", 
                        "recommendations": "learning.recommendations"
                    },
                    output_mapping={
                        "updated_strategy": "strategy.updated_strategy"
                    },
                    dependencies=["learning_analysis"]
                )
            ],
            input_schema={
                "organization_id": {"type": "string", "required": True},
                "platforms": {"type": "array", "required": True},
                "timeframe": {"type": "string", "required": False, "default": "7d"}
            },
            output_schema={
                "analysis_report": {"type": "object"},
                "optimization_plan": {"type": "object"}
            }
        )
        
        self.workflow_definitions["complete_strategy_generation"] = strategy_workflow
        self.workflow_definitions["intelligent_content_creation"] = content_workflow  
        self.workflow_definitions["performance_analysis_optimization"] = performance_workflow
        
        logger.info(f"Registered {len(self.workflow_definitions)} built-in workflows")
    
    async def start(self):
        """Start the workflow engine"""
        self.running = True
        asyncio.create_task(self._workflow_monitor())
        logger.info("Workflow Engine started")
    
    async def stop(self):
        """Stop the workflow engine"""
        self.running = False
        logger.info("Workflow Engine stopped")
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict[str, Any],
                             organization_id: str, user_id: Optional[str] = None) -> str:
        """Execute an orchestral workflow"""
        
        if workflow_id not in self.workflow_definitions:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow_def = self.workflow_definitions[workflow_id]
        execution_id = str(uuid.uuid4())
        
        # Create workflow execution instance
        execution = WorkflowExecution(
            id=execution_id,
            workflow_id=workflow_id,
            organization_id=organization_id,
            user_id=user_id,
            status=WorkflowStatus.PENDING,
            steps=copy.deepcopy(workflow_def.steps),
            workflow_data=WorkflowData(input_data=input_data),
            created_at=datetime.utcnow()
        )
        
        self.active_executions[execution_id] = execution
        
        # Start workflow execution
        asyncio.create_task(self._execute_workflow_steps(execution))
        
        log_workflow_execution(
            execution_id, workflow_id, "started", organization_id,
            {"input_data": input_data, "steps_count": len(execution.steps)}
        )
        
        return execution_id
    
    async def _execute_workflow_steps(self, execution: WorkflowExecution):
        """Execute workflow steps with proper orchestration"""
        
        try:
            execution.status = WorkflowStatus.RUNNING
            execution.started_at = datetime.utcnow()
            
            logger.info(f"Starting workflow execution {execution.id}")
            
            # Execute steps based on dependencies
            completed_steps = set()
            
            while len(completed_steps) < len(execution.steps):
                # Find steps that can be executed
                ready_steps = []
                
                for step in execution.steps:
                    if (step.status == StepStatus.PENDING and 
                        all(dep in completed_steps for dep in step.dependencies)):
                        ready_steps.append(step)
                
                if not ready_steps:
                    # Check if we're stuck
                    pending_steps = [s for s in execution.steps if s.status == StepStatus.PENDING]
                    if pending_steps:
                        execution.status = WorkflowStatus.FAILED
                        execution.error = "Workflow stuck - circular dependencies or failed dependencies"
                        break
                    else:
                        break
                
                # Execute ready steps in parallel
                tasks = []
                for step in ready_steps:
                    tasks.append(self._execute_step(execution, step))
                
                # Wait for all parallel steps to complete
                step_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results
                for i, result in enumerate(step_results):
                    step = ready_steps[i]
                    if isinstance(result, Exception):
                        step.status = StepStatus.FAILED
                        step.error = str(result)
                        logger.error(f"Step {step.id} failed: {result}")
                    else:
                        step.status = StepStatus.COMPLETED
                        completed_steps.add(step.id)
                        logger.info(f"Step {step.id} completed successfully")
                
                # Check if any critical step failed
                failed_steps = [s for s in ready_steps if s.status == StepStatus.FAILED]
                if failed_steps:
                    execution.status = WorkflowStatus.FAILED
                    execution.error = f"Critical steps failed: {[s.id for s in failed_steps]}"
                    break
            
            # Finalize workflow
            if execution.status == WorkflowStatus.RUNNING:
                execution.status = WorkflowStatus.COMPLETED
                execution.completed_at = datetime.utcnow()
                
                # Set final result from last step or combine results
                final_step = execution.steps[-1]
                if final_step.result:
                    execution.workflow_data.final_result = final_step.result
                
                logger.info(f"Workflow execution {execution.id} completed successfully")
            else:
                execution.completed_at = datetime.utcnow()
                logger.error(f"Workflow execution {execution.id} failed: {execution.error}")
            
            # Store in history and clean up
            self.execution_history.append(execution)
            
            # Store workflow result in memory for future reference
            await self._store_workflow_result(execution)
            
        except Exception as e:
            execution.status = WorkflowStatus.FAILED
            execution.error = str(e)
            execution.completed_at = datetime.utcnow()
            logger.error(f"Workflow execution {execution.id} failed with exception: {e}")
    
    async def _execute_step(self, execution: WorkflowExecution, step: WorkflowStep):
        """Execute a single workflow step"""
        
        step.status = StepStatus.RUNNING
        step.started_at = datetime.utcnow()
        
        try:
            # Get agent instance
            agent = self.agent_registry.get(step.agent_type)
            if not agent:
                raise ValueError(f"Agent {step.agent_type} not found in registry")
            
            # Map input data from workflow data
            agent_input = self._map_input_data(execution.workflow_data, step.input_mapping)
            
            # Create agent task
            agent_task = await create_agent_task(
                task_type=step.task_type,
                organization_id=execution.organization_id,
                input_data=agent_input,
                user_id=execution.user_id,
                priority=5  # High priority for workflow tasks
            )
            
            step.agent_task_id = agent_task.id
            
            # Execute task with timeout
            response = await asyncio.wait_for(
                agent.execute_task(agent_task),
                timeout=step.timeout
            )
            
            if response.success:
                step.result = response.result
                
                # Map output data to workflow data
                self._map_output_data(execution.workflow_data, step.output_mapping, response.result)
                
                step.completed_at = datetime.utcnow()
                logger.info(f"Step {step.id} completed successfully")
                
            else:
                raise Exception(f"Agent task failed: {response.error}")
                
        except asyncio.TimeoutError:
            step.retry_count += 1
            if step.retry_count <= step.max_retries:
                logger.warning(f"Step {step.id} timed out, retrying ({step.retry_count}/{step.max_retries})")
                step.status = StepStatus.PENDING  # Reset for retry
                await self._execute_step(execution, step)
            else:
                step.status = StepStatus.FAILED
                step.error = "Step timed out after maximum retries"
                raise Exception(step.error)
                
        except Exception as e:
            step.retry_count += 1
            if step.retry_count <= step.max_retries:
                logger.warning(f"Step {step.id} failed, retrying ({step.retry_count}/{step.max_retries}): {e}")
                step.status = StepStatus.PENDING  # Reset for retry
                await asyncio.sleep(2)  # Brief delay before retry
                await self._execute_step(execution, step)
            else:
                step.status = StepStatus.FAILED
                step.error = str(e)
                step.completed_at = datetime.utcnow()
                raise
    
    def _map_input_data(self, workflow_data: WorkflowData, input_mapping: Dict[str, str]) -> Dict[str, Any]:
        """Map workflow data to agent input using input mapping"""
        agent_input = {}
        
        for agent_key, workflow_path in input_mapping.items():
            value = self._get_nested_value(workflow_data, workflow_path)
            if value is not None:
                agent_input[agent_key] = value
        
        return agent_input
    
    def _map_output_data(self, workflow_data: WorkflowData, output_mapping: Dict[str, str], agent_result: Any):
        """Map agent output to workflow data using output mapping"""
        
        for agent_key, workflow_path in output_mapping.items():
            if isinstance(agent_result, dict) and agent_key in agent_result:
                self._set_nested_value(workflow_data, workflow_path, agent_result[agent_key])
            elif agent_key == "result":  # Default mapping for full result
                self._set_nested_value(workflow_data, workflow_path, agent_result)
    
    def _get_nested_value(self, workflow_data: WorkflowData, path: str) -> Any:
        """Get nested value from workflow data using dot notation"""
        
        # Check input data first
        if path in workflow_data.input_data:
            return workflow_data.input_data[path]
        
        # Check intermediate data with nested path
        parts = path.split('.')
        current = workflow_data.intermediate_data
        
        for part in parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
        
        return current
    
    def _set_nested_value(self, workflow_data: WorkflowData, path: str, value: Any):
        """Set nested value in workflow data using dot notation"""
        
        parts = path.split('.')
        current = workflow_data.intermediate_data
        
        # Navigate to the parent of the target key
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        
        # Set the final value
        current[parts[-1]] = value
    
    async def _store_workflow_result(self, execution: WorkflowExecution):
        """Store workflow result in memory for future reference"""
        try:
            content = f"Workflow: {execution.workflow_id}\nStatus: {execution.status.value}\nSteps: {len(execution.steps)}\nResult: {json.dumps(execution.workflow_data.final_result) if execution.workflow_data.final_result else 'None'}"
            
            await chroma_manager.store_agent_memory(
                "workflow",
                execution.organization_id,
                content,
                "workflow_execution",
                importance=0.9 if execution.status == WorkflowStatus.COMPLETED else 0.3
            )
        except Exception as e:
            logger.warning(f"Failed to store workflow result: {e}")
    
    async def _workflow_monitor(self):
        """Monitor active workflows and handle timeouts"""
        while self.running:
            try:
                current_time = datetime.utcnow()
                
                # Check for timed out executions
                for execution_id, execution in list(self.active_executions.items()):
                    if (execution.status == WorkflowStatus.RUNNING and 
                        execution.started_at and
                        current_time - execution.started_at > timedelta(hours=2)):  # 2 hour timeout
                        
                        execution.status = WorkflowStatus.FAILED
                        execution.error = "Workflow execution timed out"
                        execution.completed_at = current_time
                        
                        self.execution_history.append(execution)
                        del self.active_executions[execution_id]
                        
                        logger.warning(f"Workflow execution {execution_id} timed out")
                
                # Clean up completed executions older than 1 hour
                for execution_id, execution in list(self.active_executions.items()):
                    if (execution.status in [WorkflowStatus.COMPLETED, WorkflowStatus.FAILED] and
                        execution.completed_at and  
                        current_time - execution.completed_at > timedelta(hours=1)):
                        
                        del self.active_executions[execution_id]
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in workflow monitor: {e}")
                await asyncio.sleep(30)
    
    def get_execution_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a workflow execution"""
        
        # Check active executions
        if execution_id in self.active_executions:
            execution = self.active_executions[execution_id]
            return self._serialize_execution(execution)
        
        # Check history
        for execution in self.execution_history:
            if execution.id == execution_id:
                return self._serialize_execution(execution)
        
        return None
    
    def _serialize_execution(self, execution: WorkflowExecution) -> Dict[str, Any]:
        """Serialize workflow execution for API response"""
        return {
            "id": execution.id,
            "workflow_id": execution.workflow_id,
            "organization_id": execution.organization_id,
            "user_id": execution.user_id,
            "status": execution.status.value,
            "created_at": execution.created_at.isoformat(),
            "started_at": execution.started_at.isoformat() if execution.started_at else None,
            "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
            "error": execution.error,
            "steps": [
                {
                    "id": step.id,
                    "agent_type": step.agent_type,
                    "task_type": step.task_type,
                    "status": step.status.value,
                    "started_at": step.started_at.isoformat() if step.started_at else None,
                    "completed_at": step.completed_at.isoformat() if step.completed_at else None,
                    "error": step.error,
                    "retry_count": step.retry_count
                }
                for step in execution.steps
            ],
            "final_result": execution.workflow_data.final_result,
            "progress": len([s for s in execution.steps if s.status == StepStatus.COMPLETED]) / len(execution.steps) * 100
        }
    
    def list_workflows(self) -> List[Dict[str, Any]]:
        """List available workflows"""
        return [
            {
                "workflow_id": wf.workflow_id,
                "name": wf.name,
                "description": wf.description,
                "steps_count": len(wf.steps),
                "input_schema": wf.input_schema,
                "output_schema": wf.output_schema
            }
            for wf in self.workflow_definitions.values()
        ]
    
    def get_active_executions(self) -> List[Dict[str, Any]]:
        """Get all active workflow executions"""
        return [self._serialize_execution(execution) for execution in self.active_executions.values()]
    
    async def cancel_execution(self, execution_id: str) -> bool:
        """Cancel a running workflow execution"""
        if execution_id in self.active_executions:
            execution = self.active_executions[execution_id]
            execution.status = WorkflowStatus.CANCELLED
            execution.completed_at = datetime.utcnow()
            
            # Move to history
            self.execution_history.append(execution)
            del self.active_executions[execution_id]
            
            logger.info(f"Workflow execution {execution_id} cancelled")
            return True
        
        return False

