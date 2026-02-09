#!/usr/bin/env node

/**
 * Verification script to check TrialGuard frontend setup
 * Run with: node verify-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FILES = [
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'index.html',
  'src/main.jsx',
  'src/App.jsx',
  'src/index.css',
  // Utils
  'src/utils/api.js',
  'src/utils/formatting.js',
  'src/utils/constants.js',
  // Hooks
  'src/hooks/useAnalysis.js',
  'src/hooks/useProtocolForm.js',
  'src/hooks/useChat.js',
  // Common components
  'src/components/common/Button.jsx',
  'src/components/common/Card.jsx',
  'src/components/common/LoadingState.jsx',
  'src/components/common/Toast.jsx',
  // Protocol components
  'src/components/protocol/ProtocolForm.jsx',
  'src/components/protocol/PDFUploader.jsx',
  'src/components/protocol/FieldGroup.jsx',
  // Analysis components
  'src/components/analysis/RiskScoreHero.jsx',
  'src/components/analysis/RiskBreakdownCards.jsx',
  'src/components/analysis/FindingsTimeline.jsx',
  'src/components/analysis/HistoricalComparison.jsx',
  'src/components/analysis/RecommendationsPanel.jsx',
  'src/components/analysis/ComparisonChart.jsx',
  // Chat components
  'src/components/chat/ChatInterface.jsx',
  'src/components/chat/MessageBubble.jsx',
  // Pages
  'src/pages/Home.jsx',
  'src/pages/ProtocolInput.jsx',
  'src/pages/AnalysisResults.jsx',
  'src/pages/HistoricalDatabase.jsx',
];

const REQUIRED_DIRS = [
  'src',
  'src/components',
  'src/components/common',
  'src/components/protocol',
  'src/components/analysis',
  'src/components/chat',
  'src/hooks',
  'src/pages',
  'src/utils',
];

console.log('🔍 TrialGuard Frontend Setup Verification\n');
console.log('='.repeat(50));

let allValid = true;

// Check directories
console.log('\n📁 Checking directories...\n');
let dirCount = 0;
REQUIRED_DIRS.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`${exists ? '✓' : '✗'} ${dir}`);
  if (!exists) allValid = false;
  else dirCount++;
});
console.log(`\nFound ${dirCount}/${REQUIRED_DIRS.length} directories`);

// Check files
console.log('\n📄 Checking files...\n');
let fileCount = 0;
REQUIRED_FILES.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allValid = false;
  else fileCount++;
});
console.log(`\nFound ${fileCount}/${REQUIRED_FILES.length} files`);

// Check package.json dependencies
console.log('\n📦 Checking package.json...\n');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'axios',
    'framer-motion',
    'recharts',
    'lucide-react',
  ];

  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

  if (missingDeps.length === 0) {
    console.log('✓ All required dependencies listed');
  } else {
    console.log('✗ Missing dependencies:', missingDeps.join(', '));
    allValid = false;
  }
} catch (error) {
  console.log('✗ Could not read package.json');
  allValid = false;
}

// Check .env
console.log('\n🔐 Checking environment configuration...\n');
const envExists = fs.existsSync(path.join(__dirname, '.env'));
const envExampleExists = fs.existsSync(path.join(__dirname, '.env.example'));

if (envExampleExists) {
  console.log('✓ .env.example found');
} else {
  console.log('✗ .env.example not found');
  allValid = false;
}

if (envExists) {
  console.log('✓ .env file exists');
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    if (envContent.includes('VITE_API_URL')) {
      console.log('✓ VITE_API_URL configured');
    } else {
      console.log('⚠ VITE_API_URL not found in .env');
    }
  } catch (error) {
    console.log('⚠ Could not read .env file');
  }
} else {
  console.log('⚠ .env file not found (copy from .env.example)');
}

// Check node_modules
console.log('\n📚 Checking installation status...\n');
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
if (nodeModulesExists) {
  console.log('✓ node_modules folder exists');
  console.log('  Dependencies appear to be installed');
} else {
  console.log('⚠ node_modules not found');
  console.log('  Run: npm install');
}

// Final report
console.log('\n' + '='.repeat(50));
if (allValid && nodeModulesExists) {
  console.log('\n✅ Setup verification PASSED!\n');
  console.log('Your TrialGuard frontend is ready to run.');
  console.log('\nNext steps:');
  console.log('  1. Ensure .env is configured');
  console.log('  2. Start development server: npm run dev');
  console.log('  3. Open http://localhost:3000\n');
} else if (allValid && !nodeModulesExists) {
  console.log('\n⚠️  Setup verification INCOMPLETE\n');
  console.log('All files are present but dependencies need to be installed.');
  console.log('\nNext steps:');
  console.log('  1. Run: npm install');
  console.log('  2. Configure .env file');
  console.log('  3. Start development server: npm run dev\n');
} else {
  console.log('\n❌ Setup verification FAILED\n');
  console.log('Some required files or directories are missing.');
  console.log('Please check the errors above.\n');
}

console.log('For detailed setup instructions, see QUICKSTART.md\n');

process.exit(allValid ? 0 : 1);
