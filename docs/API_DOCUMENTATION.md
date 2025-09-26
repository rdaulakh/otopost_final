# AI Social Media Platform - API Documentation

## Overview

The AI Social Media Platform provides a comprehensive REST API for managing social media content, analytics, AI agents, and user management. This API is built with Node.js, Express.js, and MongoDB.

## Base URL

```
Production: https://api.ai-social-platform.com
Staging: https://staging-api.ai-social-platform.com
Development: http://localhost:3001
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes
- **AI Content Generation**: 20 requests per minute
- **File Upload**: 10 requests per minute

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

## Error Format

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Company"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token"
  },
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

### Content Management

#### GET /api/content
Get all content with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Content status (draft, scheduled, published)
- `platform` (string): Social media platform
- `search` (string): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "content-id",
        "title": "Post Title",
        "content": "Post content...",
        "platforms": ["instagram", "facebook"],
        "status": "published",
        "createdAt": "2024-01-01T00:00:00Z",
        "publishedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### POST /api/content
Create new content.

**Request Body:**
```json
{
  "title": "Post Title",
  "content": "Post content...",
  "platforms": ["instagram", "facebook"],
  "scheduledAt": "2024-01-01T12:00:00Z",
  "metadata": {
    "hashtags": ["#socialmedia", "#marketing"],
    "mentions": ["@user"],
    "links": ["https://example.com"]
  }
}
```

#### PUT /api/content/:id
Update content.

#### DELETE /api/content/:id
Delete content.

#### POST /api/content/:id/publish
Publish content immediately.

#### POST /api/content/schedule
Schedule content for later publishing.

### AI Content Generation

#### POST /api/ai-content/generate
Generate content using AI.

**Request Body:**
```json
{
  "prompt": "Create a social media post about AI",
  "platforms": ["instagram", "facebook"],
  "tone": "engaging",
  "style": "casual",
  "length": "medium",
  "includeHashtags": true,
  "includeCallToAction": true,
  "aiProvider": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Generated content...",
    "hashtags": ["#AI", "#SocialMedia"],
    "metadata": {
      "provider": "openai",
      "model": "gpt-4",
      "tokens": 150,
      "generatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### POST /api/ai-content/caption
Generate caption for content.

#### POST /api/ai-content/hashtags
Generate hashtags for content.

#### POST /api/ai-content/analyze
Analyze content performance.

### Analytics

#### GET /api/analytics/content/:id
Get content analytics.

**Query Parameters:**
- `startDate` (string): Start date (ISO 8601)
- `endDate` (string): End date (ISO 8601)
- `platform` (string): Platform filter

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "views": 1250,
      "likes": 89,
      "comments": 12,
      "shares": 23,
      "clicks": 45,
      "reach": 1500,
      "impressions": 1800
    },
    "trends": [
      {
        "date": "2024-01-01",
        "views": 100,
        "likes": 8,
        "comments": 1
      }
    ],
    "platforms": {
      "instagram": {
        "views": 800,
        "likes": 60
      },
      "facebook": {
        "views": 450,
        "likes": 29
      }
    }
  }
}
```

#### GET /api/analytics/user
Get user analytics summary.

#### GET /api/analytics/organization
Get organization analytics.

#### GET /api/analytics/platforms
Get platform performance analytics.

### Campaigns

#### GET /api/campaigns
Get all campaigns.

#### POST /api/campaigns
Create new campaign.

**Request Body:**
```json
{
  "name": "Summer Campaign",
  "description": "Summer marketing campaign",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "budget": 5000,
  "platforms": ["instagram", "facebook", "twitter"],
  "goals": {
    "reach": 10000,
    "engagement": 500,
    "clicks": 200,
    "conversions": 50
  }
}
```

#### PUT /api/campaigns/:id
Update campaign.

#### DELETE /api/campaigns/:id
Delete campaign.

#### PUT /api/campaigns/:id/status
Update campaign status.

### AI Agents

#### GET /api/ai-agents
Get all AI agents.

#### POST /api/ai-agents
Create new AI agent.

#### PUT /api/ai-agents/:id
Update AI agent.

#### DELETE /api/ai-agents/:id
Delete AI agent.

#### POST /api/ai-agents/:id/execute
Execute AI agent.

### Notifications

#### GET /api/notifications
Get user notifications.

#### PUT /api/notifications/:id/read
Mark notification as read.

#### PUT /api/notifications/read-all
Mark all notifications as read.

#### DELETE /api/notifications/:id
Delete notification.

### File Upload

#### POST /api/upload
Upload file.

**Request:**
- Content-Type: multipart/form-data
- Body: file

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/file.jpg",
    "fileName": "file.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000
  }
}
```

#### DELETE /api/upload/:filePath
Delete file.

### Webhooks

#### POST /api/webhooks
Create webhook.

#### GET /api/webhooks
Get webhooks.

#### PUT /api/webhooks/:id
Update webhook.

#### DELETE /api/webhooks/:id
Delete webhook.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install ai-social-platform-sdk
```

```javascript
import { AISocialPlatform } from 'ai-social-platform-sdk';

const client = new AISocialPlatform({
  apiKey: 'your-api-key',
  baseURL: 'https://api.ai-social-platform.com'
});

// Generate content
const content = await client.ai.generateContent({
  prompt: 'Create a social media post about AI',
  platforms: ['instagram', 'facebook']
});
```

### Python
```bash
pip install ai-social-platform-python
```

```python
from ai_social_platform import AISocialPlatform

client = AISocialPlatform(
    api_key='your-api-key',
    base_url='https://api.ai-social-platform.com'
)

# Generate content
content = client.ai.generate_content(
    prompt='Create a social media post about AI',
    platforms=['instagram', 'facebook']
)
```

## Webhooks

The platform supports webhooks for real-time notifications. Configure webhooks in your dashboard to receive events.

### Webhook Events

- `content.published` - Content published
- `content.scheduled` - Content scheduled
- `campaign.started` - Campaign started
- `campaign.completed` - Campaign completed
- `analytics.updated` - Analytics updated
- `ai.agent.completed` - AI agent task completed

### Webhook Payload

```json
{
  "event": "content.published",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "contentId": "content-id",
    "platforms": ["instagram", "facebook"],
    "publishedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 10 requests | 15 minutes |
| AI Content | 20 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
| Analytics | 50 requests | 1 minute |

## Support

For API support and questions:
- Email: api-support@ai-social-platform.com
- Documentation: https://docs.ai-social-platform.com
- Status Page: https://status.ai-social-platform.com

