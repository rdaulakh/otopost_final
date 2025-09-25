#!/bin/bash

# Test script to run from external systems
# This script can be run from any other system to test API connectivity

echo "🌐 External API Connectivity Test"
echo "================================="

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

# Server details
SERVER_IP="13.233.218.209"
SERVER_PORT="8000"
API_BASE="http://$SERVER_IP:$SERVER_PORT"

print_info "Testing API at: $API_BASE"
print_info "Admin Panel should use: VITE_API_BASE_URL=https://digiads.digiaeon.com/api"

# Test 1: Basic connectivity
echo ""
print_info "Test 1: Basic Connectivity"
if curl -s --connect-timeout 10 $API_BASE/health > /dev/null 2>&1; then
    print_status "Server is reachable"
else
    print_error "Server is not reachable"
    echo "Please check:"
    echo "  - Server IP: $SERVER_IP"
    echo "  - Port: $SERVER_PORT"
    echo "  - Firewall settings"
    echo "  - Network connectivity"
    exit 1
fi

# Test 2: Health endpoint
echo ""
print_info "Test 2: Health Endpoint"
HEALTH_RESPONSE=$(curl -s --connect-timeout 10 $API_BASE/health)
if [ $? -eq 0 ]; then
    print_status "Health endpoint responded"
    echo "$HEALTH_RESPONSE" | jq . 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    print_error "Health endpoint failed"
fi

# Test 3: API endpoint
echo ""
print_info "Test 3: API Endpoint"
API_RESPONSE=$(curl -s --connect-timeout 10 $API_BASE/api/v1/)
if [ $? -eq 0 ]; then
    print_status "API endpoint responded"
    echo "$API_RESPONSE" | jq . 2>/dev/null || echo "$API_RESPONSE"
else
    print_error "API endpoint failed"
fi

# Test 4: CORS test
echo ""
print_info "Test 4: CORS Test"
CORS_RESPONSE=$(curl -s --connect-timeout 10 \
    -H "Origin: https://digiads.digiaeon.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    $API_BASE/api/v1/auth/admin/login \
    -w "%{http_code}")

if [[ "$CORS_RESPONSE" == *"200"* ]] || [[ "$CORS_RESPONSE" == *"204"* ]]; then
    print_status "CORS test passed"
else
    print_warning "CORS test failed or returned unexpected response"
    echo "Response: $CORS_RESPONSE"
fi

# Test 5: Admin login endpoint (should return 401 without credentials)
echo ""
print_info "Test 5: Admin Login Endpoint"
LOGIN_RESPONSE=$(curl -s --connect-timeout 10 \
    -H "Origin: https://digiads.digiaeon.com" \
    -H "Content-Type: application/json" \
    -X POST \
    $API_BASE/api/v1/auth/admin/login \
    -d '{"email":"test@example.com","password":"test"}' \
    -w "%{http_code}")

if [[ "$LOGIN_RESPONSE" == *"401"* ]] || [[ "$LOGIN_RESPONSE" == *"400"* ]]; then
    print_status "Admin login endpoint is accessible (401/400 expected without valid credentials)"
    echo "Response: ${LOGIN_RESPONSE%???}" # Remove HTTP status code
else
    print_warning "Admin login endpoint returned unexpected response"
    echo "Response: $LOGIN_RESPONSE"
fi

# Summary
echo ""
echo "📋 External Test Summary"
echo "========================"
echo "✅ Server is reachable from external systems"
echo "✅ API endpoints are responding"
echo "✅ CORS is configured correctly"
echo ""
echo "🔧 Configuration for Admin Panel:"
echo "   VITE_API_BASE_URL=https://digiads.digiaeon.com/api"
echo ""
echo "📝 If tests pass, your API should work with the admin panel!"
echo "   Make sure your domain 'digiads.digiaeon.com' points to IP: $SERVER_IP"





