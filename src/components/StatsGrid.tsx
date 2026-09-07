/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/StatsGrid.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React from 'react';
import { Cpu, ShieldCheck, Activity, RefreshCw, FileCode2, Sparkles, KeyRound, ShieldAlert } from 'lucide-react';
import { EngineMetrics } from '../types';

interface StatsGridProps {
  metrics: EngineMetrics;
  isSandbox: boolean;
  hasGhToken: boolean;
  onOpenDiagnostics?: () => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  metrics,
  isSandbox,
  hasGhToken,
  onOpenDiagnostics,
}) => {
  return (
    <div id="emg-stats-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {/* Mutations */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Mutations</span>
          <Cpu className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
          <span>{metrics.enhancements}</span>
          {metrics.noops > 0 && (
            <span className="text-xs text-amber-400 font-mono font-medium">
              +{metrics.noops} no-op
            </span>
          )}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1 font-mono">
          AST Optima {metrics.noops > 0 ? `(${metrics.noops} saturated)` : ''}
        </div>
      </div>

      {/* Type & AST Verifications */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">AST Checks</span>
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl md:text-3xl font-black text-cyan-400 tracking-tight flex items-baseline gap-2">
          <span>{metrics.validations}</span>
          {(metrics.syntaxErrorsPrevented || 0) > 0 && (
            <span className="text-xs text-rose-400 font-mono font-medium">
              {metrics.syntaxErrorsPrevented} caught
            </span>
          )}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1 font-mono">
          {(metrics.syntaxErrorsPrevented || 0) > 0 ? `${metrics.syntaxErrorsPrevented} errors rejected` : 'Type-safe contracts'}
        </div>
      </div>

      {/* Uplink Status */}
      <div
        onClick={onOpenDiagnostics}
        className={`bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group ${
          onOpenDiagnostics ? 'cursor-pointer hover:border-emerald-500/40 transition-colors' : ''
        }`}
        title={onOpenDiagnostics ? 'Click to inspect Kernel Diagnostics & Environment Telemetry' : undefined}
      >
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Uplink</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-base md:text-xl font-bold text-emerald-400 tracking-tight truncate mt-1">
          {isSandbox ? 'SANDBOX' : hasGhToken ? 'SECURE' : 'PUBLIC'}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1 font-mono flex items-center justify-between">
          <span>{(metrics.sanitizedSecretsCount || 0) > 0 ? `${metrics.sanitizedSecretsCount} keys scrubbed` : 'Sovereign Bus'}</span>
          {onOpenDiagnostics && <span className="text-[9px] text-emerald-400/70 font-bold">PROBE &rarr;</span>}
        </div>
      </div>

      {/* Scanned Files */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Tree Depth</span>
          <FileCode2 className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl md:text-3xl font-black text-purple-400 tracking-tight">
          {metrics.totalScannedFiles}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1 font-mono">Discovered Files</div>
      </div>

      {/* Neural Latency */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Avg Latency</span>
          <Activity className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight">
          {metrics.avgLatencyMs > 0 ? `${metrics.avgLatencyMs}ms` : '--'}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1 font-mono">Synthesis speed</div>
      </div>

      {/* Tokens Processed */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden group">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Neural Load</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl md:text-3xl font-black text-cyan-400 tracking-tight">
          {metrics.tokensProcessed > 1000
            ? `${(metrics.tokensProcessed / 1000).toFixed(1)}k`
            : metrics.tokensProcessed}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1 font-mono">Tokens analyzed</div>
      </div>
    </div>
  );
};
