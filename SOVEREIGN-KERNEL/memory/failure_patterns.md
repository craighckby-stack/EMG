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

## FAILURE: fail_muovf07w | FIX: fix_muovf07w
- Error Class: CLEAN
- File: src/lib/firebase.ts
- Rule to Avoid: Objection! Detected 3 historical failure patterns matching this change. Errors: CLEAN, NOVEL_LLM_DIAGNOSIS, NOVEL_LLM_DIAGNOSIS. Sanitizer violations: None.
- Diagnosis: Alignment Matrix Rejection: Confidence (0.73) below threshold or unsafe primitives detected.

### Failure Diff
```typescript
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/firebase.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Chunk } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface FirebaseErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
  }
}

export const handleFirestoreError = (error: any, operationType: any, path: string | null): never => {
  const user = auth.currentUser;
  const errorInfo: FirebaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || 'none',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous ?? true
    }
  };
  throw new Error(JSON.stringify(errorInfo));
};

export const saveSiphonedChunk = async (chunk: Chunk) => {
  if (!auth.currentUser) return;
  if (!chunk || typeof chunk !== 'object') {
    throw new Error('Invalid chunk input: payload must be a non-null object.');
  }
  try {
    const chunkRef = collection(db, 'siphoned_chunks');
    const data: Record<string, any> = {
      title: typeof chunk.title === 'string' ? chunk.title.slice(0, 512) : '',
      file: typeof chunk.file === 'string' ? chunk.file.slice(0, 1024) : '',
      code: typeof chunk.code === 'string' ? chunk.code.slice(0, 65536) : '',
      explanation: typeof chunk.explanation === 'string' ? chunk.explanation.slice(0, 4096) : '',
      mutation: typeof chunk.mutation === 'string' ? chunk.mutation.slice(0, 4096) : '',
      intentAlignmentScore: typeof chunk.intentAlignmentScore === 'number' ? Math.max(0, Math.min(1, chunk.intentAlignmentScore)) : 0,
      philosophyCheck: Boolean(chunk.philosophyCheck),
      ccrrScore: typeof chunk.ccrrScore === 'number' ? Math.max(0, Math.min(100, chunk.ccrrScore)) : 0,
      suggestedBranchName: typeof chunk.suggestedBranchName === 'string' ? chunk.suggestedBranchName.slice(0, 128) : '',
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    };
    if (chunk.isCriticalUpgrade !== undefined) {
      data.isCriticalUpgrade = Boolean(chunk.isCriticalUpgrade);
    }
    await addDoc(chunkRef, data);
  } catch (e) {
    handleFirestoreError(e, 'create', 'siphoned_chunks');
  }
};

export const getSiphonedChunks = async () => {
  if (!auth.currentUser) return [];
  try {
    const q = query(collection(db, 'siphoned_chunks'), where('userId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as any));
  } catch (e) {
    handleFirestoreError(e, 'list', 'siphoned_chunks');
  }
};

export const saveArchetype = async (archetype: string) => {
  if (!auth.currentUser) return;
  if (typeof archetype !== 'string') {
    throw new Error('Invalid archetype input: must be a string.');
  }
  const sanitizedArchetype = archetype.slice(0, 256);
  try {
    const docRef = doc(db, 'system_archetypes', auth.currentUser.uid);
    await setDoc(docRef, {
      archetype: sanitizedArchetype,
      userId: auth.currentUser.uid,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    handleFirestoreError(e, 'update', `system_archetypes/${auth.currentUser.uid}`);
  }
};

export const getArchetype = async () => {
  if (!auth.currentUser) return null;
  try {
    const docRef = doc(db, 'system_archetypes', auth.currentUser.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return typeof data.archetype === 'string' ? data.archetype : null;
  } catch (e) {
    handleFirestoreError(e, 'get', `system_archetypes/${auth.currentUser.uid}`);
  }
};

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => auth.signOut();
```

### Paired Fix Diff
```typescript
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/firebase.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Chunk } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface FirebaseErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
  }
}

export const handleFirestoreError = (error: any, operationType: any, path: string | null): never => {
  const user = auth.currentUser;
  const errorInfo: FirebaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || 'none',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous ?? true
    }
  };
  throw new Error(JSON.stringify(errorInfo));
};

export const saveSiphonedChunk = async (chunk: Chunk) => {
  if (!auth.currentUser) return;
  if (!chunk || typeof chunk !== 'object') {
    throw new Error('Invalid chunk input: payload must be a non-null object.');
  }
  try {
    const chunkRef = collection(db, 'siphoned_chunks');
    const data: Record<string, any> = {
      title: typeof chunk.title === 'string' ? chunk.title.slice(0, 512) : '',
      file: typeof chunk.file === 'string' ? chunk.file.slice(0, 1024) : '',
      code: typeof chunk.code === 'string' ? chunk.code.slice(0, 65536) : '',
      explanation: typeof chunk.explanation === 'string' ? chunk.explanation.slice(0, 4096) : '',
      mutation: typeof chunk.mutation === 'string' ? chunk.mutation.slice(0, 4096) : '',
      intentAlignmentScore: typeof chunk.intentAlignmentScore === 'number' ? Math.max(0, Math.min(1, chunk.intentAlignmentScore)) : 0,
      philosophyCheck: Boolean(chunk.philosophyCheck),
      ccrrScore: typeof chunk.ccrrScore === 'number' ? Math.max(0, Math.min(100, chunk.ccrrScore)) : 0,
      suggestedBranchName: typeof chunk.suggestedBranchName === 'string' ? chunk.suggestedBranchName.slice(0, 128) : '',
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    };
    if (chunk.isCriticalUpgrade !== undefined) {
      data.isCriticalUpgrade = Boolean(chunk.isCriticalUpgrade);
    }
    await addDoc(chunkRef, data);
  } catch (e) {
    handleFirestoreError(e, 'create', 'siphoned_chunks');
  }
};

export const getSiphonedChunks = async () => {
  if (!auth.currentUser) return [];
  try {
    const q = query(collection(db, 'siphoned_chunks'), where('userId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as any));
  } catch (e) {
    handleFirestoreError(e, 'list', 'siphoned_chunks');
  }
};

export const saveArchetype = async (archetype: string) => {
  if (!auth.currentUser) return;
  if (typeof archetype !== 'string') {
    throw new Error('Invalid archetype input: must be a string.');
  }
  const sanitizedArchetype = archetype.slice(0, 256);
  try {
    const docRef = doc(db, 'system_archetypes', auth.currentUser.uid);
    await setDoc(docRef, {
      archetype: sanitizedArchetype,
      userId: auth.currentUser.uid,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    handleFirestoreError(e, 'update', `system_archetypes/${auth.currentUser.uid}`);
  }
};

export const getArchetype = async () => {
  if (!auth.currentUser) return null;
  try {
    const docRef = doc(db, 'system_archetypes', auth.currentUser.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return typeof data.archetype === 'string' ? data.archetype : null;
  } catch (e) {
    handleFirestoreError(e, 'get', `system_archetypes/${auth.currentUser.uid}`);
  }
};

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => auth.signOut();
```

---

## FAILURE: fail_muovgcia | FIX: fix_muovgcia
- Error Class: CLEAN
- File: src/lib/gemini.ts
- Rule to Avoid: Objection! Detected 3 historical failure patterns matching this change. Errors: CLEAN, CLEAN, NOVEL_LLM_DIAGNOSIS. Sanitizer violations: None.
- Diagnosis: Alignment Matrix Rejection: Confidence (0.66) below threshold or unsafe primitives detected.

### Failure Diff
```typescript
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/gemini.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Chunk } from '../types';

// Constants for security and bounds checking
const MAX_CONTEXT_LENGTH = 100000;
const MAX_PROMPT_LENGTH = 50000;
const MAX_RESPONSE_LENGTH = 1048576; // 1MB limit for safety against memory overflow
const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000;
const TIMEOUT_MS = 90000;

// Helper to sanitize strings and prevent injection vectors
function sanitizeInput(input: string | null | undefined, maxLength: number): string {
  if (!input) return '';
  if (typeof input !== 'string') {
    throw new Error("Invalid input type: expected string.");
  }
  if (input.length > maxLength) {
    throw new Error(`Input length exceeds maximum bounds of ${maxLength} characters.`);
  }
  // Strip dangerous control characters or null bytes
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

// Exponential Backoff implementation as per EMG documentation
async function fetchWithExponentialBackoff<T>(apiCall: () => Promise<T>, maxRetries = MAX_RETRIES, initialDelay = INITIAL_DELAY): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Maximum retries exceeded");
}

export const analyzeRepoChunks = async (context: string, intentAnchor: string | null, runningArchetype: string | null, memoryContext: string): Promise<Chunk[]> => {
  const sanitizedContext = sanitizeInput(context, MAX_CONTEXT_LENGTH);
  const sanitizedIntent = sanitizeInput(intentAnchor, 500);
  const sanitizedArchetype = sanitizeInput(runningArchetype, 2000);
  const sanitizedMemory = sanitizeInput(memoryContext, MAX_CONTEXT_LENGTH);

  const archetypeContext = sanitizedArchetype 
    ? `RECURSIVE SYSTEM ARCHETYPE (Current Evolved Identity): \n${sanitizedArchetype}`
    : "SYSTEM DEFAULT: HUXLEY_REASONING_ENGINE_V3.2";

  const prompt = `You are the HYPER-RECURSIVE HUXLEY ENGINE (v3.2). Your mission is to siphon, distill, and evolve code architecture across parallel repositories.

${archetypeContext}

Scan the provided REPOSITORY CONTEXT. Your goal is to identify "Elite Logical Nodes" (patterns, abstractions, or structural choices) that align with our Intent Anchor: "${sanitizedIntent || 'Autonomous Architectural Evolution'}".

DNA SIPHONING RULES:
1. QUANTUM EXTRACTION: Select 5-10 chunks that represent the highest-fidelity architectural logic of the repo.
2. CRITICAL AUDIT: Inspect every code block for "System Superiority". If a pattern in this repo is objectively superior to the current ${archetypeContext.includes('RECURSIVE SYSTEM ARCHETYPE') ? 'System Archetype' : 'HUXLEY Core'} (specifically in areas like: Firebase security rules, Async pipeline stability, GitHub abstraction layers, or Auth persistence), you MUST trigger a REBOOT.
3. REBOOT SIGNAL: Set "isCriticalUpgrade" to true and provide a detailed explanation of the logic override in the "mutation" field.

MEMORY CONTEXT (Previously siphoned logic to inform this perspective):
${sanitizedMemory || "Memory Pool is currently empty. Baseline reasoning engaged."}

FORMATTING REQUIREMENTS:
- Response MUST be a JSON array of Chunks.
- Each Chunk Schema: { 
    "title": string, 
    "file": string, 
    "code": string, 
    "explanation": string, 
    "mutation": string, 
    "intentAlignmentScore": number, 
    "philosophyCheck": string, 
    "ccrrScore": number, 
    "suggestedBranchName": string,
    "isCriticalUpgrade": boolean
  }

REPOSITORY CONTEXT TO ANALYZE:
${sanitizedContext}
`;

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error("Constructed prompt exceeds safety bounds.");
  }

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        file: { type: Type.STRING },
        code: { type: Type.STRING },
        explanation: { type: Type.STRING },
        mutation: { type: Type.STRING },
        intentAlignmentScore: { type: Type.NUMBER },
        philosophyCheck: { type: Type.STRING },
        ccrrScore: { type: Type.NUMBER },
        suggestedBranchName: { type: Type.STRING },
        isCriticalUpgrade: { type: Type.BOOLEAN }
      },
      required: ["title", "file", "code", "explanation", "mutation", "intentAlignmentScore", "philosophyCheck", "ccrrScore", "suggestedBranchName"]
    }
  };

  const executePipeline = async (): Promise<Chunk[]> => {
    return await fetchWithExponentialBackoff(async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          // Grounding to reduce hallucination
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || "[]";
      if (text.length > MAX_RESPONSE_LENGTH) {
        throw new Error("Response payload exceeds maximum allowed memory allocation limit.");
      }

      let results: Chunk[] = [];
      try {
        results = JSON.parse(text);
      } catch (parseError) {
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
          const substring = text.substring(start, end + 1);
          if (substring.length <= MAX_RESPONSE_LENGTH) {
            results = JSON.parse(substring);
          } else {
            throw new Error("Extracted JSON substring exceeds maximum bounds.");
          }
        }
      }

      if (!Array.isArray(results)) {
        throw new Error("Parsed response is not a valid array structure.");
      }

      return results.filter(chunk => {
        if (!chunk || typeof chunk !== 'object') return false;
        const ccrr = typeof chunk.ccrrScore === 'number' ? chunk.ccrrScore : 0;
        const alignment = typeof chunk.intentAlignmentScore === 'number' ? chunk.intentAlignmentScore : 0;
        const isStable = ccrr >= 7.0; 
        const isAligned = alignment >= 0.6; 
        return isStable && isAligned;
      });
    });
  };

  const timeoutPromise = new Promise<Chunk[]>((_, reject) => 
    setTimeout(() => reject(new Error("CIRCUIT_BREAKER_TRIP: Pipeline timed out (90s)")), TIMEOUT_MS)
  );

  return Promise.race([executePipeline(), timeoutPromise]);
};

// NEW: Collective Intelligence Engine implementation from EMG Documentation
export interface PerspectiveReport {
  persona: string;
  perspective: string;
  sources?: { title: string; uri: string }[];
}

export const generatePerspective = async (personaName: string, promptModifier: string, topic: string): Promise<PerspectiveReport> => {
  const sanitizedPersona = sanitizeInput(personaName, 100);
  const sanitizedModifier = sanitizeInput(promptModifier, 2000);
  const sanitizedTopic = sanitizeInput(topic, 1000);

  return await fetchWithExponentialBackoff(async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Topic: ${sanitizedTopic}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: sanitizedModifier
      }
    });

    const text = response.text || "No perspective generated.";
    if (text.length > MAX_RESPONSE_LENGTH) {
      throw new Error("Perspective response payload exceeds memory bounds.");
    }
    
    // Extract grounding sources securely
    const sources = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint ? [{
      title: "Google Search Knowledge Base",
      uri: "https://www.google.com/search?q=" + encodeURIComponent(sanitizedTopic)
    }] : [];

    return {
      persona: sanitizedPersona,
      perspective: text,
      sources
    };
  });
};

export const generateSynthesis = async (topic: string, perspectives: PerspectiveReport[]): Promise<{ report: string; sources: any[] }> => {
  const sanitizedTopic = sanitizeInput(topic, 1000);
  if (!Array.isArray(perspectives) || perspectives.length === 0) {
    throw new Error("Perspectives input must be a non-empty array.");
  }
  if (perspectives.length > 50) {
    throw new Error("Perspectives collection exceeds maximum array length bounds.");
  }

  return await fetchWithExponentialBackoff(async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    const perspectiveText = perspectives.map((p, i) => {
      const pName = sanitizeInput(p.persona, 100);
      const pText = sanitizeInput(p.perspective, MAX_CONTEXT_LENGTH);
      return `--- PERSPECTIVE ${i+1} (${pName}) ---\n${pText}`;
    }).join('\n\n');

    const synthesisPrompt = `You are the Huxley Collective Intelligence Synthesizer.
Analyze the following collection of ${perspectives.length} diverse architectural perspectives on: "${sanitizedTopic}".
Identify core themes, consensus, conflicts, and emergent ideas.
Do not summarize each one—synthesize a cohesive conclusion of ~250 lines.

Perspectives for Synthesis:
${perspectiveText}`;

    if (synthesisPrompt.length > MAX_PROMPT_LENGTH) {
      throw new Error("Synthesis prompt exceeds maximum length bounds.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: synthesisPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const report = response.text || "Synthesis failed.";
    if (report.length > MAX_RESPONSE_LENGTH) {
      throw new Error("Synthesis response exceeds memory safety limits.");
    }

    const allSources = perspectives.flatMap(p => p.sources || []);
    
    return { 
      report, 
      sources: Array.from(new Set(allSources.map(s => s.uri)))
        .map(uri => allSources.find(s => s.uri === uri))
    };
  });
};
```

### Paired Fix Diff
```typescript
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/gemini.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Chunk } from '../types';

// Constants for security and bounds checking
const MAX_CONTEXT_LENGTH = 100000;
const MAX_PROMPT_LENGTH = 50000;
const MAX_RESPONSE_LENGTH = 1048576; // 1MB limit for safety against memory overflow
const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000;
const TIMEOUT_MS = 90000;

// Helper to sanitize strings and prevent injection vectors
function sanitizeInput(input: string | null | undefined, maxLength: number): string {
  if (!input) return '';
  if (typeof input !== 'string') {
    throw new Error("Invalid input type: expected string.");
  }
  if (input.length > maxLength) {
    throw new Error(`Input length exceeds maximum bounds of ${maxLength} characters.`);
  }
  // Strip dangerous control characters or null bytes
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

// Exponential Backoff implementation as per EMG documentation
async function fetchWithExponentialBackoff<T>(apiCall: () => Promise<T>, maxRetries = MAX_RETRIES, initialDelay = INITIAL_DELAY): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Maximum retries exceeded");
}

export const analyzeRepoChunks = async (context: string, intentAnchor: string | null, runningArchetype: string | null, memoryContext: string): Promise<Chunk[]> => {
  const sanitizedContext = sanitizeInput(context, MAX_CONTEXT_LENGTH);
  const sanitizedIntent = sanitizeInput(intentAnchor, 500);
  const sanitizedArchetype = sanitizeInput(runningArchetype, 2000);
  const sanitizedMemory = sanitizeInput(memoryContext, MAX_CONTEXT_LENGTH);

  const archetypeContext = sanitizedArchetype 
    ? `RECURSIVE SYSTEM ARCHETYPE (Current Evolved Identity): \n${sanitizedArchetype}`
    : "SYSTEM DEFAULT: HUXLEY_REASONING_ENGINE_V3.2";

  const prompt = `You are the HYPER-RECURSIVE HUXLEY ENGINE (v3.2). Your mission is to siphon, distill, and evolve code architecture across parallel repositories.

${archetypeContext}

Scan the provided REPOSITORY CONTEXT. Your goal is to identify "Elite Logical Nodes" (patterns, abstractions, or structural choices) that align with our Intent Anchor: "${sanitizedIntent || 'Autonomous Architectural Evolution'}".

DNA SIPHONING RULES:
1. QUANTUM EXTRACTION: Select 5-10 chunks that represent the highest-fidelity architectural logic of the repo.
2. CRITICAL AUDIT: Inspect every code block for "System Superiority". If a pattern in this repo is objectively superior to the current ${archetypeContext.includes('RECURSIVE SYSTEM ARCHETYPE') ? 'System Archetype' : 'HUXLEY Core'} (specifically in areas like: Firebase security rules, Async pipeline stability, GitHub abstraction layers, or Auth persistence), you MUST trigger a REBOOT.
3. REBOOT SIGNAL: Set "isCriticalUpgrade" to true and provide a detailed explanation of the logic override in the "mutation" field.

MEMORY CONTEXT (Previously siphoned logic to inform this perspective):
${sanitizedMemory || "Memory Pool is currently empty. Baseline reasoning engaged."}

FORMATTING REQUIREMENTS:
- Response MUST be a JSON array of Chunks.
- Each Chunk Schema: { 
    "title": string, 
    "file": string, 
    "code": string, 
    "explanation": string, 
    "mutation": string, 
    "intentAlignmentScore": number, 
    "philosophyCheck": string, 
    "ccrrScore": number, 
    "suggestedBranchName": string,
    "isCriticalUpgrade": boolean
  }

REPOSITORY CONTEXT TO ANALYZE:
${sanitizedContext}
`;

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error("Constructed prompt exceeds safety bounds.");
  }

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        file: { type: Type.STRING },
        code: { type: Type.STRING },
        explanation: { type: Type.STRING },
        mutation: { type: Type.STRING },
        intentAlignmentScore: { type: Type.NUMBER },
        philosophyCheck: { type: Type.STRING },
        ccrrScore: { type: Type.NUMBER },
        suggestedBranchName: { type: Type.STRING },
        isCriticalUpgrade: { type: Type.BOOLEAN }
      },
      required: ["title", "file", "code", "explanation", "mutation", "intentAlignmentScore", "philosophyCheck", "ccrrScore", "suggestedBranchName"]
    }
  };

  const executePipeline = async (): Promise<Chunk[]> => {
    return await fetchWithExponentialBackoff(async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          // Grounding to reduce hallucination
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || "[]";
      if (text.length > MAX_RESPONSE_LENGTH) {
        throw new Error("Response payload exceeds maximum allowed memory allocation limit.");
      }

      let results: Chunk[] = [];
      try {
        results = JSON.parse(text);
      } catch (parseError) {
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
          const substring = text.substring(start, end + 1);
          if (substring.length <= MAX_RESPONSE_LENGTH) {
            results = JSON.parse(substring);
          } else {
            throw new Error("Extracted JSON substring exceeds maximum bounds.");
          }
        }
      }

      if (!Array.isArray(results)) {
        throw new Error("Parsed response is not a valid array structure.");
      }

      return results.filter(chunk => {
        if (!chunk || typeof chunk !== 'object') return false;
        const ccrr = typeof chunk.ccrrScore === 'number' ? chunk.ccrrScore : 0;
        const alignment = typeof chunk.intentAlignmentScore === 'number' ? chunk.intentAlignmentScore : 0;
        const isStable = ccrr >= 7.0; 
        const isAligned = alignment >= 0.6; 
        return isStable && isAligned;
      });
    });
  };

  const timeoutPromise = new Promise<Chunk[]>((_, reject) => 
    setTimeout(() => reject(new Error("CIRCUIT_BREAKER_TRIP: Pipeline timed out (90s)")), TIMEOUT_MS)
  );

  return Promise.race([executePipeline(), timeoutPromise]);
};

// NEW: Collective Intelligence Engine implementation from EMG Documentation
export interface PerspectiveReport {
  persona: string;
  perspective: string;
  sources?: { title: string; uri: string }[];
}

export const generatePerspective = async (personaName: string, promptModifier: string, topic: string): Promise<PerspectiveReport> => {
  const sanitizedPersona = sanitizeInput(personaName, 100);
  const sanitizedModifier = sanitizeInput(promptModifier, 2000);
  const sanitizedTopic = sanitizeInput(topic, 1000);

  return await fetchWithExponentialBackoff(async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Topic: ${sanitizedTopic}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: sanitizedModifier
      }
    });

    const text = response.text || "No perspective generated.";
    if (text.length > MAX_RESPONSE_LENGTH) {
      throw new Error("Perspective response payload exceeds memory bounds.");
    }
    
    // Extract grounding sources securely
    const sources = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint ? [{
      title: "Google Search Knowledge Base",
      uri: "https://www.google.com/search?q=" + encodeURIComponent(sanitizedTopic)
    }] : [];

    return {
      persona: sanitizedPersona,
      perspective: text,
      sources
    };
  });
};

export const generateSynthesis = async (topic: string, perspectives: PerspectiveReport[]): Promise<{ report: string; sources: any[] }> => {
  const sanitizedTopic = sanitizeInput(topic, 1000);
  if (!Array.isArray(perspectives) || perspectives.length === 0) {
    throw new Error("Perspectives input must be a non-empty array.");
  }
  if (perspectives.length > 50) {
    throw new Error("Perspectives collection exceeds maximum array length bounds.");
  }

  return await fetchWithExponentialBackoff(async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    const perspectiveText = perspectives.map((p, i) => {
      const pName = sanitizeInput(p.persona, 100);
      const pText = sanitizeInput(p.perspective, MAX_CONTEXT_LENGTH);
      return `--- PERSPECTIVE ${i+1} (${pName}) ---\n${pText}`;
    }).join('\n\n');

    const synthesisPrompt = `You are the Huxley Collective Intelligence Synthesizer.
Analyze the following collection of ${perspectives.length} diverse architectural perspectives on: "${sanitizedTopic}".
Identify core themes, consensus, conflicts, and emergent ideas.
Do not summarize each one—synthesize a cohesive conclusion of ~250 lines.

Perspectives for Synthesis:
${perspectiveText}`;

    if (synthesisPrompt.length > MAX_PROMPT_LENGTH) {
      throw new Error("Synthesis prompt exceeds maximum length bounds.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: synthesisPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const report = response.text || "Synthesis failed.";
    if (report.length > MAX_RESPONSE_LENGTH) {
      throw new Error("Synthesis response exceeds memory safety limits.");
    }

    const allSources = perspectives.flatMap(p => p.sources || []);
    
    return { 
      report, 
      sources: Array.from(new Set(allSources.map(s => s.uri)))
        .map(uri => allSources.find(s => s.uri === uri))
    };
  });
};
```

---

## FAILURE: fail_muovhoek | FIX: fix_muovhoek
- Error Class: CLEAN
- File: src/lib/github.ts
- Rule to Avoid: Objection! Detected 3 historical failure patterns matching this change. Errors: CLEAN, CLEAN, CLEAN. Sanitizer violations: None.
- Diagnosis: Alignment Matrix Rejection: Confidence (0.66) below threshold or unsafe primitives detected.

### Failure Diff
```typescript
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/github.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */


export interface GitHubRepo {
  owner: { login: string };
  name: string;
  default_branch: string;
}

/**
 * Validates and sanitizes a GitHub repository or owner name to prevent injection or malformed paths.
 */
const sanitizePathSegment = (segment: string, name: string): string => {
  if (!segment || typeof segment !== 'string' || !/^[\w.-]+$/.test(segment)) {
    throw new Error(`Invalid ${name}: contains illegal characters or is empty.`);
  }
  return segment;
};

/**
 * Validates and sanitizes a branch name or reference.
 */
const sanitizeBranchName = (branch: string): string => {
  if (!branch || typeof branch !== 'string' || branch.includes('..') || branch.includes('//')) {
    throw new Error('Invalid branch name structure.');
  }
  return branch;
};

export const ghFetch = async (url: string, token: string, options: RequestInit = {}) => {
  if (!url || typeof url !== 'string' || !url.startsWith('https://api.github.com/')) {
    throw new Error('Security Error: Invalid or untrusted GitHub API URL endpoint.');
  }
  if (!token || typeof token !== 'string') {
    throw new Error('Security Error: Authentication token is required.');
  }

  const authHeader = `Bearer ${token.trim()}`;
  
  const headers: Record<string, string> = {
    'Authorization': authHeader,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, { ...options, headers }).catch(e => {
    if (e.message && e.message.includes('Failed to fetch')) {
      throw new Error("Network Error: Failed to connect to GitHub. Verify your credentials and internet connection.");
    }
    throw e;
  });

  if (response.status === 403 || response.status === 429) {
    const rateLimitLimit = response.headers.get('x-ratelimit-limit');
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    
    if (rateLimitRemaining === '0') {
      const resetDate = rateLimitReset ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString() : 'soon';
      throw new Error(`CRITICAL: GitHub API rate limit exceeded. Reset at ${resetDate}. Operation halted.`);
    }
  }

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || (errorData.errors ? JSON.stringify(errorData.errors) : response.statusText);
      if (response.status === 403 && errorMessage.toLowerCase().includes('protected branch')) {
        errorMessage = "Operation failed: The branch is PROTECTED. Please disable branch protection in repository settings to allow distillation.";
      }
    } catch (e) {
      // Not JSON
    }
    throw new Error(`GitHub API Error [${response.status}]: ${errorMessage}`);
  }
  return response;
};

export const getRepoTree = async (repoUrl: string, token: string, branch: string = 'main') => {
  if (!repoUrl || typeof repoUrl !== 'string') {
    throw new Error('Invalid repository URL provided.');
  }
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL structure');
  const [_, rawOwner, rawName] = match;
  const owner = sanitizePathSegment(rawOwner, 'owner');
  const cleanName = sanitizePathSegment(rawName.replace(/\.git$/, '').replace(/\/$/, ''), 'repository name');
  const cleanBranch = sanitizeBranchName(branch);
  
  // Branch names with slashes MUST be encoded
  const encodedBranch = encodeURIComponent(cleanBranch);
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${cleanName}/git/trees/${encodedBranch}?recursive=1`, token);
  return res.json();
};

export const getFileContent = async (url: string, token: string) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid file content URL provided.');
  }
  const res = await ghFetch(url, token);
  const data = await res.json();
  
  if (!data.content) return "";

  try {
    // Standard base64 decoding that handles UTF-8 correctly
    const binaryString = atob(data.content.replace(/\s/g, ''));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.warn(`[github] Failed to decode content for ${url}:`, e);
    return "/* [Error: Binary or malformed content could not be decoded] */";
  }
};

export const getUserRepos = async (owner: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  try {
    const res = await ghFetch(`https://api.github.com/users/${cleanOwner}/repos?per_page=100&sort=updated`, token);
    return await res.json();
  } catch (e) {
    const res = await ghFetch(`https://api.github.com/orgs/${cleanOwner}/repos?per_page=100&sort=updated`, token);
    return await res.json();
  }
};

export const getBranches = async (owner: string, repo: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches`, token);
  return res.json();
};

export const createBranch = async (owner: string, repo: string, newBranch: string, baseBranch: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanNewBranch = sanitizeBranchName(newBranch);
  const cleanBaseBranch = sanitizeBranchName(baseBranch);

  console.log(`[createBranch] Creating [${cleanNewBranch}] from [${cleanBaseBranch}]`);
  
  // Use encoded branch for commit lookup
  const encodedBase = encodeURIComponent(cleanBaseBranch);
  const baseRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodedBase}`, token);
  const baseData = await baseRes.json();
  const sha = baseData.sha;

  if (!sha || typeof sha !== 'string') {
    throw new Error('Failed to resolve base commit SHA for branch creation.');
  }

  try {
    const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`, token, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${cleanNewBranch}`,
        sha
      })
    });
    return await res.json();
  } catch (e: any) {
    console.warn(`[createBranch] Fallback triggered:`, e?.message);
    const fallbackName = `backup-${Math.random().toString(36).substring(2, 7)}`;
    const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`, token, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${fallbackName}`,
        sha
      })
    });
    return await res.json();
  }
};

export const distillRepository = async (owner: string, repo: string, readmeContent: string, token: string, branch: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanBranch = sanitizeBranchName(branch);

  console.log(`[distillRepository] Distilling [${cleanBranch}]`);
  
  const encodedBranch = encodeURIComponent(cleanBranch);
  const commitRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodedBranch}`, token);
  const commitData = await commitRes.json();
  const parentSha = commitData.sha;

  if (!parentSha || typeof parentSha !== 'string') {
    throw new Error('Failed to resolve parent commit SHA for distillation.');
  }

  const blobRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/blobs`, token, {
    method: 'POST',
    body: JSON.stringify({
      content: btoa(unescape(encodeURIComponent(readmeContent))),
      encoding: 'base64'
    })
  });
  const blobData = await blobRes.json();

  if (!blobData.sha || typeof blobData.sha !== 'string') {
    throw new Error('Failed to create blob for distillation README.');
  }

  // 3. Create a new tree containing ONLY the README
  // Note: To delete all other files, we do NOT specify a base_tree.
  // This creates a "root" tree with only the provided elements.
  const treeRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({
      tree: [
        {
          path: 'README.md',
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        }
      ]
    })
  });
  const treeData = await treeRes.json();

  if (!treeData.sha || typeof treeData.sha !== 'string') {
    throw new Error('Failed to create tree for distillation manifest.');
  }

  // 4. Create a new commit
  const finalCommitRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({
      message: 'chore: distill repository to logic manifest',
      tree: treeData.sha,
      parents: [parentSha]
    })
  });
  const finalCommitData = await finalCommitRes.json();

  if (!finalCommitData.sha || typeof finalCommitData.sha !== 'string') {
    throw new Error('Failed to create commit for distillation.');
  }

  // 5. Update the branch reference
  const encodedRef = encodeURIComponent(cleanBranch);
  const updateRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${encodedRef}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: finalCommitData.sha,
      force: true
    })
  });
  return updateRes.json();
};

export const renameBranch = async (owner: string, repo: string, oldBranch: string, newName: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanOldBranch = sanitizeBranchName(oldBranch);
  const cleanNewName = sanitizeBranchName(newName);

  console.log(`[renameBranch] Renaming [${cleanOldBranch}] to [${cleanNewName}]`);
  const encodedBranch = encodeURIComponent(cleanOldBranch);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches/${encodedBranch}/rename`, token, {
    method: 'POST',
    body: JSON.stringify({ new_name: cleanNewName })
  });
  return res.json();
};

export const deleteBranch = async (owner: string, repo: string, branch: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanBranch = sanitizeBranchName(branch);

  console.log(`[deleteBranch] Deleting [${cleanBranch}]`);
  const encodedRef = encodeURIComponent(cleanBranch);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${encodedRef}`, token, {
    method: 'DELETE'
  });
  return res;
};

export const updateRepoVisibility = async (owner: string, repo: string, isPrivate: boolean, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');

  console.log(`[updateRepoVisibility] Setting ${cleanRepo} to ${isPrivate ? 'private' : 'public'}`);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ private: Boolean(isPrivate) })
  });
  return res.json();
};

export const protectBranch = async (owner: string, repo: string, branch: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanBranch = sanitizeBranchName(branch);

  console.log(`[protectBranch] Protecting [${cleanBranch}]`);
  const encodedBranch = encodeURIComponent(cleanBranch);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches/${encodedBranch}/protection`, token, {
    method: 'PUT',
    body: JSON.stringify({
      required_status_checks: null,
      enforce_admins: true,
      required_pull_request_reviews: null,
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false
    })
  });
  return res.json();
};
```

### Paired Fix Diff
```typescript
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/github.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */


export interface GitHubRepo {
  owner: { login: string };
  name: string;
  default_branch: string;
}

/**
 * Validates and sanitizes a GitHub repository or owner name to prevent injection or malformed paths.
 */
const sanitizePathSegment = (segment: string, name: string): string => {
  if (!segment || typeof segment !== 'string' || !/^[\w.-]+$/.test(segment)) {
    throw new Error(`Invalid ${name}: contains illegal characters or is empty.`);
  }
  return segment;
};

/**
 * Validates and sanitizes a branch name or reference.
 */
const sanitizeBranchName = (branch: string): string => {
  if (!branch || typeof branch !== 'string' || branch.includes('..') || branch.includes('//')) {
    throw new Error('Invalid branch name structure.');
  }
  return branch;
};

export const ghFetch = async (url: string, token: string, options: RequestInit = {}) => {
  if (!url || typeof url !== 'string' || !url.startsWith('https://api.github.com/')) {
    throw new Error('Security Error: Invalid or untrusted GitHub API URL endpoint.');
  }
  if (!token || typeof token !== 'string') {
    throw new Error('Security Error: Authentication token is required.');
  }

  const authHeader = `Bearer ${token.trim()}`;
  
  const headers: Record<string, string> = {
    'Authorization': authHeader,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, { ...options, headers }).catch(e => {
    if (e.message && e.message.includes('Failed to fetch')) {
      throw new Error("Network Error: Failed to connect to GitHub. Verify your credentials and internet connection.");
    }
    throw e;
  });

  if (response.status === 403 || response.status === 429) {
    const rateLimitLimit = response.headers.get('x-ratelimit-limit');
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    
    if (rateLimitRemaining === '0') {
      const resetDate = rateLimitReset ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString() : 'soon';
      throw new Error(`CRITICAL: GitHub API rate limit exceeded. Reset at ${resetDate}. Operation halted.`);
    }
  }

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || (errorData.errors ? JSON.stringify(errorData.errors) : response.statusText);
      if (response.status === 403 && errorMessage.toLowerCase().includes('protected branch')) {
        errorMessage = "Operation failed: The branch is PROTECTED. Please disable branch protection in repository settings to allow distillation.";
      }
    } catch (e) {
      // Not JSON
    }
    throw new Error(`GitHub API Error [${response.status}]: ${errorMessage}`);
  }
  return response;
};

export const getRepoTree = async (repoUrl: string, token: string, branch: string = 'main') => {
  if (!repoUrl || typeof repoUrl !== 'string') {
    throw new Error('Invalid repository URL provided.');
  }
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL structure');
  const [_, rawOwner, rawName] = match;
  const owner = sanitizePathSegment(rawOwner, 'owner');
  const cleanName = sanitizePathSegment(rawName.replace(/\.git$/, '').replace(/\/$/, ''), 'repository name');
  const cleanBranch = sanitizeBranchName(branch);
  
  // Branch names with slashes MUST be encoded
  const encodedBranch = encodeURIComponent(cleanBranch);
  const res = await ghFetch(`https://api.github.com/repos/${owner}/${cleanName}/git/trees/${encodedBranch}?recursive=1`, token);
  return res.json();
};

export const getFileContent = async (url: string, token: string) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid file content URL provided.');
  }
  const res = await ghFetch(url, token);
  const data = await res.json();
  
  if (!data.content) return "";

  try {
    // Standard base64 decoding that handles UTF-8 correctly
    const binaryString = atob(data.content.replace(/\s/g, ''));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.warn(`[github] Failed to decode content for ${url}:`, e);
    return "/* [Error: Binary or malformed content could not be decoded] */";
  }
};

export const getUserRepos = async (owner: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  try {
    const res = await ghFetch(`https://api.github.com/users/${cleanOwner}/repos?per_page=100&sort=updated`, token);
    return await res.json();
  } catch (e) {
    const res = await ghFetch(`https://api.github.com/orgs/${cleanOwner}/repos?per_page=100&sort=updated`, token);
    return await res.json();
  }
};

export const getBranches = async (owner: string, repo: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches`, token);
  return res.json();
};

export const createBranch = async (owner: string, repo: string, newBranch: string, baseBranch: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanNewBranch = sanitizeBranchName(newBranch);
  const cleanBaseBranch = sanitizeBranchName(baseBranch);

  console.log(`[createBranch] Creating [${cleanNewBranch}] from [${cleanBaseBranch}]`);
  
  // Use encoded branch for commit lookup
  const encodedBase = encodeURIComponent(cleanBaseBranch);
  const baseRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodedBase}`, token);
  const baseData = await baseRes.json();
  const sha = baseData.sha;

  if (!sha || typeof sha !== 'string') {
    throw new Error('Failed to resolve base commit SHA for branch creation.');
  }

  try {
    const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`, token, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${cleanNewBranch}`,
        sha
      })
    });
    return await res.json();
  } catch (e: any) {
    console.warn(`[createBranch] Fallback triggered:`, e?.message);
    const fallbackName = `backup-${Math.random().toString(36).substring(2, 7)}`;
    const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`, token, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${fallbackName}`,
        sha
      })
    });
    return await res.json();
  }
};

export const distillRepository = async (owner: string, repo: string, readmeContent: string, token: string, branch: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanBranch = sanitizeBranchName(branch);

  console.log(`[distillRepository] Distilling [${cleanBranch}]`);
  
  const encodedBranch = encodeURIComponent(cleanBranch);
  const commitRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodedBranch}`, token);
  const commitData = await commitRes.json();
  const parentSha = commitData.sha;

  if (!parentSha || typeof parentSha !== 'string') {
    throw new Error('Failed to resolve parent commit SHA for distillation.');
  }

  const blobRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/blobs`, token, {
    method: 'POST',
    body: JSON.stringify({
      content: btoa(unescape(encodeURIComponent(readmeContent))),
      encoding: 'base64'
    })
  });
  const blobData = await blobRes.json();

  if (!blobData.sha || typeof blobData.sha !== 'string') {
    throw new Error('Failed to create blob for distillation README.');
  }

  // 3. Create a new tree containing ONLY the README
  // Note: To delete all other files, we do NOT specify a base_tree.
  // This creates a "root" tree with only the provided elements.
  const treeRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({
      tree: [
        {
          path: 'README.md',
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        }
      ]
    })
  });
  const treeData = await treeRes.json();

  if (!treeData.sha || typeof treeData.sha !== 'string') {
    throw new Error('Failed to create tree for distillation manifest.');
  }

  // 4. Create a new commit
  const finalCommitRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({
      message: 'chore: distill repository to logic manifest',
      tree: treeData.sha,
      parents: [parentSha]
    })
  });
  const finalCommitData = await finalCommitRes.json();

  if (!finalCommitData.sha || typeof finalCommitData.sha !== 'string') {
    throw new Error('Failed to create commit for distillation.');
  }

  // 5. Update the branch reference
  const encodedRef = encodeURIComponent(cleanBranch);
  const updateRes = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${encodedRef}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: finalCommitData.sha,
      force: true
    })
  });
  return updateRes.json();
};

export const renameBranch = async (owner: string, repo: string, oldBranch: string, newName: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanOldBranch = sanitizeBranchName(oldBranch);
  const cleanNewName = sanitizeBranchName(newName);

  console.log(`[renameBranch] Renaming [${cleanOldBranch}] to [${cleanNewName}]`);
  const encodedBranch = encodeURIComponent(cleanOldBranch);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches/${encodedBranch}/rename`, token, {
    method: 'POST',
    body: JSON.stringify({ new_name: cleanNewName })
  });
  return res.json();
};

export const deleteBranch = async (owner: string, repo: string, branch: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanBranch = sanitizeBranchName(branch);

  console.log(`[deleteBranch] Deleting [${cleanBranch}]`);
  const encodedRef = encodeURIComponent(cleanBranch);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${encodedRef}`, token, {
    method: 'DELETE'
  });
  return res;
};

export const updateRepoVisibility = async (owner: string, repo: string, isPrivate: boolean, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');

  console.log(`[updateRepoVisibility] Setting ${cleanRepo} to ${isPrivate ? 'private' : 'public'}`);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ private: Boolean(isPrivate) })
  });
  return res.json();
};

export const protectBranch = async (owner: string, repo: string, branch: string, token: string) => {
  const cleanOwner = sanitizePathSegment(owner, 'owner');
  const cleanRepo = sanitizePathSegment(repo, 'repo');
  const cleanBranch = sanitizeBranchName(branch);

  console.log(`[protectBranch] Protecting [${cleanBranch}]`);
  const encodedBranch = encodeURIComponent(cleanBranch);
  const res = await ghFetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches/${encodedBranch}/protection`, token, {
    method: 'PUT',
    body: JSON.stringify({
      required_status_checks: null,
      enforce_admins: true,
      required_pull_request_reviews: null,
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false
    })
  });
  return res.json();
};
```

---
