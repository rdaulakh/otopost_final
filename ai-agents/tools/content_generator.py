"""
Content Generation Tools for AI Agents
Provides various tools for generating and optimizing social media content
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

class ContentGenerator:
    """Tool for generating various types of social media content"""
    
    def __init__(self):
        self.content_templates = {
            'instagram': {
                'post': {
                    'structure': '{hook}\n\n{content}\n\n{hashtags}\n\n{cta}',
                    'max_length': 2200,
                    'hashtag_count': 30
                },
                'story': {
                    'structure': '{content}',
                    'max_length': 100,
                    'hashtag_count': 0
                },
                'reel': {
                    'structure': '{hook}\n\n{content}\n\n{hashtags}',
                    'max_length': 2200,
                    'hashtag_count': 30
                }
            },
            'facebook': {
                'post': {
                    'structure': '{content}\n\n{cta}',
                    'max_length': 63206,
                    'hashtag_count': 5
                },
                'story': {
                    'structure': '{content}',
                    'max_length': 500,
                    'hashtag_count': 0
                }
            },
            'twitter': {
                'tweet': {
                    'structure': '{content} {hashtags}',
                    'max_length': 280,
                    'hashtag_count': 3
                },
                'thread': {
                    'structure': '{content}\n\n{hashtags}',
                    'max_length': 280,
                    'hashtag_count': 3
                }
            },
            'linkedin': {
                'post': {
                    'structure': '{hook}\n\n{content}\n\n{cta}',
                    'max_length': 3000,
                    'hashtag_count': 5
                },
                'article': {
                    'structure': '{title}\n\n{content}\n\n{cta}',
                    'max_length': 125000,
                    'hashtag_count': 5
                }
            },
            'tiktok': {
                'video': {
                    'structure': '{content} {hashtags}',
                    'max_length': 2200,
                    'hashtag_count': 20
                }
            },
            'youtube': {
                'short': {
                    'structure': '{content} {hashtags}',
                    'max_length': 5000,
                    'hashtag_count': 15
                },
                'description': {
                    'structure': '{content}\n\n{hashtags}\n\n{cta}',
                    'max_length': 5000,
                    'hashtag_count': 15
                }
            }
        }
        
        self.hook_templates = [
            "Did you know that {topic}?",
            "Here's something that will {benefit}:",
            "The secret to {topic} is...",
            "Why {topic} matters more than you think:",
            "I discovered something amazing about {topic}:",
            "The truth about {topic} that nobody talks about:",
            "Want to know the {topic} hack?",
            "This {topic} tip changed everything:",
            "The {topic} mistake everyone makes:",
            "How to {action} like a pro:"
        ]
        
        self.cta_templates = [
            "What do you think? Let me know in the comments!",
            "Share your thoughts below!",
            "Tag someone who needs to see this!",
            "Save this post for later!",
            "Follow for more {topic} tips!",
            "Double tap if you agree!",
            "Share this with your network!",
            "What's your experience with {topic}?",
            "Comment your favorite {topic}!",
            "Follow for daily {topic} content!"
        ]

    async def generate_content(self, 
                             topic: str,
                             platform: str,
                             content_type: str = 'post',
                             tone: str = 'engaging',
                             length: str = 'medium',
                             target_audience: str = 'general',
                             include_hashtags: bool = True,
                             include_cta: bool = True,
                             custom_instructions: str = None) -> Dict[str, Any]:
        """
        Generate content for a specific platform and type
        
        Args:
            topic: The main topic or subject
            platform: Social media platform (instagram, facebook, twitter, etc.)
            content_type: Type of content (post, story, tweet, etc.)
            tone: Content tone (engaging, professional, casual, etc.)
            length: Content length (short, medium, long)
            target_audience: Target audience description
            include_hashtags: Whether to include hashtags
            include_cta: Whether to include call-to-action
            custom_instructions: Additional custom instructions
            
        Returns:
            Dict containing generated content and metadata
        """
        try:
            # Get platform-specific template
            template = self.content_templates.get(platform, {}).get(content_type)
            if not template:
                raise ValueError(f"Unsupported platform/content type: {platform}/{content_type}")
            
            # Generate content components
            hook = await self._generate_hook(topic, tone, target_audience)
            content = await self._generate_main_content(topic, tone, length, target_audience, custom_instructions)
            hashtags = await self._generate_hashtags(topic, platform, template['hashtag_count']) if include_hashtags else ""
            cta = await self._generate_cta(topic, tone) if include_cta else ""
            
            # Format content according to template
            formatted_content = template['structure'].format(
                hook=hook,
                content=content,
                hashtags=hashtags,
                cta=cta,
                title=content[:50] + "..." if len(content) > 50 else content
            )
            
            # Validate length
            if len(formatted_content) > template['max_length']:
                formatted_content = self._truncate_content(formatted_content, template['max_length'])
            
            return {
                'success': True,
                'content': formatted_content,
                'metadata': {
                    'platform': platform,
                    'content_type': content_type,
                    'tone': tone,
                    'length': length,
                    'target_audience': target_audience,
                    'word_count': len(formatted_content.split()),
                    'character_count': len(formatted_content),
                    'hashtag_count': len(hashtags.split('#')[1:]) if hashtags else 0,
                    'generated_at': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'content': None
            }

    async def generate_content_variations(self, 
                                        topic: str,
                                        platform: str,
                                        content_type: str = 'post',
                                        count: int = 3,
                                        **kwargs) -> Dict[str, Any]:
        """
        Generate multiple variations of content for A/B testing
        
        Args:
            topic: The main topic or subject
            platform: Social media platform
            content_type: Type of content
            count: Number of variations to generate
            **kwargs: Additional parameters for content generation
            
        Returns:
            Dict containing multiple content variations
        """
        try:
            variations = []
            tones = ['engaging', 'professional', 'casual', 'witty', 'inspiring']
            
            for i in range(count):
                tone = random.choice(tones)
                variation = await self.generate_content(
                    topic=topic,
                    platform=platform,
                    content_type=content_type,
                    tone=tone,
                    **kwargs
                )
                
                if variation['success']:
                    variations.append({
                        'id': f"variation_{i+1}",
                        'tone': tone,
                        'content': variation['content'],
                        'metadata': variation['metadata']
                    })
            
            return {
                'success': True,
                'variations': variations,
                'count': len(variations)
            }
            
        except Exception as e:
            logger.error(f"Error generating content variations: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'variations': []
            }

    async def generate_content_calendar(self, 
                                      topics: List[str],
                                      platforms: List[str],
                                      start_date: datetime,
                                      duration_days: int = 30) -> Dict[str, Any]:
        """
        Generate a content calendar with scheduled posts
        
        Args:
            topics: List of topics to create content for
            platforms: List of platforms to post on
            start_date: Start date for the calendar
            duration_days: Number of days to plan for
            
        Returns:
            Dict containing content calendar
        """
        try:
            calendar = []
            current_date = start_date
            
            for day in range(duration_days):
                # Select random topic and platform for each day
                topic = random.choice(topics)
                platform = random.choice(platforms)
                
                # Generate content for the day
                content = await self.generate_content(
                    topic=topic,
                    platform=platform,
                    content_type='post'
                )
                
                if content['success']:
                    calendar.append({
                        'date': current_date.strftime('%Y-%m-%d'),
                        'topic': topic,
                        'platform': platform,
                        'content': content['content'],
                        'metadata': content['metadata']
                    })
                
                current_date += timedelta(days=1)
            
            return {
                'success': True,
                'calendar': calendar,
                'duration_days': duration_days,
                'platforms': platforms,
                'topics': topics
            }
            
        except Exception as e:
            logger.error(f"Error generating content calendar: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'calendar': []
            }

    async def optimize_content(self, 
                             content: str,
                             platform: str,
                             target_metrics: List[str] = None) -> Dict[str, Any]:
        """
        Optimize existing content for better performance
        
        Args:
            content: Original content to optimize
            platform: Target platform
            target_metrics: List of metrics to optimize for
            
        Returns:
            Dict containing optimized content and suggestions
        """
        try:
            if not target_metrics:
                target_metrics = ['engagement', 'reach', 'clicks']
            
            # Analyze current content
            analysis = await self._analyze_content(content, platform)
            
            # Generate optimizations
            optimizations = []
            
            if 'engagement' in target_metrics:
                optimizations.append(await self._optimize_for_engagement(content, platform))
            
            if 'reach' in target_metrics:
                optimizations.append(await self._optimize_for_reach(content, platform))
            
            if 'clicks' in target_metrics:
                optimizations.append(await self._optimize_for_clicks(content, platform))
            
            # Generate optimized version
            optimized_content = await self._apply_optimizations(content, optimizations)
            
            return {
                'success': True,
                'original_content': content,
                'optimized_content': optimized_content,
                'analysis': analysis,
                'optimizations': optimizations,
                'improvement_score': self._calculate_improvement_score(content, optimized_content)
            }
            
        except Exception as e:
            logger.error(f"Error optimizing content: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'optimized_content': content
            }

    async def _generate_hook(self, topic: str, tone: str, target_audience: str) -> str:
        """Generate an engaging hook for the content"""
        hook_template = random.choice(self.hook_templates)
        return hook_template.format(topic=topic)

    async def _generate_main_content(self, topic: str, tone: str, length: str, target_audience: str, custom_instructions: str = None) -> str:
        """Generate the main content body"""
        # This would typically call an AI service
        # For now, return a placeholder
        length_multiplier = {'short': 0.5, 'medium': 1.0, 'long': 2.0}.get(length, 1.0)
        
        base_content = f"Let's dive into {topic}. This is something that {target_audience} should definitely know about. "
        
        if custom_instructions:
            base_content += f"Here's what you need to know: {custom_instructions} "
        
        # Add more content based on length
        if length_multiplier > 1.0:
            base_content += f"Here are some key insights about {topic} that will help you understand it better. "
            base_content += f"These tips and strategies have been proven to work for {target_audience}. "
        
        return base_content.strip()

    async def _generate_hashtags(self, topic: str, platform: str, max_count: int) -> str:
        """Generate relevant hashtags for the content"""
        # This would typically call an AI service or use a hashtag database
        base_hashtags = [
            f"#{topic.replace(' ', '')}",
            f"#{platform}",
            "#socialmedia",
            "#content",
            "#marketing"
        ]
        
        # Add more hashtags based on topic
        topic_hashtags = [
            "#tips",
            "#strategy",
            "#growth",
            "#business",
            "#success"
        ]
        
        all_hashtags = base_hashtags + topic_hashtags
        selected_hashtags = random.sample(all_hashtags, min(max_count, len(all_hashtags)))
        
        return " ".join(selected_hashtags)

    async def _generate_cta(self, topic: str, tone: str) -> str:
        """Generate a call-to-action"""
        cta_template = random.choice(self.cta_templates)
        return cta_template.format(topic=topic)

    def _truncate_content(self, content: str, max_length: int) -> str:
        """Truncate content to fit within character limit"""
        if len(content) <= max_length:
            return content
        
        # Try to truncate at word boundary
        truncated = content[:max_length]
        last_space = truncated.rfind(' ')
        
        if last_space > max_length * 0.8:  # If we can find a good word boundary
            return truncated[:last_space] + "..."
        else:
            return truncated + "..."

    async def _analyze_content(self, content: str, platform: str) -> Dict[str, Any]:
        """Analyze content for optimization opportunities"""
        return {
            'word_count': len(content.split()),
            'character_count': len(content),
            'readability_score': self._calculate_readability(content),
            'engagement_potential': self._calculate_engagement_potential(content),
            'hashtag_count': content.count('#'),
            'mention_count': content.count('@'),
            'link_count': content.count('http')
        }

    async def _optimize_for_engagement(self, content: str, platform: str) -> Dict[str, Any]:
        """Optimize content for engagement"""
        return {
            'type': 'engagement',
            'suggestion': 'Add more questions and interactive elements',
            'action': 'Include 1-2 questions to encourage comments'
        }

    async def _optimize_for_reach(self, content: str, platform: str) -> Dict[str, Any]:
        """Optimize content for reach"""
        return {
            'type': 'reach',
            'suggestion': 'Add trending hashtags and mentions',
            'action': 'Include 3-5 trending hashtags'
        }

    async def _optimize_for_clicks(self, content: str, platform: str) -> Dict[str, Any]:
        """Optimize content for clicks"""
        return {
            'type': 'clicks',
            'suggestion': 'Add compelling call-to-action',
            'action': 'Include clear and actionable CTA'
        }

    async def _apply_optimizations(self, content: str, optimizations: List[Dict]) -> str:
        """Apply optimizations to content"""
        # This would typically apply the optimizations
        # For now, return the original content with some modifications
        optimized = content
        
        for opt in optimizations:
            if opt['type'] == 'engagement':
                optimized += " What do you think about this?"
            elif opt['type'] == 'reach':
                optimized += " #trending #viral"
            elif opt['type'] == 'clicks':
                optimized += " Click the link in bio for more!"
        
        return optimized

    def _calculate_readability(self, content: str) -> float:
        """Calculate readability score (simplified)"""
        words = content.split()
        sentences = content.count('.') + content.count('!') + content.count('?')
        
        if sentences == 0:
            return 0.0
        
        avg_words_per_sentence = len(words) / sentences
        return max(0, 100 - avg_words_per_sentence)

    def _calculate_engagement_potential(self, content: str) -> float:
        """Calculate engagement potential score"""
        score = 0.0
        
        # Check for questions
        if '?' in content:
            score += 0.3
        
        # Check for emotional words
        emotional_words = ['amazing', 'incredible', 'unbelievable', 'wow', 'love', 'hate']
        for word in emotional_words:
            if word.lower() in content.lower():
                score += 0.1
        
        # Check for hashtags
        hashtag_count = content.count('#')
        score += min(0.2, hashtag_count * 0.05)
        
        return min(1.0, score)

    def _calculate_improvement_score(self, original: str, optimized: str) -> float:
        """Calculate improvement score between original and optimized content"""
        # This would typically use more sophisticated metrics
        return 0.75  # Placeholder score

# Export the class
__all__ = ['ContentGenerator']

