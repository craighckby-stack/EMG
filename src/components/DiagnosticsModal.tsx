/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/DiagnosticsModal.tsx
 * Role: System diagnostic health telemetry monitor.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, RefreshCw, X, Server, Database, Key } from 'lucide-react';

interface DiagnosticData {
  kernel: string;
  status: 'HEALTHY' | 'DEGRADED';
  missing: string[];
  nodeEnv: string;
  debugMode: boolean;
  memoryPath: string;
  timestamp: string;
}

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagnostic');
      if (!res.ok) throw new Error(`Diagnostic service returned HTTP ${res.status}`);
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) {
        throw new Error('Diagnostic endpoint returned non-JSON response.');
      }
      const json = JSON.parse(text);
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch diagnostic telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiagnostics();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="emg-diagnostics-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        id="emg-diagnostics-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                System Diagnostics & Kernel Telemetry
              </h2>
              <p className="text-xs text-neutral-400 font-mono">EMG Core v49 • Node.js Diagnostics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-diagnostics"
              onClick={fetchDiagnostics}
              disabled={isLoading}
              title="Refresh diagnostic probe"
              aria-label="Refresh diagnostic probe"
              className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
            <button
              id="btn-close-diagnostics-header"
              onClick={onClose}
              title="Close diagnostics (Esc)"
              aria-label="Close diagnostics"
              className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto font-mono text-xs">
          {isLoading && !data && (
            <div className="py-8 text-center text-neutral-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span>Probing kernel interfaces...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Diagnostic Probe Error</p>
                <p className="text-[11px] text-red-300/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {data && (
            <>
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  data.status === 'HEALTHY'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {data.status === 'HEALTHY' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <div>
                    <span className="font-bold text-sm">Kernel Status: {data.status}</span>
                    <p className="text-[11px] opacity-80 font-mono mt-0.5">
                      {data.status === 'HEALTHY'
                        ? 'All mandatory kernel environment variables and modules verified.'
                        : `Missing variables: ${data.missing.join(', ')}`}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-black/40 text-[10px] font-bold uppercase tracking-wider">
                  {data.kernel}
                </span>
              </div>

              {/* Grid of parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  <div className="text-neutral-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    Environment Mode
                  </div>
                  <div className="text-neutral-200 font-bold capitalize">{data.nodeEnv}</div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  <div className="text-neutral-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    Memory Path
                  </div>
                  <div className="text-neutral-200 font-bold truncate">{data.memoryPath}</div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  <div className="text-neutral-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Debug Mode
                  </div>
                  <div className="text-neutral-200 font-bold">{data.debugMode ? 'ACTIVE (Verbose)' : 'INACTIVE (Standard)'}</div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  <div className="text-neutral-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Last Probe
                  </div>
                  <div className="text-neutral-200 font-bold truncate">
                    {new Date(data.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Missing Requirements List (if any) */}
              {data.missing && data.missing.length > 0 && (
                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <p className="text-neutral-400 text-[11px] mb-2 font-bold">Uninjected Variables (.env.example schema):</p>
                  <div className="space-y-1">
                    {data.missing.map((key) => (
                      <div key={key} className="flex items-center justify-between text-amber-400 bg-amber-500/5 px-2.5 py-1 rounded border border-amber-500/20">
                        <span>{key}</span>
                        <span className="text-[10px] text-neutral-500">Required for full cloud features</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono">
            Validated by /lib/env-validator.ts
          </span>
          <button
            id="btn-close-diagnostics-footer"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
