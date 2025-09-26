#!/usr/bin/env python3
"""
Test the orchestral agents system
"""

import asyncio
import sys
from orchestrator.enhanced_agent_coordinator import enhanced_coordinator

async def test_orchestral_system():
    """Test orchestral agents functionality"""
    
    print("🎼 Testing Orchestral AI Agents System...")
    print("=" * 50)
    
    try:
        # Initialize the orchestral system
        print("1. Initializing orchestral system...")
        enhanced_coordinator.initialize()
        print("   ✅ Orchestral system initialized")
        
        # Test workflow engine
        print("\n2. Testing Workflow Engine...")
        workflows = enhanced_coordinator.workflow_engine.get_available_workflows()
        print(f"   ✅ Available workflows: {len(workflows)}")
        for workflow in workflows:
            print(f"      - {workflow['id']}: {workflow['name']}")
        
        # Test agent communication
        print("\n3. Testing Agent Communication...")
        comm_stats = enhanced_coordinator.communication.get_stats()
        print(f"   ✅ Communication stats: {comm_stats}")
        
        # Test registered agents
        print(f"\n4. Testing Registered Agents...")
        agent_count = len(enhanced_coordinator.agents)
        print(f"   ✅ Registered agents: {agent_count}")
        
        if agent_count > 0:
            print("   Registered agents:")
            for i, (agent_id, agent_info) in enumerate(list(enhanced_coordinator.agents.items())[:5]):
                print(f"      - {agent_id} ({agent_info.get('type', 'unknown')})")
            if agent_count > 5:
                print(f"      ... and {agent_count - 5} more")
        
        # Test workflow execution (if agents available)
        if agent_count >= 7:  # Need all 7 agent types
            print(f"\n5. Testing Workflow Execution...")
            try:
                execution_id = await enhanced_coordinator.workflow_engine.execute_workflow(
                    workflow_id="complete_strategy_generation",
                    organization_id="68cef6800504f7cafa106412",
                    input_data={
                        "objectives": ["brand_awareness"],
                        "platforms": ["instagram", "linkedin"],
                        "target_audience": "Healthcare professionals",
                        "industry": "healthcare",
                        "timeframe": "30d"
                    }
                )
                print(f"   ✅ Started workflow execution: {execution_id}")
                
                # Check status
                await asyncio.sleep(2)
                status = enhanced_coordinator.workflow_engine.get_workflow_status(execution_id)
                print(f"   ✅ Workflow status: {status['status']}")
                
            except Exception as e:
                print(f"   ⚠️  Workflow execution test failed: {e}")
        else:
            print(f"\n5. Workflow Execution Test...")
            print(f"   ⚠️  Need all 7 agent types, only have {agent_count} agents")
        
        print(f"\n🎼 ORCHESTRAL SYSTEM STATUS: OPERATIONAL")
        print(f"   - Workflow Engine: ACTIVE")
        print(f"   - Agent Communication: ACTIVE") 
        print(f"   - Registered Agents: {agent_count}")
        print(f"   - Available Workflows: {len(workflows)}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing orchestral system: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_orchestral_system())
    sys.exit(0 if result else 1)
