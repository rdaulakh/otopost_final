import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import uuid
from dataclasses import dataclass
from enum import Enum

from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import BaseTool, tool
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.base_agent import BaseAgent, AgentTask, AgentResponse
from config.settings import AgentType, get_platform_config
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_agent_activity

class PublishingStatus(str, Enum):
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"

class PublishingPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

@dataclass
class PublishingJob:
    """Represents a content publishing job."""
    id: str
    content_id: str
    platform: str
    content: Dict[str, Any]
    scheduled_time: datetime
    status: PublishingStatus
    priority: PublishingPriority
    retry_count: int
    max_retries: int
    error_message: Optional[str]
    published_at: Optional[datetime]
    platform_post_id: Optional[str]
    engagement_tracking: bool
    approval_required: bool
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]

@dataclass
class PublishingResult:
    """Represents the result of a publishing operation."""
    job_id: str
    platform: str
    success: bool
    platform_post_id: Optional[str]
    published_at: Optional[datetime]
    error_message: Optional[str]
    engagement_data: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    next_actions: List[str]

class PublishingInput(BaseModel):
    """Input schema for content publishing."""
    content_id: str = Field(description="ID of content to publish")
    platforms: List[str] = Field(description="Target platforms for publishing")
    scheduled_time: Optional[str] = Field(description="ISO format scheduled time")
    priority: PublishingPriority = Field(description="Publishing priority level")
    approval_required: bool = Field(description="Whether approval is required")
    engagement_tracking: bool = Field(description="Enable post-publication tracking")

class SchedulingInput(BaseModel):
    """Input schema for content scheduling."""
    content_items: List[Dict[str, Any]] = Field(description="Content items to schedule")
    scheduling_strategy: str = Field(description="Scheduling strategy (optimal, custom, bulk)")
    time_zone: str = Field(description="Target timezone for scheduling")
    date_range: Dict[str, str] = Field(description="Start and end dates for scheduling")

class ExecutionAgent(BaseAgent):
    """Execution Agent for content publishing and scheduling automation."""
    
    def __init__(self, organization_id: str):
        super().__init__(AgentType.EXECUTION, organization_id)
        self.publishing_queue = []
        self.active_jobs = {}
        self.platform_clients = {}
        self.scheduling_rules = {}
        
    async def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the Execution Agent's system prompt."""
        system_prompt = """You are an AI Execution Agent specialized in automated content publishing and scheduling across social media platforms.

Your primary responsibilities:
1. Execute content publishing across multiple social media platforms
2. Manage content scheduling with optimal timing strategies
3. Handle publishing workflows and approval processes
4. Monitor publishing success and handle failures with retry logic
5. Coordinate cross-platform content distribution
6. Track post-publication performance and engagement
7. Manage publishing queues and prioritization
8. Ensure content compliance and platform-specific requirements

Key capabilities:
- Multi-platform publishing automation
- Intelligent scheduling optimization
- Publishing workflow management
- Error handling and retry mechanisms
- Content approval and moderation workflows
- Performance tracking and monitoring
- Queue management and prioritization
- Platform API integration and management

Publishing Guidelines:
- Always verify content meets platform requirements before publishing
- Respect platform rate limits and API constraints
- Implement proper error handling and retry logic
- Maintain detailed logs of all publishing activities
- Ensure content approval workflows are followed
- Optimize publishing times for maximum engagement
- Handle cross-platform content variations appropriately
- Monitor post-publication performance metrics

Platform-Specific Considerations:
- Instagram: Image/video requirements, hashtag limits, story vs post
- Facebook: Community guidelines, page vs personal posting
- Twitter: Character limits, thread management, media attachments
- LinkedIn: Professional tone, article vs post format
- TikTok: Video requirements, trending hashtags, music licensing
- YouTube: Video processing, thumbnail optimization, SEO metadata
- Pinterest: Pin optimization, board organization, seasonal trends

Scheduling Optimization:
- Analyze audience activity patterns for optimal timing
- Consider time zones for global audience reach
- Balance posting frequency across platforms
- Avoid over-posting or content cannibalization
- Plan around holidays, events, and industry trends
- Implement content spacing for maximum visibility
- Coordinate campaign launches across platforms

Error Handling Protocol:
1. Immediate retry for temporary failures
2. Exponential backoff for rate limit issues
3. Content modification for policy violations
4. Manual review escalation for persistent failures
5. Alternative platform publishing for critical content
6. Detailed error logging and reporting
7. Automatic notification of stakeholders

Quality Assurance:
- Pre-publishing content validation
- Platform compliance checking
- Media file optimization and formatting
- Hashtag and mention validation
- Link verification and shortening
- Accessibility compliance (alt text, captions)
- Brand guideline adherence
- Legal and regulatory compliance

Remember: Ensure reliable, efficient, and compliant content publishing while maximizing reach and engagement across all platforms."""

        return ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
    
    async def _initialize_tools(self) -> List[BaseTool]:
        """Initialize Execution Agent specific tools."""
        
        @tool
        def schedule_content_publishing(scheduling_data: str) -> str:
            """Schedule content for publishing across multiple platforms."""
            try:
                data = json.loads(scheduling_data) if isinstance(scheduling_data, str) else scheduling_data
                
                content_items = data.get('content_items', [])
                strategy = data.get('scheduling_strategy', 'optimal')
                timezone = data.get('time_zone', 'UTC')
                date_range = data.get('date_range', {})
                
                scheduled_jobs = []
                
                for item in content_items:
                    content_id = item.get('content_id', str(uuid.uuid4()))
                    platforms = item.get('platforms', ['instagram'])
                    priority = item.get('priority', 'medium')
                    
                    for platform in platforms:
                        # Calculate optimal publishing time
                        optimal_time = self._calculate_optimal_time(platform, strategy, timezone)
                        
                        job = {
                            "job_id": str(uuid.uuid4()),
                            "content_id": content_id,
                            "platform": platform,
                            "scheduled_time": optimal_time.isoformat(),
                            "status": "scheduled",
                            "priority": priority,
                            "created_at": datetime.utcnow().isoformat()
                        }
                        
                        scheduled_jobs.append(job)
                
                return json.dumps({
                    "scheduled_jobs": scheduled_jobs,
                    "total_jobs": len(scheduled_jobs),
                    "scheduling_strategy": strategy,
                    "estimated_completion": self._estimate_completion_time(scheduled_jobs),
                    "confidence": 0.9
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def publish_content_immediately(publishing_data: str) -> str:
            """Publish content immediately to specified platforms."""
            try:
                data = json.loads(publishing_data) if isinstance(publishing_data, str) else publishing_data
                
                content_id = data.get('content_id', '')
                platforms = data.get('platforms', [])
                content = data.get('content', {})
                priority = data.get('priority', 'medium')
                
                publishing_results = []
                
                for platform in platforms:
                    # Validate content for platform
                    validation_result = self._validate_content_for_platform(content, platform)
                    
                    if validation_result['valid']:
                        # Simulate publishing process
                        result = {
                            "platform": platform,
                            "status": "published",
                            "platform_post_id": f"{platform}_{uuid.uuid4().hex[:8]}",
                            "published_at": datetime.utcnow().isoformat(),
                            "engagement_tracking_enabled": True,
                            "estimated_reach": self._estimate_reach(platform, content),
                            "success": True
                        }
                    else:
                        result = {
                            "platform": platform,
                            "status": "failed",
                            "error": validation_result['error'],
                            "success": False,
                            "retry_recommended": validation_result.get('retry_recommended', False)
                        }
                    
                    publishing_results.append(result)
                
                success_count = sum(1 for r in publishing_results if r['success'])
                
                return json.dumps({
                    "publishing_results": publishing_results,
                    "success_count": success_count,
                    "total_platforms": len(platforms),
                    "overall_success": success_count == len(platforms),
                    "next_actions": self._generate_next_actions(publishing_results),
                    "confidence": 0.85
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def manage_publishing_queue(queue_data: str) -> str:
            """Manage and optimize the publishing queue."""
            try:
                data = json.loads(queue_data) if isinstance(queue_data, str) else queue_data
                
                action = data.get('action', 'status')  # status, prioritize, reschedule, cancel
                job_ids = data.get('job_ids', [])
                new_priority = data.get('new_priority', 'medium')
                new_schedule = data.get('new_schedule', '')
                
                queue_status = {
                    "total_jobs": 25,  # Example data
                    "scheduled": 15,
                    "publishing": 3,
                    "published": 5,
                    "failed": 2,
                    "pending_approval": 8
                }
                
                if action == 'status':
                    return json.dumps({
                        "queue_status": queue_status,
                        "next_scheduled": datetime.utcnow() + timedelta(minutes=30),
                        "estimated_completion": datetime.utcnow() + timedelta(hours=6),
                        "platform_distribution": {
                            "instagram": 8,
                            "facebook": 6,
                            "twitter": 5,
                            "linkedin": 4,
                            "tiktok": 2
                        },
                        "confidence": 0.95
                    })
                
                elif action == 'prioritize':
                    updated_jobs = []
                    for job_id in job_ids:
                        updated_jobs.append({
                            "job_id": job_id,
                            "old_priority": "medium",
                            "new_priority": new_priority,
                            "updated_at": datetime.utcnow().isoformat()
                        })
                    
                    return json.dumps({
                        "action": "prioritize",
                        "updated_jobs": updated_jobs,
                        "queue_reordered": True,
                        "estimated_time_saved": "2 hours",
                        "confidence": 0.9
                    })
                
                elif action == 'reschedule':
                    rescheduled_jobs = []
                    for job_id in job_ids:
                        rescheduled_jobs.append({
                            "job_id": job_id,
                            "old_schedule": datetime.utcnow() + timedelta(hours=2),
                            "new_schedule": new_schedule,
                            "updated_at": datetime.utcnow().isoformat()
                        })
                    
                    return json.dumps({
                        "action": "reschedule",
                        "rescheduled_jobs": rescheduled_jobs,
                        "conflicts_resolved": True,
                        "confidence": 0.85
                    })
                
                elif action == 'cancel':
                    cancelled_jobs = []
                    for job_id in job_ids:
                        cancelled_jobs.append({
                            "job_id": job_id,
                            "status": "cancelled",
                            "cancelled_at": datetime.utcnow().isoformat(),
                            "reason": "User requested cancellation"
                        })
                    
                    return json.dumps({
                        "action": "cancel",
                        "cancelled_jobs": cancelled_jobs,
                        "queue_updated": True,
                        "confidence": 1.0
                    })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def handle_publishing_errors(error_data: str) -> str:
            """Handle publishing errors with retry logic and escalation."""
            try:
                data = json.loads(error_data) if isinstance(error_data, str) else error_data
                
                job_id = data.get('job_id', '')
                platform = data.get('platform', '')
                error_type = data.get('error_type', 'unknown')
                error_message = data.get('error_message', '')
                retry_count = data.get('retry_count', 0)
                
                error_handling = {
                    "job_id": job_id,
                    "platform": platform,
                    "error_analysis": {},
                    "recommended_actions": [],
                    "retry_strategy": {},
                    "escalation_required": False
                }
                
                # Analyze error type and determine response
                if error_type == 'rate_limit':
                    error_handling["error_analysis"] = {
                        "type": "rate_limit",
                        "severity": "medium",
                        "temporary": True,
                        "estimated_resolution": "15-60 minutes"
                    }
                    error_handling["recommended_actions"] = [
                        "Implement exponential backoff",
                        "Reschedule for later time slot",
                        "Distribute load across time periods"
                    ]
                    error_handling["retry_strategy"] = {
                        "retry_after": 900,  # 15 minutes
                        "max_retries": 5,
                        "backoff_multiplier": 2
                    }
                
                elif error_type == 'content_policy':
                    error_handling["error_analysis"] = {
                        "type": "content_policy",
                        "severity": "high",
                        "temporary": False,
                        "requires_modification": True
                    }
                    error_handling["recommended_actions"] = [
                        "Review content against platform policies",
                        "Modify content to comply with guidelines",
                        "Request human review and approval",
                        "Consider alternative platforms"
                    ]
                    error_handling["escalation_required"] = True
                
                elif error_type == 'authentication':
                    error_handling["error_analysis"] = {
                        "type": "authentication",
                        "severity": "high",
                        "temporary": True,
                        "requires_reauth": True
                    }
                    error_handling["recommended_actions"] = [
                        "Refresh authentication tokens",
                        "Re-establish platform connection",
                        "Verify account permissions",
                        "Check for account suspension"
                    ]
                    error_handling["retry_strategy"] = {
                        "retry_after": 300,  # 5 minutes
                        "max_retries": 3,
                        "requires_reauth": True
                    }
                
                elif error_type == 'media_processing':
                    error_handling["error_analysis"] = {
                        "type": "media_processing",
                        "severity": "medium",
                        "temporary": True,
                        "requires_optimization": True
                    }
                    error_handling["recommended_actions"] = [
                        "Optimize media file size and format",
                        "Retry with different media specifications",
                        "Use alternative media if available",
                        "Convert to platform-preferred format"
                    ]
                    error_handling["retry_strategy"] = {
                        "retry_after": 600,  # 10 minutes
                        "max_retries": 3,
                        "optimize_media": True
                    }
                
                else:
                    error_handling["error_analysis"] = {
                        "type": "unknown",
                        "severity": "medium",
                        "temporary": True,
                        "requires_investigation": True
                    }
                    error_handling["recommended_actions"] = [
                        "Log error for investigation",
                        "Retry with standard backoff",
                        "Escalate if retries fail",
                        "Consider alternative publishing method"
                    ]
                    error_handling["escalation_required"] = retry_count >= 3
                
                return json.dumps({
                    "error_handling": error_handling,
                    "immediate_action": error_handling["recommended_actions"][0],
                    "estimated_resolution_time": self._estimate_resolution_time(error_type),
                    "confidence": 0.8
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def optimize_publishing_schedule(optimization_data: str) -> str:
            """Optimize publishing schedule based on audience engagement patterns."""
            try:
                data = json.loads(optimization_data) if isinstance(optimization_data, str) else optimization_data
                
                platform = data.get('platform', 'instagram')
                audience_data = data.get('audience_data', {})
                current_schedule = data.get('current_schedule', [])
                optimization_goals = data.get('goals', ['engagement', 'reach'])
                
                # Analyze audience activity patterns
                activity_patterns = audience_data.get('activity_patterns', {})
                timezone = audience_data.get('primary_timezone', 'UTC')
                
                optimized_schedule = {
                    "platform": platform,
                    "optimal_times": [],
                    "frequency_recommendation": {},
                    "content_spacing": {},
                    "performance_prediction": {}
                }
                
                # Platform-specific optimal times
                if platform == 'instagram':
                    base_times = ['09:00', '13:00', '17:00', '19:00']
                elif platform == 'facebook':
                    base_times = ['10:00', '15:00', '20:00']
                elif platform == 'twitter':
                    base_times = ['08:00', '12:00', '17:00', '20:00']
                elif platform == 'linkedin':
                    base_times = ['08:00', '12:00', '17:00']
                elif platform == 'tiktok':
                    base_times = ['18:00', '19:00', '20:00', '21:00']
                else:
                    base_times = ['10:00', '14:00', '18:00']
                
                # Adjust based on audience data
                if activity_patterns:
                    peak_hours = activity_patterns.get('peak_hours', base_times)
                    optimized_schedule["optimal_times"] = peak_hours[:4]  # Top 4 times
                else:
                    optimized_schedule["optimal_times"] = base_times
                
                # Frequency recommendations
                optimized_schedule["frequency_recommendation"] = {
                    "posts_per_day": self._calculate_optimal_frequency(platform, audience_data),
                    "posts_per_week": self._calculate_weekly_frequency(platform, audience_data),
                    "minimum_spacing": self._calculate_minimum_spacing(platform),
                    "maximum_daily_posts": self._get_platform_limits(platform)['max_daily_posts']
                }
                
                # Content spacing optimization
                optimized_schedule["content_spacing"] = {
                    "minimum_interval": "2 hours",
                    "optimal_interval": "4-6 hours",
                    "avoid_times": ["02:00-06:00"],  # Low activity period
                    "peak_competition_times": ["12:00-13:00", "18:00-19:00"]
                }
                
                # Performance prediction
                current_performance = data.get('current_performance', {})
                optimized_schedule["performance_prediction"] = {
                    "expected_engagement_increase": "15-25%",
                    "expected_reach_increase": "10-20%",
                    "optimal_content_types": ["carousel", "video", "story"],
                    "estimated_improvement_timeline": "2-4 weeks"
                }
                
                return json.dumps({
                    "optimized_schedule": optimized_schedule,
                    "implementation_plan": [
                        "Gradually shift posting times to optimal slots",
                        "Test new schedule for 2 weeks",
                        "Monitor engagement metrics",
                        "Fine-tune based on performance data"
                    ],
                    "expected_benefits": [
                        "Higher engagement rates",
                        "Increased organic reach",
                        "Better audience interaction",
                        "Improved content visibility"
                    ],
                    "confidence": 0.85
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def track_post_publication_performance(tracking_data: str) -> str:
            """Track and analyze post-publication performance metrics."""
            try:
                data = json.loads(tracking_data) if isinstance(tracking_data, str) else tracking_data
                
                job_id = data.get('job_id', '')
                platform = data.get('platform', '')
                platform_post_id = data.get('platform_post_id', '')
                tracking_duration = data.get('tracking_duration', '24h')
                
                # Simulate performance tracking
                performance_metrics = {
                    "job_id": job_id,
                    "platform": platform,
                    "platform_post_id": platform_post_id,
                    "tracking_period": tracking_duration,
                    "metrics": {},
                    "engagement_analysis": {},
                    "audience_insights": {},
                    "recommendations": []
                }
                
                # Platform-specific metrics
                if platform == 'instagram':
                    performance_metrics["metrics"] = {
                        "likes": 245,
                        "comments": 18,
                        "shares": 12,
                        "saves": 34,
                        "reach": 1250,
                        "impressions": 1890,
                        "engagement_rate": 0.0247,
                        "profile_visits": 23
                    }
                elif platform == 'facebook':
                    performance_metrics["metrics"] = {
                        "likes": 156,
                        "comments": 24,
                        "shares": 31,
                        "reactions": 189,
                        "reach": 2100,
                        "impressions": 3200,
                        "engagement_rate": 0.019,
                        "link_clicks": 45
                    }
                elif platform == 'twitter':
                    performance_metrics["metrics"] = {
                        "likes": 89,
                        "retweets": 23,
                        "replies": 15,
                        "impressions": 5600,
                        "engagement_rate": 0.0227,
                        "profile_clicks": 12,
                        "link_clicks": 34
                    }
                elif platform == 'linkedin':
                    performance_metrics["metrics"] = {
                        "likes": 67,
                        "comments": 12,
                        "shares": 8,
                        "impressions": 1800,
                        "engagement_rate": 0.0483,
                        "profile_views": 15,
                        "company_page_clicks": 6
                    }
                
                # Engagement analysis
                performance_metrics["engagement_analysis"] = {
                    "peak_engagement_time": "2-4 hours after posting",
                    "engagement_velocity": "Above average",
                    "audience_sentiment": "Positive (85%)",
                    "top_engaging_demographics": ["25-34 age group", "Urban areas"],
                    "engagement_pattern": "Steady growth with evening spike"
                }
                
                # Audience insights
                performance_metrics["audience_insights"] = {
                    "primary_audience": "25-34 professionals",
                    "geographic_distribution": {"US": 45, "UK": 20, "Canada": 15, "Other": 20},
                    "device_breakdown": {"Mobile": 78, "Desktop": 22},
                    "engagement_by_time": {
                        "morning": 25,
                        "afternoon": 35,
                        "evening": 40
                    }
                }
                
                # Generate recommendations
                performance_metrics["recommendations"] = [
                    "Post similar content during evening hours for higher engagement",
                    "Consider creating more visual content based on high save rate",
                    "Engage with comments within first 2 hours for better visibility",
                    "Target 25-34 demographic with similar content themes"
                ]
                
                return json.dumps({
                    "performance_tracking": performance_metrics,
                    "tracking_status": "active",
                    "next_update": (datetime.utcnow() + timedelta(hours=6)).isoformat(),
                    "performance_score": 8.2,  # Out of 10
                    "compared_to_average": "+23% above account average",
                    "confidence": 0.9
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        return [
            schedule_content_publishing,
            publish_content_immediately,
            manage_publishing_queue,
            handle_publishing_errors,
            optimize_publishing_schedule,
            track_post_publication_performance
        ]
    
    def _calculate_optimal_time(self, platform: str, strategy: str, timezone: str) -> datetime:
        """Calculate optimal publishing time for platform."""
        base_time = datetime.utcnow()
        
        # Platform-specific optimal hours (in UTC)
        optimal_hours = {
            'instagram': [9, 13, 17, 19],
            'facebook': [10, 15, 20],
            'twitter': [8, 12, 17, 20],
            'linkedin': [8, 12, 17],
            'tiktok': [18, 19, 20, 21],
            'youtube': [14, 20, 21],
            'pinterest': [8, 11, 20, 21]
        }
        
        platform_hours = optimal_hours.get(platform.lower(), [10, 14, 18])
        
        if strategy == 'optimal':
            # Choose the next optimal hour
            current_hour = base_time.hour
            next_optimal = min([h for h in platform_hours if h > current_hour], default=platform_hours[0])
            
            if next_optimal <= current_hour:
                # Next day
                base_time = base_time.replace(hour=next_optimal, minute=0, second=0, microsecond=0) + timedelta(days=1)
            else:
                base_time = base_time.replace(hour=next_optimal, minute=0, second=0, microsecond=0)
        
        elif strategy == 'immediate':
            # Schedule for next available slot (15 minutes from now)
            base_time = base_time + timedelta(minutes=15)
        
        elif strategy == 'spread':
            # Spread content throughout the day
            base_time = base_time + timedelta(hours=2)
        
        return base_time
    
    def _validate_content_for_platform(self, content: Dict[str, Any], platform: str) -> Dict[str, Any]:
        """Validate content meets platform requirements."""
        platform_config = get_platform_config(platform)
        
        validation = {
            "valid": True,
            "error": None,
            "warnings": [],
            "retry_recommended": False
        }
        
        # Check text length
        text = content.get('text', '')
        max_length = platform_config.get('max_post_length', 2200)
        
        if len(text) > max_length:
            validation["valid"] = False
            validation["error"] = f"Text exceeds {max_length} character limit for {platform}"
            validation["retry_recommended"] = True
        
        # Check hashtag count
        hashtags = content.get('hashtags', [])
        max_hashtags = platform_config.get('max_hashtags', 30)
        
        if len(hashtags) > max_hashtags:
            validation["warnings"].append(f"Hashtag count ({len(hashtags)}) exceeds recommended limit ({max_hashtags})")
        
        # Check media requirements
        media = content.get('media', [])
        supported_media = platform_config.get('supported_media', ['image', 'video'])
        
        for media_item in media:
            media_type = media_item.get('type', 'image')
            if media_type not in supported_media:
                validation["valid"] = False
                validation["error"] = f"Media type '{media_type}' not supported on {platform}"
        
        return validation
    
    def _estimate_reach(self, platform: str, content: Dict[str, Any]) -> int:
        """Estimate potential reach for content on platform."""
        base_reach = {
            'instagram': 500,
            'facebook': 800,
            'twitter': 1200,
            'linkedin': 300,
            'tiktok': 2000,
            'youtube': 1500,
            'pinterest': 600
        }
        
        platform_reach = base_reach.get(platform.lower(), 500)
        
        # Adjust based on content characteristics
        if content.get('hashtags'):
            platform_reach = int(platform_reach * 1.2)
        
        if content.get('media'):
            platform_reach = int(platform_reach * 1.3)
        
        return platform_reach
    
    def _generate_next_actions(self, results: List[Dict[str, Any]]) -> List[str]:
        """Generate recommended next actions based on publishing results."""
        actions = []
        
        failed_platforms = [r['platform'] for r in results if not r['success']]
        successful_platforms = [r['platform'] for r in results if r['success']]
        
        if failed_platforms:
            actions.append(f"Retry publishing on failed platforms: {', '.join(failed_platforms)}")
            actions.append("Review and resolve publishing errors")
        
        if successful_platforms:
            actions.append(f"Monitor performance on published platforms: {', '.join(successful_platforms)}")
            actions.append("Enable engagement tracking and response monitoring")
        
        actions.append("Update publishing queue status")
        actions.append("Log publishing results for analysis")
        
        return actions
    
    def _estimate_completion_time(self, jobs: List[Dict[str, Any]]) -> str:
        """Estimate completion time for scheduled jobs."""
        if not jobs:
            return "No jobs scheduled"
        
        latest_job = max(jobs, key=lambda x: x['scheduled_time'])
        latest_time = datetime.fromisoformat(latest_job['scheduled_time'])
        
        return latest_time.isoformat()
    
    def _calculate_optimal_frequency(self, platform: str, audience_data: Dict[str, Any]) -> int:
        """Calculate optimal posting frequency per day."""
        base_frequency = {
            'instagram': 1,
            'facebook': 1,
            'twitter': 3,
            'linkedin': 1,
            'tiktok': 1,
            'youtube': 0.5,  # Every other day
            'pinterest': 2
        }
        
        return base_frequency.get(platform.lower(), 1)
    
    def _calculate_weekly_frequency(self, platform: str, audience_data: Dict[str, Any]) -> int:
        """Calculate optimal posting frequency per week."""
        daily_freq = self._calculate_optimal_frequency(platform, audience_data)
        return int(daily_freq * 7)
    
    def _calculate_minimum_spacing(self, platform: str) -> str:
        """Calculate minimum time spacing between posts."""
        spacing = {
            'instagram': "4 hours",
            'facebook': "6 hours",
            'twitter': "1 hour",
            'linkedin': "8 hours",
            'tiktok': "4 hours",
            'youtube': "24 hours",
            'pinterest': "2 hours"
        }
        
        return spacing.get(platform.lower(), "4 hours")
    
    def _get_platform_limits(self, platform: str) -> Dict[str, Any]:
        """Get platform-specific limits and constraints."""
        limits = {
            'instagram': {'max_daily_posts': 10, 'max_stories': 100},
            'facebook': {'max_daily_posts': 25, 'max_page_posts': 50},
            'twitter': {'max_daily_tweets': 300, 'max_dms': 1000},
            'linkedin': {'max_daily_posts': 5, 'max_articles': 3},
            'tiktok': {'max_daily_videos': 10, 'max_duration': 600},
            'youtube': {'max_daily_uploads': 100, 'max_duration': 43200},
            'pinterest': {'max_daily_pins': 50, 'max_boards': 2000}
        }
        
        return limits.get(platform.lower(), {'max_daily_posts': 10})
    
    def _estimate_resolution_time(self, error_type: str) -> str:
        """Estimate time to resolve different error types."""
        resolution_times = {
            'rate_limit': '15-60 minutes',
            'content_policy': '2-24 hours',
            'authentication': '5-30 minutes',
            'media_processing': '10-30 minutes',
            'network': '1-10 minutes',
            'unknown': '30 minutes - 2 hours'
        }
        
        return resolution_times.get(error_type, '1 hour')
    
    async def _process_task(self, task: AgentTask) -> Any:
        """Process Execution Agent specific tasks."""
        task_type = task.type
        input_data = task.input_data
        
        try:
            if task_type == "publish_content":
                return await self._publish_content(input_data)
            elif task_type == "schedule_content":
                return await self._schedule_content(input_data)
            elif task_type == "manage_queue":
                return await self._manage_publishing_queue(input_data)
            elif task_type == "handle_errors":
                return await self._handle_publishing_errors(input_data)
            elif task_type == "optimize_schedule":
                return await self._optimize_publishing_schedule(input_data)
            elif task_type == "track_performance":
                return await self._track_post_performance(input_data)
            elif task_type == "approve_content":
                return await self._handle_content_approval(input_data)
            else:
                # Use the agent executor for general execution tasks
                result = await self.agent_executor.ainvoke({
                    "input": f"Execute publishing task: {json.dumps(input_data)}"
                })
                return result["output"]
                
        except Exception as e:
            self.logger.error(f"Error processing task {task_type}: {str(e)}")
            raise
    
    async def _publish_content(self, input_data: Dict[str, Any]) -> PublishingResult:
        """Publish content immediately to specified platforms."""
        content_id = input_data.get('content_id', '')
        platforms = input_data.get('platforms', [])
        priority = PublishingPriority(input_data.get('priority', 'medium'))
        engagement_tracking = input_data.get('engagement_tracking', True)
        
        publishing_prompt = f"""
        Execute immediate content publishing with the following parameters:
        
        Content ID: {content_id}
        Target Platforms: {', '.join(platforms)}
        Priority: {priority.value}
        Engagement Tracking: {engagement_tracking}
        
        Execute publishing workflow:
        1. Validate content for each platform
        2. Check platform API status and rate limits
        3. Optimize content for platform-specific requirements
        4. Execute publishing with error handling
        5. Confirm successful publication
        6. Initialize performance tracking
        7. Log all publishing activities
        
        Ensure reliable publishing with proper error handling and retry logic.
        """
        
        result = await self.agent_executor.ainvoke({"input": publishing_prompt})
        
        # Create publishing result
        publishing_result = PublishingResult(
            job_id=str(uuid.uuid4()),
            platform=platforms[0] if platforms else 'unknown',
            success=True,  # Simulated success
            platform_post_id=f"post_{uuid.uuid4().hex[:8]}",
            published_at=datetime.utcnow(),
            error_message=None,
            engagement_data={},
            performance_metrics={},
            next_actions=["Monitor engagement", "Track performance metrics"]
        )
        
        # Store publishing result
        await self._store_publishing_result(publishing_result)
        
        return publishing_result
    
    async def _schedule_content(self, input_data: Dict[str, Any]) -> List[PublishingJob]:
        """Schedule content for future publishing."""
        content_items = input_data.get('content_items', [])
        strategy = input_data.get('scheduling_strategy', 'optimal')
        timezone = input_data.get('time_zone', 'UTC')
        
        scheduled_jobs = []
        
        for item in content_items:
            for platform in item.get('platforms', []):
                job = PublishingJob(
                    id=str(uuid.uuid4()),
                    content_id=item.get('content_id', ''),
                    platform=platform,
                    content=item.get('content', {}),
                    scheduled_time=self._calculate_optimal_time(platform, strategy, timezone),
                    status=PublishingStatus.SCHEDULED,
                    priority=PublishingPriority(item.get('priority', 'medium')),
                    retry_count=0,
                    max_retries=3,
                    error_message=None,
                    published_at=None,
                    platform_post_id=None,
                    engagement_tracking=item.get('engagement_tracking', True),
                    approval_required=item.get('approval_required', False),
                    approved_by=None,
                    approved_at=None,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    metadata={}
                )
                
                scheduled_jobs.append(job)
        
        # Store scheduled jobs
        for job in scheduled_jobs:
            await self._store_publishing_job(job)
        
        return scheduled_jobs
    
    async def _store_publishing_result(self, result: PublishingResult):
        """Store publishing result in memory."""
        try:
            result_content = f"Publishing Result: {result.job_id}\nPlatform: {result.platform}\nSuccess: {result.success}\nPublished At: {result.published_at}"
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                result_content,
                "publishing_result",
                "execution",
                "execution_agent",
                1.0 if result.success else 0.3,
                {
                    "job_id": result.job_id,
                    "platform": result.platform,
                    "success": result.success,
                    "published_at": result.published_at.isoformat() if result.published_at else None
                }
            )
            
            log_agent_activity(
                self.agent_type.value,
                f"Published content on {result.platform}: {'Success' if result.success else 'Failed'}",
                self.organization_id,
                job_id=result.job_id,
                platform=result.platform,
                success=result.success
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store publishing result: {str(e)}")
    
    async def _store_publishing_job(self, job: PublishingJob):
        """Store publishing job in memory."""
        try:
            job_content = f"Publishing Job: {job.id}\nContent ID: {job.content_id}\nPlatform: {job.platform}\nScheduled: {job.scheduled_time}\nStatus: {job.status.value}"
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                job_content,
                "publishing_job",
                "execution",
                "execution_agent",
                0.9,
                {
                    "job_id": job.id,
                    "content_id": job.content_id,
                    "platform": job.platform,
                    "status": job.status.value,
                    "scheduled_time": job.scheduled_time.isoformat(),
                    "priority": job.priority.value
                }
            )
            
            log_agent_activity(
                self.agent_type.value,
                f"Scheduled content for {job.platform} at {job.scheduled_time}",
                self.organization_id,
                job_id=job.id,
                platform=job.platform,
                scheduled_time=job.scheduled_time.isoformat()
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store publishing job: {str(e)}")
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score for Execution Agent results."""
        if isinstance(result, PublishingResult):
            return 1.0 if result.success else 0.3
        elif isinstance(result, list):
            # For scheduled jobs
            return 0.9
        elif isinstance(result, dict):
            return result.get('confidence', 0.8)
        else:
            return 0.7

