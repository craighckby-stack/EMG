/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/LicenseModal.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState } from 'react';
import {
  Scale,
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Share2,
  GitFork,
  Ban,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LICENSE_TEXT = `Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
[Full text of the license is available at https://creativecommons.org]

Copyright (c) 2026 Craighckby

This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

License Summary:
- Share: Copy and redistribute the material.
- Adapt: Remix, transform, and build upon the material.
- Attribution/NonCommercial/ShareAlike terms apply as detailed at the link above.`;

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LICENSE_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      <div
        id="emg-license-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="emg-license-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header - Fixed / Sticky */}
          <div className="flex items-center justify-between gap-4 p-5 md:p-6 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  License & Attribution
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  CC BY-NC-SA 4.0 International
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-exit-license-header"
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Exit License Modal (Esc)"
                aria-label="Exit License Modal"
              >
                <X className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 md:p-6 overflow-y-auto space-y-5 custom-scrollbar">
            {/* Core Badges & Terms Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Copy and redistribute the material in any medium or format.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Adapt</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Remix, transform, and build upon the material.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <Ban className="w-3.5 h-3.5" />
                  <span>NonCommercial</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Attribution, NonCommercial, & ShareAlike terms apply.
                </p>
              </div>
            </div>

            {/* Full License Block */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap select-text max-h-56 overflow-y-auto custom-scrollbar">
              {LICENSE_TEXT}
            </div>
          </div>

          {/* Footer Controls - Fixed / Sticky */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5 border-t border-neutral-800 bg-neutral-950/70 shrink-0">
            <a
              id="link-creative-commons"
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
            >
              <span>View Deed on Creative Commons</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-license"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/80 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy License</span>
                  </>
                )}
              </button>

              <button
                id="btn-dismiss-license"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                title="Exit and close modal"
                aria-label="Exit modal"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
