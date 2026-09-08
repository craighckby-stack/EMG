/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/Header.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React from 'react';
import { Zap, Play, Square, RefreshCw, Layers, ShieldCheck, Github, Scale, Activity, Trash2, ShieldAlert } from 'lucide-react';
import { EngineStatus } from '../types';

interface HeaderProps {
  isLive: boolean;
  status: EngineStatus;
  targetRepo: string;
  isSandbox: boolean;
  onToggleLive: () => void;
  onRunSingleCycle: () => void;
  onOpenLicense: () => void;
  onOpenDiagnostics?: () => void;
  onOpenWipeMemory?: () => void;
  onOpenOracle?: () => void;
  isCycling: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  status,
  targetRepo,
  isSandbox,
  onToggleLive,
  onRunSingleCycle,
  onOpenLicense,
  onOpenDiagnostics,
  onOpenWipeMemory,
  onOpenOracle,
  isCycling,
}) => {
  const getStatusColor = (st: EngineStatus) => {
    switch (st) {
      case 'OPTIMIZING':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'VERIFYING':
      case 'LINTING':
      case 'COMMITTING':
      case 'FETCHING':
      case 'SCANNING':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'ERROR':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'COOLDOWN':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return isLive
          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
          : 'text-neutral-400 bg-neutral-800/60 border-neutral-700/50';
    }
  };

  return (
    <header
      id="emg-header"
      className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 md:px-6 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4"
    >
      {/* Brand & Status */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Zap className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-white text-base tracking-tight">
              EMG CORE <span className="text-blue-400">v49</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
              SOVEREIGN
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'
                  : 'bg-neutral-600'
              }`}
            />
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>

            {targetRepo && (
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                {isSandbox ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <Layers className="w-3 h-3" /> Sandbox
                  </span>
                ) : (
                  <span className="text-neutral-300 flex items-center gap-1">
                    <Github className="w-3 h-3 text-neutral-400" /> {targetRepo}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2.5">
        {onOpenOracle && (
          <button
            id="btn-header-oracle"
            onClick={onOpenOracle}
            title="Open Oracle Stress-Test & Direct Poison Injection Harness (Option A)"
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Oracle Harness</span>
          </button>
        )}

        {onOpenDiagnostics && (
          <button
            id="btn-header-diagnostics"
            onClick={onOpenDiagnostics}
            title="Open Kernel Diagnostics & Health Probe"
            className="px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-400 hover:text-white border border-neutral-700/60 font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>
        )}

        {onOpenWipeMemory && (
          <button
            id="btn-header-wipe-memory"
            onClick={onOpenWipeMemory}
            title="Wipe memory, empty caches, and reset engine back to start"
            className="px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 border border-neutral-700/60 hover:border-rose-800/50 font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer group"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400 transition-colors" />
            <span className="hidden sm:inline">Wipe Memory</span>
          </button>
        )}

        <button
          id="btn-header-license"
          onClick={onOpenLicense}
          title="Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)"
          className="px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-400 hover:text-white border border-neutral-700/60 font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">CC BY-NC-SA 4.0</span>
        </button>

        <button
          id="btn-single-cycle"
          onClick={onRunSingleCycle}
          disabled={isLive || isCycling}
          title="Execute a single optimization pass manually"
          className="px-3.5 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 disabled:opacity-40 disabled:pointer-events-none text-neutral-300 hover:text-white border border-neutral-700/60 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCycling ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">Manual Pass</span>
        </button>

        <button
          id="btn-toggle-engine"
          onClick={onToggleLive}
          className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-md ${
            isLive
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40 hover:bg-rose-500/20 active:scale-[0.98]'
              : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 active:scale-[0.98] shadow-blue-600/20'
          }`}
        >
          {isLive ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>TERMINATE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ENGAGE</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
