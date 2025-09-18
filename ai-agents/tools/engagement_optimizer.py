"""
Engagement Optimization Tool for AI Agents
Optimizes content for maximum engagement across platforms
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import statistics
import re
from collections import Counter

logger = logging.getLogger(__name__)

class EngagementOptimizer:
    """Tool for optimizing content engagement across social media platforms"""
    
    def __init__(self):
        self.platform_optimizations = {
            'instagram': {
                'optimal_posting_times': ['09:00', '12:00', '15:00', '18:00'],
                'best_days': ['Monday', 'Wednesday', 'Thursday', 'Friday'],
                'optimal_hashtag_count': 30,
                'optimal_caption_length': 125,
                'engagement_factors': {
                    'hashtags': 0.3,
                    'timing': 0.25,
                    'content_quality': 0.2,
                    'visual_appeal': 0.15,
                    'call_to_action': 0.1
                }
            },
            'facebook': {
                'optimal_posting_times': ['09:00', '13:00', '15:00'],
                'best_days': ['Tuesday', 'Wednesday', 'Thursday'],
                'optimal_hashtag_count': 5,
                'optimal_caption_length': 40,
                'engagement_factors': {
                    'content_quality': 0.35,
                    'timing': 0.25,
                    'call_to_action': 0.2,
                    'hashtags': 0.1,
                    'visual_appeal': 0.1
                }
            },
            'twitter': {
                'optimal_posting_times': ['09:00', '12:00', '15:00', '17:00'],
                'best_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'optimal_hashtag_count': 3,
                'optimal_caption_length': 280,
                'engagement_factors': {
                    'timing': 0.3,
                    'content_quality': 0.25,
                    'hashtags': 0.2,
                    'call_to_action': 0.15,
                    'visual_appeal': 0.1
                }
            },
            'linkedin': {
                'optimal_posting_times': ['08:00', '12:00', '17:00'],
                'best_days': ['Tuesday', 'Wednesday', 'Thursday'],
                'optimal_hashtag_count': 5,
                'optimal_caption_length': 150,
                'engagement_factors': {
                    'content_quality': 0.4,
                    'timing': 0.2,
                    'call_to_action': 0.2,
                    'hashtags': 0.1,
                    'visual_appeal': 0.1
                }
            },
            'tiktok': {
                'optimal_posting_times': ['06:00', '10:00', '19:00', '21:00'],
                'best_days': ['Tuesday', 'Thursday', 'Friday'],
                'optimal_hashtag_count': 20,
                'optimal_caption_length': 100,
                'engagement_factors': {
                    'visual_appeal': 0.35,
                    'timing': 0.25,
                    'content_quality': 0.2,
                    'hashtags': 0.15,
                    'call_to_action': 0.05
                }
            }
        }
        
        self.engagement_keywords = {
            'high_engagement': [
                'amazing', 'incredible', 'unbelievable', 'wow', 'love', 'best',
                'perfect', 'fantastic', 'wonderful', 'awesome', 'brilliant'
            ],
            'call_to_action': [
                'click', 'share', 'comment', 'like', 'follow', 'subscribe',
                'learn more', 'discover', 'explore', 'try', 'get', 'find out'
            ],
            'question_starters': [
                'what', 'how', 'why', 'when', 'where', 'which', 'who',
                'do you', 'have you', 'would you', 'can you'
            ]
        }

    async def optimize_content(self, 
                             content: str,
                             platform: str,
                             target_audience: str = 'general',
                             content_type: str = 'post') -> Dict[str, Any]:
        """
        Optimize content for maximum engagement
        
        Args:
            content: Original content to optimize
            platform: Target platform
            target_audience: Target audience description
            content_type: Type of content (post, story, reel, etc.)
            
        Returns:
            Dict containing optimized content and recommendations
        """
        try:
            if platform not in self.platform_optimizations:
                return {
                    'success': False,
                    'error': f'Unsupported platform: {platform}',
                    'optimized_content': content
                }
            
            platform_config = self.platform_optimizations[platform]
            
            # Analyze current content
            analysis = await self._analyze_content(content, platform)
            
            # Generate optimizations
            optimizations = await self._generate_optimizations(
                content, platform, target_audience, content_type, analysis
            )
            
            # Apply optimizations
            optimized_content = await self._apply_optimizations(content, optimizations, platform)
            
            # Calculate engagement score
            engagement_score = await self._calculate_engagement_score(
                optimized_content, platform, analysis
            )
            
            return {
                'success': True,
                'original_content': content,
                'optimized_content': optimized_content,
                'platform': platform,
                'engagement_score': engagement_score,
                'optimizations_applied': optimizations,
                'analysis': analysis,
                'recommendations': await self._generate_recommendations(
                    optimized_content, platform, engagement_score
                )
            }
            
        except Exception as e:
            logger.error(f"Error optimizing content: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'optimized_content': content
            }

    async def _analyze_content(self, content: str, platform: str) -> Dict[str, Any]:
        """Analyze content for engagement factors"""
        analysis = {
            'word_count': len(content.split()),
            'character_count': len(content),
            'hashtag_count': content.count('#'),
            'mention_count': content.count('@'),
            'question_count': content.count('?'),
            'exclamation_count': content.count('!'),
            'link_count': content.count('http'),
            'engagement_keywords': self._count_engagement_keywords(content),
            'call_to_action_present': self._has_call_to_action(content),
            'question_present': self._has_question(content),
            'sentiment_score': self._calculate_sentiment_score(content),
            'readability_score': self._calculate_readability_score(content)
        }
        
        return analysis

    async def _generate_optimizations(self, 
                                    content: str, 
                                    platform: str, 
                                    target_audience: str,
                                    content_type: str,
                                    analysis: Dict) -> List[Dict[str, Any]]:
        """Generate optimization suggestions"""
        optimizations = []
        platform_config = self.platform_optimizations[platform]
        
        # Hashtag optimization
        if analysis['hashtag_count'] < platform_config['optimal_hashtag_count']:
            optimizations.append({
                'type': 'hashtags',
                'priority': 'high',
                'suggestion': f"Add more hashtags (current: {analysis['hashtag_count']}, optimal: {platform_config['optimal_hashtag_count']})",
                'action': 'add_hashtags'
            })
        elif analysis['hashtag_count'] > platform_config['optimal_hashtag_count']:
            optimizations.append({
                'type': 'hashtags',
                'priority': 'medium',
                'suggestion': f"Reduce hashtags (current: {analysis['hashtag_count']}, optimal: {platform_config['optimal_hashtag_count']})",
                'action': 'reduce_hashtags'
            })
        
        # Length optimization
        optimal_length = platform_config['optimal_caption_length']
        if analysis['character_count'] < optimal_length * 0.8:
            optimizations.append({
                'type': 'length',
                'priority': 'medium',
                'suggestion': f"Content is too short (current: {analysis['character_count']}, optimal: {optimal_length})",
                'action': 'expand_content'
            })
        elif analysis['character_count'] > optimal_length * 1.2:
            optimizations.append({
                'type': 'length',
                'priority': 'medium',
                'suggestion': f"Content is too long (current: {analysis['character_count']}, optimal: {optimal_length})",
                'action': 'shorten_content'
            })
        
        # Call-to-action optimization
        if not analysis['call_to_action_present']:
            optimizations.append({
                'type': 'call_to_action',
                'priority': 'high',
                'suggestion': 'Add a call-to-action to increase engagement',
                'action': 'add_cta'
            })
        
        # Question optimization
        if not analysis['question_present']:
            optimizations.append({
                'type': 'engagement',
                'priority': 'medium',
                'suggestion': 'Add a question to encourage comments',
                'action': 'add_question'
            })
        
        # Engagement keywords optimization
        if analysis['engagement_keywords'] < 2:
            optimizations.append({
                'type': 'keywords',
                'priority': 'medium',
                'suggestion': 'Add more engaging keywords to increase appeal',
                'action': 'add_engagement_keywords'
            })
        
        # Sentiment optimization
        if analysis['sentiment_score'] < 0.3:
            optimizations.append({
                'type': 'sentiment',
                'priority': 'high',
                'suggestion': 'Improve sentiment to make content more positive and engaging',
                'action': 'improve_sentiment'
            })
        
        return optimizations

    async def _apply_optimizations(self, 
                                 content: str, 
                                 optimizations: List[Dict], 
                                 platform: str) -> str:
        """Apply optimizations to content"""
        optimized_content = content
        
        for optimization in optimizations:
            if optimization['action'] == 'add_hashtags':
                optimized_content = await self._add_hashtags(optimized_content, platform)
            elif optimization['action'] == 'reduce_hashtags':
                optimized_content = await self._reduce_hashtags(optimized_content, platform)
            elif optimization['action'] == 'add_cta':
                optimized_content = await self._add_call_to_action(optimized_content, platform)
            elif optimization['action'] == 'add_question':
                optimized_content = await self._add_question(optimized_content)
            elif optimization['action'] == 'add_engagement_keywords':
                optimized_content = await self._add_engagement_keywords(optimized_content)
            elif optimization['action'] == 'improve_sentiment':
                optimized_content = await self._improve_sentiment(optimized_content)
        
        return optimized_content

    async def _add_hashtags(self, content: str, platform: str) -> str:
        """Add relevant hashtags to content"""
        platform_config = self.platform_optimizations[platform]
        current_hashtags = content.count('#')
        needed_hashtags = platform_config['optimal_hashtag_count'] - current_hashtags
        
        if needed_hashtags > 0:
            # Generate relevant hashtags (simplified)
            relevant_hashtags = [
                '#socialmedia', '#marketing', '#content', '#engagement',
                '#viral', '#trending', '#tips', '#strategy'
            ]
            
            hashtags_to_add = relevant_hashtags[:needed_hashtags]
            content += ' ' + ' '.join(hashtags_to_add)
        
        return content

    async def _reduce_hashtags(self, content: str, platform: str) -> str:
        """Reduce hashtags to optimal count"""
        platform_config = self.platform_optimizations[platform]
        optimal_count = platform_config['optimal_hashtag_count']
        
        # Extract hashtags
        hashtags = re.findall(r'#\w+', content)
        
        if len(hashtags) > optimal_count:
            # Keep the most relevant hashtags
            hashtags_to_keep = hashtags[:optimal_count]
            hashtags_to_remove = hashtags[optimal_count:]
            
            for hashtag in hashtags_to_remove:
                content = content.replace(hashtag, '')
        
        return content

    async def _add_call_to_action(self, content: str, platform: str) -> str:
        """Add call-to-action to content"""
        cta_options = {
            'instagram': ['Double tap if you agree!', 'Share your thoughts below!', 'Tag someone who needs to see this!'],
            'facebook': ['What do you think?', 'Share your experience!', 'Let us know in the comments!'],
            'twitter': ['What\'s your take?', 'Retweet if you agree!', 'Share your thoughts!'],
            'linkedin': ['What\'s your experience?', 'Share your insights!', 'Join the conversation!'],
            'tiktok': ['Follow for more!', 'Double tap!', 'Comment below!']
        }
        
        cta = cta_options.get(platform, ['What do you think?'])
        content += f' {cta[0]}'
        
        return content

    async def _add_question(self, content: str) -> str:
        """Add engaging question to content"""
        question_starters = self.engagement_keywords['question_starters']
        questions = [
            'What do you think about this?',
            'Have you tried this before?',
            'What\'s your experience?',
            'Do you agree?',
            'What would you add?'
        ]
        
        content += f' {questions[0]}'
        return content

    async def _add_engagement_keywords(self, content: str) -> str:
        """Add engaging keywords to content"""
        high_engagement_words = self.engagement_keywords['high_engagement']
        
        # Add engaging words naturally
        if 'amazing' not in content.lower():
            content = content.replace('good', 'amazing')
        if 'incredible' not in content.lower():
            content = content.replace('great', 'incredible')
        
        return content

    async def _improve_sentiment(self, content: str) -> str:
        """Improve sentiment of content"""
        # Replace negative words with positive ones
        sentiment_replacements = {
            'bad': 'challenging',
            'terrible': 'difficult',
            'awful': 'tough',
            'hate': 'dislike',
            'worst': 'least favorite'
        }
        
        for negative, positive in sentiment_replacements.items():
            content = content.replace(negative, positive)
        
        return content

    async def _calculate_engagement_score(self, 
                                        content: str, 
                                        platform: str, 
                                        analysis: Dict) -> float:
        """Calculate engagement score for content"""
        platform_config = self.platform_optimizations[platform]
        factors = platform_config['engagement_factors']
        
        score = 0.0
        
        # Hashtag score
        hashtag_score = min(analysis['hashtag_count'] / platform_config['optimal_hashtag_count'], 1.0)
        score += hashtag_score * factors['hashtags']
        
        # Length score
        optimal_length = platform_config['optimal_caption_length']
        length_ratio = analysis['character_count'] / optimal_length
        length_score = 1.0 - abs(1.0 - length_ratio) * 0.5
        score += length_score * factors['content_quality']
        
        # Call-to-action score
        cta_score = 1.0 if analysis['call_to_action_present'] else 0.0
        score += cta_score * factors['call_to_action']
        
        # Question score
        question_score = 1.0 if analysis['question_present'] else 0.0
        score += question_score * 0.1  # Bonus for questions
        
        # Engagement keywords score
        keyword_score = min(analysis['engagement_keywords'] / 3, 1.0)
        score += keyword_score * 0.1  # Bonus for keywords
        
        # Sentiment score
        sentiment_score = max(0, analysis['sentiment_score'])
        score += sentiment_score * 0.1  # Bonus for positive sentiment
        
        return min(score, 1.0)  # Cap at 1.0

    async def _generate_recommendations(self, 
                                      content: str, 
                                      platform: str, 
                                      engagement_score: float) -> List[str]:
        """Generate recommendations for further optimization"""
        recommendations = []
        
        if engagement_score < 0.6:
            recommendations.append("Consider posting at optimal times for better engagement")
            recommendations.append("Add more visual elements to increase appeal")
            recommendations.append("Use trending hashtags relevant to your content")
        
        if engagement_score < 0.8:
            recommendations.append("Include more engaging questions to encourage comments")
            recommendations.append("Add a clear call-to-action")
            recommendations.append("Consider creating video content for better engagement")
        
        if engagement_score >= 0.8:
            recommendations.append("Great job! Your content is well-optimized for engagement")
            recommendations.append("Consider A/B testing different variations")
            recommendations.append("Monitor performance and adjust based on results")
        
        return recommendations

    def _count_engagement_keywords(self, content: str) -> int:
        """Count engagement keywords in content"""
        content_lower = content.lower()
        count = 0
        for keyword in self.engagement_keywords['high_engagement']:
            count += content_lower.count(keyword)
        return count

    def _has_call_to_action(self, content: str) -> bool:
        """Check if content has call-to-action"""
        content_lower = content.lower()
        for cta in self.engagement_keywords['call_to_action']:
            if cta in content_lower:
                return True
        return False

    def _has_question(self, content: str) -> bool:
        """Check if content has a question"""
        return '?' in content

    def _calculate_sentiment_score(self, content: str) -> float:
        """Calculate sentiment score of content"""
        content_lower = content.lower()
        positive_count = 0
        negative_count = 0
        
        for word in self.engagement_keywords['high_engagement']:
            positive_count += content_lower.count(word)
        
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing']
        for word in negative_words:
            negative_count += content_lower.count(word)
        
        total_words = len(content.split())
        if total_words == 0:
            return 0.0
        
        return (positive_count - negative_count) / total_words

    def _calculate_readability_score(self, content: str) -> float:
        """Calculate readability score of content"""
        words = content.split()
        sentences = content.count('.') + content.count('!') + content.count('?')
        
        if sentences == 0:
            return 0.0
        
        avg_words_per_sentence = len(words) / sentences
        return max(0, 1.0 - (avg_words_per_sentence - 15) / 15)

    async def get_optimal_posting_times(self, platform: str, audience_timezone: str = 'UTC') -> Dict[str, Any]:
        """Get optimal posting times for a platform"""
        try:
            if platform not in self.platform_optimizations:
                return {
                    'success': False,
                    'error': f'Unsupported platform: {platform}'
                }
            
            platform_config = self.platform_optimizations[platform]
            
            return {
                'success': True,
                'platform': platform,
                'optimal_times': platform_config['optimal_posting_times'],
                'best_days': platform_config['best_days'],
                'timezone': audience_timezone,
                'recommendations': [
                    f"Post between {platform_config['optimal_posting_times'][0]} and {platform_config['optimal_posting_times'][-1]}",
                    f"Best days: {', '.join(platform_config['best_days'])}",
                    "Test different times to find what works best for your audience"
                ]
            }
        except Exception as e:
            logger.error(f"Error getting optimal posting times: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    async def analyze_engagement_patterns(self, 
                                        historical_data: List[Dict]) -> Dict[str, Any]:
        """Analyze engagement patterns from historical data"""
        try:
            if not historical_data:
                return {
                    'success': False,
                    'error': 'No historical data provided'
                }
            
            # Extract engagement metrics
            engagements = [item.get('engagement', 0) for item in historical_data]
            likes = [item.get('likes', 0) for item in historical_data]
            comments = [item.get('comments', 0) for item in historical_data]
            shares = [item.get('shares', 0) for item in historical_data]
            
            # Calculate patterns
            patterns = {
                'average_engagement': statistics.mean(engagements) if engagements else 0,
                'engagement_trend': self._calculate_trend(engagements),
                'best_performing_content': max(historical_data, key=lambda x: x.get('engagement', 0)),
                'engagement_by_hour': self._group_by_hour(historical_data),
                'engagement_by_day': self._group_by_day(historical_data),
                'top_hashtags': self._extract_top_hashtags(historical_data),
                'content_length_analysis': self._analyze_content_length(historical_data)
            }
            
            return {
                'success': True,
                'patterns': patterns,
                'recommendations': self._generate_pattern_recommendations(patterns)
            }
        except Exception as e:
            logger.error(f"Error analyzing engagement patterns: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def _calculate_trend(self, data: List[float]) -> str:
        """Calculate trend direction from data"""
        if len(data) < 2:
            return 'insufficient_data'
        
        # Simple linear trend calculation
        n = len(data)
        x = list(range(n))
        y = data
        
        x_mean = statistics.mean(x)
        y_mean = statistics.mean(y)
        
        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 'no_trend'
        
        slope = numerator / denominator
        
        if slope > 0.1:
            return 'increasing'
        elif slope < -0.1:
            return 'decreasing'
        else:
            return 'stable'

    def _group_by_hour(self, data: List[Dict]) -> Dict[str, float]:
        """Group engagement by hour of day"""
        hourly_engagement = {}
        
        for item in data:
            if 'timestamp' in item:
                hour = datetime.fromisoformat(item['timestamp']).hour
                engagement = item.get('engagement', 0)
                
                if hour not in hourly_engagement:
                    hourly_engagement[hour] = []
                hourly_engagement[hour].append(engagement)
        
        # Calculate averages
        return {
            str(hour): statistics.mean(engagements)
            for hour, engagements in hourly_engagement.items()
        }

    def _group_by_day(self, data: List[Dict]) -> Dict[str, float]:
        """Group engagement by day of week"""
        daily_engagement = {}
        
        for item in data:
            if 'timestamp' in item:
                day = datetime.fromisoformat(item['timestamp']).strftime('%A')
                engagement = item.get('engagement', 0)
                
                if day not in daily_engagement:
                    daily_engagement[day] = []
                daily_engagement[day].append(engagement)
        
        # Calculate averages
        return {
            day: statistics.mean(engagements)
            for day, engagements in daily_engagement.items()
        }

    def _extract_top_hashtags(self, data: List[Dict]) -> List[Dict[str, Any]]:
        """Extract top performing hashtags"""
        hashtag_performance = {}
        
        for item in data:
            content = item.get('content', '')
            engagement = item.get('engagement', 0)
            
            hashtags = re.findall(r'#\w+', content)
            for hashtag in hashtags:
                if hashtag not in hashtag_performance:
                    hashtag_performance[hashtag] = []
                hashtag_performance[hashtag].append(engagement)
        
        # Calculate averages and sort
        top_hashtags = [
            {
                'hashtag': hashtag,
                'average_engagement': statistics.mean(engagements),
                'count': len(engagements)
            }
            for hashtag, engagements in hashtag_performance.items()
        ]
        
        return sorted(top_hashtags, key=lambda x: x['average_engagement'], reverse=True)[:10]

    def _analyze_content_length(self, data: List[Dict]) -> Dict[str, Any]:
        """Analyze content length vs engagement"""
        length_engagement = []
        
        for item in data:
            content = item.get('content', '')
            engagement = item.get('engagement', 0)
            length = len(content)
            
            length_engagement.append({'length': length, 'engagement': engagement})
        
        if not length_engagement:
            return {'optimal_length': 0, 'correlation': 0}
        
        # Calculate correlation
        lengths = [item['length'] for item in length_engagement]
        engagements = [item['engagement'] for item in length_engagement]
        
        correlation = self._calculate_correlation(lengths, engagements)
        
        # Find optimal length
        optimal_length = statistics.mean(lengths)
        
        return {
            'optimal_length': optimal_length,
            'correlation': correlation,
            'average_length': statistics.mean(lengths),
            'length_range': {
                'min': min(lengths),
                'max': max(lengths)
            }
        }

    def _calculate_correlation(self, x: List[float], y: List[float]) -> float:
        """Calculate correlation coefficient"""
        if len(x) != len(y) or len(x) < 2:
            return 0.0
        
        n = len(x)
        x_mean = statistics.mean(x)
        y_mean = statistics.mean(y)
        
        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        x_variance = sum((x[i] - x_mean) ** 2 for i in range(n))
        y_variance = sum((y[i] - y_mean) ** 2 for i in range(n))
        
        denominator = (x_variance * y_variance) ** 0.5
        
        if denominator == 0:
            return 0.0
        
        return numerator / denominator

    def _generate_pattern_recommendations(self, patterns: Dict) -> List[str]:
        """Generate recommendations based on engagement patterns"""
        recommendations = []
        
        if patterns['engagement_trend'] == 'increasing':
            recommendations.append("Great! Your engagement is trending upward. Keep doing what you're doing!")
        elif patterns['engagement_trend'] == 'decreasing':
            recommendations.append("Your engagement is declining. Consider changing your content strategy.")
        
        if patterns['engagement_by_hour']:
            best_hour = max(patterns['engagement_by_hour'], key=patterns['engagement_by_hour'].get)
            recommendations.append(f"Your best performing hour is {best_hour}:00. Post more content at this time.")
        
        if patterns['engagement_by_day']:
            best_day = max(patterns['engagement_by_day'], key=patterns['engagement_by_day'].get)
            recommendations.append(f"Your best performing day is {best_day}. Focus on this day for important content.")
        
        if patterns['top_hashtags']:
            top_hashtag = patterns['top_hashtags'][0]['hashtag']
            recommendations.append(f"Your top performing hashtag is {top_hashtag}. Use it more often.")
        
        return recommendations

# Export the class
__all__ = ['EngagementOptimizer']

