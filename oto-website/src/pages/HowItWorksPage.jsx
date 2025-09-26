import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { handleGetStartedClick } from '../lib/auth';

function HowItWorksPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const steps = [
    {
      number: "01",
      title: "Connect & Configure",
      subtitle: "Onboard Your Brand (5 Minutes)",
      description: "Start by securely connecting your social media accounts. Then, in a simple onboarding wizard, you'll provide our AI with key information about your business, target audience, brand voice, and marketing objectives.",
      icon: "🔗",
      color: "cyan"
    },
    {
      number: "02", 
      title: "Your AI Team Gets to Work",
      subtitle: "AI-Powered Strategy & Content Generation",
      description: "Once onboarded, your specialized AI agents take over. The Intelligence Agent analyzes the market, the Strategy Agent builds your monthly plan, and the Creator Agent generates a calendar full of engaging posts.",
      icon: "🤖",
      color: "pink"
    },
    {
      number: "03",
      title: "Review & Approve with a Click", 
      subtitle: "User Approval & Collaboration",
      description: "All AI-generated content is presented in an interactive calendar. You can approve a post with a single click, make minor edits directly, or request a new version from the AI.",
      icon: "✅",
      color: "orange"
    },
    {
      number: "04",
      title: "Sit Back as Your Content Goes Live",
      subtitle: "Automated Publishing & Scheduling", 
      description: "Every post you approve is automatically scheduled and published to the correct platform at the optimal time for maximum engagement. No more manual posting or worrying about time zones.",
      icon: "🚀",
      color: "blue"
    },
    {
      number: "05",
      title: "Track Your Growth & Watch the AI Learn",
      subtitle: "Performance Monitoring & Optimization",
      description: "Monitor your growth in real-time on our advanced analytics dashboard. Meanwhile, our Learning Agent analyzes the data from every post, continuously refining the strategy.",
      icon: "📈",
      color: "purple"
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

      {/* Hero Section with Animated UI Mockup */}
      <section className="hero-section how-it-works-hero !pb-0">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">⚡ Powerful AI, Simple Process ⚡</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Powerful AI,</span>
              <span className="title-line gradient-text-cyan">Simple Process,</span>
              <span className="title-line">You're in <span className="gradient-text-pink">Control</span></span>
            </h1>

            <p className="hero-description">
              Our platform automates the heavy lifting of social media marketing, while our intuitive workflow 
              ensures your brand's voice is always at the heart of everything we do.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={handleGetStartedClick}>
                <span>Start Your Journey</span>
                <div className="btn-glow"></div>
              </button>
              <button className="btn-secondary-large">
                <span>View Live Demo</span>
              </button>
            </div>
          </div>

          {/* Animated UI Mockup */}
          <div className="hero-visual">
            <div className="ui-mockup-container">
              <div className="ui-mockup" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="mockup-title">OTOPost Dashboard</div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-sidebar">
                    <div className="sidebar-item active">📊 Dashboard</div>
                    <div className="sidebar-item">📅 Calendar</div>
                    <div className="sidebar-item">🤖 AI Team</div>
                    <div className="sidebar-item">📈 Analytics</div>
                  </div>
                  <div className="mockup-main">
                    <div className="content-card">
                      <div className="card-header">AI Generated Content</div>
                      <div className="card-content">
                        <div className="content-item">
                          <div className="content-status approved">✓</div>
                          <div className="content-text">Ready to transform your business? 🚀</div>
                        </div>
                        <div className="content-item">
                          <div className="content-status pending">⏳</div>
                          <div className="content-text">New AI insights for your industry...</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Your Journey from <span className="gradient-text-cyan">Onboarding</span> to <span className="gradient-text-pink">Automated Growth</span>
          </h2>

          <div className="interactive-timeline">
            <div className="timeline-progress">
              <div 
                className="progress-line" 
                style={{ height: `${(activeStep + 1) * 20}%` }}
              ></div>
            </div>

            {steps.map((step, index) => (
              <div 
                key={index}
                className={`timeline-step ${index <= activeStep ? 'active' : ''} ${index === activeStep ? 'current' : ''}`}
                onMouseEnter={() => setActiveStep(index)}
              >
                <div className="step-connector">
                  <div className={`step-dot pink`}>
                    <span className="step-icon">{step.icon}</span>
                    <div className="step-pulse"></div>
                  </div>
                </div>

                <div className="step-content">
                  <div className="step-number">{step.number}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <h4 className="step-subtitle">{step.subtitle}</h4>
                  <p className="step-description">{step.description}</p>
                  
                  {/* Interactive Demo for Each Step */}
                  <div className="step-demo">
                    {index === 0 && (
                      <div className="demo-onboarding">
                        <div className="demo-form">
                          <div className="form-field">
                            <label>Business Type</label>
                            <div className="form-input">E-commerce Store</div>
                          </div>
                          <div className="form-field">
                            <label>Target Audience</label>
                            <div className="form-input">Young Professionals</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index === 1 && (
                      <div className="demo-ai-work">
                        <div className="ai-agents">
                          <div className="agent-working">
                            <div className="agent-icon">🧠</div>
                            <div className="agent-status">Intelligence Agent: Analyzing trends...</div>
                          </div>
                          <div className="agent-working">
                            <div className="agent-icon">📋</div>
                            <div className="agent-status">Strategy Agent: Building plan...</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="demo-approval">
                        <div className="content-preview">
                          <div className="preview-post">
                            <div className="post-content">"Ready to transform your business? 🚀"</div>
                            <div className="approval-buttons">
                              <button className="approve-btn">✓ Approve</button>
                              <button className="edit-btn">✏️ Edit</button>
                              <button className="regenerate-btn">🔄 Regenerate</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {index === 3 && (
                      <div className="demo-publishing">
                        <div className="platform-status">
                          <div className="platform">
                            <div className="platform-icon facebook">f</div>
                            <div className="status">Published ✓</div>
                          </div>
                          <div className="platform">
                            <div className="platform-icon instagram">ig</div>
                            <div className="status">Scheduled ⏰</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {index === 4 && (
                      <div className="demo-analytics">
                        <div className="metrics-grid">
                          <div className="metric">
                            <div className="metric-value">+127%</div>
                            <div className="metric-label">Engagement</div>
                          </div>
                          <div className="metric">
                            <div className="metric-value">+89%</div>
                            <div className="metric-label">Reach</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Director Section with Interactive Elements */}
      <section className="director-section">
        <div className="container">
        <h2 className="section-title-consistent">
                Automation with You in the <span className="gradient-text-pink">Director's Chair</span>
              </h2>
              <p className="section-description !max-w-[auto]">
                Our AI is the expert crew, but you are always the director. The platform is designed to give you complete creative control without the manual workload.
              </p>
          <div className="director-content">
            <div className="director-text">
              
              
              <div className="control-features">
                <div className="control-item">
                  <div className="control-icon-red">@</div>
                  <div className="control-text">
                    <h4>Strategic Oversight</h4>
                    <p>Review and approve monthly strategies</p>
                  </div>
                </div>
                <div className="control-item">
                  <div className="control-icon-orange">✏️</div>
                  <div className="control-text">
                    <h4>Content Control</h4>
                    <p>Edit, approve, or regenerate any content</p>
                  </div>
                </div>
                <div className="control-item">
                  <div className="control-icon-blue">📊</div>
                  <div className="control-text">
                    <h4>Performance Insights</h4>
                    <p>Real-time analytics and optimization</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="director-visual">
              <div className="control-dashboard">
                <div className="dashboard-header">
                  <h4>Your Control Center</h4>
                </div>
                <div className="dashboard-controls">
                  <div className="control-panel">
                    <div className="control-button-gradient">
                      <span>Strategy Review</span>
                      <div className="button-indicator-orange"></div>
                    </div>
                    <div className="control-button">
                      <span>Content Approval</span>
                      <div className="button-indicator-green"></div>
                    </div>
                    <div className="control-button">
                      <span>Performance Monitor</span>
                      <div className="button-indicator-green"></div>
                    </div>
                  </div>
                </div>
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
              Ready to Experience the <span className="gradient-text-cyan">Future</span> of <span className="gradient-text-pink"> Social Media </span> Management?
            </h2>
            <p className="cta-description">
              Join thousands of businesses who've already transformed their social media presence with AI.
            </p>
            <div className="cta-buttons ">
              <button className="btn-primary-xl" onClick={handleGetStartedClick}>
                <span>Start Your Free Trial</span>
                <div className="btn-glow"></div>
              </button>
              <a href="#pricing" className="btn-secondary-large">View Pricing Plans</a>
            </div>
            <div className="cta-features justify-center pt-[25px] pb-[30px]">
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* How It Works Specific Styles */
        .how-it-works-hero {
          display: flex;
          align-items: center;
          min-height: 92vh;
        }

        .hero-visual {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ui-mockup-container {
          perspective: 1000px;
        }

        .ui-mockup {
          width: 500px;
          height: 350px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(20px);
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .ui-mockup:hover {
          transform: rotateY(5deg) rotateX(5deg);
        }

        .mockup-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        }

        .mockup-dots {
          display: flex;
          gap: 6px;
        }

        .mockup-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff1b6b;
        }

        .mockup-dots span:nth-child(2) {
          background: #ffa500;
        }

        .mockup-dots span:nth-child(3) {
          background: #00d4ff;
        }

        .mockup-title {
          margin-left: 12px;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
        }

        .mockup-content {
          display: flex;
          height: calc(100% - 45px);
        }

        .mockup-sidebar {
          width: 120px;
          padding: 16px 8px;
          border-right: 1px solid rgba(0, 255, 255, 0.2);
        }

        .sidebar-item {
          padding: 8px 12px;
          margin-bottom: 4px;
          border-radius: 6px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sidebar-item.active {
          background: linear-gradient(135deg, #00d4ff, #ff1b6b);
          color: #fff;
        }

        .mockup-main {
          flex: 1;
          padding: 16px;
        }

        .content-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
        }

        .card-header {
          font-size: 12px;
          color: #00d4ff;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .content-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .content-status {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .content-status.approved {
          background: #00ff88;
          color: #000;
        }

        .content-status.pending {
          background: #ffa500;
          color: #000;
        }

        .content-text {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Timeline Styles */
        .timeline-section {
          padding: 0px 0;
          position: relative;
        }

        .interactive-timeline {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
        }

        .timeline-progress {
          position: absolute;
          left: 50%;
          top: 0;
          width: 4px;
          height: 100%;
          background: rgba(0, 255, 255, 0.2);
          transform: translateX(-50%);
        }

        .progress-line {
          width: 100%;
          background: linear-gradient(180deg, #00d4ff, #ff1b6b);
          transition: height 0.8s ease;
          border-radius: 2px;
        }

        .timeline-step {
          display: flex;
          align-items: flex-start;
          margin-bottom: 80px;
          opacity: 0.6;
          transition: all 0.5s ease;
        }

        .timeline-step.active {
          opacity: 1;
        }

        .timeline-step.current {
          transform: scale(1.02);
        }

        .timeline-step:nth-child(even) {
          flex-direction: row-reverse;
        }

        .timeline-step:nth-child(even) .step-content {
          text-align: right;
        }

        .step-connector {
          position: relative;
          z-index: 2;
          margin: 0 40px;
        }

        .step-dot {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .step-dot.cyan {
          background: linear-gradient(135deg, #00d4ff, #00bfff);
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
        }

        .step-dot.pink {
          background: linear-gradient(135deg, #ff1b6b, #ff69b4);
          box-shadow: 0 0 30px rgba(255, 27, 107, 0.5);
        }

        .step-dot.orange {
          background: linear-gradient(135deg, #ffa500, #ff6347);
          box-shadow: 0 0 30px rgba(255, 165, 0, 0.5);
        }

        .step-dot.blue {
          background: linear-gradient(135deg, #0066ff, #00bfff);
          box-shadow: 0 0 30px rgba(0, 102, 255, 0.5);
        }

        .step-dot.purple {
          background: linear-gradient(135deg, #8a2be2, #da70d6);
          box-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
        }

        .step-icon {
          font-size: 24px;
          z-index: 2;
        }

        .step-pulse {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0;
          animation: pulse 2s infinite;
        }

        .timeline-step.current .step-pulse {
          opacity: 1;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .step-content {
          flex: 1;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .step-content:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 255, 255, 0.4);
          transform: translateY(-5px);
        }

        .step-number {
          font-size: 14px;
          color: #00d4ff;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .step-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .step-subtitle {
          font-size: 16px;
          color: #ff1b6b;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .step-description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .step-demo {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(0, 255, 255, 0.2);
        }

        /* Demo Styles */
        .demo-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-field label {
          display: block;
          font-size: 12px;
          color: #00d4ff;
          margin-bottom: 4px;
        }

        .form-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 6px;
          padding: 8px 12px;
          color: #fff;
          font-size: 14px;
        }

        .ai-agents {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .agent-working {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: rgba(0, 255, 255, 0.1);
          border-radius: 8px;
        }

        .agent-icon {
          font-size: 20px;
        }

        .agent-status {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
        }

        .content-preview {
          text-align: center;
        }

        .preview-post {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .post-content {
          color: #fff;
          margin-bottom: 12px;
        }

        .approval-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .approval-buttons button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .approve-btn {
          background: #00ff88;
          color: #000;
        }

        .edit-btn {
          background: #ffa500;
          color: #000;
        }

        .regenerate-btn {
          background: #ff1b6b;
          color: #fff;
        }

        .platform-status {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .platform {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .platform-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        }

        .platform-icon.facebook {
          background: #1877f2;
          color: #fff;
        }

        .platform-icon.instagram {
          background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
          color: #fff;
        }

        .status {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .metric {
          text-align: center;
          padding: 12px;
          background: rgba(0, 255, 255, 0.1);
          border-radius: 8px;
        }

        .metric-value {
          font-size: 20px;
          font-weight: bold;
          color: #00ff88;
        }

        .metric-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Director Section */
        .director-section {
          padding: 96px 0;
        
        }

        .director-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: end;
        }

        .control-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 32px;
        }

        .control-item {
       display: flex
;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 12px;
    transition: all 0.3s 
ease;
        }

        .control-item:hover {
          transform: translateX(10px);
        }

        .control-icon-red {
          font-size: 16px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ff1b6b;
          border-radius: 3px;
          color: #fff;
          font-weight: bold;
          flex-shrink: 0;
        }

        .control-icon-orange {
          font-size: 16px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffa500;
          border-radius: 3px;
          color: #fff;
          flex-shrink: 0;
        }

        .control-icon-blue {
          font-size: 16px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0066ff;
          border-radius: 3px;
          color: #fff;
          flex-shrink: 0;
        }

        .control-text h4 {
          color: #fff;
          margin-bottom: 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .control-text p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .director-visual {
          display: flex;
          justify-content: end;
        }

        .control-dashboard {
             width: 100%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(20px);
        }

        .dashboard-header h4 {
          color: #fff;
          text-align: left;
          margin-bottom: 24px;
          font-size: 18px;
          font-weight: 600;
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .control-button {
             padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 12px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s 
ease;
    position: relative;
    overflow: hidden;
        }

        .control-button-gradient {
          padding: 16px 20px;
          background: linear-gradient(90deg, #00d4ff, #ff1b6b);
          border: none;
         border-radius: 12px;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 500;
        }

        .control-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }

        .button-indicator-orange {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ffa500;
        }

        .button-indicator-green {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
        }

        /* Mobile First Responsive Design */
        @media (max-width: 1200px) {
          .hero-container {
            gap: 40px;
          }
          
          .ui-mockup {
            width: 400px;
            height: 280px;
          }
          
          .director-content {
            gap: 40px;
          }
        }

        @media (max-width: 992px) {
          .hero-container {
            flex-direction: column;
            text-align: center;
            gap: 60px;
          }

          .hero-visual {
            order: -1;
          }

          .ui-mockup {
            width: 350px;
            height: 250px;
          }

          .director-content {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .control-features {
            align-items: center;
          }

          .control-item {
            max-width: 500px;
          }

          .timeline-step {
            flex-direction: column !important;
            text-align: center !important;
            margin-bottom: 60px;
          }

          .timeline-step:nth-child(even) .step-content {
            text-align: center;
          }

          .step-connector {
            margin: 20px 0;
          }

          .step-content {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .how-it-works-hero {
            min-height: 80vh;
            padding: 112px 0;
          }

          .hero-title {
            font-size: 2.5rem;
            line-height: 1.2;
          }

          .title-line {
            display: block;
            margin-bottom: 8px;
          }

          .hero-description {
            font-size: 1.1rem;
            margin-bottom: 30px;
          }

          .hero-buttons {
            flex-direction: column;
            gap: 16px;
            align-items: center;
          }

          .btn-primary-large,
          .btn-secondary-large {
            width: 100%;
            max-width: 280px;
          }

          .ui-mockup {
            width: 300px;
            height: 220px;
          }

          .mockup-sidebar {
            width: 100px;
            padding: 12px 6px;
          }

          .sidebar-item {
            font-size: 10px;
            padding: 6px 8px;
          }

          .mockup-main {
            padding: 12px;
          }

          .content-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .content-text {
            font-size: 10px;
          }

          .timeline-section {
            padding: 60px 0;
          }

          .section-title-consistent {
            font-size: 2rem;
            margin-bottom: 40px;
          }

          .timeline-progress {
            left: 20px;
            width: 3px;
          }

          .timeline-step {
            padding-left: 60px;
            margin-bottom: 50px;
          }

          .step-dot {
            width: 50px;
            height: 50px;
            position: absolute;
            left: -25px;
          }

          .step-icon {
            font-size: 20px;
          }

          .step-content {
            padding: 24px;
            margin-left: 0;
          }

          .step-title {
            font-size: 1.5rem;
          }

          .step-subtitle {
            font-size: 1rem;
          }

          .step-description {
            font-size: 0.9rem;
          }

          .step-demo {
            padding: 16px;
          }

          .demo-form {
            gap: 8px;
          }

          .form-field label {
            font-size: 11px;
          }

          .form-input {
            font-size: 12px;
            padding: 6px 10px;
          }

          .agent-status {
            font-size: 11px;
          }

          .approval-buttons {
            flex-direction: column;
            gap: 6px;
          }

          .approval-buttons button {
            font-size: 11px;
            padding: 8px 12px;
          }

          .platform {
            flex-direction: column;
            gap: 4px;
            text-align: center;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .metric-value {
            font-size: 18px;
          }

          .director-section {
            padding: 60px 0;
          }

          .control-item {
            flex-direction: column;
            text-align: center;
            padding: 16px;
          }

          .control-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .control-text h4 {
            font-size: 14px;
          }

          .control-text p {
            font-size: 12px;
          }

          .control-dashboard {
            padding: 20px;
          }

          .control-button {
            padding: 12px 16px;
            font-size: 14px;
          }

          .final-cta-section {
            padding: 60px 0;
          }

          .cta-buttons {
            flex-direction: column;
            gap: 16px;
            align-items: center;
          }

          .btn-primary-xl,
          .btn-secondary-large {
            width: 100%;
            max-width: 280px;
          }

          .cta-features {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }

        @media (max-width: 576px) {
          .how-it-works-hero {
            min-height: 70vh;
            padding: 112px 0;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .ui-mockup {
            width: 280px;
            height: 200px;
          }

          .mockup-header {
            padding: 8px 12px;
          }

          .mockup-title {
            font-size: 10px;
          }

          .mockup-sidebar {
            width: 80px;
            padding: 8px 4px;
          }

          .sidebar-item {
            font-size: 9px;
            padding: 4px 6px;
          }

          .mockup-main {
            padding: 8px;
          }

          .card-header {
            font-size: 10px;
          }

          .content-text {
            font-size: 9px;
          }

          .section-title-consistent {
            font-size: 1.5rem;
            margin-bottom: 30px;
          }

          .timeline-step {
            padding-left: 50px;
            margin-bottom: 40px;
          }

          .step-dot {
            width: 40px;
            height: 40px;
            left: -20px;
          }

          .step-icon {
            font-size: 16px;
          }

          .step-content {
            padding: 20px;
          }

          .step-title {
            font-size: 1.25rem;
          }

          .step-subtitle {
            font-size: 0.9rem;
          }

          .step-description {
            font-size: 0.8rem;
          }

          .step-demo {
            padding: 12px;
          }

          .director-section {
            padding: 40px 0;
          }

          .control-dashboard {
            padding: 16px;
          }

          .control-button {
            padding: 10px 12px;
            font-size: 12px;
          }

          .final-cta-section {
            padding: 40px 0;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .ui-mockup {
            width: 260px;
            height: 180px;
          }

          .timeline-step {
            padding-left: 45px;
          }

          .step-dot {
            width: 35px;
            height: 35px;
            left: -17.5px;
          }

          .step-icon {
            font-size: 14px;
          }

          .step-content {
            padding: 16px;
          }

          .step-title {
            font-size: 1.1rem;
          }

          .step-subtitle {
            font-size: 0.8rem;
          }

          .step-description {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default HowItWorksPage;
