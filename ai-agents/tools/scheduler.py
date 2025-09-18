import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..utils.logger import logger

class SchedulerTool:
    def __init__(self):
        logger.info("SchedulerTool initialized")

    def schedule_post(self, content: str, platforms: List[str], scheduled_time: str) -> Dict[str, Any]:
        try:
            scheduled_dt = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
            now = datetime.now(scheduled_dt.tzinfo)
            
            if scheduled_dt <= now:
                return {"success": False, "error": "Scheduled time must be in the future"}
            
            return {
                "success": True,
                "scheduled_time": scheduled_dt.isoformat(),
                "platforms": platforms,
                "content": content
            }
        except Exception as e:
            logger.error(f"Error scheduling post: {e}")
            return {"success": False, "error": str(e)}

    def get_optimal_times(self, platform: str) -> List[Dict[str, Any]]:
        optimal_times = {
            "facebook": [
                {"day": "Tuesday", "time": "13:00", "engagement": 0.85},
                {"day": "Wednesday", "time": "10:00", "engagement": 0.82}
            ],
            "instagram": [
                {"day": "Wednesday", "time": "11:00", "engagement": 0.88},
                {"day": "Tuesday", "time": "10:00", "engagement": 0.85}
            ],
            "twitter": [
                {"day": "Wednesday", "time": "12:00", "engagement": 0.80},
                {"day": "Tuesday", "time": "09:00", "engagement": 0.78}
            ]
        }
        return optimal_times.get(platform, [])

    def run(self, method: str, **kwargs) -> Any:
        if method == "schedule_post":
            return self.schedule_post(**kwargs)
        elif method == "get_optimal_times":
            return self.get_optimal_times(**kwargs)
        else:
            raise ValueError(f"Unknown method: {method}")

if __name__ == "__main__":
    scheduler = SchedulerTool()
    result = scheduler.run("schedule_post", 
                         content="Test post", 
                         platforms=["facebook"], 
                         scheduled_time="2024-01-01T10:00:00Z")
    print(json.dumps(result, indent=2))