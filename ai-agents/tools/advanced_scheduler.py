import asyncio
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
from dataclasses import dataclass
from utils.logger import logger

class ScheduleType(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    HOURLY = "hourly"
    CUSTOM = "custom"

@dataclass
class ScheduledTask:
    id: str
    name: str
    schedule_type: ScheduleType
    schedule_time: str  # "HH:MM" format
    schedule_day: Optional[str] = None  # For weekly/monthly
    agent_type: str = "strategy"
    task_data: Dict[str, Any] = None
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    created_at: datetime = None

class AdvancedScheduler:
    def __init__(self, coordinator_callback: Callable = None):
        self.scheduled_tasks: List[ScheduledTask] = []
        self.running = False
        self.coordinator_callback = coordinator_callback
        self.task_counter = 0
        
        # Initialize default scheduled tasks
        self._initialize_default_tasks()
    
    def _initialize_default_tasks(self):
        """Initialize default automated tasks"""
        current_time = datetime.now()
        
        # Daily Analytics Processing (11 PM daily)
        self.add_scheduled_task(
            name="Daily Analytics Processing",
            schedule_type=ScheduleType.DAILY,
            schedule_time="23:00",
            agent_type="analytics",
            task_data={
                "type": "daily_analytics",
                "action": "process_daily_metrics",
                "generate_report": True
            }
        )
        
        # Weekly Performance Reports (Sunday 9 AM)
        self.add_scheduled_task(
            name="Weekly Performance Reports",
            schedule_type=ScheduleType.WEEKLY,
            schedule_time="09:00",
            schedule_day="sunday",
            agent_type="analytics",
            task_data={
                "type": "weekly_report",
                "action": "generate_performance_report",
                "include_recommendations": True
            }
        )
        
        # Content Calendar Refresh (Monday 8 AM)
        self.add_scheduled_task(
            name="Content Calendar Refresh",
            schedule_type=ScheduleType.WEEKLY,
            schedule_time="08:00",
            schedule_day="monday",
            agent_type="content",
            task_data={
                "type": "content_refresh",
                "action": "update_content_calendar",
                "generate_ideas": True
            }
        )
        
        # Trend Analysis (Every 6 hours)
        self.add_scheduled_task(
            name="Trend Analysis",
            schedule_type=ScheduleType.HOURLY,
            schedule_time="06:00",  # Every 6 hours
            agent_type="intelligence",
            task_data={
                "type": "trend_analysis",
                "action": "analyze_trends",
                "platforms": ["instagram", "twitter", "linkedin", "facebook"]
            }
        )
        
        # Engagement Monitoring (Every 2 hours)
        self.add_scheduled_task(
            name="Engagement Monitoring",
            schedule_type=ScheduleType.HOURLY,
            schedule_time="02:00",  # Every 2 hours
            agent_type="engagement",
            task_data={
                "type": "engagement_monitoring",
                "action": "monitor_engagement",
                "respond_to_comments": True
            }
        )
        
        # Learning Agent Optimization (Daily 1 AM)
        self.add_scheduled_task(
            name="Learning Agent Optimization",
            schedule_type=ScheduleType.DAILY,
            schedule_time="01:00",
            agent_type="learning",
            task_data={
                "type": "optimization",
                "action": "analyze_performance",
                "update_recommendations": True
            }
        )
        
        # Monthly Strategy Review (1st of month, 10 AM)
        self.add_scheduled_task(
            name="Monthly Strategy Review",
            schedule_type=ScheduleType.MONTHLY,
            schedule_time="10:00",
            schedule_day="01",  # 1st of month
            agent_type="strategy",
            task_data={
                "type": "monthly_review",
                "action": "review_strategy_performance",
                "suggest_improvements": True
            }
        )
    
    def add_scheduled_task(self, name: str, schedule_type: ScheduleType, 
                          schedule_time: str, agent_type: str = "strategy",
                          schedule_day: Optional[str] = None,
                          task_data: Dict[str, Any] = None) -> str:
        """Add a new scheduled task"""
        task_id = f"scheduled_{self.task_counter}_{name.lower().replace(' ', '_')}"
        self.task_counter += 1
        
        task = ScheduledTask(
            id=task_id,
            name=name,
            schedule_type=schedule_type,
            schedule_time=schedule_time,
            schedule_day=schedule_day,
            agent_type=agent_type,
            task_data=task_data or {},
            created_at=datetime.now()
        )
        
        # Calculate next run time
        task.next_run = self._calculate_next_run(task)
        
        self.scheduled_tasks.append(task)
        logger.info(f"Added scheduled task: {name} (ID: {task_id})")
        return task_id
    
    def _calculate_next_run(self, task: ScheduledTask) -> datetime:
        """Calculate the next run time for a task"""
        now = datetime.now()
        hour, minute = map(int, task.schedule_time.split(':'))
        
        if task.schedule_type == ScheduleType.DAILY:
            next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            if next_run <= now:
                next_run += timedelta(days=1)
            return next_run
            
        elif task.schedule_type == ScheduleType.WEEKLY:
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            target_day = days.index(task.schedule_day.lower()) if task.schedule_day else 0
            
            # Calculate days until target day
            days_ahead = target_day - now.weekday()
            if days_ahead <= 0:  # Target day already passed this week
                days_ahead += 7
            
            next_run = now + timedelta(days=days_ahead)
            next_run = next_run.replace(hour=hour, minute=minute, second=0, microsecond=0)
            return next_run
            
        elif task.schedule_type == ScheduleType.MONTHLY:
            day = int(task.schedule_day) if task.schedule_day else 1
            next_run = now.replace(day=day, hour=hour, minute=minute, second=0, microsecond=0)
            if next_run <= now:
                # Move to next month
                if now.month == 12:
                    next_run = next_run.replace(year=now.year + 1, month=1)
                else:
                    next_run = next_run.replace(month=now.month + 1)
            return next_run
            
        elif task.schedule_type == ScheduleType.HOURLY:
            # For hourly tasks, schedule_time represents the interval in hours
            interval_hours = int(task.schedule_time.split(':')[0])
            next_run = now + timedelta(hours=interval_hours)
            return next_run
        
        return now + timedelta(minutes=1)  # Default fallback
    
    async def start(self):
        """Start the scheduler"""
        logger.info("Starting Advanced Scheduler...")
        self.running = True
        
        # Start the main scheduling loop
        asyncio.create_task(self._scheduling_loop())
        logger.info("Advanced Scheduler started successfully")
    
    async def stop(self):
        """Stop the scheduler"""
        logger.info("Stopping Advanced Scheduler...")
        self.running = False
        logger.info("Advanced Scheduler stopped")
    
    async def _scheduling_loop(self):
        """Main scheduling loop"""
        while self.running:
            try:
                now = datetime.now()
                
                # Check for tasks that need to run
                for task in self.scheduled_tasks:
                    if not task.enabled:
                        continue
                        
                    if task.next_run and now >= task.next_run:
                        logger.info(f"Executing scheduled task: {task.name}")
                        
                        # Execute the task
                        await self._execute_scheduled_task(task)
                        
                        # Update task status
                        task.last_run = now
                        task.next_run = self._calculate_next_run(task)
                        
                        logger.info(f"Scheduled task {task.name} completed. Next run: {task.next_run}")
                
                # Sleep for 1 minute before next check
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Error in scheduling loop: {e}")
                await asyncio.sleep(60)
    
    async def _execute_scheduled_task(self, task: ScheduledTask):
        """Execute a scheduled task"""
        try:
            if self.coordinator_callback:
                # Submit task to coordinator
                task_id = await self.coordinator_callback(
                    agent_type=task.agent_type,
                    data=task.task_data,
                    priority="medium",
                    scheduled=True
                )
                logger.info(f"Scheduled task {task.name} submitted to coordinator (ID: {task_id})")
            else:
                logger.warning(f"No coordinator callback available for task: {task.name}")
                
        except Exception as e:
            logger.error(f"Error executing scheduled task {task.name}: {e}")
    
    def get_scheduled_tasks(self) -> List[Dict[str, Any]]:
        """Get all scheduled tasks"""
        return [
            {
                "id": task.id,
                "name": task.name,
                "schedule_type": task.schedule_type.value,
                "schedule_time": task.schedule_time,
                "schedule_day": task.schedule_day,
                "agent_type": task.agent_type,
                "enabled": task.enabled,
                "last_run": task.last_run.isoformat() if task.last_run else None,
                "next_run": task.next_run.isoformat() if task.next_run else None,
                "created_at": task.created_at.isoformat() if task.created_at else None
            }
            for task in self.scheduled_tasks
        ]
    
    def enable_task(self, task_id: str) -> bool:
        """Enable a scheduled task"""
        for task in self.scheduled_tasks:
            if task.id == task_id:
                task.enabled = True
                task.next_run = self._calculate_next_run(task)
                logger.info(f"Enabled scheduled task: {task.name}")
                return True
        return False
    
    def disable_task(self, task_id: str) -> bool:
        """Disable a scheduled task"""
        for task in self.scheduled_tasks:
            if task.id == task_id:
                task.enabled = False
                task.next_run = None
                logger.info(f"Disabled scheduled task: {task.name}")
                return True
        return False
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a scheduled task"""
        for i, task in enumerate(self.scheduled_tasks):
            if task.id == task_id:
                del self.scheduled_tasks[i]
                logger.info(f"Deleted scheduled task: {task.name}")
                return True
        return False

# Global scheduler instance
scheduler = AdvancedScheduler()

if __name__ == "__main__":
    # Test the scheduler
    async def test_scheduler():
        scheduler_instance = AdvancedScheduler()
        await scheduler_instance.start()
        
        # Keep running for testing
        await asyncio.sleep(300)  # Run for 5 minutes
        
        await scheduler_instance.stop()
    
    asyncio.run(test_scheduler())
