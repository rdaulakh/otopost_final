import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { handleGetStartedClick } from '../lib/auth';

function AITeamPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedAgent, setSelectedAgent] = useState(null);
  // const [isWorkflowActive, setIsWorkflowActive] = useState(false);

  // State Variables and Data for 7-Agent Network
  // Add these to your AITeamPage.jsx component

  const [isHeroAnimating, setIsHeroAnimating] = useState(false);
  const [isConcertAnimating, setIsConcertAnimating] = useState(false);

  // Auto-start hero animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHeroAnimating(true);
    }, 1000); // Start hero animation after 1 second delay

    return () => clearTimeout(timer);
  }, []);

  // Workflow steps for data flow animation
  const workflowSteps = [
    { from: 0, to: 1, label: "Market Data" },
    { from: 1, to: 2, label: "Strategy" },
    { from: 2, to: 3, label: "Content" },
    { from: 3, to: 4, label: "Posts" },
    { from: 4, to: 5, label: "Execution" },
    { from: 5, to: 6, label: "Analytics" },
    { from: 6, to: 7, label: "Insights" }
  ];

  // Updated agents array with all 7 agents in the specified order
  const agents = [
    {
      id: 0,
      name: "Intelligence",
      title: "Data Scientist & Market Analyst",
      icon: "🧠",
      gradient: "linear-gradient(135deg, #00d4ff, #0099cc)",
      color: "#00d4ff",
      role: "Analyzes market trends, competitor activities, and audience behavior to provide actionable insights for strategic decision-making.",
      responsibilities: [
        "Market trend analysis and forecasting",
        "Competitor monitoring and benchmarking",
        "Audience behavior pattern recognition",
        "Performance metrics interpretation",
        "Data-driven recommendation generation"
      ],
      stats: {
        "Accuracy": "94%",
        "Data Points": "50M+",
        "Insights": "1.2K",
        "Predictions": "89%"
      }
    }
    ,
    {
      id: 1,
      name: "Strategy",
      title: "Elite Marketing Strategist",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #ff1b6b, #cc1555)",
      color: "#ff1b6b",
      role: "Develops comprehensive marketing strategies based on intelligence insights and business objectives.",
      responsibilities: [
        "Strategic campaign planning and optimization",
        "Content strategy development",
        "Platform-specific approach design",
        "ROI optimization and budget allocation",
        "Long-term growth strategy formulation"
      ],
      stats: {
        "Success Rate": "91%",
        "Campaigns": "500+",
        "ROI Boost": "340%",
        "Strategies": "150+"
      }
    },
    {
      id: 2,
      name: "Content Director",
      title: "Creative Director & Generator",
      icon: "🎨",
      gradient: "linear-gradient(135deg, #ffa500, #ff6347)",
      color: "#ffa500",
      role: "Creates compelling, brand-aligned content that resonates with target audiences across all platforms.",
      responsibilities: [
        "Creative concept development",
        "Multi-platform content creation",
        "Brand voice consistency maintenance",
        "Visual content design and curation",
        "Content calendar planning"
      ],
      stats: {
        "Content Created": "10K+",
        "Engagement": "+250%",
        "Platforms": "6",
        "Templates": "200+"
      }
    },
    {
      id: 3,
      name: "Post Creator",
      title: "Content Creation Specialist",
      icon: "📱",
      gradient: "linear-gradient(135deg, #8a2be2, #6a1b9a)",
      color: "#8a2be2",
      role: "Transforms content strategies into platform-optimized posts with perfect timing and formatting.",
      responsibilities: [
        "Platform-specific post optimization",
        "Hashtag research and implementation",
        "Visual content adaptation",
        "Post scheduling and timing",
        "A/B testing for post variations"
      ],
      stats: {
        "Posts Created": "25K+",
        "Platforms": "6",
        "Engagement": "+180%",
        "Variations": "5K+"
      }
    },
    {
      id: 4,
      name: "Execution",
      title: "Campaign Manager & Scheduler",
      icon: "⚡",
      gradient: "linear-gradient(135deg, #00ff88, #00cc6a)",
      color: "#00ff88",
      role: "Manages campaign execution, scheduling, and real-time optimization across all social media platforms.",
      responsibilities: [
        "Multi-platform campaign execution",
        "Automated scheduling and posting",
        "Real-time performance monitoring",
        "Crisis management and response",
        "Cross-platform coordination"
      ],
      stats: {
        "Campaigns Run": "1K+",
        "Uptime": "99.9%",
        "Platforms": "6",
        "Automation": "95%"
      }
    },
    {
      id: 5,
      name: "Analytics",
      title: "Performance Optimization Expert",
      icon: "📊",
      gradient: "linear-gradient(135deg, #ff4757, #ff3742)",
      color: "#ff4757",
      role: "Monitors performance metrics and provides optimization recommendations for continuous improvement.",
      responsibilities: [
        "Real-time performance tracking",
        "ROI analysis and reporting",
        "Optimization recommendation generation",
        "Trend identification and forecasting",
        "Custom dashboard creation"
      ],
      stats: {
        "Metrics Tracked": "100+",
        "Reports": "2K+",
        "Accuracy": "96%",
        "Optimizations": "500+"
      }
    },
    {
      id: 6,
      name: "Paid Campaigns",
      title: "Ad Campaign Manager & Optimization",
      icon: "💰",
      gradient: "linear-gradient(135deg, #ffa726, #ff9800)",
      color: "#ffa726",
      role: "Manages paid advertising campaigns with advanced targeting and budget optimization strategies.",
      responsibilities: [
        "Paid campaign strategy development",
        "Advanced audience targeting",
        "Budget optimization and allocation",
        "Ad creative testing and optimization",
        "Cross-platform ad management"
      ],
      stats: {
        "Ad Spend": "$2M+",
        "ROAS": "4.2x",
        "Campaigns": "300+",
        "Conversions": "+320%"
      }
    },
  ];


  const scrollToWorkflow = () => {
    const workflowSection = document.querySelector('.workflow-section');
    if (workflowSection) {
      workflowSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);



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
      <section className="hero-section ai-team-hero ">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">⚡ Meet Your AI Marketing Department ⚡</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line">The <span className="gradient-text-cyan">Expert Team</span></span>
              <span className="title-line">Behind Your Brand's</span>
              <span className="title-line gradient-text-pink">Success</span>
            </h1>

            <p className="hero-description">
              Our platform is powered by a system of interconnected AI agents, each a specialist with the equivalent of 20+ years of experience in its domain. They work in concert to deliver results no single AI tool can match.
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">7</div>
                <div className="stat-label">Specialized Agents</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Always Working</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">20+</div>
                <div className="stat-label">Years Experience Each</div>
              </div>
            </div>
            <div className="hero-buttons pt-[3rem]">
              <button className="btn-primary-large" onClick={scrollToWorkflow}>
                <span>Explore All Agents </span>
                <div className="btn-glow"></div>
              </button>

              {/* <button className="watch-agents-btn" onClick={() => setIsHeroAnimating(!isHeroAnimating)}>
                <span className="btn-icon">{isHeroAnimating ? '⏸' : '▶'}</span>
                {isHeroAnimating ? 'Pause Animation' : 'Watch Agents Collaborate'}
              </button> */}

            </div>

          </div>

          {/* Interactive Agent Network Visualization */}
          <div className="hero-visual">
            <div className="agent-network-container">
              <div className="network-grid-bg"></div>

              <div className="agent-network-circle">
                {/* Center AI Agents Circle - Fixed */}
                <div className="center-ai-agents">
                  <div className="center-circle">
                    <span className="center-icon">🤖</span>
                    <div className="center-pulse"></div>
                  </div>
                  <div className="center-label relative bottom-[26px] right-[38px]">AI Agents</div>
                </div>

                {/* 7 Agent Circles positioned around center */}
                {agents.map((agent, index) => {
                  const angle = (index * 360) / 7 - 90; // Start from top
                  const radius = 200;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;

                  return (
                    <div
                      key={agent.id}
                      className={`network-agent-node ${selectedAgent === agent.id ? 'active' : ''}`}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        '--agent-color': agent.gradient,
                        '--agent-outline-color': agent.color
                      }}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <div className="agent-circle-network">
                        <span className="agent-icon-network">{agent.icon}</span>
                        {selectedAgent === agent.id && <div className="agent-pulse"></div>}
                      </div>
                      <div className="agent-name-network">{agent.name}</div>
                    </div>
                  );
                })}

                {/* Connection Lines from center to each agent */}
                {agents.map((agent, index) => {
                  const angle = (index * 360) / 7 - 90;

                  return (
                    <div key={`connection-${index}`}>
                      {/* Line to center */}
                      <div
                        className="connection-to-center"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          '--delay': `${index * 0.2}s`
                        }}
                      ></div>
                    </div>
                  );
                })}

                {/* Data Flow Particles - Flow from all agents to center */}
                {isHeroAnimating && agents.map((agent, index) => (
                  <div
                    key={`particle-${index}`}
                    className="data-particle"
                    style={{
                      '--start-angle': `${(index * 360) / 7 - 90}deg`,
                      '--delay': `${index * 0.3}s`
                    }}
                  ></div>
                ))}

                {/* Workflow Steps Animation */}
                {isHeroAnimating && workflowSteps.map((step, index) => (
                  <div
                    key={`workflow-${index}`}
                    className="workflow-data-flow"
                    style={{
                      '--from-angle': `${(step.from * 360) / 7 - 90}deg`,
                      '--to-angle': `${(step.to * 360) / 7 - 90}deg`,
                      '--delay': `${index * 0.8}s`
                    }}
                  >
                    <div className="flow-particle"></div>
                    <div className="flow-label">{step.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Agent Showcase */}
      <section className="agent-showcase-section !pt-[30px]">
        <div className="container">
          <h2 className="section-title-consistent">
            Your Dedicated, <span className="gradient-text-cyan">24/7 Marketing Department</span>
          </h2>

          <div className="showcase-layout">
            {/* Agent Selection Sidebar */}
            <div className="agent-selector">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className={`selector-item ${selectedAgent === index ? 'active' : ''}`}
                  onClick={() => setSelectedAgent(index)}
                  style={{ '--agent-gradient': agent.gradient }}
                >
                  <div className="selector-icon">{agent.icon}</div>
                  <div className="selector-info">
                    <h4>{agent.name}</h4>
                    <p>{agent.title}</p>
                  </div>
                  <div className="selector-indicator"></div>
                </div>
              ))}
            </div>

            {/* Agent Details Display */}
            <div className="agent-details">
              <div className="details-header">
                <div className="agent-avatar" style={{ background: selectedAgent !== null ? agents[selectedAgent].gradient : 'linear-gradient(135deg, #666, #999)' }}>
                  <span className="avatar-icon">{selectedAgent !== null ? agents[selectedAgent].icon : '🤖'}</span>
                  <div className="avatar-glow"></div>
                </div>
                <div className="agent-info">
                  <h3>{selectedAgent !== null ? agents[selectedAgent].name : 'Select an Agent'}</h3>
                  <h4>{selectedAgent !== null ? agents[selectedAgent].title : 'Click on any agent to learn more'}</h4>
                  <p>{selectedAgent !== null ? agents[selectedAgent].role : 'Choose from our 7 specialized AI agents to see their capabilities and performance metrics.'}</p>
                </div>
              </div>

              <div className="details-content">
                <div className="responsibilities-section">
                  <h5>Key Responsibilities</h5>
                  <div className="responsibilities-grid">
                    {selectedAgent !== null ? agents[selectedAgent].responsibilities.map((responsibility, index) => (
                      <div key={index} className="responsibility-item">
                        <div className="responsibility-icon">✓</div>
                        <span>{responsibility}</span>
                      </div>
                    )) : (
                      <div className="placeholder-text">Select an agent to view their responsibilities</div>
                    )}
                  </div>
                </div>

                <div className="stats-section">
                  <h5>Performance Metrics</h5>
                  <div className="stats-grid">
                    {selectedAgent !== null ? Object.entries(agents[selectedAgent].stats).map(([key, value], index) => (
                      <div key={index} className="stat-card">
                        <div className="stat-value">{value}</div>
                        <div className="stat-name">{key}</div>
                      </div>
                    )) : (
                      <div className="placeholder-text">Select an agent to view their performance metrics</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Working in Concert Section - Improved */}
      <section className="working-concert-section">
        <div className="container">
          <h2 className="section-title-consistent">
            From <span className="gradient-text-cyan">Individual</span> Experts to a <span className="gradient-text-pink">Coordinated System</span>
          </h2>

          <p className="concert-description">
            The true power of the platform lies in how the agents collaborate. The insights from the Learning Agent constantly make the Strategy Agent smarter, creating a virtuous cycle of improvement.
          </p>

          <button className="watch-agents-btn" onClick={() => setIsConcertAnimating(!isConcertAnimating)}>
            <span className="btn-icon">{isConcertAnimating ? '⏸' : '▶'}</span>
            {isConcertAnimating ? 'Pause Agents Collaborate' : 'Watch Agents Collaborate'}
          </button>

          {/* 7-Agent Circular Network Visualization */}
          <div className="agent-network-container">
            <div className="network-grid-bg"></div>

            <div className="agent-network-circle">
              {/* Center AI Agents Circle - Fixed */}
              <div className="center-ai-agents">
                <div className="center-circle">
                  <span className="center-icon">🤖</span>
                  <div className="center-pulse"></div>
                </div>
                <div className="center-label">AI Agents</div>
              </div>

              {/* 7 Agent Circles positioned around center */}
              {agents.map((agent, index) => {
                const angle = (index * 360) / 7 - 90; // Start from top
                const radius = 200;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <div
                    key={agent.id}
                    className={`network-agent-node ${selectedAgent === agent.id ? 'active' : ''}`}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      '--agent-color': agent.gradient,
                      '--agent-outline-color': agent.color
                    }}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="agent-circle-network">
                      <span className="agent-icon-network">{agent.icon}</span>
                      {selectedAgent === agent.id && <div className="agent-pulse"></div>}
                    </div>
                    <div className="agent-name-network">{agent.name}</div>
                  </div>
                );
              })}

              {/* Connection Lines from center to each agent */}
              {agents.map((agent, index) => {
                const angle = (index * 360) / 7 - 90;

                return (
                  <div key={`connection-${index}`}>
                    {/* Line to center */}
                    <div
                      className="connection-to-center"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        '--delay': `${index * 0.2}s`
                      }}
                    ></div>
                  </div>
                );
              })}

              {/* Data Flow Particles - Flow from all agents to center */}
              {isConcertAnimating && agents.map((agent, index) => (
                <div
                  key={`particle-${index}`}
                  className="data-particle"
                  style={{
                    '--start-angle': `${(index * 360) / 7 - 90}deg`,
                    '--delay': `${index * 0.3}s`
                  }}
                ></div>
              ))}

              {/* Workflow Steps Animation */}
              {isConcertAnimating && workflowSteps.map((step, index) => (
                <div
                  key={`workflow-${index}`}
                  className="workflow-data-flow"
                  style={{
                    '--from-angle': `${(step.from * 360) / 7 - 90}deg`,
                    '--to-angle': `${(step.to * 360) / 7 - 90}deg`,
                    '--delay': `${index * 0.8}s`
                  }}
                >
                  <div className="flow-particle"></div>
                  <div className="flow-label">{step.label}</div>
                </div>
              ))}
            </div>

            {/* Agent Details Sidebar */}
            {selectedAgent !== null && (
              <div className="agent-details-sidebar">
               
                <div className="agent-details-content">
                  <div className="agent-header">
                    <span className="agent-icon-large">{agents[selectedAgent].icon}</span>
                    <div>
                      <h3>{agents[selectedAgent].name}</h3>
                      <p>{agents[selectedAgent].title}</p>
                    </div>
                  </div>

                  <div className="agent-role">
                    <p>{agents[selectedAgent].role}</p>
                  </div>

                  <div className="agent-responsibilities">
                    <h4>Key Responsibilities:</h4>
                    <ul>
                      {agents[selectedAgent].responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="agent-stats">
                    <h4>Performance Stats:</h4>
                    <div className="stats-grid">
                      {Object.entries(agents[selectedAgent].stats).map(([key, value]) => (
                        <div key={key} className="stat-item">
                          <div className="stat-value">{value}</div>
                          <div className="stat-label">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

               
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="container">
          <h2 className="section-title-consistent">
            Why Our <span className="gradient-text-cyan">AI Team</span> Beats <span className="gradient-text-pink">Traditional Tools</span>
          </h2>

          <div className="comparison-grid">
            <div className="comparison-column traditional">
              <h3>Traditional AI Tools</h3>
              <div className="comparison-items">
                <div className="comparison-item">
                  <span className="item-icon">❌</span>
                  <span>Single-purpose functionality</span>
                </div>
                <div className="comparison-item">
                  <span className="item-icon">❌</span>
                  <span>No collaboration between tools</span>
                </div>
                <div className="comparison-item">
                  <span className="item-icon">❌</span>
                  <span>Manual integration required</span>
                </div>
                <div className="comparison-item">
                  <span className="item-icon">❌</span>
                  <span>Limited learning capabilities</span>
                </div>
              </div>
            </div>

            <div className="comparison-divider">
              <div className="vs-badge">VS</div>
            </div>

            <div className="comparison-column otopost">
              <h3>OTOPost AI Team</h3>
              <div className="comparison-items">
                <div className="comparison-item">
                  <span className="item-icon">✅</span>
                  <span>7 specialized agents working together</span>
                </div>
                <div className="comparison-item">
                  <span className="item-icon">✅</span>
                  <span>Seamless agent collaboration</span>
                </div>
                <div className="comparison-item">
                  <span className="item-icon">✅</span>
                  <span>Fully integrated ecosystem</span>
                </div>
                <div className="comparison-item">
                  <span className="item-icon">✅</span>
                  <span>Continuous learning & optimization</span>
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
              Put the Industry's Most Advanced <span className="gradient-text-cyan">AI Team</span> to Work for You
            </h2>
            <p className="cta-description">
              Stop guessing. Start growing. Let our AI agents transform your social media presence.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary-xl" onClick={handleGetStartedClick}>
                <span>Meet Your AI Team Today</span>
                <div className="btn-glow"></div>
              </button>
              <a href="/how-it-works" className="btn-secondary-large">See How They Work</a>
            </div>
            <div className="cta-features pb-[30px] pt-[25px] justify-center">
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Full AI team access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* AI Team Page Specific Styles */
        .ai-team-hero {
          padding: 120px 0 0px;
          min-height: 122vh;
          display: flex;
          align-items: center;
        }

        .hero-stats {
          display: flex;
          gap: 40px;
          margin-top: 40px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #48a5e8 0%, #2336b1 100%)
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 4px;
        }

        /* Agent Network Visualization */
        .hero-visual {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .agent-network {
          position: relative;
          width: 523px;
          height: 500px;
          
        }

        .network-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
        }

        .center-node {
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #00d4ff, #8a2be2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto 8px;
          box-shadow: 0 0 35px rgba(0, 212, 255, 0.6);
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .center-icon {
          font-size: 32px;
          z-index: 2;
        }

        .center-pulse {
          position: absolute;
          top: -15px;
          left: -15px;
          right: -15px;
          bottom: -15px;
          border: 3px solid #00d4ff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .center-label {
          color: #fff;
          font-weight: 600;
          font-size: 16px;
        }

        .network-agent {
          position: absolute;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        /* Positioning agents according to the diagram - improved alignment */
        .network-agent.agent-top-center {
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
        }

        .network-agent.agent-top-right {
          top: 100px;
          right: 60px;
        }

        .network-agent.agent-mid-right {
          top: 50%;
          right: 50px;
          transform: translateY(-50%);
        }

        .network-agent.agent-bottom-right {
          bottom: 100px;
          right: 60px;
        }

        .network-agent.agent-bottom-center {
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
        }

        .network-agent.agent-mid-left {
          top: 50%;
          left: 50px;
          transform: translateY(-50%);
        }

        .network-agent.agent-top-left {
          top: 100px;
          left: 60px;
        }

        .agent-node {
          width: 70px;
          height: 70px;
          background: var(--agent-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto 8px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .network-agent:hover .agent-node {
          transform: scale(1.15);
          box-shadow: 0 0 25px var(--agent-color);
        }

        .network-agent.active .agent-node {
          transform: scale(1.25);
          box-shadow: 0 0 35px var(--agent-color);
          outline: 3px solid;
          outline-color: var(--agent-outline-color);
          outline-offset: 8px;
        }

        .agent-icon {
          font-size: 28px;
          z-index: 2;
          filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
        }

        .agent-pulse {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border: 2px solid var(--agent-color);
          border-radius: 50%;
          opacity: 0;
          animation: pulse 2s infinite;
        }

        .network-agent.active .agent-pulse {
          opacity: 1;
        }

        .agent-label {
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          text-align: center;
          font-weight: 700;
          white-space: nowrap;
          text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
          letter-spacing: 0.5px;
        }

        /* Connection Lines - improved alignment */
        .network-connections {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .connections-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .connection-line {
          stroke: rgba(255, 255, 255, 0.4);
          stroke-width: 2px;
          stroke-dasharray: 8, 4;
          animation: dash-animation 15s linear infinite;
          filter: drop-shadow(0 0 3px rgba(0, 212, 255, 0.3));
        }

        @keyframes dash-animation {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 24;
          }
        }

        /* Agent Showcase Section */
        .agent-showcase-section {
          padding: 86px 0;
        }

        .showcase-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 60px;
          margin-top: 60px;
        }

        .agent-selector {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .selector-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .selector-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(8px);
        }

        .selector-item.active {
          background: var(--agent-gradient);
          border-color: transparent;
          transform: translateX(12px);
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
        }

        .selector-icon {
          font-size: 24px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .selector-item.active .selector-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .selector-info h4 {
          color: #fff;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .selector-info p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .selector-indicator {
          position: absolute;
          right: 20px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .selector-item.active .selector-indicator {
          opacity: 1;
        }

        /* Agent Details */
        .agent-details {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
        }

        .details-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .agent-avatar {
          width: 90px;
          height: 73px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .avatar-icon {
          font-size: 32px;
          z-index: 2;
        }

        .avatar-glow {
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: inherit;
          border-radius: 24px;
          filter: blur(8px);
          opacity: 0.6;
          z-index: 1;
        }

        .agent-info h3 {
          color: #fff;
          font-size: 24px;
          margin-bottom: 4px;
        }

        .agent-info h4 {
          color: #00d4ff;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .agent-info p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }

        .details-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .responsibilities-section h5,
        .stats-section h5 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 20px;
        }

        .responsibilities-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .responsibility-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 8px;
        }

        .responsibility-icon {
          width: 20px;
          height: 20px;
          background: #00ff88;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #000;
          font-weight: bold;
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-card {
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 12px;
          text-align: center;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 4px;
        }

        .stat-name {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .placeholder-text {
          color: #888;
          font-style: italic;
          text-align: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          border: 1px dashed rgba(255, 255, 255, 0.2);
        }

        /* Enhanced Workflow Section */
        .workflow-section {
          padding: 86px 0;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 27, 107, 0.05));
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .workflow-section::before {
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
        
        .workflow-description {
          max-width: 800px;
          margin: 0 auto 30px;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          position: relative;
          z-index: 2;
        }

        .workflow-controls {
          text-align: center;
          margin: 40px 0 60px;
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .workflow-btn {
          padding: 16px 32px;
          background: linear-gradient(135deg, #00d4ff, #ff1b6b);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
        }

        .workflow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
        }
        
        .workflow-btn::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #00d4ff, #ff1b6b, #00d4ff);
          background-size: 400%;
          z-index: -1;
          border-radius: 14px;
          animation: glowing 20s linear infinite;
        }
        
        @keyframes glowing {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }

        .workflow-diagram {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          height: 450px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .workflow-agents {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .workflow-agent {
          position: absolute;
          text-align: center;
          transition: all 0.5s ease;
          z-index: 3;
        }

        /* Agent positions matching the design */
        .workflow-agent.agent-0 {
          top: 50%;
          left: 10%;
          transform: translate(0, -50%);
        }
        
        .workflow-agent.agent-1 {
          top: 20%;
          left: 50%;
          transform: translate(-50%, 0);
        }
        
        .workflow-agent.agent-2 {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .workflow-agent.agent-3 {
          top: 50%;
          right: 10%;
          transform: translate(0, -50%);
        }
        
        .workflow-agent.agent-4 {
          bottom: 20%;
          left: 50%;
          transform: translate(-50%, 0);
        }

        .workflow-node {
          width: 90px;
          height: 90px;
          background: var(--agent-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto 12px;
          transition: all 0.3s ease;
          border: 3px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 20px var(--agent-color);
        }

        .workflow-agent.active .workflow-node {
          animation: workflowPulse 2s infinite;
          animation-delay: var(--delay);
          border-color: rgba(255, 255, 255, 1);
          box-shadow: 0 0 30px var(--agent-color);
          transform: scale(1.1);
          outline: 3px solid;
          outline-color: var(--agent-outline-color);
          outline-offset: 8px;
        }
        
        @keyframes workflowPulse {
          0% {
            box-shadow: 0 0 20px var(--agent-color);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px var(--agent-color);
            transform: scale(1.15);
          }
          100% {
            box-shadow: 0 0 20px var(--agent-color);
            transform: scale(1);
          }
        }

        .workflow-icon {
          font-size: 36px;
          z-index: 2;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .workflow-pulse {
          position: absolute;
          top: -15px;
          left: -15px;
          right: -15px;
          bottom: -15px;
          border: 2px solid var(--agent-color);
          border-radius: 50%;
          opacity: 0;
          animation: pulse 2s infinite;
          animation-delay: var(--delay);
        }

        .workflow-agent.active .workflow-pulse {
          opacity: 1;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }

        .workflow-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 600;
          text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
          margin-top: 8px;
          opacity: 1;
        }

        .workflow-connections {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .workflow-connection {
          position: absolute;
          opacity: 0;
          transition: opacity 0.5s ease;
          animation-delay: var(--delay);
        }

        .workflow-connection.active {
          opacity: 1;
          animation: dataFlow 3s infinite;
          animation-delay: var(--delay);
          z-index: 2;
        }
        
        /* Connection line positioning matching the design */
        .workflow-connection.connection-0-1 {
          top: 35%;
          left: 25%;
          transform: rotate(0deg);
        }
        
        .workflow-connection.connection-1-2 {
          top: 35%;
          left: 50%;
          transform: rotate(90deg);
        }
        
        .workflow-connection.connection-2-3 {
          top: 50%;
          left: 50%;
          transform: rotate(0deg);
        }
        
        .workflow-connection.connection-3-4 {
          bottom: 35%;
          left: 50%;
          transform: rotate(90deg);
        }
        
        .workflow-connection.connection-4-0 {
          bottom: 35%;
          left: 25%;
          transform: rotate(180deg);
        }
        
        .connection-line {
          width: 3px;
          height: 100px;
          background: linear-gradient(to bottom, #8a2be2, #ff8c00);
          position: relative;
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.6);
          border-radius: 2px;
        }
        
        .workflow-connection.connection-0-1 .connection-line {
          background: linear-gradient(to right, #8a2be2, #ff8c00);
          height: 80px;
        }
        
        .workflow-connection.connection-1-2 .connection-line {
          background: linear-gradient(to bottom, #ff8c00, #00d4ff);
          height: 60px;
        }
        
        .workflow-connection.connection-2-3 .connection-line {
          background: linear-gradient(to right, #00d4ff, #ff1b6b);
          height: 80px;
        }
        
        .workflow-connection.connection-3-4 .connection-line {
          background: linear-gradient(to bottom, #ff1b6b, #8a2be2);
          height: 60px;
        }
        
        .workflow-connection.connection-4-0 .connection-line {
          background: linear-gradient(to left, #8a2be2, #00d4ff);
          height: 80px;
        }
        
        .horizontal-line {
          position: absolute;
          width: 60%;
          height: 3px;
          background: linear-gradient(to right, #8a2be2, #ff8c00, #00d4ff, #ff1b6b);
          top: 50%;
          left: 20%;
          transform: translateY(-50%);
          z-index: 1;
          box-shadow: 0 0 20px rgba(138, 43, 226, 0.6);
          animation: horizontalGlow 3s infinite alternate;
          border-radius: 2px;
        }
        
        @keyframes horizontalGlow {
          0% {
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
            opacity: 0.8;
          }
          50% {
            box-shadow: 0 0 35px rgba(0, 212, 255, 0.9);
            opacity: 1;
          }
          100% {
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
            opacity: 0.8;
          }
        }

        .connection-data {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        }

        .data-packet {
          width: 12px;
          height: 12px;
          background: #00ff88;
          border-radius: 50%;
          display: block;
          margin: 0 auto 6px;
          animation: packetMove 2s infinite;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.8);
        }

        @keyframes packetMove {
          0% {
            transform: translateY(-40px);
            opacity: 0;
          }
          50% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(30px);
            opacity: 0;
          }
        }
        
        @keyframes dataFlow {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.7;
          }
        }

        .data-label {
          font-size: 14px;
          color: #fff;
          text-align: center;
          opacity: 0.9;
          text-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
          font-weight: 500;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .workflow-benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-top: 80px;
          position: relative;
          z-index: 2;
        }

        .benefit-item {
          text-align: center;
          padding: 32px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .benefit-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
        }

        .benefit-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .benefit-item h4 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 12px;
        }

        .benefit-item p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
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

        /* Large Desktop */
        @media (max-width: 1400px) {
          .agent-network-container {
            max-width: 700px;
            height: 550px;
          }

          .agent-network-circle {
            width: 450px;
            height: 450px;
          }

          .agent-circle-network {
            width: 65px;
            height: 65px;
          }

          .agent-icon-network {
            font-size: 22px;
          }

          .agent-name-network {
            font-size: 13px;
          }
        }

        /* Desktop */
        @media (max-width: 1200px) {
          .agent-network-container {
            max-width: 600px;
            height: 500px;
          }

          .agent-network-circle {
            width: 400px;
            height: 400px;
          }

          .agent-circle-network {
            width: 60px;
            height: 60px;
          }

          .agent-icon-network {
            font-size: 20px;
          }

          .agent-name-network {
            font-size: 12px;
          }

          .connection-to-center {
            width: 160px;
          }

          .connection-to-next {
            width: 140px;
          }
        }

        @media (max-width: 1024px) {
          .showcase-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .agent-selector {
            flex-direction: row;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 10px;
          }

          .selector-item {
            min-width: 280px;
            flex-shrink: 0;
          }

          .details-content {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .agent-network-container {
            max-width: 500px;
            height: 450px;
          }

          .agent-network-circle {
            width: 350px;
            height: 350px;
          }

          .agent-circle-network {
            width: 55px;
            height: 55px;
          }

          .agent-icon-network {
            font-size: 18px;
          }

          .agent-name-network {
            font-size: 11px;
          }

          .connection-to-center {
            width: 140px;
          }

          .connection-to-next {
            width: 120px;
          }
        }

        /* Tablet */
        @media (max-width: 768px) {
          .hero-container {
            flex-direction: column;
            text-align: center;
          }

          .hero-stats {
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
          }

          .stat-item {
            min-width: 120px;
          }

          .agent-network {
            width: 400px;
            height: 350px;
            margin: 20px auto;
          }

          .network-center {
            right: 80px;
          }

          .center-node {
            width: 70px;
            height: 70px;
          }

          .center-icon {
            font-size: 28px;
          }

          .agent-node {
            width: 50px;
            height: 50px;
          }

          .agent-icon {
            font-size: 20px;
          }

          .agent-label {
            font-size: 11px;
          }

          .network-agent.agent-top-center {
            top: 40px;
          }

          .network-agent.agent-mid-right {
            right: 50px;
          }

          .network-agent.agent-bottom-center {
            bottom: 40px;
          }

          .network-agent.agent-mid-left {
            left: 50px;
          }

          .network-agent.agent-top-left {
            top: 80px;
            left: 80px;
          }

          .network-agent.agent-top-right {
            top: 80px;
            right: 80px;
          }

          .network-agent.agent-bottom-right {
            bottom: 80px;
            right: 80px;
          }

          .workflow-benefits {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .workflow-diagram {
            height: 350px;
            padding: 15px;
          }

          .workflow-node {
            width: 70px;
            height: 70px;
          }

          .workflow-icon {
            font-size: 28px;
          }

          .workflow-label {
            font-size: 14px;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .vs-badge {
            margin: 20px 0;
          }

          /* Agent Network Responsive */
          .agent-network-container {
            max-width: 400px;
            height: 400px;
          }

          .agent-network-circle {
            width: 300px;
            height: 300px;
          }

          .agent-circle-network {
            width: 45px;
            height: 45px;
          }

          .agent-icon-network {
            font-size: 16px;
          }

          .agent-name-network {
            font-size: 10px;
          }

          .connection-to-center {
            width: 120px;
          }

          .connection-to-next {
            width: 100px;
          }

          .agent-details-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100vh;
            max-height: 100vh;
            z-index: 1000;
            border-radius: 0;
            padding: 15px;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
          }

          .agent-details-content {
            height: calc(100vh - 30px);
            overflow-y: auto;
            padding-right: 5px;
          }

          .close-details {
            position: fixed;
            top: 15px;
            right: 15px;
            z-index: 1001;
            background: rgba(255, 27, 107, 0.8);
            color: #fff;
            width: 35px;
            height: 35px;
            font-size: 16px;
          }
        }

        /* Mobile Large */
        @media (max-width: 640px) {
          .hero-stats {
            flex-direction: column;
            gap: 15px;
          }

          .stat-number {
            font-size: 28px;
          }

          .stat-label {
            font-size: 13px;
          }

          .agent-network-container {
            max-width: 350px;
            height: 350px;
          }

          .agent-network-circle {
            width: 280px;
            height: 280px;
          }

          .agent-circle-network {
            width: 40px;
            height: 40px;
          }

          .agent-icon-network {
            font-size: 14px;
          }

          .agent-name-network {
            font-size: 9px;
          }

          .connection-to-center {
            width: 100px;
          }

          .connection-to-next {
            width: 80px;
          }

          .selector-item {
            min-width: 250px;
            padding: 16px;
          }

          .selector-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .selector-info h4 {
            font-size: 14px;
          }

          .selector-info p {
            font-size: 12px;
          }
        }

        /* Mobile Small */
        @media (max-width: 480px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 16px;
          }

          .agent-network-container {
            max-width: 300px;
            height: 300px;
          }

          .agent-network-circle {
            width: 250px;
            height: 250px;
          }

          .agent-circle-network {
            width: 35px;
            height: 35px;
          }

          .agent-icon-network {
            font-size: 12px;
          }

          .agent-name-network {
            font-size: 8px;
          }

          .connection-to-center {
            width: 80px;
          }

          .connection-to-next {
            width: 60px;
          }

          .selector-item {
            min-width: 220px;
            padding: 12px;
          }

          .selector-icon {
            width: 35px;
            height: 35px;
            font-size: 18px;
          }

          .selector-info h4 {
            font-size: 13px;
          }

          .selector-info p {
            font-size: 11px;
          }

          .agent-details {
            padding: 24px;
          }

          .details-header {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .agent-avatar {
            width: 70px;
            height: 60px;
          }

          .avatar-icon {
            font-size: 28px;
          }

          .agent-info h3 {
            font-size: 20px;
          }

          .agent-info h4 {
            font-size: 14px;
          }
        }



        /* 7-Agent Circular Network Styles */
.working-concert-section {
  padding: 120px 0;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 27, 107, 0.05));
  position: relative;
  overflow: hidden;
}

.concert-description {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 40px auto;
}

.watch-agents-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto 80px auto;
  padding: 16px 32px;
  background: linear-gradient(135deg, #00d4ff, #ff1b6b);
  border: none;
  border-radius: 11px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.watch-agents-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 212, 255, 0.3);
}

.btn-icon {
  font-size: 14px;
}

/* Network Container */
.agent-network-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.network-grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.3;
  animation: gridPulse 4s ease-in-out infinite;
}

.agent-network-circle {
  position: relative;
  width: 500px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Agent Nodes */
.network-agent-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.network-agent-node.active {
  z-index: 20;
}

.agent-circle-network {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--agent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  animation: agentPulse 3s ease-in-out infinite;
  transition: all 0.3s ease;
  top: 14px;
}

.network-agent-node.active .agent-circle-network {
  border: 4px solid var(--agent-color);
  box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.3), 0 0 30px var(--agent-color), 0 8px 25px rgba(0, 0, 0, 0.3);
  outline: 3px solid;
  outline-color: var(--agent-outline-color);
  outline-offset: 8px;
}

.agent-icon-network {
  font-size: 24px;
  color: #fff;
  z-index: 2;
}

.agent-pulse {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid var(--agent-color);
  border-radius: 50%;
  opacity: 1;
  animation: pulseRing 2s ease-out infinite;
}

.agent-name-network {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

/* Center AI Agents Circle */
.center-ai-agents {
  position: absolute;
  top: 59%;
  left: 58%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 15;
  cursor: default;
  transition: all 0.3s ease;
  pointer-events: none;
}

/* Center circle is fixed and non-interactive */

.center-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #8a2be2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.3);
  animation: hubPulse 2.5s ease-in-out infinite;
  position: relative;
}

/* Close button removed - no click functionality */

.center-icon {
  font-size: 28px;
  color: #fff;
  z-index: 2;
}

.center-pulse {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid #00d4ff;
  border-radius: 50%;
  opacity: 0;
  animation: pulseRing 2s ease-out infinite;
}

/* Center pulse is always visible for visual appeal */

.center-label {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

/* Connection Lines */
.connection-to-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.6), transparent);
  transform-origin: left center;
  animation: connectionGlow 4s ease-in-out infinite;
  animation-delay: var(--delay);
  z-index: 1;
}

.connection-to-center::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  animation: connectionFlow 3s linear infinite;
  animation-delay: var(--delay);
}

.connection-to-next {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 180px;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 27, 107, 0.4), transparent);
  transform-origin: left center;
  animation: connectionPulse 6s ease-in-out infinite;
  animation-delay: var(--delay);
  z-index: 1;
}

/* Data Flow Particles */
.data-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  box-shadow: 0 0 15px #00ff88;
  animation: particleFlowOnCenter 2s linear infinite;
  animation-delay: var(--delay);
  z-index: 5;
  animation-iteration-count: infinite;
}

.workflow-data-flow {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 8;
  animation: workflowAnimation 4s ease-in-out infinite;
  animation-delay: var(--delay);
}

.flow-particle {
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #ff1b6b, #00d4ff);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(255, 27, 107, 0.8);
  animation: flowParticleMove 2s ease-in-out infinite;
}

.flow-label {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  animation: labelFade 2s ease-in-out infinite;
}

/* Agent Details Sidebar */
.agent-details-sidebar {
  position: absolute;
  right: -350px;
  top: 0;
  width: 320px;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  animation: slideInRight 0.3s ease-out;
  z-index: 30;
  overflow-y: auto;
  max-height: 100%;
}

.agent-details-content {
  height: 100%;
  overflow-y: auto;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.agent-icon-large {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00d4ff, #ff1b6b);
  border-radius: 50%;
}

.agent-header h3 {
  color: #fff;
  font-size: 20px;
  margin: 0 0 4px 0;
}

.agent-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

.agent-role {
  margin-bottom: 24px;
}

.agent-role p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.agent-responsibilities h4,
.agent-stats h4 {
  color: #fff;
  font-size: 16px;
  margin-bottom: 12px;
}

.agent-responsibilities ul {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.agent-responsibilities li {
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
}

.agent-responsibilities li:before {
  content: "→";
  position: absolute;
  left: 0;
  color: #00d4ff;
  font-weight: bold;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.stat-value {
  color: #00d4ff;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.close-details {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-details:hover {
  background: rgba(255, 27, 107, 0.3);
}

/* Animations */
@keyframes gridPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes agentPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes hubPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 10px 30px rgba(255, 165, 0, 0.4);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 15px 40px rgba(255, 165, 0, 0.6);
  }
}

@keyframes connectionGlow {
  0%, 100% {
    opacity: 0.6;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.6), transparent);
  }
  50% {
    opacity: 1;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 1), transparent);
  }
}

@keyframes connectionPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes connectionFlow {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes particleFlow {
  0% {
    transform: rotate(var(--start-angle)) translateX(40px) scale(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: rotate(var(--start-angle)) translateX(40px) scale(1);
  }
  80% {
    opacity: 1;
    transform: rotate(var(--start-angle)) translateX(0px) scale(1);
  }
  100% {
    transform: rotate(var(--start-angle)) translateX(0px) scale(0);
    opacity: 0;
  }
}

@keyframes particleFlowOnCenter {
  0% {
    transform: rotate(var(--start-angle)) translateX(200px) scale(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: rotate(var(--start-angle)) translateX(200px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

@keyframes workflowAnimation {
  0% {
    transform: rotate(var(--from-angle)) translateX(200px);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--to-angle)) translateX(200px);
    opacity: 0;
  }
}

@keyframes flowParticleMove {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes labelFade {
  0%, 20%, 80%, 100% { opacity: 0; }
  40%, 60% { opacity: 1; }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Enhanced Responsive Design for Agent Network */
@media (max-width: 1200px) {
  .agent-network-container {
    max-width: 600px;
    height: 500px;
  }

  .agent-network-circle {
    width: 400px;
    height: 400px;
  }

  .agent-circle-network {
    width: 60px;
    height: 60px;
  }

  .agent-icon-network {
    font-size: 20px;
  }

  .agent-name-network {
    font-size: 12px;
  }

  .connection-to-center {
    width: 160px;
  }

  .center-circle {
    width: 70px;
    height: 70px;
  }

  .center-icon {
    font-size: 24px;
  }

  .agent-details-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    z-index: 1000;
    border-radius: 0;
    padding: 20px;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
  }

  .agent-details-content {
    height: calc(100vh - 40px);
    overflow-y: auto;
    padding-right: 10px;
  }

  .close-details {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1001;
    background: rgba(255, 27, 107, 0.8);
    color: #fff;
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .working-concert-section {
    padding: 80px 0;
  }

  .concert-description {
    font-size: 16px;
    margin-bottom: 30px;
  }

  .watch-agents-btn {
    padding: 14px 28px;
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .agent-network-container {
    max-width: 400px;
    height: 400px;
  }

  .agent-network-circle {
    width: 350px;
    height: 350px;
  }

  .agent-circle-network {
    width: 50px;
    height: 50px;
  }

  .agent-icon-network {
    font-size: 18px;
  }

  .agent-name-network {
    font-size: 10px;
  }

  .center-circle {
    width: 60px;
    height: 60px;
  }

  .center-icon {
    font-size: 20px;
  }

  .connection-to-center {
    width: 140px;
  }

  .working-concert-section {
    padding: 60px 0;
  }

  .concert-description {
    font-size: 15px;
    margin-bottom: 25px;
  }

  .watch-agents-btn {
    padding: 12px 24px;
    font-size: 14px;
    margin-bottom: 60px;
  }
}

@media (max-width: 640px) {
  .agent-network-container {
    max-width: 350px;
    height: 350px;
  }

  .agent-network-circle {
    width: 300px;
    height: 300px;
  }

  .agent-circle-network {
    width: 45px;
    height: 45px;
  }

  .agent-icon-network {
    font-size: 16px;
  }

  .agent-name-network {
    font-size: 9px;
  }

  .center-circle {
    width: 50px;
    height: 50px;
  }

  .center-icon {
    font-size: 18px;
  }

  .connection-to-center {
    width: 120px;
  }

  .working-concert-section {
    padding: 50px 0;
  }

  .concert-description {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .watch-agents-btn {
    padding: 10px 20px;
    font-size: 13px;
    margin-bottom: 50px;
  }
}

@media (max-width: 480px) {
  .agent-network-container {
    max-width: 300px;
    height: 300px;
  }

  .agent-network-circle {
    width: 250px;
    height: 250px;
  }

  .agent-circle-network {
    width: 40px;
    height: 40px;
  }

  .agent-icon-network {
    font-size: 14px;
  }

  .agent-name-network {
    font-size: 8px;
  }

  .center-circle {
    width: 45px;
    height: 45px;
  }

  .center-icon {
    font-size: 16px;
  }

  .connection-to-center {
    width: 100px;
  }

  .working-concert-section {
    padding: 40px 0;
  }

  .concert-description {
    font-size: 13px;
    margin-bottom: 15px;
  }

  .watch-agents-btn {
    padding: 8px 16px;
    font-size: 12px;
    margin-bottom: 40px;
  }

          .agent-details-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100vh;
            max-height: 100vh;
            z-index: 1000;
            border-radius: 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
          }

          .agent-details-content {
            height: calc(100vh - 20px);
            overflow-y: auto;
            padding-right: 5px;
          }

          .close-details {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1001;
            background: rgba(255, 27, 107, 0.8);
            color: #fff;
            width: 30px;
            height: 30px;
            font-size: 14px;
          }

          .agent-header {
            flex-direction: column;
            text-align: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .agent-icon-large {
            width: 50px;
            height: 50px;
            font-size: 32px;
          }

          .agent-header h3 {
            font-size: 18px;
          }

          .agent-header p {
            font-size: 12px;
          }

          .agent-role p {
            font-size: 13px;
            text-align: center;
          }

          .agent-responsibilities h4,
          .agent-stats h4 {
            font-size: 14px;
            text-align: center;
          }

          .agent-responsibilities li {
            font-size: 12px;
            padding: 6px 0;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-item {
            padding: 10px;
          }

          .stat-value {
            font-size: 16px;
          }

          .stat-label {
            font-size: 10px;
          }
}

      `}</style>
    </div>
  );
}

export default AITeamPage;
