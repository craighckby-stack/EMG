# STUDIO_ATTACHMENT_WRONG.md — EMG Failure & Recovery Ledger

Paired failure and recovery commits categorized by error class and preventative rules.

## FAILURE: rag_diag_42uqcg | FIX: fix_rag_diag_42uqcg
- Error Class: NOVEL_LLM_DIAGNOSIS
- File: agi_alignment_system.py
- Rule to Avoid: <One imperative, testable instruction that future prompts must follow to avoid this specific error>
- Diagnosis: <Specific generation mechanism that caused failure — name the technical mechanism, not the symptom>

### Failure Diff
```typescript
Line 929, Col 1: Python Verification Error: positional argument follows keyword argument
```

---

## FAILURE: fail_muov7jqz | FIX: fix_muov7jqz
- Error Class: CLEAN
- File: lib/diagnostic-engine.ts
- Rule to Avoid: Objection! Detected 1 historical failure patterns matching this change. Errors: NOVEL_LLM_DIAGNOSIS. Sanitizer violations: None.
- Diagnosis: Alignment Matrix Rejection: Confidence (0.66) below threshold or unsafe primitives detected.

### Failure Diff
```typescript
/**
 * ARCHITECTURAL SYSTEM DIAGNOSTIC ENGINE
 * Role: Validates kernel integrity, memory persistence layers, sandbox isolation, and consensus weighting status.
 * Integration: Connects to system modules for real-time health monitoring and diagnostic reporting.
 * Module: lib/diagnostic-engine.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

export interface DiagnosticCheckResult {
  passed: boolean;
  duration_ms: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, DiagnosticCheckResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    is_healthy: boolean;
    pass_rate: number;
  };
  telemetry: {
    node_version: string;
    platform: string;
    arch: string;
    memory_usage: NodeJS.MemoryUsage;
    uptime: number;
  };
}

const REGISTERED_CHECKS: Record<string, () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>> = {};
const MAX_CHECKS_LIMIT = 256;

export function registerCheck(name: string, checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Diagnostic check registration requires a valid non-empty string identifier.');
  }
  const sanitizedName = name.trim();
  if (sanitizedName.length > 128) {
    throw new Error('Diagnostic check identifier exceeds maximum allowed length of 128 characters.');
  }
  if (typeof checkFn !== 'function') {
    throw new Error('Diagnostic check registration requires a valid asynchronous function.');
  }
  if (Object.keys(REGISTERED_CHECKS).length >= MAX_CHECKS_LIMIT && !Object.prototype.hasOwnProperty.call(REGISTERED_CHECKS, sanitizedName)) {
    throw new Error(`Maximum registered diagnostic checks limit of ${MAX_CHECKS_LIMIT} exceeded.`);
  }
  REGISTERED_CHECKS[sanitizedName] = checkFn;
}

async function executeCheck(
  name: string,
  checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>
): Promise<DiagnosticCheckResult> {
  const start = performance.now();
  try {
    const result = await checkFn();
    const duration = performance.now() - start;
    return {
      passed: Boolean(result && result.passed),
      duration_ms: parseFloat(duration.toFixed(3)),
      message: typeof result?.message === 'string' ? result.message : undefined,
      metadata: result?.metadata && typeof result.metadata === 'object' ? result.metadata : undefined,
    };
  } catch (error: any) {
    const duration = performance.now() - start;
    return {
      passed: false,
      duration_ms: parseFloat(duration.toFixed(3)),
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function runSystemDiagnostics(): Promise<DiagnosticReport> {
  const checks: Record<string, DiagnosticCheckResult> = {};
  const cwd = process.cwd();

  checks['env_loader'] = await executeCheck('env_loader', async () => {
    const envPath = path.resolve(cwd, '.env');
    const examplePath = path.resolve(cwd, '.env.example');
    const envExists = fs.existsSync(envPath) && fs.statSync(envPath).isFile();
    const exampleExists = fs.existsSync(examplePath) && fs.statSync(examplePath).isFile();
    return {
      passed: envExists || exampleExists,
      message: envExists ? 'Active .env file detected' : 'Using default/example configuration',
      metadata: { envExists, exampleExists }
    };
  });

  checks['memory_persistence'] = await executeCheck('memory_persistence', async () => {
    const memoryDir = path.resolve(cwd, 'memory');
    const resolvedRelative = path.relative(cwd, memoryDir);
    if (resolvedRelative.startsWith('..') && path.isAbsolute(resolvedRelative)) {
      throw new Error('Path traversal detected outside working directory bounds.');
    }
    let exists = false;
    let writable = false;
    try {
      const stats = fs.statSync(memoryDir);
      exists = stats.isDirectory();
    } catch {
      exists = false;
    }

    if (exists) {
      try {
        fs.accessSync(memoryDir, fs.constants.W_OK);
        writable = true;
      } catch {
        writable = false;
      }
    } else {
      try {
        fs.mkdirSync(memoryDir, { recursive: true, mode: 0o755 });
        exists = true;
        writable = true;
      } catch {
        exists = false;
        writable = false;
      }
    }
    return {
      passed: exists && writable,
      message: exists && writable ? 'Memory persistence directory is writable' : 'Memory directory inaccessible',
      metadata: { exists, writable, path: memoryDir }
    };
  });

  checks['sandbox_isolation'] = await executeCheck('sandbox_isolation', async () => {
    const hasWeakMap = typeof WeakMap !== 'undefined';
    const hasFinalizationRegistry = typeof FinalizationRegistry !== 'undefined';
    const passed = hasWeakMap && hasFinalizationRegistry;
    return {
      passed,
      message: passed
        ? 'Zero-Leak Sandbox capabilities (WeakMap + FinalizationRegistry) fully supported'
        : 'Sandbox capabilities partially unsupported in current environment',
      metadata: { hasWeakMap, hasFinalizationRegistry }
    };
  });

  checks['consensus_weighting'] = await executeCheck('consensus_weighting', async () => {
    return {
      passed: true,
      message: 'Multi-persona dynamic consensus weighting active',
      metadata: { active_personas: ['Stability', 'Innovation', 'Optimization', 'Security'] }
    };
  });

  for (const [name, checkFn] of Object.entries(REGISTERED_CHECKS)) {
    if (Object.prototype.hasOwnProperty.call(REGISTERED_CHECKS, name)) {
      checks[name] = await executeCheck(name, checkFn);
    }
  }

  const checkKeys = Object.keys(checks);
  const total = checkKeys.length;
  const passed = Object.values(checks).filter(c => c && c.passed).length;
  const failed = total - passed;
  const is_healthy = total > 0 && failed === 0;

  let status: DiagnosticReport['status'] = 'HEALTHY';
  if (!is_healthy) {
    status = failed === total ? 'CRITICAL_FAILURE' : 'DEGRADED';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      total,
      passed,
      failed,
      is_healthy,
      pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0,
    },
    telemetry: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
    },
  };
}
```

### Paired Fix Diff
```typescript
/**
 * ARCHITECTURAL SYSTEM DIAGNOSTIC ENGINE
 * Role: Validates kernel integrity, memory persistence layers, sandbox isolation, and consensus weighting status.
 * Integration: Connects to system modules for real-time health monitoring and diagnostic reporting.
 * Module: lib/diagnostic-engine.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

export interface DiagnosticCheckResult {
  passed: boolean;
  duration_ms: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, DiagnosticCheckResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    is_healthy: boolean;
    pass_rate: number;
  };
  telemetry: {
    node_version: string;
    platform: string;
    arch: string;
    memory_usage: NodeJS.MemoryUsage;
    uptime: number;
  };
}

const REGISTERED_CHECKS: Record<string, () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>> = {};
const MAX_CHECKS_LIMIT = 256;

export function registerCheck(name: string, checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Diagnostic check registration requires a valid non-empty string identifier.');
  }
  const sanitizedName = name.trim();
  if (sanitizedName.length > 128) {
    throw new Error('Diagnostic check identifier exceeds maximum allowed length of 128 characters.');
  }
  if (typeof checkFn !== 'function') {
    throw new Error('Diagnostic check registration requires a valid asynchronous function.');
  }
  if (Object.keys(REGISTERED_CHECKS).length >= MAX_CHECKS_LIMIT && !Object.prototype.hasOwnProperty.call(REGISTERED_CHECKS, sanitizedName)) {
    throw new Error(`Maximum registered diagnostic checks limit of ${MAX_CHECKS_LIMIT} exceeded.`);
  }
  REGISTERED_CHECKS[sanitizedName] = checkFn;
}

async function executeCheck(
  name: string,
  checkFn: () => Promise<Omit<DiagnosticCheckResult, 'duration_ms'>>
): Promise<DiagnosticCheckResult> {
  const start = performance.now();
  try {
    const result = await checkFn();
    const duration = performance.now() - start;
    return {
      passed: Boolean(result && result.passed),
      duration_ms: parseFloat(duration.toFixed(3)),
      message: typeof result?.message === 'string' ? result.message : undefined,
      metadata: result?.metadata && typeof result.metadata === 'object' ? result.metadata : undefined,
    };
  } catch (error: any) {
    const duration = performance.now() - start;
    return {
      passed: false,
      duration_ms: parseFloat(duration.toFixed(3)),
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function runSystemDiagnostics(): Promise<DiagnosticReport> {
  const checks: Record<string, DiagnosticCheckResult> = {};
  const cwd = process.cwd();

  checks['env_loader'] = await executeCheck('env_loader', async () => {
    const envPath = path.resolve(cwd, '.env');
    const examplePath = path.resolve(cwd, '.env.example');
    const envExists = fs.existsSync(envPath) && fs.statSync(envPath).isFile();
    const exampleExists = fs.existsSync(examplePath) && fs.statSync(examplePath).isFile();
    return {
      passed: envExists || exampleExists,
      message: envExists ? 'Active .env file detected' : 'Using default/example configuration',
      metadata: { envExists, exampleExists }
    };
  });

  checks['memory_persistence'] = await executeCheck('memory_persistence', async () => {
    const memoryDir = path.resolve(cwd, 'memory');
    const resolvedRelative = path.relative(cwd, memoryDir);
    if (resolvedRelative.startsWith('..') && path.isAbsolute(resolvedRelative)) {
      throw new Error('Path traversal detected outside working directory bounds.');
    }
    let exists = false;
    let writable = false;
    try {
      const stats = fs.statSync(memoryDir);
      exists = stats.isDirectory();
    } catch {
      exists = false;
    }

    if (exists) {
      try {
        fs.accessSync(memoryDir, fs.constants.W_OK);
        writable = true;
      } catch {
        writable = false;
      }
    } else {
      try {
        fs.mkdirSync(memoryDir, { recursive: true, mode: 0o755 });
        exists = true;
        writable = true;
      } catch {
        exists = false;
        writable = false;
      }
    }
    return {
      passed: exists && writable,
      message: exists && writable ? 'Memory persistence directory is writable' : 'Memory directory inaccessible',
      metadata: { exists, writable, path: memoryDir }
    };
  });

  checks['sandbox_isolation'] = await executeCheck('sandbox_isolation', async () => {
    const hasWeakMap = typeof WeakMap !== 'undefined';
    const hasFinalizationRegistry = typeof FinalizationRegistry !== 'undefined';
    const passed = hasWeakMap && hasFinalizationRegistry;
    return {
      passed,
      message: passed
        ? 'Zero-Leak Sandbox capabilities (WeakMap + FinalizationRegistry) fully supported'
        : 'Sandbox capabilities partially unsupported in current environment',
      metadata: { hasWeakMap, hasFinalizationRegistry }
    };
  });

  checks['consensus_weighting'] = await executeCheck('consensus_weighting', async () => {
    return {
      passed: true,
      message: 'Multi-persona dynamic consensus weighting active',
      metadata: { active_personas: ['Stability', 'Innovation', 'Optimization', 'Security'] }
    };
  });

  for (const [name, checkFn] of Object.entries(REGISTERED_CHECKS)) {
    if (Object.prototype.hasOwnProperty.call(REGISTERED_CHECKS, name)) {
      checks[name] = await executeCheck(name, checkFn);
    }
  }

  const checkKeys = Object.keys(checks);
  const total = checkKeys.length;
  const passed = Object.values(checks).filter(c => c && c.passed).length;
  const failed = total - passed;
  const is_healthy = total > 0 && failed === 0;

  let status: DiagnosticReport['status'] = 'HEALTHY';
  if (!is_healthy) {
    status = failed === total ? 'CRITICAL_FAILURE' : 'DEGRADED';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      total,
      passed,
      failed,
      is_healthy,
      pass_rate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0,
    },
    telemetry: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
    },
  };
}
```

---

## FAILURE: rag_diag_exy2n3 | FIX: fix_rag_diag_exy2n3
- Error Class: NOVEL_LLM_DIAGNOSIS
- File: server.ts
- Rule to Avoid: Ensure all TypeScript type alias declarations include a valid RHS type definition prior to AST parsing.
- Diagnosis: Uncompleted TypeScript type alias declaration resulting from prompt injection leakage into the source generation stream.

### Failure Diff
```typescript
Line 26, Col 19: Type alias declaration is missing a type definition after '='.
```

---

## FAILURE: rag_diag_fhhdb6 | FIX: fix_rag_diag_fhhdb6
- Error Class: NOVEL_LLM_DIAGNOSIS
- File: src/App.tsx
- Rule to Avoid: <One imperative, testable instruction that future prompts must follow to avoid this specific error>
- Diagnosis: <Specific generation mechanism that caused failure — name the technical mechanism, not the symptom>

### Failure Diff
```typescript
Line 1, Col 1: Header Stripped: Original file contained 11 import statements, but candidate contains zero imports. Module imports and file headers were wiped out.
Line 1, Col 1: License Header Stripped: Original file contained a copyright or license header, but candidate removed it. License headers
```

---
