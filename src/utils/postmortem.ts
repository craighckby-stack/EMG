import { fetchFileContent, commitFileUpdate } from './github';

export async function writePostmortem(
  repo: string,
  filePath: string,
  type: 'Success' | 'Failure',
  lintEvidence: string,
  token: string,
  branch?: string
): Promise<void> {
  const pmPath = 'docs/POSTMORTEMS.md';
  let pmContent = '';
  let pmSha = '';

  try {
    const fileData = await fetchFileContent(repo, pmPath, token, branch);
    pmContent = fileData.content;
    pmSha = fileData.sha;
  } catch (e) {
    // File doesn't exist, start fresh
    pmContent = '# Neural Engine Post-Mortems\n\n## Auto-Generated Lessons\n';
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const flag = type === 'Success' ? '✅' : '❌';
  const tag = '`unverified`'; // Always unverified until a real compiler or human verifies
  
  let newEntry = `\n### ${flag} [${timestamp}] ${filePath} ${tag}\n`;
  if (type === 'Failure') {
    newEntry += `**Symptom:** Heuristic Linting Failed\n`;
    newEntry += `**Lint Evidence:**\n\`\`\`\n${lintEvidence}\n\`\`\`\n`;
    newEntry += `**Rule produced:** Do not repeat the pattern that caused this lint error.\n`;
  } else {
    newEntry += `**Symptom:** Successful Neural Mutation (Heuristic Pass)\n`;
    newEntry += `**Lint Evidence:** Pattern survived heuristic linting.\n`;
    newEntry += `**Rule produced:** ${lintEvidence}\n`;
  }

  const updatedContent = pmContent + newEntry;

  await commitFileUpdate(
    repo,
    pmPath,
    updatedContent,
    pmSha,
    token,
    `EMG Core: Auto-logged ${type.toLowerCase()} post-mortem for ${filePath}`,
    branch
  );
}
