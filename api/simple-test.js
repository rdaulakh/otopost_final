const express = require('express');
const app = express();
const PORT = 5000;

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    features: [
      'Express server ✅',
      'JSON middleware ✅', 
      'Route handling ✅',
      'Error handling ✅'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});
