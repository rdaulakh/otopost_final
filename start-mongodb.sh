#!/bin/bash

# Start MongoDB with PM2
# This script will find and start the existing MongoDB process

# Find the mongod process
MONGOD_PID=$(pgrep -f "mongod --bind_ip_all")

if [ -n "$MONGOD_PID" ]; then
    echo "MongoDB is already running with PID: $MONGOD_PID"
    echo "MongoDB is accessible on localhost:27017"
    echo "Database: ai-social-media-platform"
    echo "Status: ✅ RUNNING"
else
    echo "MongoDB is not running. Starting MongoDB..."
    
    # Try to start MongoDB with different methods
    if command -v mongod >/dev/null 2>&1; then
        mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --bind_ip_all --fork
        echo "MongoDB started successfully"
    elif command -v snap >/dev/null 2>&1; then
        snap start mongodb
        echo "MongoDB started via snap"
    else
        echo "MongoDB binary not found. Please install MongoDB first."
        exit 1
    fi
fi

# Keep the process running
tail -f /var/log/mongodb/mongod.log



















