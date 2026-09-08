/**
 * @license
 * Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
 * Copyright (c) 2026 Craighckby
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  EngineStatus,
  EngineConfig,
  EngineMetrics,
  TelemetryLog,
  MutationRecord,
  LogType,
} from './types';
import { SplashView } from './components/SplashView';
import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { ConfigPanel } from './components/ConfigPanel';
import { NeuralChart } from './components/NeuralChart';
import { MutationViewer } from './components/MutationViewer';
import { LogStream } from './components/LogStream';
import { DiffModal } from './components/DiffModal';
import { LicenseModal } from './components/LicenseModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { SaturationModal } from './components/SaturationModal';
import { WipeMemoryModal } from './components/WipeMemoryModal';
import { OracleModal } from './components/OracleModal';
import { SANDBOX_REPOSITORIES, resetSandboxRepositories } from './utils/mockRepo';
import {
  fetchRepoDetails,
  fetchRepoTree,
  fetchFileContent,
  commitFileUpdate,
} from './utils/github';
import { writePostmortem, computeSHA256, computeStringHash } from './utils/postmortem';
import { optimizeSourceCode } from './utils/gemini';
import { sanitizeCode, sanitizeText } from './utils/sanitizer';
import { validateSourceCode, isMarkdownFile, lintSourceCode } from './utils/validator';
import { SaturationAlert } from './types';

const INITIAL_CONFIG: EngineConfig = {
  targetRepo: 'craighckby/sovereign-kernel',
  ghToken: '',
  geminiKey: '',
  model: 'gemini-3.7-flash',
  isSandboxMode: true,
  dryRun: false,
  goal: 'comprehensive',
  loopIntervalSec: 60,
  branch: 'main',
  fileScope: 'all',
  specificFilePath: 'README.md',
  autoSanitize: true,
  strictTypeCheck: true,
  autoApproveSaturated: true,
};

const INITIAL_METRICS: EngineMetrics = {
  enhancements: 0,
  noops: 0,
  validations: 0,
  retries: 0,
  totalScannedFiles: 4,
  avgLatencyMs: 0,
  tokensProcessed: 0,
  sanitizedSecretsCount: 0,
  syntaxErrorsPrevented: 0,
};

export default function App() {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState<EngineStatus>('IDLE');
  const [activePath, setActivePath] = useState<string | null>(null);
  const [config, setConfig] = useState<EngineConfig>(INITIAL_CONFIG);
  const [metrics, setMetrics] = useState<EngineMetrics>(INITIAL_METRICS);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<number[]>(Array(20).fill(0));
  const [latestLatency, setLatestLatency] = useState<number>(0);
  const [selectedRecord, setSelectedRecord] = useState<MutationRecord | null>(null);
  const [saturationAlert, setSaturationAlert] = useState<SaturationAlert | null>(null);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isWipeMemoryOpen, setIsWipeMemoryOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isCycling, setIsCycling] = useState(false);

  const isCyclingRef = useRef(false);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileIndexRef = useRef(0);
  const consecutiveFailuresRef = useRef<Record<string, number>>({});
  const cooldownUntilRef = useRef<number>(0);

  // Push structured log
  const pushLog = useCallback(
    (msg: string, type: LogType = 'info', latencyMs?: number, path?: string) => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
      const cleanMsg = sanitizeText(msg);
      const newLog: TelemetryLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        type,
        msg: cleanMsg,
        latencyMs,
        path,
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 150));
    },
    []
  );

  // Complete memory purge & engine state reset
  const handleWipeMemory = useCallback(
    (options: { resetConfig: boolean } = { resetConfig: true }) => {
      // 1. Terminate autonomous cycle if running
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      isCyclingRef.current = false;
      fileIndexRef.current = 0;
      consecutiveFailuresRef.current = {};
      cooldownUntilRef.current = 0;
      setIsLive(false);
      setStatus('IDLE');
      setIsCycling(false);
      setActivePath(null);

      // 2. Reset in-memory sandbox repositories to clean initial templates
      resetSandboxRepositories();

      // 3. Reset metrics & latency history
      setMetrics(INITIAL_METRICS);
      setMutations([]);
      setLatencyHistory(Array(20).fill(0));
      setLatestLatency(0);
      setSelectedRecord(null);
      setSaturationAlert(null);

      // 4. Clear browser storage cache
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore
      }

      // 5. Reset configuration or clear skip list
      if (options.resetConfig) {
        setConfig(INITIAL_CONFIG);
      } else {
        setConfig((prev) => ({
          ...prev,
          skippedFiles: [],
        }));
      }

      // 6. Push fresh bootstrap log
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
      const purgeLog: TelemetryLog = {
        id: `log-${Date.now()}-purge`,
        timestamp,
        type: 'success',
        msg: '[MEMORY PURGE] Memory wiped & cache emptied. Sandbox repositories restored to initial seed, metrics zeroed, and engine state reset to baseline.',
      };
      setLogs([purgeLog]);
    },
    []
  );

  // Push latency data point to telemetry
  const recordLatency = useCallback((val: number) => {
    setLatestLatency(val);
    setLatencyHistory((prev) => {
      const next = [...prev.slice(1), val];
      return next;
    });
  }, []);

  // Update Config handler
  const handleConfigChange = (key: keyof EngineConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Skip List & Saturation Handlers
  const handleAddToSkipList = (path: string, resumeLoop: boolean = true, autoApproveFuture: boolean = false) => {
    const current = config.skippedFiles || [];
    const newSkipList = current.includes(path) ? current : [...current, path];
    setConfig((prev) => ({
      ...prev,
      skippedFiles: newSkipList,
      ...(autoApproveFuture ? { autoApproveSaturated: true } : {}),
    }));
    pushLog(`[SKIP LIST] File [${path}] added to skip list and will be skipped in future passes.`, 'warning');
    if (autoApproveFuture) {
      pushLog('[CONFIG] Auto-approve saturated files enabled for future cycles.', 'info');
    }
    setSaturationAlert(null);
    if (resumeLoop) {
      setIsLive(true);
      pushLog('Resuming autonomous optimization loop...', 'info');
    }
  };

  const handleKeepInRotation = (resumeLoop: boolean = true) => {
    if (saturationAlert?.path) {
      pushLog(`[ROTATION] File [${saturationAlert.path}] kept in candidate rotation.`, 'info');
    }
    setSaturationAlert(null);
    if (resumeLoop) {
      setIsLive(true);
      pushLog('Resuming autonomous optimization loop...', 'info');
    }
  };

  // Run a single optimization pass
  const executeCycle = useCallback(async () => {
    if (isCyclingRef.current) return;
    if (Date.now() < cooldownUntilRef.current) return; // Currently cooling down
    isCyclingRef.current = true;
    setIsCycling(true);

    try {
      if (config.isSandboxMode) {
        // --- SANDBOX SIMULATED WORKFLOW ---
        setStatus('SCANNING');
        pushLog(`Scanning sandbox repository "${config.targetRepo}"...`, 'info');

        const repoData = SANDBOX_REPOSITORIES[config.targetRepo] || SANDBOX_REPOSITORIES['craighckby/sovereign-kernel'];
        let candidateFiles = repoData.files;

        // Filter out skipped files
        const skippedSet = new Set(config.skippedFiles || []);
        candidateFiles = candidateFiles.filter((f) => !skippedSet.has(f.path));

        // Apply File Scope filter
        if (config.fileScope === 'markdown-only') {
          const mdFiles = candidateFiles.filter((f) => isMarkdownFile(f.path));
          if (mdFiles.length > 0) {
            candidateFiles = mdFiles;
          } else {
            pushLog(`No markdown files found matching scope filter.`, 'warning');
          }
        } else if (config.fileScope === 'specific' && config.specificFilePath?.trim()) {
          const query = config.specificFilePath.trim().toLowerCase();
          const matched = candidateFiles.filter(
            (f) => f.path.toLowerCase().includes(query) || f.path.toLowerCase() === query
          );
          if (matched.length > 0) {
            candidateFiles = matched;
          }
        }

        // Prefer files that haven't failed repeatedly if alternatives exist
        const healthyCandidates = candidateFiles.filter(
          (f) => (consecutiveFailuresRef.current[f.path] || 0) < 3
        );
        if (healthyCandidates.length > 0) {
          candidateFiles = healthyCandidates;
        } else if (candidateFiles.length > 0) {
          pushLog(
            `[AUTONOMOUS LOOP] All candidate files have reached max failure threshold. Pausing loop to prevent infinite cycling.`,
            'warning'
          );
          if (isLive) {
            setIsLive(false);
          }
          setStatus('IDLE');
          return;
        }

        if (candidateFiles.length === 0) {
          pushLog(
            `[GLOBAL SATURATION REACHED] All candidate files have achieved neural saturation and optimization. The repository is fully optimized. 🏁`,
            'success'
          );
          if (isLive) {
            setIsLive(false);
          }
          setActivePath(null);
          setStatus('IDLE');
          return;
        }

        setMetrics((prev) => ({ ...prev, totalScannedFiles: candidateFiles.length }));

        // Sequential round-robin selection
        const targetFile = candidateFiles[fileIndexRef.current % candidateFiles.length];
        fileIndexRef.current = (fileIndexRef.current + 1) % candidateFiles.length;
        setActivePath(targetFile.path);

        setStatus('OPTIMIZING');
        pushLog(`Synthesizing neural mutations for [${targetFile.path}]...`, 'neural', undefined, targetFile.path);

        const result = await optimizeSourceCode(
          targetFile.content,
          targetFile.path,
          config.geminiKey,
          config.goal,
          config.model,
          config.isSandboxMode,
          config.postmortemConstraints
        );

        let cleanCode = result.optimizedCode;
        let scrubbedCount = result.redactedSecretsCount || 0;

        // 1. AUTO-SANITIZATION PASS
        if (config.autoSanitize !== false) {
          const san = sanitizeCode(cleanCode, targetFile.path);
          cleanCode = san.sanitized;
          scrubbedCount += san.redactedCount;
          if (san.redactedCount > 0) {
            pushLog(
              `[AUTO-SANITIZER] Scrubbed ${san.redactedCount} token/secret(s) from [${targetFile.path}]: ${san.redactedTypes.join(', ')}`,
              'warning',
              undefined,
              targetFile.path
            );
          }
        }

        // 2. STRICT TYPE & AST SYNTAX VERIFIER
        let validationDiagnostics: string[] = [];
        if (config.strictTypeCheck !== false) {
          const val = await validateSourceCode(cleanCode, targetFile.path);
          if (val.autoHealed && val.healedCode) {
            cleanCode = val.healedCode;
            pushLog(`[AUTO-HEALED] Fixed syntax/delimiter issue in [${targetFile.path}].`, 'info', undefined, targetFile.path);
          }

          if (!val.valid) {
            validationDiagnostics = val.errors.map((e) => `Line ${e.line}, Col ${e.column}: ${e.message}`);
            pushLog(
              `[TYPE/SYNTAX REJECTED] Commit aborted for [${targetFile.path}] due to ${val.errors.length} defect(s): ${validationDiagnostics.slice(0, 2).join(' | ')}`,
              'error',
              result.latencyMs,
              targetFile.path
            );

            // Record failed mutation in history
            const failedRecord: MutationRecord = {
              id: `mut-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              path: targetFile.path,
              originalCode: targetFile.content,
              optimizedCode: cleanCode,
              originalLines: targetFile.content.split('\n').length,
              optimizedLines: cleanCode.split('\n').length,
              latencyMs: result.latencyMs,
              optimizationSummary: `Type/Syntax verification rejected: ${val.errors[0]?.message || 'Type error'}`,
              status: 'failed',
              validationErrors: validationDiagnostics,
              redactedCount: scrubbedCount,
              typeChecked: true,
            };

            setMutations((prev) => [failedRecord, ...prev]);
            recordLatency(result.latencyMs);
            setMetrics((prev) => ({
              ...prev,
              validations: (prev.validations || 0) + 1,
              syntaxErrorsPrevented: (prev.syntaxErrorsPrevented || 0) + 1,
              sanitizedSecretsCount: (prev.sanitizedSecretsCount || 0) + scrubbedCount,
            }));

            consecutiveFailuresRef.current[targetFile.path] =
              (consecutiveFailuresRef.current[targetFile.path] || 0) + 1;

            if (consecutiveFailuresRef.current[targetFile.path] >= 3) {
              pushLog(
                `[AUTONOMOUS LOOP] File [${targetFile.path}] rejected by type/syntax validator ${consecutiveFailuresRef.current[targetFile.path]} consecutive times. Auto-rotating to next candidate file.`,
                'warning',
                undefined,
                targetFile.path
              );
            }

            setStatus('IDLE');
            return;
          } else {
            consecutiveFailuresRef.current[targetFile.path] = 0;
            pushLog(`[TYPE-SAFE] AST syntax & type contracts verified for [${targetFile.path}].`, 'info', undefined, targetFile.path);
          }
        }

        // --- SAME-FILE CHECK BEFORE COMMIT ---
        const originalContent = targetFile.content;
        const isIdentical = cleanCode.trim() === originalContent.trim();

        if (isIdentical) {
          // Log no-op event
          pushLog(
            `[NO-OP] Code saturation reached for [${targetFile.path}]: AI generated identical content (0 diffs). Commit skipped.`,
            'noop',
            result.latencyMs,
            targetFile.path
          );

          recordLatency(result.latencyMs);
          setMetrics((prev) => ({
            ...prev,
            noops: (prev.noops || 0) + 1,
            validations: (prev.validations || 0) + (config.strictTypeCheck !== false ? 1 : 0),
            sanitizedSecretsCount: (prev.sanitizedSecretsCount || 0) + scrubbedCount,
            tokensProcessed: prev.tokensProcessed + (result.tokensEstimate || 0),
          }));

          if (config.autoApproveSaturated) {
            // Auto-skip list saturated file without pausing loop
            const currentSkipList = config.skippedFiles || [];
            if (!currentSkipList.includes(targetFile.path)) {
              setConfig((prev) => ({
                ...prev,
                skippedFiles: [...(prev.skippedFiles || []), targetFile.path],
              }));
            }
            pushLog(
              `[AUTO-APPROVED] File [${targetFile.path}] auto-skipped due to code saturation (0 diffs). Continuing loop...`,
              'warning',
              undefined,
              targetFile.path
            );
            setStatus('IDLE');
          } else {
            // Auto-pause loop on saturation
            if (isLive) {
              setIsLive(false);
            }
            setStatus('IDLE');

            // Trigger Saturation Alert Modal
            setSaturationAlert({
              path: targetFile.path,
              content: originalContent,
              summary: result.summary,
              latencyMs: result.latencyMs,
              timestamp: new Date().toLocaleTimeString(),
            });
          }

          return;
        }

        // --- HEURISTIC LINTING (SANDBOX) ---
        setStatus('LINTING');
        pushLog(`Running heuristic linting for [${targetFile.path}]...`, 'info', undefined, targetFile.path);
        const extVal = await lintSourceCode(cleanCode, targetFile.path);
        
        if (!extVal.valid) {
          pushLog(`[HEURISTIC LINT REJECTED] Linting failed. Writing post-mortem lesson...`, 'error', undefined, targetFile.path);
          consecutiveFailuresRef.current[targetFile.path] = (consecutiveFailuresRef.current[targetFile.path] || 0) + 1;
          setStatus('IDLE');
          return;
        }
        pushLog(`[HEURISTIC LINT PASSED] Linting passed.`, 'success', undefined, targetFile.path);

        // Apply mutation to sandbox store
        if (!config.dryRun) {
          targetFile.content = cleanCode;
        }

        // Auto-mark file as optimized in current session so it does not cycle infinitely
        const currentSandboxSkip = config.skippedFiles || [];
        if (!currentSandboxSkip.includes(targetFile.path)) {
          setConfig((prev) => ({
            ...prev,
            skippedFiles: [...(prev.skippedFiles || []), targetFile.path],
          }));
        }

        const originalLines = originalContent.split('\n').length;
        const optimizedLines = cleanCode.split('\n').length;

        // Record mutation
        const record: MutationRecord = {
          id: `mut-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          path: targetFile.path,
          originalCode: originalContent,
          optimizedCode: cleanCode,
          originalLines,
          optimizedLines,
          latencyMs: result.latencyMs,
          optimizationSummary: result.summary,
          status: config.dryRun ? 'dry-run' : 'applied',
          redactedCount: scrubbedCount,
          typeChecked: config.strictTypeCheck !== false,
        };

        setMutations((prev) => [record, ...prev]);
        recordLatency(result.latencyMs);

        // Update metrics
        setMetrics((prev) => {
          const newEnhancements = prev.enhancements + 1;
          const newTokens = prev.tokensProcessed + result.tokensEstimate;
          const newAvgLatency = prev.avgLatencyMs === 0
            ? result.latencyMs
            : Math.round((prev.avgLatencyMs * prev.enhancements + result.latencyMs) / newEnhancements);

          return {
            ...prev,
            enhancements: newEnhancements,
            tokensProcessed: newTokens,
            avgLatencyMs: newAvgLatency,
            validations: (prev.validations || 0) + (config.strictTypeCheck !== false ? 1 : 0),
            sanitizedSecretsCount: (prev.sanitizedSecretsCount || 0) + scrubbedCount,
          };
        });

        setStatus('COMMITTING');
        pushLog(
          `Mutation applied: ${targetFile.path} (${result.latencyMs}ms) - ${result.summary}`,
          'success',
          result.latencyMs,
          targetFile.path
        );

      } else {
        // --- REAL GITHUB LIVE REPOSITORY WORKFLOW ---
        if (!config.targetRepo || !config.targetRepo.includes('/')) {
          throw new Error('Invalid Target Repository format. Please use "owner/repo".');
        }

        setStatus('SCANNING');
        pushLog(`Handshaking with GitHub repo "${config.targetRepo}"...`, 'info');

        const repoInfo = await fetchRepoDetails(config.targetRepo, config.ghToken);
        const branch = (config.branch && config.branch.trim()) ? config.branch.trim() : (repoInfo.default_branch || 'main');

        pushLog(`Discovering file tree for branch [${branch}]...`, 'info');
        const tree = await fetchRepoTree(config.targetRepo, branch, config.ghToken);

        if (tree.length === 0) {
          throw new Error('No candidate source code files found in repository tree.');
        }

        let skippedSet = new Set(config.skippedFiles || []);
        
        // --- PERMANENT LAB FIXTURE PROTECTION (PM#9: Freeze Apparatus) ---
        const protectedFixtures = [
          'docs/POSTMORTEMS.md',
          'POSTMORTEMS.md',
          'BUGS.md',
          'docs/BUGS.md',
          'README.md'
        ];
        for (const fixture of protectedFixtures) {
          skippedSet.add(fixture);
        }
        
        // --- 1 & 2. PRE-PASS: Read POSTMORTEMS.md and load rules if changed ---
        const postmortemItem = tree.find(i => i.path === 'docs/POSTMORTEMS.md' || i.path === 'POSTMORTEMS.md');
        if (postmortemItem) {
          try {
            const pmData = await fetchFileContent(config.targetRepo, postmortemItem.path, config.ghToken, branch);
            const sha256Hash = await computeSHA256(pmData.content);
            
            if (sha256Hash !== config.postmortemHash) {
              const prevHashShort = config.postmortemHash ? config.postmortemHash.slice(0, 12) : 'NONE';
              const newHashShort = sha256Hash.slice(0, 12);
              pushLog(
                `[LEARNING] Detected updated ${postmortemItem.path} (SHA-256: ${newHashShort}... | Prev: ${prevHashShort}...). Ingesting updated negative constraints and re-arming prompt memory.`,
                'info'
              );
              
              // Invalidate skip list for candidate code re-evaluation, preserving permanent fixture locks
              setConfig(prev => ({
                ...prev,
                postmortemHash: sha256Hash,
                postmortemConstraints: pmData.content,
                skippedFiles: protectedFixtures,
              }));
              skippedSet = new Set(protectedFixtures);
              pushLog(`[LEARNING] Skip-list invalidated due to ledger hash mutation (${sha256Hash}). All candidate files re-armed (Lab fixtures remain write-protected).`, 'warning');
            }
          } catch (e) {
            pushLog(`Failed to fetch postmortems: ${String(e)}`, 'error');
          }
        }

        // Filter out skipped files
        let candidateTree = tree.filter((item) => !skippedSet.has(item.path));

        // Apply File Scope filter
        if (config.fileScope === 'markdown-only') {
          const mdFiles = candidateTree.filter((item) => isMarkdownFile(item.path));
          if (mdFiles.length > 0) {
            candidateTree = mdFiles;
          } else {
            pushLog(`No markdown files found matching scope filter.`, 'warning');
          }
        } else if (config.fileScope === 'specific' && config.specificFilePath?.trim()) {
          const query = config.specificFilePath.trim().toLowerCase();
          const matched = candidateTree.filter(
            (item) => item.path.toLowerCase().includes(query) || item.path.toLowerCase() === query
          );
          if (matched.length > 0) {
            candidateTree = matched;
          } else {
            pushLog(`Specified file "${config.specificFilePath}" not found in filtered tree.`, 'warning');
          }
        }

        // Prefer files that haven't failed repeatedly if alternatives exist
        const healthyCandidates = candidateTree.filter(
          (item) => (consecutiveFailuresRef.current[item.path] || 0) < 3
        );
        if (healthyCandidates.length > 0) {
          candidateTree = healthyCandidates;
        } else if (candidateTree.length > 0) {
          pushLog(
            `[AUTONOMOUS LOOP] All repository candidate files have reached max failure threshold. Pausing loop to prevent cycling.`,
            'warning'
          );
          if (isLive) {
            setIsLive(false);
          }
          setStatus('IDLE');
          return;
        }

        if (candidateTree.length === 0) {
          pushLog(
            `[GLOBAL SATURATION REACHED] All candidate files have achieved neural saturation and optimization. The repository is fully optimized. 🏁`,
            'success'
          );
          if (isLive) {
            setIsLive(false);
          }
          setActivePath(null);
          setStatus('IDLE');
          return;
        }

        setMetrics((prev) => ({ ...prev, totalScannedFiles: candidateTree.length }));

        // Select candidate file sequentially (round-robin)
        const target = candidateTree[fileIndexRef.current % candidateTree.length];
        fileIndexRef.current = (fileIndexRef.current + 1) % candidateTree.length;
        setActivePath(target.path);

        setStatus('FETCHING');
        pushLog(`Fetching source blob: ${target.path}...`, 'info');
        const fileData = await fetchFileContent(config.targetRepo, target.path, config.ghToken, branch);

        setStatus('OPTIMIZING');
        pushLog(`Neural AST optimization in progress for [${target.path}]...`, 'neural', undefined, target.path);

        const result = await optimizeSourceCode(
          fileData.content,
          target.path,
          config.geminiKey,
          config.goal,
          config.model,
          config.isSandboxMode,
          config.postmortemConstraints
        );

        let cleanCode = result.optimizedCode;
        let scrubbedCount = result.redactedSecretsCount || 0;

        // 1. AUTO-SANITIZATION PASS
        if (config.autoSanitize !== false) {
          const san = sanitizeCode(cleanCode, target.path);
          cleanCode = san.sanitized;
          scrubbedCount += san.redactedCount;
          if (san.redactedCount > 0) {
            pushLog(
              `[AUTO-SANITIZER] Scrubbed ${san.redactedCount} token/secret(s) from [${target.path}]: ${san.redactedTypes.join(', ')}`,
              'warning',
              undefined,
              target.path
            );
          }
        }

        // 2. STRICT TYPE & AST SYNTAX VERIFIER
        let validationDiagnostics: string[] = [];
        if (config.strictTypeCheck !== false) {
          const val = await validateSourceCode(cleanCode, target.path);
          if (val.autoHealed && val.healedCode) {
            cleanCode = val.healedCode;
            pushLog(`[AUTO-HEALED] Fixed syntax/delimiter issue in [${target.path}].`, 'info', undefined, target.path);
          }

          if (!val.valid) {
            validationDiagnostics = val.errors.map((e) => `Line ${e.line}, Col ${e.column}: ${e.message}`);
            pushLog(
              `[TYPE/SYNTAX REJECTED] Commit aborted for [${target.path}] due to ${val.errors.length} defect(s): ${validationDiagnostics.slice(0, 2).join(' | ')}`,
              'error',
              result.latencyMs,
              target.path
            );

            // Record failed mutation in history
            const failedRecord: MutationRecord = {
              id: `mut-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              path: target.path,
              originalCode: fileData.content,
              optimizedCode: cleanCode,
              originalLines: fileData.content.split('\n').length,
              optimizedLines: cleanCode.split('\n').length,
              latencyMs: result.latencyMs,
              optimizationSummary: `Type/Syntax verification rejected: ${val.errors[0]?.message || 'Type error'}`,
              status: 'failed',
              validationErrors: validationDiagnostics,
              redactedCount: scrubbedCount,
              typeChecked: true,
            };

            setMutations((prev) => [failedRecord, ...prev]);
            recordLatency(result.latencyMs);
            setMetrics((prev) => ({
              ...prev,
              validations: (prev.validations || 0) + 1,
              syntaxErrorsPrevented: (prev.syntaxErrorsPrevented || 0) + 1,
              sanitizedSecretsCount: (prev.sanitizedSecretsCount || 0) + scrubbedCount,
            }));

            consecutiveFailuresRef.current[target.path] =
              (consecutiveFailuresRef.current[target.path] || 0) + 1;

            if (consecutiveFailuresRef.current[target.path] >= 3) {
              pushLog(
                `[AUTONOMOUS LOOP] File [${target.path}] rejected by type/syntax validator ${consecutiveFailuresRef.current[target.path]} consecutive times. Auto-rotating to next candidate file.`,
                'warning',
                undefined,
                target.path
              );
            }

            setStatus('IDLE');
            return;
          } else {
            consecutiveFailuresRef.current[target.path] = 0;
            pushLog(`[TYPE-SAFE] AST syntax & type contracts verified for [${target.path}].`, 'info', undefined, target.path);
          }
        }

        // --- SAME-FILE CHECK BEFORE COMMIT ---
        const originalContent = fileData.content;
        const isIdentical = cleanCode.trim() === originalContent.trim();

        if (isIdentical) {
          // Log no-op event
          pushLog(
            `[NO-OP] Code saturation reached for [${target.path}]: AI generated identical content (0 diffs). Commit skipped.`,
            'noop',
            result.latencyMs,
            target.path
          );

          recordLatency(result.latencyMs);
          setMetrics((prev) => ({
            ...prev,
            noops: (prev.noops || 0) + 1,
            validations: (prev.validations || 0) + (config.strictTypeCheck !== false ? 1 : 0),
            sanitizedSecretsCount: (prev.sanitizedSecretsCount || 0) + scrubbedCount,
            tokensProcessed: prev.tokensProcessed + (result.tokensEstimate || 0),
          }));

          if (config.autoApproveSaturated) {
            // Auto-skip list saturated file without pausing loop
            const currentSkipList = config.skippedFiles || [];
            if (!currentSkipList.includes(target.path)) {
              setConfig((prev) => ({
                ...prev,
                skippedFiles: [...(prev.skippedFiles || []), target.path],
              }));
            }
            pushLog(
              `[AUTO-APPROVED] File [${target.path}] auto-skipped due to code saturation (0 diffs). Continuing loop...`,
              'warning',
              undefined,
              target.path
            );
            setStatus('IDLE');
          } else {
            // Auto-pause loop on saturation
            if (isLive) {
              setIsLive(false);
            }
            setStatus('IDLE');

            // Trigger Saturation Alert Modal
            setSaturationAlert({
              path: target.path,
              content: originalContent,
              summary: result.summary,
              latencyMs: result.latencyMs,
              timestamp: new Date().toLocaleTimeString(),
            });
          }

          return;
        }

        // --- HEURISTIC LINTING AND WRITE-BACK ---
        setStatus('LINTING');
        pushLog(`Running heuristic linting for [${target.path}]...`, 'info', undefined, target.path);
        const extVal = await lintSourceCode(cleanCode, target.path);
        
        if (!extVal.valid) {
          pushLog(`[HEURISTIC LINT REJECTED] Gate fired on [${target.path}]: ${extVal.lintEvidence}`, 'error', undefined, target.path);
          if (!config.dryRun && config.ghToken) {
            try {
              const pmResult = await writePostmortem(
                config.targetRepo,
                target.path,
                'Failure',
                extVal.lintEvidence,
                config.ghToken,
                branch,
                {
                  source: 'mutation-cycle',
                  symptom: 'Active Linter / Compiler Gate Rejection on LLM Output (Option B)',
                }
              );
              if (pmResult?.hash) {
                setConfig((prev) => ({
                  ...prev,
                  postmortemHash: pmResult.hash,
                  postmortemConstraints: pmResult.content,
                }));
                pushLog(`[LEARN] Logged failure to docs/POSTMORTEMS.md. Ingested negative constraint for next cycle.`, 'warning');
              }
            } catch (pmErr) {
              pushLog(`Failed to write postmortem: ${String(pmErr)}`, 'error');
            }
          }
          consecutiveFailuresRef.current[target.path] = (consecutiveFailuresRef.current[target.path] || 0) + 1;
          setStatus('IDLE');
          return;
        }

        pushLog(`[HEURISTIC LINT PASSED] Linting passed.`, 'success', undefined, target.path);
        // Successful optimizations do not generate failure postmortems, avoiding commit loops

        const originalLines = originalContent.split('\n').length;
        const optimizedLines = cleanCode.split('\n').length;

        let commitSha = 'dry-run';

        if (!config.dryRun) {
          if (!config.ghToken) {
            throw new Error('GitHub PAT Token is required to commit changes to a real repository.');
          }

          setStatus('COMMITTING');
          pushLog(`Pushing sovereign commit for ${target.path}...`, 'info');
          const commitRes = await commitFileUpdate(
            config.targetRepo,
            target.path,
            cleanCode,
            fileData.sha,
            config.ghToken,
            `EMG Core v49: Neural Optimization on ${target.path}`,
            config.branch
          );
          commitSha = commitRes.commitSha;
        }

        // Auto-mark file as optimized in current session so it does not cycle infinitely
        const currentLiveSkip = config.skippedFiles || [];
        if (!currentLiveSkip.includes(target.path)) {
          setConfig((prev) => ({
            ...prev,
            skippedFiles: [...(prev.skippedFiles || []), target.path],
          }));
        }

        // Record mutation
        const record: MutationRecord = {
          id: `mut-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          path: target.path,
          originalCode: originalContent,
          optimizedCode: cleanCode,
          originalLines,
          optimizedLines,
          latencyMs: result.latencyMs,
          commitSha,
          optimizationSummary: result.summary,
          status: config.dryRun ? 'dry-run' : 'applied',
          redactedCount: scrubbedCount,
          typeChecked: config.strictTypeCheck !== false,
        };

        setMutations((prev) => [record, ...prev]);
        recordLatency(result.latencyMs);

        // Update metrics
        setMetrics((prev) => {
          const newEnhancements = prev.enhancements + 1;
          const newTokens = prev.tokensProcessed + result.tokensEstimate;
          const newAvgLatency = prev.avgLatencyMs === 0
            ? result.latencyMs
            : Math.round((prev.avgLatencyMs * prev.enhancements + result.latencyMs) / newEnhancements);

          return {
            ...prev,
            enhancements: newEnhancements,
            tokensProcessed: newTokens,
            avgLatencyMs: newAvgLatency,
            validations: (prev.validations || 0) + (config.strictTypeCheck !== false ? 1 : 0),
            sanitizedSecretsCount: (prev.sanitizedSecretsCount || 0) + scrubbedCount,
          };
        });

        pushLog(
          `Mutation success: ${target.path} (${result.latencyMs}ms) [${config.dryRun ? 'DRY-RUN' : commitSha.substring(0, 7)}]`,
          'success',
          result.latencyMs,
          target.path
        );
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Unknown optimization fault.';
      const status = err?.status || (err?.isNotFound ? 404 : err?.isRateLimit ? 429 : err?.isCapacity ? 503 : err?.isAuth ? 401 : err?.isConflict ? 409 : 500);
      const lowerMsg = errMsg.toLowerCase();

      setMetrics((prev) => ({ ...prev, retries: prev.retries + 1 }));
      recordLatency(0);
      setStatus('ERROR');

      if (err?.isQuota || lowerMsg.includes('quota') || lowerMsg.includes('resource_exhausted')) {
        pushLog(`[QUOTA EXCEEDED] ${errMsg}`, 'error');
        if (isLive) {
          setIsLive(false);
          pushLog('Autonomous loop paused. You have exceeded your API quota limit. Please check your Google AI Studio billing/plan.', 'error');
        }
      } else if (err?.isRateLimit || status === 429 || lowerMsg.includes('rate limit')) {
        pushLog(`[RATE LIMIT 429] ${errMsg}`, 'warning');
        if (isLive) {
          let retrySeconds = 60;
          const match = errMsg.match(/retry in\s+([0-9.]+)s/i);
          if (match && match[1]) {
            retrySeconds = Math.ceil(parseFloat(match[1])) + 5;
          }
          cooldownUntilRef.current = Date.now() + (retrySeconds * 1000);
          pushLog(`Autonomous loop entering auto-cooldown for ${retrySeconds}s to avoid rate limit exhaustion.`, 'warning');
        }
      } else if (err?.isCapacity || status === 503 || lowerMsg.includes('unavailable') || lowerMsg.includes('high demand') || lowerMsg.includes('capacity')) {
        pushLog(`[CAPACITY 503] ${errMsg}`, 'warning');
        if (isLive) {
          let retrySeconds = 15;
          const match = errMsg.match(/retry in\s+([0-9.]+)s/i);
          if (match && match[1]) {
            retrySeconds = Math.ceil(parseFloat(match[1])) + 2;
          }
          cooldownUntilRef.current = Date.now() + (retrySeconds * 1000);
          pushLog(`Autonomous loop entering auto-cooldown for ${retrySeconds}s due to upstream capacity limits.`, 'warning');
        }
      } else if (err?.isNotFound || status === 404) {
        pushLog(`[404 NOT FOUND] ${errMsg}`, 'error');
      } else if (err?.isAuth || status === 401 || status === 403) {
        pushLog(`[AUTH ERROR ${status}] ${errMsg}`, 'error');
        if (isLive) {
          setIsLive(false);
          pushLog('Autonomous loop paused due to authentication or permission error.', 'error');
        }
      } else if (err?.isConflict || status === 409) {
        pushLog(`[CONFLICT 409] ${errMsg} — Blob SHA mismatch. Re-fetching on next pass.`, 'warning');
      } else {
        pushLog(`[ENGINE FAULT] ${errMsg}`, 'error');
      }
    } finally {
      isCyclingRef.current = false;
      setIsCycling(false);
      setTimeout(() => {
        setStatus('IDLE');
      }, 600);
    }
  }, [config, isLive, pushLog, recordLatency]);

  // Autonomous continuous cycle loop
  useEffect(() => {
    if (isLive) {
      // Run first cycle immediately if not cycling
      if (!isCyclingRef.current) {
        executeCycle();
      }

      const intervalMs = Math.max(15000, config.loopIntervalSec * 1000);
      loopTimerRef.current = setInterval(() => {
        if (!isCyclingRef.current) {
          executeCycle();
        }
      }, intervalMs);

      return () => {
        if (loopTimerRef.current) {
          clearInterval(loopTimerRef.current);
          loopTimerRef.current = null;
        }
      };
    } else {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
        loopTimerRef.current = null;
      }
    }
  }, [isLive, config.loopIntervalSec, executeCycle]);

  // Initial welcome event on initialization
  const handleInitializeSystem = () => {
    setIsAcknowledged(true);
    pushLog('EMG Core v49 Sovereign Engine initialized.', 'info');
    pushLog('Autonomous memory bus & telemetry systems online.', 'success');
  };

  // Toggle Live Autonomous loop
  const handleToggleLive = () => {
    if (!isLive) {
      cooldownUntilRef.current = 0; // Reset cooldown on manual start
      setIsLive(true);
      pushLog('Engaging autonomous continuous mutation loop...', 'info');
    } else {
      setIsLive(false);
      setStatus('IDLE');
      pushLog('Engine terminated by user command.', 'warning');
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  if (!isAcknowledged) {
    return (
      <>
        <SplashView
          onInitialize={handleInitializeSystem}
          onOpenLicense={() => setIsLicenseOpen(true)}
        />
        <LicenseModal
          isOpen={isLicenseOpen}
          onClose={() => setIsLicenseOpen(false)}
        />
      </>
    );
  }

  return (
    <div
      id="emg-app-root"
      className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-3 sm:p-4 md:p-6 flex flex-col gap-5 max-w-7xl mx-auto selection:bg-blue-600 selection:text-white"
    >
      {/* Header */}
      <Header
        isLive={isLive}
        status={status}
        targetRepo={config.targetRepo}
        isSandbox={config.isSandboxMode}
        onToggleLive={handleToggleLive}
        onRunSingleCycle={executeCycle}
        onOpenLicense={() => setIsLicenseOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenWipeMemory={() => setIsWipeMemoryOpen(true)}
        onOpenOracle={() => setIsOracleOpen(true)}
        isCycling={isCycling}
      />

      {/* Stats Grid */}
      <StatsGrid
        metrics={metrics}
        isSandbox={config.isSandboxMode}
        hasGhToken={Boolean(config.ghToken && config.ghToken.length > 5)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Main Content Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 w-full">
          <ConfigPanel
            config={config}
            onChange={handleConfigChange}
            disabled={isLive}
            onOpenWipeMemory={() => setIsWipeMemoryOpen(true)}
          />
        </div>

        {/* Right Column: Neural Pulse Chart, Mutation History & Log Stream */}
        <div className="lg:col-span-8 flex flex-col gap-5 w-full">
          {/* Real-Time Neural Latency Chart */}
          <NeuralChart
            activePath={activePath}
            latencyHistory={latencyHistory}
            latestLatency={latestLatency}
          />

          {/* Mutation History & Diff Trigger */}
          <MutationViewer
            mutations={mutations}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
          />

          {/* Real-time Telemetry Event Stream */}
          <LogStream logs={logs} onClearLogs={handleClearLogs} />
        </div>
      </div>

      {/* Diff Inspector Modal */}
      {selectedRecord && (
        <DiffModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* License & Attribution Modal */}
      <LicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
      />

      {/* System Diagnostics & Kernel Health Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* Oracle Harness & Direct Stress Test Modal (Option A) */}
      <OracleModal
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
        targetRepo={config.targetRepo}
        branch={config.branch}
        token={config.ghToken}
        onPostmortemCreated={(content, hash) => {
          setConfig((prev) => ({
            ...prev,
            postmortemConstraints: content,
            postmortemHash: hash,
          }));
          pushLog(`[ORACLE HARNESS] Ingested new synthetic post-mortem constraint into engine memory.`, 'warning');
        }}
      />

      {/* Code Saturation & Skip List Modal */}
      <SaturationModal
        alert={saturationAlert}
        onClose={() => setSaturationAlert(null)}
        onAddToSkipList={handleAddToSkipList}
        onKeepInRotation={handleKeepInRotation}
        autoApproveSaturated={config.autoApproveSaturated}
      />

      {/* Wipe Memory & System State Reset Modal */}
      <WipeMemoryModal
        isOpen={isWipeMemoryOpen}
        onClose={() => setIsWipeMemoryOpen(false)}
        onConfirmWipe={handleWipeMemory}
      />

      {/* Sovereign Footer */}
      <footer className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] py-4 border-t border-neutral-900 mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>EMG CORE // v49 // SOVEREIGN ENGINE</span>
          <span>•</span>
          <span>CRAIGHCKBY @ 2026</span>
        </div>
        <button
          id="btn-footer-license"
          onClick={() => setIsLicenseOpen(true)}
          className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer underline underline-offset-4 decoration-blue-500/40 hover:decoration-blue-400"
        >
          CC BY-NC-SA 4.0 License
        </button>
      </footer>
    </div>
  );
}
