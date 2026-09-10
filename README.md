# EMG Core // Autonomous C-Dialect Verifier & Neural Code Evolution Engine

**EMG Core** is an automated, verification-gated code refactoring engine and full-stack operational control deck. It drives iterative, autonomous cognitive evolution cycles across local sandbox fixtures and remote GitHub repositories, validating model-generated code changes through multi-tier syntax verifiers, real GCC/Clang compiler gates, heuristic linters, unified diff patchers, and automated PII/secret redaction before applying changes.

---

## Architecture Overview

```
                        ┌─────────────────────────────────────────┐
                        │             EMG Core Engine             │
                        │       (Autonomous Evolution Loop)       │
                        └────────────────────┬────────────────────┘
                                             │
                      1. File Discovery & Repository Tree Scan
                      2. Ingest Constraints (docs/POSTMORTEMS.md SHA-256)
                      3. Secret / PII Pre-flight Sanitization
                                             │
                      4. Neural Transformation (Gemini 3.7 / 3.6 Flash)
                                             │
            ┌────────────────────────────────┴────────────────────────────────┐
            ▼                                                                 ▼
    Tier 1: AST & Syntax Verifier                             Tier 2: Real Compiler Gate
    • Balanced Token & Delimiter Parsing                      • GCC 13.2 via Godbolt API (cg132/g132)
    • Native TypeScript AST Diagnostics                       • Cross-file `#include` header splicing (depth 5)
    • Auto-unwraps Markdown Code Fences                       • Isolation Error Detection (Bypasses missing deps)
            │                                                                 │
            ├────────────────────────────────┬────────────────────────────────┤
            │ Fails Validation               │ Passes Validation              │
            ▼                                ▼                                │
    [Post-Mortem Logger]                     [Patch, Convergence & Commit]    │
    • Appends failure evidence &             • Resilient multi-strategy diff  │
      actionable rule to POSTMORTEMS.md        splicer (Unified / Hunk / Full)│
    • Computes rolling SHA-256 state         ├── 0 diffs: Saturation Handled  │
    • Ingests negative constraints           └── >0 diffs: Commit to Branch   │
            │                                                                 │
            └────────────────────────────────┬────────────────────────────────┘
                                             │
                                   Rotate to Next Candidate
```

---

## Core Capabilities & Subsystems

### 1. Multi-Tier Verification Pipeline
Proposed code mutations pass through rigorous independent verification gates before commit:
* **AST & Syntax Scanner (Tier 1):** Scans bracket/delimiter balancing, unclosed quotes, template strings, and native TypeScript compiler diagnostics.
* **External Compiler Gate (Tier 2):** Transmits C/C++ translation units to the Godbolt Compiler Explorer API (`cg132` for C, `g132` for C++). Slices and resolves local `#include` dependencies (up to depth 5) across the project tree.
* **Heuristic Linter Rules:**
  * **Rule 1 (`NO_UNVERIFIABLE_SELF_PRAISE`):** Strips marketing hype and self-praise in code comments (*"Hardened"*, *"Bulletproof"*, *"Fully optimized"*, *"Production-grade"*).
  * **Rule 1B (`NO_STALE_DEFECT_CLAIMS`):** Prevents obsolete defect claims (*"Seeded defect"*, *"PREDICTION: PASSES"*) or test scaffolding from leaking into production docstrings.
  * **Rule 2 (`NO_DEAD_CONDITIONS`):** Rejects redundant inner conditionals bounded by loop variables (e.g., `len > 0` inside `for (i < len)`).
  * **Rule 3 (`NO_UNUSED_MACROS`):** Scans the whole repository tree for macro usage, exempting public header exports.
  * **Rule 4 (`TODO_ADJACENT_SUCCESS`):** Blocks placeholder TODO comments adjacent to success/return statements.

### 2. Built-in Credential & PII Sanitizer
* Integrated pre-flight regex and entropy scanning filters out sensitive keys and secrets at both client and server boundaries.
* Automatically redacts:
  * GitHub Personal Access Tokens (`ghp_`, `github_pat_`, `gho_`, `ghs_`)
  * Google Gemini API Keys (`AIza...`)
  * OpenAI, Anthropic, Stripe, and AWS API keys
  * RSA/EC Private Key blocks and JWT tokens
* Scrubbed secrets are substituted with standardized `[REDACTED_*]` tokens and tallied in real-time metrics.

### 3. Resilient Unified Diff Patcher
* **Unified Diff Parsing:** Reconstructs hunk headers (`@@ -old,len +new,len @@`) and applies modifications via `diff.applyPatch` with fuzz matching.
* **Hunk Search-and-Replace:** Employs fuzzy block matching when offset numbers shift.
* **Full-File Fallback:** Automatically replaces compact source files when models output full implementations.

### 4. Post-Mortem Constraints Ledger (`docs/POSTMORTEMS.md`)
* Automated write-back appends structured evidence and generalized negative constraints upon gate rejections.
* SHA-256 fingerprinting automatically detects ledger mutations and re-arms prompt memory in real time.
* **Self-Healing Ledger:** Automatically identifies and neutralizes poisoned isolation errors from missing external headers.

### 5. Code Saturation & Convergence Engine
* Detects zero-diff mutations when code has converged.
* Offers interactive saturation decisions or auto-skipping to keep autonomous runs moving.
* Prevents post-halt drift, redundant API burn, and hallucinated refactorings.

### 6. Protected Apparatus
* Evaluation fixtures, license declarations, and test manifests (`README.md`, `BUGS.md`, `docs/POSTMORTEMS.md`, `RULES.md`, `LICENSE`, `package.json`, `tsconfig.json`) are strictly write-protected from automated modifications.

---

## Developer Ecosystem Hub

EMG Core is connected directly to a network of agentic, security, and worldbuilding platforms:

| Project | Category | Description | Launch URL |
| :--- | :--- | :--- | :--- |
| **Git-Secret-PII-Sanitizer-2** | Security Gateway | Scrub API keys, tokens, and PII from git trees before LLM submission. | [GitHub Repository](https://github.com/craighckby-stack/Git-Secret-PII-Sanitizer-2) |
| **DARLEK CAAN** | AI Command Center | Autonomous Code Evolution matrix and distributed AI command platform. | [Live Deployment](https://ais-pre-amubz4v3czr3772fnvrcru-483535245139.asia-southeast1.run.app/) |
| **Darlek Caan vs Jesus Chess** | AI Studio Arena | Grandmaster tactical chess tournament duel on Google AI Studio. | [AI Studio App](https://ai.studio/apps/4f692b1f-527f-4c1d-b423-e2bbe06b2009) |
| **Huxley Singularity Loop** | Neural Loop | Recursive self-improving neural loop and autonomous feedback synthesis engine. | [Live Deployment](https://ais-pre-km7pxypy7meeld2j6lnyqm-483535245139.asia-southeast1.run.app) |
| **Wonder Craig: The Brave Adventure** | Interactive Story | Interactive generative story and agentic universe in Google AI Studio. | [AI Studio App](https://ai.studio/apps/2120b556-3b9e-4d23-b65b-bf3ef98aa510) |
| **AetherForge Ω: Global Genesis** | World Simulation | Cosmological genesis simulation and multi-agent worldbuilding engine. | [AI Studio App](https://ai.studio/apps/2c919791-444e-40a2-ba71-e2ec13057cba) |
| **EMG-Tests Suite** | Test Harness | Seeded defect suites and C-dialect AST verification regression harness. | [GitHub Repository](https://github.com/craighckby-stack/EMG-Tests) |
| **PKM System** | Knowledge Base | Personal knowledge management, research lineages, and architecture notes. | [GitHub Repository](https://github.com/craighckby-stack/PKM) |

---

## Getting Started

### Prerequisites
* Node.js (v20.x or newer recommended)
* npm (v10.x or newer)
* Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/craighckby-stack/EMG-Tests.git
   cd EMG-Tests
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Set your API credentials in `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   NODE_ENV="development"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build and start for production:**
   ```bash
   npm run build
   npm start
   ```

---

## Operating Modes

1. **Sandbox Mode:**
   * Operates on pre-seeded memory fixtures without remote GitHub token requirements.
   * Safe environment for inspecting diff generation, AST checking, and saturation alerts.
2. **Live GitHub Mode:**
   * Authenticates with GitHub via a Personal Access Token (`repo` scope).
   * Reads remote trees, pulls source blobs, executes verification passes, and writes verified mutations to target branches.
3. **Oracle Stress-Test Mode (Option A):**
   * Accessible via the top **Oracle** button.
   * Allows direct manual injection of poisoned C code specimens into the GCC compiler and heuristic linter to verify rejection logic and post-mortem write-backs.

---

## Server API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/optimize` | `POST` | Dispatches source code and optimization goals to the Gemini API with candidate fallback chains. |
| `/api/lint` | `POST` | Executes project-aware heuristic linter rules and compiles C/C++ units via the Godbolt GCC 13.2 API. |
| `/api/validate` | `POST` | Native TypeScript compiler AST diagnostics and syntactic verification. |
| `/api/sanitize` | `POST` | Server-side regex and entropy redaction for credentials and tokens. |
| `/api/diagnostic` | `GET` | Health status probe, memory path validation, and environment verification. |
| `/api/status` | `GET` | Reports Gemini API key injection state and supported model profiles. |
| `/api/github/user-repos` | `POST` | Proxies authenticated user repository listings from GitHub. |
| `/api/github/repo-tree` | `POST` | Fetches recursive git tree structures for a specified branch. |
| `/api/github/file-content` | `POST` | Fetches raw file blob and SHA metadata from GitHub. |
| `/api/github/commit-file` | `POST` | Commits sanitized, verified code mutations to GitHub with 409 conflict retries. |

---

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** License. See the `LICENSE` file for details.

