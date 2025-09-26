import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..utils.logger import logger

class PerformanceTrackerTool:
    def __init__(self):
        logger.info("PerformanceTrackerTool initialized")

    def track_metrics(self, post_id: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        try:
            tracked_metrics = {
                "post_id": post_id,
                "timestamp": datetime.now().isoformat(),
                "likes": metrics.get("likes", 0),
                "shares": metrics.get("shares", 0),
                "comments": metrics.get("comments", 0),
                "views": metrics.get("views", 0),
                "engagement_rate": self.calculate_engagement_rate(metrics)
            }
            
            logger.info(f"Tracked metrics for post {post_id}: {tracked_metrics}")
            return {"success": True, "metrics": tracked_metrics}
        except Exception as e:
            logger.error(f"Error tracking metrics: {e}")
            return {"success": False, "error": str(e)}

    def calculate_engagement_rate(self, metrics: Dict[str, Any]) -> float:
        likes = metrics.get("likes", 0)
        shares = metrics.get("shares", 0)
        comments = metrics.get("comments", 0)
        views = metrics.get("views", 0)
        
        if views == 0:
            return 0.0
        
        engagement = likes + shares + comments
        return round((engagement / views) * 100, 2)

    def get_performance_summary(self, posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            total_posts = len(posts)
            total_engagement = sum(post.get("engagement_rate", 0) for post in posts)
            avg_engagement = total_engagement / total_posts if total_posts > 0 else 0
            
            best_post = max(posts, key=lambda x: x.get("engagement_rate", 0)) if posts else None
            
            return {
                "success": True,
                "summary": {
                    "total_posts": total_posts,
                    "average_engagement": round(avg_engagement, 2),
                    "best_post": best_post
                }
            }
        except Exception as e:
            logger.error(f"Error calculating performance summary: {e}")
            return {"success": False, "error": str(e)}

    def run(self, method: str, **kwargs) -> Any:
        if method == "track_metrics":
            return self.track_metrics(**kwargs)
        elif method == "get_performance_summary":
            return self.get_performance_summary(**kwargs)
        else:
            raise ValueError(f"Unknown method: {method}")

if __name__ == "__main__":
    tracker = PerformanceTrackerTool()
    result = tracker.run("track_metrics", 
                        post_id="123", 
                        metrics={"likes": 100, "shares": 20, "comments": 15, "views": 1000})
    print(json.dumps(result, indent=2))