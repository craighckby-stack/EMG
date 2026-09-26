import { fetchFileContent, commitFileUpdate } from './github';
import { findCachedDiagnosisInRag, appendFailureAndFix } from '../memory/emg_rag';

export async function computeSHA256(str: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export function computeStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export type PostmortemSource = 'oracle-harness' | 'mutation-cycle';

export interface PostmortemEntryV2 {
  file: string;
  date: string;
  source: PostmortemSource;
  evidence: string;
  diagnosis: string;
  correctivePattern: string;
  occurrenceCount: number;
  status: 'active' | 'struck' | 'escalated' | 'ignored';
  fingerprint: string;
}

export interface PostmortemResult {
  content: string;
  hash: string;
  isEscalated: boolean;
  occurrenceCount: number;
  status: 'active' | 'escalated' | 'ignored' | 'clean_verified';
  fingerprint: string;
}

/**
 * Normalizes error messages by stripping volatile line/column numbers, timestamps,
 * hex addresses, and file paths to create a stable error signature for deduplication.
 */
export function fingerprintError(file: string, evidence: string): string {
  const normalized = evidence
    .replace(/Line \d+, Col \d+/gi, "Line _, Col _")
    .replace(/:\d+:\d+/g, ":_:_")
    .replace(/line \d+/gi, "line _")
    .replace(/0x[0-9a-fA-F]+/g, "0x_")
    .replace(/\/[^:\s]+\.(ts|tsx|js|jsx|c|h|cpp)/gi, "<file>")
    .replace(/\s+/g, " ")
    .trim();
  return `${file}::${normalized}`;
}

const OCCURRENCE_ESCALATION_THRESHOLD = 3;

export function classifyEntry(priorCount: number): 'active' | 'escalated' {
  return priorCount >= OCCURRENCE_ESCALATION_THRESHOLD ? 'escalated' : 'active';
}

/**
 * Checks if evidence indicates an isolated compilation context missing dependencies
 * rather than an actual code generation defect.
 */
export function isIsolationError(evidence: string): boolean {
  const evLower = evidence.toLowerCase();
  return (
    evLower.includes('no such file or directory') ||
    evLower.includes('undeclared') ||
    evLower.includes('unknown type name') ||
    evLower.includes('implicit declaration') ||
    evLower.includes('cannot find module') ||
    evLower.includes('cannot find name')
  );
}

/**
 * Generalized rule matcher for known compiler/linter error shapes.
 */
export function deriveConstraintFromEvidence(
  evidence: string,
  filePath: string
): { diagnosis: string; correctivePattern: string; isKnownCategory: boolean } {
  const evLower = evidence.toLowerCase();

  // 1. Isolation Artifact Check
  if (isIsolationError(evidence)) {
    return {
      diagnosis: 'Isolated compilation unit missing external dependencies or header imports.',
      correctivePattern: '[MANUAL_OVERRIDE] Isolated compilation context missing dependencies. Ignoring error.',
      isKnownCategory: true,
    };
  }

  // 2. Token Limit & Output Truncation
  if (
    evLower.includes('truncated') ||
    evLower.includes('output token limit') ||
    evLower.includes('unterminated string') ||
    evLower.includes('unterminated template') ||
    evLower.includes('unexpected end of input') ||
    evLower.includes('syntax_unclosed') ||
    evLower.includes("'} expected'") ||
    evLower.includes("')' expected") ||
    evLower.includes("']' expected")
  ) {
    return {
      diagnosis: `Model generation exceeded maximum output token threshold for ${filePath}, terminating mid-string/delimiter before EOF.`,
      correctivePattern: `File ${filePath} requires chunked diff generation or modular decomposition. Do NOT regenerate full file in a single completion pass.`,
      isKnownCategory: true,
    };
  }

  // 3. Unverifiable Self-Praise / Marketing
  if (
    evLower.includes('self-praise') ||
    evLower.includes('unverifiable claim') ||
    evLower.includes('hardened') ||
    evLower.includes('production-grade') ||
    evLower.includes('leak-free') ||
    evLower.includes('fully optimized') ||
    evLower.includes('state-of-the-art')
  ) {
    return {
      diagnosis: 'Model inserted subjective promotional claims or unverified self-praise in comments/docstrings.',
      correctivePattern: 'Do NOT emit self-praising or unverifiable claims in comments or documentation (e.g. "Fully optimized", "Hardened", "Leak-free"). Maintain neutral, factual technical descriptions.',
      isKnownCategory: true,
    };
  }

  // 4. Missing Type Annotation
  if (
    evLower.includes('missing property type') ||
    evLower.includes('type expected') ||
    evLower.includes('property declaration is missing') ||
    evLower.includes('invalid_type_annotation') ||
    /\btype\s+annotation\s+missing\b/i.test(evidence)
  ) {
    return {
      diagnosis: `Explicit type annotation omitted from property or variable binding in ${filePath}.`,
      correctivePattern: `Always specify explicit TypeScript type annotations on property declarations and exported bindings in ${filePath}.`,
      isKnownCategory: true,
    };
  }

  // 5. C++ Keywords in C
  if (
    evLower.includes('noexcept') ||
    evLower.includes('constexpr') ||
    (evLower.includes("expected ';'") && evLower.includes('declarator'))
  ) {
    return {
      diagnosis: 'Model emitted C++ specific keywords (e.g. noexcept, constexpr) inside a pure C unit.',
      correctivePattern: 'Do NOT emit C++ keywords (e.g. noexcept, constexpr) in pure C translation units.',
      isKnownCategory: true,
    };
  }

  // 6. Generalized Redundant Inner Loop Bounds / Dead Conditions
  if (
    evLower.includes('dead condition') ||
    evLower.includes('redundant check') ||
    /\b\w+\s*>\s*0\b/.test(evidence) ||
    /\b\w+\s*<\s*\w+\b/.test(evidence)
  ) {
    return {
      diagnosis: 'Redundant inner bounds guard inserted inside an already bounded loop or condition.',
      correctivePattern: 'Do NOT emit redundant inner bounds guards when outer loop condition already guarantees iteration bounds.',
      isKnownCategory: true,
    };
  }

  // 7. Unused Macro Definitions
  if (evLower.includes('unused macro') || /\b#define\s+[A-Za-z0-9_]+\b/i.test(evidence)) {
    return {
      diagnosis: 'Preprocessor macro defined without active invocations in the translation unit.',
      correctivePattern: 'Do NOT define helper macros without applying them in active execution paths.',
      isKnownCategory: true,
    };
  }

  // 8. Test Fixture / Apparatus Leaks
  if (
    evLower.includes('stale_defect') ||
    evLower.includes('seeded defect') ||
    evLower.includes('scaffolding') ||
    evLower.includes('bugs.md')
  ) {
    return {
      diagnosis: 'Test fixture scaffolding or obsolete defect descriptions leaked into file documentation.',
      correctivePattern: 'Do NOT leak test fixture scaffolding, prediction tags, or obsolete defect descriptions into candidate file docstrings.',
      isKnownCategory: true,
    };
  }

  // 9. Unmatched Fallback (Dynamic LLM required)
  const firstLine = evidence.trim().split('\n')[0] || 'Syntax verification failure';
  return {
    diagnosis: `Compiler/linter verification failure on ${filePath}: ${firstLine}`,
    correctivePattern: `When mutating ${filePath}, strictly satisfy AST parser constraints for rule: ${firstLine}`,
    isKnownCategory: false,
  };
}

/**
 * Dynamic Root-Cause Extraction with RAG Vector Cache:
 * 1. Checks static classifier for known error categories.
 * 2. Queries RAG vector store for previously cached diagnoses matching the fingerprint.
 * 3. Dispatches LLM request ONLY for genuinely novel error shapes.
 * 4. Saves newly extracted diagnoses back into RAG vector store for instant future reuse.
 */
export async function extractDiagnosis(
  file: string,
  evidence: string
): Promise<{ diagnosis: string; correctivePattern: string }> {
  // Step 1: Static Classifier Check
  const derived = deriveConstraintFromEvidence(evidence, file);
  if (derived.isKnownCategory) {
    return { diagnosis: derived.diagnosis, correctivePattern: derived.correctivePattern };
  }

  // Step 2: RAG Vector Store Cache Lookup (Zero LLM Calls)
  const fp = fingerprintError(file, evidence);
  try {
    const cachedRag = findCachedDiagnosisInRag(file, fp);
    if (cachedRag) {
      console.log(`[RAG Cache Hit] Retrieved diagnosis directly from vector memory for ${fp}. Skipped LLM call.`);
      return cachedRag;
    }
  } catch (ragErr) {
    console.warn('[Postmortem RAG Lookup Warning]', ragErr);
  }

  // Step 3: Call LLM for genuinely novel error shapes
  try {
    const prompt = `You are a neural postmortem diagnostician for code generation failures.
Do NOT restate the error. Do NOT start rules with "Never repeat code patterns that produce this error."

Compiler/Linter Evidence:
${evidence}

Target File: ${file}

Respond strictly in JSON format:
{
  "diagnosis": "<Specific generation mechanism that caused failure — name the technical mechanism, not the symptom>",
  "correctivePattern": "<One imperative, testable instruction that future prompts must follow to avoid this specific error>"
}`;

    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: prompt,
        filePath: file,
        goal: 'readability',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data.optimizedCode || data.summary || '';
      const jsonMatch = rawText.match(/\{[\s\S]*"diagnosis"[\s\S]*"correctivePattern"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.diagnosis && parsed.correctivePattern) {
          const result = {
            diagnosis: parsed.diagnosis.trim(),
            correctivePattern: parsed.correctivePattern.trim(),
          };

          // Step 4: Persist extracted diagnosis into RAG Vector Store
          try {
            const failHash = `rag_diag_${Math.random().toString(36).substring(2, 8)}`;
            appendFailureAndFix(
              failHash,
              `fix_${failHash}`,
              'NOVEL_LLM_DIAGNOSIS',
              file,
              evidence.slice(0, 300),
              '',
              result.correctivePattern,
              result.diagnosis,
              fp
            );
          } catch {}

          return result;
        }
      }
    }
  } catch (err) {
    console.warn('[Postmortem] Dynamic LLM diagnosis extraction fallback:', err);
  }

  return { diagnosis: derived.diagnosis, correctivePattern: derived.correctivePattern };
}

let writeQueue: Promise<any> = Promise.resolve();

/**
 * Main Postmortem Ledger Writer with In-Place Deduplication and Escalation Status.
 */
export function writePostmortem(
  repo: string,
  filePath: string,
  type: 'Success' | 'Failure',
  lintEvidence: string,
  token: string,
  branch?: string,
  options?: {
    source?: PostmortemSource;
    constraintRule?: string;
    symptom?: string;
  }
): Promise<PostmortemResult> {
  const executeWrite = async (): Promise<PostmortemResult> => {
    const pmPath = 'docs/POSTMORTEMS.md';
    const timestamp = new Date().toISOString().split('T')[0];
    const source = options?.source || 'mutation-cycle';
    const fp = fingerprintError(filePath, lintEvidence);

    // 1. Check for Isolation Artifact Errors -> BYPASS LEDGER TO PREVENT FALSE ESCALATION
    if (type === 'Failure' && isIsolationError(lintEvidence)) {
      console.log(`[Postmortem Bypass] Isolated compilation artifact detected for ${filePath}. Skipping ledger escalation.`);
      return {
        content: '',
        hash: 'isolation_bypass',
        isEscalated: false,
        occurrenceCount: 0,
        status: 'ignored',
        fingerprint: fp,
      };
    }

    let pmContent = '';
    let pmSha = '';

    try {
      const fileData = await fetchFileContent(repo, pmPath, token, branch);
      pmContent = fileData.content;
      pmSha = fileData.sha;
    } catch (e) {
      pmContent = '# Neural Engine Post-Mortems\n\n## Auto-Generated Lessons & Negative Constraints\n';
    }

    // 2. Perform In-Place Search for Existing Fingerprint Entry
    const fpEscaped = fp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingFpRegex = new RegExp(`(### ❌ \\[[^\\]]+\\] ${filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?\\*\\*FINGERPRINT:\\*\\* \`${fpEscaped}\` \\(Occurrences: (\\d+)\\)[\\s\\S]*?\\n(?=### |$))`, 'g');

    const match = existingFpRegex.exec(pmContent);
    let updatedContent = pmContent;
    let occurrenceCount = 1;
    let isEscalated = false;
    let finalStatus: 'active' | 'escalated' | 'clean_verified' = type === 'Success' ? 'clean_verified' : 'active';

    if (type === 'Failure') {
      const extracted = await extractDiagnosis(filePath, lintEvidence);
      const rule = options?.constraintRule || extracted.correctivePattern;

      if (match && match[0]) {
        // IN-PLACE UPDATE: Increment occurrence count and update status in-place
        const priorCount = parseInt(match[2] || '1', 10);
        occurrenceCount = priorCount + 1;
        isEscalated = occurrenceCount >= OCCURRENCE_ESCALATION_THRESHOLD;
        finalStatus = isEscalated ? 'escalated' : 'active';

        const updatedBlock = `### ❌ [${timestamp}] ${filePath} \`source: ${source}\`\n` +
          `**Symptom:** ${options?.symptom || 'Verification Gate / Linting Rejected'}\n` +
          `**EVIDENCE (Machine-Copied Fact):**\n\`\`\`\n${lintEvidence.trim()}\n\`\`\`\n` +
          `**DIAGNOSIS:** ${extracted.diagnosis}\n` +
          `**CONSTRAINT (Model Generalization):** ${rule}\n` +
          `**FINGERPRINT:** \`${fp}\` (Occurrences: ${occurrenceCount})\n` +
          `**STATUS:** ${isEscalated ? `⚠️ ESCALATED (Threshold of ${OCCURRENCE_ESCALATION_THRESHOLD} recurrences reached. Structural chunking / diff required)` : 'ACTIVE'}\n`;

        updatedContent = pmContent.replace(match[0], updatedBlock);
      } else {
        // NEW ENTRY APPEND
        occurrenceCount = 1;
        isEscalated = false;
        finalStatus = 'active';

        const newEntry = `\n### ❌ [${timestamp}] ${filePath} \`source: ${source}\`\n` +
          `**Symptom:** ${options?.symptom || 'Verification Gate / Linting Rejected'}\n` +
          `**EVIDENCE (Machine-Copied Fact):**\n\`\`\`\n${lintEvidence.trim()}\n\`\`\`\n` +
          `**DIAGNOSIS:** ${extracted.diagnosis}\n` +
          `**CONSTRAINT (Model Generalization):** ${rule}\n` +
          `**FINGERPRINT:** \`${fp}\` (Occurrences: 1)\n` +
          `**STATUS:** ACTIVE\n`;

        updatedContent = pmContent + newEntry;
      }
    } else {
      // SUCCESS ENTRY
      const successEntry = `\n### ✅ [${timestamp}] ${filePath} \`source: ${source}\`\n` +
        `**Symptom:** Successful Verification Pass\n` +
        `**EVIDENCE:** Pattern survived compiler and heuristic gates.\n` +
        `**CONSTRAINT:** ${options?.constraintRule || lintEvidence}\n` +
        `**STATUS:** CLEAN_VERIFIED\n`;

      updatedContent = pmContent + successEntry;
    }

    let retries = 5;
    while (retries > 0) {
      const hash = await computeSHA256(updatedContent);

      try {
        await commitFileUpdate(
          repo,
          pmPath,
          updatedContent,
          pmSha,
          token,
          `EMG [${source}]: ${type === 'Failure' ? `Updated post-mortem (${finalStatus}, count: ${occurrenceCount})` : 'Logged clean post-mortem'} for ${filePath}`,
          branch
        );
        return {
          content: updatedContent,
          hash,
          isEscalated,
          occurrenceCount,
          status: finalStatus,
          fingerprint: fp,
        };
      } catch (commitErr: any) {
        if (commitErr.message && commitErr.message.includes('409') && retries > 1) {
          retries--;
          try {
            const reFetch = await fetchFileContent(repo, pmPath, token, branch);
            pmContent = reFetch.content;
            pmSha = reFetch.sha;
          } catch {}
          await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
          continue;
        }
        throw commitErr;
      }
    }

    throw new Error('Failed to write postmortem: Max retries exceeded on 409 Conflict.');
  };

  const op = writeQueue.then(() => executeWrite()).catch(() => executeWrite());
  writeQueue = op;
  return op;
}
