#!/usr/bin/env python3
"""
AI Social Media Management Platform - AI Agents System
Main entry point for the AI agents orchestrator
"""

import asyncio
import logging
import signal
import sys
import os
from datetime import datetime
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from orchestrator.agent_coordinator import coordinator
from agents.intelligence.intelligence_agent import IntelligenceAgent
from agents.strategy.strategy_agent import StrategyAgent
from agents.content.content_agent import ContentAgent
from agents.execution.execution_agent import ExecutionAgent
from agents.learning.learning_agent import LearningAgent
from agents.engagement.engagement_agent import EngagementAgent
from agents.analytics.analytics_agent import AnalyticsAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_agents.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class AIAgentsSystem:
    """
    Main AI Agents System
    Manages all AI agents and their coordination
    """
    
    def __init__(self):
        self.agents = {}
        self.running = False
        self.setup_signal_handlers()
    
    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, shutting down gracefully...")
        self.running = False
    
    async def start(self):
        """Start the AI agents system"""
        try:
            logger.info("Starting AI Agents System...")
            self.running = True
            
            # Start the coordinator
            await coordinator.start()
            
            # Initialize and start all agents
            await self._initialize_agents()
            await self._start_agents()
            
            logger.info("AI Agents System started successfully")
            
            # Keep running until shutdown signal
            while self.running:
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error starting AI Agents System: {e}")
            raise
        finally:
            await self.stop()
    
    async def stop(self):
        """Stop the AI agents system"""
        logger.info("Stopping AI Agents System...")
        self.running = False
        
        # Stop all agents
        for agent in self.agents.values():
            try:
                await agent.stop()
            except Exception as e:
                logger.error(f"Error stopping agent: {e}")
        
        # Stop the coordinator
        await coordinator.stop()
        
        logger.info("AI Agents System stopped")
    
    async def _initialize_agents(self):
        """Initialize all AI agents"""
        logger.info("Initializing AI agents...")
        
        # Use the default organization ID that matches the registered agents
        default_org_id = "68ce935fcbbcac3f7e70e556"
        test_org_id = "68cef6800504f7cafa106412"  # Test organization ID
        
        # Intelligence Agent
        intelligence_agent = IntelligenceAgent(
            organization_id=default_org_id
        )
        self.agents["intelligence"] = intelligence_agent
        
        # Strategy Agent
        strategy_agent = StrategyAgent(
            organization_id=default_org_id
        )
        self.agents["strategy"] = strategy_agent
        
        # Content Agent
        content_agent = ContentAgent(
            organization_id=default_org_id
        )
        self.agents["content"] = content_agent
        
        # Execution Agent
        execution_agent = ExecutionAgent(
            organization_id=default_org_id
        )
        self.agents["execution"] = execution_agent
        
        # Learning Agent
        learning_agent = LearningAgent(
            organization_id=default_org_id
        )
        self.agents["learning"] = learning_agent
        
        # Engagement Agent
        engagement_agent = EngagementAgent(
            organization_id=default_org_id
        )
        self.agents["engagement"] = engagement_agent
        
        # Analytics Agent
        analytics_agent = AnalyticsAgent(
            organization_id=default_org_id
        )
        self.agents["analytics"] = analytics_agent
        
        # Create agents for test organization
        test_intelligence_agent = IntelligenceAgent(
            organization_id=test_org_id
        )
        self.agents[f"intelligence_{test_org_id}"] = test_intelligence_agent
        
        test_strategy_agent = StrategyAgent(
            organization_id=test_org_id
        )
        self.agents[f"strategy_{test_org_id}"] = test_strategy_agent
        
        test_content_agent = ContentAgent(
            organization_id=test_org_id
        )
        self.agents[f"content_{test_org_id}"] = test_content_agent
        
        test_execution_agent = ExecutionAgent(
            organization_id=test_org_id
        )
        self.agents[f"execution_{test_org_id}"] = test_execution_agent
        
        test_learning_agent = LearningAgent(
            organization_id=test_org_id
        )
        self.agents[f"learning_{test_org_id}"] = test_learning_agent
        
        test_engagement_agent = EngagementAgent(
            organization_id=test_org_id
        )
        self.agents[f"engagement_{test_org_id}"] = test_engagement_agent
        
        test_analytics_agent = AnalyticsAgent(
            organization_id=test_org_id
        )
        self.agents[f"analytics_{test_org_id}"] = test_analytics_agent
        
        logger.info(f"Initialized {len(self.agents)} AI agents for organizations {default_org_id} and {test_org_id}")
    
    async def _start_agents(self):
        """Start all AI agents"""
        logger.info("Starting AI agents...")
        
        # Register agents with coordinator
        for agent_type, agent in self.agents.items():
            coordinator.register_agent(
                agent_id=agent.agent_id,
                agent_type=agent_type,
                capabilities=agent.get_capabilities()
            )
        
        # Start all agents
        for agent in self.agents.values():
            try:
                await agent.start()
                logger.info(f"Started agent: {agent.agent_id}")
            except Exception as e:
                logger.error(f"Error starting agent {agent.agent_id}: {e}")
        
        logger.info("All AI agents started")
    
    def get_system_status(self):
        """Get system status"""
        return {
            "system_running": self.running,
            "agents_count": len(self.agents),
            "coordinator_status": coordinator.get_agent_status(),
            "task_queue_status": coordinator.get_task_queue_status(),
            "performance_metrics": coordinator.get_performance_metrics()
        }

# Global system instance for coordinator access
system = None

async def main():
    """Main function"""
    global system
    
    # Create logs directory if it doesn't exist
    Path("logs").mkdir(exist_ok=True)
    
    # Initialize and start the system
    system = AIAgentsSystem()
    
    try:
        await system.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)
    finally:
        await system.stop()

if __name__ == "__main__":
    # Check Python version
    if sys.version_info < (3, 8):
        print("Python 3.8 or higher is required")
        sys.exit(1)
    
    # Run the system
    asyncio.run(main())

