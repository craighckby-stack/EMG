/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/types.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

export type EngineStatus = 'IDLE' | 'SCANNING' | 'FETCHING' | 'OPTIMIZING' | 'VERIFYING' | 'LINTING' | 'COMMITTING' | 'COOLDOWN' | 'ERROR';

export type LogType = 'info' | 'success' | 'warning' | 'error' | 'neural' | 'noop';

export interface TelemetryLog {
  id: string;
  timestamp: string;
  type: LogType;
  msg: string;
  path?: string;
  latencyMs?: number;
  tokens?: number;
}

export interface MutationRecord {
  id: string;
  timestamp: string;
  path: string;
  originalCode: string;
  optimizedCode: string;
  originalLines: number;
  optimizedLines: number;
  latencyMs: number;
  commitSha?: string;
  optimizationSummary?: string;
  status: 'applied' | 'dry-run' | 'failed' | 'noop';
  validationErrors?: string[];
  redactedCount?: number;
  typeChecked?: boolean;
}

export interface EngineMetrics {
  enhancements: number;
  validations: number;
  retries: number;
  noops: number;
  totalScannedFiles: number;
  avgLatencyMs: number;
  tokensProcessed: number;
  sanitizedSecretsCount?: number;
  syntaxErrorsPrevented?: number;
}

export type OptimizationGoal = 'performance' | 'security' | 'readability' | 'type-safety' | 'comprehensive';

export type GeminiModelId = 
  | 'gemini-3.7-flash' 
  | 'gemini-3.6-flash' 
  | 'gemini-flash-lite-latest'
  | 'gemini-2.5-flash'
  | 'gemini-3.1-pro-preview';

export type FileScopeFilter = 'all' | 'markdown-only' | 'specific';

export interface EngineConfig {
  targetRepo: string;
  ghToken: string;
  geminiKey: string;
  model: GeminiModelId;
  isSandboxMode: boolean;
  dryRun: boolean;
  goal: OptimizationGoal;
  loopIntervalSec: number;
  branch: string;
  fileScope?: FileScopeFilter;
  specificFilePath?: string;
  skippedFiles?: string[];
  autoSanitize?: boolean;
  strictTypeCheck?: boolean;
  autoApproveSaturated?: boolean;
  postmortemHash?: string;
  postmortemConstraints?: string;
}

export interface SaturationAlert {
  path: string;
  content: string;
  summary?: string;
  latencyMs?: number;
  timestamp?: string;
}

export interface SimulatedFile {
  path: string;
  content: string;
  language: string;
}
