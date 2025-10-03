#!/usr/bin/env node

const crypto = require('node:crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateHexSecret(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

function generateAppKeys(count = 4) {
  return Array.from({ length: count }, () => generateSecret(16)).join(',');
}

const secrets = {
  APP_KEYS: generateAppKeys(4),
  ADMIN_JWT_SECRET: generateSecret(32),
  API_TOKEN_SALT: generateSecret(32),
  TRANSFER_TOKEN_SALT: generateSecret(32),
  JWT_SECRET: generateSecret(32),
  ENCRYPTION_KEY: generateSecret(32),
};

console.log('=== Strapi Railway Secrets ===');
console.log('Add these values to the Railway variables dashboard for the Strapi service.');
console.log('');

for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=`);
  console.log(value);
  console.log('');
}

console.log('=== Railway CLI Snippet ===');
console.log('Use the following commands after running `railway link` inside apps/strapi:`');
console.log('');
for (const [key, value] of Object.entries(secrets)) {
  const escaped = value.replace(/"/g, '\\"');
  console.log(`railway variables set ${key} "${escaped}"`);
}

console.log('');
console.log('Remember to set:');
console.log('  ENABLE_PROXY=true');
console.log('  ADMIN_SESSION_COOKIE_SECURE=true');
console.log('  ADMIN_SESSION_COOKIE_SAMESITE=none');
console.log('  DATABASE_CLIENT=postgres (Railway adds DATABASE_URL automatically)');

