# STUDIO_ATTACHMENT_WRONG.md — EMG Failure & Recovery Ledger

Paired failure and recovery commits categorized by error class and preventative rules.

## FAILURE: rag_diag_xc8wdp | FIX: fix_rag_diag_xc8wdp
- Error Class: NOVEL_LLM_DIAGNOSIS
- File: compare.js
- Rule to Avoid: <One imperative, testable instruction that future prompts must follow to avoid this specific error>
- Diagnosis: <Specific generation mechanism that caused failure — name the technical mechanism, not the symptom>

### Failure Diff
```typescript
Line 9, Col 11: 'interface' declarations can only be used in TypeScript files.
Line 17, Col 11: 'interface' declarations can only be used in TypeScript files.
Line 26, Col 11: 'interface' declarations can only be used in TypeScript files.
Line 33, Col 18: 'interface' declarations can only be used in
```

---
