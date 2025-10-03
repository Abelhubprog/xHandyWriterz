#!/usr/bin/env node

/**
 * Generate cryptographically secure secrets for Strapi Railway deployment
 * Run: node generate-railway-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateHexSecret(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

function generateAppKeys(count = 4) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateSecret(16));
  }
  return keys.join(',');
}

console.log('═══════════════════════════════════════════════════════════');
console.log('🔐 STRAPI RAILWAY SECRETS');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('Copy these values to Railway → aHandyWriterz → Variables');
console.log('Replace the <generate-random-*> placeholders with these values:');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

const secrets = {
  'APP_KEYS': generateAppKeys(4),
  'ADMIN_JWT_SECRET': generateSecret(32),
  'API_TOKEN_SALT': generateSecret(16),
  'JWT_SECRET': generateSecret(32),
  'TRANSFER_TOKEN_SALT': generateSecret(16),
};

for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=`);
  console.log(value);
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('📋 RAILWAY CLI COMMANDS (Copy and paste these):');
console.log('');
console.log('cd D:\\HandyWriterzNEW\\apps\\strapi');
console.log('railway service aHandyWriterz');
console.log('');

for (const [key, value] of Object.entries(secrets)) {
  // Escape any special characters for PowerShell
  const escapedValue = value.replace(/"/g, '`"');
  console.log(`railway variables --set ${key}="${escapedValue}"`);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('✅ After setting these variables:');
console.log('1. Railway will auto-redeploy (wait 2 minutes)');
console.log('2. Reset password again with railway ssh command');
console.log('3. Login should work!');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
