/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/config.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-152 [2026-09-20T04:01:19.319Z] */
export const RAG_RETRIEVAL_ENABLED =
  (typeof process === "undefined" || process.env?.NEXT_PUBLIC_RAG_RETRIEVAL_ENABLED !== "false") &&
  !(typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_RAG_RETRIEVAL_ENABLED === "false");

export const AUTONOMOUS_HOTSWAP_ENABLED =
  (typeof process === "undefined" || process.env?.AUTONOMOUS_HOTSWAP_ENABLED !== "false") &&
  !(typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_AUTONOMOUS_HOTSWAP_ENABLED === "false");


// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 152,
  timestamp: "2026-09-20T04:01:19.319Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});
