/**
 * File: src/components/Header.tsx
 * Role: Modern Navigation Bar & Engine Operational Control Deck
 */

import React from 'react';
import { Play, Square, RefreshCw, Layers, Github, Scale, Activity, Trash2, ShieldAlert, Sparkles, Cpu } from 'lucide-react';
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
  onOpenSplash?: () => void;
  onOpenEcosystem?: () => void;
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
  onOpenSplash,
  onOpenEcosystem,
  isCycling,
}) => {
  const getStatusBadge = (st: EngineStatus) => {
    switch (st) {
      case 'OPTIMIZING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'VERIFYING':
      case 'LINTING':
      case 'COMMITTING':
      case 'FETCHING':
      case 'SCANNING':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'ERROR':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'COOLDOWN':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return isLive
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
          : 'bg-emerald-950/40 text-emerald-500 border-emerald-900/60';
    }
  };

  return (
    <header
      id="emg-header"
      className="cyber-card bg-[#070e0a]/90 border border-emerald-500/25 p-4 sm:px-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      {/* Brand & Live Indicator */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950 to-[#040805] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950">
          <Cpu className="w-5 h-5 text-emerald-400" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              EMG Core <span className="text-emerald-300 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">v49</span>
            </h1>
            <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-zinc-300 bg-[#09150d] px-2 py-0.5 rounded-md border border-emerald-800/40">
              C-Dialect Engine
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse'
                  : 'bg-emerald-900'
              }`}
            />
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold tracking-wider ${getStatusBadge(
                status
              )}`}
            >
              {status}
            </span>

            {targetRepo && (
              <span className="text-xs text-zinc-300 flex items-center gap-1 font-mono">
                {isSandbox ? (
                  <span className="text-zinc-200 flex items-center gap-1 font-medium bg-[#0a170f] px-2 py-0.5 rounded-md border border-emerald-800/40">
                    <Layers className="w-3 h-3 text-emerald-400" /> Sandbox
                  </span>
                ) : (
                  <span className="text-zinc-200 flex items-center gap-1 font-medium bg-[#0a170f] px-2 py-0.5 rounded-md border border-emerald-800/40">
                    <Github className="w-3 h-3 text-emerald-400" /> {targetRepo}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {onOpenEcosystem && (
          <button
            id="btn-header-ecosystem"
            onClick={onOpenEcosystem}
            title="Explore Developer Ecosystem & Repositories"
            className="px-3 py-2 rounded-xl bg-[#09140c] hover:bg-emerald-950/70 text-zinc-200 hover:text-white border border-emerald-800/60 hover:border-emerald-500/60 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ecosystem</span>
          </button>
        )}

        {onOpenSplash && (
          <button
            id="btn-header-splash"
            onClick={onOpenSplash}
            title="Open Intro & Security Advisory"
            className="px-3 py-2 rounded-xl bg-[#09140c] hover:bg-emerald-950/70 text-zinc-200 hover:text-white border border-emerald-800/60 hover:border-emerald-500/60 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Advisory</span>
          </button>
        )}

        {onOpenOracle && (
          <button
            id="btn-header-oracle"
            onClick={onOpenOracle}
            title="Direct Code Injection & Poison Stress-Test"
            className="px-3 py-2 rounded-xl bg-amber-950/30 hover:bg-amber-900/50 text-amber-200 border border-amber-600/50 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Oracle</span>
          </button>
        )}

        {onOpenDiagnostics && (
          <button
            id="btn-header-diagnostics"
            onClick={onOpenDiagnostics}
            title="Kernel Diagnostics Probe"
            className="px-3 py-2 rounded-xl bg-[#09140c] hover:bg-emerald-950/70 text-zinc-200 hover:text-white border border-emerald-800/60 hover:border-emerald-500/60 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>
        )}

        {onOpenWipeMemory && (
          <button
            id="btn-header-wipe-memory"
            onClick={onOpenWipeMemory}
            title="Wipe state and reset loop"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#09140c] hover:bg-red-950/60 text-zinc-300 hover:text-red-300 border border-emerald-900/60 hover:border-red-600/60 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        <button
          id="btn-header-license"
          onClick={onOpenLicense}
          title="License Terms"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#09140c] hover:bg-emerald-950/70 text-zinc-300 hover:text-white border border-emerald-900/60 hover:border-emerald-700/60 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">License</span>
        </button>

        <button
          id="btn-single-cycle"
          onClick={onRunSingleCycle}
          disabled={isLive || isCycling}
          title="Execute a single optimization pass manually"
          className="px-3.5 py-2 rounded-xl bg-[#09140c] hover:bg-emerald-900/60 disabled:opacity-40 disabled:pointer-events-none text-zinc-200 hover:text-white border border-emerald-600/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isCycling ? 'animate-spin' : ''}`} />
          <span>Step</span>
        </button>

        <button
          id="btn-toggle-engine"
          onClick={onToggleLive}
          className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg transform active:scale-95 ${
            isLive
              ? 'bg-red-500/90 text-white hover:bg-red-600 shadow-red-900/50'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
          }`}
        >
          {isLive ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Halt Engine</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Auto</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
