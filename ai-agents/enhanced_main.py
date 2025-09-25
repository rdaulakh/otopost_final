#!/usr/bin/env python3
"""
Enhanced AI Social Media Management Platform - AI Agents System with Full Orchestration
Main entry point for the orchestral AI agents system
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

from orchestrator.enhanced_agent_coordinator import enhanced_coordinator
from services.agent_communication import communication_protocol
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
        logging.FileHandler('ai_agents_orchestral.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class OrchestralAIAgentsSystem:
    """
    Orchestral AI Agents System with full integration
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
        logger.info(f"Received signal {signum}, shutting down orchestral system gracefully...")
        self.running = False
    
    async def start(self):
        """Start the orchestral AI agents system"""
        try:
            logger.info("Starting Orchestral AI Agents System...")
            self.running = True
            
            # Start enhanced coordinator with orchestral capabilities
            await enhanced_coordinator.start()
            
            # Initialize and start all agents with orchestration
            await self._initialize_orchestral_agents()
            await self._start_orchestral_agents()
            
            logger.info("🎼 Orchestral AI Agents System started successfully with full integration")
            logger.info("✅ Workflow Engine: ACTIVE")
            logger.info("✅ Agent Communication: ACTIVE")
            logger.info("✅ Real-time Orchestration: ACTIVE")
            logger.info(f"✅ Registered Agents: {len(self.agents)}")
            
            # Keep running until shutdown signal
            while self.running:
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error starting Orchestral AI Agents System: {e}")
            raise
        finally:
            await self.stop()
    
    async def stop(self):
        """Stop the orchestral AI agents system"""
        logger.info("Stopping Orchestral AI Agents System...")
        self.running = False
        
        # Stop all agents
        for agent in self.agents.values():
            try:
                await agent.stop()
            except Exception as e:
                logger.error(f"Error stopping agent: {e}")
        
        # Stop enhanced coordinator
        await enhanced_coordinator.stop()
        
        logger.info("🎼 Orchestral AI Agents System stopped")
    
    async def _initialize_orchestral_agents(self):
        """Initialize all AI agents with orchestral capabilities"""
        logger.info("Initializing orchestral agents...")
        
        # Use the default organization IDs
        default_org_id = "68ce935fcbbcac3f7e70e556"
        test_org_id = "68cef6800504f7cafa106412"
        
        # Create agents for both organizations with orchestral support
        for org_id in [default_org_id, test_org_id]:
            
            # Intelligence Agent
            intelligence_agent = IntelligenceAgent(organization_id=org_id)
            self.agents[f"intelligence_{org_id}"] = intelligence_agent
            
            # Strategy Agent  
            strategy_agent = StrategyAgent(organization_id=org_id)
            self.agents[f"strategy_{org_id}"] = strategy_agent
            
            # Content Agent
            content_agent = ContentAgent(organization_id=org_id)
            self.agents[f"content_{org_id}"] = content_agent
            
            # Execution Agent
            execution_agent = ExecutionAgent(organization_id=org_id)
            self.agents[f"execution_{org_id}"] = execution_agent
            
            # Learning Agent
            learning_agent = LearningAgent(organization_id=org_id)
            self.agents[f"learning_{org_id}"] = learning_agent
            
            # Engagement Agent
            engagement_agent = EngagementAgent(organization_id=org_id)
            self.agents[f"engagement_{org_id}"] = engagement_agent
            
            # Analytics Agent
            analytics_agent = AnalyticsAgent(organization_id=org_id)
            self.agents[f"analytics_{org_id}"] = analytics_agent
        
        # Also create base agent instances for workflow engine registry
        base_agents = {
            "intelligence": IntelligenceAgent(organization_id=default_org_id),
            "strategy": StrategyAgent(organization_id=default_org_id),
            "content": ContentAgent(organization_id=default_org_id),
            "execution": ExecutionAgent(organization_id=default_org_id),
            "learning": LearningAgent(organization_id=default_org_id),
            "engagement": EngagementAgent(organization_id=default_org_id),
            "analytics": AnalyticsAgent(organization_id=default_org_id)
        }
        
        self.agents.update(base_agents)
        
        logger.info(f"Initialized {len(self.agents)} orchestral agents for organizations {default_org_id} and {test_org_id}")
    
    async def _start_orchestral_agents(self):
        """Start all AI agents with full orchestration"""
        logger.info("Starting orchestral agents...")
        
        # Start all agents
        for agent_key, agent in self.agents.items():
            try:
                await agent.start()
                
                # Register with enhanced coordinator for full orchestration
                enhanced_coordinator.register_agent_with_orchestration(agent)
                
                logger.info(f"🤖 Started orchestral agent: {agent.agent_id}")
                
            except Exception as e:
                logger.error(f"Error starting agent {agent_key}: {e}")
        
        logger.info("🎼 All orchestral agents started and registered")
    
    def get_system_status(self):
        """Get orchestral system status"""
        return {
            "system_running": self.running,
            "agents_count": len(self.agents),
            "orchestral_status": enhanced_coordinator.get_orchestral_status(),
            "communication_stats": enhanced_coordinator.get_communication_stats(),
            "active_workflows": len(enhanced_coordinator.get_active_workflows()),
            "available_workflows": len(enhanced_coordinator.list_available_workflows())
        }

# Global system instance for coordinator access
orchestral_system = None

async def main():
    """Main function for orchestral system"""
    global orchestral_system
    
    # Create logs directory if it doesn't exist
    Path("logs").mkdir(exist_ok=True)
    
    # Initialize and start the orchestral system
    orchestral_system = OrchestralAIAgentsSystem()
    
    try:
        await orchestral_system.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down orchestral system...")
    except Exception as e:
        logger.error(f"Unexpected error in orchestral system: {e}")
        sys.exit(1)
    finally:
        if orchestral_system:
            await orchestral_system.stop()

if __name__ == "__main__":
    # Check Python version
    if sys.version_info < (3, 8):
        print("Python 3.8 or higher is required")
        sys.exit(1)
    
    # Run the orchestral system
    asyncio.run(main())

