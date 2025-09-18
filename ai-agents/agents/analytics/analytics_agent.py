import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import uuid
from dataclasses import dataclass
from enum import Enum
import statistics
import math

from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import BaseTool, tool
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.base_agent import BaseAgent, AgentTask, AgentResponse
from config.settings import AgentType, get_platform_config
from memory.chroma_manager import chroma_manager
from utils.logger import get_agent_logger, log_agent_activity

class ReportType(str, Enum):
    PERFORMANCE_SUMMARY = "performance_summary"
    ENGAGEMENT_ANALYSIS = "engagement_analysis"
    ROI_ANALYSIS = "roi_analysis"
    AUDIENCE_INSIGHTS = "audience_insights"
    CONTENT_PERFORMANCE = "content_performance"
    COMPETITIVE_ANALYSIS = "competitive_analysis"
    TREND_ANALYSIS = "trend_analysis"
    CUSTOM_DASHBOARD = "custom_dashboard"
    PREDICTIVE_ANALYTICS = "predictive_analytics"
    BUSINESS_INTELLIGENCE = "business_intelligence"

class MetricType(str, Enum):
    ENGAGEMENT_RATE = "engagement_rate"
    REACH = "reach"
    IMPRESSIONS = "impressions"
    CLICKS = "clicks"
    CONVERSIONS = "conversions"
    REVENUE = "revenue"
    COST_PER_ACQUISITION = "cpa"
    RETURN_ON_INVESTMENT = "roi"
    BRAND_AWARENESS = "brand_awareness"
    SENTIMENT_SCORE = "sentiment_score"

@dataclass
class AnalyticsReport:
    """Represents a comprehensive analytics report."""
    id: str
    report_type: ReportType
    title: str
    description: str
    time_period: Dict[str, str]
    platforms: List[str]
    metrics: Dict[str, Any]
    insights: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    visualizations: List[Dict[str, Any]]
    executive_summary: str
    confidence: float
    generated_at: datetime
    metadata: Dict[str, Any]

class AnalyticsAgent(BaseAgent):
    """Analytics Agent for advanced reporting and metrics generation."""
    
    def __init__(self, organization_id: str):
        super().__init__(AgentType.ANALYTICS, organization_id)
        self.custom_dashboards = []
        self.report_templates = {}
        self.predictive_models = {}
        self.data_sources = {}
        
    async def _create_agent_prompt(self) -> ChatPromptTemplate:
        """Create the Analytics Agent's system prompt."""
        system_prompt = """You are an AI Analytics Agent specialized in advanced reporting, data analysis, and business intelligence for social media marketing.

Your primary responsibilities:
1. Generate comprehensive analytics reports and insights
2. Create custom dashboards and data visualizations
3. Perform predictive analytics and forecasting
4. Analyze ROI and business performance metrics
5. Provide competitive analysis and benchmarking
6. Identify trends and patterns in social media data
7. Generate actionable recommendations based on data
8. Create executive summaries and business intelligence reports

Key capabilities:
- Advanced statistical analysis and data modeling
- Multi-platform performance comparison and analysis
- ROI calculation and business impact measurement
- Predictive modeling and trend forecasting
- Custom report generation with visualizations
- Real-time dashboard creation and management
- Competitive benchmarking and market analysis
- Audience segmentation and behavioral analysis

Analytics Framework:
1. Data Collection and Validation
2. Statistical Analysis and Trend Detection
3. Visualization and Reporting
4. Insights and Recommendations

Report Types:
- Performance Summary Reports
- Engagement Analysis Reports
- ROI Analysis Reports
- Audience Insights Reports
- Content Performance Reports
- Competitive Analysis Reports
- Trend Analysis Reports
- Predictive Analytics

Key Metrics and KPIs:
- Engagement Metrics (rates, reach, impressions)
- Growth Metrics (follower growth, retention)
- Business Metrics (conversion, CPA, ROAS, CLV)
- Quality Metrics (content quality, sentiment)

Remember: Focus on providing clear, actionable insights that drive business decisions."""

        return ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
    
    async def _initialize_tools(self) -> List[BaseTool]:
        """Initialize Analytics Agent specific tools."""
        
        @tool
        def generate_performance_report(report_data: str) -> str:
            """Generate comprehensive performance analytics report."""
            try:
                data = json.loads(report_data) if isinstance(report_data, str) else report_data
                
                time_period = data.get('time_period', {'start': '2024-01-01', 'end': '2024-01-31'})
                platforms = data.get('platforms', ['instagram', 'facebook', 'twitter'])
                
                performance_report = {
                    "report_id": str(uuid.uuid4()),
                    "report_type": "performance_summary",
                    "title": f"Social Media Performance Report - {time_period['start']} to {time_period['end']}",
                    "time_period": time_period,
                    "platforms_analyzed": platforms,
                    "executive_summary": {},
                    "key_metrics": {},
                    "platform_breakdown": {},
                    "trends_and_insights": [],
                    "recommendations": []
                }
                
                # Simulate comprehensive performance data
                total_reach = 125000
                total_impressions = 450000
                total_engagements = 18500
                
                overall_engagement_rate = (total_engagements / total_reach) * 100
                
                performance_report["key_metrics"] = {
                    "total_reach": {
                        "value": total_reach,
                        "change_from_previous": "+12.5%",
                        "trend": "increasing"
                    },
                    "engagement_rate": {
                        "value": round(overall_engagement_rate, 2),
                        "change_from_previous": "+2.1%",
                        "trend": "increasing"
                    }
                }
                
                performance_report["platform_breakdown"] = {
                    "instagram": {"reach": 65000, "engagement_rate": 16.2},
                    "facebook": {"reach": 35000, "engagement_rate": 12.8},
                    "twitter": {"reach": 25000, "engagement_rate": 9.4}
                }
                
                performance_report["trends_and_insights"] = [
                    {
                        "insight": "Instagram carousel posts drive 40% higher engagement",
                        "impact": "High",
                        "confidence": 0.92
                    }
                ]
                
                performance_report["recommendations"] = [
                    {
                        "category": "Content Strategy",
                        "recommendation": "Increase carousel post frequency on Instagram by 50%",
                        "expected_impact": "+8% overall engagement rate",
                        "priority": "High"
                    }
                ]
                
                return json.dumps({
                    "performance_report": performance_report,
                    "report_generated": True,
                    "confidence": 0.89
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def create_custom_dashboard(dashboard_data: str) -> str:
            """Create custom analytics dashboard with specified widgets."""
            try:
                data = json.loads(dashboard_data) if isinstance(dashboard_data, str) else dashboard_data
                
                dashboard_name = data.get('dashboard_name', 'Custom Analytics Dashboard')
                widgets = data.get('widgets', [])
                
                custom_dashboard = {
                    "dashboard_id": str(uuid.uuid4()),
                    "name": dashboard_name,
                    "created_at": datetime.now().isoformat(),
                    "widgets": [],
                    "features": {
                        "real_time_updates": True,
                        "export_options": ["PDF", "Excel", "PNG"],
                        "mobile_responsive": True
                    }
                }
                
                # Create default widgets if none specified
                if not widgets:
                    widgets = [
                        {"type": "engagement_overview", "size": "large"},
                        {"type": "reach_trends", "size": "medium"},
                        {"type": "platform_comparison", "size": "large"}
                    ]
                
                for i, widget_config in enumerate(widgets):
                    widget_type = widget_config.get('type', 'metric_card')
                    
                    if widget_type == "engagement_overview":
                        widget = {
                            "id": f"widget_{i+1}",
                            "type": "engagement_overview",
                            "title": "Engagement Overview",
                            "data": {
                                "total_engagements": 18500,
                                "engagement_rate": 14.8,
                                "change_from_previous": "+12.3%"
                            }
                        }
                    elif widget_type == "reach_trends":
                        widget = {
                            "id": f"widget_{i+1}",
                            "type": "reach_trends",
                            "title": "Reach Trends (30 Days)",
                            "data": {
                                "average_reach": 3693,
                                "growth_rate": "+8.5%"
                            }
                        }
                    else:
                        widget = {
                            "id": f"widget_{i+1}",
                            "type": "metric_card",
                            "title": "Custom Metric",
                            "data": {"value": 0}
                        }
                    
                    custom_dashboard["widgets"].append(widget)
                
                return json.dumps({
                    "custom_dashboard": custom_dashboard,
                    "dashboard_created": True,
                    "confidence": 0.92
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        @tool
        def generate_roi_analysis(roi_data: str) -> str:
            """Generate comprehensive ROI and business impact analysis."""
            try:
                data = json.loads(roi_data) if isinstance(roi_data, str) else roi_data
                
                investment = data.get('total_investment', 15000)
                total_revenue = 45000
                
                roi_analysis = {
                    "analysis_id": str(uuid.uuid4()),
                    "total_investment": investment,
                    "total_revenue": total_revenue,
                    "roi_metrics": {},
                    "platform_roi": {},
                    "recommendations": []
                }
                
                total_roi = ((total_revenue - investment) / investment) * 100
                roas = total_revenue / investment
                
                roi_analysis["roi_metrics"] = {
                    "return_on_investment": {
                        "percentage": round(total_roi, 1),
                        "ratio": f"1:{round(roas, 2)}"
                    },
                    "return_on_ad_spend": {
                        "value": round(roas, 2)
                    }
                }
                
                roi_analysis["platform_roi"] = {
                    "instagram": {"investment": 6000, "revenue": 22000, "roi_percentage": 266.7},
                    "facebook": {"investment": 5500, "revenue": 15000, "roi_percentage": 172.7},
                    "twitter": {"investment": 3500, "revenue": 8000, "roi_percentage": 128.6}
                }
                
                roi_analysis["recommendations"] = [
                    {
                        "category": "Budget Allocation",
                        "recommendation": "Increase Instagram budget by 25% due to highest ROI",
                        "expected_impact": "+$8,000 monthly revenue",
                        "priority": "High"
                    }
                ]
                
                return json.dumps({
                    "roi_analysis": roi_analysis,
                    "analysis_complete": True,
                    "confidence": 0.88
                })
                
            except Exception as e:
                return json.dumps({"error": str(e), "confidence": 0.0})
        
        return [
            generate_performance_report,
            create_custom_dashboard,
            generate_roi_analysis
        ]
    
    async def _process_task(self, task: AgentTask) -> Any:
        """Process Analytics Agent specific tasks."""
        task_type = task.type
        input_data = task.input_data
        
        try:
            if task_type == "generate_report":
                return await self._generate_analytics_report(input_data)
            elif task_type == "create_dashboard":
                return await self._create_custom_dashboard(input_data)
            elif task_type == "roi_analysis":
                return await self._analyze_roi(input_data)
            else:
                result = await self.agent_executor.ainvoke({
                    "input": f"Generate analytics for: {json.dumps(input_data)}"
                })
                return result["output"]
                
        except Exception as e:
            self.logger.error(f"Error processing task {task_type}: {str(e)}")
            raise
    
    async def _generate_analytics_report(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive analytics report."""
        report_type = input_data.get('report_type', 'performance_summary')
        time_period = input_data.get('time_period', {'start': '2024-01-01', 'end': '2024-01-31'})
        
        report_prompt = f"""
        Generate a comprehensive {report_type} analytics report for the period {time_period['start']} to {time_period['end']}.
        
        Include:
        1. Executive summary with key findings
        2. Detailed metrics analysis
        3. Platform-specific insights
        4. Actionable recommendations
        """
        
        result = await self.agent_executor.ainvoke({"input": report_prompt})
        
        await self._store_analytics_report(report_type, result["output"], time_period)
        
        return {"report": result["output"], "confidence": 0.87}
    
    async def _store_analytics_report(self, report_type: str, report_content: str, time_period: Dict[str, str]):
        """Store analytics report in memory."""
        try:
            report_summary = f"Analytics Report\nType: {report_type}\nPeriod: {time_period['start']} to {time_period['end']}\nContent: {report_content}"
            
            await chroma_manager.store_knowledge(
                self.organization_id,
                report_summary,
                "analytics_report",
                "analytics",
                "analytics_agent",
                0.9,
                {
                    "report_type": report_type,
                    "time_period": f"{time_period['start']}_to_{time_period['end']}"
                }
            )
            
            log_agent_activity(
                self.agent_type.value,
                f"Generated {report_type} report",
                self.organization_id,
                report_type=report_type
            )
            
        except Exception as e:
            self.logger.warning(f"Failed to store analytics report: {str(e)}")
    
    def _calculate_confidence(self, result: Any) -> float:
        """Calculate confidence score for Analytics Agent results."""
        if isinstance(result, dict):
            return result.get('confidence', 0.85)
        elif isinstance(result, str):
            if len(result) > 500:
                return 0.88
            else:
                return 0.75
        else:
            return 0.80
