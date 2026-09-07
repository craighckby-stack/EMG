# EMG Core

EMG Core is an autonomous, AI-powered codebase optimization and refactoring engine. Powered by Google's Gemini models, it connects directly to GitHub repositories or runs in an offline sandbox to continuously scan, refactor, and safely optimize source code.

## What Sets It Apart: Closed-Loop Neural Learning

Unlike traditional AI coding assistants that rely on heuristics or loop infinitely, EMG Core operates on **evidence-backed constraints and mathematical boundaries**:

* **Real Compiler Verification:** Code mutations are not trusted blindly. C/C++ changes are verified against a genuine GCC 13.2 compiler via the Godbolt API, while TypeScript is parsed through strict AST diagnostics.
* **Post-Mortem Memory:** When a compilation fails, the exact `stderr` trace is captured and written to a `POSTMORTEMS.md` ledger. The engine reads this ledger before every cycle, treating past failures as strict prompt constraints so it never repeats a verified mistake.
* **Global Saturation Halt:** The engine calculates structural equilibrium. When zero meaningful diffs can be produced without violating established constraints, the engine recognizes it is finished and initiates a global halt.

## Operational Efficiency & Scale
* **$0 Stack Operation:** Run full autonomous optimization loops natively on free-tier APIs without paid token subscriptions or cloud hosting costs.
* **Large-Scale Capability:** Autonomously scan, refactor, and verify large 300+ file repositories without hitting rate-limit walls.
* **Zero Token Waste:** Driven by structural equilibrium and per-repository error ledgers to completely eliminate wasteful retry loops.

## Live Preview

You can test the engine directly in your browser using the AI Studio Applet:

**[Launch EMG Core Preview](https://ai.studio/apps/c7006db0-163f-48a6-bc9e-dfdac7b37ff0)**

### How to Use
1. Open the preview link above.
2. **For safe testing:** Ensure "Sandbox Mode" is toggled on to run optimization cycles against built-in simulated repositories without needing any credentials.
3. **For real repositories:** Enter a GitHub Personal Access Token (PAT) and a target repository name (e.g., `username/repo`).
4. Click **Run Single Cycle** or **Toggle Live Optimization** to begin the neural refactoring loop and watch the system learn and optimize in real-time.
