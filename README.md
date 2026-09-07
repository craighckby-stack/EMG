# EMG Core v49

[![AI Studio Applet](https://img.shields.io/badge/Google%20AI%20Studio-Applet%20Live-4285F4?style=flat&logo=google)](https://ai.studio/apps/c7006db0-163f-48a6-bc9e-dfdac7b37ff0)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

> **Live Applet**: [https://ai.studio/apps/c7006db0-163f-48a6-bc9e-dfdac7b37ff0](https://ai.studio/apps/c7006db0-163f-48a6-bc9e-dfdac7b37ff0)

An autonomous, AI-powered codebase optimization and refactoring engine designed to connect directly to GitHub repositories or run in offline sandbox environments. EMG Core continuously scans source files, applies neural refactoring transformations via the Google Gemini API, validates code safety via abstract syntax tree (AST) diagnostics, and safely applies optimizations with zero-risk safeguards.

---

## 🚀 Key Capabilities

- **Autonomous & On-Demand Optimization Loops**: Run single-pass enhancements or automated continuous scanning across entire repositories.
- **GitHub REST API Integration**: Direct integration with GitHub Personal Access Tokens (PAT) for listing user/organization repositories, fetching trees, and committing atomic refactoring passes.
- **Offline Sandbox Mode**: Built-in simulated repositories (TypeScript/React, Python FastAPI, and Go Concurrency microservices) for safe, instant testing without requiring external credentials.
- **Next-Gen Gemini Engine**: Server-side integration with Google's Gemini models (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, and experimental models) through the official `@google/genai` SDK.
- **Targeted Refactoring Directives**:
  - **Comprehensive**: Balanced improvements across performance, readability, and typing.
  - **High-Throughput Performance**: Algorithmic complexity reduction, memoization, and loop unrolling.
  - **Security & Memory Hardening**: Input sanitization, memory leak prevention, and boundary validation.
  - **Strict Type Safety**: Elimination of `any` types, exhaustive match patterns, and strict null handling.
  - **Clean Architecture & Readability**: Modern idioms, self-documenting naming, and modular decomposition.
- **Interactive Diff Modal & Mutation History**: Full side-by-side and unified diff inspector with line-delta indicators, latency metrics, and copy utilities.
- **Real-Time Telemetry & Health Monitoring**: Live logging bus, latency tracker, token throughput calculation, and diagnostic health probe.

---

## 🛠️ Safety Safeguards & Architecture

EMG Core implements multi-layered defensive engineering to ensure that AI-generated code never corrupts repositories or leaks secrets:

```
[ Target Source File ]
          │
          ▼
[ Gemini Neural Optimization ]
          │
          ▼
[ Automated Secret Sanitizer ] ──► Strips PATs, API Keys, Tokens & Private Keys
          │
          ▼
[ AST Type & Syntax Validator ] ──► Compiles with TypeScript AST & transpiler
          │                     └── Rejects parse errors / unmatched delimiters
          ▼
[ Same-File Saturation Guard ] ──► Detects zero-diff no-ops & triggers alert
          │
          ▼
[ Atomic GitHub Commit / Sandbox Write ]
```

1. **Client & Server Secret Sanitizer**: Proactively detects and redacts GitHub PATs (`ghp_`, `gho_`, `github_pat_`), Gemini API keys (`AIza...`), OpenAI/Anthropic keys, Stripe secrets, AWS credentials, and private keys from code, summaries, and telemetry streams.
2. **Strict TypeScript AST Diagnostic Engine**: Validates all generated JavaScript/TypeScript code using `ts.createSourceFile` and `ts.transpileModule` before committing. Rejects syntax defects, unclosed braces, or malformed typing with line-and-column diagnostic reporting.
3. **Same-File Saturation Guard (Zero-Diff Detection)**: Compares transformed code directly against the repository's current file content. If 0 modifications are made, the engine flags a **`[NO-OP]`**, skips the redundant commit, and offers one-click file blacklisting or rotation.
4. **Resilient Rate-Limit & HTTP Handling**: Gracefully catches HTTP `429 Too Many Requests`, `401 Unauthorized`, `404 Not Found`, and `409 Conflict` errors with automatic pause mechanisms and clear corrective guidance.

---

## 📋 Comprehensive List of Fixes & Enhancements

### 🛡️ Safety & Validation Enhancements
- **TypeScript AST Pre-Commit Verification**: Added a dedicated AST parser and compiler diagnostic engine (`/api/validate`) that inspects code syntax and types before writing to sandbox or GitHub.
- **Automatic Syntax Healing**: Built intelligent syntax healing for missing backticks, unclosed code fences, and trailing delimiters.
- **Defensive Secret Redaction**: Added client and server-side regex scrubbers that strip personal access tokens and sensitive credentials from commits and live logs.
- **Configurable Safety Toggles**: Introduced toggle switches for "Auto-Sanitize Secrets & PATs" and "Strict Type & Syntax Verifier" in the configuration panel.

### 🔄 GitHub & Workflow Enhancements
- **Saturation Alert Modal**: Created an alert interface when an AI transformation produces a zero-diff identical file, allowing developers to blacklist saturated files or bypass with one click.
- **Same-File Pre-Commit Verification**: Prevented redundant, empty commits on GitHub repositories by enforcing strict delta checks.
- **Repository Scope Filtering**: Added granular file targeting options (All files, `.ts/.tsx/.js`, `.py`, `.go`, single specific path, and dynamic blacklist exclusion lists).
- **Dry-Run Mode**: Allows testing optimization passes with full diff inspection without modifying remote branches or sandbox states.

### ⚡ AI Engine & Performance Enhancements
- **Multi-Model Selector**: Updated engine to support modern Gemini models (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, and latest aliases) with sovereign offline fallback generators.
- **Enhanced System Directives**: Refined prompt engineering with strict code-only output formatting and markdown fence sanitization.
- **Token & Latency Accounting**: Added real-time token throughput estimators and average mutation latency statistics.

### 🖥️ UI/UX & Telemetry Enhancements
- **Refined Mutation Card Viewer**: Badges for applied, dry-run, no-op, and failed mutations with instant access to line deltas and scrubbed secret counters.
- **System Memory Wipe**: Added a "Wipe Memory" function in the status bar to reset candidate rotation indexes, clear logs, purge diff caches, and restore sandbox state.
- **Live Telemetry Stream**: Monospaced event logging with category filters (All, System, Optimization, Network, Warnings, Errors, No-Op).
- **Diagnostics Health Probe**: Diagnostic modal testing server connectivity, Gemini API responsiveness, and environment health.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, TypeScript AST Compiler (`typescript`), Vite Middleware
- **AI SDK**: `@google/genai` (Google Gen AI SDK)
- **Tooling**: Vite, esbuild, dotenv

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Installation

```bash
# Clone repository
git clone https://github.com/Craighckby/emg-core.git
cd emg-core

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Running in Development

Start the Express + Vite full-stack server:

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).

### Production Build & Deployment

```bash
# Compile frontend and backend bundle
npm run build

# Start production server
npm start
```

---

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)**.

Copyright (c) 2026 Craighckby. All rights reserved.
