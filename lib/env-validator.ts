/**
 * ENVIRONMENT VALIDATOR
 * Role: Validates the presence and integrity of required environment variables.
 * Integration: Used by diagnostic-engine to ensure system readiness.
 */

export interface EnvConfig {
  readonly GEMINI_API_KEY: string;
  readonly APP_URL: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

export interface EnvValidationResult {
  readonly valid: boolean;
  readonly missing: readonly string[];
}

const REQUIRED_ENV_VARS = ['GEMINI_API_KEY', 'APP_URL'] as const;

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  
  for (let i = 0; i < REQUIRED_ENV_VARS.length; i++) {
    const key = REQUIRED_ENV_VARS[i];
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}