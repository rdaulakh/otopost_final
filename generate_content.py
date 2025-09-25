#!/usr/bin/env python3
"""
Simple Content Generation Interface
Easy way to generate content manually when needed
"""

import requests
import json
from datetime import datetime

# Configuration
AI_AGENTS_URL = "http://localhost:8001"
ORGANIZATION_ID = "68ce935fcbbcac3f7e70e556"
USER_ID = "user-123"

def generate_quick_content():
    """Generate a single piece of content quickly"""
    print("🚀 QUICK CONTENT GENERATION")
    print("=" * 40)
    
    # Get user input
    topic = input("Enter content topic: ").strip()
    if not topic:
        topic = "AI-Powered Business Growth"
    
    platform = input("Enter platform (instagram/linkedin/twitter/facebook): ").strip().lower()
    if platform not in ["instagram", "linkedin", "twitter", "facebook"]:
        platform = "instagram"
    
    tone = input("Enter tone (professional/casual/friendly/authoritative): ").strip().lower()
    if tone not in ["professional", "casual", "friendly", "authoritative"]:
        tone = "professional"
    
    target_audience = input("Enter target audience: ").strip()
    if not target_audience:
        target_audience = "small business owners"
    
    # Generate content
    content_data = {
        "type": "generate_content",
        "topic": topic,
        "platform": platform,
        "content_type": "post",
        "tone": tone,
        "target_audience": target_audience,
        "keywords": ["AI", "business", "growth", "automation"],
        "call_to_action": "What are your thoughts? Share below!"
    }
    
    try:
        print(f"\n🔄 Generating content for {platform.title()}...")
        
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
                print("\n✅ Content generated successfully!")
                print(f"\n📝 Generated Content:")
                print(f"Platform: {result.get('platform', 'N/A').title()}")
                print(f"Tone: {result.get('tone', 'N/A').title()}")
                print(f"Content: {result.get('content', 'N/A')}")
                print(f"Hashtags: {', '.join(result.get('hashtags', []))}")
                
                # Save to file
                save_content_to_file(result, topic, platform)
                
                return result
            else:
                print(f"❌ Content generation failed: {data}")
                return None
        else:
            print(f"❌ Request failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error generating content: {e}")
        return None

def generate_content_calendar():
    """Generate a week's worth of content"""
    print("\n📅 CONTENT CALENDAR GENERATION")
    print("=" * 40)
    
    # Get user input
    theme = input("Enter weekly theme: ").strip()
    if not theme:
        theme = "AI-Powered Business Growth"
    
    platforms = input("Enter platforms (comma-separated, e.g., instagram,linkedin): ").strip()
    if not platforms:
        platforms = ["instagram", "linkedin"]
    else:
        platforms = [p.strip() for p in platforms.split(",")]
    
    # Generate content for each day and platform
    content_calendar = []
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    daily_themes = [
        "Monday Motivation",
        "Tuesday Tips", 
        "Wednesday Wisdom",
        "Thursday Thoughts",
        "Friday Features",
        "Saturday Spotlight",
        "Sunday Strategy"
    ]
    
    for i, day in enumerate(days):
        print(f"\n📝 Generating content for {day}...")
        
        for platform in platforms:
            content_data = {
                "type": "generate_content",
                "topic": f"{daily_themes[i]} - {theme}",
                "platform": platform,
                "content_type": "post",
                "tone": "professional",
                "target_audience": "small business owners",
                "keywords": ["AI", "business", "growth", "automation"],
                "call_to_action": "What's your experience? Share below!"
            }
            
            try:
                response = requests.post(
                    f"{AI_AGENTS_URL}/agents/{ORGANIZATION_ID}_content_agent/process",
                    json={
                        "task_type": "generate_content",
                        "organization_id": ORGANIZATION_ID,
                        "user_id": USER_ID,
                        "input_data": content_data,
                        "priority": "medium"
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data['success']:
                        result = data['result']
                        content_calendar.append({
                            "day": day,
                            "platform": platform,
                            "content": result.get('content', ''),
                            "hashtags": result.get('hashtags', []),
                            "tone": result.get('tone', '')
                        })
                        print(f"   ✅ {platform.title()}: Content generated")
                    else:
                        print(f"   ❌ {platform.title()}: Generation failed")
                else:
                    print(f"   ❌ {platform.title()}: Request failed")
            except Exception as e:
                print(f"   ❌ {platform.title()}: Error - {e}")
    
    # Display calendar
    print(f"\n📅 Generated Content Calendar ({len(content_calendar)} pieces)")
    print("=" * 50)
    
    for item in content_calendar:
        print(f"\n{item['day']} - {item['platform'].title()}")
        print(f"Content: {item['content']}")
        print(f"Hashtags: {', '.join(item['hashtags'])}")
        print("-" * 30)
    
    # Save calendar to file
    save_calendar_to_file(content_calendar, theme)
    
    return content_calendar

def save_content_to_file(content, topic, platform):
    """Save generated content to a file"""
    filename = f"generated_content_{platform}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(filename, 'w') as f:
        f.write(f"Generated Content - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Topic: {topic}\n")
        f.write(f"Platform: {content.get('platform', 'N/A').title()}\n")
        f.write(f"Tone: {content.get('tone', 'N/A').title()}\n")
        f.write(f"Content: {content.get('content', 'N/A')}\n")
        f.write(f"Hashtags: {', '.join(content.get('hashtags', []))}\n")
    
    print(f"💾 Content saved to: {filename}")

def save_calendar_to_file(calendar, theme):
    """Save content calendar to a file"""
    filename = f"content_calendar_{theme.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(filename, 'w') as f:
        f.write(f"Content Calendar - {theme}\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 50 + "\n\n")
        
        for item in calendar:
            f.write(f"{item['day']} - {item['platform'].title()}\n")
            f.write(f"Content: {item['content']}\n")
            f.write(f"Hashtags: {', '.join(item['hashtags'])}\n")
            f.write("-" * 30 + "\n")
    
    print(f"💾 Calendar saved to: {filename}")

def show_menu():
    """Show the main menu"""
    print("\n🎯 CONTENT GENERATION MENU")
    print("=" * 40)
    print("1. Generate Quick Content (Single Post)")
    print("2. Generate Content Calendar (Week)")
    print("3. Show Automated System Status")
    print("4. Exit")
    print("=" * 40)

def show_system_status():
    """Show the current system status"""
    print("\n📊 SYSTEM STATUS")
    print("=" * 30)
    
    try:
        # Check AI agents status
        response = requests.get(f"{AI_AGENTS_URL}/agents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ AI Agents System: Running")
            print(f"   - Total Agents: {data['data']['summary']['totalAgents']}")
            print(f"   - Active Agents: {data['data']['summary']['activeAgents']}")
            print(f"   - System Status: {data['data']['summary']['systemStatus']}")
        else:
            print("❌ AI Agents System: Not responding")
    except Exception as e:
        print(f"❌ AI Agents System: Error - {e}")
    
    try:
        # Check health
        response = requests.get(f"{AI_AGENTS_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health Check: Passed")
            print(f"   - Service: {data['status']}")
            print(f"   - Agents: {data['agents_count']}")
        else:
            print("❌ Health Check: Failed")
    except Exception as e:
        print(f"❌ Health Check: Error - {e}")

def main():
    """Main function"""
    print("🚀 AI SOCIAL MEDIA PLATFORM")
    print("Content Generation Interface")
    print("=" * 50)
    
    while True:
        show_menu()
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            generate_quick_content()
        elif choice == "2":
            generate_content_calendar()
        elif choice == "3":
            show_system_status()
        elif choice == "4":
            print("\n👋 Goodbye! Content generation interface closed.")
            break
        else:
            print("\n❌ Invalid choice. Please enter 1-4.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()






