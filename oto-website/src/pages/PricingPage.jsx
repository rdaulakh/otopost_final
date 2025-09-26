import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

function PricingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const plans = {
    starter: {
      name: 'Starter',
      subtitle: 'Perfect for small businesses',
      icon: '🚀',
      color: '#00d4ff',
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'Everything you need to get started with AI-powered social media management.',
      features: [
        '3 social media accounts',
        '50 AI-generated posts per month',
        'Basic analytics and reporting',
        'Email support',
        'Content calendar',
        'Hashtag optimization'
      ],
      popular: false
    },
    professional: {
      name: 'Professional',
      subtitle: 'Most popular for growing businesses',
      icon: '⭐',
      color: '#ff1b6b',
      monthlyPrice: 149,
      annualPrice: 119,
      description: 'Advanced AI features and multi-platform management for serious growth.',
      features: [
        '10 social media accounts',
        '200 AI-generated posts per month',
        'Advanced analytics and insights',
        'Priority support',
        'Custom brand voice training',
        'A/B testing capabilities',
        'Team collaboration tools',
        'White-label reporting'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      subtitle: 'For agencies and large organizations',
      icon: '🏢',
      color: '#ffa500',
      monthlyPrice: 399,
      annualPrice: 319,
      description: 'Full-scale AI marketing automation with dedicated support and custom integrations.',
      features: [
        'Unlimited social media accounts',
        'Unlimited AI-generated posts',
        'Advanced AI strategy optimization',
        'Dedicated account manager',
        'Custom integrations & API access',
        'Advanced team management',
        'Custom reporting & analytics',
        'SLA guarantee',
        'Training & onboarding'
      ],
      popular: false
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
      <section className="hero-section pricing-hero">
        <div className="hero-container1">
          <div className="hero-content">
            <h1 className="hero-title">
              The Right Plan for <span className="gradient-text-cyan">Your Growth</span>
            </h1>

            <p className="hero-description !mb-[1rem]">
              Simple, transparent pricing that scales with you. No hidden fees. Start for free, no credit card required.
            </p>

            {/* Pricing Toggle */}
            <div className="pricing-toggle">
              <span className={`toggle-label ${!isAnnual ? 'active' : ''}`}>
                Monthly
              </span>
              <div className="toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
                <div className={`toggle-slider ${isAnnual ? 'annual' : 'monthly'}`}></div>
              </div>
              <span className={`toggle-label ${isAnnual ? 'active' : ''}`}>
                Annual
                <span className="savings-badge">Save 20%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards-section">
        <div className="container">
          <div className="pricing-grid">
            {Object.entries(plans).map(([key, plan]) => (
              <div 
                key={key}
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${selectedPlan === key ? 'selected' : ''}`}
                style={{'--plan-color': plan.color}}
                onClick={() => setSelectedPlan(key)}
              >
                <div className="card-glow"></div>
                
                {plan.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}

                <div className="card-header">
                  <span className="plan-icon">{plan.icon}</span>
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-subtitle">{plan.subtitle}</p>
                </div>

                <div className="card-pricing">
                  <div className="price-display">
                    <span className="currency">$</span>
                    <span className="price">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className="period">/month</span>
                  </div>
                  {isAnnual && (
                    <div className="annual-savings">
                      Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year
                    </div>
                  )}
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="card-features">
                  <h4>What's included:</h4>
                  <ul className="features-list">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <span className="feature-check">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-cta">
                  <button 
                    className="plan-btn"
                    style={{background: plan.color}}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </button>
                  <p className="trial-note">14-day free trial • No credit card required</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="feature-comparison-section">
        <div className="container">
          <h2 className="section-title-consistent">
            All Plans Include Our <span className="gradient-text-cyan">Complete AI Team</span>
          </h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">✓</span>
              </div>
              <h4>7 Specialized AI Agents</h4>
              <p>Each agent is trained for specific tasks like content creation, engagement, and analytics</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">🛡️</span>
              </div>
              <h4>24/7 Autonomous Operation</h4>
              <p>Your AI team works around the clock, posting content and engaging with your audience</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">📈</span>
              </div>
              <h4>Continuous Learning & Optimization</h4>
              <p>AI learns from your audience's behavior and continuously improves performance</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">📅</span>
              </div>
              <h4>Content Calendar Management</h4>
              <p>Automated scheduling and content planning across all your social media platforms</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">📄</span>
              </div>
              <h4>Brand Voice Consistency</h4>
              <p>Maintain your unique brand voice across all content with AI-powered consistency</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">⭐</span>
              </div>
              <h4>Performance Analytics</h4>
              <p>Real-time insights and detailed reports on your social media performance</p>
            </div>
          </div>
        </div>
      </section>

       {/* Cost Comparison Section */}
       <section className="cost-comparison-section">
        <div className="container">
          <h2 className="section-title-consistent">
            <span className="gradient-text-cyan">Traditional Approach</span> vs <span className="gradient-text-pink">OTOPost AI Team</span>
          </h2>

          <div className="cost-comparison-grid">
            <div className="cost-comparison-column traditional-approach">
              <h3>Traditional Approach</h3>
              
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span className="cost-label">Social Media Manager</span>
                  <span className="cost-amount">$4,000/month</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">Content Creator</span>
                  <span className="cost-amount">$3,000/month</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">Analytics Tools</span>
                  <span className="cost-amount">$200/month</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">Design Software</span>
                  <span className="cost-amount">$100/month</span>
                </div>
              </div>

              <div className="total-cost flex justify-between items-center">
                <span className="total-label">Total Cost</span>
                <span className="total-amount">$7,300/month</span>
              </div>

              <div className="limitations">
                <h4>Limitations:</h4>
                <ul>
                  <li>Limited to business hours</li>
                  <li>Human errors and inconsistencies</li>
                  <li>Vacation days and sick leave</li>
                  <li>Requires management oversight</li>
                </ul>
              </div>
            </div>

            <div className="cost-comparison-column otopost-team">
              <h3>OTOPost AI Team</h3>
              
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span className="cost-label">Complete AI Marketing Team</span>
                  <span className="cost-amount">$199/month</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">All Tools & Analytics</span>
                  <span className="cost-amount">Included</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">Content Creation</span>
                  <span className="cost-amount">Included</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">24/7 Operation</span>
                  <span className="cost-amount">Included</span>
                </div>
              </div>

              <div className="total-cost otopost-total flex justify-between items-center">
                <span className="total-label">Total Cost</span>
                <span className="total-amount">$199/month</span>
              </div>

              <div className="benefits">
                <h4>Benefits:</h4>
                <ul>
                  <li>24/7 operation, never sleeps</li>
                  <li>Consistent, data-driven performance</li>
                  <li>No sick days or vacation time</li>
                  <li>Self-managing and optimizing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

    


      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Frequently Asked <span className="gradient-text-pink">Questions</span>
          </h2>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>Can I change plans anytime?</h4>
              <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.</p>
            </div>
            <div className="faq-item">
              <h4>What happens during the free trial?</h4>
              <p>You get full access to all features of your chosen plan for 14 days. No credit card required to start, and you can cancel anytime.</p>
            </div>
            <div className="faq-item">
              <h4>Do you offer refunds?</h4>
              <p>We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment, no questions asked.</p>
            </div>
            <div className="faq-item">
              <h4>Is there a setup fee?</h4>
              <p>No setup fees, ever. You only pay for your monthly or annual subscription. We'll help you get started for free.</p>
            </div>
            <div className="faq-item">
              <h4>Can I add more social accounts?</h4>
              <p>Yes! You can add more accounts as add-ons to any plan, or upgrade to a higher tier for better value.</p>
            </div>
            <div className="faq-item">
              <h4>What kind of support do you provide?</h4>
              <p>All plans include support. Starter gets email support, Professional gets priority support, and Enterprise gets a dedicated account manager.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="section-title-consistent">
              Ready to Transform Your <span className="gradient-text-cyan">Social Media?</span>
            </h2>
            <p className="cta-description">
              Join thousands of businesses already growing with OTOPost. Start your free trial today.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary-xl">
                <span>Start Your Free Trial</span>
                <div className="btn-glow"></div>
              </button>
              <a href="#how-it-works" className="btn-secondary-large">See How It Works</a>
            </div>
            <div className="cta-features !pt-[25px] !pb-[30px] !justify-center">
              <span>✓ 14-day free trial</span>
              <span>✓ No credit card required</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        /* Pricing Page Specific Styles */
        .hero-container1 {
    display: grid
;
    gap: 4rem;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}
        .pricing-hero {
          padding: 120px 0 0px;
          min-height: 61vh;
          display: flex;
          align-items: center;  
        }

        .pricing-toggle {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 30px;
          justify-content: center;
        }

        .toggle-label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toggle-label.active {
          color: #fff;
        }

        .savings-badge {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #000;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .toggle-switch {
          width: 60px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 16px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-slider {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #00d4ff, #ff1b6b);
          border-radius: 50%;
          position: absolute;
          top: 2px;
          transition: all 0.3s ease;
        }

        .toggle-slider.monthly {
          left: 2px;
        }

        .toggle-slider.annual {
          left: 30px;
        }

        /* Pricing Cards */
        .pricing-cards-section {
          padding: 0px 0 120px;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .pricing-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px 32px;
          position: relative;
          transition: all 0.4s ease;
          cursor: pointer;
          overflow: hidden;
        }

        .pricing-card:hover,
        .pricing-card.selected {
          transform: translateY(-8px);
          border-color: var(--plan-color);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .pricing-card.popular {
          border-color: #ff1b6b;
          transform: scale(1.05);
        }

        .pricing-card.popular:hover,
        .pricing-card.popular.selected {
          transform: scale(1.05) translateY(-8px);
        }

        .popular-badge {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #ff1b6b, #ff69b4);
          color: #fff;
          padding: 8px 24px;
          border-radius: 0 0 12px 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .plan-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }

        .plan-name {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .plan-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .card-pricing {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .price-display {
          display: flex;
          align-items: baseline;
          justify-content: center;
          margin-bottom: 8px;
        }

        .currency {
          color: var(--plan-color);
          font-size: 24px;
          font-weight: 600;
        }

        .price {
          color: #fff;
          font-size: 48px;
          font-weight: 700;
          margin: 0 4px;
        }

        .period {
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
        }

        .annual-savings {
          color: #00ff88;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .plan-description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }

        .card-features h4 {
          color: #fff;
          font-size: 16px;
          margin-bottom: 16px;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .feature-check {
          width: 20px;
          height: 20px;
          background: var(--plan-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #000;
          font-weight: bold;
        }

        .card-cta {
          text-align: center;
        }

        .plan-btn {
          width: 100%;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }

        .plan-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .trial-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        .card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--plan-color), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .pricing-card:hover .card-glow,
        .pricing-card.selected .card-glow {
          opacity: 0.05;
        }

        /* Feature Comparison */
        .feature-comparison-section {
          padding: 65px 0 92px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 27, 107, 0.05));
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.3);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 255, 0.4);
          border-color: rgba(0, 212, 255, 0.6);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff1b6b, #00d4ff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          position: relative;
        }

        .feature-icon .icon {
          font-size: 24px;
          color: #fff;
          font-weight: bold;
        }

        .feature-card h4 {
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .feature-card p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          font-size: 14px;
        }

        /* FAQ Section */
        .faq-section {
          padding: 84px 0 102px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 27, 107, 0.05));
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .faq-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s ease;
          box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.3);
        }

        .faq-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 255, 0.4);
          border-color: rgba(0, 212, 255, 0.6);
        }

        .faq-item h4 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .faq-item p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        /* Comparison Section */
        .comparison-section {
          padding: 82px 0;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 40px;
          margin-top: 60px;
          align-items: center;
        }

        .comparison-column {
          padding: 40px;
          border-radius: 20px;
          min-height: 400px;
        }

        .comparison-column.traditional {
          background: rgba(255, 0, 0, 0.05);
          border: 1px solid rgba(255, 0, 0, 0.2);
        }

        .comparison-column.otopost {
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.2);
        }

        .comparison-column h3 {
          color: #fff;
          font-size: 24px;
          margin-bottom: 32px;
          text-align: center;
        }

        .comparison-items {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .comparison-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
        }

        .item-icon {
          font-size: 20px;
          width: 32px;
          text-align: center;
        }

        .comparison-divider {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .vs-badge {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #00d4ff, #ff1b6b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 18px;
        }

        /* Cost Comparison Section */
        .cost-comparison-section {
          padding: 88px 0 102px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 27, 107, 0.05));
        }

        .cost-comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 60px;
        }

        .cost-comparison-column {
          padding: 40px;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          min-height: 500px;
        }

        .traditional-approach {
              background: rgba(255, 0, 0, 0.05);
    border: 1px solid rgba(255, 0, 0, 0.2);
        }

        .otopost-team {
          background: rgba(0, 255, 136, 0.05);
    border: 1px solid rgba(0, 255, 136, 0.2);
        }

        .cost-comparison-column h3 {
          color: #fff;
          font-size: 28px;
          margin-bottom: 32px;
          text-align: start;
          font-weight: 700;
        }

        .cost-breakdown {
          margin-bottom: 32px;
        }

        .cost-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 8px;
        }

        .cost-item:last-child {
          border-bottom: none;
        }

        .cost-label {
          color: #fff;
          font-size: 16px;
          font-weight: 500;
        }

        .cost-amount {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }

        .total-cost {
          text-align: left;
          padding: 12px 0;
          margin-bottom: 21px;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .total-label {
          display: inline;
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          margin-right: 8px;
        }

        .total-amount {
          display: inline;
          color: #fff;
          font-size: 24px;
          font-weight: 800;
        }

        .otopost-total .total-label {
          color: #00ff88;
        }

        .otopost-total .total-amount {
          color: #00ff88;
        }

        .limitations h4,
        .benefits h4 {
          color: #fff;
          font-size: 16px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .limitations ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .limitations li {
          color: #fff;
          padding: 6px 0;
          position: relative;
          padding-left: 16px;
          font-size: 14px;
        }

        .limitations li::before {
          content: '•';
          color: #fff;
          font-size: 16px;
          position: absolute;
          left: 0;
        }

        .benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefits li {
          color: #00ff88;
          padding: 6px 0;
          position: relative;
          padding-left: 16px;
          font-weight: 500;
          font-size: 14px;
        }

        .benefits li::before {
          content: '✓';
          color: #00ff88;
          font-size: 14px;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        @media (max-width: 1024px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .pricing-card.popular {
            transform: none;
          }

          .pricing-card.popular:hover,
          .pricing-card.popular.selected {
            transform: translateY(-8px);
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .vs-badge {
            margin: 20px 0;
          }

          .cost-comparison-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .pricing-toggle {
            flex-direction: column;
            gap: 12px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .feature-card {
            padding: 24px;
          }

          .feature-icon {
            width: 50px;
            height: 50px;
            margin-bottom: 20px;
          }

          .feature-icon .icon {
            font-size: 20px;
          }

          .feature-card h4 {
            font-size: 16px;
            margin-bottom: 12px;
          }

          .feature-card p {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}

export default PricingPage;
