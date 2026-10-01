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

## FAILURE: fail_muozgws1 | FIX: fix_muozgws1
- Error Class: CLEAN
- File: src/lib/gemini.ts
- Rule to Avoid: Objection! Detected 2 historical failure patterns matching this change. Errors: CLEAN, NOVEL_LLM_DIAGNOSIS. Sanitizer violations: None.
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

const DEFAULT_MODEL = "gemini-3-flash-preview";
const PIPELINE_TIMEOUT_MS = 90000;

/**
 * Retrieves the Gemini API key from the environment.
 */
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return apiKey;
}

/**
 * Initializes a GoogleGenAI instance with the configured API key.
 */
function createGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

// Exponential Backoff implementation as per EMG documentation
async function fetchWithExponentialBackoff<T>(
  apiCall: () => Promise<T>, 
  maxRetries = 5, 
  initialDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: unknown) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Maximum retries exceeded");
}

export const analyzeRepoChunks = async (
  context: string, 
  intentAnchor: string | null, 
  runningArchetype: string | null, 
  memoryContext: string
): Promise<Chunk[]> => {
  const archetypeContext = runningArchetype 
    ? `RECURSIVE SYSTEM ARCHETYPE (Current Evolved Identity): \n${runningArchetype}`
    : "SYSTEM DEFAULT: HUXLEY_REASONING_ENGINE_V3.2";

  const prompt = `You are the HYPER-RECURSIVE HUXLEY ENGINE (v3.2). Your mission is to siphon, distill, and evolve code architecture across parallel repositories.

${archetypeContext}

Scan the provided REPOSITORY CONTEXT. Your goal is to identify "Elite Logical Nodes" (patterns, abstractions, or structural choices) that align with our Intent Anchor: "${intentAnchor || 'Autonomous Architectural Evolution'}".

DNA SIPHONING RULES:
1. QUANTUM EXTRACTION: Select 5-10 chunks that represent the highest-fidelity architectural logic of the repo.
2. CRITICAL AUDIT: Inspect every code block for "System Superiority". If a pattern in this repo is objectively superior to the current ${archetypeContext.includes('RECURSIVE SYSTEM ARCHETYPE') ? 'System Archetype' : 'HUXLEY Core'} (specifically in areas like: Firebase security rules, Async pipeline stability, GitHub abstraction layers, or Auth persistence), you MUST trigger a REBOOT.
3. REBOOT SIGNAL: Set "isCriticalUpgrade" to true and provide a detailed explanation of the logic override in the "mutation" field.

MEMORY CONTEXT (Previously siphoned logic to inform this perspective):
${memoryContext || "Memory Pool is currently empty. Baseline reasoning engaged."}

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
${context}
`;

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
      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          // Grounding to reduce hallucination
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || "[]";
      let results: Chunk[] = [];
      try {
        results = JSON.parse(text);
      } catch {
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
          results = JSON.parse(text.substring(start, end + 1));
        }
      }

      return results.filter(chunk => {
        const isStable = (chunk.ccrrScore || 0) >= 7.0; 
        const isAligned = (chunk.intentAlignmentScore || 0) >= 0.6; 
        return isStable && isAligned;
      });
    });
  };

  const timeoutPromise = new Promise<Chunk[]>((_, reject) => 
    setTimeout(() => reject(new Error("CIRCUIT_BREAKER_TRIP: Pipeline timed out (90s)")), PIPELINE_TIMEOUT_MS)
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
  return await fetchWithExponentialBackoff(async () => {
    const ai = createGeminiClient();
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Topic: ${topic}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: promptModifier
      }
    });

    const text = response.text || "No perspective generated.";
    
    // Extract grounding sources
    const sources = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint ? [{
      title: "Google Search Knowledge Base",
      uri: "https://www.google.com/search?q=" + encodeURIComponent(topic)
    }] : [];

    return {
      persona: personaName,
      perspective: text,
      sources
    };
  });
};

export const generateSynthesis = async (topic: string, perspectives: PerspectiveReport[]): Promise<{ report: string; sources: any[] }> => {
  return await fetchWithExponentialBackoff(async () => {
    const perspectiveText = perspectives.map((p, i) => 
      `--- PERSPECTIVE ${i+1} (${p.persona}) ---\n${p.perspective}`
    ).join('\n\n');

    const synthesisPrompt = `You are the Huxley Collective Intelligence Synthesizer.
Analyze the following collection of ${perspectives.length} diverse architectural perspectives on: "${topic}".
Identify core themes, consensus, conflicts, and emergent ideas.
Do not summarize each one—synthesize a cohesive conclusion of ~250 lines.

Perspectives for Synthesis:
${perspectiveText}`;

    const ai = createGeminiClient();
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: synthesisPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const report = response.text || "Synthesis failed.";
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

const DEFAULT_MODEL = "gemini-3-flash-preview";
const PIPELINE_TIMEOUT_MS = 90000;

/**
 * Retrieves the Gemini API key from the environment.
 */
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return apiKey;
}

/**
 * Initializes a GoogleGenAI instance with the configured API key.
 */
function createGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

// Exponential Backoff implementation as per EMG documentation
async function fetchWithExponentialBackoff<T>(
  apiCall: () => Promise<T>, 
  maxRetries = 5, 
  initialDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: unknown) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Maximum retries exceeded");
}

export const analyzeRepoChunks = async (
  context: string, 
  intentAnchor: string | null, 
  runningArchetype: string | null, 
  memoryContext: string
): Promise<Chunk[]> => {
  const archetypeContext = runningArchetype 
    ? `RECURSIVE SYSTEM ARCHETYPE (Current Evolved Identity): \n${runningArchetype}`
    : "SYSTEM DEFAULT: HUXLEY_REASONING_ENGINE_V3.2";

  const prompt = `You are the HYPER-RECURSIVE HUXLEY ENGINE (v3.2). Your mission is to siphon, distill, and evolve code architecture across parallel repositories.

${archetypeContext}

Scan the provided REPOSITORY CONTEXT. Your goal is to identify "Elite Logical Nodes" (patterns, abstractions, or structural choices) that align with our Intent Anchor: "${intentAnchor || 'Autonomous Architectural Evolution'}".

DNA SIPHONING RULES:
1. QUANTUM EXTRACTION: Select 5-10 chunks that represent the highest-fidelity architectural logic of the repo.
2. CRITICAL AUDIT: Inspect every code block for "System Superiority". If a pattern in this repo is objectively superior to the current ${archetypeContext.includes('RECURSIVE SYSTEM ARCHETYPE') ? 'System Archetype' : 'HUXLEY Core'} (specifically in areas like: Firebase security rules, Async pipeline stability, GitHub abstraction layers, or Auth persistence), you MUST trigger a REBOOT.
3. REBOOT SIGNAL: Set "isCriticalUpgrade" to true and provide a detailed explanation of the logic override in the "mutation" field.

MEMORY CONTEXT (Previously siphoned logic to inform this perspective):
${memoryContext || "Memory Pool is currently empty. Baseline reasoning engaged."}

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
${context}
`;

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
      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          // Grounding to reduce hallucination
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || "[]";
      let results: Chunk[] = [];
      try {
        results = JSON.parse(text);
      } catch {
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
          results = JSON.parse(text.substring(start, end + 1));
        }
      }

      return results.filter(chunk => {
        const isStable = (chunk.ccrrScore || 0) >= 7.0; 
        const isAligned = (chunk.intentAlignmentScore || 0) >= 0.6; 
        return isStable && isAligned;
      });
    });
  };

  const timeoutPromise = new Promise<Chunk[]>((_, reject) => 
    setTimeout(() => reject(new Error("CIRCUIT_BREAKER_TRIP: Pipeline timed out (90s)")), PIPELINE_TIMEOUT_MS)
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
  return await fetchWithExponentialBackoff(async () => {
    const ai = createGeminiClient();
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Topic: ${topic}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: promptModifier
      }
    });

    const text = response.text || "No perspective generated.";
    
    // Extract grounding sources
    const sources = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint ? [{
      title: "Google Search Knowledge Base",
      uri: "https://www.google.com/search?q=" + encodeURIComponent(topic)
    }] : [];

    return {
      persona: personaName,
      perspective: text,
      sources
    };
  });
};

export const generateSynthesis = async (topic: string, perspectives: PerspectiveReport[]): Promise<{ report: string; sources: any[] }> => {
  return await fetchWithExponentialBackoff(async () => {
    const perspectiveText = perspectives.map((p, i) => 
      `--- PERSPECTIVE ${i+1} (${p.persona}) ---\n${p.perspective}`
    ).join('\n\n');

    const synthesisPrompt = `You are the Huxley Collective Intelligence Synthesizer.
Analyze the following collection of ${perspectives.length} diverse architectural perspectives on: "${topic}".
Identify core themes, consensus, conflicts, and emergent ideas.
Do not summarize each one—synthesize a cohesive conclusion of ~250 lines.

Perspectives for Synthesis:
${perspectiveText}`;

    const ai = createGeminiClient();
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: synthesisPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const report = response.text || "Synthesis failed.";
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
