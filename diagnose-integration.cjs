const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE FRONTEND INTEGRATION DIAGNOSIS\n');

// Check 1: Source file contents
console.log('1. CHECKING SOURCE FILE CONTENTS:');
console.log('================================');

const checkFile = (filePath, checks) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`\n📁 ${filePath}:`);
    
    checks.forEach(check => {
      const found = content.includes(check.search);
      console.log(`   ${found ? '✅' : '❌'} ${check.description}: ${found ? 'FOUND' : 'NOT FOUND'}`);
      if (found && check.extract) {
        const lines = content.split('\n');
        const matchingLines = lines.filter(line => line.includes(check.search));
        matchingLines.slice(0, 2).forEach(line => {
          console.log(`      → ${line.trim()}`);
        });
      }
    });
  } catch (error) {
    console.log(`   ❌ Error reading ${filePath}: ${error.message}`);
  }
};

// Check Header component
checkFile('src/components/Header.tsx', [
  { search: 'useWallet', description: 'useWallet import', extract: true },
  { search: 'seifu.fun', description: 'Updated navigation text', extract: true },
  { search: 'connectWallet', description: 'Connect wallet function', extract: true }
]);

// Check LaunchpadForm component
checkFile('src/components/LaunchpadForm.tsx', [
  { search: '0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F', description: 'Factory contract address', extract: true },
  { search: 'useWallet', description: 'useWallet import', extract: true },
  { search: 'Create Token (2 SEI)', description: 'Updated button text', extract: true }
]);

// Check wallet connection utility
checkFile('src/utils/walletConnection.ts', [
  { search: 'window.sei', description: 'Sei wallet integration', extract: false },
  { search: 'window.compass', description: 'Compass wallet integration', extract: false },
  { search: 'sei_requestAccounts', description: 'Sei wallet methods', extract: false }
]);

// Check MemeHub page
checkFile('src/pages/MemeHub.tsx', [
  { search: 'seifu<span className="text-[#FF6B35]">.fun</span>', description: 'Updated page title', extract: true }
]);

// Check App routing
checkFile('src/App.tsx', [
  { search: 'import MemeHub', description: 'MemeHub import', extract: true },
  { search: '/memehub', description: 'MemeHub route', extract: true }
]);

console.log('\n\n2. CHECKING BUILD OUTPUT:');
console.log('=========================');

// Check if build files exist
const buildFiles = [
  'dist/index.html',
  'dist/assets/index-Bqz706O8.js',
  'dist/assets/index-DmqALe35.css'
];

buildFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Check build content
if (fs.existsSync('dist/assets/index-Bqz706O8.js')) {
  const buildContent = fs.readFileSync('dist/assets/index-Bqz706O8.js', 'utf8');
  
  console.log('\n📦 Build Content Analysis:');
  
  const buildChecks = [
    { search: 'seifu.fun', description: 'seifu.fun references' },
    { search: '0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F', description: 'Factory contract address' },
    { search: 'MemeHub', description: 'MemeHub references (should be minimal)' },
    { search: 'useWallet', description: 'useWallet hook' },
    { search: 'connectWallet', description: 'connectWallet function' },
    { search: 'sei_requestAccounts', description: 'Sei wallet methods' }
  ];
  
  buildChecks.forEach(check => {
    const matches = (buildContent.match(new RegExp(check.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    console.log(`   ${matches > 0 ? '✅' : '❌'} ${check.description}: ${matches} occurrences`);
  });
}

console.log('\n\n3. PACKAGE.JSON DEPENDENCIES:');
console.log('=============================');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const importantDeps = ['react', 'react-dom', 'react-router-dom', 'ethers', 'vite'];
  
  importantDeps.forEach(dep => {
    const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    console.log(`   ${version ? '✅' : '❌'} ${dep}: ${version || 'NOT FOUND'}`);
  });
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
}

console.log('\n\n4. ENVIRONMENT & BUILD SETUP:');
console.log('=============================');

// Check for common build issues
const envChecks = [
  { file: '.env', description: 'Environment file' },
  { file: 'vite.config.ts', description: 'Vite config' },
  { file: 'tsconfig.json', description: 'TypeScript config' },
  { file: 'node_modules', description: 'Node modules' }
];

envChecks.forEach(check => {
  const exists = fs.existsSync(check.file);
  console.log(`   ${exists ? '✅' : '❌'} ${check.description}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

console.log('\n\n🎯 DIAGNOSIS SUMMARY:');
console.log('====================');
console.log('If you see ❌ for any critical items above, those need to be fixed.');
console.log('If source files show ✅ but build shows ❌, there\'s a build cache issue.');
console.log('Run: rm -rf node_modules/.vite && rm -rf dist && npm run build');