import React, { useEffect, useState } from 'react';
import '../App.css';
import Navigation from './Navigation';
import Footer from './Footer';

function BlogPost({ post, onBack }) {
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

      {/* Blog Post */}
      <section className="blog-post-section">
        <div className="container">
          <button className="back-btn" onClick={onBack}>
            ← Back to Blog
          </button>
          
          <article className="blog-post">
            <header className="post-header">
              <div className="post-hero-image">
                <div className="hero-image-content">
                  <div className="hero-image-overlay">
                    <div className="post-meta">
                      <span className="post-category">{post.category}</span>
                      <span className="post-date">{new Date(post.date).toLocaleDateString()}</span>
                      <span className="post-read-time">{post.readTime}</span>
                    </div>
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-author">
                      <span>By {post.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>
              {/* Marketing Strategy Diagram */}
          <div className="marketing-diagram-section">
            <div className="diagram-container">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center" 
                alt="Marketing Strategy Diagram" 
                className="marketing-diagram"
              />
            </div>
          </div>
            
            <div className="post-content">
              <div className="content-intro">
                <p className="lead-paragraph">{post.excerpt}</p>
              </div>

              <div className="content-body">
                {post.content}
              </div>

              <div className="post-footer">
                <div className="post-tags">
                  {post.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                
                {/* <div className="post-share">
                  <h4>Share this article:</h4>
                  <div className="share-buttons">
                    <button className="share-btn twitter">Twitter</button>
                    <button className="share-btn linkedin">LinkedIn</button>
                    <button className="share-btn facebook">Facebook</button>
                  </div>
                </div> */}
              </div>
            </div>
          </article>

        

          {/* <div className="related-posts">
            <h3>Related Articles</h3>
            <div className="related-grid">
              {post.relatedPosts?.map((relatedPost, index) => (
                <div key={index} className="related-card">
                  <div className="related-image">
                    <span className="related-emoji">{relatedPost.image}</span>
                  </div>
                  <h4>{relatedPost.title}</h4>
                  <p>{relatedPost.excerpt.substring(0, 100)}...</p>
                  <span className="read-more">Read More →</span>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        /* Ensure proper spacing for blog content */
        .blog-post-section {
          padding: 100px 0 12px;
          min-height: 100vh;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          color: #00d4ff;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 40px;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 600;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .back-btn:hover {
          background: rgba(0, 212, 255, 0.1);
          transform: translateX(-4px);
        }
        
        .back-btn:active {
          transform: translateX(-2px) scale(0.98);
        }

        .blog-post {
          max-width: 900px;
          margin: 0 auto;
        }

        .post-header {
          margin-bottom: 60px;
        }

        .post-hero-image {
          position: relative;
          height: 400px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 27, 107, 0.1));
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 40px;
        }

        .hero-image-content {
          position: relative;
          height: 100%;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2300d4ff;stop-opacity:0.1" /><stop offset="100%" style="stop-color:%23ff1b6b;stop-opacity:0.1" /></linearGradient></defs><rect width="1200" height="400" fill="url(%23grad1)"/><circle cx="200" cy="100" r="50" fill="%2300d4ff" opacity="0.2"/><circle cx="1000" cy="300" r="80" fill="%23ff1b6b" opacity="0.2"/><rect x="300" y="150" width="100" height="60" rx="10" fill="%2300d4ff" opacity="0.3"/><rect x="800" y="200" width="120" height="80" rx="15" fill="%23ff1b6b" opacity="0.3"/></svg>') center/cover;
        }

        .hero-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 60px 40px 40px;
          color: white;
        }

        .post-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .post-category {
          background: #00d4ff;
          color: #000;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .post-date,
        .post-read-time {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
        }

        .post-title {
          color: #fff;
          font-size: 48px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 20px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .post-author {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 600;
        }

        .post-content {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.8;
          font-size: 18px;
        }

        .content-intro {
          margin-bottom: 40px;
        }

        .lead-paragraph {
          font-size: 22px;
          font-weight: 500;
          color: #fff;
          line-height: 1.6;
          margin-bottom: 0;
        }

        .content-body h2 {
          color: #fff;
          font-size: 32px;
          margin: 50px 0 25px 0;
          font-weight: 700;
        }

        .content-body h3 {
          color: #fff;
          font-size: 24px;
          margin: 35px 0 20px 0;
          font-weight: 600;
        }

        .content-body p {
          margin-bottom: 25px;
          color: rgba(255, 255, 255, 0.85);
        }

        .content-body ul,
        .content-body ol {
          margin: 25px 0;
          padding-left: 30px;
        }

        .content-body li {
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.85);
        }

        .highlight-box {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 15px;
          padding: 30px;
          margin: 40px 0;
        }

        .highlight-box h3 {
          color: #00d4ff;
          margin-top: 0;
          margin-bottom: 20px;
        }

        .highlight-box ul {
          margin: 0;
          padding-left: 20px;
        }

        .highlight-box li {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 8px;
        }

        .quote-box {
          background: rgba(255, 27, 107, 0.1);
          border-left: 4px solid #ff1b6b;
          padding: 30px;
          margin: 40px 0;
          border-radius: 0 15px 15px 0;
        }

        .quote-box blockquote {
          font-size: 20px;
          font-style: italic;
          color: #fff;
          margin: 0 0 15px 0;
          line-height: 1.6;
        }

        .quote-box cite {
          color: #ff1b6b;
          font-weight: 600;
          font-size: 16px;
        }

        .cta-box {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 27, 107, 0.1));
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 20px;
          padding: 40px;
          margin: 50px 0;
          text-align: center;
        }

        .cta-box h3 {
          color: #fff;
          margin-top: 0;
          margin-bottom: 15px;
        }

        .cta-box p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 25px;
        }

      

        .post-footer {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .post-tags {
          margin-bottom: 40px;
        }

        .tag {
          display: inline-block;
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-right: 12px;
          margin-bottom: 12px;
        }

        .post-share h4 {
          color: #fff;
          margin-bottom: 20px;
          font-size: 18px;
        }

        .share-buttons {
          display: flex;
          gap: 12px;
        }

        .share-btn {
          padding: 12px 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 600;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .share-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .share-btn.twitter:hover {
          background: #1da1f2;
          border-color: #1da1f2;
        }

        .share-btn.linkedin:hover {
          background: #0077b5;
          border-color: #0077b5;
        }

        .share-btn.facebook:hover {
          background: #4267b2;
          border-color: #4267b2;
        }

        .marketing-diagram-section {
          margin: 80px 0;
          text-align: center;
        }

        .diagram-container {
          max-width: 100%;
          margin: 0 auto;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 212, 255, 0.2);
        }

        .marketing-diagram {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.3s ease;
          max-width: 100%;
          object-fit: cover;
        }

        .marketing-diagram:hover {
          transform: scale(1.02);
        }
        
        @media (max-width: 768px) {
          .marketing-diagram:hover {
            transform: none;
          }
        }

        .related-posts {
          margin-top: 80px;
        }

        .related-posts h3 {
          color: #fff;
          font-size: 28px;
          margin-bottom: 40px;
          text-align: center;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .related-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .related-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-5px);
          border-color: rgba(0, 255, 255, 0.3);
        }

        .related-image {
          text-align: center;
          margin-bottom: 20px;
        }

        .related-emoji {
          font-size: 48px;
        }

        .related-card h4 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .related-card p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .read-more {
          color: #00d4ff;
          font-weight: 600;
          font-size: 14px;
        }

        /* Mobile First Responsive Design */
        @media (max-width: 1200px) {
          .blog-post {
            max-width: 100%;
            padding: 0 20px;
          }
          
          .post-title {
            font-size: 42px;
          }
          
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 992px) {
          .blog-post-section {
            padding: 80px 0 100px;
          }
          
          .post-title {
            font-size: 38px;
          }
          
          .post-hero-image {
            height: 350px;
            margin-bottom: 30px;
          }
          
          .hero-image-overlay {
            padding: 50px 30px 30px;
          }
          
          .post-meta {
            gap: 15px;
          }
          
          .content-body h2 {
            font-size: 28px;
          }
          
          .content-body h3 {
            font-size: 22px;
          }
          
          .lead-paragraph {
            font-size: 20px;
          }
          
          .post-content {
            font-size: 17px;
          }
          
          .marketing-diagram-section {
            margin: 60px 0;
          }
          
          .related-posts h3 {
            font-size: 24px;
          }
        }

        @media (max-width: 768px) {
          .blog-post-section {
            padding: 60px 0 80px;
          }
          
          .container {
            padding: 0 15px;
          }
          
          .back-btn {
            padding: 10px 20px;
            font-size: 13px;
            margin-bottom: 30px;
          }
          
          .post-title {
            font-size: 32px;
            line-height: 1.2;
          }

          .post-hero-image {
            height: 280px;
            border-radius: 15px;
            margin-bottom: 25px;
          }

          .hero-image-overlay {
            padding: 30px 20px 20px;
          }

          .post-meta {
            flex-direction: column;
            gap: 8px;
            margin-bottom: 15px;
          }
          
          .post-category {
            font-size: 11px;
            padding: 5px 12px;
          }
          
          .post-date,
          .post-read-time {
            font-size: 13px;
          }
          
          .post-author {
            font-size: 14px;
          }

          .content-body h2 {
            font-size: 24px;
            margin: 40px 0 20px 0;
          }

          .content-body h3 {
            font-size: 20px;
            margin: 30px 0 15px 0;
          }

          .post-content {
            font-size: 16px;
            line-height: 1.7;
          }
          
          .lead-paragraph {
            font-size: 18px;
            line-height: 1.5;
          }
          
          .content-body p {
            margin-bottom: 20px;
          }
          
          .content-body ul,
          .content-body ol {
            margin: 20px 0;
            padding-left: 25px;
          }
          
          .highlight-box,
          .quote-box,
          .cta-box {
            padding: 20px;
            margin: 30px 0;
            border-radius: 12px;
          }
          
          .highlight-box h3,
          .quote-box blockquote {
            font-size: 18px;
          }
          
          .quote-box blockquote {
            font-size: 16px;
          }
          
          .cta-box h3 {
            font-size: 20px;
          }

          .related-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .related-card {
            padding: 20px;
          }
          
          .related-card h4 {
            font-size: 16px;
          }
          
          .related-card p {
            font-size: 13px;
          }
          
          .related-emoji {
            font-size: 40px;
          }

          .share-buttons {
            flex-direction: column;
            gap: 10px;
          }
          
          .share-btn {
            padding: 10px 20px;
            font-size: 13px;
          }
          
          .post-footer {
            margin-top: 40px;
            padding-top: 30px;
          }
          
          .post-tags {
            margin-bottom: 30px;
          }
          
          .tag {
            font-size: 12px;
            padding: 6px 12px;
            margin-right: 8px;
            margin-bottom: 8px;
          }
          
          .post-share h4 {
            font-size: 16px;
            margin-bottom: 15px;
          }
          
          .marketing-diagram-section {
            margin: 50px 0;
          }
          
          .diagram-container {
            border-radius: 15px;
          }
        }

        @media (max-width: 576px) {
          .blog-post-section {
            padding: 40px 0 60px;
          }
          
          .container {
            padding: 0 10px;
          }
          
          .back-btn {
            padding: 8px 16px;
            font-size: 12px;
            margin-bottom: 25px;
          }
          
          .post-title {
            font-size: 28px;
            line-height: 1.3;
          }

          .post-hero-image {
            height: 250px;
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .hero-image-overlay {
            padding: 25px 15px 15px;
          }
          
          .post-meta {
            gap: 6px;
            margin-bottom: 12px;
          }
          
          .post-category {
            font-size: 10px;
            padding: 4px 10px;
          }
          
          .post-date,
          .post-read-time {
            font-size: 12px;
          }
          
          .post-author {
            font-size: 13px;
          }

          .content-body h2 {
            font-size: 22px;
            margin: 35px 0 18px 0;
          }

          .content-body h3 {
            font-size: 18px;
            margin: 25px 0 12px 0;
          }

          .post-content {
            font-size: 15px;
            line-height: 1.6;
          }
          
          .lead-paragraph {
            font-size: 16px;
            line-height: 1.4;
          }
          
          .content-body p {
            margin-bottom: 18px;
          }
          
          .content-body ul,
          .content-body ol {
            margin: 18px 0;
            padding-left: 20px;
          }
          
          .highlight-box,
          .quote-box,
          .cta-box {
            padding: 15px;
            margin: 25px 0;
            border-radius: 10px;
          }
          
          .highlight-box h3,
          .quote-box blockquote {
            font-size: 16px;
          }
          
          .quote-box blockquote {
            font-size: 14px;
          }
          
          .cta-box h3 {
            font-size: 18px;
          }

          .related-posts {
            margin-top: 60px;
          }
          
          .related-posts h3 {
            font-size: 22px;
            margin-bottom: 30px;
          }
          
          .related-card {
            padding: 15px;
          }
          
          .related-card h4 {
            font-size: 15px;
          }
          
          .related-card p {
            font-size: 12px;
          }
          
          .related-emoji {
            font-size: 35px;
          }

          .share-buttons {
            gap: 8px;
          }
          
          .share-btn {
            padding: 8px 16px;
            font-size: 12px;
          }
          
          .post-footer {
            margin-top: 35px;
            padding-top: 25px;
          }
          
          .post-tags {
            margin-bottom: 25px;
          }
          
          .tag {
            font-size: 11px;
            padding: 5px 10px;
            margin-right: 6px;
            margin-bottom: 6px;
          }
          
          .post-share h4 {
            font-size: 15px;
            margin-bottom: 12px;
          }
          
          .marketing-diagram-section {
            margin: 40px 0;
          }
        }

        @media (max-width: 480px) {
          .post-title {
            font-size: 24px;
          }
          
          .post-hero-image {
            height: 220px;
          }
          
          .hero-image-overlay {
            padding: 20px 12px 12px;
          }
          
          .content-body h2 {
            font-size: 20px;
          }
          
          .content-body h3 {
            font-size: 16px;
          }
          
          .post-content {
            font-size: 14px;
          }
          
          .lead-paragraph {
            font-size: 15px;
          }
          
          .related-posts h3 {
            font-size: 20px;
          }
          
          .share-btn {
            min-height: 48px;
            font-size: 13px;
          }
          
          .back-btn {
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        
        /* Additional mobile optimizations */
        @media (max-width: 768px) {
          .share-btn:active {
            transform: scale(0.95);
          }
          
          .back-btn:active {
            transform: scale(0.95);
          }
          
          .related-card:active {
            transform: scale(0.98);
          }
        }
        
        /* Improve text selection on mobile */
        @media (max-width: 768px) {
          .post-content p,
          .post-content li {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }
        }
      `}</style>
    </div>
  );
}

export default BlogPost;
