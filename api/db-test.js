require('dotenv').config({ path: '/home/ubuntu/ai-social-media-platform/api/.env' });
const { MongoClient } = require("mongodb");

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log(`Attempting to connect to: ${uri}`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

run().catch(console.dir);
