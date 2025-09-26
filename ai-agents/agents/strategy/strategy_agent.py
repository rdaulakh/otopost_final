import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import calendar
from dataclasses import dataclass
from enum import Enum

from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import BaseTool, tool
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.base_agent import BaseAgent, AgentTask, AgentResponse
from config.settings import AgentType, get_platform_config, get_content_template
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_agent_activity

class StrategyType(str, Enum):
    BRAND_AWARENESS = "brand_awareness"
    LEAD_GENERATION = "lead_generation"
    ENGAGEMENT = "engagement"
    SALES = "sales"
    THOUGHT_LEADERSHIP = "thought_leadership"
    COMMUNITY_BUILDING = "community_building"

class ContentPillar(str, Enum):
    EDUCATIONAL = "educational"
    ENTERTAINING = "entertaining"
    INSPIRATIONAL = "inspirational"
    PROMOTIONAL = "promotional"
    BEHIND_SCENES = "behind_scenes"
    USER_GENERATED = "user_generated"

@dataclass
class ContentStrategy:
    """Represents a comprehensive content strategy."""
    id: str
    name: str
    objective: StrategyType
    target_audience: Dict[str, Any]
    content_pillars: List[ContentPillar]
    platforms: List[str]
    posting_frequency: Dict[str, int]  # platform -> posts per week
    content_mix: Dict[str, float]  # content type -> percentage
    brand_voice: Dict[str, str]
    key_messages: List[str]
    hashtag_strategy: Dict[str, List[str]]  # platform -> hashtags
    campaign_themes: List[str]
    success_metrics: List[str]
    timeline: Dict[str, Any]
    budget_allocation: Dict[str, float]
    created_at: datetime
    confidence: float

@dataclass
class CampaignPlan:
    """Represents a specific campaign plan."""
    id: str
    name: str
    objective: str
    duration: int  # days
    platforms: List[str]
    content_calendar: Dict[str, List[Dict]]  # date -> content items
    budget: float
    target_metrics: Dict[str, float]
    creative_brief: str
    call_to_action: str
    hashtags: List[str]
    created_at: datetime

class StrategyPlanningInput(BaseModel):
    """Input schema for strategy planning."""
    business_goals: List[str] = Field(description="Primary business objectives")
    target_audience: Dict[str, Any] = Field(description="Target audience details")
    brand_info: Dict[str, Any] = Field(description="Brand information and voice")
    platforms: List[str] = Field(description="Social media platforms to focus on")
    budget: Optional[float] = Field(description="Monthly budget for social media")
    timeline: str = Field(description="Strategy timeline (3m, 6m, 12m)")

class CampaignPlanningInput(BaseModel):
    """Input schema for campaign planning."""
    campaign_objective: str = Field(description="Primary campaign objective")
    duration: int = Field(description="Campaign duration in days")
    platforms: List[str] = Field(description="Platforms for the campaign")
    budget: float = Field(description="Campaign budget")
    target_audience: Dict[str, Any] = Field(description="Target audience for campaign")

class StrategyAgent(BaseAgent):
    """Strategy Agent for content strategy and campaign planning."""
    
    def __init__(self, organization_id: str):
        super().__init__(AgentType.STRATEGY, organization_id)
        self.strategy_cache = {}
        self.campaign_history = []
        
    async def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the Strategy Agent's system prompt."""
        system_prompt = """You are an AI Strategy Agent specialized in social media strategy development and campaign planning.

Your primary responsibilities:
1. Develop comprehensive content strategies aligned with business objectives
2. Create detailed campaign plans with timelines and budgets
3. Define target audience segments and messaging strategies
4. Establish content pillars and brand voice guidelines
5. Plan content calendars and posting schedules
6. Design hashtag strategies and community engagement approaches
7. Set success metrics and KPIs for strategies and campaigns

Key capabilities:
- Strategic thinking and business objective alignment
- Audience research and segmentation
- Competitive strategy analysis
- Brand positioning and messaging
- Content planning and calendar development
- Campaign conceptualization and execution planning
- Budget allocation and resource planning
- Performance measurement framework design

Strategy Development Guidelines:
- Always align strategies with specific business objectives
- Consider platform-specific best practices and algorithms
- Balance promotional and value-driven content
- Ensure brand consistency across all platforms
- Plan for seasonal trends and industry events
- Include crisis management and reputation considerations
- Design scalable and sustainable content approaches

Campaign Planning Guidelines:
- Define clear, measurable objectives
- Create compelling creative briefs
- Plan content variety and engagement hooks
- Schedule content for optimal timing
- Include user-generated content opportunities
- Plan for real-time engagement and community management
- Design conversion funnels and call-to-actions

Content Strategy Framework:
1. Situation Analysis (current state, competitors, opportunities)
2. Objective Setting (SMART goals aligned with business)
3. Audience Definition (demographics, psychographics, behaviors)
4. Platform Strategy (platform-specific approaches)
5. Content Pillars (core content themes and types)
6. Brand Voice (tone, personality, messaging guidelines)
7. Content Calendar (posting schedule and content mix)
8. Engagement Strategy (community building and interaction)
9. Measurement Plan (KPIs, tracking, and optimization)
10. Resource Allocation (budget, team, tools)

Remember: Your strategies should be data-driven, audience-focused, and business-aligned while being creative and engaging."""

        return ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
    
    async def _initialize_tools(self) -> List[BaseTool]:
        """Initialize Strategy Agent specific tools."""
        
        @tool
        def analyze_business_objectives(objectives_data: str) -> str:
            """Analyze business objectives and align social media strategy."""
            try:
                # Log input data
                self.logger.info("🔍 AI TOOL: analyze_business_objectives - INPUT", {
                    "tool_name": "analyze_business_objectives",
                    "input_data": objectives_data,
                    "input_type": type(objectives_data).__name__,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                data = json.loads(objectives_data) if isinstance(objectives_data, str) else objectives_data
                
                objectives = data.get('objectives', [])
                industry = data.get('industry', 'general')
                target_metrics = data.get('target_metrics', {})
                
                self.logger.info("📊 AI TOOL: analyze_business_objectives - PARSED DATA", {
                    "objectives": objectives,
                    "industry": industry,
                    "target_metrics": target_metrics,
                    "data_keys": list(data.keys())
                })
                
                analysis = []
                strategy_recommendations = []
                
                # Analyze each objective
                for obj in objectives:
                    obj_lower = obj.lower()
                    self.logger.info(f"🎯 AI TOOL: analyze_business_objectives - ANALYZING OBJECTIVE", {
                        "objective": obj,
                        "objective_lower": obj_lower
                    })
                    
                    if 'brand awareness' in obj_lower:
                        analysis.append("Brand awareness objective identified")
                        strategy_recommendations.extend([
                            "Focus on reach and impressions metrics",
                            "Create shareable, educational content",
                            "Leverage trending topics and hashtags",
                            "Partner with influencers and thought leaders"
                        ])
                        self.logger.info("✅ AI TOOL: analyze_business_objectives - BRAND AWARENESS DETECTED")
                    
                    elif 'lead generation' in obj_lower:
                        analysis.append("Lead generation objective identified")
                        strategy_recommendations.extend([
                            "Create gated content and lead magnets",
                            "Use strong call-to-actions",
                            "Implement conversion tracking",
                            "Focus on LinkedIn and Facebook for B2B"
                        ])
                        self.logger.info("✅ AI TOOL: analyze_business_objectives - LEAD GENERATION DETECTED")
                    
                    elif 'sales' in obj_lower:
                        analysis.append("Sales objective identified")
                        strategy_recommendations.extend([
                            "Showcase product benefits and testimonials",
                            "Create urgency with limited-time offers",
                            "Use social proof and user-generated content",
                            "Implement social commerce features"
                        ])
                        self.logger.info("✅ AI TOOL: analyze_business_objectives - SALES DETECTED")
                    
                    elif 'engagement' in obj_lower:
                        analysis.append("Engagement objective identified")
                        strategy_recommendations.extend([
                            "Create interactive content (polls, Q&A)",
                            "Respond promptly to comments and messages",
                            "Build community through consistent interaction",
                            "Share behind-the-scenes content"
                        ])
                        self.logger.info("✅ AI TOOL: analyze_business_objectives - ENGAGEMENT DETECTED")
                
                # Create output
                output = {
                    "analysis": analysis,
                    "strategy_recommendations": list(set(strategy_recommendations)),
                    "recommended_content_mix": {
                        "educational": 40,
                        "promotional": 20,
                        "entertaining": 25,
                        "behind_scenes": 15
                    },
                    "confidence": 0.85
                }
                
                # Log output data
                self.logger.info("📤 AI TOOL: analyze_business_objectives - OUTPUT", {
                    "tool_name": "analyze_business_objectives",
                    "output_data": output,
                    "analysis_count": len(analysis),
                    "recommendations_count": len(strategy_recommendations),
                    "confidence": output["confidence"],
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                return json.dumps(output)
                
            except Exception as e:
                error_output = {"error": str(e), "confidence": 0.0}
                self.logger.error("❌ AI TOOL: analyze_business_objectives - ERROR", {
                    "tool_name": "analyze_business_objectives",
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "output": error_output,
                    "timestamp": datetime.utcnow().isoformat()
                })
                return json.dumps(error_output)
        
        @tool
        def develop_audience_strategy(audience_data: str) -> str:
            """Develop audience targeting and messaging strategy."""
            try:
                # Log input data
                self.logger.info("🔍 AI TOOL: develop_audience_strategy - INPUT", {
                    "tool_name": "develop_audience_strategy",
                    "input_data": audience_data,
                    "input_type": type(audience_data).__name__,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                data = json.loads(audience_data) if isinstance(audience_data, str) else audience_data
                
                demographics = data.get('demographics', {})
                interests = data.get('interests', [])
                behaviors = data.get('behaviors', [])
                pain_points = data.get('pain_points', [])
                
                self.logger.info("📊 AI TOOL: develop_audience_strategy - PARSED DATA", {
                    "demographics": demographics,
                    "interests": interests,
                    "behaviors": behaviors,
                    "pain_points": pain_points,
                    "data_keys": list(data.keys())
                })
                
                strategy = {
                    "primary_segments": [],
                    "messaging_strategy": {},
                    "content_preferences": {},
                    "platform_recommendations": {}
                }
                
                # Analyze age groups
                age_groups = demographics.get('age_groups', {})
                self.logger.info("👥 AI TOOL: develop_audience_strategy - ANALYZING AGE GROUPS", {
                    "age_groups": age_groups,
                    "total_groups": len(age_groups)
                })
                
                for age_group, percentage in age_groups.items():
                    if percentage > 0.2:  # 20% or more
                        strategy["primary_segments"].append(age_group)
                        self.logger.info(f"✅ AI TOOL: develop_audience_strategy - PRIMARY SEGMENT IDENTIFIED", {
                            "age_group": age_group,
                            "percentage": percentage,
                            "threshold": 0.2
                        })
                        
                        # Age-specific messaging
                        if '18-24' in age_group:
                            strategy["messaging_strategy"][age_group] = "Trendy, authentic, visual-first messaging"
                            strategy["platform_recommendations"][age_group] = ["TikTok", "Instagram", "Twitter"]
                            self.logger.info("🎯 AI TOOL: develop_audience_strategy - YOUNG ADULT STRATEGY", {
                                "age_group": age_group,
                                "messaging": "Trendy, authentic, visual-first messaging",
                                "platforms": ["TikTok", "Instagram", "Twitter"]
                            })
                        elif '25-34' in age_group:
                            strategy["messaging_strategy"][age_group] = "Professional, aspirational, value-driven messaging"
                            strategy["platform_recommendations"][age_group] = ["LinkedIn", "Instagram", "Facebook"]
                            self.logger.info("🎯 AI TOOL: develop_audience_strategy - PROFESSIONAL STRATEGY", {
                                "age_group": age_group,
                                "messaging": "Professional, aspirational, value-driven messaging",
                                "platforms": ["LinkedIn", "Instagram", "Facebook"]
                            })
                        elif '35-44' in age_group:
                            strategy["messaging_strategy"][age_group] = "Family-focused, practical, trustworthy messaging"
                            strategy["platform_recommendations"][age_group] = ["Facebook", "LinkedIn", "YouTube"]
                            self.logger.info("🎯 AI TOOL: develop_audience_strategy - FAMILY STRATEGY", {
                                "age_group": age_group,
                                "messaging": "Family-focused, practical, trustworthy messaging",
                                "platforms": ["Facebook", "LinkedIn", "YouTube"]
                            })
                        elif '45+' in age_group:
                            strategy["messaging_strategy"][age_group] = "Informative, traditional, relationship-focused messaging"
                            strategy["platform_recommendations"][age_group] = ["Facebook", "LinkedIn", "YouTube"]
                            self.logger.info("🎯 AI TOOL: develop_audience_strategy - MATURE STRATEGY", {
                                "age_group": age_group,
                                "messaging": "Informative, traditional, relationship-focused messaging",
                                "platforms": ["Facebook", "LinkedIn", "YouTube"]
                            })
                
                # Content preferences based on interests
                self.logger.info("🎨 AI TOOL: develop_audience_strategy - ANALYZING INTERESTS", {
                    "interests": interests,
                    "total_interests": len(interests)
                })
                
                if 'technology' in interests:
                    strategy["content_preferences"]["technology"] = ["tutorials", "product updates", "industry news"]
                    self.logger.info("✅ AI TOOL: develop_audience_strategy - TECHNOLOGY INTEREST DETECTED")
                if 'lifestyle' in interests:
                    strategy["content_preferences"]["lifestyle"] = ["behind-the-scenes", "personal stories", "tips"]
                    self.logger.info("✅ AI TOOL: develop_audience_strategy - LIFESTYLE INTEREST DETECTED")
                if 'business' in interests:
                    strategy["content_preferences"]["business"] = ["thought leadership", "case studies", "industry insights"]
                    self.logger.info("✅ AI TOOL: develop_audience_strategy - BUSINESS INTEREST DETECTED")
                
                # Create output
                output = {
                    "audience_strategy": strategy,
                    "recommended_tone": "professional yet approachable",
                    "key_messaging_themes": pain_points[:3] if pain_points else ["value", "trust", "innovation"],
                    "confidence": 0.8
                }
                
                # Log output data
                self.logger.info("📤 AI TOOL: develop_audience_strategy - OUTPUT", {
                    "tool_name": "develop_audience_strategy",
                    "output_data": output,
                    "primary_segments_count": len(strategy["primary_segments"]),
                    "messaging_strategies_count": len(strategy["messaging_strategy"]),
                    "content_preferences_count": len(strategy["content_preferences"]),
                    "confidence": output["confidence"],
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                return json.dumps(output)
                
            except Exception as e:
                error_output = {"error": str(e), "confidence": 0.0}
                self.logger.error("❌ AI TOOL: develop_audience_strategy - ERROR", {
                    "tool_name": "develop_audience_strategy",
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "output": error_output,
                    "timestamp": datetime.utcnow().isoformat()
                })
                return json.dumps(error_output)
        
        @tool
        def create_content_calendar_strategy(calendar_data: str) -> str:
            """Create strategic content calendar framework."""
            try:
                data = json.loads(calendar_data) if isinstance(calendar_data, str) else calendar_data
                
                platforms = data.get('platforms', [])
                posting_frequency = data.get('posting_frequency', {})
                content_pillars = data.get('content_pillars', [])
                
                calendar_strategy = {
                    "weekly_schedule": {},
                    "content_distribution": {},
                    "optimal_posting_times": {},
                    "content_themes": {}
                }
                
                # Weekly schedule for each platform
                for platform in platforms:
                    platform_config = get_platform_config(platform)
                    optimal_times = platform_config.get('optimal_posting_times', ['9:00', '13:00', '17:00'])
                    
                    frequency = posting_frequency.get(platform, 5)  # Default 5 posts per week
                    
                    # Distribute posts across the week
                    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                    posts_per_day = frequency // 7
                    extra_posts = frequency % 7
                    
                    weekly_schedule = {}
                    for i, day in enumerate(days):
                        daily_posts = posts_per_day + (1 if i < extra_posts else 0)
                        if daily_posts > 0:
                            weekly_schedule[day] = {
                                "posts": daily_posts,
                                "suggested_times": optimal_times[:daily_posts]
                            }
                    
                    calendar_strategy["weekly_schedule"][platform] = weekly_schedule
                    calendar_strategy["optimal_posting_times"][platform] = optimal_times
                
                # Content distribution across pillars
                pillar_weights = {
                    "educational": 0.3,
                    "entertaining": 0.25,
                    "promotional": 0.2,
                    "behind_scenes": 0.15,
                    "user_generated": 0.1
                }
                
                calendar_strategy["content_distribution"] = pillar_weights
                
                # Monthly themes
                current_month = datetime.now().month
                month_name = calendar.month_name[current_month]
                
                calendar_strategy["content_themes"] = {
                    "monthly_theme": f"{month_name} Focus Campaign",
                    "weekly_themes": [
                        "Week 1: Educational Focus",
                        "Week 2: Behind-the-Scenes",
                        "Week 3: User Engagement",
                        "Week 4: Product/Service Highlight"
                    ]
                }
                
                return json.dumps({
                    "calendar_strategy": calendar_strategy,
                    "implementation_tips": [
                        "Batch create content for efficiency",
                        "Leave 20% flexibility for trending topics",
                        "Plan seasonal content in advance",
                        "Monitor performance and adjust timing"
                    ],
                    "confidence": 0.85
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def develop_hashtag_strategy(hashtag_data: str) -> str:
            """Develop comprehensive hashtag strategy for each platform."""
            try:
                data = json.loads(hashtag_data) if isinstance(hashtag_data, str) else hashtag_data
                
                industry = data.get('industry', 'general')
                platforms = data.get('platforms', [])
                brand_keywords = data.get('brand_keywords', [])
                target_audience = data.get('target_audience', {})
                
                hashtag_strategy = {}
                
                for platform in platforms:
                    platform_config = get_platform_config(platform)
                    max_hashtags = platform_config.get('max_hashtags', 10)
                    
                    # Create hashtag mix
                    hashtag_mix = {
                        "branded": [],
                        "industry": [],
                        "trending": [],
                        "niche": [],
                        "location": []
                    }
                    
                    # Branded hashtags
                    for keyword in brand_keywords[:2]:
                        hashtag_mix["branded"].append(f"#{keyword.lower().replace(' ', '')}")
                    
                    # Industry hashtags based on industry
                    industry_hashtags = {
                        "technology": ["#tech", "#innovation", "#digital", "#software"],
                        "healthcare": ["#health", "#wellness", "#medical", "#healthcare"],
                        "finance": ["#finance", "#investing", "#money", "#fintech"],
                        "retail": ["#retail", "#shopping", "#fashion", "#ecommerce"],
                        "education": ["#education", "#learning", "#knowledge", "#training"]
                    }
                    
                    hashtag_mix["industry"] = industry_hashtags.get(industry, ["#business", "#professional"])[:3]
                    
                    # Platform-specific trending hashtags
                    if platform == "instagram":
                        hashtag_mix["trending"] = ["#instagood", "#photooftheday", "#instadaily"]
                    elif platform == "twitter":
                        hashtag_mix["trending"] = ["#MondayMotivation", "#ThrowbackThursday", "#FridayFeeling"]
                    elif platform == "linkedin":
                        hashtag_mix["trending"] = ["#leadership", "#networking", "#career"]
                    
                    # Niche hashtags based on audience interests
                    audience_interests = target_audience.get('interests', [])
                    for interest in audience_interests[:2]:
                        hashtag_mix["niche"].append(f"#{interest.lower().replace(' ', '')}")
                    
                    # Location hashtags if available
                    location = target_audience.get('location', '')
                    if location:
                        hashtag_mix["location"] = [f"#{location.lower().replace(' ', '')}"]
                    
                    # Optimize for platform limits
                    total_hashtags = sum(len(tags) for tags in hashtag_mix.values())
                    if total_hashtags > max_hashtags:
                        # Prioritize branded and industry hashtags
                        optimized_mix = {
                            "branded": hashtag_mix["branded"],
                            "industry": hashtag_mix["industry"][:2],
                            "trending": hashtag_mix["trending"][:2],
                            "niche": hashtag_mix["niche"][:1],
                            "location": hashtag_mix["location"][:1]
                        }
                        hashtag_strategy[platform] = optimized_mix
                    else:
                        hashtag_strategy[platform] = hashtag_mix
                
                return json.dumps({
                    "hashtag_strategy": hashtag_strategy,
                    "usage_guidelines": {
                        "instagram": "Use all hashtags in first comment",
                        "twitter": "Integrate hashtags naturally in tweet text",
                        "linkedin": "Use 3-5 hashtags at end of post",
                        "facebook": "Use 1-2 hashtags sparingly"
                    },
                    "monitoring_tips": [
                        "Track hashtag performance weekly",
                        "Replace low-performing hashtags",
                        "Monitor trending hashtags daily",
                        "Create campaign-specific hashtags"
                    ],
                    "confidence": 0.8
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def competitive_strategy_analysis(competitor_data: str) -> str:
            """Analyze competitor strategies and identify opportunities."""
            try:
                data = json.loads(competitor_data) if isinstance(competitor_data, str) else competitor_data
                
                competitors = data.get('competitors', [])
                our_metrics = data.get('our_metrics', {})
                
                analysis = {
                    "competitive_gaps": [],
                    "opportunities": [],
                    "differentiation_strategies": [],
                    "content_gaps": []
                }
                
                # Analyze competitor content strategies
                for competitor in competitors:
                    comp_name = competitor.get('name', 'Unknown')
                    comp_strategy = competitor.get('content_strategy', {})
                    comp_performance = competitor.get('performance', {})
                    
                    # Identify gaps
                    if comp_performance.get('engagement_rate', 0) > our_metrics.get('engagement_rate', 0):
                        analysis["competitive_gaps"].append(f"{comp_name} has higher engagement rate")
                        analysis["opportunities"].append("Improve content engagement through interactive posts")
                    
                    if comp_strategy.get('posting_frequency', 0) > our_metrics.get('posting_frequency', 0):
                        analysis["competitive_gaps"].append(f"{comp_name} posts more frequently")
                        analysis["opportunities"].append("Increase posting frequency while maintaining quality")
                    
                    # Content type analysis
                    comp_content_types = comp_strategy.get('content_types', [])
                    our_content_types = our_metrics.get('content_types', [])
                    
                    missing_types = set(comp_content_types) - set(our_content_types)
                    for content_type in missing_types:
                        analysis["content_gaps"].append(f"Missing content type: {content_type}")
                        analysis["opportunities"].append(f"Explore {content_type} content creation")
                
                # Differentiation strategies
                analysis["differentiation_strategies"] = [
                    "Focus on unique brand voice and personality",
                    "Leverage proprietary data and insights",
                    "Create exclusive content series",
                    "Build stronger community engagement",
                    "Develop thought leadership content"
                ]
                
                return json.dumps({
                    "competitive_analysis": analysis,
                    "strategic_recommendations": [
                        "Monitor competitor content weekly",
                        "Identify content gaps and opportunities",
                        "Develop unique value propositions",
                        "Focus on differentiation rather than imitation"
                    ],
                    "confidence": 0.75
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def create_campaign_brief(campaign_data: str) -> str:
            """Create comprehensive campaign creative brief."""
            try:
                data = json.loads(campaign_data) if isinstance(campaign_data, str) else campaign_data
                
                objective = data.get('objective', '')
                target_audience = data.get('target_audience', {})
                budget = data.get('budget', 0)
                duration = data.get('duration', 30)
                platforms = data.get('platforms', [])
                
                brief = {
                    "campaign_overview": {
                        "objective": objective,
                        "duration": f"{duration} days",
                        "budget": f"${budget:,.2f}",
                        "platforms": platforms
                    },
                    "target_audience": target_audience,
                    "key_messages": [],
                    "creative_direction": {},
                    "content_requirements": {},
                    "success_metrics": []
                }
                
                # Generate key messages based on objective
                if 'brand awareness' in objective.lower():
                    brief["key_messages"] = [
                        "Introduce brand values and mission",
                        "Showcase unique selling propositions",
                        "Build brand recognition and recall"
                    ]
                    brief["success_metrics"] = ["reach", "impressions", "brand_mention_increase"]
                
                elif 'lead generation' in objective.lower():
                    brief["key_messages"] = [
                        "Highlight value proposition",
                        "Address customer pain points",
                        "Provide clear call-to-action"
                    ]
                    brief["success_metrics"] = ["leads_generated", "conversion_rate", "cost_per_lead"]
                
                elif 'sales' in objective.lower():
                    brief["key_messages"] = [
                        "Showcase product benefits",
                        "Create urgency and scarcity",
                        "Provide social proof"
                    ]
                    brief["success_metrics"] = ["sales_revenue", "conversion_rate", "return_on_ad_spend"]
                
                # Creative direction
                brief["creative_direction"] = {
                    "visual_style": "Clean, modern, brand-consistent",
                    "tone_of_voice": "Professional yet approachable",
                    "color_palette": "Brand colors with accent highlights",
                    "typography": "Clear, readable fonts",
                    "imagery": "High-quality, authentic visuals"
                }
                
                # Content requirements by platform
                for platform in platforms:
                    platform_config = get_platform_config(platform)
                    brief["content_requirements"][platform] = {
                        "post_types": platform_config.get('supported_media', []),
                        "character_limit": platform_config.get('max_post_length', 0),
                        "hashtag_limit": platform_config.get('max_hashtags', 0),
                        "optimal_times": platform_config.get('optimal_posting_times', [])
                    }
                
                return json.dumps({
                    "campaign_brief": brief,
                    "implementation_timeline": {
                        "week_1": "Content creation and approval",
                        "week_2": "Campaign launch and monitoring",
                        "week_3": "Optimization and scaling",
                        "week_4": "Analysis and reporting"
                    },
                    "confidence": 0.85
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        return [
            analyze_business_objectives,
            develop_audience_strategy,
            create_content_calendar_strategy,
            develop_hashtag_strategy,
            competitive_strategy_analysis,
            create_campaign_brief
        ]
    
    async def _process_task(self, task: AgentTask) -> Any:
        """Process Strategy Agent specific tasks."""
        task_type = task.type
        input_data = task.input_data
        
        try:
            if task_type == "strategy_development":
                return await self._develop_content_strategy(input_data)
            elif task_type == "campaign_planning":
                return await self._create_campaign_plan(input_data)
            elif task_type == "audience_strategy":
                return await self._develop_audience_strategy(input_data)
            elif task_type == "competitive_analysis":
                return await self._analyze_competitive_strategy(input_data)
            elif task_type == "content_calendar":
                return await self._create_content_calendar_strategy(input_data)
            elif task_type == "hashtag_strategy":
                return await self._develop_hashtag_strategy(input_data)
            elif task_type == "brand_strategy":
                return await self._develop_brand_strategy(input_data)
            else:
                # Use the agent executor for general strategy tasks
                result = await self.agent_executor.ainvoke({
                    "input": f"Develop a social media strategy for: {json.dumps(input_data)}"
                })
                return result["output"]
                
        except Exception as e:
            self.logger.error(f"Error processing task {task_type}: {str(e)}")
            raise
    
    async def _develop_content_strategy(self, input_data: Dict[str, Any]) -> ContentStrategy:
        """Develop comprehensive content strategy."""
        # Log input data
        self.logger.info("🚀 STRATEGY AGENT: _develop_content_strategy - START", {
            "function": "_develop_content_strategy",
            "input_data": input_data,
            "input_keys": list(input_data.keys()),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        business_goals = input_data.get('business_goals', [])
        target_audience = input_data.get('target_audience', {})
        brand_info = input_data.get('brand_info', {})
        platforms = input_data.get('platforms', [])
        budget = input_data.get('budget', 0)
        timeline = input_data.get('timeline', '6m')
        
        self.logger.info("📊 STRATEGY AGENT: _develop_content_strategy - EXTRACTED PARAMETERS", {
            "business_goals": business_goals,
            "target_audience": target_audience,
            "brand_info": brand_info,
            "platforms": platforms,
            "budget": budget,
            "timeline": timeline
        })
        
        strategy_prompt = f"""
        Develop a comprehensive social media content strategy with the following parameters:
        
        Business Goals: {', '.join(business_goals)}
        Target Audience: {json.dumps(target_audience)}
        Brand Information: {json.dumps(brand_info)}
        Platforms: {', '.join(platforms)}
        Monthly Budget: ${budget:,.2f}
        Timeline: {timeline}
        
        Create a detailed strategy including:
        1. Strategic objectives aligned with business goals
        2. Target audience analysis and segmentation
        3. Content pillars and themes
        4. Platform-specific strategies
        5. Content mix and posting frequency
        6. Brand voice and messaging guidelines
        7. Hashtag strategy for each platform
        8. Success metrics and KPIs
        9. Budget allocation recommendations
        10. Implementation timeline
        """
        
        self.logger.info("💬 STRATEGY AGENT: _develop_content_strategy - SENDING TO AI EXECUTOR", {
            "prompt_length": len(strategy_prompt),
            "prompt_preview": strategy_prompt[:200] + "..." if len(strategy_prompt) > 200 else strategy_prompt
        })
        
        result = await self.agent_executor.ainvoke({"input": strategy_prompt})
        
        self.logger.info("🤖 STRATEGY AGENT: _develop_content_strategy - AI EXECUTOR RESPONSE", {
            "response_type": type(result).__name__,
            "response_keys": list(result.keys()) if isinstance(result, dict) else "Not a dict",
            "output_length": len(result.get("output", "")) if isinstance(result, dict) else 0,
            "output_preview": result.get("output", "")[:200] + "..." if isinstance(result, dict) and len(result.get("output", "")) > 200 else result.get("output", "") if isinstance(result, dict) else str(result)[:200]
        })
        
        # Create structured strategy object
        strategy = ContentStrategy(
            id=f"strategy_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            name=f"Content Strategy - {timeline}",
            objective=self._determine_primary_objective(business_goals),
            target_audience=target_audience,
            content_pillars=self._extract_content_pillars(result["output"]),
            platforms=platforms,
            posting_frequency=self._calculate_posting_frequency(platforms, budget),
            content_mix=self._determine_content_mix(business_goals),
            brand_voice=brand_info.get('voice', {}),
            key_messages=self._extract_key_messages(result["output"]),
            hashtag_strategy=self._create_hashtag_strategy(platforms, brand_info),
            campaign_themes=self._generate_campaign_themes(timeline),
            success_metrics=self._define_success_metrics(business_goals),
            timeline=self._create_timeline(timeline),
            budget_allocation=self._allocate_budget(platforms, budget),
            created_at=datetime.utcnow(),
            confidence=0.85
        )
        
        self.logger.info("📋 STRATEGY AGENT: _develop_content_strategy - STRATEGY OBJECT CREATED", {
            "strategy_id": strategy.id,
            "strategy_name": strategy.name,
            "objective": strategy.objective.value,
            "platforms_count": len(strategy.platforms),
            "content_pillars_count": len(strategy.content_pillars),
            "confidence": strategy.confidence
        })
        
        # Store strategy in memory
        await self._store_strategy(strategy)
        
        self.logger.info("✅ STRATEGY AGENT: _develop_content_strategy - COMPLETED", {
            "strategy_id": strategy.id,
            "strategy_name": strategy.name,
            "total_processing_time": "calculated_elsewhere",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return strategy
    
    async def _create_campaign_plan(self, input_data: Dict[str, Any]) -> CampaignPlan:
        """Create detailed campaign plan."""
        objective = input_data.get('campaign_objective', '')
        duration = input_data.get('duration', 30)
        platforms = input_data.get('platforms', [])
        budget = input_data.get('budget', 0)
        target_audience = input_data.get('target_audience', {})
        
        campaign_prompt = f"""
        Create a detailed social media campaign plan:
        
        Campaign Objective: {objective}
        Duration: {duration} days
        Platforms: {', '.join(platforms)}
        Budget: ${budget:,.2f}
        Target Audience: {json.dumps(target_audience)}
        
        Develop:
        1. Campaign concept and creative brief
        2. Content calendar with specific post ideas
        3. Budget allocation across platforms
        4. Target metrics and KPIs
        5. Call-to-action strategy
        6. Hashtag and keyword strategy
        7. Engagement and community management plan
        8. Performance monitoring approach
        """
        
        result = await self.agent_executor.ainvoke({"input": campaign_prompt})
        
        # Create structured campaign plan
        campaign = CampaignPlan(
            id=f"campaign_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            name=f"Campaign - {objective}",
            objective=objective,
            duration=duration,
            platforms=platforms,
            content_calendar=self._create_campaign_calendar(duration, platforms),
            budget=budget,
            target_metrics=self._set_campaign_metrics(objective, budget),
            creative_brief=result["output"],
            call_to_action=self._generate_cta(objective),
            hashtags=self._generate_campaign_hashtags(objective),
            created_at=datetime.utcnow()
        )
        
        # Store campaign in memory
        await self._store_campaign(campaign)
        
        return campaign
    
    def _determine_primary_objective(self, business_goals: List[str]) -> StrategyType:
        """Determine primary strategy objective from business goals."""
        goal_text = ' '.join(business_goals).lower()
        
        if 'brand awareness' in goal_text or 'visibility' in goal_text:
            return StrategyType.BRAND_AWARENESS
        elif 'lead' in goal_text or 'prospect' in goal_text:
            return StrategyType.LEAD_GENERATION
        elif 'sales' in goal_text or 'revenue' in goal_text:
            return StrategyType.SALES
        elif 'engagement' in goal_text or 'community' in goal_text:
            return StrategyType.ENGAGEMENT
        elif 'thought leader' in goal_text or 'authority' in goal_text:
            return StrategyType.THOUGHT_LEADERSHIP
        else:
            return StrategyType.BRAND_AWARENESS
    
    def _extract_content_pillars(self, strategy_text: str) -> List[ContentPillar]:
        """Extract content pillars from strategy text."""
        pillars = []
        text_lower = strategy_text.lower()
        
        if 'educational' in text_lower or 'tutorial' in text_lower:
            pillars.append(ContentPillar.EDUCATIONAL)
        if 'entertaining' in text_lower or 'fun' in text_lower:
            pillars.append(ContentPillar.ENTERTAINING)
        if 'inspirational' in text_lower or 'motivational' in text_lower:
            pillars.append(ContentPillar.INSPIRATIONAL)
        if 'promotional' in text_lower or 'product' in text_lower:
            pillars.append(ContentPillar.PROMOTIONAL)
        if 'behind' in text_lower or 'culture' in text_lower:
            pillars.append(ContentPillar.BEHIND_SCENES)
        if 'user' in text_lower or 'customer' in text_lower:
            pillars.append(ContentPillar.USER_GENERATED)
        
        # Ensure at least 3 pillars
        if len(pillars) < 3:
            default_pillars = [ContentPillar.EDUCATIONAL, ContentPillar.PROMOTIONAL, ContentPillar.ENTERTAINING]
            for pillar in default_pillars:
                if pillar not in pillars:
                    pillars.append(pillar)
                if len(pillars) >= 3:
                    break
        
        return pillars[:4]  # Maximum 4 pillars
    
    def _calculate_posting_frequency(self, platforms: List[str], budget: float) -> Dict[str, int]:
        """Calculate optimal posting frequency for each platform."""
        frequency = {}
        
        # Base frequency recommendations
        base_frequencies = {
            'facebook': 5,    # 5 posts per week
            'instagram': 7,   # 1 post per day
            'twitter': 14,    # 2 posts per day
            'linkedin': 3,    # 3 posts per week
            'tiktok': 7,      # 1 post per day
            'youtube': 2,     # 2 videos per week
            'pinterest': 5    # 5 pins per week
        }
        
        # Adjust based on budget
        budget_multiplier = min(budget / 1000, 2.0)  # Cap at 2x for high budgets
        
        for platform in platforms:
            base_freq = base_frequencies.get(platform.lower(), 5)
            adjusted_freq = int(base_freq * budget_multiplier)
            frequency[platform] = max(adjusted_freq, 1)  # Minimum 1 post per week
        
        return frequency
    
    def _determine_content_mix(self, business_goals: List[str]) -> Dict[str, float]:
        """Determine content mix percentages based on business goals."""
        goal_text = ' '.join(business_goals).lower()
        
        if 'sales' in goal_text or 'revenue' in goal_text:
            return {
                "promotional": 0.35,
                "educational": 0.25,
                "social_proof": 0.20,
                "entertaining": 0.20
            }
        elif 'brand awareness' in goal_text:
            return {
                "educational": 0.35,
                "entertaining": 0.30,
                "behind_scenes": 0.20,
                "promotional": 0.15
            }
        elif 'engagement' in goal_text:
            return {
                "entertaining": 0.40,
                "interactive": 0.25,
                "behind_scenes": 0.20,
                "educational": 0.15
            }
        else:
            return {
                "educational": 0.30,
                "promotional": 0.25,
                "entertaining": 0.25,
                "behind_scenes": 0.20
            }
    
    def _extract_key_messages(self, strategy_text: str) -> List[str]:
        """Extract key messages from strategy text."""
        # Simple extraction logic (in production, this would be more sophisticated)
        messages = [
            "Build trust through authentic communication",
            "Provide value through educational content",
            "Engage with community consistently",
            "Showcase unique brand personality"
        ]
        return messages
    
    def _create_hashtag_strategy(self, platforms: List[str], brand_info: Dict[str, Any]) -> Dict[str, List[str]]:
        """Create hashtag strategy for each platform."""
        strategy = {}
        brand_name = brand_info.get('name', 'brand').lower().replace(' ', '')
        
        for platform in platforms:
            if platform.lower() == 'instagram':
                strategy[platform] = [
                    f"#{brand_name}",
                    "#socialmedia",
                    "#marketing",
                    "#business",
                    "#entrepreneur"
                ]
            elif platform.lower() == 'twitter':
                strategy[platform] = [
                    f"#{brand_name}",
                    "#marketing",
                    "#business"
                ]
            elif platform.lower() == 'linkedin':
                strategy[platform] = [
                    "#leadership",
                    "#business",
                    "#professional",
                    "#networking"
                ]
            else:
                strategy[platform] = [f"#{brand_name}", "#business", "#marketing"]
        
        return strategy
    
    def _generate_campaign_themes(self, timeline: str) -> List[str]:
        """Generate campaign themes based on timeline."""
        if timeline == '3m':
            return ["Launch Campaign", "Growth Campaign", "Optimization Campaign"]
        elif timeline == '6m':
            return [
                "Brand Introduction",
                "Value Demonstration", 
                "Community Building",
                "Product Showcase",
                "Customer Success",
                "Future Vision"
            ]
        else:  # 12m
            return [
                "Q1: Foundation Building",
                "Q2: Growth Acceleration", 
                "Q3: Market Expansion",
                "Q4: Year-End Push"
            ]
    
    def _define_success_metrics(self, business_goals: List[str]) -> List[str]:
        """Define success metrics based on business goals."""
        goal_text = ' '.join(business_goals).lower()
        
        metrics = ["engagement_rate", "reach", "impressions"]  # Base metrics
        
        if 'sales' in goal_text:
            metrics.extend(["conversion_rate", "revenue", "cost_per_acquisition"])
        elif 'lead' in goal_text:
            metrics.extend(["leads_generated", "cost_per_lead", "lead_quality_score"])
        elif 'brand awareness' in goal_text:
            metrics.extend(["brand_mention_increase", "share_of_voice", "brand_sentiment"])
        elif 'engagement' in goal_text:
            metrics.extend(["comments", "shares", "saves", "community_growth"])
        
        return metrics
    
    def _create_timeline(self, timeline: str) -> Dict[str, Any]:
        """Create implementation timeline."""
        if timeline == '3m':
            return {
                "phase_1": "Month 1: Setup and Launch",
                "phase_2": "Month 2: Optimization",
                "phase_3": "Month 3: Scale and Analyze"
            }
        elif timeline == '6m':
            return {
                "phase_1": "Months 1-2: Foundation",
                "phase_2": "Months 3-4: Growth",
                "phase_3": "Months 5-6: Optimization"
            }
        else:
            return {
                "q1": "Foundation and Setup",
                "q2": "Growth and Expansion",
                "q3": "Optimization and Scale",
                "q4": "Analysis and Planning"
            }
    
    def _allocate_budget(self, platforms: List[str], total_budget: float) -> Dict[str, float]:
        """Allocate budget across platforms."""
        if not platforms or total_budget <= 0:
            return {}
        
        # Platform priority weights
        weights = {
            'facebook': 0.25,
            'instagram': 0.25,
            'linkedin': 0.20,
            'twitter': 0.15,
            'tiktok': 0.10,
            'youtube': 0.30,
            'pinterest': 0.10
        }
        
        # Calculate allocation
        total_weight = sum(weights.get(platform.lower(), 0.15) for platform in platforms)
        allocation = {}
        
        for platform in platforms:
            platform_weight = weights.get(platform.lower(), 0.15)
            allocation[platform] = (platform_weight / total_weight) * total_budget
        
        return allocation
    
    def _create_campaign_calendar(self, duration: int, platforms: List[str]) -> Dict[str, List[Dict]]:
        """Create campaign content calendar."""
        calendar = {}
        start_date = datetime.utcnow()
        
        for day in range(duration):
            current_date = start_date + timedelta(days=day)
            date_str = current_date.strftime('%Y-%m-%d')
            
            daily_content = []
            for platform in platforms:
                # Simple content planning logic
                if day % 2 == 0:  # Every other day
                    daily_content.append({
                        "platform": platform,
                        "content_type": "post",
                        "theme": f"Day {day + 1} content",
                        "time": "10:00"
                    })
            
            if daily_content:
                calendar[date_str] = daily_content
        
        return calendar
    
    def _set_campaign_metrics(self, objective: str, budget: float) -> Dict[str, float]:
        """Set target metrics for campaign."""
        obj_lower = objective.lower()
        
        if 'brand awareness' in obj_lower:
            return {
                "reach": budget * 100,  # 100 reach per dollar
                "impressions": budget * 500,
                "brand_mentions": budget * 0.1
            }
        elif 'lead generation' in obj_lower:
            return {
                "leads": budget * 0.05,  # 5 leads per $100
                "cost_per_lead": 20.0,
                "conversion_rate": 0.02
            }
        elif 'sales' in obj_lower:
            return {
                "revenue": budget * 3,  # 3x ROAS
                "conversions": budget * 0.01,
                "cost_per_acquisition": 100.0
            }
        else:
            return {
                "engagement_rate": 0.05,
                "reach": budget * 50,
                "impressions": budget * 250
            }
    
    def _generate_cta(self, objective: str) -> str:
        """Generate call-to-action based on objective."""
        obj_lower = objective.lower()
        
        if 'sales' in obj_lower:
            return "Shop Now"
        elif 'lead' in obj_lower:
            return "Learn More"
        elif 'brand awareness' in obj_lower:
            return "Follow Us"
        elif 'engagement' in obj_lower:
            return "Join the Conversation"
        else:
            return "Get Started"
    
    def _generate_campaign_hashtags(self, objective: str) -> List[str]:
        """Generate campaign-specific hashtags."""
        obj_lower = objective.lower()
        
        base_hashtags = ["#campaign2024", "#socialmedia"]
        
        if 'sales' in obj_lower:
            base_hashtags.extend(["#sale", "#offer", "#discount"])
        elif 'brand awareness' in obj_lower:
            base_hashtags.extend(["#brand", "#awareness", "#introduction"])
        elif 'engagement' in obj_lower:
            base_hashtags.extend(["#community", "#engagement", "#interactive"])
        
        return base_hashtags
    
    async def _store_strategy(self, strategy: ContentStrategy):
        """Store strategy in memory."""
        try:
            strategy_content = f"Content Strategy: {strategy.name}\nObjective: {strategy.objective.value}\nPlatforms: {', '.join(strategy.platforms)}\nContent Pillars: {', '.join([p.value for p in strategy.content_pillars])}"
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                strategy_content,
                "content_strategy",
                "strategy",
                "strategy_agent",
                strategy.confidence,
                {
                    "strategy_id": strategy.id,
                    "objective": strategy.objective.value,
                    "platforms": strategy.platforms
                }
            )
            
            log_agent_activity(
                self.agent_type.value,
                f"Created content strategy: {strategy.name}",
                self.organization_id,
                strategy_id=strategy.id,
                confidence=strategy.confidence
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store strategy: {str(e)}")
    
    async def _store_campaign(self, campaign: CampaignPlan):
        """Store campaign in memory."""
        try:
            campaign_content = f"Campaign Plan: {campaign.name}\nObjective: {campaign.objective}\nDuration: {campaign.duration} days\nBudget: ${campaign.budget:,.2f}\nPlatforms: {', '.join(campaign.platforms)}"
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                campaign_content,
                "campaign_plan",
                "strategy",
                "strategy_agent",
                0.8,
                {
                    "campaign_id": campaign.id,
                    "objective": campaign.objective,
                    "budget": campaign.budget,
                    "duration": campaign.duration
                }
            )
            
            log_agent_activity(
                self.agent_type.value,
                f"Created campaign plan: {campaign.name}",
                self.organization_id,
                campaign_id=campaign.id,
                budget=campaign.budget
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store campaign: {str(e)}")
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score for Strategy Agent results."""
        if isinstance(result, ContentStrategy):
            return result.confidence
        elif isinstance(result, CampaignPlan):
            return 0.8  # Default campaign confidence
        elif isinstance(result, dict):
            return result.get('confidence', 0.7)
        else:
            return 0.6

