import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import dashboardMockup from './assets/dashboard-mockup.png';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HowItWorksPage from './pages/HowItWorksPage';
import AITeamPage from './pages/AITeamPage';
import FeaturesPage from './pages/FeaturesPage';
import SolutionsPage from './pages/SolutionsPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import { handleGetStartedClick } from './lib/auth';

function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState('content');
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature);
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
      <section className="hero-section how-hero  !pb-[0px]">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">⚡ Introducing Agentic AI for Social Media ⚡</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Stop Managing</span>
              <span className="title-line gradient-text-pink">Social Media</span>
              <span className="title-line">Get an <span className="gradient-text-cyan">AI Team</span></span>
              <span className="title-line">to Do It For You</span>
            </h1>

            <p className="hero-description">
              Our autonomous AI agents strategize, create, and publish 
              expert-level content for your brand, so you can focus on your 
              business while we handle your entire social media presence.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={handleGetStartedClick}>
                <span>Get Started for Free</span>
                <div className="btn-glow"></div>
              </button>
              <button className="btn-secondary-large" onClick={() => navigate('/how-it-works')}>
                <span>See How It Works</span>
              </button>
            </div>

            <div className="hero-features">
              <div className="feature-item">
                <span className="checkmark">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✓</span>
                <span>14-day free trial</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-container">
              <img src={dashboardMockup} alt="OTOPost Dashboard" className="dashboard-mockup" />
              
              <div className="floating-elements">
                <div className="floating-orb orb-1"></div>
                <div className="floating-orb orb-2"></div>
                <div className="floating-orb orb-3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Connections */}
      <section className="platforms-section">
        <div className="container">
          <h2 className="section-title-consistent">Connect Your <span className="gradient-text-cyan">Platforms</span></h2>
          <div className="platforms-grid">
            <div className="platform-card youtube">
              <div className="platform-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <span>YouTube</span>
            </div>
            <div className="platform-card facebook">
              <div className="platform-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span>Facebook</span>
            </div>
            <div className="platform-card instagram">
              <div className="platform-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span>Instagram</span>
            </div>
            <div className="platform-card twitter">
              <div className="platform-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span>X</span>
            </div>
            <div className="platform-card linkedin">
              <div className="platform-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span>LinkedIn</span>
            </div>
            <div className="platform-card google">
              <div className="platform-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <span>Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* REDESIGNED Problem/Solution Section - CLEAN SPLIT LAYOUT */}
      <section className="problem-solution-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Social media marketing is <span className="title-line gradient-text-pink">complex</span><br />
            Your <span className="gradient-text-cyan">solution</span> shouldn't be
          </h2>
          
          <div className="split-comparison">
            <div className="problems-side">
              <div className="side-header">
                <div className="side-icon problems-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <h3>Current Problems</h3>
              </div>
              
              <div className="problem-list">
                <div className="problem-item">
                  <div className="problem-number">01</div>
                  <div className="problem-content">
                    <h4>Endless Manual Work</h4>
                    <p>Hours spent daily creating, scheduling, and managing content across multiple platforms.</p>
                  </div>
                </div>
                
                <div className="problem-item">
                  <div className="problem-number">02</div>
                  <div className="problem-content">
                    <h4>Uncertain ROI</h4>
                    <p>Difficulty measuring what works and optimizing for better results across platforms.</p>
                  </div>
                </div>
                
                <div className="problem-item">
                  <div className="problem-number">03</div>
                  <div className="problem-content">
                    <h4>Juggling Multiple Tools</h4>
                    <p>Managing different platforms for creation, scheduling, analytics, and optimization.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="transformation-arrow">
              <div className="arrow-container">
                <div className="arrow-line"></div>
                <div className="arrow-head">→</div>
                <div className="transform-text">AI TRANSFORMS</div>
              </div>
            </div>

            <div className="solutions-side">
              <div className="side-header">
                <div className="side-icon solutions-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3>AI Solutions</h3>
              </div>
              
              <div className="solution-list">
                <div className="solution-item">
                  <div className="solution-number">01</div>
                  <div className="solution-content">
                    <h4>Automated from Strategy to Post</h4>
                    <p>Our AI handles everything from content creation to posting, freeing up your valuable time.</p>
                  </div>
                </div>
                
                <div className="solution-item">
                  <div className="solution-number">02</div>
                  <div className="solution-content">
                    <h4>Data-Driven, Expert Results</h4>
                    <p>AI learns and optimizes for performance, delivering measurable results you can track.</p>
                  </div>
                </div>
                
                <div className="solution-item">
                  <div className="solution-number">03</div>
                  <div className="solution-content">
                    <h4>Your All-in-One AI Team</h4>
                    <p>One intelligent platform with specialized AI agents handling every aspect of social media.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - CORRECTED */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Get Started in <span className="gradient-text-cyan">3 Simple Steps</span>
          </h2>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Onboard Your Brand</h3>
              <p>Tell the AI about your business, goals, and brand voice in minutes.</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Approve Your Content</h3>
              <p>Review and approve AI-generated posts in your interactive calendar.</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Watch Your Growth</h3>
              <p>Your AI team publishes everything and optimizes based on real-time performance.</p>
            </div>
          </div>

          <div className="how-it-works-cta">
            <button className="btn-secondary-large" onClick={() => navigate('/how-it-works')}>
              <span>See the Full Process</span>
            </button>
          </div>
        </div>
      </section>

      {/* REDESIGNED AI Team Section - PROFESSIONAL GRID LAYOUT */}
      <section className="ai-team-section">
        <div className="container">
          <h2 className="section-title-consistent">
            This is Not Another   <span className="title-line gradient-text-pink">"AI Assistant"</span><br />
            This is Your New <span className="gradient-text-cyan">Marketing Team</span>
          </h2>
          
          <p className="section-description">
            Our platform deploys 7 specialized AI agents, each with the equivalent of 20+ years 
            of marketing experience. They work together as your dedicated marketing department.
          </p>

          <div className="ai-team-grid">
            <div className="team-overview">
        <div className="team-stats">
          <div className="stat-item">
            <div className="stat-number">7</div>
            <div className="stat-label">AI Agents</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">20+</div>
            <div className="stat-label">Years Experience Each</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Always Active</div>
          </div>
        </div>
              
              <div className="team-description">
                <h3>Your Dedicated Marketing Department</h3>
                <p>Each AI agent specializes in a specific area of social media marketing, working together seamlessly to deliver expert-level results for your brand.</p>
                <button className="btn-primary-large" onClick={() => navigate('/ai-team')}>
                  <span>Meet Your AI Team</span>
                  <div className="btn-glow"></div>
                </button>
              </div>
            </div>

            <div className="agents-showcase">
              <div className="agent-card featured">
                <div className="agent-icon intelligence">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="agent-info">
                  <h4>Intelligence Agent</h4>
                  <p>Data Scientist & Market Analyst</p>
                  <div className="agent-status active">ACTIVE</div>
                </div>
              </div>

              <div className="agent-card">
                <div className="agent-icon strategy">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <div className="agent-info">
                  <h4>Strategy Agent</h4>
                  <p>Elite Marketing Strategist</p>
                  <div className="agent-status active">ACTIVE</div>
                </div>
              </div>

              <div className="agent-card">
                <div className="agent-icon content">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
                <div className="agent-info">
                  <h4>Content Director</h4>
                  <p>Creative Director & Generator</p>
                  <div className="agent-status active">ACTIVE</div>
                </div>
              </div>

              <div className="agent-card">
                <div className="agent-icon post">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  </svg>
                </div>
                <div className="agent-info">
                  <h4>Post Creator</h4>
                  <p>Content Creation Specialist</p>
                  <div className="agent-status active">ACTIVE</div>
                </div>
              </div>

              <div className="agent-card">
                <div className="agent-icon execution">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="agent-info">
                  <h4>Execution Agent</h4>
                  <p>Campaign Manager & Scheduler</p>
                  <div className="agent-status active">ACTIVE</div>
                </div>
              </div>

              <div className="agent-card">
                <div className="agent-icon analytics">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <div className="agent-info">
                  <h4>Analytics Agent</h4>
                  <p>Performance Optimization Expert</p>
                  <div className="agent-status active">ACTIVE</div>
                </div>
              </div>

              <div className="agent-card">
                <div className="agent-icon paid">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5l3.5-2.5L12 8.5 8.5 11l3.5 2.5z"/>
                  </svg>
                </div>
                <div className="agent-info">
                  <h4>Paid Campaigns Agent</h4>
                  <p>Ad Campaign Manager & Optimization Specialist</p>
                  <div className="agent-status active">ACTIVE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* REDESIGNED Features Section - WORKING INTERACTIVE LAYOUT */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title-consistent">Everything You Need for <span className="gradient-text-pink">Social Media Success</span></h2>
          
          <div className="features-interactive">
            <div className="features-tabs">
              <div 
                className={`feature-tab ${activeFeature === 'content' ? 'active' : ''}`}
                onClick={() => handleFeatureClick('content')}
              >
                <div className="tab-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
                <div className="tab-content">
                  <h3>AI Content Creation</h3>
                  <p>Generate engaging posts, captions, and visuals</p>
                </div>
                <div className="tab-indicator"></div>
              </div>

              <div 
                className={`feature-tab ${activeFeature === 'scheduling' ? 'active' : ''}`}
                onClick={() => handleFeatureClick('scheduling')}
              >
                <div className="tab-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
                <div className="tab-content">
                  <h3>Smart Scheduling</h3>
                  <p>Optimal posting times for maximum engagement</p>
                </div>
                <div className="tab-indicator"></div>
              </div>

              <div 
                className={`feature-tab ${activeFeature === 'analytics' ? 'active' : ''}`}
                onClick={() => handleFeatureClick('analytics')}
              >
                <div className="tab-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <div className="tab-content">
                  <h3>Performance Analytics</h3>
                  <p>Detailed insights and optimization recommendations</p>
                </div>
                <div className="tab-indicator"></div>
              </div>

              <div 
                className={`feature-tab ${activeFeature === 'management' ? 'active' : ''}`}
                onClick={() => handleFeatureClick('management')}
              >
                <div className="tab-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="tab-content">
                  <h3>Multi-Platform Management</h3>
                  <p>Manage all accounts from one dashboard</p>
                </div>
                <div className="tab-indicator"></div>
              </div>
            </div>

            <div className="features-display max-h-[626px] !overflow-y-auto sm:max-h-[auto]">
              <div className={`feature-panel ${activeFeature === 'content' ? 'active' : ''}`}>
                <div className="panel-header">
                  <h4>AI Content Creation</h4>
                  <p>Our AI generates engaging posts, captions, and visuals tailored to your brand voice and audience preferences.</p>
                </div>
                <div className="panel-demo">
                  <div className="demo-window">
                    <div className="demo-header">Content Generator</div>
                    <div className="demo-content">
                      <div className="demo-item">
                        <div className="demo-label">Caption:</div>
                        <div className="demo-text">🚀 Ready to transform your business? Our AI-powered platform...</div>
                      </div>
                      <div className="demo-item">
                        <div className="demo-label">Hashtags:</div>
                        <div className="demo-text">#AI #SocialMedia #Marketing #Automation</div>
                      </div>
                      <div className="demo-item">
                        <div className="demo-label">Best Time:</div>
                        <div className="demo-text">Tuesday, 2:30 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`feature-panel ${activeFeature === 'scheduling' ? 'active' : ''}`}>
                <div className="panel-header">
                  <h4>Smart Scheduling</h4>
                  <p>AI analyzes your audience behavior to determine optimal posting times for maximum engagement and reach.</p>
                </div>
                <div className="panel-demo">
                  <div className="demo-window">
                    <div className="demo-header">Scheduling Dashboard</div>
                    <div className="demo-content">
                      <div className="demo-calendar">
                        <div className="calendar-day active">Mon<span>3 posts</span></div>
                        <div className="calendar-day">Tue<span>2 posts</span></div>
                        <div className="calendar-day">Wed<span>4 posts</span></div>
                        <div className="calendar-day">Thu<span>2 posts</span></div>
                        <div className="calendar-day">Fri<span>3 posts</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`feature-panel ${activeFeature === 'analytics' ? 'active' : ''}`}>
                <div className="panel-header">
                  <h4>Performance Analytics</h4>
                  <p>Comprehensive insights and recommendations to continuously improve your social media performance.</p>
                </div>
                <div className="panel-demo">
                  <div className="demo-window">
                    <div className="demo-header">Analytics Dashboard</div>
                    <div className="demo-content">
                      <div className="demo-metrics">
                        <div className="metric">
                          <div className="metric-value">+127%</div>
                          <div className="metric-label">Engagement</div>
                        </div>
                        <div className="metric">
                          <div className="metric-value">+89%</div>
                          <div className="metric-label">Reach</div>
                        </div>
                        <div className="metric">
                          <div className="metric-value">+156%</div>
                          <div className="metric-label">Followers</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`feature-panel ${activeFeature === 'management' ? 'active' : ''}`}>
                <div className="panel-header">
                  <h4>Multi-Platform Management</h4>
                  <p>Seamlessly manage all your social media accounts from one unified, intelligent dashboard.</p>
                </div>
                <div className="panel-demo">
                  <div className="demo-window">
                    <div className="demo-header">Platform Manager</div>
                    <div className="demo-content">
                      <div className="demo-platforms-grid">
                        <div className="demo-platform-card">
                          <div className="demo-platform-icon facebook-color">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                          <div className="demo-platform-name">Facebook</div>
                          <div className="demo-status-active">Active</div>
                        </div>
                        
                        <div className="demo-platform-card">
                          <div className="demo-platform-icon instagram-color">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </div>
                          <div className="demo-platform-name">Instagram</div>
                          <div className="demo-status-active">Active</div>
                        </div>
                        
                        <div className="demo-platform-card">
                          <div className="demo-platform-icon twitter-color">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </div>
                          <div className="demo-platform-name">X (Twitter)</div>
                          <div className="demo-status-active">Active</div>
                        </div>
                        
                        <div className="demo-platform-card">
                          <div className="demo-platform-icon google-color">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          </div>
                          <div className="demo-platform-name">Google</div>
                          <div className="demo-status-active">Active</div>
                        </div>
                        
                        <div className="demo-platform-card">
                          <div className="demo-platform-icon youtube-color">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <div className="demo-platform-name">YouTube</div>
                          <div className="demo-status-active">Active</div>
                        </div>
                        
                        <div className="demo-platform-card">
                          <div className="demo-platform-icon linkedin-color">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <div className="demo-platform-name">LinkedIn</div>
                          <div className="demo-status-active">Active</div>
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

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="section-title-consistent">
              Ready to <span className="gradient-text-cyan">Revolutionize</span> Your  <span className="title-line gradient-text-pink">Social Media</span>?
            </h2>
            <p className="cta-description">
              Join thousands of businesses who've already transformed their  social media presence with AI.
            </p>
            <div className="cta-buttons pb-[30px]">
              <button className="btn-primary-xl" onClick={handleGetStartedClick}>
                <span>Start Your Free Trial</span>
                <div className="btn-glow"></div>
              </button>
              <div className="cta-features">
                <span>✓ No credit card required</span>
                <span>✓ 14-day free trial</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/ai-team" element={<AITeamPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
