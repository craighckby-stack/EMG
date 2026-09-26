/**
 * EMG Sovereign Kernel - RAG Memory Vector System
 * File: src/memory/emg_rag.ts
 *
 * Role: Parses STUDIO_ATTACHMENT_CORRECT.md, STUDIO_ATTACHMENT_WRONG.md, and STUDIO_ATTACHMENT_SYNTHESIS.md,
 *       chunks by commit hash, deduplicates, vectorizes with metadata, and exposes query(currentFile + error).
 */

import { safeGetLocalStorage, safeSetLocalStorage } from '../lib/safeStorage';

export interface VectorMetadata {
  readonly commitHash?: string;
  readonly fixCommitHash?: string;
  readonly provenance: 'clean' | 'failure' | 'synthesis';
  readonly trust: 'high' | 'medium' | 'low';
  readonly file?: string;
  readonly errorClass?: string;
  readonly description?: string;
}

export interface VectorEntry {
  readonly id: string;
  readonly metadata: VectorMetadata;
  readonly content: string;
  readonly codeSnippet?: string;
  readonly pairedFixSnippet?: string;
  readonly ruleToAvoid?: string;
  readonly vector: number[];
}

export interface EmgQueryResult {
  readonly topFailures: VectorEntry[];
  readonly topFixes: VectorEntry[];
  readonly topCleanPatterns: VectorEntry[];
  readonly topSynthesis: VectorEntry[];
  readonly totalMatches: number;
}

// In-memory vector database
let vectorStore: VectorEntry[] = [];
let isInitialized = false;

/**
 * Simple TF-IDF / Token Frequency vectorizer for offline and embedding similarity.
 */
function textToVector(text: string): number[] {
  const tokens = text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  const freqMap: Record<string, number> = {};
  for (const t of tokens) {
    freqMap[t] = (freqMap[t] || 0) + 1;
  }
  // Standardized 64-dim projection hash
  const dims = new Array(64).fill(0);
  Object.entries(freqMap).forEach(([word, count]) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 64;
    dims[idx] += count;
  });
  // Normalize
  const norm = Math.sqrt(dims.reduce((sum, val) => sum + val * val, 0)) || 1;
  return dims.map((val) => val / norm);
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += (vecA[i] || 0) * (vecB[i] || 0);
  }
  return dot;
}

/**
 * Parses STUDIO_ATTACHMENT_CORRECT.md text content into clean vectors.
 */
export function parseCorrectMd(content: string): VectorEntry[] {
  const entries: VectorEntry[] = [];
  const blocks = content.split(/##\s+COMMIT:\s+/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    const commitHash = lines[0]?.trim() || 'c_' + Math.random().toString(36).substring(2, 8);
    const fileMatch = block.match(/- File:\s*(.+)/);
    const file = fileMatch ? fileMatch[1]?.trim() : '';
    const diffMatch = block.match(/```(?:typescript|tsx|javascript)?\n([\s\scoped]*?)```/s) || block.match(/```([\s\S]*?)```/s);
    const snippet = diffMatch ? diffMatch[1]?.trim() : '';

    entries.push({
      id: `correct_${commitHash}`,
      metadata: {
        commitHash,
        provenance: 'clean',
        trust: 'high',
        file,
      },
      content: block,
      codeSnippet: snippet,
      vector: textToVector(`${commitHash} ${file} ${block} ${snippet}`),
    });
  }

  return entries;
}

/**
 * Parses STUDIO_ATTACHMENT_WRONG.md text content into failure & fix vectors.
 */
export function parseWrongMd(content: string): VectorEntry[] {
  const entries: VectorEntry[] = [];
  const blocks = content.split(/##\s+FAILURE:\s+/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    const header = lines[0] || '';
    const commitMatch = header.match(/([a-zA-Z0-9]+)\s*\|\s*FIX:\s*([a-zA-Z0-9]+)/);
    const commitHash = commitMatch ? commitMatch[1] : 'f_' + Math.random().toString(36).substring(2, 8);
    const fixCommitHash = commitMatch ? commitMatch[2] : 'fix_' + Math.random().toString(36).substring(2, 8);

    const errorClassMatch = block.match(/- Error Class:\s*(.+)/);
    const errorClass = errorClassMatch ? errorClassMatch[1]?.trim() : 'GENERAL';

    const fileMatch = block.match(/- File:\s*(.+)/);
    const file = fileMatch ? fileMatch[1]?.trim() : '';

    const ruleMatch = block.match(/- Rule to Avoid:\s*(.+)/);
    const ruleToAvoid = ruleMatch ? ruleMatch[1]?.trim() : '';

    const snippets = [...block.matchAll(/```(?:typescript|tsx|javascript)?\n([\s\S]*?)```/g)];
    const failureSnippet = snippets[0]?.[1]?.trim() || '';
    const fixSnippet = snippets[1]?.[1]?.trim() || '';

    entries.push({
      id: `wrong_${commitHash}`,
      metadata: {
        commitHash,
        fixCommitHash,
        provenance: 'failure',
        trust: 'high',
        errorClass,
        file,
      },
      content: block,
      codeSnippet: failureSnippet,
      pairedFixSnippet: fixSnippet,
      ruleToAvoid,
      vector: textToVector(`${commitHash} ${errorClass} ${file} ${ruleToAvoid} ${block} ${failureSnippet}`),
    });
  }

  return entries;
}

/**
 * Parses STUDIO_ATTACHMENT_SYNTHESIS.md text content into synthesis vectors.
 */
export function parseSynthesisMd(content: string): VectorEntry[] {
  const entries: VectorEntry[] = [];
  const blocks = content.split(/##\s+SECTION:\s+/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    const sectionName = lines[0]?.trim() || 'GENERAL';

    entries.push({
      id: `synthesis_${sectionName}`,
      metadata: {
        provenance: 'synthesis',
        trust: 'high',
        description: sectionName,
      },
      content: block,
      vector: textToVector(`${sectionName} ${block}`),
    });
  }

  return entries;
}

/**
 * Initializes the EMG RAG vector store from memory or attachments.
 */
export async function initializeEmgRag(
  correctContent?: string,
  wrongContent?: string,
  synthesisContent?: string
): Promise<VectorEntry[]> {
  const cachedStr = safeGetLocalStorage('emg_rag_vectors');
  if (cachedStr) {
    try {
      const cached = JSON.parse(cachedStr) as VectorEntry[];
      if (cached && cached.length > 0) {
        vectorStore = cached;
        isInitialized = true;
        return vectorStore;
      }
    } catch {}
  }

  const cleanEntries = correctContent ? parseCorrectMd(correctContent) : [];
  const wrongEntries = wrongContent ? parseWrongMd(wrongContent) : [];
  const synthesisEntries = synthesisContent ? parseSynthesisMd(synthesisContent) : [];

  // Deduplicate by commit hash / entry ID
  const dedupMap = new Map<string, VectorEntry>();
  [...cleanEntries, ...wrongEntries, ...synthesisEntries].forEach((entry) => {
    dedupMap.set(entry.id, entry);
  });

  vectorStore = Array.from(dedupMap.values());
  safeSetLocalStorage('emg_rag_vectors', JSON.stringify(vectorStore));
  isInitialized = true;
  return vectorStore;
}

/**
 * Queries the EMG RAG store for top matching failures, fixes, clean patterns, and synthesis.
 * Format: query(currentFile + error) => { top 3 failures, top 2 fixes, top 2 clean patterns, top 1 synthesis }
 */
export function queryEmgRag(currentFileAndError: string): EmgQueryResult {
  if (!isInitialized || vectorStore.length === 0) {
    // Attempt fallback from local storage
    const cachedStr = safeGetLocalStorage('emg_rag_vectors');
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as VectorEntry[];
        if (cached && cached.length > 0) {
          vectorStore = cached;
          isInitialized = true;
        }
      } catch {}
    }
  }

  const queryVec = textToVector(currentFileAndError);

  const scored = vectorStore.map((entry) => ({
    entry,
    score: cosineSimilarity(queryVec, entry.vector),
  }));

  scored.sort((a, b) => b.score - a.score);

  const failures = scored.filter((s) => s.entry.metadata.provenance === 'failure');
  const cleans = scored.filter((s) => s.entry.metadata.provenance === 'clean');
  const syntheses = scored.filter((s) => s.entry.metadata.provenance === 'synthesis');

  const topFailures = failures.slice(0, 3).map((s) => s.entry);
  const topFixes = failures.filter((s) => Boolean(s.entry.pairedFixSnippet)).slice(0, 2).map((s) => s.entry);
  const topCleanPatterns = cleans.slice(0, 2).map((s) => s.entry);
  const topSynthesis = syntheses.slice(0, 1).map((s) => s.entry);

  return {
    topFailures,
    topFixes,
    topCleanPatterns,
    topSynthesis,
    totalMatches: scored.length,
  };
}

/**
 * Appends a newly confirmed clean commit to the RAG memory store and ledger.
 */
export function appendCleanCommit(commitHash: string, filePath: string, diffSnippet: string): void {
  const newEntry: VectorEntry = {
    id: `correct_${commitHash}`,
    metadata: {
      commitHash,
      provenance: 'clean',
      trust: 'high',
      file: filePath,
    },
    content: `## COMMIT: ${commitHash}\n- File: ${filePath}\n- Sanitizer: PASSED\n\`\`\`typescript\n${diffSnippet}\n\`\`\``,
    codeSnippet: diffSnippet,
    vector: textToVector(`${commitHash} ${filePath} ${diffSnippet}`),
  };

  vectorStore = vectorStore.filter((e) => e.id !== newEntry.id);
  vectorStore.push(newEntry);
  safeSetLocalStorage('emg_rag_vectors', JSON.stringify(vectorStore));
}

/**
 * Appends a newly identified failure and paired fix to the RAG memory store and ledger.
 */
export function appendFailureAndFix(
  failHash: string,
  fixHash: string,
  errorClass: string,
  filePath: string,
  failSnippet: string,
  fixSnippet: string,
  ruleToAvoid: string
): void {
  const newEntry: VectorEntry = {
    id: `wrong_${failHash}`,
    metadata: {
      commitHash: failHash,
      fixCommitHash: fixHash,
      provenance: 'failure',
      trust: 'high',
      errorClass,
      file: filePath,
    },
    content: `## FAILURE: ${failHash} | FIX: ${fixHash}\n- Error Class: ${errorClass}\n- File: ${filePath}\n- Rule to Avoid: ${ruleToAvoid}`,
    codeSnippet: failSnippet,
    pairedFixSnippet: fixSnippet,
    ruleToAvoid,
    vector: textToVector(`${failHash} ${errorClass} ${filePath} ${ruleToAvoid} ${failSnippet} ${fixSnippet}`),
  };

  vectorStore = vectorStore.filter((e) => e.id !== newEntry.id);
  vectorStore.push(newEntry);
  safeSetLocalStorage('emg_rag_vectors', JSON.stringify(vectorStore));
}

export function getAllEmgVectors(): VectorEntry[] {
  return [...vectorStore];
}
