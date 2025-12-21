#!/usr/bin/env node

/**
 * Build Guard: Pre-build Environment Validation
 *
 * This script validates that all required VITE_ environment variables
 * are present before allowing the build to proceed.
 *
 * Usage:
 *   node scripts/validate-env.js staging
 *   node scripts/validate-env.js production
 */

const fs = require('fs');
const path = require('path');

// Get the mode from command line argument
const mode = process.argv[2];

if (!mode) {
  console.error('❌ ERROR: Mode argument is required (staging or production)');
  console.error('Usage: node scripts/validate-env.js <staging|production>');
  process.exit(1);
}

if (mode !== 'staging' && mode !== 'production') {
  console.error(`❌ ERROR: Invalid mode "${mode}". Must be "staging" or "production"`);
  process.exit(1);
}

// Determine which .env file to check
const envFile = mode === 'production' ? '.env.production' : '.env.staging';
const envPath = path.join(__dirname, '..', envFile);

console.log('🔍 BUILD GUARD: Validating environment configuration...');
console.log(`📋 Mode: ${mode}`);
console.log(`📄 File: ${envFile}`);

// Check if the env file exists
if (!fs.existsSync(envPath)) {
  console.error(`❌ FATAL: Environment file ${envFile} not found!`);
  console.error(`Expected path: ${envPath}`);
  process.exit(1);
}

// Read and parse the env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      // Remove quotes from value if present
      let value = valueParts.join('=').trim();
      value = value.replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  }
});

// Required environment variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

// Validate each required variable
const missing = [];
const invalid = [];

requiredVars.forEach(varName => {
  if (!envVars[varName]) {
    missing.push(varName);
  } else if (envVars[varName].length < 5) {
    invalid.push(varName);
  }
});

// Expected project IDs for validation
const expectedProjectId = mode === 'production' ? 'dans-dichter-db' : 'ddd-spark';
const actualProjectId = envVars['VITE_FIREBASE_PROJECT_ID'];

// Report results
console.log('');
console.log('✓ Environment file exists');
console.log(`✓ Found ${Object.keys(envVars).length} environment variables`);

if (missing.length > 0) {
  console.error('');
  console.error('❌ FATAL: Missing required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}

if (invalid.length > 0) {
  console.error('');
  console.error('❌ FATAL: Invalid (too short) environment variables:');
  invalid.forEach(v => console.error(`   - ${v}: "${envVars[v]}"`));
  process.exit(1);
}

// Validate project ID matches expected environment
if (actualProjectId !== expectedProjectId) {
  console.error('');
  console.error('❌ FATAL: Project ID mismatch!');
  console.error(`   Expected for ${mode}: ${expectedProjectId}`);
  console.error(`   Found in ${envFile}: ${actualProjectId}`);
  console.error('');
  console.error('This prevents accidental cross-environment deployment.');
  process.exit(1);
}

// All checks passed
console.log(`✓ All ${requiredVars.length} required variables present`);
console.log(`✓ Project ID verified: ${actualProjectId}`);
console.log('');
console.log('✅ BUILD GUARD: Environment validation passed');
console.log(`🚀 Proceeding with ${mode} build...`);
console.log('');

process.exit(0);
