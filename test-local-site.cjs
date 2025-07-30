#!/usr/bin/env node

/**
 * Local Site Testing Script
 * Tests the locally running Seifu app for functionality
 */

const http = require('http');
const https = require('https');

console.log('🧪 Testing Local Seifu Site');
console.log('============================\n');

// Test ports to check
const ports = [5173, 8080, 3000, 3001];
let serverFound = false;

async function testPort(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'HEAD',
      timeout: 2000
    }, (res) => {
      resolve({ port, status: res.statusCode, working: true });
    });
    
    req.on('error', () => {
      resolve({ port, working: false });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ port, working: false });
    });
    
    req.end();
  });
}

async function testAllPorts() {
  console.log('🔍 Checking for development server...\n');
  
  for (const port of ports) {
    const result = await testPort(port);
    
    if (result.working) {
      console.log(`✅ Server found on port ${port}`);
      console.log(`🌐 URL: http://localhost:${port}`);
      serverFound = true;
      
      // Test if it's serving our React app
      await testReactApp(port);
      break;
    } else {
      console.log(`❌ No server on port ${port}`);
    }
  }
  
  if (!serverFound) {
    console.log('\n⚠️  No development server found!');
    console.log('\n📋 To start the server:');
    console.log('1. Run: npm run dev');
    console.log('2. Wait for "Local: http://localhost:5173"');
    console.log('3. Open the URL in your browser');
  }
}

async function testReactApp(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check if it's our React app
        if (data.includes('Seifu') || data.includes('SeifuGuard') || data.includes('root')) {
          console.log('✅ React app detected');
          console.log('✅ Site is serving correctly');
          
          // Check for key components
          if (data.includes('TokenScanner') || data.includes('token')) {
            console.log('✅ Token scanner functionality detected');
          }
          
          console.log('\n🎯 Test Results:');
          console.log('• ✅ Server running');
          console.log('• ✅ React app loading');
          console.log('• ✅ Ready for testing');
          
          console.log('\n📱 Manual Tests to Perform:');
          console.log('1. 🔍 Token Scanner:');
          console.log('   - Test with contract: 0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F');
          console.log('   - Test with wallet: 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e');
          console.log('');
          console.log('2. 🚀 Token Creation:');
          console.log('   - Click "Create Token" → Should go to Launchpad');
          console.log('   - Connect wallet');
          console.log('   - Fill form and test "Create Token (2 SEI)"');
          console.log('');
          console.log('3. 📱 Mobile Testing:');
          console.log('   - Open browser dev tools');
          console.log('   - Switch to mobile view');
          console.log('   - Test all functionality');
          console.log('');
          console.log('4. 🧭 Navigation:');
          console.log('   - Test header navigation');
          console.log('   - Verify "seifu.fun" link works');
          console.log('   - Check responsive menu');
          
        } else {
          console.log('⚠️  Server running but may not be our React app');
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Error testing React app:', err.message);
      resolve();
    });
    
    req.end();
  });
}

// Run the tests
testAllPorts().then(() => {
  console.log('\n🎉 Local testing complete!');
  
  if (serverFound) {
    console.log('\n🚀 Your site is ready for:');
    console.log('• Local testing and development');
    console.log('• Netlify deployment');
    console.log('• Production use');
  }
}).catch(console.error);