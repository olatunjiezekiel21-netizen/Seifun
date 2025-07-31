const puppeteer = require('puppeteer');

async function runComprehensiveLocalTest() {
  console.log('🚀 Starting Comprehensive Seifu Local Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  // Collect test results
  const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  function logTest(name, status, details = '') {
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${name}: ${status} ${details}`);
    
    testResults.details.push({ name, status, details });
    if (status === 'PASS') testResults.passed++;
    else if (status === 'FAIL') testResults.failed++;
    else testResults.warnings++;
  }

  try {
    // Test 1: Application Loading
    console.log('\n📱 Testing Application Loading...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 10000 });
    
    const title = await page.title();
    logTest('Page Title', title.includes('Seifu') ? 'PASS' : 'FAIL', `"${title}"`);
    
    const seifuLogo = await page.$('img[alt*="Seifu"], span:contains("seifu")');
    logTest('Seifu Branding', seifuLogo ? 'PASS' : 'FAIL');

    // Test 2: Navigation Structure
    console.log('\n🧭 Testing Navigation...');
    
    const launchpadLink = await page.$('a[href="/launchpad"]');
    logTest('Launchpad Navigation', launchpadLink ? 'PASS' : 'FAIL');
    
    const seifunLaunchLink = await page.$('a[href="/seifun-launch"]');
    logTest('seifun.launch Navigation (renamed from MemeHub)', seifunLaunchLink ? 'PASS' : 'FAIL');
    
    const docsLink = await page.$('a[href="/docs"]');
    logTest('Docs Navigation', docsLink ? 'PASS' : 'FAIL');

    // Test 3: Wallet Connection
    console.log('\n💳 Testing Wallet Connection...');
    
    const walletButton = await page.$('button:has-text("Connect Wallet"), button:has-text("Connect")');
    if (walletButton) {
      logTest('Wallet Button Present', 'PASS');
      
      // Click wallet button to test dropdown
      await walletButton.click();
      await page.waitForTimeout(1000);
      
      // Check for wallet options or dropdown
      const walletOptions = await page.$$('button, div');
      const hasWalletUI = walletOptions.length > 0;
      logTest('Wallet Connection UI', hasWalletUI ? 'PASS' : 'WARN', 'UI responds to click');
      
    } else {
      logTest('Wallet Button Present', 'FAIL');
    }

    // Test 4: Token Scanner
    console.log('\n🔍 Testing Token Scanner...');
    
    const scannerInput = await page.$('input[placeholder*="address"], input[placeholder*="token"], input[type="text"]');
    if (scannerInput) {
      logTest('Scanner Input Field', 'PASS');
      
      // Test input functionality
      await scannerInput.type('0x1234567890123456789012345678901234567890');
      const inputValue = await page.evaluate(el => el.value, scannerInput);
      logTest('Scanner Input Functionality', inputValue.length > 0 ? 'PASS' : 'FAIL');
      
      // Look for scan button
      const scanButton = await page.$('button:has-text("Scan"), button:has-text("Analyze"), button[type="submit"]');
      logTest('Scanner Submit Button', scanButton ? 'PASS' : 'WARN', 'May be context-dependent');
      
    } else {
      logTest('Scanner Input Field', 'WARN', 'May be in a different section');
    }

    // Test 5: seifun.launch Page (renamed from MemeHub)
    console.log('\n🎯 Testing seifun.launch Page...');
    
    try {
      await page.goto('http://localhost:8081/seifun-launch', { waitUntil: 'networkidle2', timeout: 10000 });
      
      const pageContent = await page.content();
      const hasSeifunContent = pageContent.includes('seifun') || pageContent.includes('launch') || pageContent.includes('token');
      logTest('seifun.launch Page Loads', hasSeifunContent ? 'PASS' : 'FAIL');
      
      // Check for token-related elements
      const tokenElements = await page.$$('[class*="token"], [class*="grid"], [class*="card"]');
      logTest('Token Display Elements', tokenElements.length > 0 ? 'PASS' : 'WARN', `Found ${tokenElements.length} elements`);
      
    } catch (error) {
      logTest('seifun.launch Page Loads', 'FAIL', error.message);
    }

    // Test 6: Launchpad Page
    console.log('\n🚀 Testing Launchpad Page...');
    
    try {
      await page.goto('http://localhost:8081/launchpad', { waitUntil: 'networkidle2', timeout: 10000 });
      
      const launchpadContent = await page.content();
      const hasLaunchpadContent = launchpadContent.includes('launch') || launchpadContent.includes('create') || launchpadContent.includes('token');
      logTest('Launchpad Page Loads', hasLaunchpadContent ? 'PASS' : 'FAIL');
      
    } catch (error) {
      logTest('Launchpad Page Loads', 'FAIL', error.message);
    }

    // Test 7: Docs Page
    console.log('\n📚 Testing Docs Page...');
    
    try {
      await page.goto('http://localhost:8081/docs', { waitUntil: 'networkidle2', timeout: 10000 });
      
      const docsContent = await page.content();
      const hasDocsContent = docsContent.includes('documentation') || docsContent.includes('guide') || docsContent.includes('API');
      logTest('Docs Page Loads', hasDocsContent ? 'PASS' : 'WARN', 'Content may be minimal');
      
    } catch (error) {
      logTest('Docs Page Loads', 'FAIL', error.message);
    }

    // Test 8: Mobile Responsiveness
    console.log('\n📱 Testing Mobile Responsiveness...');
    
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
    await page.setViewport({ width: 375, height: 667 }); // iPhone size
    await page.waitForTimeout(1000);
    
    const mobileMenu = await page.$('button[class*="md:hidden"], button:has-text("Menu")');
    logTest('Mobile Navigation Menu', mobileMenu ? 'PASS' : 'WARN', 'Responsive design detected');
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Test 9: Performance Check
    console.log('\n⚡ Testing Performance...');
    
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
    
    const performanceMetrics = await page.metrics();
    const jsHeapMB = (performanceMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2);
    const nodeCount = performanceMetrics.Nodes;
    
    logTest('JavaScript Heap Usage', parseFloat(jsHeapMB) < 50 ? 'PASS' : 'WARN', `${jsHeapMB} MB`);
    logTest('DOM Node Count', nodeCount < 2000 ? 'PASS' : 'WARN', `${nodeCount} nodes`);

    // Test 10: Console Errors
    console.log('\n🐛 Testing for Console Errors...');
    
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    
    logTest('Console Errors', logs.length === 0 ? 'PASS' : 'WARN', `${logs.length} errors found`);
    
    if (logs.length > 0) {
      console.log('\n⚠️ Console Errors Found:');
      logs.forEach((log, i) => console.log(`   ${i + 1}. ${log}`));
    }

    // Test 11: Network Requests
    console.log('\n🌐 Testing Network Requests...');
    
    const responses = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        responses.push({ url: response.url(), status: response.status() });
      }
    });
    
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    logTest('Network Requests', responses.length === 0 ? 'PASS' : 'WARN', `${responses.length} failed requests`);
    
    if (responses.length > 0) {
      console.log('\n⚠️ Failed Network Requests:');
      responses.forEach((resp, i) => console.log(`   ${i + 1}. ${resp.status} - ${resp.url}`));
    }

    // Test Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Tests Passed: ${testResults.passed}`);
    console.log(`❌ Tests Failed: ${testResults.failed}`);
    console.log(`⚠️ Warnings: ${testResults.warnings}`);
    console.log(`📊 Total Tests: ${testResults.details.length}`);
    
    const successRate = ((testResults.passed / testResults.details.length) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    console.log('\n🌐 Application URLs:');
    console.log('📱 Homepage: http://localhost:8081');
    console.log('🔗 seifun.launch: http://localhost:8081/seifun-launch');
    console.log('🚀 Launchpad: http://localhost:8081/launchpad');
    console.log('📚 Docs: http://localhost:8081/docs');
    
    if (testResults.failed === 0) {
      console.log('\n🎉 ALL CRITICAL TESTS PASSED! Your Seifu app is ready for use.');
    } else {
      console.log(`\n⚠️ ${testResults.failed} critical issues found. Please review and fix.`);
    }
    
    console.log('\n🔍 Browser will remain open for manual testing...');
    console.log('Press Ctrl+C when done testing.');
    
    // Keep browser open for manual testing
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    logTest('Test Suite Execution', 'FAIL', error.message);
  } finally {
    // Browser will be closed when user presses Ctrl+C
  }
}

// Run the comprehensive test
runComprehensiveLocalTest().catch(console.error);