#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Determine network: command-line argument > DFX_NETWORK env var > npm config
let network = process.argv[2] || process.env.DFX_NETWORK || process.env.npm_config_network;

if (!network) {
  console.error('Please provide a network as an argument to this script, or ensure DFX_NETWORK is set');
  console.error('Usage: node deploy.js <network> [authKey]');
  console.error('Example: node deploy.js ic');
  console.error('Example: node deploy.js local');
  process.exit(1);
}

// Get auth key from command line argument, environment variable, or .env file
let authKey = process.argv[3] || process.env.BACKEND_AUTH_KEY || '';

// If not provided, try to read from .env file in project root
if (!authKey) {
  const projectRoot = path.join(__dirname, '../../../');
  const envFile = path.join(projectRoot, '.env');
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf-8');
    // Match BACKEND_AUTH_KEY='value' or BACKEND_AUTH_KEY="value" or BACKEND_AUTH_KEY=value
    const authKeyMatch = envContent.match(/BACKEND_AUTH_KEY\s*=\s*['"]?([^'"\n]+)['"]?/);
    if (authKeyMatch && authKeyMatch[1]) {
      authKey = authKeyMatch[1].trim();
    }
  }
}

// Warn if auth key is still not set for mainnet
if (network === 'ic' && !authKey) {
  console.warn('>> WARNING: BACKEND_AUTH_KEY is not set. Set it via:');
  console.warn('>>   - Command line: node scripts/deploy.js ic "your-key"');
  console.warn('>>   - Environment: BACKEND_AUTH_KEY="your-key" node scripts/deploy.js ic');
  console.warn('>>   - .env file: Add BACKEND_AUTH_KEY=your-key to .env in project root');
}

// Log deployment mode for debugging
const deploymentMode = network === 'local' 
  ? 'LOCAL DEVELOPMENT' 
  : network === 'ic' 
    ? 'IC MAINNET' 
    : `NETWORK: ${network}`;
console.log(`>> Deployment mode: ${deploymentMode}`);

const environmentFilesDirectory = path.join(__dirname, '../src/environments');

// Determine which environment file to generate
const isProduction = network === 'ic';
const targetEnvironmentFileName = isProduction ? 'environment.prod.ts' : 'environment.ts';

// Read canister IDs from canister_ids.json
const readCanisterIds = (network) => {
  // __dirname is src/frontend/scripts, so go up 3 levels to project root
  const projectRoot = path.join(__dirname, '../../../');
  const canisterIdsJsonFile = network === 'ic'
    ? path.join(projectRoot, 'canister_ids.json')
    : path.join(projectRoot, '.dfx', network, 'canister_ids.json');

  try {
    if (!fs.existsSync(canisterIdsJsonFile)) {
      console.warn(`Warning: Canister IDs file not found: ${canisterIdsJsonFile}`);
      return {};
    }
    
    const config = JSON.parse(fs.readFileSync(canisterIdsJsonFile, 'utf-8'));
    
    const result = {};
    
    // Read backend canister ID
    if (config['backend'] && config['backend'][network]) {
      result['BACKEND_CANISTER_ID'] = config['backend'][network];
    }
    
    // Read frontend canister ID
    if (config['frontend'] && config['frontend'][network]) {
      result['FRONTEND_CANISTER_ID'] = config['frontend'][network];
    }
    
    return result;
  } catch (e) {
    console.warn(`Warning: Could not read canister IDs from ${canisterIdsJsonFile}: ${e.message}`);
    return {};
  }
};

const canisterIds = readCanisterIds(network);

// Generate environment file content
const environmentContent = `// Canister IDs and configuration${isProduction ? ' for production' : ''}
export const environment = {
  production: ${isProduction},
  backendCanisterId: '${canisterIds['BACKEND_CANISTER_ID'] || ''}',
  backendAuthKey: '${authKey}'
};
`;

// Write environment file
const targetPath = path.join(environmentFilesDirectory, targetEnvironmentFileName);
fs.writeFileSync(targetPath, environmentContent);

// Verify the file was written correctly
const writtenContent = fs.readFileSync(targetPath, 'utf-8');
const productionMatch = writtenContent.match(/production:\s*(true|false)/);
const canisterIdMatch = writtenContent.match(/backendCanisterId:\s*'([^']+)'/);

console.log(`>> Generated ${targetEnvironmentFileName}`);
console.log(`>> Backend Canister ID: ${canisterIds['BACKEND_CANISTER_ID'] || 'NOT FOUND'}`);
console.log(`>> Frontend Canister ID: ${canisterIds['FRONTEND_CANISTER_ID'] || 'NOT FOUND'}`);
console.log(`>> Network: ${network}`);
console.log(`>> Production flag: ${productionMatch ? productionMatch[1] : 'NOT FOUND'}`);
console.log(`>> Written Canister ID: ${canisterIdMatch ? canisterIdMatch[1] : 'NOT FOUND'}`);
if (authKey) {
  console.log(`>> Auth Key: ${authKey.substring(0, 4)}...${authKey.substring(authKey.length - 4)}`);
} else {
  console.log(`>> Auth Key: NOT SET (will be empty in environment file)`);
}

// Verify production flag is correct for mainnet
if (isProduction && productionMatch && productionMatch[1] !== 'true') {
  console.error(`>> ERROR: Production flag should be 'true' for mainnet deployment!`);
  process.exit(1);
}

process.exit(0);
