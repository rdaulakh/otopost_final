#!/usr/bin/env python3
"""
Simple AI Service for AI Social Media Platform
Provides a FastAPI interface for AI agents
"""

import asyncio
import logging
import sys
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_service.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="AI Agents Service",
    description="AI Social Media Platform - AI Agents Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TaskRequest(BaseModel):
    task_type: str = Field(..., description="Type of task to execute")
    organization_id: str = Field(..., description="Organization ID")
    user_id: str = Field(..., description="User ID")
    input_data: Dict[str, Any] = Field(..., description="Input data for the task")
    priority: str = Field(default="medium", description="Task priority")

class AgentInfo(BaseModel):
    agentId: str
    name: str
    type: str
    organizationId: str
    status: str
    isEnabled: bool
    performanceMetrics: Dict[str, Any]
    health: Dict[str, Any]

class AgentResponse(BaseModel):
    success: bool
    agent_id: str
    task_id: str
    result: Any
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    service: str
    agents_count: int
    timestamp: str

class AgentsListResponse(BaseModel):
    success: bool
    data: Dict[str, Any]

# Mock agents data
MOCK_AGENTS = [
    {
        "agentId": "68ce935fcbbcac3f7e70e556_strategy_agent",
        "name": "Strategy Agent",
        "type": "strategy_agent",
        "organizationId": "68ce935fcbbcac3f7e70e556",
        "status": "active",
        "isEnabled": True,
        "performanceMetrics": {
            "tasksCompleted": 0,
            "tasksFailed": 0,
            "efficiency": 95
        },
        "health": {
            "status": "healthy",
            "lastCheck": datetime.now().isoformat()
        }
    },
    {
        "agentId": "68ce935fcbbcac3f7e70e556_content_agent",
        "name": "Content Agent",
        "type": "content_agent",
        "organizationId": "68ce935fcbbcac3f7e70e556",
        "status": "active",
        "isEnabled": True,
        "performanceMetrics": {
            "tasksCompleted": 0,
            "tasksFailed": 0,
            "efficiency": 95
        },
        "health": {
            "status": "healthy",
            "lastCheck": datetime.now().isoformat()
        }
    },
    {
        "agentId": "68ce935fcbbcac3f7e70e556_analytics_agent",
        "name": "Analytics Agent",
        "type": "analytics_agent",
        "organizationId": "68ce935fcbbcac3f7e70e556",
        "status": "active",
        "isEnabled": True,
        "performanceMetrics": {
            "tasksCompleted": 0,
            "tasksFailed": 0,
            "efficiency": 95
        },
        "health": {
            "status": "healthy",
            "lastCheck": datetime.now().isoformat()
        }
    }
]

# Routes
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="AI Agents Service",
        agents_count=len(MOCK_AGENTS),
        timestamp=datetime.now().isoformat()
    )

@app.get("/agents", response_model=AgentsListResponse)
async def get_agents():
    """Get all available agents"""
    try:
        # Get agents from database or return mock agents
        agents_list = await get_agents_from_database()
        
        # If no agents in database, return mock agents
        if not agents_list:
            agents_list = [
            {
                "agentId": "strategy_68cef6800504f7cafa106412",
                "name": "Strategy Agent",
                "type": "strategy_agent",
                "organizationId": "68cef6800504f7cafa106412",
                "status": "active",
            "isEnabled": True,
                "performanceMetrics": {
                    "efficiency": 95.0,
                    "successRate": 98.0,
                    "avgResponseTime": 1.2
                },
            "health": {
                "status": "healthy",
                    "lastCheck": datetime.now().isoformat()
                }
            },
            {
                "agentId": "content_68cef6800504f7cafa106412",
                "name": "Content Agent",
                "type": "content_agent",
                "organizationId": "68cef6800504f7cafa106412",
                "status": "active",
                "isEnabled": True,
                "performanceMetrics": {
                    "efficiency": 92.0,
                    "successRate": 96.0,
                    "avgResponseTime": 0.8
                },
                "health": {
                    "status": "healthy",
                    "lastCheck": datetime.now().isoformat()
                }
            },
            {
                "agentId": "intelligence_68cef6800504f7cafa106412",
                "name": "Intelligence Agent",
                "type": "intelligence_agent",
                "organizationId": "68cef6800504f7cafa106412",
                "status": "active",
                "isEnabled": True,
                "performanceMetrics": {
                    "efficiency": 98.0,
                    "successRate": 99.0,
                    "avgResponseTime": 0.5
                },
                "health": {
                    "status": "healthy",
                    "lastCheck": datetime.now().isoformat()
                }
            }
        ]
        
        return AgentsListResponse(
        success=True,
        data={
            "agents": agents_list,
            "summary": {
                "totalAgents": len(agents_list),
                    "activeAgents": len(agents_list),
                "avgEfficiency": 95.0,
                    "totalTasks": 0,
                "systemStatus": "excellent"
            }
            },
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        return AgentsListResponse(
            success=True,
            data={
                "agents": [],
                "summary": {
                    "totalAgents": 0,
                    "activeAgents": 0,
                    "avgEfficiency": 95.0,
                    "totalTasks": 0,
                    "systemStatus": "excellent"
                }
            },
            timestamp=datetime.now().isoformat()
    )

@app.get("/agents/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: str):
    """Get specific agent information"""
    agent = next((a for a in MOCK_AGENTS if a["agentId"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentInfo(**agent)

@app.post("/agents/{agent_id}/process", response_model=AgentResponse)
async def process_task(agent_id: str, request: TaskRequest):
    """Process a task with a specific agent"""
    logger.info(f"=== PROCESS_TASK CALLED ===")
    logger.info(f"Agent ID: {agent_id}")
    logger.info(f"Task Type: {request.task_type}")
    logger.info(f"Input Data: {request.input_data}")
    
    # Find the agent - dynamic lookup for any organization
    agent = None
    
    # First check if agent exists in the database
    if agent_id in AGENTS_DATABASE:
        agent_data = AGENTS_DATABASE[agent_id]
        agent = {
            "agentId": agent_id,
            "name": agent_data.get("name", "Unknown Agent"),
            "type": agent_data.get("type", "unknown_agent"),
            "organizationId": agent_data.get("organizationId", "unknown"),
            "status": agent_data.get("status", "active"),
            "isEnabled": agent_data.get("isEnabled", True)
        }
        logger.info(f"Found agent in database: {agent_id}")
    else:
        # Check if it's a strategy agent for any organization (dynamic lookup)
        if agent_id.startswith("strategy_agent_"):
            # Extract organization ID from agent ID
            org_id = agent_id.replace("strategy_agent_", "")
            agent = {
                "agentId": agent_id,
                "name": "Strategy Agent",
                "type": "strategy_agent",
                "organizationId": org_id,
                "status": "active",
                "isEnabled": True
            }
            logger.info(f"Created dynamic strategy agent for organization: {org_id}")
        elif agent_id.startswith("strategy_"):
            # Handle old format strategy agent IDs
            org_id = agent_id.replace("strategy_", "")
            agent = {
                "agentId": agent_id,
                "name": "Strategy Agent",
                "type": "strategy_agent",
                "organizationId": org_id,
                "status": "active",
                "isEnabled": True
            }
            logger.info(f"Created dynamic strategy agent (old format) for organization: {org_id}")
        else:
            # Fallback to mock agents
            agent = next((a for a in MOCK_AGENTS if a["agentId"] == agent_id), None)
            if not agent:
                logger.error(f"Agent not found: {agent_id}")
                raise HTTPException(status_code=404, detail="Agent not found")
    
    logger.info(f"Found agent: {agent}")
    
    # Generate task ID
    task_id = f"task_{int(datetime.now().timestamp() * 1000000)}"
    
    # Process the task based on type
    logger.info(f"Calling process_task_by_type with task_type: {request.task_type}")
    result = await process_task_by_type(request.task_type, request.input_data, agent)
    
    logger.info(f"Task completed with result: {result.get('name', 'No name')}")
    
    return AgentResponse(
        success=True,
        agent_id=agent_id,
        task_id=task_id,
        result=result,
        timestamp=datetime.now().isoformat()
    )

async def process_task_by_type(task_type: str, input_data: Dict[str, Any], agent: Dict[str, Any]) -> Dict[str, Any]:
    """Process task based on type"""
    
    if task_type == "generate_strategy":
        return await generate_strategy(input_data)
    elif task_type == "generate_content":
        return await generate_content(input_data)
    elif task_type == "analyze_content":
        return await analyze_content(input_data)
    elif task_type == "content_strategy":
        return await generate_content_strategy(input_data)
    elif task_type == "market_research":
        return await generate_market_research(input_data)
    elif task_type == "kpi_definition":
        return await generate_kpi_definition(input_data)
    elif task_type == "strategy_optimization":
        return await generate_strategy_optimization(input_data)
    elif task_type == "strategy_synthesis":
        return await generate_strategy_synthesis(input_data)
    else:
        return {
            "error": f"Unknown task type: {task_type}",
            "supported_types": [
                "generate_strategy", "generate_content", "analyze_content",
                "content_strategy", "market_research", "kpi_definition",
                "strategy_optimization", "strategy_synthesis"
            ]
        }

async def generate_strategy(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI strategy using orchestral approach - Intelligence Agent gathers data, Strategy Agent creates strategy"""
    logger.info("=== GENERATE_STRATEGY CALLED ===")
    logger.info(f"Input data: {input_data}")
    
    # Extract basic info
    organization_id = input_data.get("organization_id", "68ce935fcbbcac3f7e70e556")
    user_id = input_data.get("user_id", "default_user")
    
    logger.info("🤖 Starting orchestral AI strategy generation...")
    logger.info("Step 1: Intelligence Agent gathering organization data...")
    
    # Step 1: Intelligence Agent gathers organization data
    intelligence_data = await gather_organization_intelligence(organization_id)
    
    logger.info("Step 2: Strategy Agent creating strategy based on intelligence data...")
    
    # Step 2: Strategy Agent creates strategy using intelligence data
    strategy_result = await create_strategy_from_intelligence(intelligence_data, organization_id, user_id)
    
    logger.info("✅ AI strategy generation completed successfully")
    return strategy_result

async def gather_organization_intelligence(organization_id: str) -> Dict[str, Any]:
    """Intelligence Agent gathers comprehensive organization data"""
    logger.info(f"🔍 Intelligence Agent gathering data for organization: {organization_id}")
    
    # In a real implementation, this would query the database
    # For now, we'll simulate the intelligence gathering process
    
    # Simulate intelligence gathering process
    intelligence_data = {
        "organization_id": organization_id,
        "basic_info": {
            "name": "Final Company Updated",
            "industry": "healthcare",
            "business_type": "b2b2c",
            "company_size": "11-50",
            "website": "https://final-updated.com",
            "description": "Give full details on healthcare."
        },
        "brand_settings": {
            "brand_voice": "authoritative",
            "content_style": "modern",
            "primary_color": "#3B82F6",
            "brand_guidelines": None
        },
        "marketing_strategy": {
            "target_audience": "Updated healthcare professionals and patients",
            "business_objectives": [
                "lead_generation",
                "brand_awareness", 
                "customer_engagement",
                "sales_growth",
                "customer_support",
                "community_building",
                "thought_leadership",
                "market_research"
            ],
            "posting_frequency": "2-times-week",
            "geographic_reach": "International",
            "content_categories": []
        },
        "ai_agent_config": {
            "agent_personality": "balanced",
            "content_approval_required": True,
            "auto_publish_enabled": False,
            "learning_enabled": True,
            "custom_instructions": None
        },
        "platform_connections": {
            "instagram": False,
            "facebook": False,
            "linkedin": False,
            "twitter": True,
            "youtube": False,
            "tiktok": False
        },
        "ai_preferences": {
            "content_types": {
                "text": True,
                "images": False,
                "videos": False,
                "stories": True,
                "reels": True
            },
            "platforms": {
                "instagram": False,
                "facebook": False,
                "linkedin": False,
                "twitter": True,
                "tiktok": False
            },
            "optimization": {
                "best_times": True,
                "hashtags": True,
                "captions": True,
                "engagement": True
            },
            "notifications": {
                "content_ready": True,
                "performance_alerts": False,
                "weekly_reports": True,
                "monthly_insights": False
            },
            "creativity_level": "Creative",
            "content_tone": "Playful"
        },
        "analysis_insights": {
            "strengths": [
                "Clear target audience in healthcare sector",
                "Comprehensive business objectives",
                "International reach capability",
                "Balanced AI agent personality"
            ],
            "opportunities": [
                "Expand platform presence beyond Twitter",
                "Leverage video content for healthcare education",
                "Build community engagement",
                "Utilize thought leadership positioning"
            ],
            "recommendations": [
                "Focus on LinkedIn for B2B healthcare professionals",
                "Use Instagram for patient engagement",
                "Create educational video content",
                "Implement weekly reporting system"
            ]
        }
    }
    
    logger.info(f"📊 Intelligence Agent gathered {len(intelligence_data)} data categories")
    return intelligence_data

async def create_strategy_from_intelligence(intelligence_data: Dict[str, Any], organization_id: str, user_id: str) -> Dict[str, Any]:
    """Strategy Agent creates comprehensive strategy based on intelligence data"""
    logger.info("🎯 Strategy Agent creating strategy from intelligence data...")
    
    # Extract key data from intelligence
    basic_info = intelligence_data["basic_info"]
    marketing_strategy = intelligence_data["marketing_strategy"]
    brand_settings = intelligence_data["brand_settings"]
    platform_connections = intelligence_data["platform_connections"]
    ai_preferences = intelligence_data["ai_preferences"]
    analysis_insights = intelligence_data["analysis_insights"]
    
    # Determine active platforms based on connections and preferences
    active_platforms = [platform for platform, connected in platform_connections.items() 
                       if connected or ai_preferences["platforms"].get(platform, False)]
    
    # If no platforms are active, use recommended platforms
    if not active_platforms:
        active_platforms = ["linkedin", "twitter", "instagram"]  # Default recommendations
    
    # Create strategy based on intelligence
    strategy_name = f"AI-Generated Strategy - {datetime.now().strftime('%m/%d/%Y')}"
    strategy_description = f"Comprehensive {basic_info['industry']} social media strategy for {basic_info['name']} targeting {marketing_strategy['target_audience']} with {brand_settings['brand_voice']} voice."
    
    # Generate weekly plans based on posting frequency
    weekly_plans = generate_weekly_plans_from_intelligence(marketing_strategy, active_platforms)
    
    # Generate platform-specific strategies
    platform_strategies = []
    for platform in active_platforms:
        platform_strategies.append({
            "platform": platform,
            "focus": f"Build {marketing_strategy['target_audience']} engagement through {platform} content",
            "strategy": f"Optimized {platform} strategy for {basic_info['industry']} industry",
            "contentMix": get_platform_content_mix_from_preferences(platform, ai_preferences),
            "postingFrequency": marketing_strategy["posting_frequency"],
            "targetAudience": marketing_strategy["target_audience"],
            "keyMessages": [
                f"Establish thought leadership in {basic_info['industry']}",
                f"Engage with {marketing_strategy['target_audience']}",
                f"Drive {marketing_strategy['business_objectives'][0].replace('_', ' ')}"
            ],
            "hashtags": generate_hashtags_from_intelligence(platform, basic_info["industry"], marketing_strategy["business_objectives"]),
            "contentTypes": get_content_types_from_preferences(platform, ai_preferences),
            "aiInsights": analysis_insights["recommendations"]
        })
    
    # Generate KPIs based on business objectives
    kpis = generate_kpis_from_objectives(marketing_strategy["business_objectives"])
    
    # Generate next steps based on analysis insights
    next_steps = analysis_insights["recommendations"]
    
    # Construct the final strategy response
    strategy_result = {
        "name": strategy_name,
        "description": strategy_description,
        "userId": user_id,
        "organizationId": organization_id,
        "status": "active",
        "confidence": 95,
        "priority": "high",
        "aiGenerated": True,
        "aiProvider": "ai-agents",
        "timeframe": "1 month",  # Default to 1 month as requested
        "platforms": active_platforms,
        "strategy": {
            "weeklyPlans": weekly_plans,
            "platformStrategies": platform_strategies,
            "contentMix": {
                "video": 30 if ai_preferences["content_types"]["videos"] else 20,
                "image": 40 if ai_preferences["content_types"]["images"] else 30,
                "text": 30 if ai_preferences["content_types"]["text"] else 20,
                "interactive": 0
            },
            "kpis": kpis,
            "nextSteps": next_steps
        },
        "performance": {
            "engagement_rate": 0,
            "reach": 0,
            "conversion_rate": 0,
            "followers_growth": 0,
            "website_traffic": 0
        },
        "context": {
            "platforms": active_platforms,
            "objectives": marketing_strategy["business_objectives"],
            "targetAudience": marketing_strategy["target_audience"],
            "businessGoals": marketing_strategy["business_objectives"],
            "currentChallenges": "Gathered from organization data",
            "organizationContext": {
                "name": basic_info["name"],
                "industry": basic_info["industry"],
                "businessType": basic_info["business_type"],
                "companySize": basic_info["company_size"],
                "brandVoice": brand_settings["brand_voice"],
                "contentStyle": brand_settings["content_style"],
                "postingFrequency": marketing_strategy["posting_frequency"],
                "geographicReach": marketing_strategy["geographic_reach"]
            },
            "intelligenceData": intelligence_data
        },
        "objectives": marketing_strategy["business_objectives"],
        "startDate": datetime.now().isoformat(),
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    logger.info(f"✅ Strategy Agent created comprehensive strategy for {len(active_platforms)} platforms")
    return strategy_result

def generate_weekly_plans_from_intelligence(marketing_strategy: Dict[str, Any], platforms: list) -> list:
    """Generate weekly plans based on intelligence data"""
    posting_frequency = marketing_strategy.get("posting_frequency", "daily")
    weeks = 4  # 1 month default
    
    plans = []
    for week in range(1, weeks + 1):
        week_plan = {
            "week": week,
            "focus": f"Week {week} - {marketing_strategy['target_audience']} engagement",
                "platforms": platforms,
            "contentCount": 2 if "2-times" in posting_frequency else 7 if "daily" in posting_frequency else 3,
            "themes": [
                f"Healthcare education content",
                f"Professional insights for {marketing_strategy['target_audience']}",
                f"Industry thought leadership"
            ],
            "goals": [
                f"Engage {marketing_strategy['target_audience']}",
                f"Drive {marketing_strategy['business_objectives'][0].replace('_', ' ')}",
                "Build brand authority"
            ]
        }
        plans.append(week_plan)
    
    return plans

def get_platform_content_mix_from_preferences(platform: str, ai_preferences: Dict[str, Any]) -> Dict[str, int]:
    """Get content mix based on AI preferences"""
    content_types = ai_preferences.get("content_types", {})
    
    base_mix = {
        "video": 20,
        "image": 30,
        "text": 40,
        "interactive": 10
    }
    
    # Adjust based on preferences
    if content_types.get("videos"):
        base_mix["video"] = 40
        base_mix["text"] = 30
    elif content_types.get("images"):
        base_mix["image"] = 50
        base_mix["text"] = 30
    
    return base_mix

def generate_hashtags_from_intelligence(platform: str, industry: str, business_objectives: list) -> list:
    """Generate hashtags based on intelligence data"""
    base_hashtags = [f"#{industry}", f"#{platform}"]
    
    # Add objective-based hashtags
    for objective in business_objectives[:3]:  # Top 3 objectives
        objective_tag = objective.replace("_", "").title()
        base_hashtags.append(f"#{objective_tag}")
    
    # Add platform-specific hashtags
    if platform == "twitter":
        base_hashtags.extend(["#Healthcare", "#Professional", "#Innovation"])
    elif platform == "linkedin":
        base_hashtags.extend(["#Healthcare", "#B2B", "#ThoughtLeadership"])
    elif platform == "instagram":
        base_hashtags.extend(["#Healthcare", "#Wellness", "#Education"])
    
    return base_hashtags[:10]  # Limit to 10 hashtags

def get_content_types_from_preferences(platform: str, ai_preferences: Dict[str, Any]) -> list:
    """Get content types based on AI preferences"""
    content_types = ai_preferences.get("content_types", {})
    platform_types = []
    
    if content_types.get("text"):
        platform_types.append("text")
    if content_types.get("images"):
        platform_types.append("image")
    if content_types.get("videos"):
        platform_types.append("video")
    if content_types.get("stories"):
        platform_types.append("story")
    if content_types.get("reels"):
        platform_types.append("reel")
    
    return platform_types if platform_types else ["text", "image"]

def generate_kpis_from_objectives(business_objectives: list) -> Dict[str, Any]:
    """Generate KPIs based on business objectives"""
    kpis = {}
    
    for objective in business_objectives:
        if objective == "lead_generation":
            kpis["leadGeneration"] = {"target": 50, "current": 0, "unit": "leads/month"}
        elif objective == "brand_awareness":
            kpis["reach"] = {"target": 10000, "current": 0, "unit": "people"}
        elif objective == "customer_engagement":
            kpis["engagementRate"] = {"target": 3.5, "current": 0, "unit": "%"}
        elif objective == "sales_growth":
            kpis["conversionRate"] = {"target": 2.5, "current": 0, "unit": "%"}
        elif objective == "community_building":
            kpis["followers"] = {"target": 1000, "current": 0, "unit": "followers"}
        elif objective == "thought_leadership":
            kpis["brandMentions"] = {"target": 100, "current": 0, "unit": "mentions/month"}
    
    # Add default KPIs if none were set
    if not kpis:
        kpis = {
            "engagementRate": {"target": 3.5, "current": 0, "unit": "%"},
            "reach": {"target": 10000, "current": 0, "unit": "people"},
            "followers": {"target": 1000, "current": 0, "unit": "followers"}
        }
    
    return kpis

def generate_weekly_plans(timeframe: str, platforms: list) -> list:
    """Generate weekly plans based on timeframe and platforms"""
    weeks = 4 if "month" in timeframe.lower() else 12 if "quarter" in timeframe.lower() else 52
    plans = []
    
    for week in range(1, min(weeks + 1, 13)):  # Limit to 12 weeks max
        plans.append({
            "week": week,
            "theme": f"Week {week} Focus",
            "objectives": [
                "Increase brand awareness",
                "Engage target audience",
                "Drive conversions"
            ],
            "platforms": {
                platform: {
                    "posts": 3 if platform in ["instagram", "twitter"] else 2,
                    "focus": "Educational content" if week % 2 == 1 else "Promotional content",
                    "hashtags": ["#business", "#growth", "#success"]
                }
                for platform in platforms
            },
            "contentTypes": ["image", "video", "text"],
            "kpis": {
                "engagement": {"target": 3.0 + (week * 0.1), "current": 0},
                "reach": {"target": 5000 + (week * 500), "current": 0},
                "followers": {"target": 100 + (week * 25), "current": 0}
            }
        })
    
    return plans

def get_platform_content_mix(platform: str) -> dict:
    """Get content mix for specific platform"""
    mixes = {
        "instagram": {"video": 50, "image": 40, "text": 10, "interactive": 0},
        "linkedin": {"video": 30, "image": 20, "text": 45, "interactive": 5},
        "twitter": {"video": 25, "image": 35, "text": 35, "interactive": 5},
        "facebook": {"video": 40, "image": 35, "text": 20, "interactive": 5},
        "youtube": {"video": 90, "image": 5, "text": 5, "interactive": 0}
    }
    return mixes.get(platform, {"video": 30, "image": 30, "text": 30, "interactive": 10})

def get_posting_frequency(platform: str) -> str:
    """Get recommended posting frequency for platform"""
    frequencies = {
        "instagram": "1-2 posts per day",
        "linkedin": "1 post per day",
        "twitter": "3-5 posts per day",
        "facebook": "1-2 posts per day",
        "youtube": "1-2 videos per week"
    }
    return frequencies.get(platform, "1 post per day")

def generate_hashtags(platform: str, industry: str, business_goals: str) -> list:
    """Generate relevant hashtags for platform and industry"""
    base_hashtags = ["#business", "#growth", "#success", "#marketing"]
    industry_hashtags = {
        "healthcare": ["#healthcare", "#wellness", "#medical"],
        "technology": ["#tech", "#innovation", "#digital"],
        "finance": ["#finance", "#money", "#investment"],
        "education": ["#education", "#learning", "#knowledge"]
    }
    platform_hashtags = {
        "instagram": ["#instagood", "#photooftheday"],
        "linkedin": ["#linkedin", "#professional"],
        "twitter": ["#twitter", "#tweet"],
        "facebook": ["#facebook", "#social"]
    }
    
    hashtags = base_hashtags + industry_hashtags.get(industry, []) + platform_hashtags.get(platform, [])
    return hashtags[:10]  # Limit to 10 hashtags

def get_content_types(platform: str) -> list:
    """Get content types for platform"""
    types = {
        "instagram": ["posts", "stories", "reels", "igtv"],
        "linkedin": ["posts", "articles", "videos", "polls"],
        "twitter": ["tweets", "threads", "spaces"],
        "facebook": ["posts", "stories", "videos", "events"],
        "youtube": ["videos", "shorts", "live"]
    }
    return types.get(platform, ["posts", "videos"])

def get_best_posting_times(platform: str) -> list:
    """Get best posting times for platform"""
    times = {
        "instagram": ["9:00 AM", "12:00 PM", "5:00 PM"],
        "linkedin": ["8:00 AM", "12:00 PM", "5:00 PM"],
        "twitter": ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"],
        "facebook": ["9:00 AM", "1:00 PM", "3:00 PM"],
        "youtube": ["2:00 PM", "8:00 PM"]
    }
    return times.get(platform, ["9:00 AM", "12:00 PM", "5:00 PM"])

async def generate_simple_strategy(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback simple strategy generation"""
    objectives = input_data.get("objectives", [])
    timeframe = input_data.get("timeframe", "30d")
    platforms = input_data.get("platforms", ["instagram", "linkedin", "twitter"])
    target_audience = input_data.get("target_audience", "")
    
    # Generate a basic strategy as fallback
    strategy = {
        "name": f"AI-Generated Strategy for {timeframe}",
        "description": f"Comprehensive social media strategy targeting {target_audience or 'your audience'}",
        "status": "active",
        "confidence": 75,
        "aiGenerated": True,
        "orchestration_metadata": {
            "workflow_type": "simple_fallback",
            "agents_used": ["strategy"],
            "generated_at": datetime.now().isoformat()
        },
        "rawAIResponse": {
            "title": "AI-Generated Growth Strategy",
            "caption": f"Data-driven content strategy for {timeframe} focusing on {', '.join(objectives) if objectives else 'business growth'}",
            "platformContent": {
                platform: {
                    "caption": f"Optimized content strategy for {platform}",
                    "focus": get_platform_focus(platform),
                    "contentMix": get_platform_content_mix(platform),
                    "postingFrequency": get_posting_frequency(platform)
                }
                for platform in platforms
            },
            "hashtags": ["#socialmedia", "#marketing", "#business", "#growth", "#strategy"]
        },
        "strategy": {
            "monthlyTheme": "AI-Driven Growth Strategy",
            "focus": f"Building {target_audience or 'target audience'} engagement through strategic content",
            "objectives": [
                {
                    "goal": obj,
                    "target": 25 + (hash(obj) % 25),  # Random target between 25-50
                    "timeline": timeframe,
                    "metrics": ["engagement", "reach", "followers", "conversions"],
                    "status": "planned"
                }
                for obj in objectives
            ],
            "weeklyPlans": generate_weekly_plans(timeframe, platforms),
            "platformStrategies": [
                {
                    "platform": platform,
                    "focus": get_platform_focus(platform),
                    "contentMix": get_platform_content_mix(platform),
                    "postingFrequency": get_posting_frequency(platform),
                    "keyHashtags": get_platform_hashtags(platform),
                    "engagementTactics": [
                        "Ask questions to encourage comments",
                        "Share behind-the-scenes content",
                        "Respond to comments within 2 hours",
                        "Use trending hashtags relevant to industry",
                        "Collaborate with industry influencers"
                    ]
                }
                for platform in platforms
            ],
            "contentMix": {
                "video": 40,
                "image": 30,
                "text": 20,
                "interactive": 10
            },
            "kpis": {
                "engagementRate": {"target": 5.0, "current": 0, "unit": "%"},
                "reach": {"target": 10000, "current": 0, "unit": "people"},
                "followers": {"target": 500, "current": 0, "unit": "followers"},
                "websiteTraffic": {"target": 25, "current": 0, "unit": "% increase"},
                "leadGeneration": {"target": 20, "current": 0, "unit": "leads/month"},
                "brandMentions": {"target": 50, "current": 0, "unit": "mentions/month"}
            },
            "nextSteps": [
                "Set up content calendar for Week 1 (immediate)",
                "Create brand asset library and content templates (within 3 days)",
                "Identify key hashtags and keywords for each platform (within 1 week)",
                "Launch first campaign and start posting (within 2 weeks)",
                "Set up analytics tracking and monitoring (within 1 week)",
                "Plan influencer collaborations and partnerships (within 2 weeks)"
            ]
        }
    }
    
    return strategy

async def generate_content(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate content"""
    content_type = input_data.get("content_type", "post")
    platform = input_data.get("platform", "instagram")
    topic = input_data.get("topic", "your business")
    tone = input_data.get("tone", "professional")
    
    return {
        "content": f"AI-generated {content_type} about {topic} for {platform}",
        "hashtags": ["#ai", "#content", "#socialmedia", "#marketing"],
        "platform": platform,
        "type": content_type,
        "tone": tone
    }

async def analyze_content(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze content"""
    content = input_data.get("content", "")
    platform = input_data.get("platform", "instagram")
    
    return {
        "analysis": {
            "sentiment": "positive",
            "engagement_score": 0.85,
            "readability_score": 0.78,
            "hashtag_effectiveness": 0.82,
            "recommendations": [
                "Consider adding a call-to-action",
                "Try using more emotional language",
                "Include trending hashtags"
            ]
        },
        "platform": platform,
        "analyzed_at": datetime.now().isoformat()
    }

def get_platform_focus(platform: str) -> str:
    """Get platform-specific focus"""
    focus_map = {
        "instagram": "Visual storytelling and brand aesthetics",
        "linkedin": "Professional networking and B2B content",
        "twitter": "Real-time engagement and thought leadership",
        "facebook": "Community building and customer service",
        "youtube": "Educational content and tutorials",
        "tiktok": "Creative and entertaining short-form content"
    }
    return focus_map.get(platform, "General brand awareness")

def get_platform_content_mix(platform: str) -> Dict[str, int]:
    """Get platform-specific content mix"""
    mix_map = {
        "instagram": {"video": 60, "image": 30, "text": 10},
        "linkedin": {"text": 50, "image": 30, "video": 20},
        "twitter": {"text": 40, "image": 40, "video": 20},
        "facebook": {"video": 40, "image": 40, "text": 20},
        "youtube": {"video": 80, "image": 20},
        "tiktok": {"video": 100}
    }
    return mix_map.get(platform, {"image": 50, "text": 30, "video": 20})

def get_posting_frequency(platform: str) -> str:
    """Get platform-specific posting frequency"""
    frequency_map = {
        "instagram": "daily",
        "linkedin": "3-times-week",
        "twitter": "daily",
        "facebook": "weekly",
        "youtube": "weekly",
        "tiktok": "daily"
    }
    return frequency_map.get(platform, "daily")

def get_platform_hashtags(platform: str) -> List[str]:
    """Get platform-specific hashtags"""
    hashtag_map = {
        "instagram": ["#business", "#growth", "#success", "#marketing"],
        "linkedin": ["#business", "#leadership", "#industry", "#professional"],
        "twitter": ["#business", "#tech", "#innovation", "#marketing"],
        "facebook": ["#business", "#community", "#engagement"],
        "youtube": ["#tutorial", "#education", "#howto"],
        "tiktok": ["#trending", "#viral", "#creative"]
    }
    return hashtag_map.get(platform, ["#business", "#growth"])

def generate_weekly_plans(timeframe: str, platforms: List[str]) -> List[Dict[str, Any]]:
    """Generate weekly plans"""
    weeks = 4 if timeframe == "30d" else 2 if timeframe == "14d" else 1
    
    themes = [
        "Brand Awareness & Foundation",
        "Content Showcase & Engagement",
        "Community Building & Interaction",
        "Thought Leadership & Authority"
    ]
    
    return [
        {
            "week": i + 1,
            "theme": themes[i % len(themes)],
            "focus": f"Week {i + 1} strategic focus",
            "contentTypes": ["image", "video", "text"],
            "platforms": platforms,
            "postFrequency": 5,
            "keyMessages": [
                "Brand introduction",
                "Value proposition",
                "Community engagement"
            ]
        }
        for i in range(weeks)
    ]

# Agent-specific functions for orchestral workflow

async def generate_content_strategy(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate content strategy (Content Agent)"""
    objectives = input_data.get("objectives", [])
    platforms = input_data.get("platforms", [])
    target_audience = input_data.get("target_audience", "")
    intelligence_data = input_data.get("intelligence_data", {})
    analytics_data = input_data.get("analytics_data", {})
    timeframe = input_data.get("timeframe", "30d")
    
    logger.info("Content Agent generating content strategy", {
        "objectives": objectives,
        "platforms": platforms,
        "target_audience": target_audience
    })
    
    # Generate content pillars based on objectives
    content_pillars = []
    if "brand_awareness" in objectives:
        content_pillars.extend(["Educational", "Behind-the-scenes", "Brand Story"])
    if "lead_generation" in objectives:
        content_pillars.extend(["Product Showcase", "Customer Testimonials", "How-to Guides"])
    if "engagement" in objectives:
        content_pillars.extend(["Interactive", "User-generated", "Community"])
    
    # Generate content calendar
    weeks = 4 if timeframe == "30d" else 2 if timeframe == "14d" else 1
    content_calendar = []
    
    for week in range(1, weeks + 1):
        week_theme = f"Week {week} Content Theme"
        content_calendar.append({
            "week": week,
            "theme": week_theme,
            "content_types": ["image", "video", "text"],
            "pillars": content_pillars[:3],  # Top 3 pillars for the week
            "platforms": platforms,
            "posting_schedule": {
                platform: {
                    "frequency": get_posting_frequency(platform),
                    "best_times": ["9:00 AM", "1:00 PM", "5:00 PM"],
                    "content_mix": get_platform_content_mix(platform)
                }
                for platform in platforms
            }
        })
    
    return {
        "content_pillars": content_pillars,
        "content_calendar": content_calendar,
        "platform_strategies": {
            platform: {
                "focus": get_platform_focus(platform),
                "content_mix": get_platform_content_mix(platform),
                "posting_frequency": get_posting_frequency(platform),
                "key_hashtags": get_platform_hashtags(platform),
                "content_ideas": [
                    f"Educational post about {target_audience}",
                    f"Behind-the-scenes content",
                    f"User testimonial for {platform}",
                    f"Industry tip for {target_audience}"
                ]
            }
            for platform in platforms
        },
        "content_guidelines": {
            "tone": "Professional yet approachable",
            "voice": "Authoritative but friendly",
            "style": "Visual storytelling with clear value",
            "cta_strategy": "Soft calls-to-action every 3 posts"
        }
    }

async def generate_market_research(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate market research (Intelligence Agent)"""
    objectives = input_data.get("objectives", [])
    target_audience = input_data.get("target_audience", "")
    platforms = input_data.get("platforms", [])
    business_goals = input_data.get("business_goals", "")
    current_challenges = input_data.get("current_challenges", "")
    
    logger.info("Intelligence Agent conducting market research", {
        "objectives": objectives,
        "target_audience": target_audience,
        "platforms": platforms
    })
    
    # Simulate market research data
    market_trends = {
        "social_media_trends": [
            "Video content engagement up 40%",
            "Short-form content dominating feeds",
            "Authentic storytelling preferred over polished content",
            "Community-driven content performing best"
        ],
        "platform_insights": {
            platform: {
                "engagement_rate": 3.5 + (hash(platform) % 20) / 10,  # 3.5-5.5%
                "best_posting_times": ["9:00 AM", "1:00 PM", "5:00 PM"],
                "trending_hashtags": get_platform_hashtags(platform),
                "audience_behavior": f"Active on {platform} during business hours"
            }
            for platform in platforms
        },
        "competitor_analysis": {
            "top_performers": [
                f"Competitor A: 5.2% engagement rate on {platforms[0] if platforms else 'social media'}",
                f"Competitor B: Strong video content strategy",
                f"Competitor C: Excellent community engagement"
            ],
            "opportunities": [
                "Underserved content niches in target audience",
                "Gap in educational content for beginners",
                "Opportunity for behind-the-scenes content"
            ]
        },
        "audience_insights": {
            "demographics": {
                "age_range": "25-45",
                "interests": ["business", "technology", "lifestyle"],
                "pain_points": current_challenges or "Lack of time for content creation",
                "content_preferences": ["Educational", "Visual", "Quick tips"]
            },
            "behavior_patterns": {
                "most_active_platforms": platforms[:2] if len(platforms) >= 2 else platforms,
                "peak_engagement_times": "Tuesday-Thursday, 1-3 PM",
                "content_consumption_habits": "Mobile-first, quick scroll-through"
            }
        }
    }
    
    return {
        "market_trends": market_trends,
        "insights": [
            f"Target audience {target_audience} prefers educational content",
            f"Video content performs 40% better on {platforms[0] if platforms else 'social platforms'}",
            f"Community engagement is key for {business_goals or 'business growth'}"
        ],
        "recommendations": [
            "Focus on educational video content",
            "Build community through interactive posts",
            "Leverage trending hashtags for visibility",
            "Create behind-the-scenes content for authenticity"
        ]
    }

async def generate_kpi_definition(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate KPI definition (Analytics Agent)"""
    objectives = input_data.get("objectives", [])
    platforms = input_data.get("platforms", [])
    intelligence_data = input_data.get("intelligence_data", {})
    timeframe = input_data.get("timeframe", "30d")
    
    logger.info("Analytics Agent defining KPIs", {
        "objectives": objectives,
        "platforms": platforms,
        "timeframe": timeframe
    })
    
    # Define KPIs based on objectives
    kpis = {}
    
    if "brand_awareness" in objectives:
        kpis["brand_awareness"] = {
            "reach": {"target": 10000, "unit": "people", "frequency": "weekly"},
            "impressions": {"target": 50000, "unit": "impressions", "frequency": "weekly"},
            "brand_mentions": {"target": 25, "unit": "mentions", "frequency": "monthly"},
            "share_of_voice": {"target": 5.0, "unit": "%", "frequency": "monthly"}
        }
    
    if "lead_generation" in objectives:
        kpis["lead_generation"] = {
            "website_clicks": {"target": 500, "unit": "clicks", "frequency": "monthly"},
            "lead_form_submissions": {"target": 50, "unit": "leads", "frequency": "monthly"},
            "conversion_rate": {"target": 3.0, "unit": "%", "frequency": "monthly"},
            "cost_per_lead": {"target": 25.0, "unit": "$", "frequency": "monthly"}
        }
    
    if "engagement" in objectives:
        kpis["engagement"] = {
            "engagement_rate": {"target": 5.0, "unit": "%", "frequency": "weekly"},
            "likes": {"target": 1000, "unit": "likes", "frequency": "weekly"},
            "comments": {"target": 100, "unit": "comments", "frequency": "weekly"},
            "shares": {"target": 50, "unit": "shares", "frequency": "weekly"}
        }
    
    # Platform-specific metrics
    platform_metrics = {}
    for platform in platforms:
        platform_metrics[platform] = {
            "followers": {"target": 1000, "unit": "followers", "frequency": "monthly"},
            "engagement_rate": {"target": 4.0, "unit": "%", "frequency": "weekly"},
            "reach": {"target": 5000, "unit": "people", "frequency": "weekly"},
            "impressions": {"target": 15000, "unit": "impressions", "frequency": "weekly"}
        }
    
    return {
        "kpis": kpis,
        "platform_metrics": platform_metrics,
        "measurement_framework": {
            "tracking_tools": ["Google Analytics", "Platform Insights", "Social Media Management Tool"],
            "reporting_frequency": "Weekly",
            "review_cycle": "Monthly",
            "success_criteria": "80% of KPIs met or exceeded"
        },
        "baseline_metrics": {
            "current_engagement_rate": 2.5,
            "current_reach": 2500,
            "current_followers": 500,
            "current_website_traffic": 1000
        }
    }

async def generate_strategy_optimization(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate strategy optimization (Learning Agent)"""
    objectives = input_data.get("objectives", [])
    platforms = input_data.get("platforms", [])
    intelligence_data = input_data.get("intelligence_data", {})
    analytics_data = input_data.get("analytics_data", {})
    content_data = input_data.get("content_data", {})
    
    logger.info("Learning Agent optimizing strategy", {
        "objectives": objectives,
        "platforms": platforms
    })
    
    # Generate optimization recommendations
    optimizations = [
        {
            "area": "Content Timing",
            "recommendation": "Post during peak engagement hours (1-3 PM)",
            "expected_improvement": "+25% engagement",
            "implementation_difficulty": "Easy",
            "priority": "High"
        },
        {
            "area": "Content Mix",
            "recommendation": "Increase video content to 60% of posts",
            "expected_improvement": "+40% reach",
            "implementation_difficulty": "Medium",
            "priority": "High"
        },
        {
            "area": "Hashtag Strategy",
            "recommendation": "Use 3-5 relevant hashtags per post",
            "expected_improvement": "+15% visibility",
            "implementation_difficulty": "Easy",
            "priority": "Medium"
        },
        {
            "area": "Community Engagement",
            "recommendation": "Respond to comments within 2 hours",
            "expected_improvement": "+30% community growth",
            "implementation_difficulty": "Medium",
            "priority": "High"
        }
    ]
    
    # A/B testing recommendations
    ab_tests = [
        {
            "test_name": "Posting Time Optimization",
            "hypothesis": "Posts at 2 PM will have higher engagement than 9 AM",
            "test_duration": "2 weeks",
            "success_metric": "Engagement rate",
            "expected_outcome": "2 PM posts perform 20% better"
        },
        {
            "test_name": "Content Format Testing",
            "hypothesis": "Video posts will outperform image posts",
            "test_duration": "1 month",
            "success_metric": "Reach and engagement",
            "expected_outcome": "Video posts have 40% higher reach"
        }
    ]
    
    return {
        "optimizations": optimizations,
        "ab_tests": ab_tests,
        "learning_insights": [
            "Video content consistently outperforms static images",
            "Posts with questions generate 3x more comments",
            "Behind-the-scenes content has highest engagement",
            "User-generated content builds strongest community"
        ],
        "continuous_improvement": {
            "review_frequency": "Weekly",
            "optimization_cycle": "Monthly",
            "success_tracking": "Real-time dashboard",
            "adjustment_threshold": "10% performance change"
        }
    }

async def generate_strategy_synthesis(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate final strategy synthesis (Strategy Agent)"""
    objectives = input_data.get("objectives", [])
    platforms = input_data.get("platforms", [])
    target_audience = input_data.get("target_audience", "")
    business_goals = input_data.get("business_goals", "")
    current_challenges = input_data.get("current_challenges", "")
    timeframe = input_data.get("timeframe", "30d")
    intelligence_data = input_data.get("intelligence_data", {})
    analytics_data = input_data.get("analytics_data", {})
    content_data = input_data.get("content_data", {})
    learning_data = input_data.get("learning_data", {})
    
    logger.info("Strategy Agent synthesizing final strategy", {
        "objectives": objectives,
        "platforms": platforms,
        "target_audience": target_audience
    })
    
    # Synthesize all agent inputs into final strategy
    strategy = {
        "name": f"Orchestral AI Strategy for {timeframe}",
        "description": f"Comprehensive social media strategy targeting {target_audience or 'your audience'}",
        "status": "active",
        "confidence": 95,
        "aiGenerated": True,
        "orchestration_metadata": {
            "workflow_type": "orchestral",
            "agents_used": ["intelligence", "analytics", "content", "learning", "strategy"],
            "generated_at": datetime.now().isoformat()
        },
        "rawAIResponse": {
            "title": "Orchestral AI-Generated Growth Strategy",
            "caption": f"Data-driven content strategy for {timeframe} focusing on {', '.join(objectives) if objectives else 'business growth'}",
            "platformContent": {
                platform: {
                    "caption": f"Optimized content strategy for {platform}",
                    "focus": get_platform_focus(platform),
                    "contentMix": get_platform_content_mix(platform),
                    "postingFrequency": get_posting_frequency(platform)
                }
                for platform in platforms
            },
            "hashtags": ["#socialmedia", "#marketing", "#business", "#growth", "#strategy", "#orchestral"]
        },
        "strategy": {
            "monthlyTheme": "Orchestral AI-Driven Growth Strategy",
            "focus": f"Building {target_audience or 'target audience'} engagement through strategic content",
            "objectives": [
                {
                    "goal": objective,
                    "target": 40 + (hash(objective) % 20),  # Random target between 40-60
                    "timeline": timeframe,
                    "metrics": ["engagement", "reach", "followers", "conversions"],
                    "status": "planned"
                }
                for objective in objectives
            ],
            "weeklyPlans": generate_weekly_plans(timeframe, platforms),
            "platformStrategies": [
                {
                    "platform": platform,
                    "focus": get_platform_focus(platform),
                    "contentMix": get_platform_content_mix(platform),
                    "postingFrequency": get_posting_frequency(platform),
                    "keyHashtags": get_platform_hashtags(platform),
                    "engagementTactics": [
                        "Ask questions to encourage comments",
                        "Share behind-the-scenes content",
                        "Respond to comments within 2 hours",
                        "Use trending hashtags relevant to industry",
                        "Collaborate with industry influencers"
                    ]
                }
                for platform in platforms
            ],
            "contentMix": {
                "video": 50,  # Increased based on learning insights
                "image": 30,
                "text": 15,
                "interactive": 5
            },
            "kpis": analytics_data.get("kpis", {}),
            "nextSteps": [
                "Set up content calendar for Week 1 (immediate)",
                "Create brand asset library and content templates (within 3 days)",
                "Identify key hashtags and keywords for each platform (within 1 week)",
                "Launch first campaign and start posting (within 2 weeks)",
                "Set up analytics tracking and monitoring (within 1 week)",
                "Plan influencer collaborations and partnerships (within 2 weeks)"
            ]
        },
        "intelligence": intelligence_data,
        "analytics": analytics_data,
        "content": content_data,
        "learning": learning_data
    }
    
    return strategy

# Automation endpoints
@app.get("/automation/status")
async def get_automation_status():
    """Get status of all automated systems"""
    try:
        status = coordinator.get_automation_status()
        return {
            "success": True,
            "data": status,
            "message": "Automation status retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting automation status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/automation/scheduled-tasks")
async def get_scheduled_tasks():
    """Get all scheduled tasks"""
    try:
        tasks = coordinator.get_scheduled_tasks()
        return {
            "success": True,
            "data": tasks,
            "message": "Scheduled tasks retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting scheduled tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/automation/event-rules")
async def get_event_rules():
    """Get all event rules"""
    try:
        rules = coordinator.get_event_rules()
        return {
            "success": True,
            "data": rules,
            "message": "Event rules retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting event rules: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/automation/performance-thresholds")
async def get_performance_thresholds():
    """Get all performance thresholds"""
    try:
        thresholds = coordinator.get_performance_thresholds()
        return {
            "success": True,
            "data": thresholds,
            "message": "Performance thresholds retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting performance thresholds: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/automation/recent-events")
async def get_recent_events(limit: int = 50):
    """Get recent events"""
    try:
        events = coordinator.get_recent_events(limit)
        return {
            "success": True,
            "data": events,
            "message": "Recent events retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting recent events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/automation/performance-summary")
async def get_performance_summary(platform: str = None, hours: int = 24):
    """Get performance summary"""
    try:
        summary = coordinator.get_performance_summary(platform, hours)
        return {
            "success": True,
            "data": summary,
            "message": "Performance summary retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting performance summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Pydantic models for automation requests
class ScheduledTaskRequest(BaseModel):
    name: str
    schedule_type: str  # daily, weekly, monthly, hourly
    schedule_time: str  # HH:MM format
    agent_type: str = "strategy"
    schedule_day: Optional[str] = None  # For weekly/monthly
    task_data: Optional[Dict[str, Any]] = None

class EventRuleRequest(BaseModel):
    event_type: str
    conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    cooldown_minutes: int = 5

class PerformanceThresholdRequest(BaseModel):
    metric_type: str
    platform: str
    threshold_value: float
    threshold_type: str  # above, below, equals
    severity: str  # low, medium, high, critical

@app.post("/automation/scheduled-tasks")
async def add_scheduled_task(request: ScheduledTaskRequest):
    """Add a new scheduled task"""
    try:
        task_id = coordinator.add_scheduled_task(
            name=request.name,
            schedule_type=request.schedule_type,
            schedule_time=request.schedule_time,
            agent_type=request.agent_type,
            schedule_day=request.schedule_day,
            task_data=request.task_data
        )
        return {
            "success": True,
            "data": {"task_id": task_id},
            "message": "Scheduled task added successfully"
        }
    except Exception as e:
        logger.error(f"Error adding scheduled task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/automation/event-rules")
async def add_event_rule(request: EventRuleRequest):
    """Add a new event rule"""
    try:
        rule_id = coordinator.add_event_rule(
            event_type=request.event_type,
            conditions=request.conditions,
            actions=request.actions,
            cooldown_minutes=request.cooldown_minutes
        )
        return {
            "success": True,
            "data": {"rule_id": rule_id},
            "message": "Event rule added successfully"
        }
    except Exception as e:
        logger.error(f"Error adding event rule: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/automation/performance-thresholds")
async def add_performance_threshold(request: PerformanceThresholdRequest):
    """Add a new performance threshold"""
    try:
        threshold_id = coordinator.add_performance_threshold(
            metric_type=request.metric_type,
            platform=request.platform,
            threshold_value=request.threshold_value,
            threshold_type=request.threshold_type,
            severity=request.severity
        )
        return {
            "success": True,
            "data": {"threshold_id": threshold_id},
            "message": "Performance threshold added successfully"
        }
    except Exception as e:
        logger.error(f"Error adding performance threshold: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/automation/scheduled-tasks/{task_id}/enable")
async def enable_scheduled_task(task_id: str):
    """Enable a scheduled task"""
    try:
        success = coordinator.enable_scheduled_task(task_id)
        if success:
            return {
                "success": True,
                "message": "Scheduled task enabled successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        logger.error(f"Error enabling scheduled task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/automation/scheduled-tasks/{task_id}/disable")
async def disable_scheduled_task(task_id: str):
    """Disable a scheduled task"""
    try:
        success = coordinator.disable_scheduled_task(task_id)
        if success:
            return {
                "success": True,
                "message": "Scheduled task disabled successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        logger.error(f"Error disabling scheduled task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Database for storing agents (in production, this would be a real database)
AGENTS_DATABASE = {}

async def get_agents_from_database() -> List[Dict[str, Any]]:
    """Get agents from database"""
    try:
        # Convert database to list format
        agents_list = []
        for agent_id, agent_data in AGENTS_DATABASE.items():
            agents_list.append({
                "agentId": agent_id,
                "name": agent_data.get("name", "Unknown Agent"),
                "type": agent_data.get("type", "unknown_agent"),
                "organizationId": agent_data.get("organizationId", "unknown"),
                "status": agent_data.get("status", "active"),
                "isEnabled": agent_data.get("isEnabled", True),
                "performanceMetrics": agent_data.get("performanceMetrics", {
                    "efficiency": 95.0,
                    "successRate": 98.0,
                    "avgResponseTime": 1.2
                }),
                "health": agent_data.get("health", {
                    "status": "healthy",
                    "lastCheck": datetime.now().isoformat()
                })
            })
        return agents_list
    except Exception as e:
        logger.error(f"Error getting agents from database: {e}")
        return []

@app.post("/agents/register-organization")
async def register_organization_agents(request: Dict[str, Any]):
    """Register agents for a new organization"""
    try:
        organization_id = request.get("organizationId")
        organization_data = request.get("organizationData", {})
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="Organization ID is required")
        
        logger.info(f"Registering agents for organization: {organization_id}")
        
        # Create agents for the organization
        agent_types = [
            "intelligence_agent",
            "strategy_agent", 
            "content_agent",
            "execution_agent",
            "learning_agent",
            "engagement_agent",
            "analytics_agent"
        ]
        
        created_agents = []
        
        for agent_type in agent_types:
            agent_id = f"{agent_type}_{organization_id}"
            agent_name = f"{agent_type.replace('_', ' ').title()} - {organization_data.get('name', 'Organization')}"
            
            agent_data = {
                "agentId": agent_id,
                "name": agent_name,
                "type": agent_type,
                "organizationId": organization_id,
                "status": "active",
                "isEnabled": True,
                "performanceMetrics": {
                    "efficiency": 95.0,
                    "successRate": 98.0,
                    "avgResponseTime": 1.2
                },
                "health": {
                    "status": "healthy",
                    "lastCheck": datetime.now().isoformat()
                },
                "configuration": {
                    "model": "gpt-4",
                    "temperature": 0.7,
                    "maxTokens": 2000,
                    "systemPrompt": f"You are a {agent_type.replace('_', ' ')} AI agent for {organization_data.get('name', 'this organization')}.",
                    "organizationContext": {
                        "brandVoice": organization_data.get("brandVoice", "professional"),
                        "industry": organization_data.get("industry", "other"),
                        "targetAudience": organization_data.get("targetAudience", "Business professionals")
                    }
                },
                "createdAt": datetime.now().isoformat()
            }
            
            # Store in database
            AGENTS_DATABASE[agent_id] = agent_data
            created_agents.append(agent_data)
            
            logger.info(f"Created agent: {agent_id}")
        
        return {
            "success": True,
            "message": f"Successfully registered {len(created_agents)} agents for organization {organization_id}",
            "data": {
                "organizationId": organization_id,
                "agentsCreated": len(created_agents),
                "agents": created_agents
            }
        }
        
    except Exception as e:
        logger.error(f"Error registering organization agents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to register agents: {str(e)}")

if __name__ == "__main__":
    # Create logs directory if it doesn't exist
    Path("logs").mkdir(exist_ok=True)
    
    # Run the server
    uvicorn.run(
        "simple_ai_service:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )


# Orchestral Workflow API Endpoints

from orchestrator.enhanced_agent_coordinator import enhanced_coordinator
from pydantic import BaseModel
from typing import Dict, Any, Optional

class WorkflowExecutionRequest(BaseModel):
    workflow_id: str
    input_data: Dict[str, Any]
    organization_id: str
    user_id: Optional[str] = None

class WorkflowResponse(BaseModel):
    success: bool
    execution_id: Optional[str] = None
    message: str
    data: Optional[Dict[str, Any]] = None

@app.get("/orchestral/workflows")
async def list_workflows():
    """List all available orchestral workflows"""
    try:
        workflows = enhanced_coordinator.list_available_workflows()
        return {
            "success": True,
            "data": {
                "workflows": workflows,
                "total": len(workflows)
            },
            "message": "Workflows retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error listing workflows: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestral/workflows/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowExecutionRequest):
    """Execute an orchestral workflow"""
    try:
        logger.info(f"Executing orchestral workflow: {request.workflow_id}")
        
        execution_id = await enhanced_coordinator.execute_orchestral_workflow(
            workflow_id=request.workflow_id,
            input_data=request.input_data,
            organization_id=request.organization_id,
            user_id=request.user_id
        )
        
        return WorkflowResponse(
            success=True,
            execution_id=execution_id,
            message=f"Workflow {request.workflow_id} started successfully",
            data={"execution_id": execution_id}
        )
        
    except Exception as e:
        logger.error(f"Error executing workflow: {e}")
        return WorkflowResponse(
            success=False,
            message=f"Failed to execute workflow: {str(e)}"
        )

@app.get("/orchestral/workflows/{execution_id}/status")
async def get_workflow_status(execution_id: str):
    """Get status of a workflow execution"""
    try:
        status = enhanced_coordinator.get_workflow_status(execution_id)
        
        if status:
            return {
                "success": True,
                "data": status,
                "message": "Workflow status retrieved successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Workflow execution not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/workflows/active")
async def get_active_workflows():
    """Get all active workflow executions"""
    try:
        active_workflows = enhanced_coordinator.get_active_workflows()
        return {
            "success": True,
            "data": {
                "active_workflows": active_workflows,
                "total": len(active_workflows)
            },
            "message": "Active workflows retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting active workflows: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestral/workflows/{execution_id}/cancel")
async def cancel_workflow(execution_id: str):
    """Cancel a running workflow execution"""
    try:
        success = await enhanced_coordinator.cancel_workflow(execution_id)
        
        if success:
            return {
                "success": True,
                "message": f"Workflow execution {execution_id} cancelled successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Workflow execution not found or not cancellable")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/status")
async def get_orchestral_status():
    """Get comprehensive orchestral system status"""
    try:
        status = enhanced_coordinator.get_orchestral_status()
        return {
            "success": True,
            "data": status,
            "message": "Orchestral status retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting orchestral status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestral/communication/stats")
async def get_communication_stats():
    """Get agent communication statistics"""
    try:
        stats = enhanced_coordinator.get_communication_stats()
        return {
            "success": True,
            "data": stats,
            "message": "Communication stats retrieved successfully"
        }
    except Exception as e:
        logger.error(f"Error getting communication stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced agent processing for orchestral workflows
@app.post("/orchestral/agents/{agent_id}/process")
async def process_orchestral_task(agent_id: str, request: TaskRequest):
    """Process task with orchestral workflow support"""
    try:
        logger.info(f"Processing orchestral task for agent: {agent_id}")
        
        # Check if this is part of a workflow
        if request.input_data.get("workflow_execution_id"):
            logger.info(f"Task is part of workflow: {request.input_data.get('workflow_execution_id')}")
        
        # Process normally but with orchestral coordination
        result = await process_task_by_type(request.task_type, request.input_data, {"agentId": agent_id})
        
        return AgentResponse(
            success=True,
            agent_id=agent_id,
            task_id=f"orchestral_{int(datetime.now().timestamp() * 1000000)}",
            result=result,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error processing orchestral task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

