#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read .env file from project root
const projectRoot = path.join(__dirname, '../../../');
const envFile = path.join(projectRoot, '.env');

let backendAuthKey = '';

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  // Match BACKEND_AUTH_KEY='value' or BACKEND_AUTH_KEY="value" or BACKEND_AUTH_KEY=value
  const authKeyMatch = envContent.match(/BACKEND_AUTH_KEY\s*=\s*['"]?([^'"\n]+)['"]?/);
  if (authKeyMatch && authKeyMatch[1]) {
    backendAuthKey = authKeyMatch[1].trim();
  }
}

if (!backendAuthKey) {
  console.warn('>> WARNING: BACKEND_AUTH_KEY not found in .env file');
  console.warn('>> Please add BACKEND_AUTH_KEY=your-key to .env file');
}

// Read canister IDs from canister_ids.json
const readCanisterIds = (network) => {
  const canisterIdsJsonFile = network === 'ic'
    ? path.join(projectRoot, 'canister_ids.json')
    : path.join(projectRoot, '.dfx', network, 'canister_ids.json');

  try {
    if (!fs.existsSync(canisterIdsJsonFile)) {
      return {};
    }
    
    const config = JSON.parse(fs.readFileSync(canisterIdsJsonFile, 'utf-8'));
    const result = {};
    
    if (config['backend'] && config['backend'][network]) {
      result['BACKEND_CANISTER_ID'] = config['backend'][network];
    }
    
    return result;
  } catch (e) {
    return {};
  }
};

// Read canister IDs for both local and production
const localCanisterIds = readCanisterIds('local');
const prodCanisterIds = readCanisterIds('ic');

const environmentFilesDirectory = path.join(__dirname, '../src/environments');

// Generate development environment
const devContent = `// Canister IDs and configuration
export const environment = {
  production: false,
  backendCanisterId: '${localCanisterIds['BACKEND_CANISTER_ID'] || 'uxrrr-q7777-77774-qaaaq-cai'}',
  backendAuthKey: '${backendAuthKey}'
};
`;

// Generate production environment
const prodContent = `// Canister IDs and configuration for production
export const environment = {
  production: true,
  backendCanisterId: '${prodCanisterIds['BACKEND_CANISTER_ID'] || 'nn3mi-waaaa-aaaam-afw7q-cai'}',
  backendAuthKey: '${backendAuthKey}'
};
`;

// Write environment files
fs.writeFileSync(path.join(environmentFilesDirectory, 'environment.ts'), devContent);
fs.writeFileSync(path.join(environmentFilesDirectory, 'environment.prod.ts'), prodContent);

console.log('>> Generated environment files from .env');
if (backendAuthKey) {
  console.log(`>> Auth Key: ${backendAuthKey.substring(0, 4)}...${backendAuthKey.substring(backendAuthKey.length - 4)}`);
}
