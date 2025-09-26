import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

function PrivacyPolicyPage() {
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
      <section className="hero-section privacy-hero">
        <div className="hero-container1">
          <div className="hero-content text-center">
            <div className="hero-badge">
              <span className="badge-text">🔒 Your Privacy Matters 🔒</span>
            </div>
            
            <h1 className="hero-title">
              <span>Privacy</span>
              <span className="gradient-text-cyan"> Policy</span>
            </h1>

            <p className="hero-description">
              Effective Date: 25th September 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="privacy-content-section">
        <div className="container">
          <div className="privacy-content">
            <div className="privacy-intro">
              <p>
                OtoPost ("Company," "we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you use our AI-powered social media management platform ("Service").
              </p>
              
              <p>
                We comply with applicable data protection laws, including:
              </p>
              <ul>
                <li>General Data Protection Regulation (GDPR) - EU/EEA users</li>
                <li>California Consumer Privacy Act (CCPA) - California residents</li>
                <li>Information Technology Act, 2000 & SPDI Rules, 2011 - India</li>
                <li>Digital Personal Data Protection Act, 2023 (DPDP Act) - India</li>
              </ul>
              
              <p>
                By using our Service, you consent to the collection, use, and processing of your data as described in this policy.
              </p>
            </div>

            <div className="privacy-sections">
              <div className="privacy-section">
                <h2>1. Information We Collect</h2>
                <p>We collect the following categories of information:</p>
                
                <div className="info-category">
                  <h3>Account Information</h3>
                  <p>Name, email address, company details, billing information, and login credentials.</p>
                </div>
                
                <div className="info-category">
                  <h3>Connected Accounts</h3>
                  <p>Information from social media platforms you connect to our Service.</p>
                </div>
                
                <div className="info-category">
                  <h3>Usage Data</h3>
                  <p>Device information, browser type, IP address, log files, and session data.</p>
                </div>
                
                <div className="info-category">
                  <h3>Generated Content</h3>
                  <p>Posts, images, and other materials you create, schedule, or publish through our Service.</p>
                </div>
                
                <div className="info-category">
                  <h3>Payment Information</h3>
                  <p>Collected by third-party payment processors. We do not store your card details.</p>
                </div>
                
                <div className="info-category">
                  <h3>Sensitive Personal Data</h3>
                  <p>Limited to authentication and payment purposes as per Indian law, with explicit consent required.</p>
                </div>
                
                <div className="info-category">
                  <h3>Cookies & Tracking Data</h3>
                  <p>Used for authentication, analytics, and personalization purposes.</p>
                </div>
              </div>

              <div className="privacy-section">
                <h2>2. How We Use Your Information</h2>
                <p>We process your personal data for the following purposes:</p>
                <ul>
                  <li>Provide, operate, and maintain the Service</li>
                  <li>Create, schedule, and publish AI-generated content</li>
                  <li>Personalize analytics, recommendations, and reporting</li>
                  <li>Process payments, subscriptions, and renewals</li>
                  <li>Communicate about updates, offers, and support</li>
                  <li>Detect, prevent, and address fraud, abuse, or security issues</li>
                  <li>Comply with applicable laws and contractual obligations</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h2>3. Legal Basis for Processing</h2>
                
                <div className="legal-basis">
                  <h3>GDPR (EEA users):</h3>
                  <ul>
                    <li>Consent</li>
                    <li>Contractual necessity</li>
                    <li>Legitimate interests</li>
                    <li>Legal obligations</li>
                  </ul>
                </div>
                
                <div className="legal-basis">
                  <h3>CCPA (California residents):</h3>
                  <ul>
                    <li>Right to know</li>
                    <li>Right to delete</li>
                    <li>Right to opt-out</li>
                    <li>Non-discrimination</li>
                  </ul>
                </div>
                
                <div className="legal-basis">
                  <h3>India (IT Act & DPDP Act):</h3>
                  <ul>
                    <li>Notice and consent</li>
                    <li>Purpose limitation</li>
                    <li>Data minimization</li>
                    <li>Grievance redressal</li>
                  </ul>
                </div>
              </div>

              <div className="privacy-section">
                <h2>4. Sharing of Information</h2>
                <p>We do not sell your personal information. Data may be shared only with:</p>
                <ul>
                  <li><strong>Service Providers:</strong> Payment processors, hosting providers, analytics tools</li>
                  <li><strong>Social Media Platforms:</strong> When you connect accounts for content publishing</li>
                  <li><strong>Legal Authorities:</strong> If required by law or to enforce rights</li>
                  <li><strong>Business Transfers:</strong> During mergers, acquisitions, or restructuring</li>
                </ul>
              </div>

              <div className="privacy-section">
                <h2>5. Cookies & Tracking</h2>
                <p>
                  We use cookies, pixels, and similar technologies for authentication, analytics, and advertising. 
                  You may disable cookies in your browser, but some features may not function properly.
                </p>
              </div>

              <div className="privacy-section">
                <h2>6. Data Retention</h2>
                <p>We retain your information only for as long as necessary to:</p>
                <ul>
                  <li>Provide the Service</li>
                  <li>Fulfil legal requirements</li>
                  <li>Resolve disputes, or</li>
                  <li>Enforce agreements</li>
                </ul>
                <p>You may request deletion of your data at any time.</p>
              </div>

              <div className="privacy-section">
                <h2>7. Your Rights</h2>
                
                <div className="rights-section">
                  <h3>Under GDPR (EEA users):</h3>
                  <ul>
                    <li>Access, correct, delete your data</li>
                    <li>Withdraw consent at any time</li>
                    <li>Restrict or object to processing</li>
                    <li>Request portability of your data</li>
                    <li>File a complaint with a Data Protection Authority</li>
                  </ul>
                </div>
                
                <div className="rights-section">
                  <h3>Under CCPA (California residents):</h3>
                  <ul>
                    <li>Know what personal data we collect and how it's used</li>
                    <li>Request access to and deletion of your data</li>
                    <li>Opt out of "sale" of data (we do not sell data)</li>
                    <li>Non-discrimination for exercising privacy rights</li>
                  </ul>
                </div>
                
                <div className="rights-section">
                  <h3>Under Indian Law (IT Act & DPDP Act):</h3>
                  <ul>
                    <li>Right to be informed about data collection and use</li>
                    <li>Right to consent or withdraw consent</li>
                    <li>Right to access, correct, and erase personal data</li>
                    <li>Right to grievance redressal through a designated officer</li>
                  </ul>
                </div>
                
                <p>To exercise your rights, contact us at [insert email].</p>
              </div>

              <div className="privacy-section">
                <h2>8. Data Security</h2>
                <p>
                  We implement industry-standard safeguards including encryption, access control, and monitoring. 
                  While we take all reasonable precautions, no online platform can guarantee complete security.
                </p>
              </div>

              <div className="privacy-section">
                <h2>9. International Data Transfers</h2>
                <p>
                  Your data may be transferred to and stored outside your country of residence. 
                  Where required, safeguards such as Standard Contractual Clauses (SCCs) are applied.
                </p>
              </div>

              <div className="privacy-section">
                <h2>10. Children's Privacy</h2>
                <p>
                  Our Service is not directed to individuals under 16. 
                  We do not knowingly collect personal data from children.
                </p>
              </div>

              <div className="privacy-section">
                <h2>11. Updates to this Policy</h2>
                <p>
                  We may revise this Privacy Policy periodically. 
                  Updates will be posted on this page with a new Effective Date.
                </p>
              </div>

              <div className="privacy-section">
                <h2>12. Grievance Officer (India)</h2>
                <p>
                  In compliance with Indian law, we have appointed a Grievance Officer. 
                  You may contact them via email [Insert email].
                </p>
              </div>

              <div className="privacy-section">
                <h2>13. Contact Us</h2>
                <p>For privacy-related questions or rights requests:</p>
                <ul>
                  <li>Email: [Insert Contact Email]</li>
                  <li>Address: [Insert Business Address]</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* Privacy Policy Page Styles */
             .hero-container1 {
    display: grid
;
    gap: 4rem;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}
        .privacy-hero {
          padding: 120px 0 0px;
          min-height: 50vh;
          display: flex;
          align-items: center;
        }

        .privacy-content-section {
          padding: 0px 0 120px;
        }

        .privacy-content {
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 60px;
          backdrop-filter: blur(10px);
        }

        .privacy-intro {
          margin-bottom: 17px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .privacy-intro p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .privacy-intro ul {
          margin: 20px 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .privacy-intro li {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .privacy-sections {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .privacy-section {
          padding: 30px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .privacy-section:last-child {
          border-bottom: none;
        }

        .privacy-section h2 {
          color: #00d4ff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          margin-left: 0;
          padding-left: 0;
        }

        .privacy-section h3 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          margin: 24px 0 12px 0;
        }

        .privacy-section p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .privacy-section ul {
          margin: 16px 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .privacy-section li {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .info-category {
          margin: 16px 0;
        }

        .info-category h3 {
          color: #00d4ff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .info-category p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 0;
        }

        .legal-basis {
          margin: 16px 0;
        }

        .legal-basis h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .legal-basis ul {
          margin: 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .legal-basis li {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 4px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .rights-section {
          margin: 16px 0;
        }

        .rights-section h3 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .rights-section ul {
          margin: 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .rights-section li {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 4px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        @media (max-width: 768px) {
          .privacy-content {
            padding: 40px 30px;
            margin: 0 20px;
          }

          .privacy-section h2 {
            font-size: 20px;
          }

          .privacy-section h3 {
            font-size: 16px;
          }

          .privacy-section p,
          .privacy-section li {
            font-size: 14px;
          }

          .privacy-intro p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default PrivacyPolicyPage;
