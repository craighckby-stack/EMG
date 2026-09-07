/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/LogStream.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, ArrowDown, Copy, Check, Filter } from 'lucide-react';
import { TelemetryLog, LogType } from '../types';

interface LogStreamProps {
  logs: TelemetryLog[];
  onClearLogs: () => void;
}

export const LogStream: React.FC<LogStreamProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | LogType>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const streamRef = useRef<HTMLDivElement | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  useEffect(() => {
    if (autoScroll && streamRef.current) {
      streamRef.current.scrollTop = 0; // Since logs are unshifted or we can scroll
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.msg}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeStyle = (type: LogType) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400 font-medium';
      case 'error':
        return 'text-rose-400 font-medium';
      case 'warning':
        return 'text-amber-400 font-medium';
      case 'neural':
        return 'text-sky-300 font-medium';
      case 'noop':
        return 'text-amber-300 font-medium';
      default:
        return 'text-neutral-300';
    }
  };

  const getTypeBadge = (type: LogType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'neural':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'noop':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div
      id="emg-log-stream"
      className="bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col gap-4"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
            Telemetry Event Bus
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800 text-[11px] font-mono">
            {(['all', 'success', 'neural', 'noop', 'error'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded uppercase cursor-pointer transition-colors ${
                  filter === f
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {f === 'noop' ? 'NO-OP' : f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 hover:text-rose-400 text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
            title="Clear event stream"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={streamRef}
        className="h-64 overflow-y-auto bg-neutral-950/80 border border-neutral-900 rounded-2xl p-4 font-mono text-xs space-y-2.5"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600 text-xs">
            <span>Awaiting telemetry broadcast signals...</span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 text-[11px] leading-relaxed pb-2 border-b border-neutral-900/90 last:border-0"
            >
              <span className="text-neutral-500 shrink-0 select-none">
                [{log.timestamp}]
              </span>

              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 border ${getTypeBadge(
                  log.type
                )}`}
              >
                {log.type}
              </span>

              <span className={`flex-1 break-all select-text ${getTypeStyle(log.type)}`}>
                {log.msg}
              </span>

              {log.latencyMs !== undefined && (
                <span className="text-neutral-500 text-[10px] shrink-0">
                  {log.latencyMs}ms
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
