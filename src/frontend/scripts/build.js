#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Determine network: DFX_NETWORK env var or default to 'local'
const network = process.env.DFX_NETWORK || 'local';

// Generate environment file from .env
// Note: This script runs from src/frontend/ directory (via npm run build)
const frontendDir = path.join(__dirname, '..');
console.log(`>> Generating environment file for network: ${network}`);
execSync(`node scripts/deploy.js ${network}`, { stdio: 'inherit', cwd: frontendDir });

// Determine build configuration
const config = network === 'ic' ? 'production' : 'development';

// Build Angular app
console.log(`>> Building with configuration: ${config}`);
execSync(
  `ng build --output-path=../../dist/frontend --base-href=/ --configuration=${config}`,
  { stdio: 'inherit', cwd: frontendDir }
);
