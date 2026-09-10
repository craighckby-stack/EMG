/**
 * File: src/components/SplashView.tsx
 * Role: Modern Black & Emerald Welcome Screen & Pre-flight Security Advisory
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ExternalLink,
  Scale,
  Sparkles,
  ArrowRight,
  Cpu,
  GitBranch,
  FileCode,
  Lock,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SplashViewProps {
  onInitialize: () => void;
  onOpenLicense: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onInitialize, onOpenLicense }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sanitizer' | 'ecosystem'>('overview');

  return (
    <div
      id="emg-splash-container"
      className="min-h-screen bg-[#030704] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 font-sans relative overflow-y-auto selection:bg-emerald-500 selection:text-black"
    >
      {/* Background ambient neon radial glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-emerald-700/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl cyber-card bg-[#070e09]/95 border border-emerald-500/30 p-6 sm:p-10 relative z-20 my-auto shadow-[0_12px_48px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.1)] rounded-2xl"
      >
        {/* Top bar with system badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-emerald-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 glow-emerald-sm">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  EMG Core <span className="text-emerald-300 text-sm font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">v49</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-mono mt-0.5">
                Autonomous C-Dialect Neural Verification & Refactoring Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLicense}
              className="px-3 py-1.5 rounded-lg bg-[#0a140d] hover:bg-emerald-950 border border-emerald-800/60 hover:border-emerald-500/60 text-xs text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>CC BY-NC-ND 4.0</span>
            </button>
            <button
              onClick={onInitialize}
              className="p-1.5 rounded-lg bg-[#0a140d] hover:bg-emerald-900/60 text-zinc-300 hover:text-white border border-emerald-800/60 text-xs transition-colors cursor-pointer"
              title="Skip to workspace"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 mb-5 border-b border-emerald-950 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture</span>
          </button>
          <button
            onClick={() => setActiveTab('sanitizer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'sanitizer'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('ecosystem')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ecosystem'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-zinc-300 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ecosystem</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#09120b] border border-emerald-500/20 cyber-card-hover space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Cross-Tree Macro Gates</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Evaluates macro symbols globally across the entire repository tree to prevent false-positive unused macro rejections.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#09120b] border border-emerald-500/20 cyber-card-hover space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCode className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Multi-Tier Syntax Guard</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Rigorous AST verification, parenthesis balance, string delimiter checks, and automatic patch healing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#09120b] border border-emerald-500/20 cyber-card-hover space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <GitBranch className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Autonomous Rollback</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Full diff inspection with 1-click single-commit rollback and automatic incident post-mortem logging.
                </p>
              </div>
            </div>

            {/* Quick status checklist */}
            <div className="p-4 rounded-xl bg-black/50 border border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compiler Gateways: <strong className="text-white font-semibold">Heuristic & Clang/GCC Ready</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sandbox Mode: <strong className="text-white font-semibold">Included Built-in Repositories</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gemini API: <strong className="text-white font-semibold">Secure Proxy Integration</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'sanitizer' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#07120a] to-emerald-950/20 border border-emerald-500/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      Pre-Flight Secret & PII Sanitizer
                    </h3>
                    <span className="text-[11px] text-zinc-400 font-mono block truncate">
                      Git-Secret-PII-Sanitizer-2
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 uppercase tracking-wider shrink-0">
                  Recommended
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Before submitting codebases to neural LLMs or autonomous refactoring loops, scan and sanitize uncommitted environment variables, private keys, authentication tokens, and secrets from your git working tree.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  id="btn-link-sanitizer-tab"
                  href="https://github.com/craighckby-stack/Git-Secret-PII-Sanitizer-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <span>Launch Git-Secret-PII-Sanitizer-2</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-xs text-zinc-400 font-mono truncate">
                  github.com/craighckby-stack/Git-Secret-PII-Sanitizer-2
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Ecosystem */}
        {activeTab === 'ecosystem' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-[#09120b] border border-emerald-500/30 flex flex-col justify-between gap-3 cyber-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    Git-Secret-PII-Sanitizer-2
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Security Gateway
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Scrub API keys, secrets, and credentials from git trees before LLM submission.
                </p>
              </div>
              <a
                id="btn-splash-sanitizer"
                href="https://github.com/craighckby-stack/Git-Secret-PII-Sanitizer-2"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Launch Sanitizer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09120b] border border-emerald-500/30 flex flex-col justify-between gap-3 cyber-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    DARLEK CAAN
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    AI Command Center
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Autonomous Code Evolution matrix and distributed AI command platform.
                </p>
              </div>
              <a
                id="btn-splash-darlek"
                href="https://ais-pre-amubz4v3czr3772fnvrcru-483535245139.asia-southeast1.run.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Launch DARLEK CAAN</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09120b] border border-emerald-500/30 flex flex-col justify-between gap-3 cyber-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    Huxley Singularity Loop
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    Neural Loop
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Recursive self-improving neural loop and autonomous feedback synthesis engine.
                </p>
              </div>
              <a
                id="btn-splash-huxley"
                href="https://ais-pre-km7pxypy7meeld2j6lnyqm-483535245139.asia-southeast1.run.app"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Launch Singularity Loop</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09120b] border border-emerald-500/30 flex flex-col justify-between gap-3 cyber-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    Darlek Caan vs Jesus Chess
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    Chess Arena
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  High-stakes tactical chess tournament duel on Google AI Studio.
                </p>
              </div>
              <a
                id="btn-splash-jesuschess"
                href="https://ai.studio/apps/4f692b1f-527f-4c1d-b423-e2bbe06b2009"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Play Chess in Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09120b] border border-emerald-500/30 flex flex-col justify-between gap-3 cyber-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    Wonder Craig: Brave Adventure
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                    AI Studio App
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Interactive story and generative game universe with dynamic narrative orchestration.
                </p>
              </div>
              <a
                id="btn-splash-wondercraig"
                href="https://ai.studio/apps/2120b556-3b9e-4d23-b65b-bf3ef98aa510"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Open in AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09120b] border border-emerald-500/30 flex flex-col justify-between gap-3 cyber-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    AetherForge Ω: Global Genesis
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                    Genesis Simulation
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  World simulation, multi-agent society model, and autonomous planetary sandbox.
                </p>
              </div>
              <a
                id="btn-splash-aetherforge"
                href="https://ai.studio/apps/2c919791-444e-40a2-ba71-e2ec13057cba"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Open in AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09120b] border border-emerald-500/30 flex flex-col justify-between gap-3 cyber-card-hover">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    EMG-Tests Suite
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Test Harness
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Seeded defect suites and C-dialect AST verification regression harness.
                </p>
              </div>
              <a
                id="btn-splash-emgtests"
                href="https://github.com/craighckby-stack/EMG-Tests"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>View Test Suite</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-8 pt-6 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 font-mono">
            Autonomous Refactoring Loop ready for execution
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="btn-initialize-system"
              onClick={onInitialize}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
