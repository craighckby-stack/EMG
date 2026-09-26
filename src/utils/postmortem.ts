import { fetchFileContent, commitFileUpdate } from './github';

export async function computeSHA256(str: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for non-subtle crypto environments
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
  status: 'active' | 'struck' | 'escalated';
  fingerprint: string;
}

/**
 * Normalizes error messages by stripping volatile line/column numbers, timestamps,
 * and hashes to create a stable error signature for deduplication.
 */
export function fingerprintError(file: string, evidence: string): string {
  const normalized = evidence
    .replace(/Line \d+, Col \d+/gi, "Line _, Col _")
    .replace(/:\d+:\d+/g, ":_:_")
    .replace(/line \d+/gi, "line _")
    .replace(/0x[0-9a-fA-F]+/g, "0x_")
    .replace(/\s+/g, " ")
    .trim();
  return `${file}::${normalized}`;
}

const OCCURRENCE_ESCALATION_THRESHOLD = 3;

export function classifyEntry(priorCount: number): 'active' | 'escalated' {
  return priorCount + 1 >= OCCURRENCE_ESCALATION_THRESHOLD ? 'escalated' : 'active';
}

/**
 * Extracts specific diagnosis and corrective rules from compiler evidence,
 * strictly banning generic restatement templates.
 */
export function deriveConstraintFromEvidence(
  evidence: string,
  filePath: string
): { diagnosis: string; correctivePattern: string } {
  const evLower = evidence.toLowerCase();

  // 1. Refuse to log isolation-caused dependency errors
  if (
    evLower.includes('no such file or directory') ||
    evLower.includes('undeclared') ||
    evLower.includes('unknown type name') ||
    evLower.includes('implicit declaration')
  ) {
    return {
      diagnosis: 'Isolated compilation unit missing required dependencies or header declarations.',
      correctivePattern: '[MANUAL_OVERRIDE] Isolated compilation context missing dependencies. Ignoring error.',
    };
  }

  // 2. Token Limit & Truncation Errors
  if (
    evLower.includes('truncated') ||
    evLower.includes('output token limit') ||
    evLower.includes('unterminated string') ||
    evLower.includes('unterminated template') ||
    evLower.includes('unexpected end of input') ||
    evLower.includes('syntax_unclosed') ||
    evLower.includes("'} expected'")
  ) {
    return {
      diagnosis: `Model generation exceeded output token budget for ${filePath}, resulting in syntax truncation mid-file before EOF.`,
      correctivePattern: `Target file ${filePath} is too large for single-pass generation. Refactor file into smaller sub-modules or apply targeted diff patches instead of full-file re-generation.`,
    };
  }

  // 3. Self-Praising Marketing Language
  if (
    evLower.includes('self-praise') ||
    evLower.includes('unverifiable claim') ||
    evLower.includes('hardened') ||
    evLower.includes('production-grade') ||
    evLower.includes('leak-free') ||
    evLower.includes('fully optimized')
  ) {
    return {
      diagnosis: 'Model inserted promotional adjectives or unverifiable subjective claims into code comments/documentation.',
      correctivePattern: 'Do NOT emit self-praising or unverifiable claims in comments or documentation (e.g. "Fully optimized", "Hardened", "Leak-free"). Maintain neutral, factual technical descriptions.',
    };
  }

  // 4. Missing Property / Variable Type Annotations
  if (
    evLower.includes('missing property type') ||
    evLower.includes('type expected') ||
    evLower.includes('property declaration is missing') ||
    evLower.includes('invalid_type_annotation')
  ) {
    return {
      diagnosis: `Explicit type annotation omitted from class property or variable declaration in ${filePath}.`,
      correctivePattern: `Always specify explicit TypeScript type annotations on class property declarations and variable bindings in ${filePath}.`,
    };
  }

  // 5. C++ Keywords in Pure C Files
  if (evLower.includes('noexcept') || evLower.includes("expected ';' after top level declarator")) {
    return {
      diagnosis: 'Model emitted C++ specific keywords (noexcept, constexpr) inside a pure C translation unit.',
      correctivePattern: 'Do NOT emit C++ keywords (e.g. noexcept, constexpr) in pure C translation units.',
    };
  }

  // 6. Redundant Guards & Inner Loop Bounds
  if (evLower.includes('dead condition') || evLower.includes('len > 0')) {
    return {
      diagnosis: 'Redundant inner bounds check inserted inside an already bounded loop construct.',
      correctivePattern: 'Do NOT emit redundant inner bounds guards when loop condition already bounds iteration (e.g. len > 0 inside i < len).',
    };
  }

  // 7. Unused Macros
  if (evLower.includes('unused macro') || evLower.includes('wp_nonnull')) {
    return {
      diagnosis: 'Helper macro defined without any corresponding invocations in the translation unit.',
      correctivePattern: 'Do NOT define helper macros without applying them in active code.',
    };
  }

  // 8. Test Fixture Scaffolding Leaks
  if (evLower.includes('stale_defect') || evLower.includes('seeded defect') || evLower.includes('scaffolding')) {
    return {
      diagnosis: 'Obsolete test fixture scaffolding or defect tags leaked into generated docstrings.',
      correctivePattern: 'Do NOT leak test fixture scaffolding, prediction tags, or obsolete defect descriptions into candidate file docstrings.',
    };
  }

  // 9. Saturation & Over-Optimization
  if (evLower.includes('saturation') || evLower.includes('over-optimization') || evLower.includes('post-halt') || evLower.includes('converged')) {
    return {
      diagnosis: 'Unnecessary artificial refactorings applied to code that has already converged.',
      correctivePattern: 'Do NOT invent artificial refactorings or redundant checks when code has converged. Respect global saturation.',
    };
  }

  // 10. Default Specific Diagnosis (Explicitly Banning Generic "Never repeat..." Template!)
  const firstErrorLine = evidence.trim().split('\n')[0] || 'Syntax verification failure';
  return {
    diagnosis: `AST/Compiler verification rejected ${filePath}: ${firstErrorLine}`,
    correctivePattern: `When mutating ${filePath}, strictly satisfy AST parser constraints for ${firstErrorLine}. Ensure all syntax structures, delimiters, and type bindings are valid.`,
  };
}

export async function extractDiagnosis(
  file: string,
  evidence: string
): Promise<{ diagnosis: string; correctivePattern: string }> {
  return deriveConstraintFromEvidence(evidence, file);
}

let writeQueue: Promise<any> = Promise.resolve();

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
): Promise<{ content: string; hash: string }> {
  const executeWrite = async () => {
    const pmPath = 'docs/POSTMORTEMS.md';
    const timestamp = new Date().toISOString().split('T')[0];
    const flag = type === 'Success' ? '✅' : '❌';
    const source = options?.source || 'mutation-cycle';
    const tag = `\`source: ${source}\``;
    const fp = fingerprintError(filePath, lintEvidence);

    let pmContent = '';
    let pmSha = '';

    try {
      const fileData = await fetchFileContent(repo, pmPath, token, branch);
      pmContent = fileData.content;
      pmSha = fileData.sha;
    } catch (e) {
      pmContent = '# Neural Engine Post-Mortems\n\n## Auto-Generated Lessons & Negative Constraints\n';
    }

    // Count existing occurrences of this fingerprint in postmortems
    const occurrencesInLog = (pmContent.match(new RegExp(fp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const occurrenceCount = occurrencesInLog + 1;
    const status = classifyEntry(occurrencesInLog);

    let newEntry = `\n### ${flag} [${timestamp}] ${filePath} ${tag}\n`;
    if (type === 'Failure') {
      const derived = deriveConstraintFromEvidence(lintEvidence, filePath);
      const rule = options?.constraintRule || derived.correctivePattern;

      newEntry += `**Symptom:** ${options?.symptom || 'Verification Gate / Linting Rejected'}\n`;
      newEntry += `**EVIDENCE (Machine-Copied Fact):**\n\`\`\`\n${lintEvidence.trim()}\n\`\`\`\n`;
      newEntry += `**DIAGNOSIS:** ${derived.diagnosis}\n`;
      newEntry += `**CONSTRAINT (Model Generalization):** ${rule}\n`;
      newEntry += `**FINGERPRINT:** \`${fp}\` (Occurrences: ${occurrenceCount})\n`;
      if (status === 'escalated') {
        newEntry += `**STATUS:** ⚠️ ESCALATED (Threshold of ${OCCURRENCE_ESCALATION_THRESHOLD} recurrences reached. Structural chunking / diff required)\n`;
      } else {
        newEntry += `**STATUS:** ACTIVE\n`;
      }
    } else {
      newEntry += `**Symptom:** Successful Verification Pass\n`;
      newEntry += `**EVIDENCE:** Pattern survived compiler and heuristic gates.\n`;
      newEntry += `**CONSTRAINT:** ${options?.constraintRule || lintEvidence}\n`;
      newEntry += `**STATUS:** CLEAN_VERIFIED\n`;
    }

    let retries = 5;
    while (retries > 0) {
      const updatedContent = pmContent + newEntry;
      const hash = await computeSHA256(updatedContent);

      try {
        await commitFileUpdate(
          repo,
          pmPath,
          updatedContent,
          pmSha,
          token,
          `EMG [${source}]: Auto-logged ${type.toLowerCase()} post-mortem for ${filePath} (${status})`,
          branch
        );
        return { content: updatedContent, hash };
      } catch (commitErr: any) {
        if (commitErr.message && commitErr.message.includes('409') && retries > 1) {
          retries--;
          // Refetch latest content on conflict
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
