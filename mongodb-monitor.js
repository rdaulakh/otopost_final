#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 MongoDB Monitor started...');

function checkMongoDB() {
  exec('pgrep -f "mongod --bind_ip_all"', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ MongoDB is not running');
      return;
    }
    
    const pid = stdout.trim();
    if (pid) {
      console.log(`✅ MongoDB is running (PID: ${pid})`);
      
      // Check if port 27017 is listening
      exec('lsof -i :27017', (error, stdout, stderr) => {
        if (stdout) {
          console.log('✅ MongoDB is listening on port 27017');
        } else {
          console.log('❌ MongoDB port 27017 is not accessible');
        }
      });
    } else {
      console.log('❌ MongoDB process not found');
    }
  });
}

// Check MongoDB status every 30 seconds
setInterval(checkMongoDB, 30000);

// Initial check
checkMongoDB();

console.log('📊 MongoDB Monitor is active. Checking every 30 seconds...');
console.log('Press Ctrl+C to stop monitoring');



















