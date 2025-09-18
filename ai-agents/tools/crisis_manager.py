import json
from datetime import datetime
from typing import List, Dict, Any
from ..utils.logger import logger

class CrisisManagerTool:
    def __init__(self):
        logger.info("CrisisManagerTool initialized")

    def detect_crisis(self, content: str, sentiment_score: float) -> Dict[str, Any]:
        try:
            crisis_indicators = []
            crisis_level = "low"
            
            # Check for negative sentiment
            if sentiment_score < -0.5:
                crisis_indicators.append("Very negative sentiment detected")
                crisis_level = "high"
            elif sentiment_score < -0.2:
                crisis_indicators.append("Negative sentiment detected")
                crisis_level = "medium"
            
            # Check for crisis keywords
            crisis_keywords = ["crisis", "scandal", "boycott", "outrage", "controversy"]
            content_lower = content.lower()
            for keyword in crisis_keywords:
                if keyword in content_lower:
                    crisis_indicators.append(f"Crisis keyword '{keyword}' detected")
                    crisis_level = "high"
            
            return {
                "success": True,
                "crisis_detected": len(crisis_indicators) > 0,
                "crisis_level": crisis_level,
                "indicators": crisis_indicators,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error detecting crisis: {e}")
            return {"success": False, "error": str(e)}

    def generate_crisis_response(self, crisis_type: str, severity: str) -> Dict[str, Any]:
        try:
            response_templates = {
                "negative_sentiment": {
                    "low": "We appreciate your feedback and are working to improve our services.",
                    "medium": "We understand your concerns and are taking immediate action to address this issue.",
                    "high": "We sincerely apologize for this situation and are implementing comprehensive measures to resolve it."
                },
                "controversy": {
                    "low": "We value all perspectives and are committed to open dialogue.",
                    "medium": "We acknowledge the concerns raised and are reviewing our approach.",
                    "high": "We take this matter seriously and are conducting a thorough investigation."
                }
            }
            
            response = response_templates.get(crisis_type, {}).get(severity, "We are aware of the situation and are taking appropriate action.")
            
            return {
                "success": True,
                "response": response,
                "recommended_actions": [
                    "Monitor social media mentions",
                    "Prepare official statement",
                    "Engage with affected users directly",
                    "Review and update policies if needed"
                ]
            }
        except Exception as e:
            logger.error(f"Error generating crisis response: {e}")
            return {"success": False, "error": str(e)}

    def monitor_brand_mentions(self, brand_name: str) -> Dict[str, Any]:
        try:
            # Simulate brand mention monitoring
            mentions = {
                "brand": brand_name,
                "total_mentions": 150,
                "positive_mentions": 120,
                "negative_mentions": 20,
                "neutral_mentions": 10,
                "sentiment_score": 0.6,
                "top_platforms": ["twitter", "instagram", "facebook"],
                "last_updated": datetime.now().isoformat()
            }
            
            return {"success": True, "mentions": mentions}
        except Exception as e:
            logger.error(f"Error monitoring brand mentions: {e}")
            return {"success": False, "error": str(e)}

    def run(self, method: str, **kwargs) -> Any:
        if method == "detect_crisis":
            return self.detect_crisis(**kwargs)
        elif method == "generate_crisis_response":
            return self.generate_crisis_response(**kwargs)
        elif method == "monitor_brand_mentions":
            return self.monitor_brand_mentions(**kwargs)
        else:
            raise ValueError(f"Unknown method: {method}")

if __name__ == "__main__":
    crisis_manager = CrisisManagerTool()
    result = crisis_manager.run("detect_crisis", 
                              content="This is a terrible product!", 
                              sentiment_score=-0.8)
    print(json.dumps(result, indent=2))