const { MongoClient } = require('mongodb');

async function createNotificationsCollection() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('ai_social_media');
    
    await db.createCollection('notifications', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'type', 'message', 'timestamp'],
          properties: {
            userId: { bsonType: 'objectId' },
            type: { 
              bsonType: 'string',
              enum: ['info', 'success', 'warning', 'error', 'system']
            },
            message: { bsonType: 'string' },
            timestamp: { bsonType: 'date' },
            read: { bsonType: 'bool' },
            data: { bsonType: 'object' }
          }
        }
      }
    });
    
    await db.collection('notifications').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ timestamp: -1 });
    await db.collection('notifications').createIndex({ read: 1 });
    
    console.log('Notifications collection created successfully');
  } finally {
    await client.close();
  }
}

module.exports = { createNotificationsCollection };
