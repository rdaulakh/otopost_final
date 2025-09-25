import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

function TermsOfServicePage() {
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
      <section className="hero-section terms-hero">
        <div className="hero-container1">
          <div className="hero-content text-center">
            <div className="hero-badge">
              <span className="badge-text">📋 Terms & Conditions 📋</span>
            </div>
            
            <h1 className="hero-title">
              <span>Terms of</span>
              <span className="gradient-text-cyan"> Service</span>
            </h1>

            <p className="hero-description">
              Effective Date: 25th September 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms of Service Content */}
      <section className="terms-content-section">
        <div className="container">
          <div className="terms-content">
            <div className="terms-intro">
              <p>
                Welcome to OtoPost ("Company," "we," "our," or "us"). These Terms of Service ("Terms") govern your use of our AI-powered social media management platform ("Service") operated by OtoPost.
              </p>
              
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
              
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </div>

            <div className="terms-sections">
              <div className="terms-section">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By creating an account, accessing, or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and OtoPost.
                </p>
                
                <p>
                  If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.
                </p>
              </div>

              <div className="terms-section">
                <h2>2. Description of Service</h2>
                <p>OtoPost provides an AI-powered social media management platform that includes:</p>
                
                <div className="service-category">
                  <h3>Content Creation & Management</h3>
                  <p>AI-generated posts, images, and content for various social media platforms.</p>
                </div>
                
                <div className="service-category">
                  <h3>Scheduling & Publishing</h3>
                  <p>Automated scheduling and publishing of content across multiple social media accounts.</p>
                </div>
                
                <div className="service-category">
                  <h3>Analytics & Reporting</h3>
                  <p>Performance tracking, analytics, and detailed reporting on social media activities.</p>
                </div>
                
                <div className="service-category">
                  <h3>Account Management</h3>
                  <p>Centralized management of multiple social media accounts from a single dashboard.</p>
                </div>
                
                <div className="service-category">
                  <h3>AI-Powered Features</h3>
                  <p>Intelligent content suggestions, hashtag optimization, and engagement strategies.</p>
                </div>
              </div>

              <div className="terms-section">
                <h2>3. User Accounts</h2>
                <p>To access certain features of our Service, you must register for an account. You agree to:</p>
                <ul>
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information to keep it accurate and current</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Be at least 18 years old or have parental consent if under 18</li>
                </ul>
              </div>

              <div className="terms-section">
                <h2>4. Acceptable Use Policy</h2>
                <p>You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
                
                <div className="prohibited-uses">
                  <h3>Prohibited Activities:</h3>
                  <ul>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Transmit harmful, threatening, abusive, or harassing content</li>
                    <li>Impersonate any person or entity</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use the Service for any commercial purpose without authorization</li>
                    <li>Interfere with or disrupt the Service or servers</li>
                    <li>Create multiple accounts to circumvent restrictions</li>
                    <li>Use automated systems to access the Service without permission</li>
                    <li>Share your account credentials with others</li>
                  </ul>
                </div>
              </div>

              <div className="terms-section">
                <h2>5. Content and Intellectual Property</h2>
                
                <div className="content-rights">
                  <h3>Your Content</h3>
                  <p>
                    You retain ownership of all content you create, upload, or share through our Service ("User Content"). By using our Service, you grant us a non-exclusive, royalty-free, worldwide license to use, modify, and distribute your User Content solely for the purpose of providing our Service.
                  </p>
                </div>
                
                <div className="content-rights">
                  <h3>Our Content</h3>
                  <p>
                    The Service and its original content, features, and functionality are owned by OtoPost and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </div>
                
                <div className="content-rights">
                  <h3>AI-Generated Content</h3>
                  <p>
                    Content generated by our AI tools is provided for your use, but you are responsible for ensuring it complies with all applicable laws and platform policies. We do not guarantee the accuracy or appropriateness of AI-generated content.
                  </p>
                </div>
              </div>

              <div className="terms-section">
                <h2>6. Payment Terms</h2>
                <p>Our Service offers various subscription plans with different features and pricing:</p>
                
                <div className="payment-terms">
                  <h3>Subscription Plans</h3>
                  <ul>
                    <li>Plans are billed monthly or annually as selected</li>
                    <li>All fees are non-refundable except as required by law</li>
                    <li>Prices may change with 30 days' notice</li>
                    <li>Payment is due in advance for each billing period</li>
                  </ul>
                </div>
                
                <div className="payment-terms">
                  <h3>Payment Processing</h3>
                  <ul>
                    <li>We use third-party payment processors</li>
                    <li>You authorize us to charge your payment method</li>
                    <li>Failed payments may result in service suspension</li>
                    <li>You are responsible for all applicable taxes</li>
                  </ul>
                </div>
                
                <div className="payment-terms">
                  <h3>Cancellation & Refunds</h3>
                  <ul>
                    <li>You may cancel your subscription at any time</li>
                    <li>Cancellation takes effect at the end of the current billing period</li>
                    <li>No refunds for partial periods unless required by law</li>
                    <li>Refund requests must be submitted within 7 days of payment</li>
                  </ul>
                </div>
              </div>

              <div className="terms-section">
                <h2>7. Privacy and Data Protection</h2>
                <p>
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
                
                <p>
                  We comply with applicable data protection laws, including GDPR, CCPA, and Indian data protection regulations. By using our Service, you consent to the collection and use of your information as described in our Privacy Policy.
                </p>
              </div>

              <div className="terms-section">
                <h2>8. Service Availability</h2>
                <p>
                  We strive to provide continuous service availability, but we do not guarantee that our Service will be uninterrupted or error-free. We may:
                </p>
                <ul>
                  <li>Perform scheduled maintenance with advance notice</li>
                  <li>Implement updates and improvements</li>
                  <li>Suspend service for security or legal reasons</li>
                  <li>Modify or discontinue features at our discretion</li>
                </ul>
              </div>

              <div className="terms-section">
                <h2>9. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, OtoPost shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or downtime</li>
                  <li>Third-party platform changes or restrictions</li>
                  <li>Content moderation decisions by social media platforms</li>
                  <li>AI-generated content that violates platform policies</li>
                </ul>
                
                <p>
                  Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
                </p>
              </div>

              <div className="terms-section">
                <h2>10. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless OtoPost, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
                </p>
                <ul>
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your User Content</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your violation of any applicable laws or regulations</li>
                </ul>
              </div>

              <div className="terms-section">
                <h2>11. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:
                </p>
                <ul>
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Non-payment of fees</li>
                  <li>Extended periods of inactivity</li>
                  <li>At our sole discretion</li>
                </ul>
                
                <p>
                  Upon termination, your right to use the Service will cease immediately, and we may delete your account and data.
                </p>
              </div>

              <div className="terms-section">
                <h2>12. Governing Law and Dispute Resolution</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
                </p>
                
                <p>
                  Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 2015, or through the appropriate courts in India.
                </p>
              </div>

              <div className="terms-section">
                <h2>13. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
                </p>
                
                <p>
                  If you do not agree to the modified Terms, you must discontinue your use of the Service.
                </p>
              </div>

              <div className="terms-section">
                <h2>14. Severability</h2>
                <p>
                  If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will remain in full force and effect.
                </p>
              </div>

              <div className="terms-section">
                <h2>15. Contact Information</h2>
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <ul>
                  <li>Email: [Insert Contact Email]</li>
                  <li>Address: [Insert Business Address]</li>
                  <li>Phone: [Insert Contact Phone]</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* Terms of Service Page Styles */
        .hero-container1 {
          display: grid;
          gap: 4rem;
          align-items: start;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .terms-hero {
          padding: 120px 0 0px;
          min-height: 50vh;
          display: flex;
          align-items: center;
        }

        .terms-content-section {
          padding: 0px 0 120px;
        }

        .terms-content {
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 60px;
          backdrop-filter: blur(10px);
        }

        .terms-intro {
          margin-bottom: 17px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .terms-intro p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .terms-sections {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .terms-section {
          padding: 30px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .terms-section:last-child {
          border-bottom: none;
        }

        .terms-section h2 {
          color: #00d4ff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          margin-left: 0;
          padding-left: 0;
        }

        .terms-section h3 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          margin: 24px 0 12px 0;
        }

        .terms-section p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .terms-section ul {
          margin: 16px 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .terms-section li {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .service-category {
          margin: 16px 0;
        }

        .service-category h3 {
          color: #00d4ff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .service-category p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 0;
        }

        .prohibited-uses {
          margin: 16px 0;
        }

        .prohibited-uses h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .prohibited-uses ul {
          margin: 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .prohibited-uses li {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 4px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        .content-rights {
          margin: 16px 0;
        }

        .content-rights h3 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .content-rights p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 0 0 16px 0;
        }

        .payment-terms {
          margin: 16px 0;
        }

        .payment-terms h3 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .payment-terms ul {
          margin: 0;
          padding-left: 32px;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 0;
        }

        .payment-terms li {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin-bottom: 4px;
          padding-left: 20px;
          text-indent: 0;
          margin-left: 0;
        }

        @media (max-width: 768px) {
          .terms-content {
            padding: 40px 30px;
            margin: 0 20px;
          }

          .terms-section h2 {
            font-size: 20px;
          }

          .terms-section h3 {
            font-size: 16px;
          }

          .terms-section p,
          .terms-section li {
            font-size: 14px;
          }

          .terms-intro p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default TermsOfServicePage;
