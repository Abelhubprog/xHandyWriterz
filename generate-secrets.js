#!/usr/bin/env node

/**
 * Generate Strapi production secrets for Railway deployment
 * Run: node generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateKeys(count = 4) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateSecret(16));
  }
  return keys.join(',');
}

console.log('\n🔐 Generated Secrets for Railway Strapi Deployment\n');
console.log('Copy these to Railway Variables:\n');
console.log('─'.repeat(80));

console.log('\nAPP_KEYS=');
console.log(generateKeys(4));

console.log('\n\nAPI_TOKEN_SALT=');
console.log(generateSecret(16));

console.log('\n\nADMIN_JWT_SECRET=');
console.log(generateSecret(24));

console.log('\n\nTRANSFER_TOKEN_SALT=');
console.log(generateSecret(16));

console.log('\n\nJWT_SECRET=');
console.log(generateSecret(24));

console.log('\n' + '─'.repeat(80));
console.log('\n✅ Copy each value above into Railway environment variables\n');
