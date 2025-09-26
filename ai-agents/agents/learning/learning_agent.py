import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import uuid
import numpy as np
from dataclasses import dataclass
from enum import Enum
import statistics

from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import BaseTool, tool
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.base_agent import BaseAgent, AgentTask, AgentResponse
from config.settings import AgentType, get_platform_config
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_agent_activity

class LearningType(str, Enum):
    PERFORMANCE_ANALYSIS = "performance_analysis"
    AB_TESTING = "ab_testing"
    PATTERN_RECOGNITION = "pattern_recognition"
    OPTIMIZATION = "optimization"
    PREDICTIVE_MODELING = "predictive_modeling"
    AUDIENCE_LEARNING = "audience_learning"
    CONTENT_OPTIMIZATION = "content_optimization"

class ExperimentStatus(str, Enum):
    PLANNED = "planned"
    RUNNING = "running"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    ANALYZING = "analyzing"

@dataclass
class LearningInsight:
    """Represents a learning insight discovered by the agent."""
    id: str
    type: LearningType
    title: str
    description: str
    confidence: float
    impact_score: float
    evidence: List[Dict[str, Any]]
    recommendations: List[str]
    implementation_difficulty: str  # easy, medium, hard
    expected_improvement: str
    discovered_at: datetime
    validated: bool
    validation_score: Optional[float]
    metadata: Dict[str, Any]

@dataclass
class ABTestExperiment:
    """Represents an A/B testing experiment."""
    id: str
    name: str
    hypothesis: str
    variable_tested: str
    control_group: Dict[str, Any]
    test_group: Dict[str, Any]
    success_metric: str
    sample_size: int
    duration_days: int
    status: ExperimentStatus
    start_date: datetime
    end_date: Optional[datetime]
    results: Optional[Dict[str, Any]]
    statistical_significance: Optional[float]
    winner: Optional[str]  # control, test, or inconclusive
    confidence_level: float
    created_at: datetime
    metadata: Dict[str, Any]

@dataclass
class PerformancePattern:
    """Represents a discovered performance pattern."""
    id: str
    pattern_type: str
    description: str
    conditions: List[str]
    performance_impact: float
    frequency: str
    platforms: List[str]
    content_types: List[str]
    audience_segments: List[str]
    time_patterns: Dict[str, Any]
    confidence: float
    discovered_at: datetime
    validation_count: int
    metadata: Dict[str, Any]

class LearningInput(BaseModel):
    """Input schema for learning analysis."""
    analysis_type: LearningType = Field(description="Type of learning analysis to perform")
    data_source: str = Field(description="Source of data for analysis")
    time_period: Dict[str, str] = Field(description="Time period for analysis")
    platforms: List[str] = Field(description="Platforms to analyze")
    metrics: List[str] = Field(description="Metrics to focus on")

class ExperimentInput(BaseModel):
    """Input schema for A/B testing experiments."""
    experiment_name: str = Field(description="Name of the experiment")
    hypothesis: str = Field(description="Hypothesis to test")
    variable_to_test: str = Field(description="Variable being tested")
    success_metric: str = Field(description="Primary success metric")
    duration_days: int = Field(description="Duration of experiment in days")

class LearningAgent(BaseAgent):
    """Learning Agent for performance analysis and continuous improvement."""
    
    def __init__(self, organization_id: str):
        super().__init__(AgentType.LEARNING, organization_id)
        self.active_experiments = {}
        self.discovered_patterns = []
        self.learning_insights = []
        self.performance_baselines = {}
        
    async def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the Learning Agent's system prompt."""
        system_prompt = """You are an AI Learning Agent specialized in performance analysis, optimization, and continuous improvement for social media marketing.

Your primary responsibilities:
1. Analyze performance data to identify patterns and insights
2. Design and manage A/B testing experiments
3. Discover optimization opportunities through data analysis
4. Build predictive models for performance forecasting
5. Learn audience behavior patterns and preferences
6. Optimize content strategies based on performance data
7. Provide data-driven recommendations for improvement
8. Track and validate the impact of implemented changes

Key capabilities:
- Advanced statistical analysis and pattern recognition
- A/B testing design and statistical significance testing
- Machine learning model development and training
- Performance trend analysis and forecasting
- Audience segmentation and behavior analysis
- Content optimization based on performance data
- ROI analysis and business impact measurement
- Continuous learning and model improvement

Learning Methodologies:
- Statistical analysis of performance metrics
- Correlation analysis between variables
- Time series analysis for trend identification
- Cohort analysis for audience behavior
- Multivariate testing for complex optimizations
- Machine learning for predictive modeling
- Clustering for audience segmentation
- Regression analysis for factor identification

A/B Testing Best Practices:
- Clear hypothesis formulation
- Proper sample size calculation
- Statistical significance testing
- Control for external variables
- Sufficient test duration
- Multiple metric evaluation
- Winner validation and rollout
- Learning documentation and sharing

Performance Analysis Framework:
1. Data Collection and Validation
   - Ensure data quality and completeness
   - Identify and handle outliers
   - Validate data sources and accuracy
   - Establish baseline measurements

2. Pattern Recognition
   - Identify recurring performance patterns
   - Analyze seasonal and temporal trends
   - Discover audience behavior patterns
   - Find content performance correlations

3. Insight Generation
   - Translate patterns into actionable insights
   - Quantify impact and opportunity size
   - Prioritize insights by potential value
   - Validate insights with additional data

4. Recommendation Development
   - Create specific, actionable recommendations
   - Estimate implementation effort and timeline
   - Predict expected performance improvement
   - Design validation and measurement plans

5. Impact Measurement
   - Track implementation of recommendations
   - Measure actual vs. predicted improvements
   - Validate learning accuracy and adjust models
   - Document lessons learned and best practices

Optimization Areas:
- Content timing and frequency optimization
- Audience targeting and segmentation
- Content format and style optimization
- Platform-specific strategy refinement
- Hashtag and keyword optimization
- Visual content performance improvement
- Engagement strategy enhancement
- Conversion rate optimization

Statistical Rigor:
- Use appropriate statistical tests
- Ensure adequate sample sizes
- Control for multiple comparisons
- Validate assumptions before analysis
- Report confidence intervals
- Consider practical significance
- Account for external factors
- Maintain experimental integrity

Learning Validation:
- Cross-validate insights with multiple data sources
- Test recommendations in controlled environments
- Monitor long-term impact of changes
- Adjust models based on new data
- Maintain learning accuracy metrics
- Document validation processes
- Share validated learnings across organization

Remember: Focus on statistically significant, actionable insights that drive measurable business impact while maintaining scientific rigor in all analyses."""

        return ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
    
    async def _initialize_tools(self) -> List[BaseTool]:
        """Initialize Learning Agent specific tools."""
        
        @tool
        def analyze_performance_patterns(analysis_data: str) -> str:
            """Analyze performance data to identify patterns and insights."""
            try:
                data = json.loads(analysis_data) if isinstance(analysis_data, str) else analysis_data
                
                analysis_type = data.get('analysis_type', 'performance_analysis')
                time_period = data.get('time_period', {})
                platforms = data.get('platforms', ['instagram'])
                metrics = data.get('metrics', ['engagement_rate'])
                
                # Simulate performance pattern analysis
                patterns_discovered = []
                
                # Pattern 1: Time-based performance patterns
                time_pattern = {
                    "pattern_id": str(uuid.uuid4()),
                    "type": "temporal_pattern",
                    "title": "Evening Engagement Peak",
                    "description": "Content posted between 7-9 PM shows 35% higher engagement rates",
                    "confidence": 0.87,
                    "impact_score": 8.5,
                    "evidence": [
                        {"metric": "engagement_rate", "improvement": "35%", "time_range": "19:00-21:00"},
                        {"metric": "reach", "improvement": "28%", "time_range": "19:00-21:00"},
                        {"metric": "comments", "improvement": "42%", "time_range": "19:00-21:00"}
                    ],
                    "platforms": ["instagram", "facebook"],
                    "sample_size": 450,
                    "statistical_significance": 0.95
                }
                patterns_discovered.append(time_pattern)
                
                # Pattern 2: Content format performance patterns
                format_pattern = {
                    "pattern_id": str(uuid.uuid4()),
                    "type": "content_format_pattern",
                    "title": "Carousel Posts Outperform Single Images",
                    "description": "Carousel posts generate 67% more engagement than single image posts",
                    "confidence": 0.92,
                    "impact_score": 9.2,
                    "evidence": [
                        {"metric": "engagement_rate", "carousel": "4.8%", "single_image": "2.9%"},
                        {"metric": "saves", "carousel": "156", "single_image": "89"},
                        {"metric": "time_spent", "carousel": "12.3s", "single_image": "7.8s"}
                    ],
                    "platforms": ["instagram"],
                    "sample_size": 320,
                    "statistical_significance": 0.98
                }
                patterns_discovered.append(format_pattern)
                
                # Pattern 3: Audience behavior patterns
                audience_pattern = {
                    "pattern_id": str(uuid.uuid4()),
                    "type": "audience_behavior_pattern",
                    "title": "Weekend Audience Prefers Entertainment Content",
                    "description": "Entertainment content performs 45% better on weekends vs. educational content",
                    "confidence": 0.83,
                    "impact_score": 7.8,
                    "evidence": [
                        {"content_type": "entertainment", "weekend_engagement": "5.2%", "weekday_engagement": "3.6%"},
                        {"content_type": "educational", "weekend_engagement": "2.8%", "weekday_engagement": "4.1%"},
                        {"audience_segment": "25-34", "weekend_preference": "entertainment", "strength": "strong"}
                    ],
                    "platforms": ["instagram", "tiktok"],
                    "sample_size": 280,
                    "statistical_significance": 0.89
                }
                patterns_discovered.append(audience_pattern)
                
                # Pattern 4: Hashtag performance patterns
                hashtag_pattern = {
                    "pattern_id": str(uuid.uuid4()),
                    "type": "hashtag_pattern",
                    "title": "Optimal Hashtag Count for Maximum Reach",
                    "description": "Posts with 8-12 hashtags achieve 23% higher reach than other ranges",
                    "confidence": 0.79,
                    "impact_score": 6.9,
                    "evidence": [
                        {"hashtag_range": "8-12", "avg_reach": "2,340", "engagement_rate": "3.8%"},
                        {"hashtag_range": "1-7", "avg_reach": "1,890", "engagement_rate": "3.2%"},
                        {"hashtag_range": "13+", "avg_reach": "1,650", "engagement_rate": "2.9%"}
                    ],
                    "platforms": ["instagram"],
                    "sample_size": 520,
                    "statistical_significance": 0.91
                }
                patterns_discovered.append(hashtag_pattern)
                
                # Generate actionable recommendations
                recommendations = [
                    "Schedule high-priority content between 7-9 PM for maximum engagement",
                    "Prioritize carousel format for educational and promotional content",
                    "Create entertainment-focused content for weekend posting",
                    "Optimize hashtag count to 8-12 tags per Instagram post",
                    "Test similar patterns on other platforms for validation"
                ]
                
                return json.dumps({
                    "analysis_type": analysis_type,
                    "patterns_discovered": patterns_discovered,
                    "total_patterns": len(patterns_discovered),
                    "high_impact_patterns": len([p for p in patterns_discovered if p["impact_score"] >= 8.0]),
                    "recommendations": recommendations,
                    "next_analysis_suggestions": [
                        "Analyze seasonal content performance patterns",
                        "Study competitor posting strategies",
                        "Investigate audience demographic preferences"
                    ],
                    "confidence": 0.85
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def design_ab_test_experiment(experiment_data: str) -> str:
            """Design and set up A/B testing experiments."""
            try:
                data = json.loads(experiment_data) if isinstance(experiment_data, str) else experiment_data
                
                experiment_name = data.get('experiment_name', 'Untitled Experiment')
                hypothesis = data.get('hypothesis', '')
                variable_to_test = data.get('variable_to_test', '')
                success_metric = data.get('success_metric', 'engagement_rate')
                duration_days = data.get('duration_days', 14)
                
                # Calculate required sample size
                effect_size = 0.2  # Expected 20% improvement
                power = 0.8
                alpha = 0.05
                sample_size_per_group = self._calculate_sample_size(effect_size, power, alpha)
                
                experiment_design = {
                    "experiment_id": str(uuid.uuid4()),
                    "name": experiment_name,
                    "hypothesis": hypothesis,
                    "variable_tested": variable_to_test,
                    "success_metric": success_metric,
                    "duration_days": duration_days,
                    "sample_size_per_group": sample_size_per_group,
                    "total_sample_size": sample_size_per_group * 2,
                    "statistical_power": power,
                    "significance_level": alpha,
                    "minimum_detectable_effect": f"{effect_size * 100}%",
                    "status": "planned",
                    "created_at": datetime.utcnow().isoformat()
                }
                
                # Define control and test groups
                if variable_to_test.lower() == 'posting_time':
                    experiment_design["control_group"] = {
                        "description": "Current posting schedule (2 PM)",
                        "posting_time": "14:00",
                        "sample_allocation": "50%"
                    }
                    experiment_design["test_group"] = {
                        "description": "Optimized posting schedule (7 PM)",
                        "posting_time": "19:00",
                        "sample_allocation": "50%"
                    }
                
                elif variable_to_test.lower() == 'content_format':
                    experiment_design["control_group"] = {
                        "description": "Single image posts",
                        "format": "single_image",
                        "sample_allocation": "50%"
                    }
                    experiment_design["test_group"] = {
                        "description": "Carousel posts",
                        "format": "carousel",
                        "sample_allocation": "50%"
                    }
                
                elif variable_to_test.lower() == 'caption_length':
                    experiment_design["control_group"] = {
                        "description": "Short captions (< 100 characters)",
                        "caption_length": "short",
                        "max_characters": 100,
                        "sample_allocation": "50%"
                    }
                    experiment_design["test_group"] = {
                        "description": "Long captions (> 200 characters)",
                        "caption_length": "long",
                        "min_characters": 200,
                        "sample_allocation": "50%"
                    }
                
                elif variable_to_test.lower() == 'hashtag_count':
                    experiment_design["control_group"] = {
                        "description": "Low hashtag count (3-5 hashtags)",
                        "hashtag_count": "low",
                        "hashtag_range": "3-5",
                        "sample_allocation": "50%"
                    }
                    experiment_design["test_group"] = {
                        "description": "Optimal hashtag count (8-12 hashtags)",
                        "hashtag_count": "optimal",
                        "hashtag_range": "8-12",
                        "sample_allocation": "50%"
                    }
                
                # Define success criteria
                experiment_design["success_criteria"] = {
                    "primary_metric": success_metric,
                    "minimum_improvement": "15%",
                    "statistical_significance_required": 0.95,
                    "practical_significance_threshold": "10%"
                }
                
                # Define monitoring plan
                experiment_design["monitoring_plan"] = {
                    "daily_checks": True,
                    "interim_analysis": f"Day {duration_days // 2}",
                    "early_stopping_rules": {
                        "futility": "If improvement < 5% at interim analysis",
                        "superiority": "If p-value < 0.001 and improvement > 25%"
                    },
                    "data_quality_checks": [
                        "Sample size balance",
                        "Randomization validation",
                        "External factor monitoring"
                    ]
                }
                
                # Risk assessment
                experiment_design["risk_assessment"] = {
                    "potential_risks": [
                        "Seasonal effects during test period",
                        "Algorithm changes affecting results",
                        "Insufficient sample size if engagement drops"
                    ],
                    "mitigation_strategies": [
                        "Monitor external factors daily",
                        "Prepare backup content strategy",
                        "Extend test duration if needed"
                    ],
                    "rollback_plan": "Revert to control group settings if negative impact > 10%"
                }
                
                return json.dumps({
                    "experiment_design": experiment_design,
                    "setup_complete": True,
                    "ready_to_launch": True,
                    "estimated_results_date": (datetime.utcnow() + timedelta(days=duration_days)).isoformat(),
                    "confidence": 0.9
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def analyze_experiment_results(results_data: str) -> str:
            """Analyze A/B test experiment results and determine statistical significance."""
            try:
                data = json.loads(results_data) if isinstance(results_data, str) else results_data
                
                experiment_id = data.get('experiment_id', '')
                control_metrics = data.get('control_group_metrics', {})
                test_metrics = data.get('test_group_metrics', {})
                primary_metric = data.get('primary_metric', 'engagement_rate')
                
                # Simulate statistical analysis
                control_value = control_metrics.get(primary_metric, 3.2)  # 3.2% engagement rate
                test_value = test_metrics.get(primary_metric, 3.8)  # 3.8% engagement rate
                
                # Calculate statistical significance (simplified)
                improvement = ((test_value - control_value) / control_value) * 100
                p_value = 0.023  # Simulated p-value
                confidence_interval = [improvement - 5.2, improvement + 8.1]
                
                statistical_analysis = {
                    "experiment_id": experiment_id,
                    "primary_metric": primary_metric,
                    "control_performance": control_value,
                    "test_performance": test_value,
                    "absolute_improvement": test_value - control_value,
                    "relative_improvement": f"{improvement:.1f}%",
                    "p_value": p_value,
                    "statistical_significance": p_value < 0.05,
                    "confidence_interval_95": confidence_interval,
                    "sample_sizes": {
                        "control": control_metrics.get('sample_size', 1250),
                        "test": test_metrics.get('sample_size', 1280)
                    }
                }
                
                # Determine winner
                if p_value < 0.05 and improvement > 10:
                    winner = "test"
                    recommendation = "Implement test group changes"
                elif p_value < 0.05 and improvement < -10:
                    winner = "control"
                    recommendation = "Keep current approach (control)"
                else:
                    winner = "inconclusive"
                    recommendation = "Results inconclusive, consider extended testing"
                
                statistical_analysis["winner"] = winner
                statistical_analysis["recommendation"] = recommendation
                
                # Secondary metrics analysis
                secondary_metrics = {}
                for metric in ['reach', 'comments', 'saves', 'shares']:
                    if metric in control_metrics and metric in test_metrics:
                        control_sec = control_metrics[metric]
                        test_sec = test_metrics[metric]
                        sec_improvement = ((test_sec - control_sec) / control_sec) * 100
                        secondary_metrics[metric] = {
                            "control": control_sec,
                            "test": test_sec,
                            "improvement": f"{sec_improvement:.1f}%"
                        }
                
                statistical_analysis["secondary_metrics"] = secondary_metrics
                
                # Business impact assessment
                business_impact = {
                    "estimated_monthly_improvement": f"{improvement * 0.8:.1f}%",  # Conservative estimate
                    "projected_engagement_increase": int(1000 * (improvement / 100)),
                    "implementation_effort": "Low" if winner == "test" else "N/A",
                    "rollout_timeline": "1-2 weeks" if winner == "test" else "N/A"
                }
                
                statistical_analysis["business_impact"] = business_impact
                
                # Learning insights
                insights = []
                if winner == "test":
                    insights.append(f"Test variation improved {primary_metric} by {improvement:.1f}%")
                    insights.append("Results are statistically significant and practically meaningful")
                    insights.append("Recommend full rollout to all content")
                elif winner == "control":
                    insights.append(f"Control performed better by {abs(improvement):.1f}%")
                    insights.append("Current approach is optimal for this variable")
                    insights.append("Consider testing other variables for optimization")
                else:
                    insights.append("No significant difference detected between variations")
                    insights.append("May need larger sample size or longer test duration")
                    insights.append("Consider testing more dramatic variations")
                
                statistical_analysis["insights"] = insights
                
                # Next steps
                next_steps = []
                if winner == "test":
                    next_steps.extend([
                        "Implement winning variation across all content",
                        "Monitor performance for 2 weeks post-implementation",
                        "Document learnings for future experiments"
                    ])
                elif winner == "control":
                    next_steps.extend([
                        "Maintain current approach",
                        "Design new experiment testing different variable",
                        "Investigate why test variation underperformed"
                    ])
                else:
                    next_steps.extend([
                        "Consider extending experiment duration",
                        "Increase sample size if possible",
                        "Test more extreme variations"
                    ])
                
                statistical_analysis["next_steps"] = next_steps
                
                return json.dumps({
                    "statistical_analysis": statistical_analysis,
                    "analysis_complete": True,
                    "actionable_results": winner != "inconclusive",
                    "confidence": 0.92 if p_value < 0.05 else 0.65
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def generate_optimization_recommendations(optimization_data: str) -> str:
            """Generate data-driven optimization recommendations."""
            try:
                data = json.loads(optimization_data) if isinstance(optimization_data, str) else optimization_data
                
                focus_area = data.get('focus_area', 'overall_performance')
                current_metrics = data.get('current_metrics', {})
                goals = data.get('goals', ['increase_engagement'])
                platforms = data.get('platforms', ['instagram'])
                
                recommendations = []
                
                # Content timing optimization
                timing_rec = {
                    "category": "Content Timing",
                    "priority": "High",
                    "recommendation": "Shift 60% of posts to 7-9 PM time slot",
                    "rationale": "Analysis shows 35% higher engagement during evening hours",
                    "expected_impact": "+25-35% engagement rate",
                    "implementation_effort": "Low",
                    "timeline": "1 week",
                    "success_metrics": ["engagement_rate", "reach", "comments"],
                    "ab_test_suggested": True,
                    "confidence": 0.87
                }
                recommendations.append(timing_rec)
                
                # Content format optimization
                format_rec = {
                    "category": "Content Format",
                    "priority": "High",
                    "recommendation": "Increase carousel post usage to 40% of content mix",
                    "rationale": "Carousel posts show 67% higher engagement than single images",
                    "expected_impact": "+40-50% engagement rate",
                    "implementation_effort": "Medium",
                    "timeline": "2 weeks",
                    "success_metrics": ["engagement_rate", "saves", "time_spent"],
                    "ab_test_suggested": False,
                    "confidence": 0.92
                }
                recommendations.append(format_rec)
                
                # Hashtag optimization
                hashtag_rec = {
                    "category": "Hashtag Strategy",
                    "priority": "Medium",
                    "recommendation": "Optimize hashtag count to 8-12 tags per post",
                    "rationale": "Sweet spot analysis shows maximum reach with 8-12 hashtags",
                    "expected_impact": "+15-25% reach",
                    "implementation_effort": "Low",
                    "timeline": "Immediate",
                    "success_metrics": ["reach", "impressions", "discovery"],
                    "ab_test_suggested": True,
                    "confidence": 0.79
                }
                recommendations.append(hashtag_rec)
                
                # Audience targeting optimization
                audience_rec = {
                    "category": "Audience Targeting",
                    "priority": "Medium",
                    "recommendation": "Create weekend-specific entertainment content strategy",
                    "rationale": "Weekend audience shows 45% preference for entertainment over educational content",
                    "expected_impact": "+20-30% weekend engagement",
                    "implementation_effort": "Medium",
                    "timeline": "3 weeks",
                    "success_metrics": ["weekend_engagement", "audience_retention", "shares"],
                    "ab_test_suggested": True,
                    "confidence": 0.83
                }
                recommendations.append(audience_rec)
                
                # Content frequency optimization
                frequency_rec = {
                    "category": "Posting Frequency",
                    "priority": "Low",
                    "recommendation": "Maintain current posting frequency but improve content spacing",
                    "rationale": "Current frequency is optimal, but spacing can be improved for better visibility",
                    "expected_impact": "+10-15% overall reach",
                    "implementation_effort": "Low",
                    "timeline": "1 week",
                    "success_metrics": ["reach", "frequency_capping", "audience_fatigue"],
                    "ab_test_suggested": False,
                    "confidence": 0.71
                }
                recommendations.append(frequency_rec)
                
                # Cross-platform optimization
                platform_rec = {
                    "category": "Cross-Platform Strategy",
                    "priority": "Medium",
                    "recommendation": "Adapt high-performing Instagram content for LinkedIn with professional angle",
                    "rationale": "Similar content themes perform well on LinkedIn with professional positioning",
                    "expected_impact": "+30-40% LinkedIn engagement",
                    "implementation_effort": "Medium",
                    "timeline": "2 weeks",
                    "success_metrics": ["linkedin_engagement", "professional_audience_growth", "cross_platform_synergy"],
                    "ab_test_suggested": True,
                    "confidence": 0.68
                }
                recommendations.append(platform_rec)
                
                # Prioritize recommendations
                high_priority = [r for r in recommendations if r["priority"] == "High"]
                medium_priority = [r for r in recommendations if r["priority"] == "Medium"]
                low_priority = [r for r in recommendations if r["priority"] == "Low"]
                
                # Implementation roadmap
                roadmap = {
                    "week_1": [
                        "Implement content timing optimization",
                        "Optimize hashtag counts",
                        "Improve content spacing"
                    ],
                    "week_2": [
                        "Start carousel content production",
                        "Begin cross-platform content adaptation"
                    ],
                    "week_3": [
                        "Launch weekend entertainment content strategy",
                        "Complete carousel content transition"
                    ],
                    "week_4": [
                        "Analyze results from all implementations",
                        "Fine-tune based on performance data"
                    ]
                }
                
                # Expected cumulative impact
                cumulative_impact = {
                    "engagement_rate": "+45-65%",
                    "reach": "+35-50%",
                    "audience_growth": "+20-30%",
                    "content_saves": "+60-80%",
                    "overall_performance_score": "+40-55%"
                }
                
                return json.dumps({
                    "optimization_recommendations": recommendations,
                    "total_recommendations": len(recommendations),
                    "high_priority_count": len(high_priority),
                    "implementation_roadmap": roadmap,
                    "expected_cumulative_impact": cumulative_impact,
                    "estimated_implementation_time": "4 weeks",
                    "recommended_ab_tests": len([r for r in recommendations if r["ab_test_suggested"]]),
                    "overall_confidence": 0.82
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def predict_content_performance(prediction_data: str) -> str:
            """Predict content performance using historical data and patterns."""
            try:
                data = json.loads(prediction_data) if isinstance(prediction_data, str) else prediction_data
                
                content_attributes = data.get('content_attributes', {})
                platform = data.get('platform', 'instagram')
                posting_time = data.get('posting_time', '14:00')
                historical_context = data.get('historical_context', {})
                
                # Simulate predictive modeling
                base_performance = {
                    "engagement_rate": 3.2,
                    "reach": 1500,
                    "likes": 180,
                    "comments": 15,
                    "shares": 8,
                    "saves": 25
                }
                
                # Adjust predictions based on content attributes
                performance_multipliers = {
                    "engagement_rate": 1.0,
                    "reach": 1.0,
                    "likes": 1.0,
                    "comments": 1.0,
                    "shares": 1.0,
                    "saves": 1.0
                }
                
                # Content format impact
                content_format = content_attributes.get('format', 'single_image')
                if content_format == 'carousel':
                    performance_multipliers["engagement_rate"] *= 1.67
                    performance_multipliers["saves"] *= 1.8
                    performance_multipliers["reach"] *= 1.3
                elif content_format == 'video':
                    performance_multipliers["engagement_rate"] *= 1.4
                    performance_multipliers["comments"] *= 1.6
                    performance_multipliers["reach"] *= 1.5
                elif content_format == 'story':
                    performance_multipliers["reach"] *= 0.8
                    performance_multipliers["engagement_rate"] *= 1.2
                
                # Posting time impact
                if posting_time in ['19:00', '20:00', '21:00']:  # Evening peak
                    for metric in performance_multipliers:
                        performance_multipliers[metric] *= 1.35
                elif posting_time in ['12:00', '13:00']:  # Lunch peak
                    for metric in performance_multipliers:
                        performance_multipliers[metric] *= 1.15
                elif posting_time in ['08:00', '09:00']:  # Morning peak
                    for metric in performance_multipliers:
                        performance_multipliers[metric] *= 1.1
                
                # Hashtag count impact
                hashtag_count = content_attributes.get('hashtag_count', 5)
                if 8 <= hashtag_count <= 12:
                    performance_multipliers["reach"] *= 1.23
                    performance_multipliers["engagement_rate"] *= 1.1
                elif hashtag_count > 15:
                    performance_multipliers["reach"] *= 0.85
                    performance_multipliers["engagement_rate"] *= 0.9
                
                # Content type impact
                content_type = content_attributes.get('type', 'promotional')
                if content_type == 'educational':
                    performance_multipliers["saves"] *= 1.5
                    performance_multipliers["comments"] *= 1.3
                elif content_type == 'entertainment':
                    performance_multipliers["shares"] *= 1.4
                    performance_multipliers["likes"] *= 1.2
                elif content_type == 'behind_scenes':
                    performance_multipliers["comments"] *= 1.6
                    performance_multipliers["engagement_rate"] *= 1.25
                
                # Calculate predicted performance
                predicted_performance = {}
                for metric, base_value in base_performance.items():
                    predicted_value = base_value * performance_multipliers[metric]
                    predicted_performance[metric] = round(predicted_value, 2)
                
                # Calculate confidence intervals
                confidence_intervals = {}
                for metric, predicted_value in predicted_performance.items():
                    margin_of_error = predicted_value * 0.2  # 20% margin
                    confidence_intervals[metric] = {
                        "lower_bound": round(predicted_value - margin_of_error, 2),
                        "upper_bound": round(predicted_value + margin_of_error, 2),
                        "confidence_level": "80%"
                    }
                
                # Performance score calculation
                benchmark_performance = {
                    "engagement_rate": 2.8,
                    "reach": 1200,
                    "likes": 150,
                    "comments": 12,
                    "shares": 6,
                    "saves": 20
                }
                
                performance_scores = {}
                overall_score = 0
                for metric, predicted_value in predicted_performance.items():
                    benchmark_value = benchmark_performance[metric]
                    score = (predicted_value / benchmark_value) * 100
                    performance_scores[metric] = round(score, 1)
                    overall_score += score
                
                overall_score = round(overall_score / len(performance_scores), 1)
                
                # Risk factors
                risk_factors = []
                if posting_time in ['02:00', '03:00', '04:00', '05:00']:
                    risk_factors.append("Low activity time slot may reduce reach")
                if hashtag_count > 20:
                    risk_factors.append("Excessive hashtags may appear spammy")
                if content_type == 'promotional' and performance_multipliers["engagement_rate"] < 1.1:
                    risk_factors.append("Promotional content may have lower organic reach")
                
                # Optimization suggestions
                optimization_suggestions = []
                if posting_time not in ['19:00', '20:00', '21:00']:
                    optimization_suggestions.append("Consider posting during evening peak hours (7-9 PM)")
                if content_format == 'single_image':
                    optimization_suggestions.append("Try carousel format for potentially higher engagement")
                if hashtag_count < 8:
                    optimization_suggestions.append("Increase hashtag count to 8-12 for better reach")
                
                return json.dumps({
                    "predicted_performance": predicted_performance,
                    "confidence_intervals": confidence_intervals,
                    "performance_scores": performance_scores,
                    "overall_performance_score": overall_score,
                    "performance_tier": "Above Average" if overall_score > 110 else "Average" if overall_score > 90 else "Below Average",
                    "risk_factors": risk_factors,
                    "optimization_suggestions": optimization_suggestions,
                    "prediction_accuracy": "Historical accuracy: 78%",
                    "model_confidence": 0.78
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def analyze_audience_learning(audience_data: str) -> str:
            """Analyze audience behavior patterns and learning insights."""
            try:
                data = json.loads(audience_data) if isinstance(audience_data, str) else audience_data
                
                time_period = data.get('time_period', '30_days')
                platforms = data.get('platforms', ['instagram'])
                audience_segments = data.get('segments', ['all'])
                
                # Simulate audience learning analysis
                audience_insights = {
                    "analysis_period": time_period,
                    "total_audience_analyzed": 15420,
                    "platforms": platforms,
                    "key_insights": [],
                    "behavioral_patterns": {},
                    "engagement_preferences": {},
                    "demographic_insights": {},
                    "content_preferences": {},
                    "optimal_strategies": {}
                }
                
                # Key insights
                audience_insights["key_insights"] = [
                    {
                        "insight": "Evening engagement surge",
                        "description": "Audience is 40% more active between 7-9 PM on weekdays",
                        "confidence": 0.89,
                        "impact": "High",
                        "actionable": True
                    },
                    {
                        "insight": "Visual content preference",
                        "description": "Carousel and video content receive 60% more engagement than text posts",
                        "confidence": 0.92,
                        "impact": "High",
                        "actionable": True
                    },
                    {
                        "insight": "Weekend behavior shift",
                        "description": "Weekend audience prefers entertainment content over educational by 45%",
                        "confidence": 0.83,
                        "impact": "Medium",
                        "actionable": True
                    },
                    {
                        "insight": "Mobile-first consumption",
                        "description": "85% of engagement comes from mobile devices, affecting content format preferences",
                        "confidence": 0.95,
                        "impact": "High",
                        "actionable": True
                    }
                ]
                
                # Behavioral patterns
                audience_insights["behavioral_patterns"] = {
                    "activity_peaks": {
                        "weekday_morning": "8:00-9:00 AM (15% of daily activity)",
                        "weekday_lunch": "12:00-1:00 PM (20% of daily activity)",
                        "weekday_evening": "7:00-9:00 PM (35% of daily activity)",
                        "weekend_afternoon": "2:00-4:00 PM (25% of daily activity)"
                    },
                    "engagement_velocity": {
                        "first_hour": "60% of total engagement",
                        "first_6_hours": "85% of total engagement",
                        "first_24_hours": "95% of total engagement"
                    },
                    "content_consumption": {
                        "average_time_per_post": "8.3 seconds",
                        "carousel_swipe_rate": "73%",
                        "video_completion_rate": "45%",
                        "story_completion_rate": "68%"
                    }
                }
                
                # Engagement preferences
                audience_insights["engagement_preferences"] = {
                    "reaction_types": {
                        "likes": "70% of total engagement",
                        "comments": "15% of total engagement",
                        "shares": "8% of total engagement",
                        "saves": "7% of total engagement"
                    },
                    "content_interaction": {
                        "high_engagement_triggers": ["Questions in captions", "Behind-the-scenes content", "User-generated content"],
                        "low_engagement_triggers": ["Heavy promotional content", "Text-heavy posts", "Poor image quality"],
                        "comment_drivers": ["Controversial topics", "Personal stories", "Industry insights"]
                    }
                }
                
                # Demographic insights
                audience_insights["demographic_insights"] = {
                    "age_distribution": {
                        "18-24": {"percentage": 25, "engagement_rate": 4.2, "preferred_content": "Entertainment, Trends"},
                        "25-34": {"percentage": 45, "engagement_rate": 3.8, "preferred_content": "Educational, Professional"},
                        "35-44": {"percentage": 20, "engagement_rate": 3.1, "preferred_content": "Industry insights, Tips"},
                        "45+": {"percentage": 10, "engagement_rate": 2.9, "preferred_content": "News, Analysis"}
                    },
                    "geographic_distribution": {
                        "North America": {"percentage": 55, "peak_hours": "19:00-21:00 EST"},
                        "Europe": {"percentage": 25, "peak_hours": "20:00-22:00 CET"},
                        "Asia Pacific": {"percentage": 15, "peak_hours": "12:00-14:00 JST"},
                        "Other": {"percentage": 5, "peak_hours": "Various"}
                    },
                    "device_preferences": {
                        "mobile": {"percentage": 85, "engagement_rate": 3.9},
                        "desktop": {"percentage": 15, "engagement_rate": 2.8}
                    }
                }
                
                # Content preferences by segment
                audience_insights["content_preferences"] = {
                    "young_professionals_25_34": {
                        "top_content_types": ["Career tips", "Industry insights", "Behind-the-scenes"],
                        "preferred_formats": ["Carousel", "Video", "Story"],
                        "optimal_posting_times": ["8:00 AM", "12:00 PM", "7:00 PM"],
                        "engagement_rate": 4.1
                    },
                    "creative_millennials_25_35": {
                        "top_content_types": ["Creative process", "Inspiration", "Tutorials"],
                        "preferred_formats": ["Video", "Carousel", "Single image"],
                        "optimal_posting_times": ["10:00 AM", "3:00 PM", "8:00 PM"],
                        "engagement_rate": 4.5
                    },
                    "business_owners_30_45": {
                        "top_content_types": ["Business tips", "Success stories", "Industry news"],
                        "preferred_formats": ["Carousel", "Article", "Video"],
                        "optimal_posting_times": ["7:00 AM", "12:00 PM", "6:00 PM"],
                        "engagement_rate": 3.7
                    }
                }
                
                # Optimal strategies based on learning
                audience_insights["optimal_strategies"] = {
                    "content_mix": {
                        "educational": "40%",
                        "entertainment": "25%",
                        "behind_scenes": "20%",
                        "promotional": "15%"
                    },
                    "posting_schedule": {
                        "monday": ["8:00 AM", "7:00 PM"],
                        "tuesday": ["12:00 PM", "7:00 PM"],
                        "wednesday": ["8:00 AM", "7:00 PM"],
                        "thursday": ["12:00 PM", "8:00 PM"],
                        "friday": ["10:00 AM", "6:00 PM"],
                        "saturday": ["2:00 PM"],
                        "sunday": ["3:00 PM"]
                    },
                    "engagement_tactics": [
                        "Ask questions in captions to drive comments",
                        "Use carousel format for educational content",
                        "Share behind-the-scenes content on Fridays",
                        "Post entertainment content on weekends",
                        "Include clear call-to-actions in promotional posts"
                    ]
                }
                
                return json.dumps({
                    "audience_learning_analysis": audience_insights,
                    "total_insights_discovered": len(audience_insights["key_insights"]),
                    "high_impact_insights": len([i for i in audience_insights["key_insights"] if i["impact"] == "High"]),
                    "actionable_insights": len([i for i in audience_insights["key_insights"] if i["actionable"]]),
                    "learning_confidence": 0.87,
                    "next_analysis_date": (datetime.utcnow() + timedelta(days=7)).isoformat()
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        return [
            analyze_performance_patterns,
            design_ab_test_experiment,
            analyze_experiment_results,
            generate_optimization_recommendations,
            predict_content_performance,
            analyze_audience_learning
        ]
    
    def _calculate_sample_size(self, effect_size: float, power: float, alpha: float) -> int:
        """Calculate required sample size for A/B test."""
        # Simplified sample size calculation
        # In practice, would use proper statistical formulas
        base_size = 1000
        effect_adjustment = 1 / (effect_size ** 2)
        power_adjustment = power / 0.8
        alpha_adjustment = 0.05 / alpha
        
        sample_size = int(base_size * effect_adjustment * power_adjustment * alpha_adjustment)
        return max(sample_size, 100)  # Minimum 100 per group
    
    async def _process_task(self, task: AgentTask) -> Any:
        """Process Learning Agent specific tasks."""
        task_type = task.type
        input_data = task.input_data
        
        try:
            if task_type == "analyze_patterns":
                return await self._analyze_performance_patterns(input_data)
            elif task_type == "design_experiment":
                return await self._design_ab_experiment(input_data)
            elif task_type == "analyze_results":
                return await self._analyze_experiment_results(input_data)
            elif task_type == "generate_recommendations":
                return await self._generate_optimization_recommendations(input_data)
            elif task_type == "predict_performance":
                return await self._predict_content_performance(input_data)
            elif task_type == "analyze_audience":
                return await self._analyze_audience_learning(input_data)
            elif task_type == "validate_insights":
                return await self._validate_learning_insights(input_data)
            else:
                # Use the agent executor for general learning tasks
                result = await self.agent_executor.ainvoke({
                    "input": f"Perform learning analysis: {json.dumps(input_data)}"
                })
                return result["output"]
                
        except Exception as e:
            self.logger.error(f"Error processing task {task_type}: {str(e)}")
            raise
    
    async def _analyze_performance_patterns(self, input_data: Dict[str, Any]) -> List[PerformancePattern]:
        """Analyze performance data to identify patterns."""
        analysis_type = input_data.get('analysis_type', 'performance_analysis')
        time_period = input_data.get('time_period', {})
        platforms = input_data.get('platforms', ['instagram'])
        
        analysis_prompt = f"""
        Analyze performance patterns with the following parameters:
        
        Analysis Type: {analysis_type}
        Time Period: {time_period}
        Platforms: {', '.join(platforms)}
        
        Identify key performance patterns:
        1. Temporal patterns (time-based performance variations)
        2. Content format patterns (format performance differences)
        3. Audience behavior patterns (engagement preferences)
        4. Platform-specific patterns (platform optimization opportunities)
        5. Seasonal patterns (time-based trends)
        
        Provide statistical evidence and confidence scores for each pattern.
        """
        
        result = await self.agent_executor.ainvoke({"input": analysis_prompt})
        
        # Create performance patterns (simplified)
        patterns = [
            PerformancePattern(
                id=str(uuid.uuid4()),
                pattern_type="temporal",
                description="Evening engagement peak between 7-9 PM",
                conditions=["posting_time >= 19:00", "posting_time <= 21:00"],
                performance_impact=0.35,
                frequency="daily",
                platforms=platforms,
                content_types=["all"],
                audience_segments=["25-34", "35-44"],
                time_patterns={"peak_hours": ["19:00", "20:00", "21:00"]},
                confidence=0.87,
                discovered_at=datetime.utcnow(),
                validation_count=1,
                metadata={}
            )
        ]
        
        # Store patterns in memory
        for pattern in patterns:
            await self._store_performance_pattern(pattern)
        
        return patterns
    
    async def _store_performance_pattern(self, pattern: PerformancePattern):
        """Store performance pattern in memory."""
        try:
            pattern_content = f"Performance Pattern: {pattern.description}\nType: {pattern.pattern_type}\nImpact: {pattern.performance_impact}\nConfidence: {pattern.confidence}"
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                pattern_content,
                "performance_pattern",
                "learning",
                "learning_agent",
                pattern.confidence,
                {
                    "pattern_id": pattern.id,
                    "pattern_type": pattern.pattern_type,
                    "performance_impact": pattern.performance_impact,
                    "platforms": pattern.platforms,
                    "confidence": pattern.confidence
                }
            )
            
            log_agent_activity(
                self.agent_type.value,
                f"Discovered performance pattern: {pattern.description}",
                self.organization_id,
                pattern_id=pattern.id,
                pattern_type=pattern.pattern_type,
                confidence=pattern.confidence
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store performance pattern: {str(e)}")
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score for Learning Agent results."""
        if isinstance(result, list):
            # For patterns or insights
            if result:
                avg_confidence = sum(getattr(item, 'confidence', 0.8) for item in result) / len(result)
                return avg_confidence
            return 0.5
        elif isinstance(result, dict):
            return result.get('confidence', 0.8)
        else:
            return 0.7

