import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { handleGetStartedClick } from '../lib/auth';

function FeaturesPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeDemo, setActiveDemo] = useState('strategy');
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const handleDemoTabClick = (featureId) => {
    setActiveDemo(featureId);

    // Scroll to show the next tab for better UX
    setTimeout(() => {
      const demoNav = document.querySelector('.demo-nav');
      const activeBtn = document.querySelector(`.demo-nav-btn[data-feature="${featureId}"]`);

      if (demoNav && activeBtn) {
        const currentIndex = features.findIndex(feature => feature.id === featureId);

        if (currentIndex === features.length - 1) {
          // If it's the last tab, scroll to show the first tab (circular)
          const firstBtn = demoNav.querySelector('.demo-nav-btn:first-child');
          if (firstBtn) {
            firstBtn.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'start'
            });
          }
        } else if (currentIndex >= 1) {
          // For middle and later tabs, scroll to show the next tab
          const nextBtn = activeBtn.nextElementSibling;
          if (nextBtn) {
            nextBtn.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }
      }
    }, 150);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  const features = [
    {
      id: 'strategy',
      icon: '🧠',
      title: 'AI Strategy & Ideation',
      description: 'Beyond just content, we build the plan. Our AI analyzes your industry, competitors, and audience to create comprehensive social media strategies.',
      color: '#00d4ff',
      benefits: [
        'Competitive analysis and benchmarking',
        'Trend identification and opportunity mapping',
        'Strategic content calendar planning',
        'ROI-focused campaign architecture'
      ],
      demo: {
        title: 'Strategy Planning Dashboard',
        metrics: [
          { label: 'Market Analysis', value: '94.7%', trend: '+12%' },
          { label: 'Competitor Tracking', value: '156', trend: '+23%' },
          { label: 'Trend Accuracy', value: '89.3%', trend: '+8%' }
        ]
      }
    },
    {
      id: 'content',
      icon: '✨',
      title: 'AI-Generated Content & Visuals',
      description: 'Full posts, not just captions. Our AI creates complete social media posts including copy, visuals, and optimized hashtags for each platform.',
      color: '#ff1b6b',
      benefits: [
        'Platform-specific content adaptation',
        'AI-generated visuals and graphics',
        'Hashtag optimization and research',
        'Brand voice consistency'
      ],
      demo: {
        title: 'Content Generation Studio',
        posts: [
          { platform: 'Instagram', content: '🚀 Ready to transform your business?', engagement: '+127%' },
          { platform: 'LinkedIn', content: 'Professional insights for growth...', engagement: '+89%' },
          { platform: 'X', content: 'Quick tips for social success...', engagement: '+156%' }
        ]
      }
    },
    {
      id: 'scheduling',
      icon: '⏰',
      title: 'Smart Scheduling & Publishing',
      description: 'At the optimal time, every time. Our AI determines the best posting times for maximum engagement across all your platforms.',
      color: '#ffa500',
      benefits: [
        'Optimal timing analysis',
        'Cross-platform publishing',
        'Automated queue management',
        'Time zone optimization'
      ],
      demo: {
        title: 'Publishing Calendar',
        schedule: [
          { time: '9:00 AM', platform: 'LinkedIn', status: 'Published', engagement: '2.3K' },
          { time: '2:30 PM', platform: 'Instagram', status: 'Scheduled', engagement: 'Predicted: 1.8K' },
          { time: '6:45 PM', platform: 'X', status: 'Queued', engagement: 'Predicted: 950' }
        ]
      }
    },
    {
      id: 'analytics',
      icon: '📊',
      title: 'Advanced Performance Analytics',
      description: 'Understand what works and why. Our AI provides deep insights into your social media performance with actionable recommendations.',
      color: '#8a2be2',
      benefits: [
        'Real-time performance tracking',
        'Predictive analytics and forecasting',
        'ROI attribution and business impact',
        'Automated optimization suggestions'
      ],
      demo: {
        title: 'Analytics Dashboard',
        insights: [
          { metric: 'Engagement Rate', value: '+127%', period: 'vs last month' },
          { metric: 'Reach Growth', value: '+89%', period: 'vs last month' },
          { metric: 'Follower Growth', value: '+156%', period: 'vs last month' }
        ]
      }
    },
    {
      id: 'voice',
      icon: '🎤',
      title: 'Brand Voice Learning',
      description: 'AI learns and adapts to your unique brand voice, ensuring consistent messaging across all platforms while maintaining authenticity.',
      color: '#00ff88',
      benefits: [
        'Brand voice analysis and learning',
        'Tone consistency across platforms',
        'Custom brand guidelines integration',
        'Voice evolution tracking'
      ],
      demo: {
        title: 'Brand Voice Analyzer',
        analysis: [
          { aspect: 'Tone', score: '94%', description: 'Professional & Friendly' },
          { aspect: 'Style', score: '89%', description: 'Conversational & Engaging' },
          { aspect: 'Consistency', score: '96%', description: 'Highly Consistent' }
        ]
      }
    },
    {
      id: 'management',
      icon: '🌐',
      title: 'Multi-Platform Management',
      description: 'Manage all your social media accounts from one unified dashboard with platform-specific optimization and cross-platform coordination.',
      color: '#ff6347',
      benefits: [
        'Unified dashboard for all platforms',
        'Platform-specific optimization',
        'Cross-platform content coordination',
        'Centralized team collaboration'
      ],
      demo: {
        title: 'Platform Manager',
        platforms: [
          { name: 'Facebook', status: 'Active', posts: '23', engagement: '4.2K' },
          { name: 'Instagram', status: 'Active', posts: '18', engagement: '6.8K' },
          { name: 'LinkedIn', status: 'Active', posts: '12', engagement: '2.1K' },
          { name: 'X', status: 'Active', posts: '31', engagement: '3.5K' },
          { name: 'Google', status: 'Active', posts: '15', engagement: '2.8K' },
          { name: 'YouTube', status: 'Active', posts: '8', engagement: '5.1K' }
        ]
      }
    }
  ];

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
      <section className="hero-section features-hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">⚡ Comprehensive Feature Suite ⚡</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line">Everything You Need to</span>
              <span className="title-line gradient-text-cyan">Dominate</span>
              <span className="title-line gradient-text-pink">Social Media</span>
            </h1>

            <p className="hero-description">
              Our comprehensive platform combines cutting-edge AI technology with intuitive design to deliver enterprise-level social media management capabilities that scale with your business.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={handleGetStartedClick}>
                <span>Explore All Features</span>
                <div className="btn-glow"></div>
              </button>
              <button className="btn-secondary-large">
                <span>See Live Demo</span>
              </button>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="hero-visual">
            <div className="feature-preview-grid">
              {features.slice(0, 6).map((feature, index) => (
                <div
                  key={feature.id}
                  className="preview-card"
                  style={{
                    '--feature-color': feature.color,
                    '--delay': `${index * 0.2}s`
                  }}
                >
                  <div className="preview-icon">{feature.icon}</div>
                  <h4>{feature.title}</h4>
                  <div className="preview-glow"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Grid */}
      <section className="features-grid-section !pt-[0px]">
        <div className="container">
          <h2 className="section-title-consistent">
            Comprehensive <span className="gradient-text-pink">Feature Set</span>
          </h2>

          <div className="features-interactive-grid">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`feature-card-interactive ${hoveredFeature === feature.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{ '--feature-color': feature.color }}
              >
                <div className="feature-header">
                  <div className="feature-icon-large">{feature.icon}</div>
                  <div className="feature-info">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>

                <div className="feature-benefits">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="benefit-item">
                      <div className="benefit-check">✓</div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="feature-cta">
                  <button
                    className="feature-demo-btn"
                    onClick={() => handleDemoTabClick(feature.id)}
                  >
                    View Demo
                  </button>
                </div>

                <div className="feature-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="demo-section">
        <div className="container">
          <div className="demo-section-header">
            <h2 className="section-title-consistent">
              See Our Features in <span className="gradient-text-cyan">Action</span>
            </h2>
            <p className="demo-section-subtitle">
              Experience the power of our AI-driven platform through interactive demonstrations
            </p>
          </div>

          <div className="demo-interface">
            {/* Demo Navigation */}
            <div className="demo-nav-container">
              <div className="demo-nav">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    className={`demo-nav-btn ${activeDemo === feature.id ? 'active' : ''}`}
                    onClick={() => handleDemoTabClick(feature.id)}
                    data-feature={feature.id}
                    style={{ '--feature-color': feature.color }}
                  >
                    <div className="nav-btn-content">
                      <span className="nav-icon">{feature.icon}</span>
                      <span className="nav-label">{feature.title}</span>
                    </div>
                    <div className="nav-btn-glow"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Demo Display */}
            <div className="demo-display">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`demo-panel ${activeDemo === feature.id ? 'active' : ''}`}
                >
                  <div className="demo-header">
                    <div className="demo-title-section">
                      <h4 className="demo-title">{feature.demo.title}</h4>
                      <p className="demo-description">Interactive demonstration of {feature.title.toLowerCase()}</p>
                    </div>
                    <div className="demo-status">
                      <span className="status-dot"></span>
                      <span className="status-text">Live Demo</span>
                    </div>
                  </div>

                  <div className="demo-content">
                    {/* Strategy Demo */}
                    {feature.id === 'strategy' && (
                      <div className="strategy-demo">
                        <div className="metrics-grid">
                          {feature.demo.metrics.map((metric, idx) => (
                            <div key={idx} className="metric-card" style={{ '--delay': `${idx * 0.1}s` }}>
                              <div className="metric-icon">📊</div>
                              <div className="metric-content">
                                <div className="metric-label">{metric.label}</div>
                                <div className="metric-value">{metric.value}</div>
                                <div className="metric-trend">
                                  <span className="trend-icon">↗</span>
                                  {metric.trend}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="strategy-chart">
                          <div className="chart-header">
                            <h5>Performance Overview</h5>
                            <div className="chart-legend">
                              <span className="legend-item">
                                <div className="legend-color" style={{ background: '#00d4ff' }}></div>
                                Strategy Success
                              </span>
                            </div>
                          </div>
                          <div className="chart-bars">
                            <div className="bar" style={{ height: '70%', '--delay': '0.2s' }}>
                              <div className="bar-value">70%</div>
                            </div>
                            <div className="bar" style={{ height: '85%', '--delay': '0.4s' }}>
                              <div className="bar-value">85%</div>
                            </div>
                            <div className="bar" style={{ height: '60%', '--delay': '0.6s' }}>
                              <div className="bar-value">60%</div>
                            </div>
                            <div className="bar" style={{ height: '95%', '--delay': '0.8s' }}>
                              <div className="bar-value">95%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Demo */}
                    {feature.id === 'content' && (
                      <div className="content-demo">
                        <div className="content-header">
                          <h5>Generated Content Preview</h5>
                          <div className="content-stats">
                            <span>3 Posts Generated</span>
                            <span>•</span>
                            <span>2.4K Engagement</span>
                          </div>
                        </div>
                        <div className="posts-grid">
                          {feature.demo.posts.map((post, idx) => (
                            <div key={idx} className="post-preview" style={{ '--delay': `${idx * 0.15}s` }}>
                              <div className="post-header">
                                <div className="post-platform">
                                  <span className="platform-icon">
                                    {post.platform === 'Instagram' ? '📷' :
                                      post.platform === 'LinkedIn' ? '💼' : '🐦'}
                                  </span>
                                  {post.platform}
                                </div>
                                <div className="post-engagement">{post.engagement}</div>
                              </div>
                              <div className="post-content">{post.content}</div>
                              <div className="post-actions">
                                <button className="action-btn">Edit</button>
                                <button className="action-btn primary">Schedule</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scheduling Demo */}
                    {feature.id === 'scheduling' && (
                      <div className="scheduling-demo">
                        <div className="schedule-header">
                          <h5>Publishing Calendar</h5>
                          <div className="schedule-controls">
                            <button className="control-btn active">Today</button>
                            <button className="control-btn">Week</button>
                            <button className="control-btn">Month</button>
                          </div>
                        </div>
                        <div className="schedule-timeline">
                          {feature.demo.schedule.map((item, idx) => (
                            <div key={idx} className="schedule-item" style={{ '--delay': `${idx * 0.1}s` }}>
                              <div className="schedule-time">
                                <span className="time-icon">🕐</span>
                                {item.time}
                              </div>
                              <div className="schedule-content">
                                <div className="schedule-platform">
                                  <span className="platform-icon">
                                    {item.platform === 'Instagram' ? '📷' :
                                      item.platform === 'LinkedIn' ? '💼' : '🐦'}
                                  </span>
                                  {item.platform}
                                </div>
                                <div className="schedule-engagement">{item.engagement}</div>
                              </div>
                              <div className={`schedule-status ${item.status.toLowerCase()}`}>
                                <span className="status-icon">
                                  {item.status === 'Published' ? '✅' :
                                    item.status === 'Scheduled' ? '⏰' : '📋'}
                                </span>
                                {item.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analytics Demo */}
                    {feature.id === 'analytics' && (
                      <div className="analytics-demo">
                        <div className="analytics-header">
                          <h5>Performance Analytics</h5>
                          <div className="analytics-period">Last 30 Days</div>
                        </div>
                        <div className="insights-grid">
                          {feature.demo.insights.map((insight, idx) => (
                            <div key={idx} className="insight-card" style={{ '--delay': `${idx * 0.1}s` }}>
                              <div className="insight-icon">📈</div>
                              <div className="insight-content">
                                <div className="insight-metric">{insight.metric}</div>
                                <div className="insight-value">{insight.value}</div>
                                <div className="insight-period">{insight.period}</div>
                              </div>
                              <div className="insight-trend">
                                <span className="trend-arrow">↗</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Voice Demo */}
                    {feature.id === 'voice' && (
                      <div className="voice-demo">
                        <div className="voice-header">
                          <h5>Brand Voice Analysis</h5>
                          <div className="voice-overall-score">
                            <span className="score-label">Overall Score</span>
                            <span className="score-value">93%</span>
                          </div>
                        </div>
                        <div className="voice-analysis-grid">
                          {feature.demo.analysis.map((item, idx) => (
                            <div key={idx} className="voice-analysis" style={{ '--delay': `${idx * 0.1}s` }}>
                              <div className="analysis-header">
                                <div className="analysis-aspect">{item.aspect}</div>
                                <div className="analysis-score">{item.score}</div>
                              </div>
                              <div className="analysis-description">{item.description}</div>
                              <div className="analysis-bar">
                                <div
                                  className="analysis-progress"
                                  style={{
                                    width: item.score,
                                    '--feature-color': feature.color
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Management Demo */}
                    {feature.id === 'management' && (
                      <div className="management-demo">
                        <div className="management-header">
                          <h5>Platform Management</h5>
                          <div className="management-summary">
                            <span>6 Active Platforms</span>
                            <span>•</span>
                            <span>107 Total Posts</span>
                          </div>
                        </div>
                        <div className="platforms-grid">
                          {feature.demo.platforms.map((platform, idx) => (
                            <div key={idx} className="platform-card" style={{ '--delay': `${idx * 0.1}s` }}>
                              <div className="platform-header">
                                <div className="platform-name">
                                  <span className="platform-icon">
                                    {platform.name === 'Facebook' ? (
                                      <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                      </svg>
                                    ) : platform.name === 'Instagram' ? (
                                      <svg viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                    ) : platform.name === 'LinkedIn' ? (
                                      <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                      </svg>
                                    ) : platform.name === 'X' ? (
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                      </svg>
                                    ) : platform.name === 'Google' ? (
                                      <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                      </svg>
                                    ) : platform.name === 'YouTube' ? (

                                      <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                      </svg>
                                    ) : (
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                      </svg>
                                    )}
                                  </span>
                                  {platform.name}
                                </div>
                                <div className={`platform-status ${platform.status.toLowerCase()}`}>
                                  <span className="status-dot"></span>
                                  {platform.status}
                                </div>
                              </div>
                              <div className="platform-stats">
                                <div className="stat-item">
                                  <span className="stat-label">Posts</span>
                                  <span className="stat-value">{platform.posts}</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">Engagement</span>
                                  <span className="stat-value">{platform.engagement}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="comparison-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Why Choose <span className="gradient-text-cyan">OTOPost</span>?
          </h2>

          <div className="comparison-table">
            <div className="comparison-header">
              <div className="header-item">Feature</div>
              <div className="header-item">Traditional Tools</div>
              <div className="header-item otopost">OTOPost</div>
            </div>

            <div className="comparison-rows">
              <div className="comparison-row">
                <div className="row-feature">AI Strategy Planning</div>
                <div className="row-traditional">❌ Manual planning required</div>
                <div className="row-otopost">✅ Fully automated with AI insights</div>
              </div>
              <div className="comparison-row">
                <div className="row-feature">Content Generation</div>
                <div className="row-traditional">❌ Basic templates only</div>
                <div className="row-otopost">✅ Complete posts with visuals</div>
              </div>
              <div className="comparison-row">
                <div className="row-feature">Multi-Platform Management</div>
                <div className="row-traditional">❌ Separate tools needed</div>
                <div className="row-otopost">✅ Unified dashboard for all platforms</div>
              </div>
              <div className="comparison-row">
                <div className="row-feature">Performance Analytics</div>
                <div className="row-traditional">❌ Basic metrics only</div>
                <div className="row-otopost">✅ Predictive analytics with AI insights</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="section-title-consistent">
              Ready to <span className="gradient-text-pink">Experience</span> These <span className="gradient-text-cyan">Powerful Features?</span>
            </h2>
            <p className="cta-description">
              Join thousands of businesses who've already transformed their social media presence with our comprehensive feature set.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary-xl" onClick={handleGetStartedClick}>
                <span>Start Your Free Trial</span>
                <div className="btn-glow"></div>
              </button>
              <a href="/pricing" className="btn-secondary-large">View Pricing Plans</a>
            </div>
            <div className="cta-features justify-center pt-[25px] pb-[30px]">
              <span>✓ All features included</span>
              <span>✓ 14-day free trial</span>
              <span>✓ No setup fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* Features Page Specific Styles */
        .features-hero {
          padding: 120px 0 40px;
          display: flex;
          align-items: center;
          min-height: 107vh;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .feature-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 100%;
        }

        .preview-card {
          padding: 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .preview-card:hover {
          transform: translateY(-5px);
          border-color: var(--feature-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .preview-icon {
          font-size: 32px;
          margin-bottom: 12px;
          display: block;
        }

        .preview-card h4 {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }

        .preview-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--feature-color), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .preview-card:hover .preview-glow {
          opacity: 0.1;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Interactive Features Grid */
        .features-grid-section {
          padding: 90px 0;
        }

        .features-interactive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
          margin-top: 60px;
        }

        .feature-card-interactive {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .feature-card-interactive:hover,
        .feature-card-interactive.hovered {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--feature-color);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .feature-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .feature-icon-large {
          font-size: 48px;
          width: 80px;
          height: 68px;
          padding:10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .feature-card-interactive:hover .feature-icon-large {
          background: var(--feature-color);
          transform: scale(1.1);
        }

        .feature-info h3 {
          color: #fff;
          font-size: 20px;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .feature-info p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .feature-benefits {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .benefit-check {
          width: 20px;
          height: 20px;
          background: var(--feature-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #000;
          font-weight: bold;
        }

        .feature-cta {
          text-align: center;
        }

        .feature-demo-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--feature-color), rgba(255, 255, 255, 0.1));
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .feature-demo-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .feature-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--feature-color), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card-interactive:hover .feature-glow {
          opacity: 0.05;
        }

        /* Demo Section */
        .demo-section {
          padding: 100px 0;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.03), rgba(255, 27, 107, 0.03));
          position: relative;
        }

        .demo-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(255, 27, 107, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .demo-section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .demo-section-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 20px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .demo-interface {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(0, 255, 255, 0.15);
          border-radius: 32px;
          padding: 50px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: visible;
        }

        .demo-interface::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), transparent, rgba(255, 27, 107, 0.05));
          pointer-events: none;
        }

        .demo-nav-container {
          margin-bottom: 40px;
        }

        .demo-nav {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: nowrap;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 255, 0.5) transparent;
        }

        .demo-nav::-webkit-scrollbar {
          height: 6px;
        }

        .demo-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .demo-nav::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.5);
          border-radius: 3px;
        }

        .demo-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.7);
        }

        .demo-nav-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          overflow: visible;
          min-width: 200px;
          flex: 0 0 auto;
        }

        .demo-nav-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .demo-nav-btn.active {
          background: var(--feature-color);
          border-color: var(--feature-color);
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }

        .nav-btn-content {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .nav-icon {
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        .demo-nav-btn:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
          word-break: keep-all;
        }

        .nav-btn-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--feature-color), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .demo-nav-btn.active .nav-btn-glow {
          opacity: 0.2;
        }

        .demo-display {
          position: relative;
          min-height: 600px;
          overflow: hidden;
        }

        .demo-panel {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          padding-bottom: 20px;
          min-height: 500px;
          max-height: 500px;
          overflow-y: auto;
        }

        .demo-panel.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .demo-panel::-webkit-scrollbar {
          width: 6px;
        }

        .demo-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .demo-panel::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.5);
          border-radius: 3px;
        }

        .demo-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.7);
        }

        .demo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .demo-title-section {
          flex: 1;
        }

        .demo-title {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .demo-description {
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
        }

        .demo-status {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #00ff88;
          font-size: 14px;
          font-weight: 600;
          background: rgba(0, 255, 136, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-weight: 600;
        }


        /* Demo Content Styles */
        .strategy-demo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
          min-height: 400px;
        }

        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .metric-icon {
          font-size: 24px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 255, 255, 0.1);
          border-radius: 12px;
        }

        .metric-content {
          flex: 1;
        }

        .metric-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .metric-value {
          color: #fff;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #00ff88;
          font-size: 14px;
          font-weight: 600;
        }

        .trend-icon {
          font-size: 12px;
        }

        .strategy-chart {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .chart-header h5 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .chart-bars {
          display: flex;
          align-items: end;
          gap: 16px;
          height: 200px;
          padding: 20px 0;
        }

        .bar {
          position: relative;
          width: 50px;
          background: linear-gradient(to top, #00d4ff, #ff1b6b);
          border-radius: 6px 6px 0 0;
          animation: barGrow 1.2s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .bar-value {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
        }

        @keyframes barGrow {
          from { height: 0; }
          to { height: var(--height, 100%); }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .content-demo {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .content-header h5 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .content-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .post-preview {
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .post-preview:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .post-platform {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #00d4ff;
          font-weight: 600;
          font-size: 14px;
        }

        .platform-icon {
          font-size: 16px;
        }

        .post-content {
          color: #fff;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .post-engagement {
          color: #00ff88;
          font-weight: 600;
          font-size: 14px;
        }

        .post-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .action-btn {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.primary {
          background: #00d4ff;
          border-color: #00d4ff;
          color: #000;
          font-weight: 600;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .action-btn.primary:hover {
          background: #00b8e6;
        }

        .scheduling-demo {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .schedule-header h5 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .schedule-controls {
          display: flex;
          gap: 8px;
        }

        .control-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn.active {
          background: #00d4ff;
          border-color: #00d4ff;
          color: #000;
          font-weight: 600;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .schedule-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 12px;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .schedule-item:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .schedule-time {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          min-width: 100px;
        }

        .time-icon {
          font-size: 16px;
        }

        .schedule-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .schedule-platform {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #00d4ff;
          font-size: 14px;
        }

        .schedule-engagement {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .schedule-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }

        .schedule-status.published {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .schedule-status.scheduled {
          background: rgba(255, 165, 0, 0.2);
          color: #ffa500;
          border: 1px solid rgba(255, 165, 0, 0.3);
        }

        .schedule-status.queued {
          background: rgba(255, 27, 107, 0.2);
          color: #ff1b6b;
          border: 1px solid rgba(255, 27, 107, 0.3);
        }

        .status-icon {
          font-size: 12px;
        }

        .analytics-demo {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .analytics-header h5 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .analytics-period {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 20px;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .insight-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .insight-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .insight-icon {
          font-size: 24px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 255, 136, 0.1);
          border-radius: 12px;
        }

        .insight-content {
          flex: 1;
        }

        .insight-metric {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .insight-value {
          color: #00ff88;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .insight-period {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .insight-trend {
          color: #00ff88;
          font-size: 20px;
        }

        .trend-arrow {
          font-size: 16px;
        }

        .voice-demo {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 255, 0.5) transparent;
        }

        .voice-demo::-webkit-scrollbar {
          width: 6px;
        }

        .voice-demo::-webkit-scrollbar-track {
          background: transparent;
        }

        .voice-demo::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.5);
          border-radius: 3px;
        }

        .voice-demo::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.7);
        }

        .voice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .voice-header h5 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .voice-overall-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(0, 255, 136, 0.1);
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .score-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }

        .score-value {
          color: #00ff88;
          font-size: 24px;
          font-weight: 700;
        }

        .voice-analysis-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .voice-analysis {
          padding: 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 12px;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .voice-analysis:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .analysis-aspect {
          color: #fff;
          font-weight: 600;
          font-size: 16px;
        }

        .analysis-score {
          color: #00ff88;
          font-weight: 700;
          font-size: 20px;
        }

        .analysis-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .analysis-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .analysis-progress {
          height: 100%;
          background: linear-gradient(90deg, var(--feature-color), #00ff88);
          border-radius: 3px;
          transition: width 1s ease;
        }

        .management-demo {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 255, 0.5) transparent;
        }

        .management-demo::-webkit-scrollbar {
          width: 6px;
        }

        .management-demo::-webkit-scrollbar-track {
          background: transparent;
        }

        .management-demo::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.5);
          border-radius: 3px;
        }

        .management-demo::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.7);
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .management-header h5 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
        }

        .management-summary {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .platforms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .platform-card {
          padding: 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 12px;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .platform-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .platform-header {
          display: flex;
          justify-content: space-between;
          align-items: self-start;
          margin-bottom: 16px;
        }

        .platform-name {
          display: flex;
          gap: 10px;
          color: #fff;
          font-weight: 600;
          font-size: 16px;
        }

        .platform-icon {
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .platform-icon svg {
          width: 100%;
          height: 100%;
        }

        .platform-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .platform-status.active {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .platform-stats {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }

        .stat-value {
          color: #00d4ff;
          font-size: 18px;
          font-weight: 700;
        }

        /* Comparison Section */
        .comparison-section {
          padding: 80px 0;
        }

        .comparison-table {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          overflow: hidden;
          margin-top: 60px;
        }

        .comparison-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          background: rgba(0, 0, 0, 0.3);
        }

        .header-item {
          padding: 20px 24px;
          color: #fff;
          font-weight: 700;
          text-align: center;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-item:last-child {
          border-right: none;
        }

        .header-item.otopost {
          background: linear-gradient(135deg, #00d4ff, #ff1b6b);
        }

        .comparison-rows {
          display: flex;
          flex-direction: column;
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-row:last-child {
          border-bottom: none;
        }

        .comparison-row > div {
          padding: 16px 24px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-row > div:last-child {
          border-right: none;
        }

        .row-feature {
          color: #fff;
          font-weight: 600;
          background: rgba(0, 0, 0, 0.2);
        }

        .row-traditional {
          color: rgba(255, 255, 255, 0.7);
        }

        .row-otopost {
          color: #00ff88;
          background: rgba(0, 255, 136, 0.05);
        }

        @media (max-width: 1200px) {
          .container {
            padding: 0 20px;
          }

          .section-title-consistent {
            font-size: 3rem;
          }

          .demo-interface {
            padding: 40px;
          }

          .features-interactive-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }

          .hero-container {
            gap: 40px;
          }
        }

        @media (max-width: 1024px) {
          .container {
            padding: 0 15px;
          }

          .features-interactive-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .demo-nav {
            flex-wrap: nowrap;
            gap: 6px;
          }

          .demo-nav-btn {
            min-width: 180px;
            flex: 0 0 auto;
            padding: 12px 16px;
            font-size: 14px;
          }

          .strategy-demo {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .metrics-grid {
            gap: 16px;
          }

          .metric-card {
            padding: 16px;
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }

          .metric-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .strategy-chart {
            padding: 16px;
          }

          .chart-bars {
            height: 150px;
            gap: 12px;
          }

          .bar {
            width: 40px;
          }

          .analytics-demo .insights-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }

          .features-hero {
            padding: 80px 0 30px;
            min-height: 70vh;
          }

          .feature-preview-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 100%;
          }

          .posts-grid {
            grid-template-columns: 1fr;
          }

          .platforms-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .comparison-section {
            padding: 60px 0;
          }

          .demo-interface {
            padding: 30px;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 15px;
          }

          .section-title-consistent {
            font-size: 2.5rem;
            margin-bottom: 2rem;
          }

          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 30px;
          }

          .features-hero {
            padding: 127px 0 30px;
            min-height: 60vh;
          }

          .feature-preview-grid {
            grid-template-columns: 1fr;
            max-width: 100%;
            gap: 16px;
          }

          .comparison-header,
          .comparison-row {
            grid-template-columns: 1fr;
          }

          .comparison-row > div {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px 16px;
          }

          .comparison-row > div:last-child {
            border-bottom: none;
          }

          .features-interactive-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .feature-card-interactive {
            padding: 20px;
          }

          .demo-interface {
            padding: 20px;
          }

          .demo-nav {
            flex-direction: row;
            gap: 6px;
            overflow-x: auto;
            padding: 6px;
          }

          .demo-nav-btn {
            width: auto;
            justify-content: center;
            min-width: 160px;
            flex: 0 0 auto;
            padding: 10px 14px;
            font-size: 13px;
          }

          .demo-section-header {
            margin-bottom: 40px;
          }

          .demo-section-subtitle {
            font-size: 1rem;
            padding: 0 10px;
          }

          .analytics-demo .insights-grid {
            grid-template-columns: 1fr;
          }

          .platforms-grid {
            grid-template-columns: 1fr;
          }

          .schedule-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .schedule-content {
            width: 100%;
            justify-content: space-between;
          }

          .voice-analysis {
            padding: 16px;
          }

          .analysis-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .voice-demo {
            max-height: 300px;
          }

          .management-demo {
            max-height: 300px;
          }

          .comparison-section {
            padding: 50px 0;
          }

          .demo-display {
            min-height: 400px;
          }

          .demo-panel {
            min-height: 350px;
            max-height: 350px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 12px;
          }

          .section-title-consistent {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            line-height: 1.2;
          }

          .features-hero {
            padding: 50px 0 20px;
            min-height: 50vh;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            width: 100%;
          }

          .btn-primary-large,
          .btn-secondary-large {
            width: 100%;
            max-width: 280px;
          }

          .feature-preview-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .preview-card {
            padding: 20px;
          }

          .features-interactive-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .feature-card-interactive {
            padding: 16px;
          }

          .demo-interface {
            padding: 16px;
            border-radius: 20px;
            margin: 0 5px;
          }

          .demo-section {
            padding: 50px 0;
          }

          .demo-section-header {
            margin-bottom: 30px;
          }

          .demo-section-subtitle {
            font-size: 0.9rem;
            padding: 0 5px;
          }

          .demo-interface {
            padding: 20px;
            border-radius: 20px;
          }

          .demo-nav {
            gap: 4px;
            padding: 4px;
          }

          .demo-nav-btn {
            min-width: 140px;
            padding: 8px 12px;
            font-size: 12px;
          }

          .nav-label {
            font-size: 12px;
          }

          .demo-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 20px;
          }

          .demo-status {
            align-self: flex-end;
            padding: 6px 12px;
            font-size: 12px;
          }

          .metric-card {
            padding: 16px;
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .metric-icon {
            width: 35px;
            height: 35px;
            font-size: 18px;
          }

          .metric-value {
            font-size: 24px;
          }

          .strategy-chart {
            padding: 16px;
          }

          .chart-bars {
            height: 120px;
            gap: 8px;
          }

          .bar {
            width: 35px;
          }

          .bar-value {
            font-size: 10px;
            top: -20px;
          }

          .post-preview {
            padding: 14px;
          }

          .post-actions {
            flex-direction: column;
            gap: 6px;
          }

          .action-btn {
            width: 100%;
            text-align: center;
            padding: 8px 12px;
            font-size: 11px;
          }

          .schedule-controls {
            flex-wrap: wrap;
            gap: 4px;
          }

          .control-btn {
            flex: 1;
            min-width: 70px;
            text-align: center;
            padding: 6px 8px;
            font-size: 11px;
          }

          .insight-card {
            padding: 16px;
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .insight-icon {
            width: 35px;
            height: 35px;
            font-size: 18px;
          }

          .insight-value {
            font-size: 20px;
          }

          .voice-overall-score {
            padding: 8px 12px;
          }

          .score-value {
            font-size: 20px;
          }

          .platform-card {
            padding: 14px;
          }

          .platform-stats {
            flex-direction: column;
            gap: 8px;
          }

          .stat-item {
            text-align: left;
          }

          .stat-value {
            font-size: 16px;
          }

          .voice-demo {
            max-height: 250px;
          }

          .management-demo {
            max-height: 250px;
          }

          .demo-panel {
            min-height: 300px;
            max-height: 300px;
          }

          .demo-display {
            min-height: 350px;
          }

          .comparison-section {
            padding: 40px 0;
          }

          .comparison-table {
            margin-top: 40px;
            border-radius: 12px;
          }

          .header-item {
            padding: 12px 8px;
            font-size: 14px;
          }

          .comparison-row > div {
            padding: 10px 8px;
            font-size: 13px;
          }

          .comparison-header {
            grid-template-columns: 1fr;
          }

          .comparison-row {
            grid-template-columns: 1fr;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .comparison-row > div {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            text-align: left;
          }

          .comparison-row > div:last-child {
            border-bottom: none;
          }

          .cta-features {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .cta-features span {
            font-size: 14px;
          }
        }

        /* Extra small devices (320px and up) */
        @media (max-width: 360px) {
          .container {
            padding: 0 8px;
          }

          .section-title-consistent {
            font-size: 1.8rem;
          }

          .demo-nav-btn {
            min-width: 120px;
            padding: 6px 10px;
            font-size: 11px;
          }

          .nav-label {
            font-size: 11px;
          }

          .feature-card-interactive {
            padding: 12px;
          }

          .demo-interface {
            padding: 12px;
          }

          .metric-card,
          .post-preview,
          .insight-card,
          .platform-card {
            padding: 12px;
          }

          .btn-primary-large,
          .btn-secondary-large {
            max-width: 250px;
            padding: 12px 20px;
            font-size: 14px;
          }
        }

        /* Landscape orientation for mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .hero-section {
            padding: 40px 0 20px;
            min-height: auto;
          }

          .demo-section {
            padding: 40px 0;
          }

          .demo-display {
            min-height: 300px;
          }

          .voice-demo,
          .management-demo {
            max-height: 250px;
          }
        }
      `}</style>
    </div>
  );
}

export default FeaturesPage;
