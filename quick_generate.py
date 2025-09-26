#!/usr/bin/env python3
"""
Quick Content Generation - One-liner script
Usage: python3 quick_generate.py "topic" "platform" "tone"
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
AI_AGENTS_URL = "http://localhost:8001"
ORGANIZATION_ID = "68ce935fcbbcac3f7e70e556"
USER_ID = "user-123"

def quick_generate(topic, platform="instagram", tone="professional"):
    """Quickly generate content with minimal input"""
    
    content_data = {
        "type": "generate_content",
        "topic": topic,
        "platform": platform,
        "content_type": "post",
        "tone": tone,
        "target_audience": "small business owners",
        "keywords": ["AI", "business", "growth", "automation"],
        "call_to_action": "What are your thoughts? Share below!"
    }
    
    try:
        response = requests.post(
            f"{AI_AGENTS_URL}/agents/{ORGANIZATION_ID}_content_agent/process",
            json={
                "task_type": "generate_content",
                "organization_id": ORGANIZATION_ID,
                "user_id": USER_ID,
                "input_data": content_data,
                "priority": "high"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                result = data['result']
                print(f"✅ Content generated for {platform.title()}")
                print(f"\n📝 Content:")
                print(f"{result.get('content', 'N/A')}")
                print(f"\n🏷️ Hashtags:")
                print(f"{', '.join(result.get('hashtags', []))}")
                return result
            else:
                print(f"❌ Generation failed: {data}")
                return None
        else:
            print(f"❌ Request failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python3 quick_generate.py \"topic\" [platform] [tone]")
        print("Example: python3 quick_generate.py \"AI for Business\" instagram professional")
        print("\nAvailable platforms: instagram, linkedin, twitter, facebook")
        print("Available tones: professional, casual, friendly, authoritative")
        sys.exit(1)
    
    topic = sys.argv[1]
    platform = sys.argv[2] if len(sys.argv) > 2 else "instagram"
    tone = sys.argv[3] if len(sys.argv) > 3 else "professional"
    
    print(f"🚀 Generating content...")
    print(f"Topic: {topic}")
    print(f"Platform: {platform}")
    print(f"Tone: {tone}")
    print("-" * 40)
    
    result = quick_generate(topic, platform, tone)
    
    if result:
        # Save to file
        filename = f"quick_content_{platform}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w') as f:
            f.write(f"Quick Generated Content\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 40 + "\n\n")
            f.write(f"Topic: {topic}\n")
            f.write(f"Platform: {platform}\n")
            f.write(f"Tone: {tone}\n")
            f.write(f"Content: {result.get('content', 'N/A')}\n")
            f.write(f"Hashtags: {', '.join(result.get('hashtags', []))}\n")
        
        print(f"\n💾 Content saved to: {filename}")

if __name__ == "__main__":
    main()






