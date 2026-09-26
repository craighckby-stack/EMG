# Neural Engine Post-Mortems

## Auto-Generated Lessons & Negative Constraints


### ❌ [2026-09-26] app/applet/src/engine/siphon-stamping.ts `source: mutation-cycle`
**Symptom:** AST / TypeScript Compiler Validation Rejected
**EVIDENCE (Machine-Copied Fact):**
```
Line 110, Col 4: Expression expected.
```
**DIAGNOSIS:** Unescaped markdown content leakage from prompt injection into raw TypeScript source code interpretation channels.
**CONSTRAINT (Model Generalization):** Ensure that system outputs match the exact requested format constraints without embedding external instruction text.
**FINGERPRINT:** `app/applet/src/engine/siphon-stamping.ts::Line _, Col _: Expression expected.` (Occurrences: 1)
**STATUS:** ACTIVE
