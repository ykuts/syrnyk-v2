import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Script to generate internal API tokens
 * Run with: node scripts/generateInternalTokens.js
 */

console.log('🔐 Generating Internal API Tokens for Service Communication\n');

// Method 1: Simple API Token
const simpleApiToken = crypto.randomBytes(32).toString('hex');
console.log('📋 Simple API Token (X-Internal-API-Token header):');
console.log(`INTERNAL_API_TOKEN=${simpleApiToken}`);
console.log('');

// Method 2: JWT Bearer Token (more secure, with expiration)
const jwtSecret = process.env.JWT_SECRET || 'mysupersecretkey12345';
const bearerToken = jwt.sign(
  {
    service: 'crm_integration',
    type: 'internal_service',
    permissions: ['internal_operations', 'order_management', 'sync_operations'],
    iss: 'ecommerce_api',
    aud: 'internal_services'
  },
  jwtSecret,
  { 
    expiresIn: '10y' // Long expiration for service-to-service
  }
);

console.log('🎫 JWT Bearer Token (Authorization: Bearer header):');
console.log(`INTERNAL_BEARER_TOKEN=${bearerToken}`);
console.log('');

// Method 3: Both tokens for flexibility
console.log('📝 Environment Variables to add to both services:');
console.log('');
console.log('# For ecommerce-api/.env:');
console.log(`INTERNAL_API_TOKEN=${simpleApiToken}`);
console.log(`INTERNAL_BEARER_TOKEN=${bearerToken}`);
console.log('');
console.log('# For crm-integration-service/.env:');
console.log(`ECOMMERCE_API_TOKEN=${simpleApiToken}`);
console.log(`ECOMMERCE_BEARER_TOKEN=${bearerToken}`);
console.log('');

console.log('💡 Usage examples:');
console.log('');
console.log('# Method 1 - API Token Header:');
console.log('curl -H "X-Internal-API-Token: ' + simpleApiToken + '" http://localhost:5000/api/orders/1/sync');
console.log('');
console.log('# Method 2 - Bearer Token:');
console.log('curl -H "Authorization: Bearer ' + bearerToken + '" http://localhost:5000/api/orders/1/sync');

// Step 4: Updated environment variables
console.log('\n🔧 Updated Environment Variables:\n');
console.log('=== ECOMMERCE API (.env) ===');
console.log('NODE_ENV=development');
console.log('PORT=5000');  // Your current port might be different
console.log('DATABASE_URL="postgresql://postgres:12345678@localhost:5432/syrnyk"');
console.log('JWT_SECRET=mysupersecretkey12345');
console.log('# ... your existing vars ...');
console.log('');
console.log('# Internal API Authentication');
console.log(`INTERNAL_API_TOKEN=${simpleApiToken}`);
console.log(`INTERNAL_BEARER_TOKEN=${bearerToken}`);
console.log('');

console.log('=== CRM INTEGRATION SERVICE (.env) ===');
console.log('PORT=3005');
console.log('NODE_ENV=development');
console.log('# ... your existing vars ...');
console.log('');
console.log('# Ecommerce API Integration');
console.log('ECOMMERCE_API_URL=http://localhost:5000');  // Update this to your actual ecommerce API URL
console.log(`ECOMMERCE_API_TOKEN=${simpleApiToken}`);
console.log(`ECOMMERCE_BEARER_TOKEN=${bearerToken}`);
console.log('');