/**
 * Environment Configuration Validator
 * Validates required environment variables on startup
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from .env files
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const required = ['PORT', 'GEMINI_API_KEY'];
const optional = [
  'OPENAI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'VAPI_API_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'CORS_ORIGIN',
  'NODE_ENV',
  'API_KEY',
  'EMAIL_FROM',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

function validate() {
  const missing = [];
  const config = {};

  // Check required variables
  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    } else {
      config[key] = value.trim();
    }
  }

  // Collect optional variables
  for (const key of optional) {
    if (process.env[key]) {
      config[key] = process.env[key].trim();
    }
  }

  // Set defaults and convert types
  config.PORT = Number(config.PORT || 5000);
  config.NODE_ENV = config.NODE_ENV || 'development';
  config.CORS_ORIGIN = config.CORS_ORIGIN || '*';

  // Validate Gemini API key
  if (config.GEMINI_API_KEY && config.GEMINI_API_KEY.startsWith('AIza')) {
    console.warn('⚠️  WARNING: Using Google API key format. Ensure this is correct.');
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n💡 Please create a .env file in the backend directory with:');
    console.error('   cp .env.example backend/.env');
    console.error('   Then edit backend/.env and add your API keys.');
    process.exit(1);
  }

  // Log configuration (redacted)
  console.log('✅ Environment validated');
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   GEMINI_API_KEY: ${config.GEMINI_API_KEY.substring(0, 10)}...${config.GEMINI_API_KEY.slice(-4)}`);
  console.log(`   OPENAI_API_KEY: ${config.OPENAI_API_KEY ? 'set' : 'not set'}`);
  console.log(`   VAPI_API_KEY: ${config.VAPI_API_KEY ? 'set' : 'not set'}`);
  console.log(`   DATABASE_URL: ${config.DATABASE_URL ? 'set' : 'not set (using JSON fallback)'}`);
  console.log(`   API_KEY: ${config.API_KEY ? 'set' : 'not set (email test endpoint will be restricted)'}`);
  console.log(`   EMAIL_FROM: ${config.EMAIL_FROM || 'not set'}`);
  console.log(`   SMTP_HOST: ${config.SMTP_HOST || 'not set'}`);

  return config;
}

export const env = validate();
export default env;