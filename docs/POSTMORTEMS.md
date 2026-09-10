# Neural Engine Post-Mortems

## Auto-Generated Lessons & Negative Constraints

### ❌ [2026-09-10] PREDICTIONS.md `source: mutation-cycle`
**Symptom:** Active Linter / Compiler Gate Rejection on LLM Output (Option B)
**EVIDENCE (Machine-Copied Fact):**
```
[LINT REJECT: NO_UNVERIFIABLE_SELF_PRAISE] Detected unsubstantiated self-description in commentary: "hardened". Output must adhere to neutral, factual documentation without marketing adjectives.
```
**CONSTRAINT (Model Generalization):** Never repeat code patterns that produce this compiler/linter error on PREDICTIONS.md.

### ❌ [2026-09-10] server.ts `source: mutation-cycle`
**Symptom:** AST / TypeScript Compiler Validation Rejected
**EVIDENCE (Machine-Copied Fact):**
```
Line 406, Col 54: Unterminated string literal.
```
**CONSTRAINT (Model Generalization):** Never repeat code patterns that produce this compiler/linter error on server.ts.

### ❌ [2026-09-10] src/App.tsx `source: mutation-cycle`
**Symptom:** AST / TypeScript Compiler Validation Rejected
**EVIDENCE (Machine-Copied Fact):**
```
Line 803, Col 162: Unterminated template literal.
```
**CONSTRAINT (Model Generalization):** Never repeat code patterns that produce this compiler/linter error on src/App.tsx.

### ❌ [2026-09-10] src/components/ConfigPanel.tsx `source: mutation-cycle`
**Symptom:** AST / TypeScript Compiler Validation Rejected
**EVIDENCE (Machine-Copied Fact):**
```
Line 676, Col 18: '/' expected.
Line 672, Col 12: JSX element 'div' has no corresponding closing tag.
Line 676, Col 18: '</' expected.
Line 671, Col 10: JSX element 'div' has no corresponding closing tag.
Line 191, Col 8: JSX element 'div' has no corresponding closing tag.
Line 157, Col 6: JSX element 'div' has no corresponding closing tag.
```
**CONSTRAINT (Model Generalization):** Never repeat code patterns that produce this compiler/linter error on src/components/ConfigPanel.tsx.

### ❌ [2026-09-10] src/components/Header.tsx `source: mutation-cycle`
**Symptom:** AST / TypeScript Compiler Validation Rejected
**EVIDENCE (Machine-Copied Fact):**
```
Line 40, Col 8: Property declaration is missing its type annotation.
```
**CONSTRAINT (Model Generalization):** Never repeat code patterns that produce this compiler/linter error on src/components/Header.tsx.

### ❌ [2026-09-10] src/components/OracleModal.tsx `source: mutation-cycle`
**Symptom:** Active Linter / Compiler Gate Rejection on LLM Output (Option B)
**EVIDENCE (Machine-Copied Fact):**
```
[LINT REJECT: NO_STALE_DEFECT_CLAIMS] Detected stale defect claim or test scaffolding leaked into production code: "PREDICTION: PASSES". File documentation must reconcile with the actual fixed implementation.
```
**CONSTRAINT (Model Generalization):** Do NOT leak test fixture scaffolding, prediction tags, or obsolete defect descriptions into candidate file docstrings. Code documentation must describe the current, reconciled implementation only.

### ❌ [2026-09-10] src/utils/postmortem.ts `source: mutation-cycle`
**Symptom:** Active Linter / Compiler Gate Rejection on LLM Output (Option B)
**EVIDENCE (Machine-Copied Fact):**
```
[LINT REJECT: NO_UNVERIFIABLE_SELF_PRAISE] Detected unsubstantiated self-description in commentary: "Hardened". Output must adhere to neutral, factual documentation without marketing adjectives.
```
**CONSTRAINT (Model Generalization):** Never repeat code patterns that produce this compiler/linter error on src/utils/postmortem.ts.

### ❌ [2026-09-10] src/utils/sanitizer.ts `source: mutation-cycle`
**Symptom:** AST / TypeScript Compiler Validation Rejected
**EVIDENCE (Machine-Copied Fact):**
```
Line 139, Col 26: Unterminated string literal.
```
**CONSTRAINT (Model Generalization):** Never repeat code patterns that produce this compiler/linter error on src/utils/sanitizer.ts.
