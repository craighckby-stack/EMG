/**
 * EMG Sovereign Kernel - Self Stopping Point Engine
 * File: src/engine/halt.ts
 *
 * Role: Evaluates archaeological proof of clean halting criteria.
 *       Halt Condition: No growth in CORRECT.md for 3 consecutive cycles AND RAG query returns 0 new fix patterns AND sanitizer clean.
 */

import { queryEmgRag } from '../memory/emg_rag';
import { sanitizeAndGovern } from '../governance/sanitizer';

export interface HaltEvaluationState {
  readonly consecutiveNoGrowthCycles: number;
  readonly correctLedgerCount: number;
  readonly wrongRetrievalCount: number;
  readonly sanitizerClean: boolean;
  readonly isHalted: boolean;
  readonly haltReason?: string;
}

let historyGrowthTracker: number[] = [];

/**
 * Evaluates whether EMG should trigger an Archaeological Proof of Clean Halt.
 */
export function checkSelfStoppingPoint(
  currentCorrectCount: number,
  currentFileSample: { path: string; code: string }[]
): HaltEvaluationState {
  historyGrowthTracker.push(currentCorrectCount);
  if (historyGrowthTracker.length > 5) {
    historyGrowthTracker.shift();
  }

  // Check growth over last 3 cycles
  let consecutiveNoGrowthCycles = 0;
  if (historyGrowthTracker.length >= 3) {
    const len = historyGrowthTracker.length;
    const c1 = historyGrowthTracker[len - 3] ?? 0;
    const c2 = historyGrowthTracker[len - 2] ?? 0;
    const c3 = historyGrowthTracker[len - 1] ?? 0;

    if (c1 === c2 && c2 === c3) {
      consecutiveNoGrowthCycles = 3;
    }
  }

  // Check RAG for new fix patterns across file sample
  let totalWrongRetrievals = 0;
  let allSanitizerClean = true;

  for (const fileItem of currentFileSample) {
    const sanResult = sanitizeAndGovern(fileItem.path, fileItem.code);
    if (!sanResult.clean) {
      allSanitizerClean = false;
    }

    const ragRes = queryEmgRag(`${fileItem.path} ${fileItem.code}`);
    totalWrongRetrievals += ragRes.topFixes.length;
  }

  const isHalted = consecutiveNoGrowthCycles >= 3 && totalWrongRetrievals === 0 && allSanitizerClean;

  const haltReason = isHalted
    ? `HALT: CORRECT growth 0, WRONG retrieval 0, sanitizer clean`
    : undefined;

  return {
    consecutiveNoGrowthCycles,
    correctLedgerCount: currentCorrectCount,
    wrongRetrievalCount: totalWrongRetrievals,
    sanitizerClean: allSanitizerClean,
    isHalted,
    haltReason,
  };
}

export function resetHaltTracker(): void {
  historyGrowthTracker = [];
}
