const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /3\. \$\{\s*isMarkdown\s*\?\s*'Output the complete optimized markdown between @@@START and @@@END.'\s*:\s*'Output raw executable source code ONLY between delimiters @@@START and @@@END. Do NOT include markdown code fences \(like ```javascript\) inside @@@START and @@@END. Do NOT output conversational or introductory text.'\s*\}/g;

const replace = "3. Do NOT rewrite the entire file. Generate a strict Unified Diff format containing ONLY your changes.\\n4. Output the unified diff ONLY between delimiters @@@START and @@@END. Do NOT include markdown code fences (like ```diff) inside the delimiters. Do NOT output conversational text.";

content = content.replace(regex, replace);

// replace 4. Output a 1-sentence summary with 5.
content = content.replace("4. Output a 1-sentence summary", "5. Output a 1-sentence summary");

fs.writeFileSync('server.ts', content);
console.log('patched');
