#!/bin/bash

# Upload AI Social Media Platform to EC2
# Run this script from your local machine

set -e

# Configuration
EC2_HOST="ec2-35-154-252-126.ap-south-1.compute.amazonaws.com"
EC2_USER="ubuntu"
EC2_KEY="/Users/mymacbook/Desktop/RajeevExoways/Digiaeon/doc/jiitii.pem"
PROJECT_DIR="/home/ubuntu/ai-social-media-platform"

echo "🚀 Uploading AI Social Media Platform to EC2..."

# Create project directory on EC2
echo "📁 Creating project directory on EC2..."
ssh -i "$EC2_KEY" $EC2_USER@$EC2_HOST "mkdir -p $PROJECT_DIR"

# Upload the entire project
echo "📦 Uploading project files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude 'dist' \
    --exclude 'build' \
    -e "ssh -i $EC2_KEY" \
    ./ $EC2_USER@$EC2_HOST:$PROJECT_DIR/

# Make deployment script executable
echo "🔧 Setting up deployment script..."
ssh -i "$EC2_KEY" $EC2_USER@$EC2_HOST "chmod +x $PROJECT_DIR/deploy-to-ec2.sh"

echo "✅ Upload completed successfully!"
echo ""
echo "Next steps:"
echo "1. SSH into your server:"
echo "   ssh -i \"$EC2_KEY\" $EC2_USER@$EC2_HOST"
echo ""
echo "2. Navigate to project directory:"
echo "   cd $PROJECT_DIR"
echo ""
echo "3. Run the deployment script:"
echo "   ./deploy-to-ec2.sh"
echo ""
echo "4. The script will automatically:"
echo "   - Install Docker and Docker Compose"
echo "   - Install Nginx and SSL certificates"
echo "   - Configure the domain posts.digiaeon.com"
echo "   - Start all services"
echo ""
echo "Your platform will be available at: https://posts.digiaeon.com"
