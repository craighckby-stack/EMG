# STUDIO_ATTACHMENT_WRONG.md — EMG Failure & Recovery Ledger

Paired failure and recovery commits categorized by error class and preventative rules.

## FAILURE: rag_diag_cnosp7 | FIX: fix_rag_diag_cnosp7
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

## FAILURE: fail_mup76b5c | FIX: fix_mup76b5c
- Error Class: AST_PARSE
- File: src/lib/siphon.ts
- Rule to Avoid: Objection! Detected 1 historical failure patterns matching this change. Errors: NOVEL_LLM_DIAGNOSIS. Sanitizer violations: AST_PARSE: Unbalanced delimiters: braces=0, brackets=1, parens=0.
- Diagnosis: Ethical Debate Rejection: Risk score (7.5/10) >= Benefit score (8/10). Objection! Detected 1 historical failure patterns matching this change. Errors: NOVEL_LLM_DIAGNOSIS. Sanitizer violations: AST_PARSE: Unbalanced delimiters: braces=0, brackets=1, parens=0.

### Failure Diff
```typescript
/**
 * HUXLEY_V3.2_CORE: Siphon Implementation
 * Pattern: Functional Result-Type Error Handling
 * Mutation: Deterministic DNA Extraction with Generational Stamping
 */

export type DNAFragment = {
  readonly title: string;
  readonly mutation: string;
  readonly ancestry: string; // Generational Stamping
  readonly weight: number;   // Deterministic AST Weighting
};

export type SiphonResult<T> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string; readonly entropyLevel: number };

export class SiphonEngine {
  private readonly currentGeneration: string = "V3.2_CORE";
  private static readonly MAX_PAYLOAD_LENGTH = 1_048_576; // 1MB bounds limit
  private static readonly MAX_MATCHES_LIMIT = 10_000;
  private static readonly MAX_FIELD_LENGTH = 1_024;
  private static readonly PATTERN_REGEX = /\[PATTERN: (.*?), STRATEGY: (.*?)\]/g;

  /**
   * Siphons logic-DNA from raw source buffers.
   * Replaces legacy void/null returns with explicit Result types.
   */
  public siphon(payload: string): SiphonResult<DNAFragment[]> {
    try {
      const validationError = this.validatePayload(payload);
      if (validationError) {
        return validationError;
      }

      const fragments: DNAFragment[] = this.parseDNA(payload);

      if (fragments.length === 0) {
        return { success: false, error: "NO_SURVIVABLE_TRAITS_FOUND", entropyLevel: 0.85 };
      }

      const stampedFragments = this.stampFragments(fragments);

      return { success: true, data: stampedFragments };
    } catch (criticalFailure: unknown) {
      const errorMessage = criticalFailure instanceof Error ? criticalFailure.message : String(criticalFailure);
      // Tie failure to Entropy-Based Ceiling Decay
      return { success: false, error: `CRITICAL_PIPELINE_COLLAPSE: ${errorMessage}`, entropyLevel: 1.0 };
    }
  }

  private validatePayload(payload: unknown): SiphonResult<DNAFragment[]> | null {
    if (typeof payload !== "string") {
      return { success: false, error: "INVALID_PAYLOAD_TYPE", entropyLevel: 0.99 };
    }

    if (payload.length === 0) {
      return { success: false, error: "EMPTY_SOURCE_PAYLOAD", entropyLevel: 0.99 };
    }

    if (payload.length > SiphonEngine.MAX_PAYLOAD_LENGTH) {
      return { success: false, error: "PAYLOAD_EXCEEDS_MAX_LENGTH", entropyLevel: 0.99 };
    }

    return null;
  }

  private stampFragments(fragments: readonly DNAFragment[]): DNAFragment[] {
    const timestamp = Date.now();
    const ancestry = `${this.currentGeneration}::${timestamp}`;
    const len = fragments.length;
    const stampedFragments: DNAFragment[] = new Array(len);

    for (let i = 0; i < len; i++) {
      const fragment = fragments[i];
      stampedFragments[i] = {
        title: fragment.title,
        mutation: fragment.mutation,
        ancestry,
        weight: this.calculateInitialWeight(fragment)
      };
    }

    return stampedFragments;
  }

  private parseDNA(raw: string): DNAFragment[] {
    // Implementation of Deterministic AST Weighting logic would reside here
    // Currently siphoning specific PATTERN/STRATEGY blocks
    if (!raw.includes("[PATTERN:")) {
      return [];
    }

    const patternRegex = SiphonEngine.PATTERN_REGEX;
    patternRegex.lastIndex = 0;

    const fragments: DNAFragment[] = [];
    let match: RegExpExecArray | null;
    let matchCount = 0;

    while ((match = patternRegex.exec(raw)) !== null) {
      matchCount++;
      if (matchCount > SiphonEngine.MAX_MATCHES_LIMIT) {
        break;
      }
      const rawTitle = typeof match[1] === "string" ? match[1].trim() : "";
      const rawMutation = typeof match[2] === "string" ? match[2].trim() : "";

      fragments.push({
        title: rawTitle.slice(0, SiphonEngine.MAX_FIELD_LENGTH),
        mutation: rawMutation.slice(0, SiphonEngine.MAX_FIELD_LENGTH),
        ancestry: "pending",
        weight: 0
      });
    }
    
    return fragments;
  }

  private calculateInitialWeight(fragment: DNAFragment): number {
    // Scoring based on previous successful execution cycles
    if (!fragment || typeof fragment.mutation !== "string") {
      return 0.5;
    }
    return fragment.mutation.includes("CRITICAL UPGRADE") ? 1.0 : 0.5;
  }
}

// Initialization for the Cross-Dimensional Deployment Pipeline
const siphonInstance = new SiphonEngine();
export default siphonInstance;
```

### Paired Fix Diff
```typescript
/**
 * HUXLEY_V3.2_CORE: Siphon Implementation
 * Pattern: Functional Result-Type Error Handling
 * Mutation: Deterministic DNA Extraction with Generational Stamping
 */

export type DNAFragment = {
  readonly title: string;
  readonly mutation: string;
  readonly ancestry: string; // Generational Stamping
  readonly weight: number;   // Deterministic AST Weighting
};

export type SiphonResult<T> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string; readonly entropyLevel: number };

export class SiphonEngine {
  private readonly currentGeneration: string = "V3.2_CORE";
  private static readonly MAX_PAYLOAD_LENGTH = 1_048_576; // 1MB bounds limit
  private static readonly MAX_MATCHES_LIMIT = 10_000;
  private static readonly MAX_FIELD_LENGTH = 1_024;
  private static readonly PATTERN_REGEX = /\[PATTERN: (.*?), STRATEGY: (.*?)\]/g;

  /**
   * Siphons logic-DNA from raw source buffers.
   * Replaces legacy void/null returns with explicit Result types.
   */
  public siphon(payload: string): SiphonResult<DNAFragment[]> {
    try {
      const validationError = this.validatePayload(payload);
      if (validationError) {
        return validationError;
      }

      const fragments: DNAFragment[] = this.parseDNA(payload);

      if (fragments.length === 0) {
        return { success: false, error: "NO_SURVIVABLE_TRAITS_FOUND", entropyLevel: 0.85 };
      }

      const stampedFragments = this.stampFragments(fragments);

      return { success: true, data: stampedFragments };
    } catch (criticalFailure: unknown) {
      const errorMessage = criticalFailure instanceof Error ? criticalFailure.message : String(criticalFailure);
      // Tie failure to Entropy-Based Ceiling Decay
      return { success: false, error: `CRITICAL_PIPELINE_COLLAPSE: ${errorMessage}`, entropyLevel: 1.0 };
    }
  }

  private validatePayload(payload: unknown): SiphonResult<DNAFragment[]> | null {
    if (typeof payload !== "string") {
      return { success: false, error: "INVALID_PAYLOAD_TYPE", entropyLevel: 0.99 };
    }

    if (payload.length === 0) {
      return { success: false, error: "EMPTY_SOURCE_PAYLOAD", entropyLevel: 0.99 };
    }

    if (payload.length > SiphonEngine.MAX_PAYLOAD_LENGTH) {
      return { success: false, error: "PAYLOAD_EXCEEDS_MAX_LENGTH", entropyLevel: 0.99 };
    }

    return null;
  }

  private stampFragments(fragments: readonly DNAFragment[]): DNAFragment[] {
    const timestamp = Date.now();
    const ancestry = `${this.currentGeneration}::${timestamp}`;
    const len = fragments.length;
    const stampedFragments: DNAFragment[] = new Array(len);

    for (let i = 0; i < len; i++) {
      const fragment = fragments[i];
      stampedFragments[i] = {
        title: fragment.title,
        mutation: fragment.mutation,
        ancestry,
        weight: this.calculateInitialWeight(fragment)
      };
    }

    return stampedFragments;
  }

  private parseDNA(raw: string): DNAFragment[] {
    // Implementation of Deterministic AST Weighting logic would reside here
    // Currently siphoning specific PATTERN/STRATEGY blocks
    if (!raw.includes("[PATTERN:")) {
      return [];
    }

    const patternRegex = SiphonEngine.PATTERN_REGEX;
    patternRegex.lastIndex = 0;

    const fragments: DNAFragment[] = [];
    let match: RegExpExecArray | null;
    let matchCount = 0;

    while ((match = patternRegex.exec(raw)) !== null) {
      matchCount++;
      if (matchCount > SiphonEngine.MAX_MATCHES_LIMIT) {
        break;
      }
      const rawTitle = typeof match[1] === "string" ? match[1].trim() : "";
      const rawMutation = typeof match[2] === "string" ? match[2].trim() : "";

      fragments.push({
        title: rawTitle.slice(0, SiphonEngine.MAX_FIELD_LENGTH),
        mutation: rawMutation.slice(0, SiphonEngine.MAX_FIELD_LENGTH),
        ancestry: "pending",
        weight: 0
      });
    }
    
    return fragments;
  }

  private calculateInitialWeight(fragment: DNAFragment): number {
    // Scoring based on previous successful execution cycles
    if (!fragment || typeof fragment.mutation !== "string") {
      return 0.5;
    }
    return fragment.mutation.includes("CRITICAL UPGRADE") ? 1.0 : 0.5;
  }
}

// Initialization for the Cross-Dimensional Deployment Pipeline
const siphonInstance = new SiphonEngine();
export default siphonInstance;
```

---
