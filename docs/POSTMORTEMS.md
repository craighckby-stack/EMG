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
