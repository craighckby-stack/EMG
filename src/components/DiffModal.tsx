/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/DiffModal.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileCode, ArrowRight, Shield, AlertTriangle, KeyRound } from 'lucide-react';
import { MutationRecord } from '../types';

interface DiffModalProps {
  record: MutationRecord | null;
  onClose: () => void;
}

export const DiffModal: React.FC<DiffModalProps> = ({ record, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (record) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(record.optimizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFailed = record.status === 'failed';
  const isNoop = record.status === 'noop';

  return (
    <div
      id="emg-diff-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
    >
      <div
        id="emg-diff-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 md:px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isFailed ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm font-mono">{record.path}</h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    record.status === 'applied'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : isFailed
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : isNoop
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  }`}
                >
                  {record.status}
                </span>
                {(record.redactedCount || 0) > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                    <KeyRound className="w-3 h-3" />
                    {record.redactedCount} token(s) scrubbed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Latency: {record.latencyMs}ms • Original: {record.originalLines} lines → Optimized: {record.optimizedLines} lines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-neutral-800 p-0.5 border border-neutral-700">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  viewMode === 'unified' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Optimized
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
              title="Copy optimized code"
              aria-label="Copy optimized code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              id="btn-close-diff-header"
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Errors Notice */}
        {record.validationErrors && record.validationErrors.length > 0 && (
          <div className="px-6 py-3 bg-rose-950/40 border-b border-rose-900/50 text-xs text-rose-300 font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-400 uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Type / Syntax Diagnostics Rejected Commit ({record.validationErrors.length} issues):</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200">
              {record.validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Bar */}
        {record.optimizationSummary && (
          <div className="px-6 py-2.5 bg-blue-950/20 border-b border-blue-900/30 text-xs text-blue-300 font-sans flex items-center gap-2">
            <span className="font-semibold text-blue-400 font-mono text-[10px] uppercase tracking-wider">
              Optimization Directive:
            </span>
            <span>{record.optimizationSummary}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-neutral-950 font-mono text-xs text-neutral-300">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Original */}
              <div className="flex flex-col border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/50">
                <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold text-neutral-400 flex items-center justify-between">
                  <span>BEFORE (ORIGINAL)</span>
                  <span className="text-neutral-500">{record.originalLines} lines</span>
                </div>
                <pre className="p-4 overflow-auto text-rose-300/80 leading-relaxed text-[11px] select-text">
                  <code>{record.originalCode}</code>
                </pre>
              </div>

              {/* Optimized */}
              <div className="flex flex-col border border-emerald-950/50 rounded-2xl overflow-hidden bg-emerald-950/10">
                <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                  <span>AFTER (SYNTHESIZED OPTIMA)</span>
                  <span className="text-emerald-500">{record.optimizedLines} lines</span>
                </div>
                <pre className="p-4 overflow-auto text-emerald-300 leading-relaxed text-[11px] select-text">
                  <code>{record.optimizedCode}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/50">
              <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                <span>OPTIMIZED CODE</span>
                <span className="text-neutral-500">{record.optimizedLines} lines</span>
              </div>
              <pre className="p-4 overflow-auto text-emerald-300 leading-relaxed text-xs select-text">
                <code>{record.optimizedCode}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>EMG Core v49 Neural Diff Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
