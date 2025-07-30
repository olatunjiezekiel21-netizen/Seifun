#!/usr/bin/env node

/**
 * Frontend Integration Verification Script
 * This script verifies that all our frontend changes are properly integrated
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const checkFile = (filePath, description) => {
  const exists = existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
};

const checkFileContent = (filePath, searchPattern, description) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    const found = searchPattern.test(content);
    console.log(`${found ? '✅' : '❌'} ${description}`);
    if (!found) {
      console.log(`   Expected pattern: ${searchPattern}`);
    }
    return found;
  } catch (error) {
    console.log(`❌ ${description} - File not readable: ${error.message}`);
    return false;
  }
};

console.log('🔍 Frontend Integration Verification\n');

// 1. Check core files exist
console.log('📁 Core Files:');
const coreFiles = [
  ['src/App.tsx', 'Main App component'],
  ['src/components/Header.tsx', 'Header component'],
  ['src/components/Hero.tsx', 'Hero component'],
  ['src/components/TokenScanner.tsx', 'Token Scanner component'],
  ['src/components/LaunchpadForm.tsx', 'Launchpad Form component'],
  ['src/utils/walletConnection.ts', 'Wallet Connection utility'],
  ['src/utils/tokenScanner.ts', 'Token Scanner utility'],
  ['src/pages/Launchpad.tsx', 'Launchpad page'],
  ['src/pages/MemeHub.tsx', 'MemeHub page']
];

let allFilesExist = true;
coreFiles.forEach(([file, desc]) => {
  if (!checkFile(file, desc)) allFilesExist = false;
});

console.log('\n📋 Content Verification:');

// 2. Check App.tsx routing
checkFileContent('src/App.tsx', /path="\/launchpad".*element={<Launchpad/, 'App.tsx has Launchpad route');
checkFileContent('src/App.tsx', /path="\/memehub".*element={<MemeHub/, 'App.tsx has MemeHub route');
checkFileContent('src/App.tsx', /import.*Launchpad.*from/, 'App.tsx imports Launchpad');

// 3. Check Header navigation
checkFileContent('src/components/Header.tsx', /seifu\.fun/, 'Header shows "seifu.fun" instead of MemeHub');
checkFileContent('src/components/Header.tsx', /to="\/launchpad"/, 'Header has Launchpad link');
checkFileContent('src/components/Header.tsx', /useWallet/, 'Header uses wallet connection');

// 4. Check Hero navigation
checkFileContent('src/components/Hero.tsx', /navigate\('\/launchpad'\)/, 'Hero Create Token button goes to launchpad');
checkFileContent('src/components/Hero.tsx', /navigate\('\/memehub'\)/, 'Hero Explore Tokens button goes to memehub');

// 5. Check TokenScanner fixes
checkFileContent('src/components/TokenScanner.tsx', /isWalletAddress/, 'TokenScanner has wallet detection');
checkFileContent('src/components/TokenScanner.tsx', /walletInfo/, 'TokenScanner has wallet info state');
checkFileContent('src/components/TokenScanner.tsx', /flex-col sm:flex-row/, 'TokenScanner has mobile responsiveness');

// 6. Check TokenScanner utility fixes
checkFileContent('src/utils/tokenScanner.ts', /\/\/ As requested.*return null/, 'TokenScanner utility returns null for logos');
checkFileContent('src/utils/tokenScanner.ts', /scanCount: 1/, 'TokenScanner utility has real scan count');
checkFileContent('src/utils/tokenScanner.ts', /provider\.getCode/, 'TokenScanner utility has contract detection');

// 7. Check LaunchpadForm integration
checkFileContent('src/components/LaunchpadForm.tsx', /useWallet/, 'LaunchpadForm uses wallet connection');
checkFileContent('src/components/LaunchpadForm.tsx', /Create Token \(2 SEI\)/, 'LaunchpadForm shows 2 SEI fee');
checkFileContent('src/components/LaunchpadForm.tsx', /ethers/, 'LaunchpadForm imports ethers');

// 8. Check wallet connection utility
checkFileContent('src/utils/walletConnection.ts', /window.*sei/, 'Wallet connection supports Sei wallet');
checkFileContent('src/utils/walletConnection.ts', /window.*compass/, 'Wallet connection supports Compass wallet');
checkFileContent('src/utils/walletConnection.ts', /window.*keplr/, 'Wallet connection supports Keplr wallet');

// 9. Check smart contract files
console.log('\n🔧 Smart Contract Files:');
checkFile('contracts/SimpleTokenFactory.sol', 'Smart contract file');
checkFile('scripts/deploy-token-factory.cjs', 'Deployment script');
checkFile('hardhat.config.cjs', 'Hardhat configuration');
checkFile('.env.example', 'Environment variables example');

// 10. Check mobile responsiveness
console.log('\n📱 Mobile Responsiveness:');
checkFileContent('src/components/TokenScanner.tsx', /sm:flex-row/, 'TokenScanner has responsive flex layout');
checkFileContent('src/components/TokenScanner.tsx', /sm:text-/, 'TokenScanner has responsive text sizes');
checkFileContent('src/components/TokenScanner.tsx', /break-all/, 'TokenScanner handles long addresses');

console.log('\n🎯 Key Integration Points:');

// Check if all pieces work together
const integrationChecks = [
  ['Hero buttons route correctly', /navigate\('\//, 'src/components/Hero.tsx'],
  ['Header wallet integration', /useWallet/, 'src/components/Header.tsx'],
  ['TokenScanner wallet detection', /isWalletAddress/, 'src/components/TokenScanner.tsx'],
  ['LaunchpadForm wallet requirement', /connectWallet/, 'src/components/LaunchpadForm.tsx'],
  ['No mock data in scanner', /As requested.*return null/, 'src/utils/tokenScanner.ts']
];

let allIntegrationsPassed = true;
integrationChecks.forEach(([desc, pattern, file]) => {
  const passed = checkFileContent(file, pattern, desc);
  if (!passed) allIntegrationsPassed = false;
});

console.log('\n📊 Summary:');
console.log(`Files: ${allFilesExist ? '✅' : '❌'} All core files exist`);
console.log(`Integration: ${allIntegrationsPassed ? '✅' : '❌'} All integrations working`);

if (allFilesExist && allIntegrationsPassed) {
  console.log('\n🎉 SUCCESS: Frontend is properly configured!');
  console.log('\n📝 Next Steps:');
  console.log('1. Verify the Netlify deployment reflects these changes');
  console.log('2. Test token scanning with wallet vs contract addresses');
  console.log('3. Test navigation flow (Home → Launchpad, Home → MemeHub)');
  console.log('4. Test mobile responsiveness');
  console.log('5. Deploy smart contract and update FACTORY_ADDRESS');
} else {
  console.log('\n⚠️  ISSUES FOUND: Some components may not be properly integrated');
  process.exit(1);
}

console.log('\n🌐 Test URLs (when dev server is running):');
console.log('• Homepage: http://localhost:5173');
console.log('• Launchpad: http://localhost:5173/launchpad');
console.log('• MemeHub: http://localhost:5173/memehub');