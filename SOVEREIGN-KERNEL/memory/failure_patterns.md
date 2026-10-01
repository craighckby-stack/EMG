# STUDIO_ATTACHMENT_WRONG.md — EMG Failure & Recovery Ledger

Paired failure and recovery commits categorized by error class and preventative rules.

## FAILURE: rag_diag_42uqcg | FIX: fix_rag_diag_42uqcg
- Error Class: NOVEL_LLM_DIAGNOSIS
- File: agi_alignment_system.py
- Rule to Avoid: <One imperative, testable instruction that future prompts must follow to avoid this specific error>
- Diagnosis: <Specific generation mechanism that caused failure — name the technical mechanism, not the symptom>

### Failure Diff
```typescript
Line 929, Col 1: Python Verification Error: positional argument follows keyword argument
```

---
