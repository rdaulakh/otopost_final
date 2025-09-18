# Deployment Guide - AI Social Media Management Platform

This guide provides step-by-step instructions for deploying the AI Social Media Management Platform to AWS using S3 + CloudFront.

## 🏗 Architecture Overview

```
User → CloudFront (CDN) → S3 (Static Hosting) → Backend APIs
                     ↓
                Route 53 (DNS) → SSL Certificate
```

## 📋 Prerequisites

### AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Domain name (optional but recommended)

### Required AWS Services
- **S3** - Static website hosting
- **CloudFront** - Content Delivery Network
- **Route 53** - DNS management (if using custom domain)
- **Certificate Manager** - SSL certificates
- **IAM** - Access management

## 🚀 Step-by-Step Deployment

### Step 1: Prepare the Application

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your production values
```

3. **Build for production**
```bash
npm run build
```

4. **Verify build**
```bash
# Check dist/ folder contains all files
ls -la dist/
```

### Step 2: Create S3 Bucket

1. **Create S3 bucket**
```bash
aws s3 mb s3://your-app-name-frontend --region us-east-1
```

2. **Configure bucket for static hosting**
```bash
aws s3 website s3://your-app-name-frontend \
  --index-document index.html \
  --error-document index.html
```

3. **Set bucket policy for public access**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-name-frontend/*"
    }
  ]
}
```

Apply the policy:
```bash
aws s3api put-bucket-policy \
  --bucket your-app-name-frontend \
  --policy file://bucket-policy.json
```

### Step 3: Upload Application Files

1. **Upload build files to S3**
```bash
aws s3 sync dist/ s3://your-app-name-frontend --delete
```

2. **Set proper content types**
```bash
# Set cache headers for static assets
aws s3 cp dist/ s3://your-app-name-frontend \
  --recursive \
  --cache-control "max-age=31536000" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Set no-cache for HTML files
aws s3 cp dist/ s3://your-app-name-frontend \
  --recursive \
  --cache-control "no-cache" \
  --include "*.html"
```

### Step 4: Create CloudFront Distribution

1. **Create distribution configuration**
```json
{
  "CallerReference": "social-media-app-2024",
  "Comment": "AI Social Media Management Platform",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-your-app-name-frontend",
        "DomainName": "your-app-name-frontend.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-app-name-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
```

2. **Create the distribution**
```bash
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Step 5: Configure Custom Domain (Optional)

1. **Request SSL certificate**
```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --domain-name *.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

2. **Validate certificate**
- Follow AWS Console instructions to add DNS records
- Wait for certificate validation

3. **Update CloudFront distribution**
```bash
# Add custom domain and SSL certificate to distribution
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://cloudfront-config-with-domain.json
```

4. **Configure Route 53**
```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch file://route53-changeset.json
```

### Step 6: Configure CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        VITE_AUTH_DOMAIN: ${{ secrets.VITE_AUTH_DOMAIN }}
        # Add other environment variables
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to S3
      run: |
        aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
          --paths "/*"
```

## 🔧 Environment Configuration

### Production Environment Variables

Create production `.env` file:

```env
# Production API
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_NODE_ENV=production

# Authentication
VITE_AUTH_DOMAIN=auth.yourdomain.com

# Social Media APIs (Production Keys)
VITE_FACEBOOK_APP_ID=your-production-facebook-app-id
VITE_INSTAGRAM_CLIENT_ID=your-production-instagram-client-id
# ... other production keys

# Analytics
VITE_GA_TRACKING_ID=your-production-ga-id

# Feature Flags
VITE_DEBUG=false
```

## 📊 Monitoring & Analytics

### CloudWatch Setup

1. **Enable CloudFront logging**
```bash
aws logs create-log-group --log-group-name /aws/cloudfront/social-media-app
```

2. **Set up alarms**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "High-Error-Rate" \
  --alarm-description "Alert when error rate is high" \
  --metric-name "4xxErrorRate" \
  --namespace "AWS/CloudFront" \
  --statistic "Average" \
  --period 300 \
  --threshold 5.0 \
  --comparison-operator "GreaterThanThreshold"
```

### Performance Monitoring

1. **Enable Real User Monitoring (RUM)**
2. **Set up Sentry for error tracking**
3. **Configure Google Analytics**

## 🔒 Security Best Practices

### S3 Security
- Enable versioning
- Configure lifecycle policies
- Use least privilege access
- Enable access logging

### CloudFront Security
- Use HTTPS only
- Configure security headers
- Enable AWS WAF (optional)
- Set up rate limiting

### Application Security
- Implement Content Security Policy (CSP)
- Use secure authentication tokens
- Validate all user inputs
- Regular security audits

## 🚀 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
npm install --save-dev imagemin imagemin-webp

# Enable gzip compression
npm install --save-dev compression-webpack-plugin
```

### CloudFront Optimization
- Configure appropriate cache behaviors
- Use compression
- Optimize cache headers
- Enable HTTP/2

## 🔄 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Build successful locally
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance audit completed

### Deployment
- [ ] S3 bucket created and configured
- [ ] Files uploaded successfully
- [ ] CloudFront distribution created
- [ ] SSL certificate configured
- [ ] DNS records updated
- [ ] Health checks passing

### Post-Deployment
- [ ] Application accessible via domain
- [ ] All features working correctly
- [ ] Analytics tracking active
- [ ] Error monitoring configured
- [ ] Performance metrics baseline established

## 🆘 Troubleshooting

### Common Issues

1. **404 Errors on Refresh**
   - Ensure CloudFront custom error pages are configured
   - Check S3 bucket policy

2. **Slow Loading**
   - Verify CloudFront cache settings
   - Check asset optimization

3. **SSL Certificate Issues**
   - Ensure certificate is in us-east-1 region
   - Verify domain validation

4. **Build Failures**
   - Check environment variables
   - Verify Node.js version compatibility

### Useful Commands

```bash
# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

# Check S3 bucket contents
aws s3 ls s3://your-app-name-frontend --recursive

# Monitor CloudFront logs
aws logs tail /aws/cloudfront/social-media-app --follow
```

## 📞 Support

For deployment issues:
1. Check AWS CloudFormation events
2. Review CloudWatch logs
3. Verify IAM permissions
4. Contact AWS support if needed

---

**Deployment completed successfully! 🎉**

