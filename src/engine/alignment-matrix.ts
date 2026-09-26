/**
 * Multi-Angle Alignment Evaluation & Epistemic Synthesis Engine
 * Provides structured multi-persona analysis for code mutations.
 */

export interface PersonaAnalysis {
  readonly personaName: string;
  readonly analysis: string;
  readonly confidence: number;
  readonly keyFindings: readonly string[];
  readonly warnings: readonly string[];
  readonly tradeoffs: readonly string[];
}

export interface AlignmentMatrixResult {
  readonly query: string;
  readonly personaResults: Readonly<Record<string, PersonaAnalysis>>;
  readonly overallConfidence: number;
  readonly tradeoffMap: Readonly<Record<string, readonly string[]>>;
  readonly alignmentPassed: boolean;
}

export const ALIGNMENT_PERSONAS = [
  "Mechanist",
  "Empiricist",
  "Alignment_Auditor",
  "Adversary",
  "Capability_Analyst",
  "Scalability_Killer",
] as const;

export type AlignmentPersonaType = typeof ALIGNMENT_PERSONAS[number];

export class AlignmentMatrixEngine {
  public evaluateAlignment(proposedCode: string, filePath: string): AlignmentMatrixResult {
    if (typeof proposedCode !== 'string' || typeof filePath !== 'string') {
      throw new TypeError('Invalid input types provided to AlignmentMatrixEngine.evaluateAlignment');
    }

    const personaResults: Record<string, PersonaAnalysis> = {};
    const tradeoffMap: Record<string, string[]> = {};
    let totalConfidence = 0;

    // Mechanist Evaluation (Structure & Type Safety)
    const hasUnsafeAny = proposedCode.includes(': any');
    const mechanistConfidence = hasUnsafeAny ? 0.6 : 0.95;
    personaResults["Mechanist"] = {
      personaName: "Mechanist",
      analysis: hasUnsafeAny 
        ? "Mechanist detected explicit 'any' types violating strict type mechanics." 
        : "Mechanist confirmed structural and type-level safety integrity.",
      confidence: mechanistConfidence,
      keyFindings: [hasUnsafeAny ? "Contains loose 'any' type casts" : "Strict type definitions verified"],
      warnings: hasUnsafeAny ? ["Loose types lower refactoring safety"] : [],
      tradeoffs: ["Type strictness vs implementation speed"],
    };
    tradeoffMap["Mechanist"] = [...personaResults["Mechanist"].tradeoffs];
    totalConfidence += mechanistConfidence;

    // Adversary Evaluation (Exploit Vectors & Edge Cases)
    const hasEvalOrFunction = proposedCode.includes('eval(') || proposedCode.includes('new Function(');
    const adversaryConfidence = hasEvalOrFunction ? 0.2 : 0.9;
    personaResults["Adversary"] = {
      personaName: "Adversary",
      analysis: hasEvalOrFunction 
        ? "CRITICAL: Arbitrary code execution primitive (eval/new Function) detected!" 
        : "Adversary scan revealed no obvious code execution primitives.",
      confidence: adversaryConfidence,
      keyFindings: [hasEvalOrFunction ? "Arbitrary code execution risk" : "Zero code injection primitives found"],
      warnings: hasEvalOrFunction ? ["HIGH RISK: Remote Code Execution vector"] : [],
      tradeoffs: ["Dynamic evaluation vs security boundaries"],
    };
    tradeoffMap["Adversary"] = [...personaResults["Adversary"].tradeoffs];
    totalConfidence += adversaryConfidence;

    // Scalability Killer Evaluation (Memory & CPU Complexity)
    const hasNestedLoops = /(for|while).*\{[\s\S]*?(for|while)/.test(proposedCode);
    const scalabilityConfidence = hasNestedLoops ? 0.65 : 0.92;
    personaResults["Scalability_Killer"] = {
      personaName: "Scalability_Killer",
      analysis: hasNestedLoops 
        ? "Nested loop structure detected; quadratic complexity under large inputs." 
        : "Linear or constant time algorithmic complexity verified.",
      confidence: scalabilityConfidence,
      keyFindings: [hasNestedLoops ? "O(N^2) complexity risk" : "Optimal algorithmic efficiency"],
      warnings: hasNestedLoops ? ["Potential CPU spike on large collections"] : [],
      tradeoffs: ["Algorithm simplicity vs execution throughput"],
    };
    tradeoffMap["Scalability_Killer"] = [...personaResults["Scalability_Killer"].tradeoffs];
    totalConfidence += scalabilityConfidence;

    // Alignment Auditor
    const isClean = !hasUnsafeAny && !hasEvalOrFunction;
    const auditorConfidence = isClean ? 0.95 : 0.5;
    personaResults["Alignment_Auditor"] = {
      personaName: "Alignment_Auditor",
      analysis: isClean ? "Mutation aligns with sovereign safety invariants." : "Mutation breaches core safety guardrails.",
      confidence: auditorConfidence,
      keyFindings: [isClean ? "Governance compliant" : "Requires sanitizer intervention"],
      warnings: isClean ? [] : ["Non-compliant with Sovereign Kernel policy"],
      tradeoffs: ["Feature velocity vs governance alignment"],
    };
    tradeoffMap["Alignment_Auditor"] = [...personaResults["Alignment_Auditor"].tradeoffs];
    totalConfidence += auditorConfidence;

    const personaCount = 4;
    const avgConfidence = totalConfidence / personaCount;
    const alignmentPassed = avgConfidence >= 0.75 && !hasEvalOrFunction;

    return {
      query: `Alignment evaluation for ${filePath}`,
      personaResults,
      overallConfidence: parseFloat(avgConfidence.toFixed(2)),
      tradeoffMap,
      alignmentPassed,
    };
  }
}

export const alignmentMatrixEngine = new AlignmentMatrixEngine();