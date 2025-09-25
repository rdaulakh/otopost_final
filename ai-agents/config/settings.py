import os
from typing import Dict, List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from enum import Enum

class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class AIModel(str, Enum):
    GPT_4 = "gpt-4"
    GPT_4_TURBO = "gpt-4-turbo-preview"
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    CLAUDE_3_OPUS = "claude-3-opus-20240229"
    CLAUDE_3_SONNET = "claude-3-sonnet-20240229"
    CLAUDE_3_HAIKU = "claude-3-haiku-20240307"

class AgentType(str, Enum):
    INTELLIGENCE = "intelligence_agent"
    STRATEGY = "strategy_agent"
    CONTENT = "content_agent"
    EXECUTION = "execution_agent"
    LEARNING = "learning_agent"
    ENGAGEMENT = "engagement_agent"
    ANALYTICS = "analytics_agent"

class Settings(BaseSettings):
    # Environment
    environment: Environment = Field(default=Environment.DEVELOPMENT)
    debug: bool = Field(default=True)
    
    # API Keys
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_api_base: Optional[str] = Field(default=None, env="OPENAI_API_BASE")
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    
    # Database Connections
    mongodb_url: str = Field(default="mongodb://localhost:27017/social_media_ai")
    redis_url: str = Field(default="redis://localhost:6379")
    chroma_host: str = Field(default="localhost")
    chroma_port: int = Field(default=8000)
    
    # AI Model Configuration
    default_model: AIModel = Field(default=AIModel.GPT_4_TURBO)
    fallback_model: AIModel = Field(default=AIModel.GPT_3_5_TURBO)
    max_tokens: int = Field(default=4000)
    temperature: float = Field(default=0.7)
    
    # Agent Configuration
    max_concurrent_agents: int = Field(default=5)
    agent_timeout: int = Field(default=300)  # 5 minutes
    max_retries: int = Field(default=3)
    retry_delay: int = Field(default=5)  # seconds
    
    # Memory Configuration
    memory_retention_days: int = Field(default=90)
    max_memory_entries: int = Field(default=1000)
    memory_similarity_threshold: float = Field(default=0.8)
    
    # Task Queue Configuration
    celery_broker_url: str = Field(default="redis://localhost:6379/0")
    celery_result_backend: str = Field(default="redis://localhost:6379/0")
    task_queue_name: str = Field(default="ai_agents")
    
    # Logging Configuration
    log_level: str = Field(default="INFO")
    log_file: str = Field(default="logs/ai_agents.log")
    enable_file_logging: bool = Field(default=True)
    enable_console_logging: bool = Field(default=True)
    
    # Performance Configuration
    enable_caching: bool = Field(default=True)
    cache_ttl: int = Field(default=3600)  # 1 hour
    enable_metrics: bool = Field(default=True)
    metrics_port: int = Field(default=8001)
    
    # Social Media API Configuration
    twitter_api_key: Optional[str] = Field(default=None, env="TWITTER_API_KEY")
    twitter_api_secret: Optional[str] = Field(default=None, env="TWITTER_API_SECRET")
    facebook_app_id: Optional[str] = Field(default=None, env="FACEBOOK_APP_ID")
    facebook_app_secret: Optional[str] = Field(default=None, env="FACEBOOK_APP_SECRET")
    instagram_access_token: Optional[str] = Field(default=None, env="INSTAGRAM_ACCESS_TOKEN")
    linkedin_client_id: Optional[str] = Field(default=None, env="LINKEDIN_CLIENT_ID")
    linkedin_client_secret: Optional[str] = Field(default=None, env="LINKEDIN_CLIENT_SECRET")
    
    # Content Generation Configuration
    max_content_length: int = Field(default=2000)
    supported_languages: List[str] = Field(default=["en", "es", "fr", "de", "it", "pt"])
    default_language: str = Field(default="en")
    
    # Image Generation Configuration
    enable_image_generation: bool = Field(default=True)
    max_image_size: int = Field(default=2048)  # pixels
    supported_image_formats: List[str] = Field(default=["png", "jpg", "jpeg", "webp"])
    
    # Analytics Configuration
    analytics_retention_days: int = Field(default=365)
    enable_real_time_analytics: bool = Field(default=True)
    analytics_batch_size: int = Field(default=100)
    
    # Security Configuration
    enable_rate_limiting: bool = Field(default=True)
    rate_limit_requests: int = Field(default=100)
    rate_limit_window: int = Field(default=3600)  # 1 hour
    enable_request_validation: bool = Field(default=True)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Agent-specific configurations
AGENT_CONFIGS = {
    AgentType.INTELLIGENCE: {
        "name": "Intelligence Agent",
        "description": "Analyzes data and provides insights for content strategy",
        "model": AIModel.GPT_4_TURBO,
        "temperature": 0.3,
        "max_tokens": 3000,
        "tools": ["web_search", "data_analysis", "trend_analysis"],
        "memory_importance": 0.9,
        "execution_priority": 1
    },
    AgentType.STRATEGY: {
        "name": "Strategy Agent",
        "description": "Creates comprehensive content strategies and campaigns",
        "model": AIModel.GPT_4_TURBO,
        "temperature": 0.5,
        "max_tokens": 4000,
        "tools": ["competitor_analysis", "audience_research", "campaign_planning"],
        "memory_importance": 0.8,
        "execution_priority": 2
    },
    AgentType.CONTENT: {
        "name": "Content Agent",
        "description": "Generates and optimizes social media content",
        "model": AIModel.GPT_4_TURBO,
        "temperature": 0.7,
        "max_tokens": 2000,
        "tools": ["content_generation", "image_creation", "hashtag_optimization"],
        "memory_importance": 0.7,
        "execution_priority": 3
    },
    AgentType.EXECUTION: {
        "name": "Execution Agent",
        "description": "Handles content publishing and scheduling",
        "model": AIModel.GPT_3_5_TURBO,
        "temperature": 0.2,
        "max_tokens": 1000,
        "tools": ["social_media_posting", "scheduling", "platform_optimization"],
        "memory_importance": 0.6,
        "execution_priority": 4
    },
    AgentType.LEARNING: {
        "name": "Learning Agent",
        "description": "Analyzes performance and improves strategies",
        "model": AIModel.GPT_4_TURBO,
        "temperature": 0.4,
        "max_tokens": 3000,
        "tools": ["performance_analysis", "a_b_testing", "optimization"],
        "memory_importance": 0.9,
        "execution_priority": 5
    },
    AgentType.ENGAGEMENT: {
        "name": "Engagement Agent",
        "description": "Manages community interactions and responses",
        "model": AIModel.GPT_4_TURBO,
        "temperature": 0.6,
        "max_tokens": 1500,
        "tools": ["comment_management", "dm_responses", "community_building"],
        "memory_importance": 0.7,
        "execution_priority": 6
    },
    AgentType.ANALYTICS: {
        "name": "Analytics Agent",
        "description": "Provides advanced reporting and metrics analysis",
        "model": AIModel.GPT_4_TURBO,
        "temperature": 0.3,
        "max_tokens": 3000,
        "tools": ["data_visualization", "report_generation", "predictive_analytics"],
        "memory_importance": 0.8,
        "execution_priority": 7
    }
}

# Platform-specific configurations
PLATFORM_CONFIGS = {
    "facebook": {
        "max_post_length": 63206,
        "max_hashtags": 30,
        "optimal_posting_times": ["9:00", "13:00", "15:00"],
        "supported_media": ["image", "video", "carousel", "story"],
        "api_version": "v18.0"
    },
    "instagram": {
        "max_post_length": 2200,
        "max_hashtags": 30,
        "optimal_posting_times": ["11:00", "13:00", "17:00"],
        "supported_media": ["image", "video", "carousel", "story", "reel"],
        "api_version": "v18.0"
    },
    "twitter": {
        "max_post_length": 280,
        "max_hashtags": 2,
        "optimal_posting_times": ["9:00", "12:00", "17:00"],
        "supported_media": ["image", "video", "gif"],
        "api_version": "v2"
    },
    "linkedin": {
        "max_post_length": 3000,
        "max_hashtags": 5,
        "optimal_posting_times": ["8:00", "12:00", "17:00"],
        "supported_media": ["image", "video", "document", "article"],
        "api_version": "v2"
    },
    "tiktok": {
        "max_post_length": 150,
        "max_hashtags": 100,
        "optimal_posting_times": ["6:00", "10:00", "19:00"],
        "supported_media": ["video"],
        "api_version": "v1"
    },
    "youtube": {
        "max_post_length": 5000,
        "max_hashtags": 15,
        "optimal_posting_times": ["14:00", "16:00", "20:00"],
        "supported_media": ["video"],
        "api_version": "v3"
    },
    "pinterest": {
        "max_post_length": 500,
        "max_hashtags": 20,
        "optimal_posting_times": ["8:00", "11:00", "20:00"],
        "supported_media": ["image", "video"],
        "api_version": "v5"
    }
}

# Content templates for different industries
CONTENT_TEMPLATES = {
    "technology": {
        "post_types": ["tutorial", "news", "product_update", "behind_scenes", "tips"],
        "tone": "professional, innovative, educational",
        "hashtags": ["#tech", "#innovation", "#software", "#AI", "#startup"],
        "cta_templates": ["Learn more", "Try it now", "Get started", "Download", "Sign up"]
    },
    "healthcare": {
        "post_types": ["educational", "wellness_tips", "patient_stories", "research", "awareness"],
        "tone": "caring, professional, trustworthy",
        "hashtags": ["#health", "#wellness", "#healthcare", "#medical", "#prevention"],
        "cta_templates": ["Learn more", "Book appointment", "Contact us", "Read more", "Get help"]
    },
    "finance": {
        "post_types": ["tips", "market_update", "educational", "product_feature", "testimonial"],
        "tone": "trustworthy, professional, informative",
        "hashtags": ["#finance", "#investing", "#money", "#financial", "#wealth"],
        "cta_templates": ["Get started", "Learn more", "Contact advisor", "Apply now", "Calculate"]
    },
    "retail": {
        "post_types": ["product_showcase", "sale_announcement", "lifestyle", "user_generated", "seasonal"],
        "tone": "friendly, engaging, trendy",
        "hashtags": ["#fashion", "#style", "#sale", "#newcollection", "#shopping"],
        "cta_templates": ["Shop now", "Get yours", "Limited time", "Discover", "Order today"]
    },
    "education": {
        "post_types": ["educational", "student_spotlight", "course_announcement", "tips", "inspiration"],
        "tone": "inspiring, educational, supportive",
        "hashtags": ["#education", "#learning", "#students", "#knowledge", "#growth"],
        "cta_templates": ["Enroll now", "Learn more", "Apply today", "Discover", "Join us"]
    }
}

# Initialize settings
settings = Settings()

def get_agent_config(agent_type: AgentType) -> Dict:
    """Get configuration for a specific agent type."""
    return AGENT_CONFIGS.get(agent_type, {})

def get_platform_config(platform: str) -> Dict:
    """Get configuration for a specific social media platform."""
    return PLATFORM_CONFIGS.get(platform.lower(), {})

def get_content_template(industry: str) -> Dict:
    """Get content template for a specific industry."""
    return CONTENT_TEMPLATES.get(industry.lower(), CONTENT_TEMPLATES["technology"])

def is_production() -> bool:
    """Check if running in production environment."""
    return settings.environment == Environment.PRODUCTION

def is_development() -> bool:
    """Check if running in development environment."""
    return settings.environment == Environment.DEVELOPMENT

