import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BlogPost from '../components/BlogPost';
import { handleGetStartedClick } from '../lib/auth';

function BlogPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = [
    { id: 'all', name: 'All Posts', icon: '📚' },
    { id: 'ai-insights', name: 'AI Insights', icon: '🤖' },
    { id: 'social-media', name: 'Social Media', icon: '📱' },
    { id: 'marketing', name: 'Marketing Tips', icon: '📈' },
    { id: 'case-studies', name: 'Case Studies', icon: '📊' }
  ];

  const blogPosts = [
   
    {
      id: 2,
      title: 'The Future of AI in Social Media Marketing: 2024 Trends',
      excerpt: 'Discover how artificial intelligence is revolutionizing social media marketing and what trends to watch for in 2024.',
      category: 'ai-insights',
      author: 'Sarah Chen',
      date: '2024-01-15',
      readTime: '8 min read',
      image: '🤖',
      featured: true,
      content: (
        <div>
                  <p>In today's rapidly evolving digital landscape, artificial intelligence is transforming how businesses approach social media marketing. This comprehensive guide explores the latest trends, strategies, and tools that are reshaping the industry.</p>

                  <h2>The Current State of AI in Social Media</h2>
                  <p>AI-powered tools are no longer a luxury—they're becoming essential for businesses that want to stay competitive. From content creation to audience analysis, AI is revolutionizing every aspect of social media marketing.</p>

                  <div className="highlight-box">
                    <h3>Key Statistics</h3>
                    <ul>
                      <li>73% of marketers are already using AI tools for social media</li>
                      <li>AI-generated content sees 2.3x higher engagement rates</li>
                      <li>Businesses using AI report 40% time savings in content creation</li>
                    </ul>
                  </div>

                  <h2>Emerging Trends to Watch</h2>
                  <p>Several key trends are shaping the future of AI in social media marketing:</p>

                  <h3>1. Autonomous Content Creation</h3>
                  <p>AI systems are becoming sophisticated enough to create entire content strategies, from ideation to execution, with minimal human intervention.</p>

                  <h3>2. Predictive Analytics</h3>
                  <p>Advanced AI models can now predict content performance with remarkable accuracy, allowing marketers to optimize their strategies before publishing.</p>

                  <h3>3. Personalized Customer Experiences</h3>
                  <p>AI enables hyper-personalized content delivery, ensuring each user sees content tailored to their preferences and behavior patterns.</p>

                  <div className="quote-box">
                    <blockquote>
                      "The future of social media marketing isn't just about using AI tools—it's about having AI agents that work as your dedicated marketing team."
                    </blockquote>
                    <cite>— Sarah Chen, Digital Marketing Expert</cite>
                  </div>

                  <h2>Practical Implementation</h2>
                  <p>To successfully implement AI in your social media strategy, consider these actionable steps:</p>

                  <ol>
                    <li><strong>Start with automation:</strong> Begin by automating repetitive tasks like scheduling and basic analytics.</li>
                    <li><strong>Invest in AI content tools:</strong> Use AI for content ideation and creation to scale your output.</li>
                    <li><strong>Leverage predictive analytics:</strong> Use AI insights to optimize posting times and content types.</li>
                    <li><strong>Monitor and adjust:</strong> Continuously refine your AI tools based on performance data.</li>
                  </ol>

                  <h2>Conclusion</h2>
                  <p>The integration of AI in social media marketing is not just a trend—it's the future. Businesses that embrace these technologies now will have a significant advantage over their competitors. The key is to start small, learn continuously, and scale gradually.</p>

                  <div className="cta-box">
                    <h3>Ready to Transform Your Social Media Strategy?</h3>
                    <p>Discover how OTOPost's AI agents can revolutionize your social media marketing.</p>
                    <button className="btn-primary" onClick={handleGetStartedClick}>Get Started Free</button>
                  </div>
                </div>
      ),
      // tags: ['AI Marketing', 'Social Media', 'Automation', 'Digital Strategy'],
      // relatedPosts: [
      //   {
      //     title: 'How Small Businesses Can Compete with Enterprise Brands',
      //     excerpt: 'Level the playing field with smart strategies and AI-powered tools that give small businesses enterprise-level capabilities.',
      //     image: '🏪'
      //   },
      //   {
      //     title: 'The Rise of AI-Generated Content: Opportunities and Challenges',
      //     excerpt: 'Exploring the implications of AI-generated content for brands and how to maintain authenticity.',
      //     image: '🎨'
      //   },
      //   {
      //     title: 'Case Study: 500% Engagement Increase in 3 Months',
      //     excerpt: 'A detailed breakdown of how a B2B startup transformed their social media presence using AI-powered content strategies.',
      //     image: '📊'
      //   }
      // ]
    },
    {
      id: 3,
      title: 'How Small Businesses Can Compete with Enterprise Brands',
      excerpt: 'Level the playing field with smart strategies and AI-powered tools that give small businesses enterprise-level capabilities.',
      category: 'marketing',
      author: 'Mike Rodriguez',
      date: '2024-01-12',
      readTime: '6 min read',
      image: '🏪',
      featured: true,
      content: (
        <div>
          <p>In today's rapidly evolving digital landscape, artificial intelligence is transforming how businesses approach social media marketing. This comprehensive guide explores the latest trends, strategies, and tools that are reshaping the industry.</p>

          <h2>The Current State of AI in Social Media</h2>
          <p>AI-powered tools are no longer a luxury—they're becoming essential for businesses that want to stay competitive. From content creation to audience analysis, AI is revolutionizing every aspect of social media marketing.</p>

          <div className="highlight-box">
            <h3>Key Statistics</h3>
            <ul>
              <li>73% of marketers are already using AI tools for social media</li>
              <li>AI-generated content sees 2.3x higher engagement rates</li>
              <li>Businesses using AI report 40% time savings in content creation</li>
            </ul>
              </div>

          <h2>Emerging Trends to Watch</h2>
          <p>Several key trends are shaping the future of AI in social media marketing:</p>

          <h3>1. Autonomous Content Creation</h3>
          <p>AI systems are becoming sophisticated enough to create entire content strategies, from ideation to execution, with minimal human intervention.</p>

          <h3>2. Predictive Analytics</h3>
          <p>Advanced AI models can now predict content performance with remarkable accuracy, allowing marketers to optimize their strategies before publishing.</p>

          <h3>3. Personalized Customer Experiences</h3>
          <p>AI enables hyper-personalized content delivery, ensuring each user sees content tailored to their preferences and behavior patterns.</p>

          <div className="quote-box">
            <blockquote>
              "The future of social media marketing isn't just about using AI tools—it's about having AI agents that work as your dedicated marketing team."
            </blockquote>
            <cite>— Mike Rodriguez, Digital Marketing Expert</cite>
                </div>
                
          <h2>Practical Implementation</h2>
          <p>To successfully implement AI in your social media strategy, consider these actionable steps:</p>

          <ol>
            <li><strong>Start with automation:</strong> Begin by automating repetitive tasks like scheduling and basic analytics.</li>
            <li><strong>Invest in AI content tools:</strong> Use AI for content ideation and creation to scale your output.</li>
            <li><strong>Leverage predictive analytics:</strong> Use AI insights to optimize posting times and content types.</li>
            <li><strong>Monitor and adjust:</strong> Continuously refine your AI tools based on performance data.</li>
          </ol>

          <h2>Conclusion</h2>
          <p>The integration of AI in social media marketing is not just a trend—it's the future. Businesses that embrace these technologies now will have a significant advantage over their competitors. The key is to start small, learn continuously, and scale gradually.</p>

          <div className="cta-box">
            <h3>Ready to Transform Your Social Media Strategy?</h3>
            <p>Discover how OTOPost's AI agents can revolutionize your social media marketing.</p>
            <button className="btn-primary" onClick={handleGetStartedClick}>Get Started Free</button>
                  </div>
                </div>
      ),
      // tags: ['AI Marketing', 'Social Media', 'Automation', 'Digital Strategy'],
      // relatedPosts: [
      //   {
      //     title: 'The Future of AI in Social Media Marketing: 2024 Trends',
      //     excerpt: 'Discover how artificial intelligence is revolutionizing social media marketing and what trends to watch for in 2024.',
      //     image: '🤖'
      //   },
      //   {
      //     title: 'Case Study: 500% Engagement Increase in 3 Months',
      //     excerpt: 'A detailed breakdown of how a B2B startup transformed their social media presence using AI-powered content strategies.',
      //     image: '📊'
      //   },
      //   {
      //     title: '10 Social Media Mistakes Killing Your Engagement',
      //     excerpt: 'Avoid these common pitfalls that prevent businesses from maximizing their social media potential.',
      //     image: '⚠️'
      //   }
      // ]
    },
    {
      id: 4,
      title: 'Case Study: 500% Engagement Increase in 3 Months',
      excerpt: 'A detailed breakdown of how a B2B startup transformed their social media presence using AI-powered content strategies.',
      category: 'case-studies',
      author: 'Emily Watson',
      date: '2024-01-10',
      readTime: '10 min read',
      image: '📊',
      featured: false,
      content: (
        <div>
          <p>In today's rapidly evolving digital landscape, artificial intelligence is transforming how businesses approach social media marketing. This comprehensive guide explores the latest trends, strategies, and tools that are reshaping the industry.</p>

          <h2>The Current State of AI in Social Media</h2>
          <p>AI-powered tools are no longer a luxury—they're becoming essential for businesses that want to stay competitive. From content creation to audience analysis, AI is revolutionizing every aspect of social media marketing.</p>

          <div className="highlight-box">
            <h3>Key Statistics</h3>
            <ul>
              <li>73% of marketers are already using AI tools for social media</li>
              <li>AI-generated content sees 2.3x higher engagement rates</li>
              <li>Businesses using AI report 40% time savings in content creation</li>
            </ul>
              </div>

          <h2>Emerging Trends to Watch</h2>
          <p>Several key trends are shaping the future of AI in social media marketing:</p>

          <h3>1. Autonomous Content Creation</h3>
          <p>AI systems are becoming sophisticated enough to create entire content strategies, from ideation to execution, with minimal human intervention.</p>

          <h3>2. Predictive Analytics</h3>
          <p>Advanced AI models can now predict content performance with remarkable accuracy, allowing marketers to optimize their strategies before publishing.</p>

          <h3>3. Personalized Customer Experiences</h3>
          <p>AI enables hyper-personalized content delivery, ensuring each user sees content tailored to their preferences and behavior patterns.</p>

          <div className="quote-box">
            <blockquote>
              "The future of social media marketing isn't just about using AI tools—it's about having AI agents that work as your dedicated marketing team."
            </blockquote>
            <cite>— Emily Watson, Digital Marketing Expert</cite>
                  </div>

          <h2>Practical Implementation</h2>
          <p>To successfully implement AI in your social media strategy, consider these actionable steps:</p>

          <ol>
            <li><strong>Start with automation:</strong> Begin by automating repetitive tasks like scheduling and basic analytics.</li>
            <li><strong>Invest in AI content tools:</strong> Use AI for content ideation and creation to scale your output.</li>
            <li><strong>Leverage predictive analytics:</strong> Use AI insights to optimize posting times and content types.</li>
            <li><strong>Monitor and adjust:</strong> Continuously refine your AI tools based on performance data.</li>
          </ol>

          <h2>Conclusion</h2>
          <p>The integration of AI in social media marketing is not just a trend—it's the future. Businesses that embrace these technologies now will have a significant advantage over their competitors. The key is to start small, learn continuously, and scale gradually.</p>

          <div className="cta-box">
            <h3>Ready to Transform Your Social Media Strategy?</h3>
            <p>Discover how OTOPost's AI agents can revolutionize your social media marketing.</p>
            <button className="btn-primary" onClick={handleGetStartedClick}>Get Started Free</button>
          </div>
      </div>
      ),
      // tags: ['AI Marketing', 'Social Media', 'Automation', 'Digital Strategy'],
      // relatedPosts: [
      //   {
      //     title: 'The Future of AI in Social Media Marketing: 2024 Trends',
      //     excerpt: 'Discover how artificial intelligence is revolutionizing social media marketing and what trends to watch for in 2024.',
      //     image: '🤖'
      //   },
      //   {
      //     title: 'How Small Businesses Can Compete with Enterprise Brands',
      //     excerpt: 'Level the playing field with smart strategies and AI-powered tools that give small businesses enterprise-level capabilities.',
      //     image: '🏪'
      //   },
      //   {
      //     title: '10 Social Media Mistakes Killing Your Engagement',
      //     excerpt: 'Avoid these common pitfalls that prevent businesses from maximizing their social media potential.',
      //     image: '⚠️'
      //   }
      // ]
    },
    {
      id: 5,
      title: '10 Social Media Mistakes Killing Your Engagement',
      excerpt: 'Avoid these common pitfalls that prevent businesses from maximizing their social media potential.',
      category: 'social-media',
      author: 'David Kim',
      date: '2024-01-08',
      readTime: '7 min read',
      image: '⚠️',
      featured: false,
      content: (
        <div>
          <p>In today's rapidly evolving digital landscape, artificial intelligence is transforming how businesses approach social media marketing. This comprehensive guide explores the latest trends, strategies, and tools that are reshaping the industry.</p>

          <h2>The Current State of AI in Social Media</h2>
          <p>AI-powered tools are no longer a luxury—they're becoming essential for businesses that want to stay competitive. From content creation to audience analysis, AI is revolutionizing every aspect of social media marketing.</p>

          <div className="highlight-box">
            <h3>Key Statistics</h3>
            <ul>
              <li>73% of marketers are already using AI tools for social media</li>
              <li>AI-generated content sees 2.3x higher engagement rates</li>
              <li>Businesses using AI report 40% time savings in content creation</li>
            </ul>
          </div>

          <h2>Emerging Trends to Watch</h2>
          <p>Several key trends are shaping the future of AI in social media marketing:</p>

          <h3>1. Autonomous Content Creation</h3>
          <p>AI systems are becoming sophisticated enough to create entire content strategies, from ideation to execution, with minimal human intervention.</p>

          <h3>2. Predictive Analytics</h3>
          <p>Advanced AI models can now predict content performance with remarkable accuracy, allowing marketers to optimize their strategies before publishing.</p>

          <h3>3. Personalized Customer Experiences</h3>
          <p>AI enables hyper-personalized content delivery, ensuring each user sees content tailored to their preferences and behavior patterns.</p>

          <div className="quote-box">
            <blockquote>
              "The future of social media marketing isn't just about using AI tools—it's about having AI agents that work as your dedicated marketing team."
            </blockquote>
            <cite>— David Kim, Digital Marketing Expert</cite>
          </div>

          <h2>Practical Implementation</h2>
          <p>To successfully implement AI in your social media strategy, consider these actionable steps:</p>

          <ol>
            <li><strong>Start with automation:</strong> Begin by automating repetitive tasks like scheduling and basic analytics.</li>
            <li><strong>Invest in AI content tools:</strong> Use AI for content ideation and creation to scale your output.</li>
            <li><strong>Leverage predictive analytics:</strong> Use AI insights to optimize posting times and content types.</li>
            <li><strong>Monitor and adjust:</strong> Continuously refine your AI tools based on performance data.</li>
          </ol>

          <h2>Conclusion</h2>
          <p>The integration of AI in social media marketing is not just a trend—it's the future. Businesses that embrace these technologies now will have a significant advantage over their competitors. The key is to start small, learn continuously, and scale gradually.</p>

          <div className="cta-box">
            <h3>Ready to Transform Your Social Media Strategy?</h3>
            <p>Discover how OTOPost's AI agents can revolutionize your social media marketing.</p>
            <button className="btn-primary" onClick={handleGetStartedClick}>Get Started Free</button>
          </div>
        </div>
      ),
      // tags: ['AI Marketing', 'Social Media', 'Automation', 'Digital Strategy'],
      // relatedPosts: [
      //   {
      //     title: 'The Future of AI in Social Media Marketing: 2024 Trends',
      //     excerpt: 'Discover how artificial intelligence is revolutionizing social media marketing and what trends to watch for in 2024.',
      //     image: '🤖'
      //   },
      //   {
      //     title: 'How Small Businesses Can Compete with Enterprise Brands',
      //     excerpt: 'Level the playing field with smart strategies and AI-powered tools that give small businesses enterprise-level capabilities.',
      //     image: '🏪'
      //   },
      //   {
      //     title: 'Case Study: 500% Engagement Increase in 3 Months',
      //     excerpt: 'A detailed breakdown of how a B2B startup transformed their social media presence using AI-powered content strategies.',
      //     image: '📊'
      //   }
      // ]
    },
    {
      id: 6,
      title: 'The Rise of AI-Generated Content: Opportunities and Challenges',
      excerpt: 'Exploring the implications of AI-generated content for brands and how to maintain authenticity.',
      category: 'ai-insights',
      author: 'Lisa Park',
      date: '2024-01-05',
      readTime: '9 min read',
      image: '🎨',
      featured: false,
      content: (
        <div>
          <p>In today's rapidly evolving digital landscape, artificial intelligence is transforming how businesses approach social media marketing. This comprehensive guide explores the latest trends, strategies, and tools that are reshaping the industry.</p>

          <h2>The Current State of AI in Social Media</h2>
          <p>AI-powered tools are no longer a luxury—they're becoming essential for businesses that want to stay competitive. From content creation to audience analysis, AI is revolutionizing every aspect of social media marketing.</p>

          <div className="highlight-box">
            <h3>Key Statistics</h3>
            <ul>
              <li>73% of marketers are already using AI tools for social media</li>
              <li>AI-generated content sees 2.3x higher engagement rates</li>
              <li>Businesses using AI report 40% time savings in content creation</li>
            </ul>
          </div>

          <h2>Emerging Trends to Watch</h2>
          <p>Several key trends are shaping the future of AI in social media marketing:</p>

          <h3>1. Autonomous Content Creation</h3>
          <p>AI systems are becoming sophisticated enough to create entire content strategies, from ideation to execution, with minimal human intervention.</p>

          <h3>2. Predictive Analytics</h3>
          <p>Advanced AI models can now predict content performance with remarkable accuracy, allowing marketers to optimize their strategies before publishing.</p>

          <h3>3. Personalized Customer Experiences</h3>
          <p>AI enables hyper-personalized content delivery, ensuring each user sees content tailored to their preferences and behavior patterns.</p>

          <div className="quote-box">
            <blockquote>
              "The future of social media marketing isn't just about using AI tools—it's about having AI agents that work as your dedicated marketing team."
            </blockquote>
            <cite>— Lisa Park, Digital Marketing Expert</cite>
          </div>

          <h2>Practical Implementation</h2>
          <p>To successfully implement AI in your social media strategy, consider these actionable steps:</p>

          <ol>
            <li><strong>Start with automation:</strong> Begin by automating repetitive tasks like scheduling and basic analytics.</li>
            <li><strong>Invest in AI content tools:</strong> Use AI for content ideation and creation to scale your output.</li>
            <li><strong>Leverage predictive analytics:</strong> Use AI insights to optimize posting times and content types.</li>
            <li><strong>Monitor and adjust:</strong> Continuously refine your AI tools based on performance data.</li>
          </ol>

          <h2>Conclusion</h2>
          <p>The integration of AI in social media marketing is not just a trend—it's the future. Businesses that embrace these technologies now will have a significant advantage over their competitors. The key is to start small, learn continuously, and scale gradually.</p>

          <div className="cta-box">
            <h3>Ready to Transform Your Social Media Strategy?</h3>
            <p>Discover how OTOPost's AI agents can revolutionize your social media marketing.</p>
            <button className="btn-primary" onClick={handleGetStartedClick}>Get Started Free</button>
          </div>
        </div>
      ),
      // tags: ['AI Marketing', 'Social Media', 'Automation', 'Digital Strategy'],
      // relatedPosts: [
      //   {
      //     title: 'The Future of AI in Social Media Marketing: 2024 Trends',
      //     excerpt: 'Discover how artificial intelligence is revolutionizing social media marketing and what trends to watch for in 2024.',
      //     image: '🤖'
      //   },
      //   {
      //     title: 'How Small Businesses Can Compete with Enterprise Brands',
      //     excerpt: 'Level the playing field with smart strategies and AI-powered tools that give small businesses enterprise-level capabilities.',
      //     image: '🏪'
      //   },
      //   {
      //     title: 'Case Study: 500% Engagement Increase in 3 Months',
      //     excerpt: 'A detailed breakdown of how a B2B startup transformed their social media presence using AI-powered content strategies.',
      //     image: '📊'
      //   }
      // ]
    },
    {
      id: 7,
      title: 'Social Media ROI: Measuring What Really Matters',
      excerpt: 'Beyond vanity metrics: A comprehensive guide to measuring the true impact of your social media efforts.',
      category: 'marketing',
      author: 'Alex Thompson',
      date: '2024-01-03',
      readTime: '8 min read',
      image: '📈',
      featured: false,
      content: (
        <div>
          <p>In today's rapidly evolving digital landscape, artificial intelligence is transforming how businesses approach social media marketing. This comprehensive guide explores the latest trends, strategies, and tools that are reshaping the industry.</p>

          <h2>The Current State of AI in Social Media</h2>
          <p>AI-powered tools are no longer a luxury—they're becoming essential for businesses that want to stay competitive. From content creation to audience analysis, AI is revolutionizing every aspect of social media marketing.</p>

          <div className="highlight-box">
            <h3>Key Statistics</h3>
            <ul>
              <li>73% of marketers are already using AI tools for social media</li>
              <li>AI-generated content sees 2.3x higher engagement rates</li>
              <li>Businesses using AI report 40% time savings in content creation</li>
            </ul>
          </div>

          <h2>Emerging Trends to Watch</h2>
          <p>Several key trends are shaping the future of AI in social media marketing:</p>

          <h3>1. Autonomous Content Creation</h3>
          <p>AI systems are becoming sophisticated enough to create entire content strategies, from ideation to execution, with minimal human intervention.</p>

          <h3>2. Predictive Analytics</h3>
          <p>Advanced AI models can now predict content performance with remarkable accuracy, allowing marketers to optimize their strategies before publishing.</p>

          <h3>3. Personalized Customer Experiences</h3>
          <p>AI enables hyper-personalized content delivery, ensuring each user sees content tailored to their preferences and behavior patterns.</p>

          <div className="quote-box">
            <blockquote>
              "The future of social media marketing isn't just about using AI tools—it's about having AI agents that work as your dedicated marketing team."
            </blockquote>
            <cite>— Alex Thompson, Digital Marketing Expert</cite>
          </div>

          <h2>Practical Implementation</h2>
          <p>To successfully implement AI in your social media strategy, consider these actionable steps:</p>

          <ol>
            <li><strong>Start with automation:</strong> Begin by automating repetitive tasks like scheduling and basic analytics.</li>
            <li><strong>Invest in AI content tools:</strong> Use AI for content ideation and creation to scale your output.</li>
            <li><strong>Leverage predictive analytics:</strong> Use AI insights to optimize posting times and content types.</li>
            <li><strong>Monitor and adjust:</strong> Continuously refine your AI tools based on performance data.</li>
          </ol>

          <h2>Conclusion</h2>
          <p>The integration of AI in social media marketing is not just a trend—it's the future. Businesses that embrace these technologies now will have a significant advantage over their competitors. The key is to start small, learn continuously, and scale gradually.</p>

          <div className="cta-box">
            <h3>Ready to Transform Your Social Media Strategy?</h3>
            <p>Discover how OTOPost's AI agents can revolutionize your social media marketing.</p>
            <button className="btn-primary" onClick={handleGetStartedClick}>Get Started Free</button>
          </div>
        </div>
      ),
      // tags: ['AI Marketing', 'Social Media', 'Automation', 'Digital Strategy'],
      // relatedPosts: [
      //   {
      //     title: 'The Future of AI in Social Media Marketing: 2024 Trends',
      //     excerpt: 'Discover how artificial intelligence is revolutionizing social media marketing and what trends to watch for in 2024.',
      //     image: '🤖'
      //   },
      //   {
      //     title: 'How Small Businesses Can Compete with Enterprise Brands',
      //     excerpt: 'Level the playing field with smart strategies and AI-powered tools that give small businesses enterprise-level capabilities.',
      //     image: '🏪'
      //   },
      //   {
      //     title: 'Case Study: 500% Engagement Increase in 3 Months',
      //     excerpt: 'A detailed breakdown of how a B2B startup transformed their social media presence using AI-powered content strategies.',
      //     image: '📊'
      //   }
      // ]
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);

  if (selectedPost) {
    return (
      <BlogPost 
        post={{
          ...selectedPost,
          category: categories.find(cat => cat.id === selectedPost.category)?.name || selectedPost.category
        }}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  return (
    <div className="App">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-particles"></div>
        <div className="neural-grid"></div>
      </div>

      {/* Cursor Glow Effect */}
      <div 
        className="cursor-glow" 
        style={{
          left: mousePosition.x - 100,
          top: mousePosition.y - 100
        }}
      ></div>

        {/* Navigation */}
        <Navigation />

      {/* Hero Section */}
      <section className="hero-section blog-hero">
        <div className="hero-container1">
          <div className="hero-content text-center">
            <div className="hero-badge">
              <span className="badge-text">⚡ Insights on AI & Social Media ⚡</span>
            </div>
            
            <h1 className="hero-title">
              <span >Stay Ahead with</span>
              <span className=" gradient-text-cyan"> Expert Insights</span>
              <span className="">& <span className="gradient-text-pink"> Industry Trends</span></span>
            </h1>

            <p className="hero-description !mb-[1rem]">
              Discover the latest strategies, case studies, and insights from the world of AI-powered social media marketing. Learn from industry experts and stay ahead of the curve.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="featured-posts-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Featured <span className="gradient-text-cyan">Articles</span>
          </h2>

          <div className="featured-grid">
            {featuredPosts.map((post) => (
              <div key={post.id} className="featured-post-card" onClick={() => setSelectedPost(post)}>
                <div className="post-image">
                  <span className="post-emoji">{post.image}</span>
                  <div className="post-category-badge">
                    {categories.find(cat => cat.id === post.category)?.name}
                  </div>
                </div>
                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-meta">
                    <span className="post-author">By {post.author}</span>
                    <span className="post-date">{new Date(post.date).toLocaleDateString()}</span>
                    <span className="post-read-time">{post.readTime}</span>
                  </div>
                </div>
                <div className="read-more-btn">
                  <span>Read Full Article →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-filter-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Browse by <span className="gradient-text-pink">Category</span>
          </h2>

          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="all-posts-section">
        <div className="container">
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
                <div className="card-header">
                  <div className="post-emoji">{post.image}</div>
                  <div className="post-category">
                    {categories.find(cat => cat.id === post.category)?.name}
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-excerpt">{post.excerpt}</p>
                </div>
                <div className="card-footer">
                  <div className="post-meta">
                    <span className="author">By {post.author}</span>
                    <span className="date">{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="read-time">{post.readTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2 className="section-title-consistent">
              Never Miss an <span className="gradient-text-cyan">Update</span>
            </h2>
            <p className="newsletter-description">
              Get the latest insights, tips, and industry news delivered straight to your inbox.
            </p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" className="email-input" />
              <button className="subscribe-btn">
                <span>Subscribe</span>
                <div className="btn-glow"></div>
              </button>
            </div>
            <p className="newsletter-note">
              Join 10,000+ marketers who trust our insights. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
          .hero-container1 {
    display: grid
;
    gap: 4rem;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}
        /* Blog Page Specific Styles */
        .blog-hero {
          padding: 120px 0 0px;
          min-height: 75vh;
          display: flex;
          align-items: center;  
        }

        /* Featured Posts */
        .featured-posts-section {
          padding: 0px 0 80px;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .featured-post-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s ease;
          position: relative;
        }

        .featured-post-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border-color: #00d4ff;
        }

        .post-image {
          height: 200px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 27, 107, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .post-emoji {
          font-size: 64px;
        }

        .post-category-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #00d4ff;
          color: #000;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .featured-post-card .post-content {
          padding: 32px;
        }

        .featured-post-card .post-title {
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .featured-post-card .post-excerpt {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .featured-post-card .post-meta {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .read-more-btn {
          padding: 16px 32px;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #00d4ff;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .featured-post-card:hover .read-more-btn {
          background: rgba(0, 212, 255, 0.1);
        }

        /* Category Filter */
        .category-filter-section {
          padding: 80px 0 40px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 27, 107, 0.05));
        }

        .category-tabs {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          transform: translateY(-2px);
        }

        .category-tab.active {
          background: linear-gradient(135deg, #00d4ff, #ff1b6b);
          border-color: transparent;
          color: #fff;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .category-icon {
          font-size: 16px;
        }

        .category-name {
          font-weight: 600;
          white-space: nowrap;
        }

        /* All Posts */
        .all-posts-section {
          padding: 40px 0 104px;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 40px;
        }

        .post-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .post-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-4px);
          border-color: rgba(0, 255, 255, 0.3);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .post-card .post-emoji {
          font-size: 24px;
        }

        .post-card .post-category {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-title {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .card-excerpt {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-footer .post-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .author,
        .date {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .read-time {
          font-size: 12px;
          color: #00d4ff;
          font-weight: 600;
        }

        /* Newsletter */
        .newsletter-section {
          padding: 100px 0 120px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 27, 107, 0.1));
        }

        .newsletter-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .newsletter-description {
          color: rgba(255, 255, 255, 0.8);
          font-size: 18px;
          margin-bottom: 40px;
        }

        .newsletter-form {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .email-input {
          flex: 1;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
        }

        .email-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .subscribe-btn {
          padding: 16px 32px;
          background: linear-gradient(135deg, #00d4ff, #ff1b6b);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .subscribe-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .newsletter-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }


        @media (max-width: 1024px) {
          .featured-grid {
            grid-template-columns: 1fr;
          }

          .posts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: 1fr;
          }

          .category-tabs {
            flex-direction: column;
            align-items: center;
          }

          .category-tab {
            width: 100%;
            max-width: 200px;
            justify-content: center;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .post-title {
            font-size: 32px;
          }

          .post-header .post-meta {
            flex-direction: column;
            align-items: center;
          }

          .post-content {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default BlogPage;
