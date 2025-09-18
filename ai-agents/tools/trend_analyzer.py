"""
Trend Analysis Tool for AI Agents
Analyzes social media trends and provides insights
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import requests
import re
from collections import Counter
import statistics

logger = logging.getLogger(__name__)

class TrendAnalyzer:
    """Tool for analyzing social media trends and providing insights"""
    
    def __init__(self):
        self.trend_sources = {
            'twitter': {
                'api_url': 'https://api.twitter.com/2/tweets/search/recent',
                'trending_url': 'https://api.twitter.com/1.1/trends/place.json'
            },
            'reddit': {
                'api_url': 'https://www.reddit.com/r/all/hot.json',
                'trending_url': 'https://www.reddit.com/r/trending.json'
            },
            'news': {
                'api_url': 'https://newsapi.org/v2/everything',
                'trending_url': 'https://newsapi.org/v2/top-headlines'
            }
        }
        
        self.trend_keywords = [
            'trending', 'viral', 'hot', 'popular', 'breaking', 'news',
            'update', 'announcement', 'launch', 'release', 'new'
        ]
        
        self.sentiment_keywords = {
            'positive': ['amazing', 'awesome', 'great', 'love', 'best', 'excellent', 'fantastic', 'wonderful'],
            'negative': ['terrible', 'awful', 'hate', 'worst', 'bad', 'horrible', 'disappointing', 'frustrating'],
            'neutral': ['okay', 'fine', 'average', 'normal', 'standard', 'typical', 'regular']
        }

    async def analyze_trends(self, 
                           platforms: List[str] = None,
                           keywords: List[str] = None,
                           time_range: str = '24h',
                           limit: int = 50) -> Dict[str, Any]:
        """
        Analyze trends across multiple platforms
        
        Args:
            platforms: List of platforms to analyze
            keywords: List of keywords to search for
            time_range: Time range for analysis (1h, 24h, 7d, 30d)
            limit: Maximum number of results per platform
            
        Returns:
            Dict containing trend analysis results
        """
        try:
            if not platforms:
                platforms = ['twitter', 'reddit', 'news']
            
            if not keywords:
                keywords = self.trend_keywords
            
            results = {
                'success': True,
                'platforms': {},
                'overall_trends': [],
                'sentiment_analysis': {},
                'top_hashtags': [],
                'top_keywords': [],
                'trending_topics': [],
                'analysis_metadata': {
                    'time_range': time_range,
                    'platforms_analyzed': platforms,
                    'keywords_searched': keywords,
                    'total_results': 0,
                    'analysis_timestamp': datetime.now().isoformat()
                }
            }
            
            # Analyze trends for each platform
            for platform in platforms:
                platform_trends = await self._analyze_platform_trends(
                    platform, keywords, time_range, limit
                )
                results['platforms'][platform] = platform_trends
                results['analysis_metadata']['total_results'] += platform_trends.get('total_results', 0)
            
            # Generate overall insights
            results['overall_trends'] = await self._generate_overall_trends(results['platforms'])
            results['sentiment_analysis'] = await self._analyze_sentiment(results['platforms'])
            results['top_hashtags'] = await self._extract_top_hashtags(results['platforms'])
            results['top_keywords'] = await self._extract_top_keywords(results['platforms'])
            results['trending_topics'] = await self._identify_trending_topics(results['platforms'])
            
            logger.info(f"Trend analysis completed for {len(platforms)} platforms")
            return results
            
        except Exception as e:
            logger.error(f"Error analyzing trends: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'platforms': {},
                'overall_trends': [],
                'sentiment_analysis': {},
                'top_hashtags': [],
                'top_keywords': [],
                'trending_topics': []
            }

    async def _analyze_platform_trends(self, 
                                     platform: str, 
                                     keywords: List[str], 
                                     time_range: str, 
                                     limit: int) -> Dict[str, Any]:
        """Analyze trends for a specific platform"""
        try:
            if platform == 'twitter':
                return await self._analyze_twitter_trends(keywords, time_range, limit)
            elif platform == 'reddit':
                return await self._analyze_reddit_trends(keywords, time_range, limit)
            elif platform == 'news':
                return await self._analyze_news_trends(keywords, time_range, limit)
            else:
                return {
                    'success': False,
                    'error': f'Unsupported platform: {platform}',
                    'trends': [],
                    'total_results': 0
                }
        except Exception as e:
            logger.error(f"Error analyzing {platform} trends: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'trends': [],
                'total_results': 0
            }

    async def _analyze_twitter_trends(self, keywords: List[str], time_range: str, limit: int) -> Dict[str, Any]:
        """Analyze Twitter trends"""
        # This would typically use Twitter API
        # For now, return mock data
        mock_trends = [
            {
                'text': 'AI is revolutionizing social media marketing',
                'hashtags': ['#AI', '#SocialMedia', '#Marketing'],
                'engagement': 1250,
                'sentiment': 'positive',
                'timestamp': datetime.now().isoformat()
            },
            {
                'text': 'New social media platform launches with AI features',
                'hashtags': ['#SocialMedia', '#AI', '#Launch'],
                'engagement': 980,
                'sentiment': 'positive',
                'timestamp': datetime.now().isoformat()
            }
        ]
        
        return {
            'success': True,
            'trends': mock_trends,
            'total_results': len(mock_trends),
            'platform': 'twitter'
        }

    async def _analyze_reddit_trends(self, keywords: List[str], time_range: str, limit: int) -> Dict[str, Any]:
        """Analyze Reddit trends"""
        # This would typically use Reddit API
        # For now, return mock data
        mock_trends = [
            {
                'title': 'AI Social Media Tools - What are you using?',
                'subreddit': 'r/socialmedia',
                'score': 250,
                'comments': 45,
                'sentiment': 'positive',
                'timestamp': datetime.now().isoformat()
            },
            {
                'title': 'Best practices for AI-generated content',
                'subreddit': 'r/marketing',
                'score': 180,
                'comments': 32,
                'sentiment': 'neutral',
                'timestamp': datetime.now().isoformat()
            }
        ]
        
        return {
            'success': True,
            'trends': mock_trends,
            'total_results': len(mock_trends),
            'platform': 'reddit'
        }

    async def _analyze_news_trends(self, keywords: List[str], time_range: str, limit: int) -> Dict[str, Any]:
        """Analyze news trends"""
        # This would typically use News API
        # For now, return mock data
        mock_trends = [
            {
                'title': 'AI-Powered Social Media Management Platform Raises $10M',
                'source': 'TechCrunch',
                'url': 'https://example.com/news1',
                'sentiment': 'positive',
                'timestamp': datetime.now().isoformat()
            },
            {
                'title': 'Social Media Marketing Trends for 2024',
                'source': 'Marketing Land',
                'url': 'https://example.com/news2',
                'sentiment': 'neutral',
                'timestamp': datetime.now().isoformat()
            }
        ]
        
        return {
            'success': True,
            'trends': mock_trends,
            'total_results': len(mock_trends),
            'platform': 'news'
        }

    async def _generate_overall_trends(self, platform_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate overall trends from platform data"""
        overall_trends = []
        
        for platform, data in platform_data.items():
            if data.get('success') and data.get('trends'):
                for trend in data['trends']:
                    overall_trends.append({
                        'platform': platform,
                        'content': trend.get('text', trend.get('title', '')),
                        'engagement': trend.get('engagement', trend.get('score', 0)),
                        'sentiment': trend.get('sentiment', 'neutral'),
                        'timestamp': trend.get('timestamp', datetime.now().isoformat())
                    })
        
        # Sort by engagement score
        overall_trends.sort(key=lambda x: x['engagement'], reverse=True)
        
        return overall_trends[:20]  # Return top 20 trends

    async def _analyze_sentiment(self, platform_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze overall sentiment from platform data"""
        sentiment_scores = []
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for platform, data in platform_data.items():
            if data.get('success') and data.get('trends'):
                for trend in data['trends']:
                    sentiment = trend.get('sentiment', 'neutral')
                    sentiment_counts[sentiment] += 1
                    
                    # Convert sentiment to numeric score
                    if sentiment == 'positive':
                        sentiment_scores.append(1)
                    elif sentiment == 'negative':
                        sentiment_scores.append(-1)
                    else:
                        sentiment_scores.append(0)
        
        total_trends = sum(sentiment_counts.values())
        if total_trends > 0:
            sentiment_percentages = {
                sentiment: (count / total_trends) * 100
                for sentiment, count in sentiment_counts.items()
            }
        else:
            sentiment_percentages = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        overall_sentiment = 'neutral'
        if sentiment_scores:
            avg_sentiment = statistics.mean(sentiment_scores)
            if avg_sentiment > 0.2:
                overall_sentiment = 'positive'
            elif avg_sentiment < -0.2:
                overall_sentiment = 'negative'
        
        return {
            'overall_sentiment': overall_sentiment,
            'sentiment_percentages': sentiment_percentages,
            'sentiment_counts': sentiment_counts,
            'average_sentiment_score': statistics.mean(sentiment_scores) if sentiment_scores else 0
        }

    async def _extract_top_hashtags(self, platform_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract top hashtags from platform data"""
        hashtag_counts = Counter()
        
        for platform, data in platform_data.items():
            if data.get('success') and data.get('trends'):
                for trend in data['trends']:
                    hashtags = trend.get('hashtags', [])
                    for hashtag in hashtags:
                        hashtag_counts[hashtag.lower()] += 1
        
        # Return top 20 hashtags
        top_hashtags = [
            {'hashtag': hashtag, 'count': count}
            for hashtag, count in hashtag_counts.most_common(20)
        ]
        
        return top_hashtags

    async def _extract_top_keywords(self, platform_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract top keywords from platform data"""
        keyword_counts = Counter()
        
        for platform, data in platform_data.items():
            if data.get('success') and data.get('trends'):
                for trend in data['trends']:
                    content = trend.get('text', trend.get('title', ''))
                    # Extract keywords (simple word extraction)
                    words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
                    for word in words:
                        if word not in ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use']:
                            keyword_counts[word] += 1
        
        # Return top 20 keywords
        top_keywords = [
            {'keyword': keyword, 'count': count}
            for keyword, count in keyword_counts.most_common(20)
        ]
        
        return top_keywords

    async def _identify_trending_topics(self, platform_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify trending topics from platform data"""
        topic_counts = Counter()
        
        for platform, data in platform_data.items():
            if data.get('success') and data.get('trends'):
                for trend in data['trends']:
                    content = trend.get('text', trend.get('title', ''))
                    # Extract potential topics (phrases of 2-3 words)
                    words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
                    for i in range(len(words) - 1):
                        topic = f"{words[i]} {words[i+1]}"
                        topic_counts[topic] += 1
                    
                    for i in range(len(words) - 2):
                        topic = f"{words[i]} {words[i+1]} {words[i+2]}"
                        topic_counts[topic] += 1
        
        # Return top 15 trending topics
        trending_topics = [
            {'topic': topic, 'count': count}
            for topic, count in topic_counts.most_common(15)
        ]
        
        return trending_topics

    async def get_trending_hashtags(self, platform: str = 'twitter', limit: int = 20) -> Dict[str, Any]:
        """Get trending hashtags for a specific platform"""
        try:
            # This would typically use platform-specific APIs
            # For now, return mock data
            mock_hashtags = [
                {'hashtag': '#AI', 'tweet_count': 12500, 'trend_score': 95},
                {'hashtag': '#SocialMedia', 'tweet_count': 8900, 'trend_score': 87},
                {'hashtag': '#Marketing', 'tweet_count': 7600, 'trend_score': 82},
                {'hashtag': '#Tech', 'tweet_count': 6800, 'trend_score': 78},
                {'hashtag': '#Innovation', 'tweet_count': 5400, 'trend_score': 72}
            ]
            
            return {
                'success': True,
                'platform': platform,
                'hashtags': mock_hashtags[:limit],
                'total_count': len(mock_hashtags)
            }
        except Exception as e:
            logger.error(f"Error getting trending hashtags: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'hashtags': []
            }

    async def predict_trend_direction(self, topic: str, historical_data: List[Dict] = None) -> Dict[str, Any]:
        """Predict the direction of a trend"""
        try:
            # This would typically use machine learning models
            # For now, return mock prediction
            prediction = {
                'topic': topic,
                'predicted_direction': 'up',
                'confidence': 0.75,
                'predicted_peak': datetime.now() + timedelta(days=3),
                'predicted_duration': '5 days',
                'factors': [
                    'Increasing social media mentions',
                    'Positive sentiment trend',
                    'Growing engagement rates'
                ]
            }
            
            return {
                'success': True,
                'prediction': prediction
            }
        except Exception as e:
            logger.error(f"Error predicting trend direction: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'prediction': None
            }

    async def get_trend_insights(self, topic: str, platforms: List[str] = None) -> Dict[str, Any]:
        """Get detailed insights about a specific trend"""
        try:
            if not platforms:
                platforms = ['twitter', 'reddit', 'news']
            
            # Analyze the topic across platforms
            analysis = await self.analyze_trends(platforms, [topic], '24h', 100)
            
            if not analysis['success']:
                return analysis
            
            # Extract insights specific to the topic
            insights = {
                'topic': topic,
                'platforms_analyzed': platforms,
                'total_mentions': analysis['analysis_metadata']['total_results'],
                'sentiment_breakdown': analysis['sentiment_analysis'],
                'top_hashtags': [h for h in analysis['top_hashtags'] if topic.lower() in h['hashtag'].lower()],
                'related_topics': [t for t in analysis['trending_topics'] if topic.lower() in t['topic'].lower()],
                'engagement_trends': self._calculate_engagement_trends(analysis['overall_trends']),
                'recommendations': self._generate_trend_recommendations(topic, analysis)
            }
            
            return {
                'success': True,
                'insights': insights
            }
        except Exception as e:
            logger.error(f"Error getting trend insights: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'insights': None
            }

    def _calculate_engagement_trends(self, trends: List[Dict]) -> Dict[str, Any]:
        """Calculate engagement trends from trend data"""
        if not trends:
            return {'average_engagement': 0, 'engagement_growth': 0}
        
        engagements = [t['engagement'] for t in trends if 'engagement' in t]
        if not engagements:
            return {'average_engagement': 0, 'engagement_growth': 0}
        
        avg_engagement = statistics.mean(engagements)
        
        # Calculate growth (simplified)
        if len(engagements) > 1:
            growth = ((engagements[-1] - engagements[0]) / engagements[0]) * 100
        else:
            growth = 0
        
        return {
            'average_engagement': avg_engagement,
            'engagement_growth': growth,
            'max_engagement': max(engagements),
            'min_engagement': min(engagements)
        }

    def _generate_trend_recommendations(self, topic: str, analysis: Dict) -> List[str]:
        """Generate recommendations based on trend analysis"""
        recommendations = []
        
        sentiment = analysis['sentiment_analysis']['overall_sentiment']
        if sentiment == 'positive':
            recommendations.append(f"Consider creating content around {topic} as sentiment is positive")
        elif sentiment == 'negative':
            recommendations.append(f"Be cautious with {topic} content as sentiment is negative")
        
        if analysis['top_hashtags']:
            top_hashtag = analysis['top_hashtags'][0]['hashtag']
            recommendations.append(f"Use {top_hashtag} in your content for better reach")
        
        if analysis['trending_topics']:
            related_topic = analysis['trending_topics'][0]['topic']
            recommendations.append(f"Consider exploring {related_topic} as a related trend")
        
        return recommendations

# Export the class
__all__ = ['TrendAnalyzer']

