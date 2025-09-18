const { MongoClient } = require('mongodb');

async function createWebhooksCollection() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('ai_social_media');
    
    await db.createCollection('webhooks', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['platform', 'event', 'url', 'isActive'],
          properties: {
            platform: { 
              bsonType: 'string',
              enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube']
            },
            event: { bsonType: 'string' },
            url: { bsonType: 'string' },
            isActive: { bsonType: 'bool' },
            secret: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            lastTriggered: { bsonType: 'date' }
          }
        }
      }
    });
    
    await db.collection('webhooks').createIndex({ platform: 1 });
    await db.collection('webhooks').createIndex({ event: 1 });
    await db.collection('webhooks').createIndex({ isActive: 1 });
    
    console.log('Webhooks collection created successfully');
  } finally {
    await client.close();
  }
}

module.exports = { createWebhooksCollection };
