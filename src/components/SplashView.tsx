/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/SplashView.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useEffect } from 'react';
import { Zap, Cpu, Activity, ShieldCheck, ArrowRight, Radio, Sparkles, Scale, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashViewProps {
  onInitialize: () => void;
  onOpenLicense: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onInitialize, onOpenLicense }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onInitialize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInitialize]);

  return (
    <div
      id="emg-splash-container"
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-xl bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden z-10"
      >
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400" />

        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <Zap className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-[11px] font-mono tracking-wide text-neutral-400">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>CORE READY</span>
            </div>
            <button
              id="btn-close-splash"
              onClick={onInitialize}
              title="Close and Enter Workspace (Esc / Enter)"
              aria-label="Close splash screen"
              className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              EMG CORE
            </h1>
            <span className="text-xl md:text-2xl font-black text-blue-400 tracking-tight">
              v49
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            Sovereign Autonomous Dashboard
          </p>
        </div>

        <p className="text-sm text-neutral-300 leading-relaxed mb-6">
          Self-directed repository scanning, neural code mutation synthesis, and real-time telemetry streaming for production and sandbox repositories.
        </p>

        {/* Feature pillars */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 mb-8 space-y-3.5">
          <div className="flex items-start gap-3 text-xs">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Autonomous Engine:</span>{' '}
              <span className="text-neutral-400">
                Automated repository traversal and recursive AST pattern optimization.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <Activity className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Visual Telemetry:</span>{' '}
              <span className="text-neutral-400">
                Sub-millisecond latency graphs, mutation metrics, and live event bus logs.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Sovereign Security:</span>{' '}
              <span className="text-neutral-400">
                In-memory volatile credential management and dry-run safety modes.
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          id="btn-initialize-system"
          onClick={onInitialize}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <span>Initialize System</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 font-mono border-t border-neutral-800/60 pt-4">
          <span>Copyright (c) 2026 Craighckby</span>
          <button
            id="btn-splash-license"
            onClick={onOpenLicense}
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>CC BY-NC-SA 4.0</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
