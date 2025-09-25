#!/usr/bin/env python3
"""
Generate Content from Strategy
Simple interface to generate content after creating a strategy
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
AI_AGENTS_URL = "http://localhost:8001"
ORGANIZATION_ID = "68ce935fcbbcac3f7e70e556"
USER_ID = "user-123"

def list_available_strategies():
    """List available strategies (in a real system, this would query the database)"""
    print("📋 AVAILABLE STRATEGIES")
    print("=" * 40)
    print("1. AI-Generated Strategy for 14d (Brand Awareness & Engagement)")
    print("2. AI-Generated Strategy for 30d (Lead Generation & Community Building)")
    print("3. Create New Strategy")
    print("=" * 40)

def create_new_strategy():
    """Create a new strategy"""
    print("\n🎯 CREATE NEW STRATEGY")
    print("-" * 30)
    
    objectives = input("Enter objectives (comma-separated): ").strip()
    if not objectives:
        objectives = "brand_awareness,lead_generation,engagement"
    objectives = [obj.strip() for obj in objectives.split(",")]
    
    timeframe = input("Enter timeframe (e.g., 7d, 14d, 30d): ").strip()
    if not timeframe:
        timeframe = "14d"
    
    platforms = input("Enter platforms (comma-separated): ").strip()
    if not platforms:
        platforms = "instagram,linkedin,twitter"
    platforms = [p.strip() for p in platforms.split(",")]
    
    target_audience = input("Enter target audience: ").strip()
    if not target_audience:
        target_audience = "small business owners"
    
    business_goals = input("Enter business goals: ").strip()
    if not business_goals:
        business_goals = "Increase brand awareness and generate leads"
    
    strategy_data = {
        "objectives": objectives,
        "timeframe": timeframe,
        "platforms": platforms,
        "target_audience": target_audience,
        "business_goals": business_goals,
        "current_challenges": "Need consistent, engaging content"
    }
    
    try:
        print("\n🔄 Creating strategy...")
        response = requests.post(
            f"{AI_AGENTS_URL}/agents/{ORGANIZATION_ID}_strategy_agent/process",
            json={
                "task_type": "generate_strategy",
                "organization_id": ORGANIZATION_ID,
                "user_id": USER_ID,
                "input_data": strategy_data,
                "priority": "high"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Strategy created successfully!")
                return data['result']
            else:
                print(f"❌ Strategy creation failed: {data}")
                return None
        else:
            print(f"❌ Request failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def generate_content_from_strategy(strategy):
    """Generate content based on the selected strategy"""
    print(f"\n📝 GENERATING CONTENT FROM STRATEGY")
    print(f"Strategy: {strategy['name']}")
    print("-" * 50)
    
    # Get strategy details
    weekly_plans = strategy.get('strategy', {}).get('weeklyPlans', [])
    platform_strategies = strategy.get('strategy', {}).get('platformStrategies', [])
    
    print(f"📊 Strategy Details:")
    print(f"   Objectives: {len(strategy['strategy']['objectives'])}")
    print(f"   Platforms: {len(platform_strategies)}")
    print(f"   Weekly Plans: {len(weekly_plans)}")
    
    # Ask user how much content to generate
    print(f"\n📅 Content Generation Options:")
    print("1. Generate 1 week of content")
    print("2. Generate 2 weeks of content")
    print("3. Generate all weeks")
    print("4. Generate specific week")
    
    choice = input("Enter choice (1-4): ").strip()
    
    weeks_to_generate = []
    if choice == "1":
        weeks_to_generate = [0]  # First week
    elif choice == "2":
        weeks_to_generate = [0, 1]  # First two weeks
    elif choice == "3":
        weeks_to_generate = list(range(len(weekly_plans)))  # All weeks
    elif choice == "4":
        week_num = int(input(f"Enter week number (1-{len(weekly_plans)}): ")) - 1
        weeks_to_generate = [week_num]
    else:
        weeks_to_generate = [0]  # Default to first week
    
    # Generate content
    content_pieces = []
    
    for week_idx in weeks_to_generate:
        if week_idx >= len(weekly_plans):
            continue
            
        week_plan = weekly_plans[week_idx]
        print(f"\n📅 Generating content for Week {week_idx + 1}: {week_plan.get('theme', 'Unknown')}")
        
        for platform_strategy in platform_strategies:
            platform = platform_strategy['platform']
            print(f"   📱 {platform.title()}: ", end="")
            
            content_data = {
                "type": "generate_content",
                "topic": f"Week {week_idx + 1}: {week_plan.get('theme', 'Business Growth')}",
                "platform": platform,
                "content_type": "post",
                "tone": "professional",
                "target_audience": strategy.get('strategy', {}).get('target_audience', 'small business owners'),
                "keywords": ["AI", "business", "growth", "automation"],
                "call_to_action": "What's your experience? Share below!",
                "strategy_context": {
                    "strategy_id": strategy['name'],
                    "weekly_theme": week_plan.get('theme', 'Business Growth'),
                    "platform_strategy": platform_strategy,
                    "business_objectives": strategy.get('strategy', {}).get('objectives', [])
                }
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
                        
                        content_piece = {
                            "title": f"Week {week_idx + 1} - {platform.title()}",
                            "content": result.get('content', ''),
                            "platform": platform,
                            "hashtags": result.get('hashtags', []),
                            "tone": result.get('tone', 'professional'),
                            "week": week_idx + 1,
                            "theme": week_plan.get('theme', 'Business Growth'),
                            "scheduled_at": calculate_schedule_time(week_idx, platform),
                            "status": "draft"
                        }
                        
                        content_pieces.append(content_piece)
                        print("✅ Generated")
                    else:
                        print("❌ Failed")
                else:
                    print("❌ Request failed")
            except Exception as e:
                print(f"❌ Error: {e}")
    
    return content_pieces

def calculate_schedule_time(week_idx, platform):
    """Calculate optimal scheduling time"""
    base_date = datetime.now() + timedelta(days=week_idx * 7)
    
    platform_times = {
        "instagram": "09:00",
        "linkedin": "08:00", 
        "twitter": "12:00",
        "facebook": "10:00"
    }
    
    time_str = platform_times.get(platform, "09:00")
    hour, minute = map(int, time_str.split(':'))
    
    scheduled_date = base_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    return scheduled_date.isoformat()

def show_content_calendar(content_pieces):
    """Display generated content in calendar format"""
    print(f"\n📅 CONTENT CALENDAR")
    print("=" * 50)
    
    if not content_pieces:
        print("No content generated.")
        return
    
    # Group by week
    weeks = {}
    for piece in content_pieces:
        week = piece['week']
        if week not in weeks:
            weeks[week] = []
        weeks[week].append(piece)
    
    for week_num in sorted(weeks.keys()):
        print(f"\n📅 Week {week_num}")
        print("-" * 30)
        
        for piece in weeks[week_num]:
            scheduled_date = datetime.fromisoformat(piece['scheduled_at'].replace('Z', '+00:00'))
            print(f"   {scheduled_date.strftime('%A, %B %d at %I:%M %p')} - {piece['platform'].title()}")
            print(f"   Theme: {piece['theme']}")
            print(f"   Content: {piece['content'][:80]}...")
            print(f"   Hashtags: {', '.join(piece['hashtags'][:5])}")
            print(f"   Status: {piece['status'].title()}")
            print()

def save_content_to_files(content_pieces, strategy_name):
    """Save generated content to files"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Save individual content pieces
    for i, piece in enumerate(content_pieces):
        filename = f"content_{strategy_name.replace(' ', '_')}_week{piece['week']}_{piece['platform']}_{timestamp}.txt"
        
        with open(filename, 'w') as f:
            f.write(f"Generated Content - {strategy_name}\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Week: {piece['week']}\n")
            f.write(f"Platform: {piece['platform'].title()}\n")
            f.write(f"Theme: {piece['theme']}\n")
            f.write(f"Tone: {piece['tone'].title()}\n")
            f.write(f"Scheduled: {piece['scheduled_at']}\n")
            f.write(f"Status: {piece['status'].title()}\n")
            f.write(f"\nContent:\n{piece['content']}\n")
            f.write(f"\nHashtags: {', '.join(piece['hashtags'])}\n")
        
        print(f"💾 Saved: {filename}")
    
    # Save calendar overview
    calendar_filename = f"content_calendar_{strategy_name.replace(' ', '_')}_{timestamp}.txt"
    
    with open(calendar_filename, 'w') as f:
        f.write(f"Content Calendar - {strategy_name}\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 50 + "\n\n")
        
        # Group by week
        weeks = {}
        for piece in content_pieces:
            week = piece['week']
            if week not in weeks:
                weeks[week] = []
            weeks[week].append(piece)
        
        for week_num in sorted(weeks.keys()):
            f.write(f"Week {week_num}\n")
            f.write("-" * 20 + "\n")
            
            for piece in weeks[week_num]:
                scheduled_date = datetime.fromisoformat(piece['scheduled_at'].replace('Z', '+00:00'))
                f.write(f"{scheduled_date.strftime('%A, %B %d at %I:%M %p')} - {piece['platform'].title()}\n")
                f.write(f"Theme: {piece['theme']}\n")
                f.write(f"Content: {piece['content']}\n")
                f.write(f"Hashtags: {', '.join(piece['hashtags'])}\n")
                f.write(f"Status: {piece['status'].title()}\n\n")
    
    print(f"💾 Calendar saved: {calendar_filename}")

def main():
    """Main function"""
    print("🚀 AI SOCIAL MEDIA PLATFORM")
    print("Generate Content from Strategy")
    print("=" * 50)
    
    while True:
        print("\n📋 MAIN MENU")
        print("=" * 20)
        print("1. Generate content from existing strategy")
        print("2. Create new strategy and generate content")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            # For demo, we'll create a strategy first
            print("\n🎯 Creating strategy for demo...")
            strategy = create_new_strategy()
            if strategy:
                content_pieces = generate_content_from_strategy(strategy)
                if content_pieces:
                    show_content_calendar(content_pieces)
                    save_content_to_files(content_pieces, strategy['name'])
        
        elif choice == "2":
            strategy = create_new_strategy()
            if strategy:
                content_pieces = generate_content_from_strategy(strategy)
                if content_pieces:
                    show_content_calendar(content_pieces)
                    save_content_to_files(content_pieces, strategy['name'])
        
        elif choice == "3":
            print("\n👋 Goodbye!")
            break
        
        else:
            print("\n❌ Invalid choice. Please enter 1-3.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()






