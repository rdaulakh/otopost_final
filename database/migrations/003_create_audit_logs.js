const { MongoClient } = require('mongodb');

async function createAuditLogsCollection() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('ai_social_media');
    
    await db.createCollection('audit_logs', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['action', 'userId', 'timestamp'],
          properties: {
            action: { bsonType: 'string' },
            userId: { bsonType: 'objectId' },
            timestamp: { bsonType: 'date' },
            details: { bsonType: 'object' },
            ipAddress: { bsonType: 'string' },
            userAgent: { bsonType: 'string' }
          }
        }
      }
    });
    
    await db.collection('audit_logs').createIndex({ userId: 1 });
    await db.collection('audit_logs').createIndex({ timestamp: -1 });
    await db.collection('audit_logs').createIndex({ action: 1 });
    
    console.log('Audit logs collection created successfully');
  } finally {
    await client.close();
  }
}

module.exports = { createAuditLogsCollection };
