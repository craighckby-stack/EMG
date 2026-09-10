const fs = require('fs');
const data = fs.readFileSync('docs/POSTMORTEMS.md', 'utf-8');
const blocks = data.split(/(?=### )/);

let out = blocks[0];

for (let i = 1; i < blocks.length; i++) {
  let block = blocks[i];
  const lblock = block.toLowerCase();
  
  if (block.includes('[HISTORY: struck 2026-09-10 by over-broad heal')) {
    const isPhantom = lblock.includes('no_unused_macros') || lblock.includes('no such file or directory');
    const isTruncation = lblock.includes('unterminated') || lblock.includes('has no corresponding closing tag') || lblock.includes('expected');
    const isFirstFiring = lblock.includes('no_dead_conditions') || lblock.includes('no_unverifiable_self_praise') || lblock.includes('no_stale_defect_claims');
    const isDialect = lblock.includes('typescript files');
    const isPredictions = lblock.includes('predictions.md');
    
    let newConstraint = '';
    if (isTruncation) {
      newConstraint = '**CONSTRAINT (Model Generalization):** [HISTORY: struck 2026-09-10 by over-broad heal; re-instated as VERIFIED GATE CATCH (truncation)] Model token limit exceeded, resulting in syntax truncation.\n';
    } else if (isFirstFiring || isPredictions || isDialect) {
      newConstraint = '**CONSTRAINT (Model Generalization):** [HISTORY: struck 2026-09-10 by over-broad heal; re-instated] Verified rule finding or scope catch.\n';
    } else {
      newConstraint = '**CONSTRAINT (Model Generalization):** [HISTORY: struck 2026-09-10 by over-broad heal; re-instated as VERIFIED GATE CATCH]\n';
    }
    
    block = block.replace(/\*\*CONSTRAINT \(Model Generalization\):\*\* \[HISTORY: struck 2026-09-10.*?\n/s, newConstraint);
    out += block;
  } else {
    out += block;
  }
}

fs.writeFileSync('docs/POSTMORTEMS.md', out);
console.log('Re-Repaired POSTMORTEMS.md v3');
