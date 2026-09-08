import { fetchFileContent, commitFileUpdate } from './github';

export function computeStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export type PostmortemSource = 'oracle-harness' | 'mutation-cycle';

export async function writePostmortem(
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
  const pmPath = 'docs/POSTMORTEMS.md';
  let pmContent = '';
  let pmSha = '';

  try {
    const fileData = await fetchFileContent(repo, pmPath, token, branch);
    pmContent = fileData.content;
    pmSha = fileData.sha;
  } catch (e) {
    // File doesn't exist, start fresh
    pmContent = '# Neural Engine Post-Mortems\n\n## Auto-Generated Lessons & Negative Constraints\n';
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const flag = type === 'Success' ? '✅' : '❌';
  const source = options?.source || 'mutation-cycle';
  const tag = `\`source: ${source}\``;
  
  let newEntry = `\n### ${flag} [${timestamp}] ${filePath} ${tag}\n`;
  if (type === 'Failure') {
    newEntry += `**Symptom:** ${options?.symptom || 'Verification Gate / Linting Rejected'}\n`;
    newEntry += `**EVIDENCE (Machine-Copied Fact):**\n\`\`\`\n${lintEvidence.trim()}\n\`\`\`\n`;
    const rule = options?.constraintRule || deriveConstraintFromEvidence(lintEvidence, filePath);
    newEntry += `**CONSTRAINT (Model Generalization):** ${rule}\n`;
  } else {
    newEntry += `**Symptom:** Successful Verification Pass\n`;
    newEntry += `**EVIDENCE:** Pattern survived compiler and heuristic gates.\n`;
    newEntry += `**CONSTRAINT:** ${options?.constraintRule || lintEvidence}\n`;
  }

  const updatedContent = pmContent + newEntry;
  const hash = computeStringHash(updatedContent);

  await commitFileUpdate(
    repo,
    pmPath,
    updatedContent,
    pmSha,
    token,
    `EMG Core [${source}]: Auto-logged ${type.toLowerCase()} post-mortem for ${filePath}`,
    branch
  );

  return { content: updatedContent, hash };
}

function deriveConstraintFromEvidence(evidence: string, filePath: string): string {
  const evLower = evidence.toLowerCase();
  if (evLower.includes('noexcept') || evLower.includes('expected \';\' after top level declarator')) {
    return 'Do NOT emit C++ keywords (e.g. noexcept, constexpr) in pure C translation units.';
  }
  if (evLower.includes('self-praise') || evLower.includes('unverifiable claim')) {
    return 'Do NOT emit self-praising or unverifiable claims in comments or documentation (e.g., "Fully optimized", "Hardened", "Leak-free"). Maintain factual, neutral headers.';
  }
  if (evLower.includes('dead condition') || evLower.includes('len > 0')) {
    return 'Do NOT emit redundant inner bounds guards when loop condition already bounds iteration (e.g. len > 0 inside i < len).';
  }
  if (evLower.includes('unused macro') || evLower.includes('wp_nonnull')) {
    return 'Do NOT define helper macros without applying them in the code.';
  }
  if (evLower.includes('todo') && evLower.includes('success')) {
    return 'Do NOT emit placeholder TODO comments adjacent to success / return statements.';
  }
  return `Never repeat code patterns that produce this compiler/linter error on ${filePath}.`;
}

