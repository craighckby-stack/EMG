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
  const missing = REQUIRED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === '';
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}