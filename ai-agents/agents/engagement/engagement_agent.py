import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import uuid
from dataclasses import dataclass
from enum import Enum
import re

from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import BaseTool, tool
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.base_agent import BaseAgent, AgentTask, AgentResponse
from config.settings import AgentType, get_platform_config
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_agent_activity

class EngagementType(str, Enum):
    COMMENT_RESPONSE = "comment_response"
    DIRECT_MESSAGE = "direct_message"
    MENTION_RESPONSE = "mention_response"
    REVIEW_RESPONSE = "review_response"
    COMMUNITY_MODERATION = "community_moderation"
    PROACTIVE_ENGAGEMENT = "proactive_engagement"
    CRISIS_MANAGEMENT = "crisis_management"

class ResponsePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
    CRISIS = "crisis"

class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    MIXED = "mixed"
    UNKNOWN = "unknown"

class ResponseStatus(str, Enum):
    PENDING = "pending"
    GENERATED = "generated"
    APPROVED = "approved"
    SENT = "sent"
    FAILED = "failed"
    ESCALATED = "escalated"

@dataclass
class EngagementItem:
    """Represents an engagement item requiring response."""
    id: str
    platform: str
    type: EngagementType
    content: str
    author: Dict[str, Any]
    post_id: Optional[str]
    parent_id: Optional[str]
    sentiment: SentimentType
    priority: ResponsePriority
    keywords: List[str]
    requires_human_review: bool
    auto_response_eligible: bool
    created_at: datetime
    response_deadline: datetime
    metadata: Dict[str, Any]

@dataclass
class EngagementResponse:
    """Represents a generated response to an engagement item."""
    id: str
    engagement_id: str
    response_text: str
    tone: str
    confidence: float
    requires_approval: bool
    status: ResponseStatus
    generated_at: datetime
    approved_at: Optional[datetime]
    sent_at: Optional[datetime]
    performance_metrics: Dict[str, Any]
    metadata: Dict[str, Any]

@dataclass
class CommunityInsight:
    """Represents insights about community engagement patterns."""
    id: str
    insight_type: str
    title: str
    description: str
    platforms: List[str]
    time_period: Dict[str, str]
    metrics: Dict[str, Any]
    trends: List[str]
    recommendations: List[str]
    confidence: float
    discovered_at: datetime
    metadata: Dict[str, Any]

class EngagementInput(BaseModel):
    """Input schema for engagement management."""
    engagement_type: EngagementType = Field(description="Type of engagement to handle")
    platform: str = Field(description="Social media platform")
    content: str = Field(description="Content of the engagement")
    author_info: Dict[str, Any] = Field(description="Information about the author")
    context: Dict[str, Any] = Field(description="Additional context")

class ResponseInput(BaseModel):
    """Input schema for response generation."""
    engagement_content: str = Field(description="Original engagement content")
    response_tone: str = Field(description="Desired tone for response")
    brand_voice: str = Field(description="Brand voice guidelines")
    context: str = Field(description="Additional context for response")

class EngagementAgent(BaseAgent):
    """Engagement Agent for community management and automated responses."""
    
    def __init__(self, organization_id: str):
        super().__init__(AgentType.ENGAGEMENT, organization_id)
        self.pending_engagements = []
        self.response_templates = {}
        self.sentiment_analyzer = None
        self.escalation_rules = {}
        self.community_insights = []
        
    async def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the Engagement Agent's system prompt."""
        system_prompt = """You are an AI Engagement Agent specialized in community management, customer service, and automated social media responses.

Your primary responsibilities:
1. Monitor and respond to comments, mentions, and direct messages
2. Provide excellent customer service and community management
3. Generate appropriate responses that match brand voice and tone
4. Identify and escalate issues requiring human intervention
5. Moderate community discussions and maintain positive environment
6. Proactively engage with community members and influencers
7. Handle crisis situations and negative feedback professionally
8. Analyze engagement patterns and provide community insights

Key capabilities:
- Intelligent response generation with brand voice consistency
- Sentiment analysis and emotion detection
- Crisis management and escalation protocols
- Community moderation and content filtering
- Proactive engagement and relationship building
- Multi-platform engagement coordination
- Response personalization and context awareness
- Performance tracking and optimization

Response Guidelines:
- Always maintain professional, helpful, and friendly tone
- Respond promptly to customer inquiries and concerns
- Personalize responses when possible using available context
- Escalate complex issues or complaints to human agents
- Never make promises about products, services, or policies without authorization
- Use appropriate platform-specific language and formatting
- Include relevant hashtags, mentions, or links when appropriate
- Maintain consistency with brand voice and messaging guidelines

Engagement Best Practices:
1. Response Timing
   - Respond to comments within 2-4 hours during business hours
   - Acknowledge urgent issues within 1 hour
   - Set expectations for response times on weekends/holidays
   - Prioritize negative feedback and complaints

2. Tone and Voice
   - Match the brand's established voice and personality
   - Adapt tone to the platform and audience
   - Use empathy and understanding for complaints
   - Maintain professionalism even with difficult customers
   - Show genuine interest in community members

3. Content Strategy
   - Ask engaging questions to drive conversation
   - Share relevant tips, insights, or behind-the-scenes content
   - Acknowledge and celebrate community achievements
   - Provide value through helpful responses and information
   - Use humor appropriately when it fits the brand

4. Crisis Management
   - Acknowledge issues quickly and transparently
   - Take conversations private when appropriate
   - Provide regular updates on resolution progress
   - Follow up to ensure customer satisfaction
   - Learn from incidents to prevent future issues

Platform-Specific Considerations:
- Instagram: Visual-first responses, use of emojis, story interactions
- Facebook: Longer-form responses, community building, event promotion
- Twitter: Concise responses, real-time engagement, trending topics
- LinkedIn: Professional tone, industry insights, thought leadership
- TikTok: Casual tone, trend awareness, creative responses
- YouTube: Detailed responses, video-specific feedback, community tab
- Pinterest: Visual inspiration, board collaboration, seasonal content

Sentiment Analysis Framework:
- Positive: Enthusiastic, satisfied, complimentary feedback
- Neutral: Informational, factual, or general inquiries
- Negative: Complaints, criticism, or dissatisfaction
- Mixed: Contains both positive and negative elements
- Crisis: Serious complaints, legal threats, or viral negative content

Escalation Triggers:
- Legal threats or mentions of lawsuits
- Serious product safety concerns
- Requests for refunds or compensation
- Complaints about discrimination or harassment
- Media inquiries or journalist requests
- Viral negative content or potential PR crises
- Technical issues affecting multiple customers
- Requests for sensitive company information

Response Personalization:
- Use customer's name when available
- Reference their specific situation or concern
- Acknowledge their history with the brand
- Tailor language to their communication style
- Consider their location, time zone, and cultural context
- Reference previous interactions or purchases when relevant

Community Building Strategies:
- Recognize and celebrate loyal community members
- Create opportunities for user-generated content
- Facilitate connections between community members
- Share community highlights and success stories
- Organize virtual events or challenges
- Provide exclusive content or early access to engaged followers

Quality Assurance:
- Review all responses for accuracy and appropriateness
- Ensure compliance with platform policies and guidelines
- Verify factual information before sharing
- Check for spelling, grammar, and formatting errors
- Confirm responses align with current brand messaging
- Monitor response performance and engagement metrics

Remember: Build genuine relationships with the community while protecting the brand's reputation and providing exceptional customer service. Always prioritize customer satisfaction and community well-being."""

        return ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
    
    async def _initialize_tools(self) -> List[BaseTool]:
        """Initialize Engagement Agent specific tools."""
        
        @tool
        def analyze_engagement_sentiment(engagement_data: str) -> str:
            """Analyze sentiment and context of engagement content."""
            try:
                data = json.loads(engagement_data) if isinstance(engagement_data, str) else engagement_data
                
                content = data.get('content', '')
                platform = data.get('platform', 'instagram')
                author_info = data.get('author_info', {})
                
                # Simulate sentiment analysis
                sentiment_analysis = {
                    "content": content,
                    "platform": platform,
                    "sentiment_score": 0.0,
                    "sentiment_label": "neutral",
                    "confidence": 0.0,
                    "emotions": {},
                    "keywords": [],
                    "intent": "",
                    "urgency": "medium",
                    "requires_human_review": False
                }
                
                # Analyze content for sentiment indicators
                positive_words = ['love', 'great', 'awesome', 'amazing', 'excellent', 'fantastic', 'wonderful', 'perfect', 'best', 'thank']
                negative_words = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'disappointed', 'angry', 'frustrated', 'problem', 'issue']
                question_words = ['how', 'what', 'when', 'where', 'why', 'can', 'could', 'would', 'help']
                urgent_words = ['urgent', 'emergency', 'asap', 'immediately', 'crisis', 'broken', 'not working']
                
                content_lower = content.lower()
                
                # Calculate sentiment score
                positive_count = sum(1 for word in positive_words if word in content_lower)
                negative_count = sum(1 for word in negative_words if word in content_lower)
                
                if positive_count > negative_count:
                    sentiment_analysis["sentiment_score"] = 0.3 + (positive_count * 0.2)
                    sentiment_analysis["sentiment_label"] = "positive"
                    sentiment_analysis["confidence"] = 0.8
                elif negative_count > positive_count:
                    sentiment_analysis["sentiment_score"] = -0.3 - (negative_count * 0.2)
                    sentiment_analysis["sentiment_label"] = "negative"
                    sentiment_analysis["confidence"] = 0.85
                    sentiment_analysis["requires_human_review"] = negative_count >= 2
                else:
                    sentiment_analysis["sentiment_score"] = 0.0
                    sentiment_analysis["sentiment_label"] = "neutral"
                    sentiment_analysis["confidence"] = 0.7
                
                # Detect emotions
                if any(word in content_lower for word in ['angry', 'mad', 'furious', 'outraged']):
                    sentiment_analysis["emotions"]["anger"] = 0.8
                if any(word in content_lower for word in ['sad', 'disappointed', 'upset', 'hurt']):
                    sentiment_analysis["emotions"]["sadness"] = 0.7
                if any(word in content_lower for word in ['happy', 'excited', 'thrilled', 'delighted']):
                    sentiment_analysis["emotions"]["joy"] = 0.8
                if any(word in content_lower for word in ['worried', 'concerned', 'anxious', 'nervous']):
                    sentiment_analysis["emotions"]["anxiety"] = 0.6
                
                # Extract keywords
                words = re.findall(r'\b\w+\b', content_lower)
                important_words = [word for word in words if len(word) > 3 and word not in ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were']]
                sentiment_analysis["keywords"] = important_words[:10]
                
                # Determine intent
                if any(word in content_lower for word in question_words):
                    sentiment_analysis["intent"] = "inquiry"
                elif any(word in content_lower for word in ['buy', 'purchase', 'order', 'price', 'cost']):
                    sentiment_analysis["intent"] = "purchase"
                elif any(word in content_lower for word in ['problem', 'issue', 'broken', 'not working', 'help']):
                    sentiment_analysis["intent"] = "support"
                elif any(word in content_lower for word in ['thank', 'thanks', 'appreciate', 'grateful']):
                    sentiment_analysis["intent"] = "appreciation"
                elif any(word in content_lower for word in ['complain', 'complaint', 'dissatisfied', 'refund']):
                    sentiment_analysis["intent"] = "complaint"
                else:
                    sentiment_analysis["intent"] = "general"
                
                # Determine urgency
                if any(word in content_lower for word in urgent_words):
                    sentiment_analysis["urgency"] = "high"
                    sentiment_analysis["requires_human_review"] = True
                elif sentiment_analysis["sentiment_label"] == "negative" and negative_count >= 2:
                    sentiment_analysis["urgency"] = "high"
                elif sentiment_analysis["intent"] in ["support", "complaint"]:
                    sentiment_analysis["urgency"] = "medium"
                else:
                    sentiment_analysis["urgency"] = "low"
                
                return json.dumps({
                    "sentiment_analysis": sentiment_analysis,
                    "analysis_complete": True,
                    "recommended_response_tone": self._get_recommended_tone(sentiment_analysis),
                    "priority_level": self._calculate_priority(sentiment_analysis),
                    "confidence": sentiment_analysis["confidence"]
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def generate_engagement_response(response_data: str) -> str:
            """Generate appropriate response to engagement content."""
            try:
                data = json.loads(response_data) if isinstance(response_data, str) else response_data
                
                engagement_content = data.get('engagement_content', '')
                response_tone = data.get('response_tone', 'friendly')
                brand_voice = data.get('brand_voice', 'professional')
                context = data.get('context', '')
                platform = data.get('platform', 'instagram')
                
                # Generate response based on content analysis
                response_generation = {
                    "original_content": engagement_content,
                    "generated_responses": [],
                    "recommended_response": "",
                    "tone": response_tone,
                    "brand_voice": brand_voice,
                    "platform": platform,
                    "confidence": 0.0,
                    "requires_approval": False,
                    "escalation_recommended": False
                }
                
                # Analyze the engagement content
                content_lower = engagement_content.lower()
                
                # Generate different response options
                if 'thank' in content_lower or 'appreciate' in content_lower:
                    # Appreciation response
                    responses = [
                        "Thank you so much for your kind words! We're thrilled to hear you're happy with our service. 😊",
                        "We really appreciate your feedback! It means the world to us. Thank you for being such a valued customer! 💙",
                        "Your support means everything to us! Thank you for taking the time to share your experience. 🙏"
                    ]
                    response_generation["confidence"] = 0.9
                
                elif any(word in content_lower for word in ['problem', 'issue', 'broken', 'not working']):
                    # Support response
                    responses = [
                        "I'm sorry to hear you're experiencing this issue. Let me help you resolve this right away. Could you please send us a DM with more details?",
                        "We apologize for the inconvenience! Our team is here to help. Please reach out to us directly so we can assist you promptly.",
                        "Thank you for bringing this to our attention. We'd love to help resolve this for you. Please contact our support team for immediate assistance."
                    ]
                    response_generation["confidence"] = 0.85
                    response_generation["requires_approval"] = True
                
                elif any(word in content_lower for word in ['love', 'amazing', 'great', 'awesome']):
                    # Positive feedback response
                    responses = [
                        "We're so happy to hear you love it! Thank you for sharing your experience with us! ✨",
                        "This absolutely made our day! Thank you for being such an amazing customer! 🌟",
                        "Your enthusiasm is contagious! We're thrilled you're having such a great experience! 🎉"
                    ]
                    response_generation["confidence"] = 0.88
                
                elif any(word in content_lower for word in ['disappointed', 'frustrated', 'angry', 'upset']):
                    # Negative feedback response
                    responses = [
                        "We sincerely apologize for falling short of your expectations. Your feedback is important to us, and we'd like to make this right. Please DM us so we can discuss this further.",
                        "I'm truly sorry to hear about your disappointing experience. We take all feedback seriously and would appreciate the opportunity to resolve this. Please reach out to us directly.",
                        "We understand your frustration and want to help. Your experience doesn't reflect our standards, and we'd like to work with you to improve. Please contact us privately."
                    ]
                    response_generation["confidence"] = 0.8
                    response_generation["requires_approval"] = True
                    response_generation["escalation_recommended"] = True
                
                elif any(word in content_lower for word in ['how', 'what', 'when', 'where', 'can you']):
                    # Question response
                    responses = [
                        "Great question! We'd be happy to help you with that. For the most accurate information, please check our website or send us a DM!",
                        "Thanks for asking! We have detailed information about this on our website, or feel free to reach out to our team directly for personalized assistance.",
                        "We'd love to help answer that for you! Please visit our FAQ section or contact our support team for detailed information."
                    ]
                    response_generation["confidence"] = 0.75
                
                else:
                    # General engagement response
                    responses = [
                        "Thank you for engaging with us! We appreciate your interest and support! 💙",
                        "We love hearing from our community! Thank you for being part of our journey! ✨",
                        "Your engagement means so much to us! Thank you for being an amazing part of our community! 🙌"
                    ]
                    response_generation["confidence"] = 0.7
                
                # Adapt responses for platform
                if platform == 'twitter':
                    # Shorter responses for Twitter
                    responses = [r[:240] + "..." if len(r) > 240 else r for r in responses]
                elif platform == 'linkedin':
                    # More professional tone for LinkedIn
                    responses = [r.replace('😊', '').replace('💙', '').replace('✨', '').replace('🌟', '').replace('🎉', '').replace('🙏', '').replace('🙌', '') for r in responses]
                
                response_generation["generated_responses"] = responses
                response_generation["recommended_response"] = responses[0] if responses else "Thank you for your message!"
                
                # Add platform-specific elements
                if platform == 'instagram' and not any(word in content_lower for word in ['problem', 'issue', 'disappointed']):
                    # Add relevant hashtags for positive Instagram responses
                    hashtags = " #CustomerLove #Community #ThankYou"
                    response_generation["recommended_response"] += hashtags
                
                return json.dumps({
                    "response_generation": response_generation,
                    "generation_complete": True,
                    "ready_to_send": not response_generation["requires_approval"],
                    "next_steps": ["Review response", "Send response", "Monitor engagement"] if not response_generation["requires_approval"] else ["Human review required", "Approve response", "Send response"],
                    "confidence": response_generation["confidence"]
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def manage_community_moderation(moderation_data: str) -> str:
            """Handle community moderation and content filtering."""
            try:
                data = json.loads(moderation_data) if isinstance(moderation_data, str) else moderation_data
                
                content = data.get('content', '')
                platform = data.get('platform', 'instagram')
                author_info = data.get('author_info', {})
                community_guidelines = data.get('guidelines', {})
                
                moderation_result = {
                    "content": content,
                    "platform": platform,
                    "moderation_status": "approved",
                    "violations": [],
                    "severity": "none",
                    "action_required": "none",
                    "recommended_actions": [],
                    "confidence": 0.0
                }
                
                content_lower = content.lower()
                
                # Check for various types of violations
                violations_found = []
                
                # Spam detection
                spam_indicators = ['buy now', 'click here', 'limited time', 'act fast', 'guaranteed', 'make money fast']
                if any(indicator in content_lower for indicator in spam_indicators):
                    violations_found.append({
                        "type": "spam",
                        "severity": "medium",
                        "description": "Content contains spam indicators"
                    })
                
                # Inappropriate language
                inappropriate_words = ['hate', 'stupid', 'idiot', 'scam', 'fake', 'terrible']  # Simplified list
                inappropriate_count = sum(1 for word in inappropriate_words if word in content_lower)
                if inappropriate_count >= 2:
                    violations_found.append({
                        "type": "inappropriate_language",
                        "severity": "medium",
                        "description": "Content contains inappropriate language"
                    })
                
                # Self-promotion detection
                promo_indicators = ['check out my', 'visit my website', 'follow me', 'my business', 'dm me']
                if any(indicator in content_lower for indicator in promo_indicators):
                    violations_found.append({
                        "type": "self_promotion",
                        "severity": "low",
                        "description": "Content appears to be self-promotional"
                    })
                
                # Off-topic content
                if len(content.split()) > 50 and not any(keyword in content_lower for keyword in ['product', 'service', 'brand', 'company']):
                    violations_found.append({
                        "type": "off_topic",
                        "severity": "low",
                        "description": "Content may be off-topic"
                    })
                
                # Determine overall status and actions
                if violations_found:
                    high_severity = any(v["severity"] == "high" for v in violations_found)
                    medium_severity = any(v["severity"] == "medium" for v in violations_found)
                    
                    if high_severity:
                        moderation_result["moderation_status"] = "rejected"
                        moderation_result["severity"] = "high"
                        moderation_result["action_required"] = "remove_content"
                        moderation_result["recommended_actions"] = [
                            "Remove content immediately",
                            "Send warning to user",
                            "Document violation",
                            "Consider account restrictions"
                        ]
                    elif medium_severity:
                        moderation_result["moderation_status"] = "flagged"
                        moderation_result["severity"] = "medium"
                        moderation_result["action_required"] = "human_review"
                        moderation_result["recommended_actions"] = [
                            "Flag for human review",
                            "Temporarily hide content",
                            "Request content modification",
                            "Send educational message"
                        ]
                    else:
                        moderation_result["moderation_status"] = "warning"
                        moderation_result["severity"] = "low"
                        moderation_result["action_required"] = "warn_user"
                        moderation_result["recommended_actions"] = [
                            "Send friendly reminder about guidelines",
                            "Monitor future posts from user",
                            "Provide community guidelines link"
                        ]
                    
                    moderation_result["violations"] = violations_found
                    moderation_result["confidence"] = 0.8
                else:
                    moderation_result["moderation_status"] = "approved"
                    moderation_result["confidence"] = 0.9
                
                # Generate response message if action is needed
                response_message = ""
                if moderation_result["action_required"] == "warn_user":
                    response_message = "Hi! Thanks for engaging with our community. Just a friendly reminder to keep comments relevant and respectful. Check out our community guidelines for more info! 😊"
                elif moderation_result["action_required"] == "human_review":
                    response_message = "Thank you for your comment. We're reviewing it to ensure it meets our community guidelines."
                
                moderation_result["response_message"] = response_message
                
                return json.dumps({
                    "moderation_result": moderation_result,
                    "moderation_complete": True,
                    "immediate_action_required": moderation_result["severity"] in ["high", "medium"],
                    "human_review_needed": moderation_result["action_required"] == "human_review",
                    "confidence": moderation_result["confidence"]
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def handle_crisis_management(crisis_data: str) -> str:
            """Handle crisis situations and negative feedback escalation."""
            try:
                data = json.loads(crisis_data) if isinstance(crisis_data, str) else crisis_data
                
                crisis_type = data.get('crisis_type', 'negative_feedback')
                severity = data.get('severity', 'medium')
                platform = data.get('platform', 'instagram')
                content = data.get('content', '')
                reach = data.get('estimated_reach', 1000)
                
                crisis_response = {
                    "crisis_type": crisis_type,
                    "severity": severity,
                    "platform": platform,
                    "estimated_impact": "medium",
                    "immediate_actions": [],
                    "response_strategy": {},
                    "escalation_plan": {},
                    "monitoring_plan": {},
                    "timeline": {},
                    "stakeholders_to_notify": [],
                    "confidence": 0.0
                }
                
                # Determine crisis severity and impact
                if reach > 10000 or severity == "high":
                    crisis_response["estimated_impact"] = "high"
                elif reach > 5000 or severity == "medium":
                    crisis_response["estimated_impact"] = "medium"
                else:
                    crisis_response["estimated_impact"] = "low"
                
                # Define immediate actions based on crisis type
                if crisis_type == "product_safety":
                    crisis_response["immediate_actions"] = [
                        "Acknowledge the concern immediately",
                        "Escalate to product safety team",
                        "Prepare holding statement",
                        "Monitor for similar reports",
                        "Coordinate with legal team"
                    ]
                    crisis_response["stakeholders_to_notify"] = ["Product Team", "Legal", "PR", "Customer Service", "Executive Team"]
                
                elif crisis_type == "service_outage":
                    crisis_response["immediate_actions"] = [
                        "Acknowledge the issue publicly",
                        "Provide regular updates",
                        "Coordinate with technical team",
                        "Set up status page",
                        "Prepare compensation plan"
                    ]
                    crisis_response["stakeholders_to_notify"] = ["Technical Team", "Customer Service", "PR", "Operations"]
                
                elif crisis_type == "negative_viral_content":
                    crisis_response["immediate_actions"] = [
                        "Assess the situation quickly",
                        "Prepare response strategy",
                        "Monitor spread and sentiment",
                        "Coordinate response across platforms",
                        "Engage with key influencers"
                    ]
                    crisis_response["stakeholders_to_notify"] = ["PR Team", "Social Media Manager", "Executive Team", "Legal"]
                
                elif crisis_type == "customer_complaint":
                    crisis_response["immediate_actions"] = [
                        "Respond with empathy and concern",
                        "Take conversation private",
                        "Investigate the issue thoroughly",
                        "Provide regular updates",
                        "Follow up on resolution"
                    ]
                    crisis_response["stakeholders_to_notify"] = ["Customer Service", "Account Manager", "Quality Team"]
                
                else:  # General crisis
                    crisis_response["immediate_actions"] = [
                        "Assess situation severity",
                        "Prepare initial response",
                        "Monitor social mentions",
                        "Coordinate team response",
                        "Document all interactions"
                    ]
                    crisis_response["stakeholders_to_notify"] = ["Social Media Manager", "PR Team", "Customer Service"]
                
                # Response strategy
                crisis_response["response_strategy"] = {
                    "tone": "empathetic and professional",
                    "key_messages": [
                        "We take this matter seriously",
                        "We are investigating thoroughly",
                        "Customer safety/satisfaction is our priority",
                        "We will provide updates as available"
                    ],
                    "channels": [platform, "company_website", "email"],
                    "frequency": "Every 2-4 hours until resolved"
                }
                
                # Escalation plan
                if crisis_response["estimated_impact"] == "high":
                    crisis_response["escalation_plan"] = {
                        "level_1": "Social Media Manager (immediate)",
                        "level_2": "PR Director (within 1 hour)",
                        "level_3": "Executive Team (within 2 hours)",
                        "level_4": "CEO/Legal (if needed)",
                        "external_support": "Crisis PR agency (if available)"
                    }
                else:
                    crisis_response["escalation_plan"] = {
                        "level_1": "Social Media Manager (immediate)",
                        "level_2": "Customer Service Manager (within 2 hours)",
                        "level_3": "PR Team (if situation worsens)"
                    }
                
                # Monitoring plan
                crisis_response["monitoring_plan"] = {
                    "keywords_to_track": [
                        "brand_name",
                        "product_name",
                        "crisis_related_terms"
                    ],
                    "platforms_to_monitor": ["twitter", "facebook", "instagram", "linkedin", "reddit", "news_sites"],
                    "monitoring_frequency": "Every 30 minutes",
                    "sentiment_tracking": True,
                    "influencer_monitoring": True
                }
                
                # Timeline
                crisis_response["timeline"] = {
                    "0-15_minutes": "Initial assessment and acknowledgment",
                    "15-60_minutes": "Detailed response and stakeholder notification",
                    "1-4_hours": "Regular updates and progress reports",
                    "4-24_hours": "Resolution efforts and follow-up",
                    "24-48_hours": "Post-crisis analysis and prevention measures"
                }
                
                # Generate initial response template
                if crisis_type == "customer_complaint":
                    initial_response = f"We sincerely apologize for your experience and take your concerns very seriously. We'd like to resolve this matter promptly. Please send us a direct message so we can discuss this privately and work toward a solution."
                elif crisis_type == "product_safety":
                    initial_response = f"Thank you for bringing this to our attention. Customer safety is our top priority, and we are investigating this matter immediately. We will provide updates as soon as we have more information."
                elif crisis_type == "service_outage":
                    initial_response = f"We're aware of the service issues and our technical team is working to resolve them as quickly as possible. We'll provide regular updates on our progress. Thank you for your patience."
                else:
                    initial_response = f"We appreciate you bringing this to our attention. We're looking into this matter and will respond with more information shortly."
                
                crisis_response["initial_response_template"] = initial_response
                crisis_response["confidence"] = 0.85
                
                return json.dumps({
                    "crisis_response": crisis_response,
                    "crisis_plan_ready": True,
                    "immediate_action_required": True,
                    "estimated_resolution_time": "2-24 hours depending on complexity",
                    "confidence": crisis_response["confidence"]
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def analyze_community_insights(insights_data: str) -> str:
            """Analyze community engagement patterns and generate insights."""
            try:
                data = json.loads(insights_data) if isinstance(insights_data, str) else insights_data
                
                time_period = data.get('time_period', '30_days')
                platforms = data.get('platforms', ['instagram'])
                engagement_types = data.get('engagement_types', ['comments', 'mentions'])
                
                community_analysis = {
                    "analysis_period": time_period,
                    "platforms_analyzed": platforms,
                    "total_engagements": 0,
                    "engagement_breakdown": {},
                    "sentiment_distribution": {},
                    "top_topics": [],
                    "community_health_score": 0.0,
                    "key_insights": [],
                    "recommendations": [],
                    "trends": []
                }
                
                # Simulate engagement data analysis
                total_engagements = 2450
                community_analysis["total_engagements"] = total_engagements
                
                # Engagement breakdown
                community_analysis["engagement_breakdown"] = {
                    "comments": {"count": 1200, "percentage": 49},
                    "mentions": {"count": 680, "percentage": 28},
                    "direct_messages": {"count": 320, "percentage": 13},
                    "reviews": {"count": 180, "percentage": 7},
                    "shares_with_comments": {"count": 70, "percentage": 3}
                }
                
                # Sentiment distribution
                community_analysis["sentiment_distribution"] = {
                    "positive": {"count": 1470, "percentage": 60},
                    "neutral": {"count": 735, "percentage": 30},
                    "negative": {"count": 245, "percentage": 10}
                }
                
                # Top topics discussed
                community_analysis["top_topics"] = [
                    {"topic": "Product Quality", "mentions": 450, "sentiment": "positive"},
                    {"topic": "Customer Service", "mentions": 320, "sentiment": "positive"},
                    {"topic": "Shipping/Delivery", "mentions": 280, "sentiment": "mixed"},
                    {"topic": "Pricing", "mentions": 220, "sentiment": "neutral"},
                    {"topic": "New Features", "mentions": 180, "sentiment": "positive"},
                    {"topic": "User Experience", "mentions": 150, "sentiment": "positive"},
                    {"topic": "Technical Issues", "mentions": 120, "sentiment": "negative"},
                    {"topic": "Competitor Comparison", "mentions": 90, "sentiment": "neutral"}
                ]
                
                # Calculate community health score
                positive_ratio = community_analysis["sentiment_distribution"]["positive"]["percentage"] / 100
                negative_ratio = community_analysis["sentiment_distribution"]["negative"]["percentage"] / 100
                engagement_growth = 0.15  # 15% growth assumed
                response_rate = 0.85  # 85% response rate
                
                health_score = (positive_ratio * 0.4) + ((1 - negative_ratio) * 0.3) + (engagement_growth * 0.2) + (response_rate * 0.1)
                community_analysis["community_health_score"] = round(health_score * 10, 1)  # Scale to 10
                
                # Generate key insights
                community_analysis["key_insights"] = [
                    {
                        "insight": "Strong positive sentiment around product quality",
                        "description": "60% of engagements are positive, with product quality being the most discussed positive topic",
                        "impact": "High",
                        "confidence": 0.92
                    },
                    {
                        "insight": "Shipping concerns need attention",
                        "description": "Shipping/delivery topics show mixed sentiment, indicating room for improvement",
                        "impact": "Medium",
                        "confidence": 0.78
                    },
                    {
                        "insight": "High engagement with customer service responses",
                        "description": "Customer service interactions generate 40% more follow-up engagement than average",
                        "impact": "High",
                        "confidence": 0.85
                    },
                    {
                        "insight": "Technical issues require faster resolution",
                        "description": "Technical issue complaints have 25% higher negative sentiment when not resolved within 4 hours",
                        "impact": "Medium",
                        "confidence": 0.81
                    }
                ]
                
                # Generate recommendations
                community_analysis["recommendations"] = [
                    {
                        "category": "Response Strategy",
                        "recommendation": "Maintain current positive engagement approach for product quality discussions",
                        "priority": "Medium",
                        "effort": "Low"
                    },
                    {
                        "category": "Issue Resolution",
                        "recommendation": "Implement faster response protocol for technical issues (target: 2 hours)",
                        "priority": "High",
                        "effort": "Medium"
                    },
                    {
                        "category": "Proactive Communication",
                        "recommendation": "Create proactive content addressing common shipping questions",
                        "priority": "Medium",
                        "effort": "Medium"
                    },
                    {
                        "category": "Community Building",
                        "recommendation": "Leverage positive customer service interactions to build community advocacy",
                        "priority": "High",
                        "effort": "Low"
                    }
                ]
                
                # Identify trends
                community_analysis["trends"] = [
                    "Increasing engagement with behind-the-scenes content (+25% over last month)",
                    "Growing interest in sustainability topics (+40% mentions)",
                    "Rising questions about new product features (+30% inquiries)",
                    "Improved sentiment around customer service (+15% positive mentions)",
                    "Seasonal increase in shipping-related discussions (+20% during holidays)"
                ]
                
                return json.dumps({
                    "community_insights": community_analysis,
                    "analysis_complete": True,
                    "health_status": "Good" if community_analysis["community_health_score"] >= 7.0 else "Needs Attention",
                    "priority_actions": len([r for r in community_analysis["recommendations"] if r["priority"] == "High"]),
                    "confidence": 0.87
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def generate_proactive_engagement(engagement_data: str) -> str:
            """Generate proactive engagement opportunities and content."""
            try:
                data = json.loads(engagement_data) if isinstance(engagement_data, str) else engagement_data
                
                platform = data.get('platform', 'instagram')
                audience_segment = data.get('audience_segment', 'general')
                engagement_goal = data.get('goal', 'community_building')
                current_trends = data.get('trends', [])
                
                proactive_engagement = {
                    "platform": platform,
                    "audience_segment": audience_segment,
                    "engagement_goal": engagement_goal,
                    "engagement_opportunities": [],
                    "content_suggestions": [],
                    "timing_recommendations": {},
                    "success_metrics": [],
                    "implementation_plan": {}
                }
                
                # Generate engagement opportunities based on goal
                if engagement_goal == "community_building":
                    opportunities = [
                        {
                            "type": "user_generated_content",
                            "description": "Feature customer success stories and testimonials",
                            "engagement_potential": "High",
                            "effort_required": "Medium",
                            "example": "Share customer transformation photos with their permission"
                        },
                        {
                            "type": "behind_the_scenes",
                            "description": "Show company culture and team members",
                            "engagement_potential": "High",
                            "effort_required": "Low",
                            "example": "Team member spotlight posts or office tour videos"
                        },
                        {
                            "type": "community_challenges",
                            "description": "Create engaging challenges for community participation",
                            "engagement_potential": "Very High",
                            "effort_required": "Medium",
                            "example": "30-day challenge related to your product/service"
                        },
                        {
                            "type": "educational_content",
                            "description": "Share valuable tips and insights",
                            "engagement_potential": "Medium",
                            "effort_required": "Medium",
                            "example": "Weekly tips series or how-to tutorials"
                        }
                    ]
                
                elif engagement_goal == "brand_awareness":
                    opportunities = [
                        {
                            "type": "trending_topics",
                            "description": "Participate in relevant trending conversations",
                            "engagement_potential": "High",
                            "effort_required": "Low",
                            "example": "Comment thoughtfully on industry trend discussions"
                        },
                        {
                            "type": "influencer_collaboration",
                            "description": "Engage with micro-influencers in your niche",
                            "engagement_potential": "Very High",
                            "effort_required": "High",
                            "example": "Partner with relevant influencers for authentic content"
                        },
                        {
                            "type": "industry_events",
                            "description": "Engage around industry events and conferences",
                            "engagement_potential": "Medium",
                            "effort_required": "Low",
                            "example": "Live-tweet or post about industry events you're attending"
                        }
                    ]
                
                elif engagement_goal == "customer_support":
                    opportunities = [
                        {
                            "type": "proactive_help",
                            "description": "Reach out to customers who might need assistance",
                            "engagement_potential": "High",
                            "effort_required": "Medium",
                            "example": "Check in with customers after purchase or service"
                        },
                        {
                            "type": "faq_content",
                            "description": "Create content addressing common questions",
                            "engagement_potential": "Medium",
                            "effort_required": "Medium",
                            "example": "Video series answering frequently asked questions"
                        },
                        {
                            "type": "tutorial_content",
                            "description": "Create helpful tutorial and guide content",
                            "engagement_potential": "High",
                            "effort_required": "High",
                            "example": "Step-by-step guides for product usage"
                        }
                    ]
                
                proactive_engagement["engagement_opportunities"] = opportunities
                
                # Generate content suggestions
                content_suggestions = []
                
                if platform == 'instagram':
                    content_suggestions = [
                        {
                            "content_type": "story_polls",
                            "description": "Use Instagram Stories polls to gather community input",
                            "example": "Poll: Which feature would you like to see next?",
                            "engagement_boost": "+40%"
                        },
                        {
                            "content_type": "carousel_tips",
                            "description": "Create educational carousel posts with actionable tips",
                            "example": "5 ways to maximize your results with our product",
                            "engagement_boost": "+60%"
                        },
                        {
                            "content_type": "user_spotlights",
                            "description": "Feature community members and their achievements",
                            "example": "Customer spotlight: How Sarah achieved her goals",
                            "engagement_boost": "+80%"
                        }
                    ]
                
                elif platform == 'twitter':
                    content_suggestions = [
                        {
                            "content_type": "twitter_threads",
                            "description": "Create informative threads about industry topics",
                            "example": "Thread: 10 industry trends to watch this year",
                            "engagement_boost": "+50%"
                        },
                        {
                            "content_type": "live_tweeting",
                            "description": "Live tweet from events or behind-the-scenes moments",
                            "example": "Live tweeting from industry conference",
                            "engagement_boost": "+35%"
                        },
                        {
                            "content_type": "twitter_chats",
                            "description": "Participate in or host Twitter chats",
                            "example": "Join #IndustryChat every Wednesday at 2 PM",
                            "engagement_boost": "+70%"
                        }
                    ]
                
                elif platform == 'linkedin':
                    content_suggestions = [
                        {
                            "content_type": "thought_leadership",
                            "description": "Share industry insights and professional perspectives",
                            "example": "The future of our industry: 3 key predictions",
                            "engagement_boost": "+45%"
                        },
                        {
                            "content_type": "company_updates",
                            "description": "Share meaningful company news and milestones",
                            "example": "Celebrating our team's achievements this quarter",
                            "engagement_boost": "+30%"
                        },
                        {
                            "content_type": "professional_tips",
                            "description": "Provide valuable professional development content",
                            "example": "5 skills every professional should develop",
                            "engagement_boost": "+55%"
                        }
                    ]
                
                proactive_engagement["content_suggestions"] = content_suggestions
                
                # Timing recommendations
                proactive_engagement["timing_recommendations"] = {
                    "optimal_posting_times": ["9:00 AM", "1:00 PM", "7:00 PM"],
                    "engagement_windows": ["First 2 hours after posting", "Evening engagement surge"],
                    "response_timing": "Within 2-4 hours for maximum impact",
                    "follow_up_timing": "24-48 hours for continued engagement"
                }
                
                # Success metrics
                proactive_engagement["success_metrics"] = [
                    "Engagement rate increase (+20% target)",
                    "Community growth (+15% monthly target)",
                    "Response rate to proactive outreach (+30% target)",
                    "Brand mention sentiment improvement (+10% target)",
                    "User-generated content increase (+25% target)"
                ]
                
                # Implementation plan
                proactive_engagement["implementation_plan"] = {
                    "week_1": [
                        "Set up content calendar for proactive posts",
                        "Identify top community members for engagement",
                        "Create initial batch of educational content"
                    ],
                    "week_2": [
                        "Launch first community challenge",
                        "Begin regular user spotlight features",
                        "Implement proactive customer outreach"
                    ],
                    "week_3": [
                        "Analyze initial results and adjust strategy",
                        "Expand successful content types",
                        "Increase engagement frequency"
                    ],
                    "week_4": [
                        "Full implementation of proactive strategy",
                        "Measure and report on success metrics",
                        "Plan next month's engagement initiatives"
                    ]
                }
                
                return json.dumps({
                    "proactive_engagement": proactive_engagement,
                    "total_opportunities": len(opportunities),
                    "high_impact_opportunities": len([o for o in opportunities if o["engagement_potential"] in ["High", "Very High"]]),
                    "implementation_ready": True,
                    "expected_engagement_increase": "25-40% within 30 days",
                    "confidence": 0.83
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        return [
            analyze_engagement_sentiment,
            generate_engagement_response,
            manage_community_moderation,
            handle_crisis_management,
            analyze_community_insights,
            generate_proactive_engagement
        ]
    
    def _get_recommended_tone(self, sentiment_analysis: Dict[str, Any]) -> str:
        """Get recommended response tone based on sentiment analysis."""
        sentiment = sentiment_analysis.get("sentiment_label", "neutral")
        intent = sentiment_analysis.get("intent", "general")
        urgency = sentiment_analysis.get("urgency", "low")
        
        if sentiment == "negative" or intent == "complaint":
            return "empathetic_professional"
        elif sentiment == "positive" or intent == "appreciation":
            return "enthusiastic_grateful"
        elif intent == "support" or urgency == "high":
            return "helpful_professional"
        elif intent == "inquiry":
            return "informative_friendly"
        else:
            return "friendly_professional"
    
    def _calculate_priority(self, sentiment_analysis: Dict[str, Any]) -> str:
        """Calculate priority level based on sentiment analysis."""
        sentiment = sentiment_analysis.get("sentiment_label", "neutral")
        urgency = sentiment_analysis.get("urgency", "low")
        intent = sentiment_analysis.get("intent", "general")
        
        if urgency == "high" or sentiment == "negative" and intent == "complaint":
            return "urgent"
        elif sentiment == "negative" or intent in ["support", "complaint"]:
            return "high"
        elif intent == "inquiry" or sentiment == "positive":
            return "medium"
        else:
            return "low"
    
    async def _process_task(self, task: AgentTask) -> Any:
        """Process Engagement Agent specific tasks."""
        task_type = task.type
        input_data = task.input_data
        
        try:
            if task_type == "analyze_sentiment":
                return await self._analyze_engagement_sentiment(input_data)
            elif task_type == "generate_response":
                return await self._generate_engagement_response(input_data)
            elif task_type == "moderate_content":
                return await self._moderate_community_content(input_data)
            elif task_type == "handle_crisis":
                return await self._handle_crisis_situation(input_data)
            elif task_type == "analyze_community":
                return await self._analyze_community_insights(input_data)
            elif task_type == "proactive_engagement":
                return await self._generate_proactive_engagement(input_data)
            elif task_type == "escalate_issue":
                return await self._escalate_engagement_issue(input_data)
            else:
                # Use the agent executor for general engagement tasks
                result = await self.agent_executor.ainvoke({
                    "input": f"Handle engagement task: {json.dumps(input_data)}"
                })
                return result["output"]
                
        except Exception as e:
            self.logger.error(f"Error processing task {task_type}: {str(e)}")
            raise
    
    async def _analyze_engagement_sentiment(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment of engagement content."""
        content = input_data.get('content', '')
        platform = input_data.get('platform', 'instagram')
        
        sentiment_prompt = f"""
        Analyze the sentiment and context of this engagement:
        
        Platform: {platform}
        Content: "{content}"
        
        Provide detailed sentiment analysis including:
        1. Overall sentiment (positive, negative, neutral)
        2. Emotional tone and intensity
        3. Intent behind the message
        4. Urgency level
        5. Recommended response approach
        6. Any escalation requirements
        """
        
        result = await self.agent_executor.ainvoke({"input": sentiment_prompt})
        
        # Store sentiment analysis
        await self._store_engagement_analysis(content, result["output"], platform)
        
        return {"analysis": result["output"], "confidence": 0.85}
    
    async def _store_engagement_analysis(self, content: str, analysis: str, platform: str):
        """Store engagement analysis in memory."""
        try:
            analysis_content = f"Engagement Analysis\nPlatform: {platform}\nContent: {content}\nAnalysis: {analysis}"
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                analysis_content,
                "engagement_analysis",
                "engagement",
                "engagement_agent",
                0.8,
                {
                    "platform": platform,
                    "content_length": len(content),
                    "analysis_type": "sentiment_analysis"
                }
            )
            
            log_agent_activity(
                self.agent_type.value,
                f"Analyzed engagement on {platform}",
                self.organization_id,
                platform=platform,
                content_length=len(content)
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store engagement analysis: {str(e)}")
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score for Engagement Agent results."""
        if isinstance(result, dict):
            return result.get('confidence', 0.8)
        elif isinstance(result, str):
            # For text responses, confidence based on length and completeness
            if len(result) > 50:
                return 0.85
            else:
                return 0.7
        else:
            return 0.75

