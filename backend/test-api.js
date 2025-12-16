#!/usr/bin/env node

/**
 * Test Script untuk Teardrop Chat API
 * 
 * Usage: node test-api.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Teardrop Chat API\n');
  console.log(`API URL: ${API_URL}\n`);

  let token = null;
  let userId = null;

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(API_URL.replace('/api', '/health'));
    const health = await healthRes.json();
    console.log('✅ Health:', health.status);
    console.log('');

    // Test 2: Register
    console.log('2️⃣ Testing User Registration...');
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    
    if (registerData.success) {
      token = registerData.data.token;
      userId = registerData.data.user.id;
      console.log('✅ Registration successful');
      console.log(`   User: ${registerData.data.user.username}`);
      console.log(`   Status: ${registerData.data.user.status}`);
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
    console.log('');

    // Test 3: Get Profile
    console.log('3️⃣ Testing Get Profile...');
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    
    if (profileData.success) {
      console.log('✅ Profile retrieved');
      console.log(`   Username: ${profileData.data.username}`);
      console.log(`   Status: ${profileData.data.status}`);
    } else {
      console.log('❌ Failed to get profile');
    }
    console.log('');

    // Test 4: Get All Users
    console.log('4️⃣ Testing Get All Users...');
    const usersRes = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersRes.json();
    
    if (usersData.success) {
      console.log('✅ Users retrieved');
      console.log(`   Total users: ${usersData.data.length}`);
      const onlineUsers = usersData.data.filter(u => u.status === 'online');
      console.log(`   Online users: ${onlineUsers.length}`);
    } else {
      console.log('❌ Failed to get users');
    }
    console.log('');

    // Test 5: Update Status
    console.log('5️⃣ Testing Update Status...');
    const statusRes = await fetch(`${API_URL}/users/status`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'away' })
    });
    const statusData = await statusRes.json();
    
    if (statusData.success) {
      console.log('✅ Status updated');
      console.log(`   New status: ${statusData.data.status}`);
    } else {
      console.log('❌ Failed to update status');
    }
    console.log('');

    // Test 6: Get Messages
    console.log('6️⃣ Testing Get Messages...');
    const messagesRes = await fetch(`${API_URL}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const messagesData = await messagesRes.json();
    
    if (messagesData.success) {
      console.log('✅ Messages retrieved');
      console.log(`   Total messages: ${messagesData.data.length}`);
    } else {
      console.log('❌ Failed to get messages');
    }
    console.log('');

    // Test 7: Logout
    console.log('7️⃣ Testing Logout...');
    const logoutRes = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const logoutData = await logoutRes.json();
    
    if (logoutData.success) {
      console.log('✅ Logout successful');
    } else {
      console.log('❌ Logout failed');
    }
    console.log('');

    console.log('✨ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run tests
testAPI();
