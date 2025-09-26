import json
from ..utils.logger import logger

class SentimentAnalyzerTool:
    def __init__(self):
        logger.info("SentimentAnalyzerTool initialized")

    def analyze_sentiment(self, text: str):
        try:
            positive_words = ["good", "great", "excellent", "amazing", "love", "like"]
            negative_words = ["bad", "terrible", "awful", "hate", "worst", "disappointing"]
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            total_words = len(text.split())
            sentiment_score = (positive_count - negative_count) / total_words if total_words > 0 else 0
            
            if sentiment_score > 0.1:
                sentiment = "positive"
            elif sentiment_score < -0.1:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            return {
                "success": True,
                "sentiment": sentiment,
                "score": round(sentiment_score, 3)
            }
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {"success": False, "error": str(e)}

    def run(self, method: str, **kwargs):
        if method == "analyze_sentiment":
            return self.analyze_sentiment(**kwargs)
        else:
            raise ValueError(f"Unknown method: {method}")

if __name__ == "__main__":
    analyzer = SentimentAnalyzerTool()
    result = analyzer.run("analyze_sentiment", text="This is amazing!")
    print(json.dumps(result, indent=2))