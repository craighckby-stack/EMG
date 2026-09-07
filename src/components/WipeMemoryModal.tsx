/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/WipeMemoryModal.tsx
 * Role: System memory purge and state reset confirmation dialog.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  X,
  AlertTriangle,
  RotateCcw,
  Layers,
  Activity,
  History,
  Ban,
  Database,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface WipeMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmWipe: (options: { resetConfig: boolean }) => void;
}

export const WipeMemoryModal: React.FC<WipeMemoryModalProps> = ({
  isOpen,
  onClose,
  onConfirmWipe,
}) => {
  const [resetConfig, setResetConfig] = useState(true);

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
      id="emg-wipe-memory-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        id="emg-wipe-memory-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Wipe Memory & Reset Engine
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                EMG Core v49 • Complete Cache & State Purge
              </p>
            </div>
          </div>

          <button
            id="btn-close-wipe-modal"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 space-y-4 overflow-y-auto font-sans">
          {/* Warning Banner */}
          <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-neutral-300 leading-relaxed">
              <p className="font-semibold text-rose-200">
                Are you sure you want to wipe memory and reset the engine back to start?
              </p>
              <p className="text-neutral-400 text-[11px]">
                This will empty in-memory caches, stop any active autonomous loops, and restore the engine to baseline.
              </p>
            </div>
          </div>

          {/* Purge Scope Items */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              Purge Scope:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex items-center gap-2.5 text-neutral-300">
                <History className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Clear Mutation History & Diffs</span>
              </div>
              <div className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex items-center gap-2.5 text-neutral-300">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Metrics & Latency Stream</span>
              </div>
              <div className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex items-center gap-2.5 text-neutral-300">
                <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Restore Sandbox Files to Seed</span>
              </div>
              <div className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex items-center gap-2.5 text-neutral-300">
                <Ban className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Clear Saturated Skip List</span>
              </div>
              <div className="p-2.5 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex items-center gap-2.5 text-neutral-300 col-span-1 sm:col-span-2">
                <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Flush Browser Session Storage & Memory Buffers</span>
              </div>
            </div>
          </div>

          {/* Config Reset Toggle */}
          <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between">
            <label htmlFor="chk-reset-config" className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
              <Sliders className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="font-medium text-white block">Reset Engine Configuration</span>
                <span className="text-[11px] text-neutral-500">Restore default model, optimization goal, and loop interval</span>
              </div>
            </label>
            <input
              id="chk-reset-config"
              type="checkbox"
              checked={resetConfig}
              onChange={(e) => setResetConfig(e.target.checked)}
              className="w-4 h-4 rounded accent-rose-600 cursor-pointer shrink-0"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-neutral-800 bg-neutral-950/80 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            id="btn-cancel-wipe"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Cancel</span>
          </button>

          <button
            id="btn-confirm-wipe"
            type="button"
            onClick={() => {
              onConfirmWipe({ resetConfig });
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Memory & Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
