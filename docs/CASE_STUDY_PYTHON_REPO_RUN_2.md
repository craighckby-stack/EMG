# Case Study #2: Autonomous Evolution Run on `craighckby-stack/Python`
**Deep-Dive Forensic Audit & Factual Post-Mortem**

* **Target Repository:** [`https://github.com/craighckby-stack/Python`](https://github.com/craighckby-stack/Python) (Fork of *TheAlgorithms/Python*)  
* **Target Codebase:** High-performance, open-source Python algorithms (35,000+ stars, 1,000+ files)  
* **Execution Environment:** Autonomous Remote Git Execution via EMG Core v49.2  
* **Model:** Free-Tier Gemini Flash  
* **Date of Run:** September 27, 2026  
* **Audit Scope:** All 100 commits generated during Run #2  

---

## 1. Executive Verdict & Truth Matrix

A comprehensive, line-by-line inspection of raw commit patches and raw GitHub files reveals a severe contrast: **while the non-code file filter and mathematical refactoring logic showed strong progress, a catastrophic output-sanitization flaw introduced invalid syntax (`@@@`) across multiple files, while server-side validation was silently bypassed for Python.**

| Evaluation Metric | Factual Status | Detailed Finding |
| :--- | :--- | :--- |
| **Python Executability** | ❌ **FAILED (Fatal)** | Trailing `@@@` delimiters leaked into committed files, rendering code unrunnable via `python3` or `pytest`. |
| **Python Syntax Validation** | ❌ **BYPASSED** | `/api/validate` only executed on TS/JS files; returned a dummy `valid: true` for all Python files. |
| **File Filter Accuracy** | ✅ **100% PASSED** | Zero `.md`, `.rst`, or documentation files touched. Completely solved the Run #1 flaw. |
| **Algorithmic Transformations** | ⚠️ **COMPROMISED** | Solid mathematical reasoning (`pow(i, i, mod)`, `math.comb`) undermined by trailing delimiter syntax errors. |
| **Git Log Hygiene** | ❌ **POOR (75% Noise)** | 75 out of 100 commits were micro-commits to `SOVEREIGN-KERNEL/` (3 RAG commits per 1 refactor). |
| **RAG Remote Sync** | ⚠️ **FUNCTIONAL BUT UNBATCHED** | Knowledge vectors persisted remotely to GitHub, but lacked commit batching. |
| **Overall Factual Rating** | **4.2 / 10** | High-level algorithmic intent ruined by lack of Python AST enforcement and string delimiter leakage. |

---

## 2. Fatal Defect #1: The `@@@` Delimiter Leak (`SyntaxError`)

### The Evidence
Direct HTTP inspection of raw files committed to GitHub reveals that multiple files end with raw delimiter characters:

* **`project_euler/problem_052/sol1.py` (Commit `6656cb8`):**
  ```python
  if __name__ == "__main__":
      print(solution())@@@
  ```
* **`project_euler/problem_054/sol1.py` (Commit `b73f025`):**
  ```python
  if __name__ == "__main__":
      solution()@@@
  ```
* **Also verified across:** `0c63da1` (Problem 51), `4af9f97` (Problem 50), `ce05df7` (Problem 49), `7da25c4` (Problem 48), `3cad3ea` (Problem 47), `59d69c9` (Problem 46), `571cc5e` (Problem 45), `dd9e606` (Problem 44), `b709a65` (Problem 43), `d75f51a` (Problem 42), `3263a02` (Problem 41), `d2e05d1` (Problem 40).

### Computational Impact
In Python grammar, `@` is reserved exclusively for function/class decorators. When placed at EOF or after an expression without a decorator identifier, the Python interpreter immediately halts with:
```text
SyntaxError: invalid syntax
```
**Every single one of these files is broken and fails basic import or execution tests.**

### Root Cause Analysis
In `server.ts`, the model prompt enforces explicit protocol fences:
```text
@@@START
[source code]
@@@END
@@@SUMMARY:
[summary text]
```
When Gemini Flash generated `[source code]@@@\n@@@SUMMARY:`, the regex parser stripped `@@@SUMMARY:...`, but retained the preceding `@@@` as part of the extracted file content. Because the output string was not strictly sanitized or trimmed of delimiters, the raw marker was committed to the repository.

---

## 3. Fatal Defect #2: Python Validation Was Completely Bypassed

### The Code in `server.ts`:
```typescript
app.post('/api/validate', (req, res) => {
  const { code, filePath } = req.body;
  const fileName = filePath || 'source.tsx';
  const isTs = /\.(ts|tsx)$/i.test(fileName);
  const isJs = /\.(js|jsx|mjs|cjs)$/i.test(fileName);

  if (!isTs && !isJs) {
    return res.json({ valid: true, diagnostics: [] });
  }
  // TypeScript transpile & AST check only...
```

### The Factual Reality
* While the UI frontend logged `[TYPE-SAFE] AST syntax verified`, **no Python validation actually occurred**.
* Any non-TypeScript/non-JavaScript file automatically received `{ valid: true, diagnostics: [] }`.
* As a result, code with glaring syntax errors (`@@@`) sailed straight past the gatekeeper and was pushed directly to the `master` branch.

---

## 4. Git History Pollution: 75% RAG Noise

An analysis of the latest 100 commits on `craighckby-stack/Python` reveals the following breakdown:

```text
Total Commits: 100
├── Python Refactors: 25 commits (25%)
└── RAG Metadata Commits: 75 commits (75%)
    ├── "EMG [RAG]: Synchronized vector database" (25 commits)
    ├── "EMG [RAG]: Updated clean pattern vectors" (25 commits)
    └── "EMG [RAG]: Updated failure & recovery vectors" (25 commits)
```

### The Problem
For every single `.py` file refactor, EMG fired **three separate GitHub API commit requests**:
1. Commit 1: `clean_patterns.jsonl`
2. Commit 2: `failures.jsonl`
3. Commit 3: `vectors.jsonl`

This flooded the repository's git commit log. In professional open-source engineering, committing vector database state 3 times per code edit is unacceptable git hygiene. RAG state synchronization must either be batched at the conclusion of a session or stored on an orphaned metadata branch (e.g. `emg-memory`).

---

## 5. Algorithmic Analysis: The Good and the Questionable

### What Went Right (Algorithmic Logic)
When ignoring the syntax-breaking `@@@` suffix, several algorithmic improvements showed strong computer science fundamentals:

1. **Modular Exponentiation (`7da25c4` — Problem 48):**
   * *Before:* Computed `total += i**i` where $1000^{1000}$ creates a 3,001-digit integer in memory.
   * *After:* Replaced with Python's three-argument `pow(i, i, mod)`, reducing intermediate space from $O(\text{digits})$ to $O(1)$ and execution time to $O(\log i)$.
2. **Combinatorics Optimization (`9fa607f` — Problem 53):**
   * *Before:* Three distinct factorial calculations and unsafe float division `/`.
   * *After:* Standardized on C-accelerated `math.comb(n, r)` with $O(1)$ boundary protection (`if r < 0 or r > n: return 0`).

### Questionable Engineering Smells
1. **Excessive Memory Allocation (`3cad3ea` — Problem 47):**
   * Annotated `upf_len()` with `@lru_cache(maxsize=1048576)`. Allocating over 1 million cache slots consumes significant RAM and risks Out-Of-Memory (OOM) errors in resource-constrained environments.
2. **Silent Failure on Missing Dependencies (`d75f51a` — Problem 42):**
   * In `solution42.py`, EMG inserted:
     ```python
     if not os.path.exists(words_file_path):
         return 0
     ```
     Returning `0` when a required data file is missing masks configuration bugs and causes unit tests to fail with false calculation results rather than cleanly raising `FileNotFoundError`.
3. **Arbitrary Loop Caps with Unhandled Exceptions (`6656cb8` — Problem 52):**
   * Injected `MAX_SEARCH_LIMIT = 10_000_000` and `raise ValueError("Solution exceeded the maximum search limit safely.")`. Project Euler test harnesses expect exact numeric returns; raising an unexpected `ValueError` breaks test compatibility.

---

## 6. Full Remediation Checklist (Required Actions)

To transition EMG from a prototype to a reliable autonomous system, the following fixes are strictly required:

- [ ] **1. Cleanse Output Delimiters:**
  Update the code extractor in `server.ts` and `src/utils/sanitizer.ts` with a regex to strip all variations of `@+`, `@@@START`, and `@@@END` from the end of parsed code:
  ```typescript
  code = code.replace(/@+\s*$/, '').trim();
  ```
- [ ] **2. Real Python Syntax Verification Gate:**
  Implement real Python syntax validation in `/api/validate` (either via an embedded Python parser, WASM Python, or a Node-based Python AST linter). Reject any code that does not compile cleanly.
- [ ] **3. Batch RAG Commits:**
  Stop committing RAG files on every iteration. Accumulate vector mutations in memory and persist them in a single batch commit upon session completion, or isolate them to an independent `emg/memory` branch.
- [ ] **4. Git History Cleanup:**
  Reset the `craighckby-stack/Python` repository back to clean upstream using GitHub's **"Discard commits"** feature before running again.
