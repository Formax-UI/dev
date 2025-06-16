#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Formax UI Documentation...');

try {
  // Check if docs directory exists
  if (!fs.existsSync('./docs')) {
    console.error('❌ docs directory not found!');
    process.exit(1);
  }

  // Navigate to docs directory and install dependencies
  console.log('📦 Installing documentation dependencies...');
  execSync('cd docs && npm install', { stdio: 'inherit' });

  // Build the documentation
  console.log('🔨 Building documentation site...');
  execSync('cd docs && npm run build', { stdio: 'inherit' });

  // Copy the output to root for Vercel
  console.log('📁 Copying build output...');
  if (fs.existsSync('./public')) {
    execSync('rm -rf ./public', { stdio: 'inherit' });
  }
  
  execSync('cp -r ./docs/out ./public', { stdio: 'inherit' });

  console.log('✅ Documentation build completed!');
  console.log('📄 Static files are ready in ./public directory');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 