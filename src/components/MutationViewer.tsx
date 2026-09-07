/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/MutationViewer.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React from 'react';
import { GitCommit, Eye, FileCode2, Clock, CheckCircle2, Shield, AlertTriangle, KeyRound, Ban } from 'lucide-react';
import { MutationRecord } from '../types';

interface MutationViewerProps {
  mutations: MutationRecord[];
  onSelectRecord: (record: MutationRecord) => void;
}

export const MutationViewer: React.FC<MutationViewerProps> = ({
  mutations,
  onSelectRecord,
}) => {
  return (
    <div
      id="emg-mutations-panel"
      className="bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
            Applied Code Mutations
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
          {mutations.length} records
        </span>
      </div>

      {mutations.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500 font-mono flex flex-col items-center justify-center gap-2 border border-dashed border-neutral-800 rounded-2xl">
          <FileCode2 className="w-6 h-6 text-neutral-600" />
          <span>Awaiting first neural mutation pass...</span>
          <span className="text-[10px] text-neutral-600">Engage engine or run a manual pass to start</span>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {mutations.map((mut) => {
            const isFailed = mut.status === 'failed';
            const isNoop = mut.status === 'noop';
            const isApplied = mut.status === 'applied';

            return (
              <div
                key={mut.id}
                onClick={() => onSelectRecord(mut)}
                className={`p-3 bg-neutral-950/60 hover:bg-neutral-900 border rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isFailed
                    ? 'border-rose-900/50 hover:border-rose-700'
                    : isNoop
                    ? 'border-amber-900/40 hover:border-amber-700'
                    : 'border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      isFailed
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : isNoop
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isFailed ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isNoop ? (
                      <Ban className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold text-neutral-200 group-hover:text-blue-400 transition-colors truncate">
                      {mut.path}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>{mut.timestamp}</span>
                      <span>•</span>
                      <span className="text-amber-400">{mut.latencyMs}ms</span>
                      <span>•</span>
                      <span className="text-neutral-500">
                        {mut.originalLines}L → {mut.optimizedLines}L
                      </span>
                      {(mut.redactedCount || 0) > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <KeyRound className="w-2.5 h-2.5" />
                            {mut.redactedCount} scrubbed
                          </span>
                        </>
                      )}
                      {mut.validationErrors && mut.validationErrors.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 font-bold">
                            {mut.validationErrors.length} type err(s)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                      isApplied
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isFailed
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : isNoop
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}
                  >
                    {mut.status}
                  </span>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-neutral-800 group-hover:bg-blue-600 group-hover:text-white text-neutral-400 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
