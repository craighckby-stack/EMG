/**
 * File: src/components/StatsGrid.tsx
 * Role: Modern Black & Emerald Telemetry Metric Cards
 */

import React from 'react';
import { Cpu, ShieldCheck, Activity, FileCode2, Sparkles, ShieldAlert } from 'lucide-react';
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
    <div id="emg-stats-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-sans">
      {/* Mutations */}
      <div className="cyber-card cyber-card-hover p-4 sm:p-5 rounded-2xl relative overflow-hidden group bg-[#070e0a]/80">
        <div className="flex items-center justify-between text-zinc-300 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-200">Mutations</span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-mono">
          <span>{metrics.enhancements}</span>
          {metrics.noops > 0 && (
            <span className="text-xs text-amber-400 font-mono">
              +{metrics.noops} sat
            </span>
          )}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1 truncate">
          {metrics.noops > 0 ? `${metrics.noops} saturated passes` : 'AST optimizations'}
        </div>
      </div>

      {/* Lint Gates */}
      <div className="cyber-card cyber-card-hover p-4 sm:p-5 rounded-2xl relative overflow-hidden group bg-[#070e0a]/80">
        <div className="flex items-center justify-between text-zinc-300 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-200">Lint Gates</span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2 font-mono">
          <span>{metrics.validations}</span>
          {(metrics.syntaxErrorsPrevented || 0) > 0 && (
            <span className="text-xs text-red-400 font-mono">
              {metrics.syntaxErrorsPrevented} rej
            </span>
          )}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1 truncate">
          {(metrics.syntaxErrorsPrevented || 0) > 0 ? `${metrics.syntaxErrorsPrevented} faults caught` : 'Active tree checks'}
        </div>
      </div>

      {/* Uplink Status */}
      <div
        onClick={onOpenDiagnostics}
        className={`cyber-card cyber-card-hover p-4 sm:p-5 rounded-2xl relative overflow-hidden group bg-[#070e0a]/80 ${
          onOpenDiagnostics ? 'cursor-pointer' : ''
        }`}
        title={onOpenDiagnostics ? 'Inspect Diagnostics & Uplink' : undefined}
      >
        <div className="flex items-center justify-between text-zinc-300 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-200">Uplink</span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-bold text-white tracking-tight truncate font-mono">
          {isSandbox ? 'SANDBOX' : hasGhToken ? 'SECURE' : 'PUBLIC'}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between truncate">
          <span>{(metrics.sanitizedSecretsCount || 0) > 0 ? `${metrics.sanitizedSecretsCount} scrubbed` : 'Event bus ok'}</span>
          {onOpenDiagnostics && <span className="text-[11px] text-emerald-400 font-bold">&rarr;</span>}
        </div>
      </div>

      {/* Indexed Files */}
      <div className="cyber-card cyber-card-hover p-4 sm:p-5 rounded-2xl relative overflow-hidden group bg-[#070e0a]/80">
        <div className="flex items-center justify-between text-zinc-300 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-200">Tree Depth</span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {metrics.totalScannedFiles}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">Indexed files</div>
      </div>

      {/* Neural Latency */}
      <div className="cyber-card cyber-card-hover p-4 sm:p-5 rounded-2xl relative overflow-hidden group bg-[#070e0a]/80">
        <div className="flex items-center justify-between text-zinc-300 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-200">Latency</span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {metrics.avgLatencyMs > 0 ? `${metrics.avgLatencyMs}ms` : '--'}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">Inference speed</div>
      </div>

      {/* Tokens Processed */}
      <div className="cyber-card cyber-card-hover p-4 sm:p-5 rounded-2xl relative overflow-hidden group bg-[#070e0a]/80">
        <div className="flex items-center justify-between text-zinc-300 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-200">Tokens</span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
          {metrics.tokensProcessed > 1000
            ? `${(metrics.tokensProcessed / 1000).toFixed(1)}k`
            : metrics.tokensProcessed}
        </div>
        <div className="text-[11px] text-zinc-400 mt-1">Total volume</div>
      </div>
    </div>
  );
};
