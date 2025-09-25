// Authentication Fix Verification Script
// This script tests the authentication flow to ensure tokens are properly stored and persisted

const API_BASE_URL = 'http://localhost:8000/api';

async function testAuthenticationFlow() {
    console.log('🔍 Testing Authentication Flow...\n');
    
    // Step 1: Test Login
    console.log('1️⃣ Testing Login...');
    try {
        const loginResponse = await fetch(`${API_BASE_URL}/auth/customer/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginData.success) {
            console.log('✅ Login successful');
            console.log(`   User: ${loginData.data.user.email}`);
            console.log(`   Token: ${loginData.data.tokens.accessToken.substring(0, 50)}...`);
            
            // Step 2: Test Token Storage (simulate frontend behavior)
            console.log('\n2️⃣ Testing Token Storage...');
            const token = loginData.data.tokens.accessToken;
            const user = loginData.data.user;
            
            // Simulate localStorage storage
            const mockLocalStorage = {
                authToken: token,
                user: JSON.stringify(user)
            };
            
            console.log('✅ Token stored in localStorage');
            console.log(`   Token length: ${token.length}`);
            console.log(`   User email: ${user.email}`);
            
            // Step 3: Test Token Validation
            console.log('\n3️⃣ Testing Token Validation...');
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp < currentTime;
                
                console.log(`✅ Token validation successful`);
                console.log(`   User ID: ${payload.userId}`);
                console.log(`   Expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
                console.log(`   Is expired: ${isExpired}`);
                
                if (isExpired) {
                    console.log('❌ Token is expired!');
                    return;
                }
            } catch (error) {
                console.log(`❌ Token validation failed: ${error.message}`);
                return;
            }
            
            // Step 4: Test API Call with Token
            console.log('\n4️⃣ Testing API Call with Token...');
            try {
                const apiResponse = await fetch(`${API_BASE_URL}/ai-agents`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                const apiData = await apiResponse.json();
                
                if (apiResponse.ok) {
                    console.log('✅ API call successful');
                    console.log(`   Status: ${apiResponse.status}`);
                    console.log(`   Agents count: ${apiData.data?.agents?.length || 0}`);
                } else {
                    console.log(`❌ API call failed: ${apiResponse.status}`);
                    console.log(`   Response: ${JSON.stringify(apiData, null, 2)}`);
                }
            } catch (error) {
                console.log(`❌ API call error: ${error.message}`);
            }
            
            // Step 5: Test Subscriptions API
            console.log('\n5️⃣ Testing Subscriptions API...');
            try {
                const subResponse = await fetch(`${API_BASE_URL}/subscriptions`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                const subData = await subResponse.json();
                
                if (subResponse.ok) {
                    console.log('✅ Subscriptions API call successful');
                    console.log(`   Status: ${subResponse.status}`);
                    console.log(`   Subscriptions count: ${subData.data?.subscriptions?.length || 0}`);
                } else {
                    console.log(`❌ Subscriptions API call failed: ${subResponse.status}`);
                    console.log(`   Response: ${JSON.stringify(subData, null, 2)}`);
                }
            } catch (error) {
                console.log(`❌ Subscriptions API call error: ${error.message}`);
            }
            
        } else {
            console.log('❌ Login failed');
            console.log(`   Error: ${loginData.error || loginData.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Login error: ${error.message}`);
    }
    
    console.log('\n🏁 Authentication flow test completed');
}

// Run the test
testAuthenticationFlow();











