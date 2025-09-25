import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
from dataclasses import dataclass
from utils.logger import logger

class EventType(Enum):
    ENGAGEMENT_DROP = "engagement_drop"
    NEW_COMMENT = "new_comment"
    NEW_MESSAGE = "new_message"
    COMPETITOR_POST = "competitor_post"
    TRENDING_HASHTAG = "trending_hashtag"
    PERFORMANCE_THRESHOLD = "performance_threshold"
    CRISIS_DETECTED = "crisis_detected"
    HIGH_ENGAGEMENT = "high_engagement"
    CONTENT_APPROVAL_NEEDED = "content_approval_needed"

@dataclass
class Event:
    id: str
    event_type: EventType
    platform: str
    data: Dict[str, Any]
    timestamp: datetime
    severity: str = "medium"  # low, medium, high, critical
    processed: bool = False

@dataclass
class EventRule:
    id: str
    event_type: EventType
    conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    enabled: bool = True
    cooldown_minutes: int = 5  # Prevent spam

class EventListener:
    def __init__(self, coordinator_callback: Callable = None):
        self.events: List[Event] = []
        self.rules: List[EventRule] = []
        self.running = False
        self.coordinator_callback = coordinator_callback
        self.event_counter = 0
        self.last_processed: Dict[str, datetime] = {}
        
        # Initialize default event rules
        self._initialize_default_rules()
    
    def _initialize_default_rules(self):
        """Initialize default event rules"""
        
        # Engagement Drop Rule
        self.add_event_rule(
            event_type=EventType.ENGAGEMENT_DROP,
            conditions={
                "engagement_rate_threshold": 2.0,  # Below 2%
                "time_window_hours": 24,
                "platforms": ["instagram", "facebook", "twitter", "linkedin"]
            },
            actions=[
                {
                    "agent_type": "analytics",
                    "action": "analyze_engagement_drop",
                    "priority": "high"
                },
                {
                    "agent_type": "content",
                    "action": "suggest_engagement_boost",
                    "priority": "medium"
                }
            ]
        )
        
        # New Comment Rule
        self.add_event_rule(
            event_type=EventType.NEW_COMMENT,
            conditions={
                "platforms": ["instagram", "facebook", "twitter", "linkedin"],
                "sentiment_threshold": -0.5,  # Negative sentiment
                "response_required": True
            },
            actions=[
                {
                    "agent_type": "engagement",
                    "action": "respond_to_comment",
                    "priority": "high"
                }
            ]
        )
        
        # High Engagement Rule
        self.add_event_rule(
            event_type=EventType.HIGH_ENGAGEMENT,
            conditions={
                "engagement_rate_threshold": 8.0,  # Above 8%
                "time_window_hours": 2,
                "platforms": ["instagram", "facebook", "twitter", "linkedin"]
            },
            actions=[
                {
                    "agent_type": "analytics",
                    "action": "analyze_high_engagement",
                    "priority": "medium"
                },
                {
                    "agent_type": "content",
                    "action": "replicate_successful_content",
                    "priority": "low"
                }
            ]
        )
        
        # Crisis Detection Rule
        self.add_event_rule(
            event_type=EventType.CRISIS_DETECTED,
            conditions={
                "negative_sentiment_threshold": -0.8,
                "mention_volume_threshold": 10,
                "time_window_hours": 1
            },
            actions=[
                {
                    "agent_type": "crisis_manager",
                    "action": "handle_crisis",
                    "priority": "critical"
                },
                {
                    "agent_type": "engagement",
                    "action": "crisis_response",
                    "priority": "critical"
                }
            ]
        )
        
        # Trending Hashtag Rule
        self.add_event_rule(
            event_type=EventType.TRENDING_HASHTAG,
            conditions={
                "hashtag_volume_threshold": 1000,
                "growth_rate_threshold": 50,  # 50% growth in 1 hour
                "relevance_score_threshold": 0.7
            },
            actions=[
                {
                    "agent_type": "intelligence",
                    "action": "analyze_trending_hashtag",
                    "priority": "medium"
                },
                {
                    "agent_type": "content",
                    "action": "create_trending_content",
                    "priority": "high"
                }
            ]
        )
        
        # Performance Threshold Rule
        self.add_event_rule(
            event_type=EventType.PERFORMANCE_THRESHOLD,
            conditions={
                "kpi_thresholds": {
                    "reach": {"below": 1000, "above": 10000},
                    "engagement_rate": {"below": 1.0, "above": 10.0},
                    "conversion_rate": {"below": 0.5, "above": 5.0}
                }
            },
            actions=[
                {
                    "agent_type": "analytics",
                    "action": "analyze_performance_threshold",
                    "priority": "medium"
                },
                {
                    "agent_type": "learning",
                    "action": "optimize_based_on_threshold",
                    "priority": "medium"
                }
            ]
        )
    
    def add_event_rule(self, event_type: EventType, conditions: Dict[str, Any], 
                      actions: List[Dict[str, Any]], cooldown_minutes: int = 5) -> str:
        """Add a new event rule"""
        rule_id = f"rule_{self.event_counter}_{event_type.value}"
        self.event_counter += 1
        
        rule = EventRule(
            id=rule_id,
            event_type=event_type,
            conditions=conditions,
            actions=actions,
            cooldown_minutes=cooldown_minutes
        )
        
        self.rules.append(rule)
        logger.info(f"Added event rule: {event_type.value} (ID: {rule_id})")
        return rule_id
    
    async def start(self):
        """Start the event listener"""
        logger.info("Starting Event Listener...")
        self.running = True
        
        # Start the main event processing loop
        asyncio.create_task(self._event_processing_loop())
        logger.info("Event Listener started successfully")
    
    async def stop(self):
        """Stop the event listener"""
        logger.info("Stopping Event Listener...")
        self.running = False
        logger.info("Event Listener stopped")
    
    async def _event_processing_loop(self):
        """Main event processing loop"""
        while self.running:
            try:
                # Process pending events
                await self._process_pending_events()
                
                # Simulate event detection (in real implementation, this would be from external sources)
                await self._simulate_event_detection()
                
                # Sleep for 30 seconds before next check
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Error in event processing loop: {e}")
                await asyncio.sleep(30)
    
    async def _process_pending_events(self):
        """Process pending events"""
        for event in self.events:
            if event.processed:
                continue
                
            # Check cooldown
            rule_key = f"{event.event_type.value}_{event.platform}"
            if rule_key in self.last_processed:
                time_diff = datetime.now() - self.last_processed[rule_key]
                if time_diff.total_seconds() < 300:  # 5 minutes cooldown
                    continue
            
            # Find matching rules
            matching_rules = [
                rule for rule in self.rules
                if rule.enabled and rule.event_type == event.event_type
            ]
            
            for rule in matching_rules:
                if self._evaluate_conditions(event, rule.conditions):
                    logger.info(f"Processing event: {event.event_type.value} with rule: {rule.id}")
                    
                    # Execute actions
                    await self._execute_actions(event, rule.actions)
                    
                    # Mark event as processed
                    event.processed = True
                    self.last_processed[rule_key] = datetime.now()
                    
                    break
    
    def _evaluate_conditions(self, event: Event, conditions: Dict[str, Any]) -> bool:
        """Evaluate if event matches conditions"""
        try:
            # Platform check
            if "platforms" in conditions:
                if event.platform not in conditions["platforms"]:
                    return False
            
            # Time window check
            if "time_window_hours" in conditions:
                time_threshold = datetime.now() - timedelta(hours=conditions["time_window_hours"])
                if event.timestamp < time_threshold:
                    return False
            
            # Engagement rate check
            if "engagement_rate_threshold" in conditions:
                engagement_rate = event.data.get("engagement_rate", 0)
                threshold = conditions["engagement_rate_threshold"]
                if event.event_type == EventType.ENGAGEMENT_DROP:
                    if engagement_rate >= threshold:
                        return False
                elif event.event_type == EventType.HIGH_ENGAGEMENT:
                    if engagement_rate <= threshold:
                        return False
            
            # Sentiment check
            if "sentiment_threshold" in conditions:
                sentiment = event.data.get("sentiment", 0)
                threshold = conditions["sentiment_threshold"]
                if sentiment >= threshold:  # For negative sentiment
                    return False
            
            # Volume check
            if "mention_volume_threshold" in conditions:
                volume = event.data.get("mention_volume", 0)
                if volume < conditions["mention_volume_threshold"]:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error evaluating conditions: {e}")
            return False
    
    async def _execute_actions(self, event: Event, actions: List[Dict[str, Any]]):
        """Execute actions for an event"""
        for action in actions:
            try:
                if self.coordinator_callback:
                    task_data = {
                        "type": action["action"],
                        "event_type": event.event_type.value,
                        "platform": event.platform,
                        "event_data": event.data,
                        "severity": event.severity
                    }
                    
                    task_id = await self.coordinator_callback(
                        agent_type=action["agent_type"],
                        data=task_data,
                        priority=action.get("priority", "medium"),
                        event_triggered=True
                    )
                    
                    logger.info(f"Event action executed: {action['action']} (Task ID: {task_id})")
                else:
                    logger.warning(f"No coordinator callback available for action: {action['action']}")
                    
            except Exception as e:
                logger.error(f"Error executing action {action['action']}: {e}")
    
    async def _simulate_event_detection(self):
        """Simulate event detection (replace with real event sources)"""
        # This would be replaced with actual event detection from:
        # - Social media APIs
        # - Analytics platforms
        # - Monitoring services
        # - Webhooks
        
        # For now, simulate some events occasionally
        import random
        
        if random.random() < 0.1:  # 10% chance every 30 seconds
            event_types = [
                EventType.NEW_COMMENT,
                EventType.HIGH_ENGAGEMENT,
                EventType.TRENDING_HASHTAG
            ]
            
            event_type = random.choice(event_types)
            platforms = ["instagram", "facebook", "twitter", "linkedin"]
            platform = random.choice(platforms)
            
            event_data = {
                "engagement_rate": random.uniform(1.0, 15.0),
                "sentiment": random.uniform(-1.0, 1.0),
                "mention_volume": random.randint(1, 100),
                "hashtag_volume": random.randint(100, 10000)
            }
            
            await self.trigger_event(event_type, platform, event_data)
    
    async def trigger_event(self, event_type: EventType, platform: str, data: Dict[str, Any]):
        """Trigger an event manually"""
        event_id = f"event_{self.event_counter}_{event_type.value}"
        self.event_counter += 1
        
        event = Event(
            id=event_id,
            event_type=event_type,
            platform=platform,
            data=data,
            timestamp=datetime.now(),
            severity="medium"
        )
        
        self.events.append(event)
        logger.info(f"Event triggered: {event_type.value} on {platform}")
    
    def get_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent events"""
        recent_events = sorted(
            self.events, 
            key=lambda x: x.timestamp, 
            reverse=True
        )[:limit]
        
        return [
            {
                "id": event.id,
                "event_type": event.event_type.value,
                "platform": event.platform,
                "data": event.data,
                "timestamp": event.timestamp.isoformat(),
                "severity": event.severity,
                "processed": event.processed
            }
            for event in recent_events
        ]
    
    def get_event_rules(self) -> List[Dict[str, Any]]:
        """Get all event rules"""
        return [
            {
                "id": rule.id,
                "event_type": rule.event_type.value,
                "conditions": rule.conditions,
                "actions": rule.actions,
                "enabled": rule.enabled,
                "cooldown_minutes": rule.cooldown_minutes
            }
            for rule in self.rules
        ]

# Global event listener instance
event_listener = EventListener()

if __name__ == "__main__":
    # Test the event listener
    async def test_event_listener():
        listener = EventListener()
        await listener.start()
        
        # Trigger some test events
        await listener.trigger_event(
            EventType.HIGH_ENGAGEMENT,
            "instagram",
            {"engagement_rate": 12.5, "likes": 1500, "comments": 89}
        )
        
        # Keep running for testing
        await asyncio.sleep(300)  # Run for 5 minutes
        
        await listener.stop()
    
    asyncio.run(test_event_listener())
