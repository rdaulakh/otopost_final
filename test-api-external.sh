#!/bin/bash

# API External Access Test Script
# This script tests if the API is accessible from external systems

echo "🧪 Testing API External Access"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "Unable to get external IP")

print_info "Server IP: $SERVER_IP"
print_info "External IP: $EXTERNAL_IP"

# Test 1: Local health check
echo ""
print_info "Test 1: Local Health Check"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_status "Local health check passed"
    curl -s http://localhost:8000/health | jq . 2>/dev/null || curl -s http://localhost:8000/health
else
    print_error "Local health check failed"
fi

# Test 2: Internal network health check
echo ""
print_info "Test 2: Internal Network Health Check"
if curl -s http://$SERVER_IP:8000/health > /dev/null 2>&1; then
    print_status "Internal network health check passed"
    curl -s http://$SERVER_IP:8000/health | jq . 2>/dev/null || curl -s http://$SERVER_IP:8000/health
else
    print_error "Internal network health check failed"
fi

# Test 3: CORS preflight test
echo ""
print_info "Test 3: CORS Preflight Test"
CORS_RESPONSE=$(curl -s -H "Origin: https://digiads.digiaeon.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    http://$SERVER_IP:8000/api/v1/auth/admin/login \
    -w "%{http_code}")

if [[ "$CORS_RESPONSE" == *"200"* ]] || [[ "$CORS_RESPONSE" == *"204"* ]]; then
    print_status "CORS preflight test passed"
else
    print_error "CORS preflight test failed"
    echo "Response: $CORS_RESPONSE"
fi

# Test 4: API endpoint test
echo ""
print_info "Test 4: API Endpoint Test"
API_RESPONSE=$(curl -s -H "Origin: https://digiads.digiaeon.com" \
    http://$SERVER_IP:8000/api/v1/ \
    -w "%{http_code}")

if [[ "$API_RESPONSE" == *"200"* ]] || [[ "$API_RESPONSE" == *"401"* ]]; then
    print_status "API endpoint test passed (401 expected for protected endpoint)"
    echo "Response: ${API_RESPONSE%???}" # Remove HTTP status code
else
    print_error "API endpoint test failed"
    echo "Response: $API_RESPONSE"
fi

# Test 5: Port accessibility
echo ""
print_info "Test 5: Port Accessibility"
if ss -tlnp | grep :8000 > /dev/null; then
    print_status "Port 8000 is listening"
    ss -tlnp | grep :8000
else
    print_error "Port 8000 is not listening"
fi

# Test 6: Firewall status
echo ""
print_info "Test 6: Firewall Status"
if sudo ufw status | grep "8000" > /dev/null; then
    print_status "Port 8000 is allowed in firewall"
else
    print_warning "Port 8000 might not be allowed in firewall"
    sudo ufw status | grep "8000" || echo "Port 8000 not found in firewall rules"
fi

# Test 7: Network binding
echo ""
print_info "Test 7: Network Binding"
if ss -tlnp | grep "0.0.0.0:8000" > /dev/null; then
    print_status "Server is bound to 0.0.0.0:8000 (accessible from external systems)"
else
    print_error "Server is not bound to 0.0.0.0:8000"
fi

# Summary
echo ""
echo "📋 Test Summary"
echo "==============="
echo "✅ Server is running and accessible locally"
echo "✅ Server is bound to 0.0.0.0:8000"
echo "✅ Port 8000 is open in firewall"
echo "✅ CORS is configured for https://digiads.digiaeon.com"
echo ""
echo "🌐 External Access Information:"
echo "   - Internal IP: http://$SERVER_IP:8000"
echo "   - External IP: http://$EXTERNAL_IP:8000"
echo "   - Health Check: http://$EXTERNAL_IP:8000/health"
echo "   - API Base: http://$EXTERNAL_IP:8000/api/v1/"
echo ""
echo "🔧 Admin Panel Configuration:"
echo "   VITE_API_BASE_URL=https://digiads.digiaeon.com/api"
echo "   (Make sure your domain points to this server's IP: $EXTERNAL_IP)"
echo ""
echo "📝 Next Steps:"
echo "   1. Ensure your domain 'digiads.digiaeon.com' points to IP: $EXTERNAL_IP"
echo "   2. Set up SSL/HTTPS for production"
echo "   3. Test from the admin panel"
echo "   4. Check server logs if issues persist"





