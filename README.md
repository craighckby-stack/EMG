# EMG Core: Closed-Loop Neural Optimization & Verification Engine

EMG Core is an autonomous, verification-gated neural code refactoring engine. Powered by Google Gemini models, it performs closed-loop code optimization across multi-file repositories with **real compiler gates**, **autonomous memory write-back**, **SHA-256 hash tracking**, and **deterministic self-halting**.

---

## 🏗️ Core Architecture & The Verification Loop

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      EMG Core Loop                          │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                 1. Read Repository Tree
                 2. Ingest POSTMORTEMS.md (SHA-256)
                                │
                 3. Neural Mutation (Gemini)
                                │
     ┌──────────────────────────┴──────────────────────────┐
     ▼                                                     ▼
Tier 1: AST & Type Diagnostics           Tier 2: External Compiler / Linter
(TS Diagnostic / Balanced Scanner)       (GCC 13.2 via Godbolt / Output Rules)
     │                                                     │
     ├──────────────────────────┬──────────────────────────┤
     │ Fails Validation         │ Passes Validation        │
     ▼                          ▼                          │
[MEMORY WRITE-BACK]             [IDEMPOTENCY CHECK]        │
Auto-commit failure evidence    0 diffs?                   │
& negative rule to              ├── YES: [SATURATION HALT] │
docs/POSTMORTEMS.md             └── NO:  Commit to Repo    │
(Triggers SHA-256 Invalidation)                            │
     │                                                     │
     └──────────────────────────┬──────────────────────────┘
                                │
                    Re-arm candidate files
```

---

## ⚡ The 5 Foundational Capabilities

### 1. External Verification Gates (`REJECT`)
Mutations are never trusted blindly:
* **C/C++ Translation Units:** Tested against a real GCC 13.2 compiler via the Godbolt API. Rejects invalid keywords (e.g. `noexcept` in C), missing system headers (`<stddef.h>`), or syntax bugs with verbatim machine `stderr`.
* **TypeScript/JavaScript:** Checked via authoritative TypeScript compiler diagnostics.
* **Output Linter Rules:** Enforces strict anti-hallucination standards:
  * `NO_UNVERIFIABLE_SELF_PRAISE`: Blocks unsubstantiated adjectives (`"Fully optimized"`, `"Hardened"`).
  * `NO_STALE_DEFECT_CLAIMS`: Rejects leaked lab predictions or docstrings claiming bugs that the code already fixed.
  * `NO_DEAD_CONDITIONS`: Catches redundant inner guards inside bounded loops.
  * `TODO_ADJACENT_SUCCESS`: Prohibits placeholder TODOs right before success return statements.

### 2. Autonomous Memory Write-Back (`LEARN`)
When a mutation fails any gate, EMG Core autonomously writes back its own scar tissue:
* **Separation of Concerns:** Separates machine-copied facts (`EVIDENCE`) from derived negative rules (`CONSTRAINT`).
* **Provenance Tagging:** Automatically tags the failure origin (`source: mutation-cycle` vs `source: oracle-harness`).
* **Direct Repository Commit:** Commits the post-mortem directly to `docs/POSTMORTEMS.md` on the target branch.

### 3. Dynamic Hash Tracking & Re-Arming (`REMEMBER`)
* Computes the cryptographic **`SHA-256`** digest of `docs/POSTMORTEMS.md` on every cycle.
* When a change is detected (whether auto-written by the engine or hand-edited by an engineer on GitHub), the engine logs:
  `[LEARNING] Detected updated docs/POSTMORTEMS.md (SHA-256: ...). Ingesting updated negative constraints and re-arming prompt memory.`
* Instantly invalidates the skip list so candidate files are re-evaluated against the new constraints.

### 4. Deterministic Global Saturation (`STOP`)
* Calculates file-by-file diffs against repository baselines.
* When all candidate files achieve zero diffs under current constraints, the engine triggers `[GLOBAL SATURATION REACHED]` and cleanly halts, preventing infinite loop churn.

### 5. Permanent Apparatus Protection (PM#9)
* Hard-locks evaluation fixtures and scorecards (`BUGS.md`, `README.md`, `docs/POSTMORTEMS.md`) into a permanent skip-list to prevent the examinee from wordsmithing the exam.

---

## 🧪 Oracle Stress-Test Mode (Option A)

The UI includes a dedicated **Oracle Harness** in the top navigation bar. This enables engineers to bypass the LLM entirely and inject raw defective specimens directly into the GCC compiler and output linting gate to verify gate behavior and memory write-back under unit-test conditions.

---

## 🚀 Live Preview & Usage

You can run the engine directly in your browser:

**[Launch EMG Core Preview](https://ai.studio/apps/c7006db0-163f-48a6-bc9e-dfdac7b37ff0)**

1. **Sandbox Mode:** Toggle "Sandbox Mode" to run optimization cycles against simulated test suites without credentials.
2. **Live GitHub Repositories:** Enter your GitHub PAT and target repository (`owner/repo`) with a dedicated branch.
3. Click **Run Single Cycle** or **Toggle Live Optimization** to observe closed-loop mutation, verification, and autonomous learning.
