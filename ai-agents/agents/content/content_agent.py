import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import re
from dataclasses import dataclass
from enum import Enum

from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import BaseTool, tool
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.base_agent import BaseAgent, AgentTask, AgentResponse
from config.settings import AgentType, get_platform_config, get_content_template
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_content_generation

class ContentType(str, Enum):
    POST = "post"
    STORY = "story"
    REEL = "reel"
    VIDEO = "video"
    CAROUSEL = "carousel"
    POLL = "poll"
    ARTICLE = "article"
    THREAD = "thread"

class ContentTone(str, Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FRIENDLY = "friendly"
    AUTHORITATIVE = "authoritative"
    HUMOROUS = "humorous"
    INSPIRATIONAL = "inspirational"
    EDUCATIONAL = "educational"

@dataclass
class GeneratedContent:
    """Represents generated content for social media."""
    id: str
    platform: str
    content_type: ContentType
    title: Optional[str]
    body: str
    hashtags: List[str]
    call_to_action: Optional[str]
    visual_description: Optional[str]
    target_audience: str
    tone: ContentTone
    keywords: List[str]
    character_count: int
    estimated_engagement: float
    seo_score: float
    brand_alignment: float
    created_at: datetime
    confidence: float
    metadata: Dict[str, Any]

@dataclass
class ContentVariation:
    """Represents A/B test variations of content."""
    id: str
    original_content_id: str
    variation_type: str  # headline, cta, tone, length
    content: str
    expected_performance: float
    created_at: datetime

class ContentGenerationInput(BaseModel):
    """Input schema for content generation."""
    topic: str = Field(description="Main topic or theme for content")
    platform: str = Field(description="Target social media platform")
    content_type: ContentType = Field(description="Type of content to generate")
    tone: ContentTone = Field(description="Desired tone of voice")
    target_audience: str = Field(description="Target audience description")
    keywords: List[str] = Field(description="Keywords to include")
    call_to_action: Optional[str] = Field(description="Specific call-to-action")
    brand_voice: Dict[str, str] = Field(description="Brand voice guidelines")

class ContentOptimizationInput(BaseModel):
    """Input schema for content optimization."""
    content: str = Field(description="Content to optimize")
    platform: str = Field(description="Target platform")
    optimization_goals: List[str] = Field(description="Optimization objectives")
    performance_data: Optional[Dict[str, Any]] = Field(description="Historical performance data")

class ContentAgent(BaseAgent):
    """Content Agent for AI-powered content creation and optimization."""
    
    def __init__(self, organization_id: str):
        super().__init__(AgentType.CONTENT, organization_id)
        self.content_cache = {}
        self.brand_voice_cache = {}
        self.performance_patterns = {}
        
    async def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the Content Agent's system prompt."""
        system_prompt = """You are an AI Content Agent specialized in creating engaging, high-quality social media content.

Your primary responsibilities:
1. Generate compelling social media posts, captions, and copy
2. Optimize content for specific platforms and audiences
3. Ensure brand voice consistency across all content
4. Create content variations for A/B testing
5. Incorporate SEO best practices and keyword optimization
6. Develop visual content descriptions and creative briefs
7. Personalize content based on audience segments
8. Optimize content length and format for each platform

Key capabilities:
- Creative copywriting and storytelling
- Platform-specific content optimization
- Brand voice adaptation and consistency
- SEO and keyword integration
- Audience personalization
- A/B testing variation creation
- Visual content conceptualization
- Performance-driven content optimization

Content Creation Guidelines:
- Always align with brand voice and messaging
- Optimize for platform-specific best practices
- Include relevant hashtags and keywords naturally
- Create compelling hooks and call-to-actions
- Ensure content is engaging and valuable
- Consider visual elements and multimedia integration
- Maintain consistency in tone and style
- Focus on audience needs and interests

Platform-Specific Considerations:
- Instagram: Visual-first, hashtag-heavy, story-driven
- Facebook: Community-focused, longer-form, discussion-oriented
- Twitter: Concise, timely, conversation-starting
- LinkedIn: Professional, thought-leadership, industry-focused
- TikTok: Trendy, authentic, entertainment-focused
- YouTube: Educational, storytelling, value-driven
- Pinterest: Inspirational, visual, search-optimized

Content Optimization Framework:
1. Audience Analysis (demographics, interests, behaviors)
2. Platform Optimization (format, length, timing)
3. Brand Alignment (voice, messaging, values)
4. SEO Integration (keywords, hashtags, searchability)
5. Engagement Optimization (hooks, CTAs, interaction)
6. Visual Coordination (imagery, videos, graphics)
7. Performance Prediction (engagement, reach, conversion)
8. A/B Testing (variations, experiments, optimization)

Quality Standards:
- Grammar and spelling accuracy
- Brand voice consistency
- Platform compliance
- Audience appropriateness
- Engagement potential
- Visual appeal coordination
- SEO effectiveness
- Conversion optimization

Remember: Create content that not only engages but also drives meaningful business results while maintaining authentic brand personality."""

        return ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
    
    async def _initialize_tools(self) -> List[BaseTool]:
        """Initialize Content Agent specific tools."""
        
        @tool
        def generate_social_media_post(generation_data: str) -> str:
            """Generate engaging social media post content."""
            try:
                data = json.loads(generation_data) if isinstance(generation_data, str) else generation_data
                
                topic = data.get('topic', '')
                platform = data.get('platform', 'instagram')
                tone = data.get('tone', 'friendly')
                target_audience = data.get('target_audience', 'general')
                keywords = data.get('keywords', [])
                
                platform_config = get_platform_config(platform)
                max_length = platform_config.get('max_post_length', 2200)
                max_hashtags = platform_config.get('max_hashtags', 30)
                
                # Generate content based on platform and tone
                if platform.lower() == 'instagram':
                    content = f"🌟 {topic}\n\n"
                    if tone == 'professional':
                        content += f"Discover how {topic.lower()} can transform your approach to {target_audience} engagement. "
                    elif tone == 'casual':
                        content += f"Let's talk about {topic.lower()}! It's been a game-changer for so many of us. "
                    elif tone == 'inspirational':
                        content += f"Every journey with {topic.lower()} starts with a single step. Today could be that day! "
                    
                    content += "What's your experience? Share in the comments! 👇"
                    
                elif platform.lower() == 'twitter':
                    if tone == 'professional':
                        content = f"Industry insight: {topic} is reshaping how we approach {target_audience} strategies. Key takeaways:"
                    elif tone == 'casual':
                        content = f"Hot take: {topic} is way more important than people realize. Here's why:"
                    else:
                        content = f"Quick thread on {topic} and why it matters for {target_audience}:"
                    
                elif platform.lower() == 'linkedin':
                    content = f"💡 Insights on {topic}\n\n"
                    content += f"In today's evolving landscape, {topic.lower()} has become crucial for {target_audience}. "
                    content += "Here are three key considerations:\n\n"
                    content += "1. Strategic implementation\n2. Measurable outcomes\n3. Long-term sustainability\n\n"
                    content += "What's your perspective on this topic?"
                
                elif platform.lower() == 'facebook':
                    content = f"Let's discuss {topic}! 🗣️\n\n"
                    content += f"I've been thinking about how {topic.lower()} impacts our {target_audience} community. "
                    content += "It's fascinating to see the different approaches and results people are getting.\n\n"
                    content += "What has been your experience? I'd love to hear your thoughts and stories!"
                
                else:
                    content = f"Exploring {topic} and its impact on {target_audience}. "
                    content += "Sharing insights and looking forward to your thoughts!"
                
                # Add keywords naturally
                if keywords:
                    keyword_text = f" Key areas: {', '.join(keywords[:3])}"
                    if len(content + keyword_text) <= max_length:
                        content += keyword_text
                
                # Generate hashtags
                hashtags = []
                if keywords:
                    for keyword in keywords[:5]:
                        hashtag = f"#{keyword.replace(' ', '').replace('-', '').lower()}"
                        hashtags.append(hashtag)
                
                # Add platform-specific hashtags
                if platform.lower() == 'instagram':
                    hashtags.extend(['#socialmedia', '#marketing', '#business'])
                elif platform.lower() == 'linkedin':
                    hashtags.extend(['#leadership', '#business', '#professional'])
                elif platform.lower() == 'twitter':
                    hashtags.extend(['#marketing', '#business'])
                
                hashtags = hashtags[:max_hashtags]
                
                # Ensure content fits platform limits
                if len(content) > max_length:
                    content = content[:max_length-3] + "..."
                
                return json.dumps({
                    "content": content,
                    "hashtags": hashtags,
                    "character_count": len(content),
                    "estimated_engagement": 0.75,
                    "seo_score": 0.8,
                    "brand_alignment": 0.85,
                    "confidence": 0.8
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def optimize_content_for_platform(optimization_data: str) -> str:
            """Optimize existing content for specific platform requirements."""
            try:
                data = json.loads(optimization_data) if isinstance(optimization_data, str) else optimization_data
                
                content = data.get('content', '')
                platform = data.get('platform', 'instagram')
                goals = data.get('optimization_goals', ['engagement'])
                
                platform_config = get_platform_config(platform)
                max_length = platform_config.get('max_post_length', 2200)
                optimal_length = platform_config.get('optimal_post_length', max_length // 2)
                
                optimized_content = content
                optimizations_applied = []
                
                # Length optimization
                if len(content) > max_length:
                    optimized_content = content[:max_length-3] + "..."
                    optimizations_applied.append("Truncated to fit platform limits")
                elif len(content) < optimal_length * 0.5:
                    # Content might be too short, suggest expansion
                    optimizations_applied.append("Content may benefit from expansion")
                
                # Platform-specific optimizations
                if platform.lower() == 'instagram':
                    # Add line breaks for readability
                    if '\n\n' not in optimized_content:
                        sentences = optimized_content.split('. ')
                        if len(sentences) > 2:
                            mid_point = len(sentences) // 2
                            optimized_content = '. '.join(sentences[:mid_point]) + '.\n\n' + '. '.join(sentences[mid_point:])
                            optimizations_applied.append("Added line breaks for Instagram readability")
                    
                    # Ensure emoji usage
                    if not any(char in optimized_content for char in ['🌟', '💡', '🚀', '✨', '👇', '💪']):
                        optimized_content = "✨ " + optimized_content
                        optimizations_applied.append("Added emoji for Instagram engagement")
                
                elif platform.lower() == 'twitter':
                    # Ensure thread-friendly format
                    if len(optimized_content) > 280:
                        # Break into thread format
                        parts = []
                        current_part = ""
                        sentences = optimized_content.split('. ')
                        
                        for sentence in sentences:
                            if len(current_part + sentence + '. ') <= 250:  # Leave room for thread numbering
                                current_part += sentence + '. '
                            else:
                                if current_part:
                                    parts.append(current_part.strip())
                                current_part = sentence + '. '
                        
                        if current_part:
                            parts.append(current_part.strip())
                        
                        # Format as thread
                        thread_content = []
                        for i, part in enumerate(parts, 1):
                            thread_content.append(f"{i}/{len(parts)} {part}")
                        
                        optimized_content = '\n\n'.join(thread_content)
                        optimizations_applied.append("Formatted as Twitter thread")
                
                elif platform.lower() == 'linkedin':
                    # Ensure professional formatting
                    if not optimized_content.startswith(('💡', '🔍', '📊', '🎯')):
                        optimized_content = "💡 " + optimized_content
                        optimizations_applied.append("Added professional emoji for LinkedIn")
                    
                    # Add question for engagement
                    if not optimized_content.endswith('?'):
                        optimized_content += "\n\nWhat's your experience with this? Share your thoughts below."
                        optimizations_applied.append("Added engagement question")
                
                # Engagement optimization
                if 'engagement' in goals:
                    if '?' not in optimized_content:
                        optimized_content += " What do you think?"
                        optimizations_applied.append("Added question for engagement")
                
                # SEO optimization
                if 'seo' in goals:
                    # Ensure content has good keyword density (basic check)
                    word_count = len(optimized_content.split())
                    if word_count > 20:  # Only for longer content
                        optimizations_applied.append("Content length suitable for SEO")
                
                return json.dumps({
                    "optimized_content": optimized_content,
                    "optimizations_applied": optimizations_applied,
                    "character_count": len(optimized_content),
                    "platform_compliance": True,
                    "estimated_improvement": 0.15,
                    "confidence": 0.85
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def create_content_variations(variation_data: str) -> str:
            """Create A/B test variations of content."""
            try:
                data = json.loads(variation_data) if isinstance(variation_data, str) else variation_data
                
                original_content = data.get('content', '')
                variation_types = data.get('variation_types', ['headline', 'cta', 'tone'])
                platform = data.get('platform', 'instagram')
                
                variations = []
                
                for var_type in variation_types:
                    if var_type == 'headline':
                        # Create headline variations
                        lines = original_content.split('\n')
                        if lines:
                            original_headline = lines[0]
                            
                            headline_variations = [
                                f"🔥 {original_headline.replace('🌟', '').strip()}",
                                f"💡 {original_headline.replace('🌟', '').strip()}",
                                f"🚀 {original_headline.replace('🌟', '').strip()}"
                            ]
                            
                            for i, new_headline in enumerate(headline_variations):
                                new_content = original_content.replace(lines[0], new_headline)
                                variations.append({
                                    "type": "headline",
                                    "variation_id": f"headline_v{i+1}",
                                    "content": new_content,
                                    "change_description": f"Changed headline emoji and emphasis"
                                })
                    
                    elif var_type == 'cta':
                        # Create CTA variations
                        cta_variations = [
                            "Share your thoughts below! 👇",
                            "What's your experience? Comment below!",
                            "Join the conversation in the comments!",
                            "Let me know what you think! 💭"
                        ]
                        
                        for i, new_cta in enumerate(cta_variations):
                            # Replace existing CTA or add new one
                            if any(phrase in original_content.lower() for phrase in ['comment', 'share', 'thoughts', 'experience']):
                                # Replace existing CTA
                                lines = original_content.split('\n')
                                for j, line in enumerate(lines):
                                    if any(phrase in line.lower() for phrase in ['comment', 'share', 'thoughts']):
                                        lines[j] = new_cta
                                        break
                                new_content = '\n'.join(lines)
                            else:
                                # Add new CTA
                                new_content = original_content + f"\n\n{new_cta}"
                            
                            variations.append({
                                "type": "cta",
                                "variation_id": f"cta_v{i+1}",
                                "content": new_content,
                                "change_description": f"Modified call-to-action"
                            })
                    
                    elif var_type == 'tone':
                        # Create tone variations
                        if 'professional' in original_content.lower() or 'discover' in original_content.lower():
                            # Make more casual
                            casual_content = original_content.replace('Discover how', 'Ever wondered how')
                            casual_content = casual_content.replace('transform your approach', 'change the game')
                            variations.append({
                                "type": "tone",
                                "variation_id": "tone_casual",
                                "content": casual_content,
                                "change_description": "Made tone more casual and conversational"
                            })
                        
                        if 'casual' in original_content.lower() or "let's" in original_content.lower():
                            # Make more professional
                            professional_content = original_content.replace("Let's talk about", "Exploring the impact of")
                            professional_content = professional_content.replace("game-changer", "transformative solution")
                            variations.append({
                                "type": "tone",
                                "variation_id": "tone_professional",
                                "content": professional_content,
                                "change_description": "Made tone more professional and authoritative"
                            })
                    
                    elif var_type == 'length':
                        # Create length variations
                        sentences = original_content.split('. ')
                        
                        if len(sentences) > 3:
                            # Create shorter version
                            short_content = '. '.join(sentences[:2]) + '.'
                            if not short_content.endswith(('?', '!', '👇')):
                                short_content += " What do you think?"
                            
                            variations.append({
                                "type": "length",
                                "variation_id": "length_short",
                                "content": short_content,
                                "change_description": "Created shorter, more concise version"
                            })
                        
                        # Create longer version
                        expanded_content = original_content
                        if not any(phrase in original_content for phrase in ['Here are', 'Key points', 'Consider']):
                            expanded_content += "\n\nKey considerations:\n• Impact on engagement\n• Long-term benefits\n• Implementation strategies"
                            
                            variations.append({
                                "type": "length",
                                "variation_id": "length_long",
                                "content": expanded_content,
                                "change_description": "Added detailed points and structure"
                            })
                
                return json.dumps({
                    "variations": variations,
                    "total_variations": len(variations),
                    "recommended_test_duration": "7 days",
                    "confidence": 0.8
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def generate_visual_content_brief(visual_data: str) -> str:
            """Generate creative brief for visual content."""
            try:
                data = json.loads(visual_data) if isinstance(visual_data, str) else visual_data
                
                content_text = data.get('content', '')
                platform = data.get('platform', 'instagram')
                content_type = data.get('content_type', 'post')
                brand_colors = data.get('brand_colors', ['#000000', '#FFFFFF'])
                
                visual_brief = {
                    "concept": "",
                    "visual_elements": [],
                    "color_palette": brand_colors,
                    "typography": {},
                    "composition": {},
                    "style": "",
                    "dimensions": {}
                }
                
                # Platform-specific dimensions
                if platform.lower() == 'instagram':
                    if content_type == 'post':
                        visual_brief["dimensions"] = {"width": 1080, "height": 1080, "aspect_ratio": "1:1"}
                    elif content_type == 'story':
                        visual_brief["dimensions"] = {"width": 1080, "height": 1920, "aspect_ratio": "9:16"}
                    elif content_type == 'reel':
                        visual_brief["dimensions"] = {"width": 1080, "height": 1920, "aspect_ratio": "9:16"}
                elif platform.lower() == 'facebook':
                    visual_brief["dimensions"] = {"width": 1200, "height": 630, "aspect_ratio": "1.91:1"}
                elif platform.lower() == 'twitter':
                    visual_brief["dimensions"] = {"width": 1200, "height": 675, "aspect_ratio": "16:9"}
                elif platform.lower() == 'linkedin':
                    visual_brief["dimensions"] = {"width": 1200, "height": 627, "aspect_ratio": "1.91:1"}
                
                # Generate concept based on content
                if 'professional' in content_text.lower() or 'business' in content_text.lower():
                    visual_brief["concept"] = "Clean, professional design with modern typography and minimal visual elements"
                    visual_brief["style"] = "Corporate minimalism"
                elif 'creative' in content_text.lower() or 'inspiration' in content_text.lower():
                    visual_brief["concept"] = "Vibrant, creative design with dynamic elements and engaging visuals"
                    visual_brief["style"] = "Creative contemporary"
                elif 'education' in content_text.lower() or 'learn' in content_text.lower():
                    visual_brief["concept"] = "Informative design with clear hierarchy and educational visual elements"
                    visual_brief["style"] = "Educational infographic"
                else:
                    visual_brief["concept"] = "Balanced design combining professionalism with approachability"
                    visual_brief["style"] = "Modern friendly"
                
                # Visual elements based on content
                visual_brief["visual_elements"] = [
                    "Brand logo placement",
                    "Key text overlay",
                    "Supporting graphics or icons",
                    "Background texture or pattern"
                ]
                
                if 'data' in content_text.lower() or 'statistics' in content_text.lower():
                    visual_brief["visual_elements"].extend(["Charts or graphs", "Data visualization"])
                
                if 'team' in content_text.lower() or 'people' in content_text.lower():
                    visual_brief["visual_elements"].append("Human elements or photography")
                
                # Typography recommendations
                visual_brief["typography"] = {
                    "headline": "Bold, sans-serif font for impact",
                    "body": "Clean, readable font for content",
                    "accent": "Script or decorative font for emphasis",
                    "hierarchy": "Clear size differentiation between elements"
                }
                
                # Composition guidelines
                visual_brief["composition"] = {
                    "layout": "Rule of thirds with focal point emphasis",
                    "balance": "Asymmetrical balance with visual weight distribution",
                    "white_space": "Generous white space for readability",
                    "alignment": "Left or center alignment based on content length"
                }
                
                return json.dumps({
                    "visual_brief": visual_brief,
                    "production_notes": [
                        "Ensure brand consistency across all elements",
                        "Optimize for mobile viewing",
                        "Consider accessibility with color contrast",
                        "Include clear call-to-action if needed"
                    ],
                    "estimated_production_time": "2-4 hours",
                    "confidence": 0.85
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def analyze_content_performance_patterns(pattern_data: str) -> str:
            """Analyze patterns in content performance for optimization."""
            try:
                data = json.loads(pattern_data) if isinstance(pattern_data, str) else pattern_data
                
                content_history = data.get('content_history', [])
                performance_metrics = data.get('performance_metrics', {})
                
                patterns = {
                    "high_performing_elements": [],
                    "low_performing_elements": [],
                    "optimal_characteristics": {},
                    "recommendations": []
                }
                
                if content_history:
                    # Analyze content length patterns
                    length_performance = {}
                    for content in content_history:
                        length_range = self._get_length_range(len(content.get('text', '')))
                        engagement = content.get('engagement_rate', 0)
                        
                        if length_range not in length_performance:
                            length_performance[length_range] = []
                        length_performance[length_range].append(engagement)
                    
                    # Find best performing length range
                    best_length_range = max(length_performance.keys(), 
                                          key=lambda x: sum(length_performance[x]) / len(length_performance[x]))
                    patterns["optimal_characteristics"]["content_length"] = best_length_range
                    
                    # Analyze hashtag patterns
                    hashtag_performance = {}
                    for content in content_history:
                        hashtag_count = len(content.get('hashtags', []))
                        engagement = content.get('engagement_rate', 0)
                        
                        hashtag_range = self._get_hashtag_range(hashtag_count)
                        if hashtag_range not in hashtag_performance:
                            hashtag_performance[hashtag_range] = []
                        hashtag_performance[hashtag_range].append(engagement)
                    
                    if hashtag_performance:
                        best_hashtag_range = max(hashtag_performance.keys(),
                                               key=lambda x: sum(hashtag_performance[x]) / len(hashtag_performance[x]))
                        patterns["optimal_characteristics"]["hashtag_count"] = best_hashtag_range
                    
                    # Analyze posting time patterns
                    time_performance = {}
                    for content in content_history:
                        post_time = content.get('posted_at', '12:00')
                        hour = int(post_time.split(':')[0])
                        engagement = content.get('engagement_rate', 0)
                        
                        time_range = self._get_time_range(hour)
                        if time_range not in time_performance:
                            time_performance[time_range] = []
                        time_performance[time_range].append(engagement)
                    
                    if time_performance:
                        best_time_range = max(time_performance.keys(),
                                            key=lambda x: sum(time_performance[x]) / len(time_performance[x]))
                        patterns["optimal_characteristics"]["posting_time"] = best_time_range
                    
                    # High performing elements
                    avg_engagement = sum(c.get('engagement_rate', 0) for c in content_history) / len(content_history)
                    
                    for content in content_history:
                        if content.get('engagement_rate', 0) > avg_engagement * 1.2:
                            if content.get('has_question'):
                                patterns["high_performing_elements"].append("Questions for engagement")
                            if content.get('has_emoji'):
                                patterns["high_performing_elements"].append("Emoji usage")
                            if content.get('has_cta'):
                                patterns["high_performing_elements"].append("Clear call-to-action")
                            if content.get('content_type') == 'carousel':
                                patterns["high_performing_elements"].append("Carousel format")
                
                # Generate recommendations
                patterns["recommendations"] = [
                    f"Optimal content length: {patterns['optimal_characteristics'].get('content_length', 'medium')}",
                    f"Best hashtag count: {patterns['optimal_characteristics'].get('hashtag_count', '5-10')}",
                    f"Optimal posting time: {patterns['optimal_characteristics'].get('posting_time', 'morning')}",
                    "Include questions to boost engagement",
                    "Use emojis strategically for visual appeal",
                    "Always include clear call-to-action"
                ]
                
                return json.dumps({
                    "performance_patterns": patterns,
                    "confidence": 0.8,
                    "analysis_period": f"{len(content_history)} posts analyzed"
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        return [
            generate_social_media_post,
            optimize_content_for_platform,
            create_content_variations,
            generate_visual_content_brief,
            analyze_content_performance_patterns
        ]
    
    def _get_length_range(self, length: int) -> str:
        """Categorize content length into ranges."""
        if length < 100:
            return "short"
        elif length < 300:
            return "medium"
        elif length < 500:
            return "long"
        else:
            return "very_long"
    
    def _get_hashtag_range(self, count: int) -> str:
        """Categorize hashtag count into ranges."""
        if count < 3:
            return "few"
        elif count < 8:
            return "moderate"
        elif count < 15:
            return "many"
        else:
            return "excessive"
    
    def _get_time_range(self, hour: int) -> str:
        """Categorize posting time into ranges."""
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"
    
    async def _process_task(self, task: AgentTask) -> Any:
        """Process Content Agent specific tasks."""
        task_type = task.type
        input_data = task.input_data
        
        try:
            if task_type == "content_generation":
                return await self._generate_content(input_data)
            elif task_type == "content_optimization":
                return await self._optimize_content(input_data)
            elif task_type == "content_variations":
                return await self._create_variations(input_data)
            elif task_type == "visual_brief":
                return await self._create_visual_brief(input_data)
            elif task_type == "brand_voice_adaptation":
                return await self._adapt_brand_voice(input_data)
            elif task_type == "seo_optimization":
                return await self._optimize_for_seo(input_data)
            elif task_type == "personalization":
                return await self._personalize_content(input_data)
            else:
                # Use the agent executor for general content tasks
                result = await self.agent_executor.ainvoke({
                    "input": f"Create social media content for: {json.dumps(input_data)}"
                })
                return result["output"]
                
        except Exception as e:
            self.logger.error(f"Error processing task {task_type}: {str(e)}")
            raise
    
    async def _generate_content(self, input_data: Dict[str, Any]) -> GeneratedContent:
        """Generate new social media content."""
        topic = input_data.get('topic', '')
        platform = input_data.get('platform', 'instagram')
        content_type = ContentType(input_data.get('content_type', 'post'))
        tone = ContentTone(input_data.get('tone', 'friendly'))
        target_audience = input_data.get('target_audience', 'general audience')
        keywords = input_data.get('keywords', [])
        cta = input_data.get('call_to_action', '')
        brand_voice = input_data.get('brand_voice', {})
        
        generation_prompt = f"""
        Generate engaging social media content with the following specifications:
        
        Topic: {topic}
        Platform: {platform}
        Content Type: {content_type.value}
        Tone: {tone.value}
        Target Audience: {target_audience}
        Keywords: {', '.join(keywords)}
        Call-to-Action: {cta}
        Brand Voice: {json.dumps(brand_voice)}
        
        Create content that:
        1. Captures attention with a compelling hook
        2. Provides value to the target audience
        3. Incorporates keywords naturally
        4. Maintains consistent brand voice
        5. Includes appropriate hashtags
        6. Ends with an engaging call-to-action
        7. Optimizes for platform-specific best practices
        
        Ensure the content is engaging, authentic, and drives meaningful interaction.
        """
        
        result = await self.agent_executor.ainvoke({"input": generation_prompt})
        
        # Parse and structure the generated content
        generated_text = result["output"]
        
        # Extract hashtags from the generated content
        hashtags = re.findall(r'#\w+', generated_text)
        
        # Remove hashtags from main content for cleaner separation
        clean_content = re.sub(r'#\w+', '', generated_text).strip()
        
        # Create structured content object
        content = GeneratedContent(
            id=f"content_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            platform=platform,
            content_type=content_type,
            title=self._extract_title(clean_content),
            body=clean_content,
            hashtags=hashtags or self._generate_hashtags(topic, keywords, platform),
            call_to_action=cta or self._extract_cta(clean_content),
            visual_description=self._generate_visual_description(topic, content_type),
            target_audience=target_audience,
            tone=tone,
            keywords=keywords,
            character_count=len(clean_content),
            estimated_engagement=self._estimate_engagement(clean_content, platform),
            seo_score=self._calculate_seo_score(clean_content, keywords),
            brand_alignment=self._calculate_brand_alignment(clean_content, brand_voice),
            created_at=datetime.utcnow(),
            confidence=0.85,
            metadata={
                "generation_method": "ai_agent",
                "platform_optimized": True,
                "brand_voice_applied": bool(brand_voice)
            }
        )
        
        # Store content in memory
        await self._store_content(content)
        
        return content
    
    async def _optimize_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize existing content for better performance."""
        content = input_data.get('content', '')
        platform = input_data.get('platform', 'instagram')
        goals = input_data.get('optimization_goals', ['engagement'])
        performance_data = input_data.get('performance_data', {})
        
        optimization_prompt = f"""
        Optimize the following social media content for better performance:
        
        Original Content: {content}
        Platform: {platform}
        Optimization Goals: {', '.join(goals)}
        Historical Performance Data: {json.dumps(performance_data)}
        
        Optimize for:
        1. Platform-specific best practices
        2. Improved engagement potential
        3. Better SEO and discoverability
        4. Enhanced readability and flow
        5. Stronger call-to-action
        6. Optimal length and format
        
        Provide the optimized content along with explanations of changes made.
        """
        
        result = await self.agent_executor.ainvoke({"input": optimization_prompt})
        
        optimized_content = result["output"]
        
        # Calculate improvement metrics
        original_score = self._calculate_content_score(content)
        optimized_score = self._calculate_content_score(optimized_content)
        improvement = optimized_score - original_score
        
        return {
            "original_content": content,
            "optimized_content": optimized_content,
            "improvements": self._identify_improvements(content, optimized_content),
            "performance_increase": improvement,
            "optimization_confidence": 0.8,
            "optimized_at": datetime.utcnow().isoformat()
        }
    
    async def _create_variations(self, input_data: Dict[str, Any]) -> List[ContentVariation]:
        """Create A/B test variations of content."""
        content = input_data.get('content', '')
        variation_types = input_data.get('variation_types', ['headline', 'cta', 'tone'])
        platform = input_data.get('platform', 'instagram')
        
        variations = []
        
        for var_type in variation_types:
            variation_prompt = f"""
            Create a {var_type} variation of the following content for A/B testing:
            
            Original Content: {content}
            Platform: {platform}
            Variation Type: {var_type}
            
            Create a variation that:
            1. Maintains the core message
            2. Tests a different approach for {var_type}
            3. Could potentially perform better
            4. Remains platform-appropriate
            
            Provide only the varied content without explanations.
            """
            
            result = await self.agent_executor.ainvoke({"input": variation_prompt})
            
            variation = ContentVariation(
                id=f"var_{var_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                original_content_id=input_data.get('content_id', 'unknown'),
                variation_type=var_type,
                content=result["output"],
                expected_performance=self._estimate_variation_performance(result["output"], content),
                created_at=datetime.utcnow()
            )
            
            variations.append(variation)
        
        return variations
    
    def _extract_title(self, content: str) -> Optional[str]:
        """Extract title from content."""
        lines = content.split('\n')
        if lines:
            first_line = lines[0].strip()
            if len(first_line) < 100:  # Reasonable title length
                return first_line
        return None
    
    def _extract_cta(self, content: str) -> Optional[str]:
        """Extract call-to-action from content."""
        cta_patterns = [
            r'(.*(?:comment|share|click|visit|learn|discover|join|follow).*[!?])',
            r'(.*👇.*)',
            r'(.*what.*think.*\?)',
            r'(.*experience.*\?)'
        ]
        
        for pattern in cta_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        return None
    
    def _generate_hashtags(self, topic: str, keywords: List[str], platform: str) -> List[str]:
        """Generate relevant hashtags."""
        hashtags = []
        
        # Add topic-based hashtag
        topic_hashtag = f"#{topic.replace(' ', '').replace('-', '').lower()}"
        hashtags.append(topic_hashtag)
        
        # Add keyword-based hashtags
        for keyword in keywords[:3]:
            hashtag = f"#{keyword.replace(' ', '').replace('-', '').lower()}"
            hashtags.append(hashtag)
        
        # Add platform-specific hashtags
        platform_hashtags = {
            'instagram': ['#socialmedia', '#marketing', '#business', '#entrepreneur'],
            'linkedin': ['#leadership', '#business', '#professional', '#networking'],
            'twitter': ['#marketing', '#business', '#socialmedia'],
            'facebook': ['#community', '#business'],
            'tiktok': ['#fyp', '#viral', '#trending']
        }
        
        hashtags.extend(platform_hashtags.get(platform.lower(), ['#business', '#marketing'])[:3])
        
        return hashtags[:10]  # Limit to 10 hashtags
    
    def _generate_visual_description(self, topic: str, content_type: ContentType) -> str:
        """Generate description for visual content."""
        if content_type == ContentType.VIDEO:
            return f"Video content showcasing {topic} with engaging visuals and clear messaging"
        elif content_type == ContentType.CAROUSEL:
            return f"Multi-slide carousel explaining key aspects of {topic} with consistent branding"
        elif content_type == ContentType.STORY:
            return f"Story format content about {topic} with interactive elements"
        else:
            return f"Single image post about {topic} with clean, professional design"
    
    def _estimate_engagement(self, content: str, platform: str) -> float:
        """Estimate engagement potential of content."""
        score = 0.5  # Base score
        
        # Check for engagement elements
        if '?' in content:
            score += 0.1  # Questions increase engagement
        
        if any(emoji in content for emoji in ['🌟', '💡', '🚀', '✨', '👇', '💪']):
            score += 0.1  # Emojis increase engagement
        
        if any(word in content.lower() for word in ['you', 'your', 'we', 'us']):
            score += 0.1  # Personal pronouns increase engagement
        
        # Platform-specific adjustments
        if platform.lower() == 'instagram' and len(content) > 100:
            score += 0.05  # Longer content performs well on Instagram
        elif platform.lower() == 'twitter' and len(content) < 280:
            score += 0.05  # Concise content performs well on Twitter
        
        return min(score, 1.0)
    
    def _calculate_seo_score(self, content: str, keywords: List[str]) -> float:
        """Calculate SEO score based on keyword usage."""
        if not keywords:
            return 0.5
        
        content_lower = content.lower()
        keyword_score = 0
        
        for keyword in keywords:
            if keyword.lower() in content_lower:
                keyword_score += 1
        
        # Calculate percentage of keywords used
        score = keyword_score / len(keywords)
        
        # Bonus for natural keyword integration
        word_count = len(content.split())
        if word_count > 20:  # Only for longer content
            keyword_density = keyword_score / word_count
            if 0.01 <= keyword_density <= 0.03:  # Optimal keyword density
                score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_brand_alignment(self, content: str, brand_voice: Dict[str, str]) -> float:
        """Calculate how well content aligns with brand voice."""
        if not brand_voice:
            return 0.7  # Default score when no brand voice specified
        
        score = 0.7  # Base score
        
        tone = brand_voice.get('tone', '').lower()
        personality = brand_voice.get('personality', '').lower()
        
        content_lower = content.lower()
        
        # Check tone alignment
        if tone == 'professional' and any(word in content_lower for word in ['discover', 'insights', 'strategic']):
            score += 0.1
        elif tone == 'casual' and any(word in content_lower for word in ['hey', 'awesome', 'cool']):
            score += 0.1
        elif tone == 'friendly' and any(word in content_lower for word in ['we', 'together', 'community']):
            score += 0.1
        
        # Check personality alignment
        if personality == 'innovative' and any(word in content_lower for word in ['new', 'future', 'cutting-edge']):
            score += 0.1
        elif personality == 'trustworthy' and any(word in content_lower for word in ['reliable', 'proven', 'trusted']):
            score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_content_score(self, content: str) -> float:
        """Calculate overall content quality score."""
        score = 0.5  # Base score
        
        # Length score
        length = len(content)
        if 100 <= length <= 500:
            score += 0.1
        
        # Engagement elements
        if '?' in content:
            score += 0.1
        if any(emoji in content for emoji in ['🌟', '💡', '🚀', '✨']):
            score += 0.1
        
        # Structure score
        if '\n' in content:
            score += 0.05  # Has structure
        
        # Call-to-action score
        if any(phrase in content.lower() for phrase in ['comment', 'share', 'click', 'visit']):
            score += 0.1
        
        return min(score, 1.0)
    
    def _identify_improvements(self, original: str, optimized: str) -> List[str]:
        """Identify improvements made during optimization."""
        improvements = []
        
        if len(optimized) != len(original):
            if len(optimized) > len(original):
                improvements.append("Expanded content for better value")
            else:
                improvements.append("Condensed content for better readability")
        
        if optimized.count('?') > original.count('?'):
            improvements.append("Added questions for engagement")
        
        if optimized.count('\n') > original.count('\n'):
            improvements.append("Improved formatting and structure")
        
        # Check for emoji additions
        original_emojis = len(re.findall(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', original))
        optimized_emojis = len(re.findall(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', optimized))
        
        if optimized_emojis > original_emojis:
            improvements.append("Added emojis for visual appeal")
        
        if not improvements:
            improvements.append("General content optimization applied")
        
        return improvements
    
    def _estimate_variation_performance(self, variation: str, original: str) -> float:
        """Estimate performance potential of content variation."""
        original_score = self._calculate_content_score(original)
        variation_score = self._calculate_content_score(variation)
        
        # Return relative performance expectation
        return variation_score / original_score if original_score > 0 else 1.0
    
    async def _store_content(self, content: GeneratedContent):
        """Store generated content in memory."""
        try:
            content_text = f"Generated Content: {content.title or 'Untitled'}\nPlatform: {content.platform}\nType: {content.content_type.value}\nTone: {content.tone.value}\nContent: {content.body[:200]}..."
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                content_text,
                "generated_content",
                "content",
                "content_agent",
                content.confidence,
                {
                    "content_id": content.id,
                    "platform": content.platform,
                    "content_type": content.content_type.value,
                    "tone": content.tone.value,
                    "character_count": content.character_count,
                    "estimated_engagement": content.estimated_engagement
                }
            )
            
            log_content_generation(
                content.platform,
                content.content_type.value,
                content.character_count,
                content.estimated_engagement,
                self.agent_type.value,
                organization_id=self.organization_id,
                content_id=content.id
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store content: {str(e)}")
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score for Content Agent results."""
        if isinstance(result, GeneratedContent):
            return result.confidence
        elif isinstance(result, dict):
            return result.get('confidence', 0.7)
        elif isinstance(result, list):
            # For variations
            return 0.8
        else:
            return 0.6

