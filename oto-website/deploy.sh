#!/bin/bash

# OTOPost Website Deployment Script
echo "🚀 Starting OTOPost website deployment..."

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Exiting..."
    exit 1
fi

echo "✅ Build completed successfully!"

# Copy files to web directory
echo "📁 Copying files to web directory..."
sudo cp -r dist/* /var/www/otopost.io/

# Set correct permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/otopost.io/
sudo chmod -R 755 /var/www/otopost.io/

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Test the deployment
echo "🧪 Testing deployment..."
if curl -s -o /dev/null -w "%{http_code}" http://otopost.io | grep -q "200"; then
    echo "✅ HTTP deployment successful!"
else
    echo "❌ HTTP deployment failed!"
fi

if curl -s -o /dev/null -w "%{http_code}" https://otopost.io | grep -q "200"; then
    echo "✅ HTTPS deployment successful!"
else
    echo "❌ HTTPS deployment failed!"
fi

echo "🎉 Deployment completed!"
echo "🌐 Website is live at: https://otopost.io"
