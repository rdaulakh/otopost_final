import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
from dataclasses import dataclass
from utils.logger import logger

class MetricType(Enum):
    ENGAGEMENT_RATE = "engagement_rate"
    REACH = "reach"
    IMPRESSIONS = "impressions"
    CLICKS = "clicks"
    CONVERSIONS = "conversions"
    FOLLOWERS = "followers"
    COMMENTS = "comments"
    LIKES = "likes"
    SHARES = "shares"
    SENTIMENT = "sentiment"

@dataclass
class MetricThreshold:
    metric_type: MetricType
    platform: str
    threshold_value: float
    threshold_type: str  # "above", "below", "equals"
    severity: str  # "low", "medium", "high", "critical"
    enabled: bool = True

@dataclass
class PerformanceData:
    platform: str
    metric_type: MetricType
    value: float
    timestamp: datetime
    metadata: Dict[str, Any] = None

class PerformanceMonitor:
    def __init__(self, coordinator_callback: Callable = None):
        self.thresholds: List[MetricThreshold] = []
        self.performance_data: List[PerformanceData] = []
        self.running = False
        self.coordinator_callback = coordinator_callback
        
        # Initialize default thresholds
        self._initialize_default_thresholds()
    
    def _initialize_default_thresholds(self):
        """Initialize default performance thresholds"""
        
        # Engagement Rate Thresholds
        self.add_threshold(
            metric_type=MetricType.ENGAGEMENT_RATE,
            platform="instagram",
            threshold_value=2.0,
            threshold_type="below",
            severity="high"
        )
        
        self.add_threshold(
            metric_type=MetricType.ENGAGEMENT_RATE,
            platform="facebook",
            threshold_value=1.5,
            threshold_type="below",
            severity="high"
        )
        
        self.add_threshold(
            metric_type=MetricType.ENGAGEMENT_RATE,
            platform="twitter",
            threshold_value=1.0,
            threshold_type="below",
            severity="high"
        )
        
        self.add_threshold(
            metric_type=MetricType.ENGAGEMENT_RATE,
            platform="linkedin",
            threshold_value=1.2,
            threshold_type="below",
            severity="high"
        )
        
        # High Engagement Thresholds
        self.add_threshold(
            metric_type=MetricType.ENGAGEMENT_RATE,
            platform="instagram",
            threshold_value=8.0,
            threshold_type="above",
            severity="medium"
        )
        
        # Reach Thresholds
        self.add_threshold(
            metric_type=MetricType.REACH,
            platform="instagram",
            threshold_value=1000,
            threshold_type="below",
            severity="medium"
        )
        
        self.add_threshold(
            metric_type=MetricType.REACH,
            platform="facebook",
            threshold_value=500,
            threshold_type="below",
            severity="medium"
        )
        
        # Conversion Rate Thresholds
        self.add_threshold(
            metric_type=MetricType.CONVERSIONS,
            platform="instagram",
            threshold_value=0.5,
            threshold_type="below",
            severity="critical"
        )
        
        # Sentiment Thresholds
        self.add_threshold(
            metric_type=MetricType.SENTIMENT,
            platform="instagram",
            threshold_value=-0.5,
            threshold_type="below",
            severity="critical"
        )
        
        # Follower Growth Thresholds
        self.add_threshold(
            metric_type=MetricType.FOLLOWERS,
            platform="instagram",
            threshold_value=-10,  # Negative growth
            threshold_type="below",
            severity="high"
        )
    
    def add_threshold(self, metric_type: MetricType, platform: str, 
                     threshold_value: float, threshold_type: str, 
                     severity: str) -> str:
        """Add a new performance threshold"""
        threshold_id = f"threshold_{metric_type.value}_{platform}_{threshold_type}"
        
        threshold = MetricThreshold(
            metric_type=metric_type,
            platform=platform,
            threshold_value=threshold_value,
            threshold_type=threshold_type,
            severity=severity
        )
        
        self.thresholds.append(threshold)
        logger.info(f"Added threshold: {metric_type.value} {threshold_type} {threshold_value} for {platform}")
        return threshold_id
    
    async def start(self):
        """Start the performance monitor"""
        logger.info("Starting Performance Monitor...")
        self.running = True
        
        # Start the main monitoring loop
        asyncio.create_task(self._monitoring_loop())
        logger.info("Performance Monitor started successfully")
    
    async def stop(self):
        """Stop the performance monitor"""
        logger.info("Stopping Performance Monitor...")
        self.running = False
        logger.info("Performance Monitor stopped")
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                # Collect performance data
                await self._collect_performance_data()
                
                # Check thresholds
                await self._check_thresholds()
                
                # Clean up old data
                await self._cleanup_old_data()
                
                # Sleep for 5 minutes before next check
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(300)
    
    async def _collect_performance_data(self):
        """Collect performance data from various sources"""
        # In a real implementation, this would collect data from:
        # - Social media APIs
        # - Analytics platforms
        # - Database queries
        # - External monitoring services
        
        # For now, simulate data collection
        platforms = ["instagram", "facebook", "twitter", "linkedin"]
        metric_types = [
            MetricType.ENGAGEMENT_RATE,
            MetricType.REACH,
            MetricType.IMPRESSIONS,
            MetricType.CONVERSIONS,
            MetricType.SENTIMENT,
            MetricType.FOLLOWERS
        ]
        
        import random
        
        for platform in platforms:
            for metric_type in metric_types:
                # Simulate realistic data
                if metric_type == MetricType.ENGAGEMENT_RATE:
                    value = random.uniform(0.5, 15.0)
                elif metric_type == MetricType.REACH:
                    value = random.uniform(100, 50000)
                elif metric_type == MetricType.IMPRESSIONS:
                    value = random.uniform(500, 100000)
                elif metric_type == MetricType.CONVERSIONS:
                    value = random.uniform(0.1, 8.0)
                elif metric_type == MetricType.SENTIMENT:
                    value = random.uniform(-1.0, 1.0)
                elif metric_type == MetricType.FOLLOWERS:
                    value = random.uniform(-50, 200)  # Daily change
                else:
                    value = random.uniform(0, 1000)
                
                data = PerformanceData(
                    platform=platform,
                    metric_type=metric_type,
                    value=value,
                    timestamp=datetime.now(),
                    metadata={
                        "source": "simulated",
                        "confidence": random.uniform(0.8, 1.0)
                    }
                )
                
                self.performance_data.append(data)
    
    async def _check_thresholds(self):
        """Check performance data against thresholds"""
        current_time = datetime.now()
        recent_data = [
            data for data in self.performance_data
            if (current_time - data.timestamp).total_seconds() < 3600  # Last hour
        ]
        
        for threshold in self.thresholds:
            if not threshold.enabled:
                continue
                
            # Find relevant data
            relevant_data = [
                data for data in recent_data
                if (data.platform == threshold.platform and 
                    data.metric_type == threshold.metric_type)
            ]
            
            if not relevant_data:
                continue
            
            # Calculate average value
            avg_value = sum(data.value for data in relevant_data) / len(relevant_data)
            
            # Check threshold
            threshold_breached = False
            
            if threshold.threshold_type == "below" and avg_value < threshold.threshold_value:
                threshold_breached = True
            elif threshold.threshold_type == "above" and avg_value > threshold.threshold_value:
                threshold_breached = True
            elif threshold.threshold_type == "equals" and avg_value == threshold.threshold_value:
                threshold_breached = True
            
            if threshold_breached:
                logger.warning(f"Threshold breached: {threshold.metric_type.value} {threshold.threshold_type} {threshold.threshold_value} on {threshold.platform} (actual: {avg_value:.2f})")
                
                # Trigger action
                await self._trigger_threshold_action(threshold, avg_value, relevant_data)
    
    async def _trigger_threshold_action(self, threshold: MetricThreshold, 
                                      current_value: float, data: List[PerformanceData]):
        """Trigger action when threshold is breached"""
        try:
            if self.coordinator_callback:
                task_data = {
                    "type": "threshold_breach",
                    "metric_type": threshold.metric_type.value,
                    "platform": threshold.platform,
                    "threshold_value": threshold.threshold_value,
                    "current_value": current_value,
                    "threshold_type": threshold.threshold_type,
                    "severity": threshold.severity,
                    "data_points": len(data),
                    "time_range": "1_hour"
                }
                
                # Determine agent type based on metric type
                agent_type = self._get_agent_type_for_metric(threshold.metric_type)
                
                # Determine priority based on severity
                priority = self._get_priority_for_severity(threshold.severity)
                
                task_id = await self.coordinator_callback(
                    agent_type=agent_type,
                    data=task_data,
                    priority=priority,
                    threshold_triggered=True
                )
                
                logger.info(f"Threshold action triggered: {threshold.metric_type.value} on {threshold.platform} (Task ID: {task_id})")
            else:
                logger.warning(f"No coordinator callback available for threshold breach: {threshold.metric_type.value}")
                
        except Exception as e:
            logger.error(f"Error triggering threshold action: {e}")
    
    def _get_agent_type_for_metric(self, metric_type: MetricType) -> str:
        """Get appropriate agent type for metric type"""
        if metric_type in [MetricType.ENGAGEMENT_RATE, MetricType.LIKES, MetricType.COMMENTS, MetricType.SHARES]:
            return "engagement"
        elif metric_type in [MetricType.REACH, MetricType.IMPRESSIONS, MetricType.CONVERSIONS]:
            return "analytics"
        elif metric_type == MetricType.SENTIMENT:
            return "crisis_manager"
        elif metric_type == MetricType.FOLLOWERS:
            return "content"
        else:
            return "analytics"
    
    def _get_priority_for_severity(self, severity: str) -> str:
        """Get priority level for severity"""
        severity_map = {
            "low": "low",
            "medium": "medium",
            "high": "high",
            "critical": "critical"
        }
        return severity_map.get(severity, "medium")
    
    async def _cleanup_old_data(self):
        """Clean up old performance data"""
        cutoff_time = datetime.now() - timedelta(days=7)  # Keep 7 days of data
        
        self.performance_data = [
            data for data in self.performance_data
            if data.timestamp > cutoff_time
        ]
    
    def add_performance_data(self, platform: str, metric_type: MetricType, 
                           value: float, metadata: Dict[str, Any] = None):
        """Add performance data manually"""
        data = PerformanceData(
            platform=platform,
            metric_type=metric_type,
            value=value,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        
        self.performance_data.append(data)
        logger.info(f"Added performance data: {metric_type.value} = {value} for {platform}")
    
    def get_performance_summary(self, platform: str = None, 
                              metric_type: MetricType = None,
                              hours: int = 24) -> Dict[str, Any]:
        """Get performance summary"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(hours=hours)
        
        filtered_data = [
            data for data in self.performance_data
            if (data.timestamp > cutoff_time and
                (platform is None or data.platform == platform) and
                (metric_type is None or data.metric_type == metric_type))
        ]
        
        if not filtered_data:
            return {"message": "No data available for the specified criteria"}
        
        # Group by platform and metric type
        summary = {}
        for data in filtered_data:
            key = f"{data.platform}_{data.metric_type.value}"
            if key not in summary:
                summary[key] = {
                    "platform": data.platform,
                    "metric_type": data.metric_type.value,
                    "values": [],
                    "count": 0
                }
            
            summary[key]["values"].append(data.value)
            summary[key]["count"] += 1
        
        # Calculate statistics
        for key, data in summary.items():
            values = data["values"]
            data["average"] = sum(values) / len(values)
            data["min"] = min(values)
            data["max"] = max(values)
            data["latest"] = values[-1] if values else 0
            del data["values"]  # Remove raw values to save space
        
        return summary
    
    def get_thresholds(self) -> List[Dict[str, Any]]:
        """Get all thresholds"""
        return [
            {
                "metric_type": threshold.metric_type.value,
                "platform": threshold.platform,
                "threshold_value": threshold.threshold_value,
                "threshold_type": threshold.threshold_type,
                "severity": threshold.severity,
                "enabled": threshold.enabled
            }
            for threshold in self.thresholds
        ]

# Global performance monitor instance
performance_monitor = PerformanceMonitor()

if __name__ == "__main__":
    # Test the performance monitor
    async def test_performance_monitor():
        monitor = PerformanceMonitor()
        await monitor.start()
        
        # Add some test data
        monitor.add_performance_data("instagram", MetricType.ENGAGEMENT_RATE, 1.2)
        monitor.add_performance_data("facebook", MetricType.ENGAGEMENT_RATE, 0.8)
        
        # Keep running for testing
        await asyncio.sleep(300)  # Run for 5 minutes
        
        await monitor.stop()
    
    asyncio.run(test_performance_monitor())
