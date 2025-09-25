import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

function RefundPolicyPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
      <section className="hero-section refund-hero">
        <div className="hero-container1">
          <div className="hero-content text-center">
            <div className="hero-badge">
              <span className="badge-text">💰 Refund Policy 💰</span>
            </div>
            
            <h1 className="hero-title">
              <span>Refund</span>
              <span className="gradient-text-cyan"> Policy</span>
            </h1>

            <p className="hero-description">
              Effective Date: 25th September 2025
            </p>
          </div>
        </div>
      </section>

      {/* Refund Policy Content */}
      <section className="refund-content-section">
        <div className="container">
          <div className="refund-content">
            <div className="refund-sections">
              <div className="refund-section">
                <h2>1. Trial Period</h2>
                <p>
                  New users are eligible for a <strong>full refund</strong> if they cancel within the first <strong>7 days</strong> of starting their subscription.
                </p>
                <p>
                  This trial allows users to explore <span className="brand-name">OtoPost</span> risk-free.
                </p>
              </div>

              <div className="refund-section">
                <h2>2. Monthly Subscriptions</h2>
                <p>
                  After the trial period, <strong>all monthly subscription cancellations are final</strong>.
                </p>
                <p>
                  No refunds or credits will be issued, but users will retain access until the end of the current billing cycle.
                </p>
              </div>

              <div className="refund-section">
                <h2>3. Annual Subscriptions</h2>
                <p>
                  All annual subscription cancellations are <strong>final</strong> after the trial period.
                </p>
                <p>
                  No prorated refunds will be issued, even for partially unused months.
                </p>
              </div>

              <div className="refund-section">
                <h2>4. Exceptional Circumstances</h2>
                <p>
                  Refunds may only be issued in <strong>rare cases</strong>, such as:
                </p>
                <ul>
                  <li>Duplicate charges</li>
                  <li>Technical failures preventing access to the platform</li>
                </ul>
                <p>
                  All requests for refunds under exceptional circumstances must be submitted to <strong>support@otopost.com</strong> with relevant details.
                </p>
              </div>

              <div className="refund-section">
                <h2>5. Acceptance</h2>
                <p>
                  By subscribing, users agree to this Refund Policy.
                </p>
                <p>
                  <span className="brand-name">OtoPost</span> reserves the right to review and deny refund requests that do not meet the criteria above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* Refund Policy Page Styles */
        .hero-container1 {
          display: grid;
          gap: 4rem;
          align-items: start;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .refund-hero {
          padding: 120px 0 0px;
          min-height: 50vh;
          display: flex;
          align-items: center;
        }

        .refund-content-section {
          padding: 0px 0 120px;
        }

        .refund-content {
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 60px;
          backdrop-filter: blur(10px);
        }

        .refund-intro {
          margin-bottom: 17px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .refund-intro p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .refund-intro ul {
          margin: 20px 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .refund-intro li {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .refund-sections {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .refund-section {
          padding: 30px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .refund-section:last-child {
          border-bottom: none;
        }

        .refund-section h2 {
          color: #00d4ff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          margin-left: 0;
          padding-left: 0;
        }

        .refund-section h3 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          margin: 24px 0 12px 0;
        }

        .refund-section p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .refund-section ul {
          margin: 16px 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .refund-section li {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .exceptional-cases {
          margin: 16px 0;
        }

        .exceptional-cases h3 {
          color: #00d4ff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .exceptional-cases ul {
          margin: 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .exceptional-cases li {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 4px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .refund-process {
          margin: 16px 0;
        }

        .refund-process h3 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .refund-process ul {
          margin: 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .refund-process li {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 4px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .brand-name {
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .refund-content {
            padding: 40px 30px;
            margin: 0 20px;
          }

          .refund-section h2 {
            font-size: 20px;
          }

          .refund-section h3 {
            font-size: 16px;
          }

          .refund-section p,
          .refund-section li {
            font-size: 14px;
          }

          .refund-intro p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default RefundPolicyPage;
