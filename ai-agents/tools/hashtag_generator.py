import json
import re
from typing import List, Dict, Any
from ..utils.logger import logger

class HashtagGeneratorTool:
    def __init__(self):
        logger.info("HashtagGeneratorTool initialized")
        self.trending_hashtags = {
            "general": ["#socialmedia", "#marketing", "#business", "#digital", "#content"],
            "tech": ["#technology", "#innovation", "#AI", "#digitaltransformation", "#startup"],
            "lifestyle": ["#lifestyle", "#inspiration", "#motivation", "#wellness", "#fitness"]
        }

    def generate_hashtags(self, content: str, category: str = "general", count: int = 5) -> Dict[str, Any]:
        try:
            # Extract keywords from content
            keywords = self.extract_keywords(content)
            
            # Get trending hashtags for category
            trending = self.trending_hashtags.get(category, self.trending_hashtags["general"])
            
            # Generate hashtags
            hashtags = []
            
            # Add keyword-based hashtags
            for keyword in keywords[:count//2]:
                hashtag = f"#{keyword.replace(' ', '')}"
                hashtags.append(hashtag)
            
            # Add trending hashtags
            for hashtag in trending[:count-len(hashtags)]:
                hashtags.append(hashtag)
            
            return {
                "success": True,
                "hashtags": hashtags[:count],
                "category": category,
                "keywords": keywords
            }
        except Exception as e:
            logger.error(f"Error generating hashtags: {e}")
            return {"success": False, "error": str(e)}

    def extract_keywords(self, content: str) -> List[str]:
        # Simple keyword extraction
        words = re.findall(r'\b\w+\b', content.lower())
        # Filter out common words
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        keywords = [word for word in words if word not in stop_words and len(word) > 3]
        return keywords[:10]

    def run(self, method: str, **kwargs) -> Any:
        if method == "generate_hashtags":
            return self.generate_hashtags(**kwargs)
        else:
            raise ValueError(f"Unknown method: {method}")

if __name__ == "__main__":
    generator = HashtagGeneratorTool()
    result = generator.run("generate_hashtags", content="Amazing new product launch!", category="tech", count=5)
    print(json.dumps(result, indent=2))