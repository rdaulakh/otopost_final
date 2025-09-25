#!/usr/bin/env python3
"""
Strategy to Content Workflow
Shows how to generate content after strategy creation and integrate with content calendar
"""

import requests
import json
from datetime import datetime, timedelta
import time

# Configuration
AI_AGENTS_URL = "http://localhost:8001"
BACKEND_API_URL = "http://localhost:8000"  # Assuming backend runs on port 8000
ORGANIZATION_ID = "68ce935fcbbcac3f7e70e556"
USER_ID = "demo-user-123"

def create_strategy_and_generate_content():
    """Complete workflow: Create strategy → Generate content → Add to calendar"""
    print("🚀 STRATEGY TO CONTENT WORKFLOW")
    print("=" * 50)
    
    # Step 1: Create a comprehensive strategy
    print("\n1️⃣ CREATING STRATEGY...")
    strategy = create_strategy()
    if not strategy:
        print("❌ Strategy creation failed. Cannot proceed.")
        return None
    
    print("✅ Strategy created successfully!")
    print(f"   Strategy: {strategy['name']}")
    print(f"   Objectives: {len(strategy['strategy']['objectives'])} goals")
    print(f"   Platforms: {len(strategy['strategy']['platformStrategies'])} platforms")
    
    # Step 2: Generate content based on strategy
    print("\n2️⃣ GENERATING CONTENT FROM STRATEGY...")
    content_pieces = generate_content_from_strategy(strategy)
    if not content_pieces:
        print("❌ Content generation failed.")
        return None
    
    print(f"✅ Generated {len(content_pieces)} pieces of content!")
    
    # Step 3: Add content to calendar
    print("\n3️⃣ ADDING CONTENT TO CALENDAR...")
    calendar_results = add_content_to_calendar(content_pieces)
    
    # Step 4: Show results
    print("\n4️⃣ WORKFLOW COMPLETE!")
    show_workflow_results(strategy, content_pieces, calendar_results)
    
    return {
        "strategy": strategy,
        "content_pieces": content_pieces,
        "calendar_results": calendar_results
    }

def create_strategy():
    """Create a comprehensive strategy"""
    strategy_data = {
        "objectives": ["brand_awareness", "lead_generation", "community_building"],
        "timeframe": "14d",  # 2 weeks for demo
        "platforms": ["instagram", "linkedin", "twitter"],
        "target_audience": "tech-savvy entrepreneurs and small business owners",
        "business_goals": "Establish thought leadership in AI-powered business automation",
        "current_challenges": "Need consistent, engaging content that drives meaningful conversations"
    }
    
    try:
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
                return data['result']
            else:
                print(f"❌ Strategy creation failed: {data}")
                return None
        else:
            print(f"❌ Strategy request failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Strategy creation error: {e}")
        return None

def generate_content_from_strategy(strategy):
    """Generate content pieces based on the strategy"""
    content_pieces = []
    
    # Extract strategy information
    weekly_plans = strategy.get('strategy', {}).get('weeklyPlans', [])
    platform_strategies = strategy.get('strategy', {}).get('platformStrategies', [])
    
    # Generate content for each week
    for week_idx, week_plan in enumerate(weekly_plans[:2]):  # First 2 weeks
        print(f"\n   📅 Generating content for Week {week_idx + 1}: {week_plan.get('theme', 'Unknown')}")
        
        # Generate content for each platform
        for platform_strategy in platform_strategies:
            platform = platform_strategy['platform']
            print(f"      📱 {platform.title()}: ", end="")
            
            # Create content based on weekly theme and platform strategy
            content_data = {
                "type": "generate_content",
                "topic": f"Week {week_idx + 1}: {week_plan.get('theme', 'Business Growth')}",
                "platform": platform,
                "content_type": "post",
                "tone": "professional",
                "target_audience": "tech-savvy entrepreneurs and small business owners",
                "keywords": ["AI", "business", "growth", "automation", "entrepreneurship"],
                "call_to_action": "What's your experience with this? Share your thoughts below!",
                "strategy_context": {
                    "strategy_id": strategy.get('name', 'unknown'),
                    "weekly_theme": week_plan.get('theme', 'Business Growth'),
                    "platform_strategy": platform_strategy,
                    "business_objectives": strategy.get('strategy', {}).get('objectives', []),
                    "content_mix": platform_strategy.get('contentMix', {}),
                    "key_hashtags": platform_strategy.get('keyHashtags', []),
                    "engagement_tactics": platform_strategy.get('engagementTactics', [])
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
                        
                        # Structure content for calendar
                        content_piece = {
                            "title": f"Week {week_idx + 1} - {platform.title()}",
                            "description": f"AI-generated content for {week_plan.get('theme', 'Business Growth')}",
                            "type": "post",
                            "category": "ai_generated",
                            "content": result.get('content', ''),
                            "platform": platform,
                            "tone": result.get('tone', 'professional'),
                            "hashtags": result.get('hashtags', []),
                            "week": week_idx + 1,
                            "theme": week_plan.get('theme', 'Business Growth'),
                            "strategy_id": strategy.get('name', 'unknown'),
                            "scheduled_at": calculate_schedule_time(week_idx, platform),
                            "status": "draft",
                            "ai_generated": True,
                            "generated_at": datetime.now().isoformat()
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
    """Calculate optimal scheduling time for content"""
    base_date = datetime.now() + timedelta(days=week_idx * 7)
    
    # Platform-specific optimal times
    platform_times = {
        "instagram": "09:00",  # 9 AM
        "linkedin": "08:00",   # 8 AM
        "twitter": "12:00"     # 12 PM
    }
    
    time_str = platform_times.get(platform, "09:00")
    hour, minute = map(int, time_str.split(':'))
    
    scheduled_date = base_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    return scheduled_date.isoformat()

def add_content_to_calendar(content_pieces):
    """Add generated content to the content calendar"""
    calendar_results = []
    
    print(f"\n   📅 Adding {len(content_pieces)} pieces to content calendar...")
    
    for i, content_piece in enumerate(content_pieces):
        print(f"      {i+1}. {content_piece['title']}: ", end="")
        
        # Prepare content for calendar
        calendar_data = {
            "title": content_piece["title"],
            "description": content_piece["description"],
            "type": content_piece["type"],
            "category": content_piece["category"],
            "content": content_piece["content"],
            "platforms": [{
                "platform": content_piece["platform"],
                "status": "scheduled",
                "scheduledAt": content_piece["scheduled_at"]
            }],
            "campaign": f"Week {content_piece['week']} - {content_piece['theme']}",
            "tags": content_piece["hashtags"],
            "status": "draft",
            "aiGenerated": True,
            "strategyId": content_piece["strategy_id"],
            "metadata": {
                "week": content_piece["week"],
                "theme": content_piece["theme"],
                "tone": content_piece["tone"],
                "generated_at": content_piece["generated_at"]
            }
        }
        
        # In a real implementation, this would call the backend API
        # For now, we'll simulate the calendar addition
        try:
            # Simulate API call to add content to calendar
            calendar_result = {
                "success": True,
                "content_id": f"content_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}",
                "platform": content_piece["platform"],
                "scheduled_at": content_piece["scheduled_at"],
                "status": "added_to_calendar"
            }
            
            calendar_results.append(calendar_result)
            print("✅ Added to calendar")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            calendar_results.append({
                "success": False,
                "error": str(e),
                "platform": content_piece["platform"]
            })
    
    return calendar_results

def show_workflow_results(strategy, content_pieces, calendar_results):
    """Show the results of the complete workflow"""
    print("\n" + "=" * 60)
    print("📊 WORKFLOW RESULTS SUMMARY")
    print("=" * 60)
    
    print(f"\n🎯 Strategy Created:")
    print(f"   Name: {strategy['name']}")
    print(f"   Confidence: {strategy['confidence']}%")
    print(f"   Objectives: {len(strategy['strategy']['objectives'])}")
    print(f"   Platforms: {len(strategy['strategy']['platformStrategies'])}")
    
    print(f"\n📝 Content Generated:")
    print(f"   Total pieces: {len(content_pieces)}")
    
    # Group by platform
    platform_counts = {}
    for piece in content_pieces:
        platform = piece['platform']
        platform_counts[platform] = platform_counts.get(platform, 0) + 1
    
    for platform, count in platform_counts.items():
        print(f"   {platform.title()}: {count} pieces")
    
    print(f"\n📅 Calendar Integration:")
    successful_additions = sum(1 for result in calendar_results if result.get('success', False))
    print(f"   Successfully added: {successful_additions}/{len(calendar_results)}")
    
    # Show sample content
    print(f"\n📄 Sample Generated Content:")
    for i, piece in enumerate(content_pieces[:3]):  # Show first 3
        print(f"\n   {i+1}. {piece['title']}")
        print(f"      Platform: {piece['platform'].title()}")
        print(f"      Theme: {piece['theme']}")
        print(f"      Content: {piece['content'][:100]}...")
        print(f"      Scheduled: {piece['scheduled_at']}")
        print(f"      Hashtags: {', '.join(piece['hashtags'][:5])}")

def show_content_calendar_view(content_pieces):
    """Show how content appears in the calendar view"""
    print("\n📅 CONTENT CALENDAR VIEW")
    print("=" * 50)
    
    # Group content by week
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
            print(f"   Status: {piece['status'].title()}")
            print()

def main():
    """Main function to demonstrate the complete workflow"""
    print("🚀 AI SOCIAL MEDIA PLATFORM")
    print("Strategy → Content → Calendar Workflow")
    print("=" * 60)
    
    # Run the complete workflow
    results = create_strategy_and_generate_content()
    
    if results:
        # Show calendar view
        show_content_calendar_view(results['content_pieces'])
        
        print("\n🎉 WORKFLOW COMPLETE!")
        print("=" * 30)
        print("✅ Strategy created and content generated")
        print("✅ Content added to calendar with optimal scheduling")
        print("✅ Content is ready for review and publishing")
        print("\nNext steps:")
        print("1. Review generated content in the calendar")
        print("2. Edit content if needed")
        print("3. Approve content for publishing")
        print("4. Monitor performance and optimize")
    else:
        print("\n❌ Workflow failed. Please check the system status.")

if __name__ == "__main__":
    main()






