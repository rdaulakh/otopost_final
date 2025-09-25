import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { handleGetStartedClick } from '../lib/auth';

function SolutionsPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSolution, setActiveSolution] = useState('agencies');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const solutions = {
    agencies: {
      title: 'For Marketing Agencies',
      subtitle: 'Scale Your Client Services with AI',
      icon: '🏢',
      color: '#00d4ff',
      painPoints: [
        'Managing multiple client accounts manually',
        'Struggling to deliver consistent results',
        'High operational costs and time investment',
        'Difficulty scaling without hiring more staff'
      ],
      howWeHelp: [
        'Automate content creation for all clients',
        'Deliver consistent, high-quality results',
        'Reduce operational costs by 70%',
        'Scale to 10x more clients with same team'
      ],
      keyFeatures: [
        'Multi-client dashboard management',
        'White-label reporting and analytics',
        'Automated client onboarding',
        'Team collaboration tools'
      ],
      stats: [
        { label: 'Client Capacity Increase', value: '10x' },
        { label: 'Operational Cost Reduction', value: '70%' },
        { label: 'Time Savings', value: '85%' }
      ]
    },
    businesses: {
      title: 'For Small Businesses',
      subtitle: 'Professional Social Media Without the Overhead',
      icon: '🏪',
      color: '#ff1b6b',
      painPoints: [
        'No dedicated marketing team or budget',
        'Inconsistent posting and engagement',
        'Lack of social media expertise',
        'Time constraints from running the business'
      ],
      howWeHelp: [
        'Get a full marketing team for the price of a tool',
        'Maintain consistent, professional presence',
        'Access expert-level strategies and content',
        'Free up time to focus on your business'
      ],
      keyFeatures: [
        'Affordable enterprise-level features',
        'Simple setup and onboarding',
        'Local business optimization',
        'Customer engagement automation'
      ],
      stats: [
        { label: 'Marketing Cost Savings', value: '90%' },
        { label: 'Engagement Increase', value: '150%' },
        { label: 'Time Saved Weekly', value: '20hrs' }
      ]
    },
    ecommerce: {
      title: 'For E-commerce Brands',
      subtitle: 'Drive Sales Through Strategic Social Commerce',
      icon: '🛒',
      color: '#ffa500',
      painPoints: [
        'Converting social media followers to customers',
        'Managing product promotions across platforms',
        'Tracking ROI from social media efforts',
        'Creating compelling product-focused content'
      ],
      howWeHelp: [
        'Create sales-focused content that converts',
        'Automate product promotion campaigns',
        'Track and optimize social commerce ROI',
        'Generate compelling product storytelling'
      ],
      keyFeatures: [
        'Product catalog integration',
        'Sales-focused content generation',
        'Social commerce optimization',
        'Revenue attribution tracking'
      ],
      stats: [
        { label: 'Social Commerce ROI', value: '+280%' },
        { label: 'Conversion Rate Increase', value: '45%' },
        { label: 'Revenue Attribution', value: '100%' }
      ]
    },
    startups: {
      title: 'For Startups',
      subtitle: 'Build Your Brand from Day One',
      icon: '🚀',
      color: '#8a2be2',
      painPoints: [
        'Limited marketing budget and resources',
        'Need to build brand awareness quickly',
        'Competing with established brands',
        'Lack of marketing expertise in-house'
      ],
      howWeHelp: [
        'Get professional marketing on a startup budget',
        'Build brand awareness with strategic content',
        'Compete effectively with AI-powered insights',
        'Access expert marketing knowledge instantly'
      ],
      keyFeatures: [
        'Startup-friendly pricing',
        'Brand building content strategies',
        'Growth hacking techniques',
        'Investor-ready analytics'
      ],
      stats: [
        { label: 'Brand Awareness Growth', value: '+320%' },
        { label: 'Marketing Budget Efficiency', value: '95%' },
        { label: 'Time to Market', value: '-60%' }
      ]
    }
  };

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
      <section className="hero-section solutions-hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">⚡ Tailored Solutions for Every Business ⚡</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">The Perfect</span>
              <span className="title-line gradient-text-cyan">Social Media Solution,</span>
              <span className="title-line">No Matter Your <span className="gradient-text-pink">Business</span></span>
            </h1>

            <p className="hero-description">
              Whether you're a marketing agency managing dozens of clients, a small business owner wearing many hats, or a startup building your brand from scratch - we have the perfect solution tailored to your unique needs and challenges.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary-large">
                <span>Find Your Solution</span>
                <div className="btn-glow"></div>
              </button>
              <button className="btn-secondary-large">
                <span>See All Use Cases</span>
              </button>
            </div>
          </div>

          {/* Solution Icons Grid */}
          <div className="hero-visual">
            <div className="solutions-grid">
              {Object.entries(solutions).map(([key, solution], index) => (
                <div 
                  key={key}
                  className={`solution-preview ${activeSolution === key ? 'active' : ''}`}
                  style={{ 
                    '--solution-color': solution.color,
                    '--delay': `${index * 0.2}s`
                  }}
                  onClick={() => setActiveSolution(key)}
                >
                  <div className="solution-icon">{solution.icon}</div>
                  <h4>{solution.title}</h4>
                  <div className="solution-glow"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Selector */}
      <section className="solution-selector-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Choose Your <span className="gradient-text-cyan">Business Type</span>
          </h2>
          
          <div className="selector-tabs">
            {Object.entries(solutions).map(([key, solution]) => (
              <button
                key={key}
                className={`selector-tab ${activeSolution === key ? 'active' : ''}`}
                onClick={() => setActiveSolution(key)}
                style={{ '--solution-color': solution.color }}
              >
                <span className="tab-icon">{solution.icon}</span>
                <span className="tab-title">{solution.title}</span>
                <div className="tab-indicator"></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Solution Display */}
      <section className="solution-details-section">
        <div className="container">
          {Object.entries(solutions).map(([key, solution]) => (
            <div 
              key={key}
              className={`solution-detail ${activeSolution === key ? 'active' : ''}`}
            >
              <div className="solution-header">
                <div className="solution-badge" style={{ background: solution.color }}>
                  <span className="badge-icon">{solution.icon}</span>
                </div>
                <div className="solution-info">
                  <h3>{solution.title}</h3>
                  <p>{solution.subtitle}</p>
                </div>
                <div className="solution-stats">
                  {solution.stats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <div className="stat-value" style={{ color: solution.color }}>{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="solution-content">
                <div className="content-section">
                  <h4>Pain Points We Address</h4>
                  <div className="pain-points">
                    {solution.painPoints.map((point, index) => (
                      <div key={index} className="pain-point">
                        <div className="pain-icon">❌</div>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-section">
                  <h4>How OTOPost Helps</h4>
                  <div className="help-points">
                    {solution.howWeHelp.map((point, index) => (
                      <div key={index} className="help-point">
                        <div className="help-icon" style={{ background: solution.color }}>✓</div>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-section">
                  <h4>Key Features for Your Business</h4>
                  <div className="feature-grid">
                    {solution.keyFeatures.map((feature, index) => (
                      <div key={index} className="feature-card">
                        <div className="feature-icon" style={{ background: solution.color }}>⚡</div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="solution-cta">
                <div className="cta-buttons-container">
                  <button className="btn-primary-xl" style={{ background: `linear-gradient(135deg, ${solution.color}, rgba(255, 255, 255, 0.1))` }} onClick={handleGetStartedClick}>
                    <span>Get Started with {solution.title}</span>
                    <div className="btn-glow"></div>
                  </button>
                  <a href="/pricing" className="btn-secondary-xl">View Pricing Plans</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories */}
      <section className="success-stories-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Real Results from <span className="gradient-text-pink">Real Businesses</span>
          </h2>

          <div className="stories-grid">
            <div className="story-card">
              <div className="story-header">
                <div className="story-icon">🏢</div>
                <div className="story-type">Marketing Agency</div>
              </div>
              <div className="story-content">
                <h4>"Scaled from 5 to 50 clients without hiring"</h4>
                <p>"OTOPost allowed us to take on 10x more clients while maintaining the same quality of service. Our operational costs dropped by 70% while revenue increased 400%."</p>
                <div className="story-metrics">
                  <div className="metric">
                    <span className="metric-value">10x</span>
                    <span className="metric-label">Client Growth</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">400%</span>
                    <span className="metric-label">Revenue Increase</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="story-card">
              <div className="story-header">
                <div className="story-icon">🛒</div>
                <div className="story-type">E-commerce Brand</div>
              </div>
              <div className="story-content">
                <h4>"Social media became our #1 sales channel"</h4>
                <p>"Within 3 months, social media went from 5% to 35% of our total revenue. The AI creates product content that actually converts customers."</p>
                <div className="story-metrics">
                  <div className="metric">
                    <span className="metric-value">35%</span>
                    <span className="metric-label">Revenue from Social</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">280%</span>
                    <span className="metric-label">ROI Increase</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="story-card">
              <div className="story-header">
                <div className="story-icon">🚀</div>
                <div className="story-type">Tech Startup</div>
              </div>
              <div className="story-content">
                <h4>"Built brand awareness on a shoestring budget"</h4>
                <p>"As a bootstrap startup, we couldn't afford a marketing team. OTOPost gave us enterprise-level marketing for less than a junior marketer's salary."</p>
                <div className="story-metrics">
                  <div className="metric">
                    <span className="metric-value">320%</span>
                    <span className="metric-label">Brand Awareness</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">95%</span>
                    <span className="metric-label">Cost Savings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section !pt-[60px]">
        <div className="container">
          <div className="cta-content">
            <h2 className="section-title-consistent">
              Ready to Transform Your <span className="gradient-text-cyan">Social Media Strategy?</span>
            </h2>
            <p className="cta-description">
              Join thousands of businesses who've already found their perfect social media solution with OTOPost.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary-xl" onClick={handleGetStartedClick}>
                <span>Start Your Free Trial</span>
                <div className="btn-glow"></div>
              </button>
              <a href="/how-it-works" className="btn-secondary-large">See How It Works</a>
            </div>
            <div className="cta-features !pt-[25px] !pb-[30px] !justify-center">
              <span>✓ Perfect for any business size</span>
              <span>✓ 14-day free trial</span>
              <span>✓ No setup fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* Solutions Page Specific Styles */
        .solutions-hero {
          padding: 120px 0 0px;
          min-height: 110vh;
          display: flex;
          align-items: center;
        }

        .solutions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          max-width: 400px;
        }

        .solution-preview {
          padding: 32px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease;
          animation-delay: var(--delay);
          animation-fill-mode: both;
        }

        .solution-preview:hover,
        .solution-preview.active {
          transform: translateY(-8px);
          border-color: var(--solution-color);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .solution-icon {
          font-size: 40px;
          margin-bottom: 16px;
          display: block;
        }

        .solution-preview h4 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }

        .solution-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--solution-color), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .solution-preview:hover .solution-glow,
        .solution-preview.active .solution-glow {
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

        /* Solution Selector */
        .solution-selector-section {
          padding: 12px 0 40px;
        }

        .selector-tabs {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .selector-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .selector-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          transform: translateY(-2px);
        }

        .selector-tab.active {
          background: var(--solution-color);
          border-color: var(--solution-color);
          color: #fff;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .tab-icon {
          font-size: 20px;
        }

        .tab-title {
          font-weight: 600;
          white-space: nowrap;
        }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--solution-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .selector-tab.active .tab-indicator {
          transform: scaleX(1);
        }

        /* Solution Details */
        .solution-details-section {
          padding: 40px 0 90px;
          position: relative;
        }

        .solution-detail {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.5s ease;
          pointer-events: none;
          position: absolute;
          width: 100%;
          top: 0;
        }

        .solution-detail.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          position: relative;
        }

        .solution-header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 32px;
          align-items: center;
          margin-bottom: 60px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 24px;
          backdrop-filter: blur(20px);
        }

        .solution-badge {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .badge-icon {
          font-size: 32px;
          z-index: 2;
        }

        .solution-info h3 {
          color: #fff;
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .solution-info p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 18px;
        }

        .solution-stats {
          display: flex;
          gap: 32px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }

        .solution-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-bottom: 60px;
        }

        .content-section h4 {
          color: #fff;
          font-size: 20px;
          margin-bottom: 24px;
          font-weight: 700;
        }

        .pain-points,
        .help-points {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pain-point,
        .help-point {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .pain-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .help-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #000;
          font-weight: bold;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(8px);
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #000;
        }

        .solution-cta {
          padding: 40px;
          background: rgba(33, 37, 41, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          margin-top: 40px;
        }

        .cta-buttons-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .solution-cta .btn-primary-xl {
          flex: 1;
         
          margin: 0;
        }

        .solution-cta .btn-secondary-xl {
          flex: 0 0 auto;
          padding: 16px 32px;
          background: transparent;
          border: 2px solid #D49B4E;
          color: #D49B4E;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .solution-cta .btn-secondary-xl:hover {
          background: #D49B4E;
          color: #000;
          transform: translateY(-2px);
        }

        /* Success Stories */
        .success-stories-section {
          padding: 77px 0 100px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 27, 107, 0.05));
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .story-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 20px;
          padding: 32px;
          backdrop-filter: blur(20px);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.3);
        }

        .story-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 27, 107, 0.1));
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        .story-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 255, 0.4);
          border-color: rgba(0, 212, 255, 0.6);
        }

        .story-card:hover::before {
          opacity: 1;
        }

        .story-card:hover .story-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
        }

        .story-card:hover .story-type {
          color: #00d4ff;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
        }

        .story-card:hover .metric-value {
          color: #00ff88;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
          transform: scale(1.05);
        }

        .story-card:hover .story-content h4 {
          color: #fff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
        }

        .story-card:hover .story-content p {
          color: rgba(255, 255, 255, 0.9);
        }

        .story-card:hover .metric-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .story-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
        }

        .story-icon {
          font-size: 24px;
          transition: all 0.3s ease;
        }

        .story-type {
          color: #00d4ff;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .story-content {
          position: relative;
          z-index: 2;
        }

        .story-content h4 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .story-content p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .story-metrics {
          display: flex;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        .metric {
          text-align: center;
        }

        .metric-value {
          color: #00ff88;
          font-size: 24px;
          font-weight: 700;
          display: block;
          transition: all 0.3s ease;
        }

        .metric-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          transition: all 0.3s ease;
        }

        @media (max-width: 1200px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 60px;
          }

          .solutions-grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 100%;
            gap: 20px;
          }

          .solution-preview {
            padding: 24px 16px;
          }

          .solution-icon {
            font-size: 32px;
          }

          .solution-preview h4 {
            font-size: 14px;
          }
        }

        @media (max-width: 1024px) {
          .solutions-hero {
            padding: 100px 0 0px;
            min-height: 100vh;
          }

          .hero-title {
            font-size: 2.5rem;
            line-height: 1.2;
          }

          .hero-description {
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto 2rem;
          }

          .solution-header {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 24px;
            padding: 30px;
          }

          .solution-stats {
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
          }

          .solution-content {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .stories-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .selector-tabs {
            flex-wrap: wrap;
            gap: 12px;
          }

          .selector-tab {
            flex: 1;
            min-width: 200px;
            justify-content: center;
          }

          .cta-buttons-container {
            flex-direction: column;
            gap: 16px;
          }

          .solution-cta .btn-primary-xl {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .solutions-hero {
            padding: 80px 0 0px;
            min-height: 90vh;
          }

          .hero-title {
            font-size: 2rem;
            line-height: 1.3;
          }

          .hero-description {
            font-size: 1rem;
            max-width: 100%;
            margin: 0 auto 1.5rem;
          }

          .hero-container {
            flex-direction: column;
            text-align: center;
            gap: 40px;
          }

          .solutions-grid {
            grid-template-columns: 1fr;
            max-width: 100%;
            gap: 16px;
          }

          .solution-preview {
            padding: 20px 16px;
          }

          .solution-icon {
            font-size: 28px;
          }

          .solution-preview h4 {
            font-size: 13px;
          }

          .selector-tabs {
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .selector-tab {
            width: 100%;
            max-width: 280px;
            justify-content: center;
            padding: 14px 20px;
          }

          .tab-icon {
            font-size: 18px;
          }

          .tab-title {
            font-size: 14px;
          }

          .solution-header {
            padding: 20px;
            gap: 20px;
          }

          .solution-info h3 {
            font-size: 24px;
          }

          .solution-info p {
            font-size: 16px;
          }

          .solution-stats {
            flex-direction: column;
            gap: 16px;
          }

          .stat-value {
            font-size: 28px;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .content-section h4 {
            font-size: 18px;
          }

          .pain-point,
          .help-point,
          .feature-card {
            padding: 12px 16px;
          }

          .story-card {
            padding: 24px;
          }

          .story-content h4 {
            font-size: 16px;
          }

          .story-metrics {
            flex-direction: column;
            gap: 16px;
          }

          .metric-value {
            font-size: 20px;
          }

          .solution-cta {
            padding: 24px;
            margin-top: 24px;
          }

          .cta-buttons-container {
            flex-direction: column;
            gap: 12px;
          }

          .solution-cta .btn-primary-xl {
            max-width: 100%;
            padding: 14px 24px;
            font-size: 14px;
          }

          .solution-cta .btn-secondary-xl {
            padding: 14px 24px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .solutions-hero {
            padding: 60px 0 0px;
            min-height: 80vh;
          }

          .hero-title {
            font-size: 1.8rem;
            line-height: 1.4;
          }

          .hero-description {
            font-size: 0.95rem;
            margin: 0 auto 1rem;
          }

          .solutions-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .solution-preview {
            padding: 16px 12px;
          }

          .solution-icon {
            font-size: 24px;
          }

          .solution-preview h4 {
            font-size: 12px;
          }

          .selector-tab {
            max-width: 100%;
            padding: 12px 16px;
          }

          .tab-icon {
            font-size: 16px;
          }

          .tab-title {
            font-size: 13px;
          }

          .solution-header {
            padding: 16px;
            gap: 16px;
          }

          .solution-badge {
            width: 60px;
            height: 60px;
          }

          .badge-icon {
            font-size: 24px;
          }

          .solution-info h3 {
            font-size: 20px;
          }

          .solution-info p {
            font-size: 14px;
          }

          .solution-content {
            gap: 20px;
          }

          .content-section h4 {
            font-size: 16px;
            margin-bottom: 16px;
          }

          .pain-point,
          .help-point,
          .feature-card {
            padding: 10px 12px;
            font-size: 14px;
          }

          .pain-icon,
          .help-icon {
            width: 20px;
            height: 20px;
            font-size: 12px;
          }

          .feature-icon {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }

          .stories-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .story-card {
            padding: 20px;
          }

          .story-content h4 {
            font-size: 15px;
          }

          .story-content p {
            font-size: 14px;
          }

          .metric-value {
            font-size: 18px;
          }

          .metric-label {
            font-size: 11px;
          }

          .final-cta-section {
            padding: 40px 0 !important;
          }

          .cta-content h2 {
            font-size: 1.8rem;
          }

          .cta-description {
            font-size: 0.95rem;
          }

          .cta-features {
            flex-direction: column;
            gap: 8px !important;
            padding: 20px 0 !important;
          }

          .cta-features span {
            font-size: 14px;
          }

          .solution-cta {
            padding: 20px;
            margin-top: 20px;
          }

          .cta-buttons-container {
            gap: 10px;
          }

          .solution-cta .btn-primary-xl {
            padding: 12px 20px;
            font-size: 13px;
          }

          .solution-cta .btn-secondary-xl {
            padding: 12px 20px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}

export default SolutionsPage;
