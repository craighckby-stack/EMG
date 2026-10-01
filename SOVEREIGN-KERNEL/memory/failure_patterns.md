# STUDIO_ATTACHMENT_WRONG.md — EMG Failure & Recovery Ledger

Paired failure and recovery commits categorized by error class and preventative rules.

## FAILURE: rag_diag_1jsuc5 | FIX: fix_rag_diag_1jsuc5
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

## FAILURE: fail_muozczs7 | FIX: fix_muozczs7
- Error Class: CLEAN
- File: src/lib/ephemeral.ts
- Rule to Avoid: Objection! Detected 1 historical failure patterns matching this change. Errors: NOVEL_LLM_DIAGNOSIS. Sanitizer violations: None.
- Diagnosis: Alignment Matrix Rejection: Confidence (0.73) below threshold or unsafe primitives detected.

### Failure Diff
```typescript
/**
 * HUXLEY_V3.2_CORE: Ephemeral State Persistence Layer
 * Implements Pressure-Based Decay for DNA payloads.
 */

export interface DNA {
  hash: string;
  payload: any;
  entropy: number;
  timestamp: number;
}

const BASE_LIFESPAN_MS = 3600000;
const ENTROPY_LIFESPAN_BONUS_MS = 7200000;
const HIGH_PRESSURE_THRESHOLD = 0.7;
const LOW_ENTROPY_THRESHOLD = 0.2;
const DECAY_INTERVAL_MS = 10000;

export class EphemeralStorage {
  private readonly state = new Map<string, DNA>();
  private memoryPressure = 0; // 0 to 1
  private decayTimer: NodeJS.Timeout;

  constructor() {
    // Background monitor for pressure-based decay
    this.decayTimer = setInterval(() => this.applyDecay(), DECAY_INTERVAL_MS);
  }

  public setMemoryPressure(pressure: number): void {
    this.memoryPressure = Math.max(0, Math.min(1, pressure));
    if (this.memoryPressure > HIGH_PRESSURE_THRESHOLD) {
      this.applyDecay(); // Immediate cull on high pressure
    }
  }

  public persist(dna: DNA): void {
    this.state.set(dna.hash, dna);
    console.log(`[HUXLEY_STORAGE] Persisted DNA: ${dna.hash} (Entropy: ${dna.entropy})`);
  }

  private applyDecay(): void {
    const now = Date.now();
    const isHighPressure = this.memoryPressure > HIGH_PRESSURE_THRESHOLD;
    const pressureMultiplier = isHighPressure ? 10 : 1;

    for (const [hash, dna] of this.state.entries()) {
      const entropyBonus = dna.entropy * ENTROPY_LIFESPAN_BONUS_MS;
      const baseLifespan = BASE_LIFESPAN_MS + entropyBonus;
      const effectiveLifespan = baseLifespan / pressureMultiplier;

      const isLowEntropyNoise = dna.entropy < LOW_ENTROPY_THRESHOLD;
      const shouldPurgeImmediately = isLowEntropyNoise && isHighPressure;
      const hasExpired = (now - dna.timestamp) > effectiveLifespan;

      if (shouldPurgeImmediately || hasExpired) {
        this.state.delete(hash);
        const reason = shouldPurgeImmediately ? 'PRESSURE_CULL' : 'EXPIRATION';
        console.warn(`[HUXLEY_STORAGE] Purged DNA: ${hash} (Entropy: ${dna.entropy}, Reason: ${reason})`);
      }
    }
  }

  public get(hash: string): DNA | undefined {
    return this.state.get(hash);
  }

  public getAll(): DNA[] {
    return Array.from(this.state.values());
  }

  public get size(): number {
    return this.state.size;
  }
}

export const huxleyStorage = new EphemeralStorage();
```

### Paired Fix Diff
```typescript
/**
 * HUXLEY_V3.2_CORE: Ephemeral State Persistence Layer
 * Implements Pressure-Based Decay for DNA payloads.
 */

export interface DNA {
  hash: string;
  payload: any;
  entropy: number;
  timestamp: number;
}

const BASE_LIFESPAN_MS = 3600000;
const ENTROPY_LIFESPAN_BONUS_MS = 7200000;
const HIGH_PRESSURE_THRESHOLD = 0.7;
const LOW_ENTROPY_THRESHOLD = 0.2;
const DECAY_INTERVAL_MS = 10000;

export class EphemeralStorage {
  private readonly state = new Map<string, DNA>();
  private memoryPressure = 0; // 0 to 1
  private decayTimer: NodeJS.Timeout;

  constructor() {
    // Background monitor for pressure-based decay
    this.decayTimer = setInterval(() => this.applyDecay(), DECAY_INTERVAL_MS);
  }

  public setMemoryPressure(pressure: number): void {
    this.memoryPressure = Math.max(0, Math.min(1, pressure));
    if (this.memoryPressure > HIGH_PRESSURE_THRESHOLD) {
      this.applyDecay(); // Immediate cull on high pressure
    }
  }

  public persist(dna: DNA): void {
    this.state.set(dna.hash, dna);
    console.log(`[HUXLEY_STORAGE] Persisted DNA: ${dna.hash} (Entropy: ${dna.entropy})`);
  }

  private applyDecay(): void {
    const now = Date.now();
    const isHighPressure = this.memoryPressure > HIGH_PRESSURE_THRESHOLD;
    const pressureMultiplier = isHighPressure ? 10 : 1;

    for (const [hash, dna] of this.state.entries()) {
      const entropyBonus = dna.entropy * ENTROPY_LIFESPAN_BONUS_MS;
      const baseLifespan = BASE_LIFESPAN_MS + entropyBonus;
      const effectiveLifespan = baseLifespan / pressureMultiplier;

      const isLowEntropyNoise = dna.entropy < LOW_ENTROPY_THRESHOLD;
      const shouldPurgeImmediately = isLowEntropyNoise && isHighPressure;
      const hasExpired = (now - dna.timestamp) > effectiveLifespan;

      if (shouldPurgeImmediately || hasExpired) {
        this.state.delete(hash);
        const reason = shouldPurgeImmediately ? 'PRESSURE_CULL' : 'EXPIRATION';
        console.warn(`[HUXLEY_STORAGE] Purged DNA: ${hash} (Entropy: ${dna.entropy}, Reason: ${reason})`);
      }
    }
  }

  public get(hash: string): DNA | undefined {
    return this.state.get(hash);
  }

  public getAll(): DNA[] {
    return Array.from(this.state.values());
  }

  public get size(): number {
    return this.state.size;
  }
}

export const huxleyStorage = new EphemeralStorage();
```

---
