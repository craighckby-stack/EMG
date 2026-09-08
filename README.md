# EMG Core: Closed-Loop, Verification-Gated Code Refactoring

EMG Core is an autonomous, verification-gated code refactoring engine. Powered by Google Gemini models, it performs closed-loop refactoring across multi-file repositories with **real compiler gates**, **autonomous memory write-back**, **SHA-256 hash tracking**, and **automatic self-halting**.

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

## ⚡ The 5 Core Capabilities

### 1. External Verification Gates (`REJECT`)
Mutations are never trusted blindly:
* **C/C++ Translation Units:** Tested against a real GCC 13.2 compiler via the Godbolt API. Rejects invalid keywords (e.g. `noexcept` in C), missing system headers (`<stddef.h>`), or syntax bugs with verbatim machine `stderr`.
  > *Privacy Disclosure:* Code passed to the GCC compiler gate is transmitted over HTTPS to the public [Godbolt Compiler Explorer API](https://godbolt.org). Sensitive internal headers or proprietary tokens should be sanitized or tested with Sandbox/Mock mode.
* **TypeScript/JavaScript:** Checked via compiler diagnostics and AST balanced-bracket verification.
* **Active Output Linter Rules:** Rejects invalid patterns before commit:
  * `NO_UNVERIFIABLE_SELF_PRAISE`: Blocks unsubstantiated adjectives (`"Fully optimized"`, `"Hardened"`).
  * `NO_STALE_DEFECT_CLAIMS`: Rejects leaked lab predictions or docstrings claiming bugs that the code already fixed.
  * `NO_DEAD_CONDITIONS`: Catches redundant inner bounds guards inside bounded loops.
  * `TODO_ADJACENT_SUCCESS`: Prohibits placeholder TODOs adjacent to success return statements.

### 2. Autonomous Memory Write-Back (`LEARN`)
When a mutation fails any gate, EMG Core autonomously writes back its own scar tissue:
* **Separation of Concerns:** Separates machine-copied facts (`EVIDENCE`) from derived negative rules (`CONSTRAINT`).
* **Provenance Tagging:** Automatically tags the failure origin (`source: mutation-cycle` vs `source: oracle-harness`).
* **Direct Repository Commit:** Commits the post-mortem directly to `docs/POSTMORTEMS.md` on the target branch.

### 3. Dynamic Hash Tracking & Re-Arming (`REMEMBER`)
* Computes the cryptographic **`SHA-256`** digest of `docs/POSTMORTEMS.md` on every cycle.
* When a hash mutation is detected (whether auto-written by the engine or hand-edited by an engineer on GitHub), the engine automatically invalidates the skip list and re-arms candidate files with the updated negative constraints.

### 4. Automatic Global Saturation & Re-Run Lockout (`STOP` / PM#11)
* **Deterministic Convergence Detection:** Calculates file-by-file diffs against repository baselines. When all candidate files achieve zero diffs under current constraints, the engine triggers:
  ```text
  [GLOBAL SATURATION REACHED] No remaining diffs under current constraints. The repository is converged — not proven optimal. Re-runs require new input. 🏁
  ```
* **Re-Run Lockout (Anti-Over-Optimization):** Records the baseline tree hash at saturation. Subsequent runs without new repository commits, post-mortem ledger updates, or prompt goal modifications are refused (`[REFUSAL] Repository at saturation...`), permanently preventing post-halt hallucination cascades and fiction-load-bearing commentary.

### 5. Permanent Apparatus Protection (PM#9)
* **Hard-Locked Skip Set:** Evaluation fixtures and scorecards (`BUGS.md`, `README.md`, `docs/POSTMORTEMS.md`) are permanently excluded from mutation candidates:
  ```text
  [SKIP] Protected apparatus fixture: BUGS.md (PM#9: Write-protection active)
  ```
* Verified by artifact in [EMG-Tests](https://github.com/craighckby-stack/EMG-Tests), isolating test apparatus from examinee wordsmithing.

---

## 🔬 Verification & Evidence

Every capability claim above is backed by machine artifacts — verbatim compiler stderr, hash-chain telemetry, and captured halt events — in the validation lab:

**[EMG-Tests](https://github.com/craighckby-stack/EMG-Tests)** — seeded-defect corpus + the engine's own post-mortem ledger, published raw. Claims are reproducible; the ledger is the receipt.

> **Known Frontier (PM#7):** The gate verifies compilation and lint compliance, not semantic intent. Syntactic verification pressure without a semantic contract oracle can select for disguised parameter checks (e.g. `wp_verify_locked_state`). See the test ledger for the documented boundary.

---

## 🧪 Oracle Stress-Test Mode (Option A)

The UI includes a dedicated **Oracle Harness** in the top navigation bar. This enables engineers to bypass LLM generation entirely and inject raw defective specimens directly into the GCC compiler and output linting gate to verify gate behavior and memory write-back under unit-test conditions.

---

## 🚀 Live Preview & Usage

You can run the engine directly in your browser:

**[Launch EMG Core Preview](https://ai.studio/apps/c7006db0-163f-48a6-bc9e-dfdac7b37ff0)**

1. **Sandbox Mode:** Toggle "Sandbox Mode" to run cycles against simulated test suites without credentials.
2. **Live GitHub Repositories:** Enter your GitHub PAT and target repository (`owner/repo`) with a dedicated branch.
   * *Safety Note:* EMG Core commits only to the branch you designate. Always run against an isolated test branch (`test/emg-run`), never directly against `main`.
3. Click **Run Single Cycle** or **Toggle Live Optimization** to observe closed-loop refactoring, verification, and autonomous learning.

---

## 👤 Author & Lineage

**EMG Core was created by [Craig Huckerby](https://github.com/craighckby-stack)** after an AI coding agent corrupted his repository while logging self-verified success. The engine is the countermeasure: every mutation gated by a real compiler, every failure recorded as evidence, and every claim backed by an artifact.

**The lineage:**
* **[PKM](https://github.com/craighckby-stack/PKM)** — The origin project; its post-mortem ledger is where this evidence system was born.
* **[EMG-Tests](https://github.com/craighckby-stack/EMG-Tests)** — The validation lab; contains the receipts and raw post-mortem ledgers for every claim in this system.

*Trust diffs, never claims.*

---

## 📄 License & Disclaimer

### License
This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** License.

### Disclaimer
This software is provided "as is", without warranty of any kind, express or implied. The authors and maintainers are not responsible for any modifications, data loss, or regressions resulting from automated commits made by this engine. Always configure repository branch protection rules and review pull requests before deploying changes to production environments.
