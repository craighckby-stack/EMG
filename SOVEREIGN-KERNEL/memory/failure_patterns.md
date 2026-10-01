# STUDIO_ATTACHMENT_WRONG.md — EMG Failure & Recovery Ledger

Paired failure and recovery commits categorized by error class and preventative rules.

## FAILURE: rag_diag_cnosp7 | FIX: fix_rag_diag_cnosp7
- Error Class: NOVEL_LLM_DIAGNOSIS
- File: src/App.tsx
- Rule to Avoid: <One imperative, testable instruction that future prompts must follow to avoid this specific error>
- Diagnosis: <Specific generation mechanism that caused failure — name the technical mechanism, not the symptom>

### Failure Diff
```typescript
Line 1, Col 1: Header Stripped: Original file contained 11 import statements, but candidate contains zero imports. Module imports and file headers were wiped out.
Line 1, Col 1: License Header Stripped: Original file contained a copyright or license header, but candidate removed it. License headers
```

---
