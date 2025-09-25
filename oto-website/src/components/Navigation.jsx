import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/LogoOTOPost.png';
import { handleGetStartedClick } from '../lib/auth';

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/ai-team', label: 'AI Team' },
    { href: '/features', label: 'Features' },
    { href: '/solutions', label: 'Solutions' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' }
  ];

  return (
    <>
      <nav className="futuristic-nav" style={{backgroundColor: 'rgba(10, 10, 15, 0.95)', zIndex: 1000}}>
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/"><img src={logo} alt="OTOPost" /></Link>
          </div>
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                to={link.href} 
                className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="nav-buttons">
            <button className="btn-secondary">Sign In</button>
            <button className="btn-primary" onClick={handleGetStartedClick}>Get Started Free</button>
          </div>
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        ></div>
      )}
      
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.href}
            to={link.href} 
            className={`mobile-nav-link ${location.pathname === link.href ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {link.label}
          </Link>
        ))}
        <div className="mobile-nav-buttons">
          <button className="btn-secondary" onClick={() => { handleGetStartedClick(); closeMobileMenu(); }}>Sign In</button>
          <button className="btn-primary" onClick={() => { handleGetStartedClick(); closeMobileMenu(); }}>Get Started Free</button>
        </div>
      </div>
    </>
  );
}

export default Navigation;
