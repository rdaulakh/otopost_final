#!/usr/bin/env python3
"""
Demonstration of Automated Content Generation Workflow
Shows how the content generation agent works automatically based on strategies
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
AI_AGENTS_URL = "http://localhost:8001"
ORGANIZATION_ID = "68ce935fcbbcac3f7e70e556"
USER_ID = "demo-user-123"

def create_demo_strategy():
    """Create a comprehensive demo strategy"""
    print("🎯 Creating Demo Strategy...")
    
    strategy_data = {
        "objectives": ["brand_awareness", "lead_generation", "community_building"],
        "timeframe": "7d",  # Shorter timeframe for demo
        "platforms": ["instagram", "linkedin", "twitter"],
        "target_audience": "tech-savvy small business owners",
        "business_goals": "Establish thought leadership in AI-powered marketing",
        "current_challenges": "Need consistent, high-quality content that drives engagement"
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
                print("✅ Demo strategy created successfully!")
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

def generate_content_calendar(strategy):
    """Generate a week's worth of content based on the strategy"""
    print("\n📅 Generating Content Calendar...")
    
    # Extract weekly plans from strategy
    weekly_plans = strategy.get('strategy', {}).get('weeklyPlans', [])
    platform_strategies = strategy.get('strategy', {}).get('platformStrategies', [])
    
    content_calendar = []
    
    # Generate content for each day of the week
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    content_themes = [
        "Monday Motivation - AI Tools for Business Growth",
        "Tuesday Tips - Social Media Best Practices", 
        "Wednesday Wisdom - Industry Insights",
        "Thursday Thoughts - Future of Marketing",
        "Friday Features - Success Stories",
        "Saturday Spotlight - Community Highlights",
        "Sunday Strategy - Weekly Planning"
    ]
    
    for i, day in enumerate(days):
        print(f"\n   📝 Generating content for {day}...")
        
        # Generate content for each platform
        for platform_strategy in platform_strategies:
            platform = platform_strategy['platform']
            theme = content_themes[i]
            
            content_data = {
                "type": "generate_content",
                "topic": theme,
                "platform": platform,
                "content_type": "post",
                "tone": platform_strategy.get('focus', 'professional'),
                "target_audience": "tech-savvy small business owners",
                "keywords": ["AI", "marketing", "business", "growth", "automation"],
                "call_to_action": "What's your experience with this? Share below!",
                "strategy_context": {
                    "weekly_theme": f"Week {i//7 + 1} - {theme}",
                    "platform_strategy": platform_strategy,
                    "day_of_week": day,
                    "content_priority": "high" if i < 5 else "medium"  # Weekdays higher priority
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
                        content_calendar.append({
                            "day": day,
                            "platform": platform,
                            "theme": theme,
                            "content": result.get('content', ''),
                            "hashtags": result.get('hashtags', []),
                            "tone": result.get('tone', ''),
                            "generated_at": datetime.now().isoformat()
                        })
                        print(f"      ✅ {platform.title()}: Content generated")
                    else:
                        print(f"      ❌ {platform.title()}: Generation failed")
                else:
                    print(f"      ❌ {platform.title()}: Request failed")
            except Exception as e:
                print(f"      ❌ {platform.title()}: Error - {e}")
    
    return content_calendar

def demonstrate_automation_features():
    """Demonstrate automation features"""
    print("\n🤖 Automation Features Demonstration...")
    
    print("\n   📊 Available Automation Features:")
    print("   1. Scheduled Content Generation")
    print("      - Daily content creation at optimal times")
    print("      - Platform-specific optimization")
    print("      - Brand voice consistency")
    
    print("\n   2. Strategy-Based Content Planning")
    print("      - Content aligned with business objectives")
    print("      - Weekly theme consistency")
    print("      - Platform-specific adaptations")
    
    print("\n   3. Performance-Driven Optimization")
    print("      - A/B testing variations")
    print("      - Engagement prediction")
    print("      - Continuous improvement")
    
    print("\n   4. Multi-Platform Coordination")
    print("      - Cross-platform content adaptation")
    print("      - Consistent messaging across channels")
    print("      - Platform-specific best practices")

def show_content_quality_analysis(content_calendar):
    """Analyze the quality of generated content"""
    print("\n📈 Content Quality Analysis...")
    
    total_content = len(content_calendar)
    platforms = set(item['platform'] for item in content_calendar)
    
    print(f"\n   📊 Generated Content Summary:")
    print(f"      - Total pieces: {total_content}")
    print(f"      - Platforms: {', '.join(platforms)}")
    print(f"      - Days covered: {len(set(item['day'] for item in content_calendar))}")
    
    # Analyze content characteristics
    avg_content_length = sum(len(item['content']) for item in content_calendar) / total_content
    total_hashtags = sum(len(item['hashtags']) for item in content_calendar)
    avg_hashtags = total_hashtags / total_content
    
    print(f"\n   📝 Content Characteristics:")
    print(f"      - Average length: {avg_content_length:.0f} characters")
    print(f"      - Average hashtags: {avg_hashtags:.1f} per post")
    print(f"      - Platform distribution: {dict((p, sum(1 for item in content_calendar if item['platform'] == p)) for p in platforms)}")
    
    # Show sample content
    print(f"\n   📄 Sample Generated Content:")
    for i, item in enumerate(content_calendar[:3]):  # Show first 3 pieces
        print(f"\n      {i+1}. {item['day']} - {item['platform'].title()}")
        print(f"         Theme: {item['theme']}")
        print(f"         Content: {item['content'][:100]}...")
        print(f"         Hashtags: {', '.join(item['hashtags'][:5])}")

def demonstrate_strategy_integration():
    """Show how content generation integrates with strategies"""
    print("\n🔗 Strategy Integration Demonstration...")
    
    print("\n   🎯 How Content Generation Works with Strategies:")
    print("   1. Strategy Agent creates comprehensive social media strategy")
    print("   2. Content Agent receives strategy context and objectives")
    print("   3. Content is generated based on:")
    print("      - Weekly themes and objectives")
    print("      - Platform-specific strategies")
    print("      - Target audience preferences")
    print("      - Brand voice and tone guidelines")
    print("      - Business goals and KPIs")
    
    print("\n   📅 Automated Workflow:")
    print("   1. Strategy defines content pillars and themes")
    print("   2. Content Agent generates platform-specific content")
    print("   3. Content is optimized for each platform's best practices")
    print("   4. Scheduling system distributes content at optimal times")
    print("   5. Analytics Agent tracks performance and provides insights")
    print("   6. Learning Agent optimizes future content based on data")

def main():
    """Main demonstration function"""
    print("🚀 AI Social Media Platform - Automated Content Generation Demo")
    print("=" * 70)
    print(f"Demo started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Step 1: Create strategy
    strategy = create_demo_strategy()
    if not strategy:
        print("\n❌ Cannot proceed - Strategy creation failed")
        return
    
    # Step 2: Generate content calendar
    content_calendar = generate_content_calendar(strategy)
    
    if not content_calendar:
        print("\n❌ No content was generated")
        return
    
    # Step 3: Show automation features
    demonstrate_automation_features()
    
    # Step 4: Analyze content quality
    show_content_quality_analysis(content_calendar)
    
    # Step 5: Demonstrate strategy integration
    demonstrate_strategy_integration()
    
    # Summary
    print("\n" + "=" * 70)
    print("✅ AUTOMATED CONTENT GENERATION DEMO COMPLETE")
    print("=" * 70)
    
    print("\n🎉 Key Takeaways:")
    print("• Content Generation Agent successfully creates platform-specific content")
    print("• Content is automatically aligned with business strategies and objectives")
    print("• Multi-platform content generation ensures consistent messaging")
    print("• Automated workflow reduces manual content creation effort")
    print("• AI agents work together to create cohesive social media strategies")
    
    print(f"\n📊 Demo Results:")
    print(f"• Strategy created with {len(strategy.get('strategy', {}).get('objectives', []))} objectives")
    print(f"• {len(content_calendar)} pieces of content generated")
    print(f"• Content distributed across {len(set(item['platform'] for item in content_calendar))} platforms")
    print(f"• {len(set(item['day'] for item in content_calendar))} days of content planned")
    
    print(f"\nDemo completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()






