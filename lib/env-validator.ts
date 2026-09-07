/**
 * ENVIRONMENT VALIDATOR
 * Role: Validates the presence and integrity of required environment variables.
 * Integration: Used by diagnostic-engine to ensure system readiness.
 */

export interface EnvConfig {
  GEMINI_API_KEY: string;
  APP_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ['GEMINI_API_KEY', 'APP_URL'];
  const missing = required.filter(key => !process.env[key]);
  return {
    valid: missing.length === 0,
    missing
  };
}
