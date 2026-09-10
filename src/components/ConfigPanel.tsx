/**
 * File: src/components/ConfigPanel.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Eye,
  EyeOff,
  Github,
  Key,
  Sparkles,
  Shield,
  Gauge,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Lock,
  Globe,
  Search,
  Check,
  FolderGit2,
  AlertTriangle,
  FileText,
  FileCode,
  Layers,
  Ban,
  Plus,
  Trash2,
  X,
  KeyRound,
  ShieldAlert,
  CheckCheck,
  GitBranch,
} from 'lucide-react';
import { EngineConfig, OptimizationGoal, GeminiModelId, FileScopeFilter } from '../types';
import { SANDBOX_REPOSITORIES } from '../utils/mockRepo';
import { fetchServerApiStatus, ServerApiStatus } from '../utils/gemini';
import { fetchUserRepositories, GitHubUserRepo } from '../utils/github';

interface ConfigPanelProps {
  config: EngineConfig;
  onChange: (key: keyof EngineConfig, value: any) => void;
  disabled: boolean;
  onOpenWipeMemory?: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  disabled,
  onOpenWipeMemory,
}) => {
  const [showGhToken, setShowGhToken] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerApiStatus | null>(null);

  // GitHub account repositories state
  const [userRepos, setUserRepos] = useState<GitHubUserRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [isManualRepoMode, setIsManualRepoMode] = useState(false);
  const [repoSearchFilter, setRepoSearchFilter] = useState('');
  const [manualSkipListInput, setManualSkipListInput] = useState('');

  const skippedFiles = config.skippedFiles || [];

  const handleAddSkipList = (pathToAdd: string) => {
    const trimmed = pathToAdd.trim();
    if (!trimmed) return;
    if (!skippedFiles.includes(trimmed)) {
      onChange('skippedFiles', [...skippedFiles, trimmed]);
    }
    setManualSkipListInput('');
  };

  const handleRemoveSkipList = (pathToRemove: string) => {
    onChange(
      'skippedFiles',
      skippedFiles.filter((p) => p !== pathToRemove)
    );
  };

  const handleClearSkipList = () => {
    onChange('skippedFiles', []);
  };

  useEffect(() => {
    fetchServerApiStatus().then(setServerStatus);
  }, []);

  const loadAccountRepos = useCallback(async (token: string) => {
    if (!token || token.trim().length < 8) {
      setUserRepos([]);
      setRepoError(null);
      return;
    }
    setIsLoadingRepos(true);
    setRepoError(null);
    try {
      const repos = await fetchUserRepositories(token);
      setUserRepos(repos);
      // Auto-select first repo if none selected or using sandbox default
      if (repos.length > 0) {
        const isCurrentValid = repos.some((r) => r.full_name.toLowerCase() === config.targetRepo.toLowerCase());
        if (!isCurrentValid && (!config.targetRepo || config.targetRepo.includes('sovereign-kernel') || config.targetRepo === '')) {
          onChange('targetRepo', repos[0].full_name);
          if (repos[0].default_branch) {
            onChange('branch', repos[0].default_branch);
          }
        }
      }
    } catch (err: any) {
      setRepoError(err?.message || 'Failed to fetch repositories from GitHub');
    } finally {
      setIsLoadingRepos(false);
    }
  }, [config.targetRepo, onChange]);

  // Trigger repo loading when token changes or live mode activated
  useEffect(() => {
    if (config.isSandboxMode || !config.ghToken || config.ghToken.trim().length < 8) {
      return;
    }
    const timer = setTimeout(() => {
      loadAccountRepos(config.ghToken);
    }, 450);
    return () => clearTimeout(timer);
  }, [config.ghToken, config.isSandboxMode, loadAccountRepos]);

  const sandboxKeys = Object.keys(SANDBOX_REPOSITORIES);

  // Filter repos by search query
  const filteredRepos = userRepos.filter((r) => {
    if (!repoSearchFilter) return true;
    const q = repoSearchFilter.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q))
    );
  });

  return (
    <div
      id="emg-config-panel"
      className="bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
            Engine Configuration
          </h2>
        </div>

        {/* Sandbox Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const next = !config.isSandboxMode;
              onChange('isSandboxMode', next);
              if (next && !SANDBOX_REPOSITORIES[config.targetRepo]) {
                onChange('targetRepo', sandboxKeys[0]);
              }
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all border cursor-pointer ${
              config.isSandboxMode
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            {config.isSandboxMode ? 'Sandbox Active' : 'Live GitHub Mode'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Model Selection & Auto-Injection Status */}
        <div className="p-3.5 bg-neutral-950/80 border border-neutral-800/90 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Gemini AI Model</span>
            </label>
            {serverStatus?.hasServerGeminiKey ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Key Auto-Injected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-300">
                <Sparkles className="w-3 h-3 text-blue-400" /> Ready
              </span>
            )}
          </div>

          <select
            value={config.model || 'gemini-3.7-flash'}
            disabled={disabled}
            onChange={(e) => onChange('model', e.target.value as GeminiModelId)}
            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500 transition-colors font-mono cursor-pointer"
          >
            <option value="gemini-3.7-flash" className="bg-neutral-900 text-white">
              ⚡ Gemini 3.7 Flash — State-of-the-Art (Fast, High Quality)
            </option>
            <option value="gemini-3.6-flash" className="bg-neutral-900 text-white">
              💨 Gemini 3.6 Flash — Fast, High Efficiency Generation
            </option>
            <option value="gemini-flash-lite-latest" className="bg-neutral-900 text-white">
              🪶 Gemini Flash Lite — Ultra Lightweight & High Throughput
            </option>
            <option value="gemini-2.5-flash" className="bg-neutral-900 text-white">
              🚀 Gemini 2.5 Flash — Stable High-Velocity Generation
            </option>
            <option value="gemini-3.1-pro-preview" className="bg-neutral-900 text-white">
              🧠 Gemini 3.1 Pro — Deep Complex Architecture Reasoning
            </option>
          </select>
          <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
            Requests are automatically proxied via the full-stack server with secure server-side environment key injection.
          </p>
        </div>

        {/* GitHub Token Input (In Live Mode) */}
        {!config.isSandboxMode && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase flex items-center gap-1.5">
                <Key className="w-3 h-3 text-neutral-400" /> GitHub Token (PAT)
              </label>
              <span className="text-[10px] text-neutral-500">repo scope</span>
            </div>
            <div className="relative">
              <input
                id="input-github-token"
                type={showGhToken ? 'text' : 'password'}
                placeholder="ghp_xxxxxxxxxxxx (personal access token)"
                value={config.ghToken}
                disabled={disabled}
                onChange={(e) => onChange('ghToken', e.target.value)}
                className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-2.5 pr-9 text-xs text-white placeholder-neutral-600 outline-none focus:border-blue-500 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGhToken(!showGhToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                {showGhToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Target Repository Selection */}
        {config.isSandboxMode ? (
          <div>
            <label className="block text-[10px] font-mono font-bold text-neutral-400 uppercase mb-1.5 flex items-center justify-between">
              <span>Sandbox Simulated Target</span>
              <span className="text-emerald-400 text-[10px]">Instant Demo</span>
            </label>
            <select
              value={config.targetRepo}
              disabled={disabled}
              onChange={(e) => onChange('targetRepo', e.target.value)}
              className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono cursor-pointer"
            >
              {sandboxKeys.map((key) => (
                <option key={key} value={key} className="bg-neutral-900 text-white">
                  {key} — {SANDBOX_REPOSITORIES[key].description}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-500 mt-1 font-mono">
              Safe testing zone with realistic multi-language source trees.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-neutral-400" /> Target Repository
              </label>

              <div className="flex items-center gap-2">
                {userRepos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsManualRepoMode(!isManualRepoMode)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-mono transition-colors cursor-pointer"
                  >
                    {isManualRepoMode ? 'Account Repos Dropdown' : 'Manual Entry'}
                  </button>
                )}
                {config.ghToken && (
                  <button
                    type="button"
                    disabled={isLoadingRepos}
                    onClick={() => loadAccountRepos(config.ghToken)}
                    title="Refresh account repository list"
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5 disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingRepos ? 'animate-spin text-sky-400' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoadingRepos && (
              <div className="p-3 bg-neutral-950/90 border border-neutral-800 rounded-xl flex items-center gap-2.5 text-xs text-neutral-300 font-mono animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
                <span>Loading repositories from your GitHub account...</span>
              </div>
            )}

            {/* Error Banner with Retry */}
            {repoError && !isLoadingRepos && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span className="truncate">{repoError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => loadAccountRepos(config.ghToken)}
                  className="text-white bg-red-500/20 px-2 py-0.5 rounded text-[10px] font-mono hover:bg-red-500/30 shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Account Repos Dropdown View */}
            {!isManualRepoMode && userRepos.length > 0 && !isLoadingRepos ? (
              <div className="space-y-2">
                {/* Search Filter for large lists */}
                {userRepos.length > 6 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Filter your repositories..."
                      value={repoSearchFilter}
                      onChange={(e) => setRepoSearchFilter(e.target.value)}
                      className="w-full bg-neutral-950/90 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-neutral-500 outline-none focus:border-sky-500 transition-colors font-mono"
                    />
                  </div>
                )}

                <div className="relative">
                  <select
                    id="select-account-repositories"
                    value={config.targetRepo}
                    disabled={disabled}
                    onChange={(e) => {
                      const selectedFullName = e.target.value;
                      onChange('targetRepo', selectedFullName);
                      const found = userRepos.find((r) => r.full_name === selectedFullName);
                      if (found && found.default_branch) {
                        onChange('branch', found.default_branch);
                      }
                    }}
                    className="w-full bg-neutral-950/90 border border-neutral-700/80 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500 transition-colors font-mono cursor-pointer"
                  >
                    {filteredRepos.map((repo) => (
                      <option key={repo.id} value={repo.full_name} className="bg-neutral-900 text-white">
                        {repo.full_name} {repo.private ? '🔒 (Private)' : '🌐 (Public)'} {repo.language ? `• ${repo.language}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono px-1">
                  <span className="flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3 text-sky-400" />
                    {filteredRepos.length} of {userRepos.length} repositories
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" /> Account Synced
                  </span>
                </div>
              </div>
            ) : (
              /* Manual Input Fallback */
              <div>
                <input
                  id="input-target-repo-manual"
                  type="text"
                  placeholder="e.g. username/repo-name"
                  value={config.targetRepo}
                  disabled={disabled}
                  onChange={(e) => onChange('targetRepo', e.target.value)}
                  className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-blue-500 transition-colors font-mono"
                />
                {!config.ghToken && (
                  <p className="text-[10px] text-sky-400/80 mt-1 font-mono flex items-center gap-1">
                    <span>💡 Enter your GitHub Token above to view a dropdown of your repositories.</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Branch Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-target-branch" className="text-[10px] font-mono font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <GitBranch className="w-3 h-3 text-sky-400" /> Target Branch
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">Default: main / auto</span>
          </div>
          <input
            id="input-target-branch"
            type="text"
            placeholder="e.g. main, dev, feature/refactor"
            value={config.branch || ''}
            disabled={disabled}
            onChange={(e) => onChange('branch', e.target.value)}
            className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>

        {/* Custom Gemini Key Override (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-sky-400" /> Custom API Key (Override)
            </label>
            <span className="text-[10px] text-neutral-500">
              {serverStatus?.hasServerGeminiKey ? 'Optional (Env Key Active)' : 'Optional'}
            </span>
          </div>
          <div className="relative">
            <input
              type={showGeminiKey ? 'text' : 'password'}
              placeholder={serverStatus?.hasServerGeminiKey ? 'Using auto-injected environment key...' : 'AIzaSy...'}
              value={config.geminiKey}
              disabled={disabled}
              onChange={(e) => onChange('geminiKey', e.target.value)}
              className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-2.5 pr-9 text-xs text-white placeholder-neutral-600 outline-none focus:border-blue-500 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowGeminiKey(!showGeminiKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Optimization Directive / Goal */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-neutral-400 uppercase mb-1.5">
            Neural Optimization Directive
          </label>
          <select
            value={config.goal}
            disabled={disabled}
            onChange={(e) => onChange('goal', e.target.value as OptimizationGoal)}
            className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer font-sans"
          >
            <option value="comprehensive" className="bg-neutral-900">
              ⚡ Comprehensive (Speed + Safety + Quality)
            </option>
            <option value="performance" className="bg-neutral-900">
              🚀 High-Throughput Performance & Zero-Alloc Memory
            </option>
            <option value="security" className="bg-neutral-900">
              🛡️ Defensive Bounds & Sovereign Memory Protection
            </option>
            <option value="type-safety" className="bg-neutral-900">
              📐 Strict TypeScript Narrowing & Safe Contracts
            </option>
            <option value="readability" className="bg-neutral-900">
              📖 Clean Architecture & Modern Idioms
            </option>
          </select>
        </div>

        {/* File Target & Scope Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" /> Target File Scope
            </label>
            <span className="text-[10px] font-mono text-sky-400">
              {config.fileScope === 'markdown-only'
                ? '📝 Docs Only'
                : config.fileScope === 'specific'
                ? '🎯 Pinned File'
                : '🔄 All Files'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-neutral-950/70 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('fileScope', 'all')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                (!config.fileScope || config.fileScope === 'all')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>All Files</span>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('fileScope', 'markdown-only')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                config.fileScope === 'markdown-only'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Docs (.md)</span>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange('fileScope', 'specific');
                if (!config.specificFilePath) {
                  onChange('specificFilePath', 'README.md');
                }
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                config.fileScope === 'specific'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <span>🎯 Custom</span>
            </button>
          </div>

          {config.fileScope === 'specific' && (
            <div className="mt-2 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>Specific File Path:</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange('specificFilePath', 'README.md')}
                  className="text-sky-400 hover:underline cursor-pointer"
                >
                  Set to README.md
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. README.md, src/core/allocator.ts"
                value={config.specificFilePath || ''}
                disabled={disabled}
                onChange={(e) => onChange('specificFilePath', e.target.value)}
                className="w-full bg-neutral-950/90 border border-neutral-700 rounded-xl p-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-sky-500 transition-colors font-mono"
              />
            </div>
          )}
        </div>

        {/* Skipped & Saturated Files Manager */}
        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-amber-400" />
              <span>Saturated & Skipped Files</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                {skippedFiles.length}
              </span>
            </label>
            {skippedFiles.length > 0 && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleClearSkipList}
                className="text-[10px] font-mono text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Clear Skip List
              </button>
            )}
          </div>

          {/* Auto-Approve Saturated Toggle Checkbox */}
          <div className="p-2.5 bg-neutral-900/90 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3">
            <label htmlFor="toggle-auto-approve-saturated" className="flex items-center gap-2 cursor-pointer select-none min-w-0">
              <CheckCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-200 truncate">Auto-Approve Saturated Files</div>
                <div className="text-[10px] text-neutral-400 font-mono leading-tight">
                  Automatically skip list 0-diff files without stopping the loop
                </div>
              </div>
            </label>
            <input
              type="checkbox"
              id="toggle-auto-approve-saturated"
              checked={Boolean(config.autoApproveSaturated)}
              disabled={disabled}
              onChange={(e) => onChange('autoApproveSaturated', e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
            />
          </div>

          {/* Quick add input */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="e.g. README.md, src/types.ts"
              value={manualSkipListInput}
              disabled={disabled}
              onChange={(e) => setManualSkipListInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkipList(manualSkipListInput);
                }
              }}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition-colors font-mono"
            />
            <button
              type="button"
              disabled={disabled || !manualSkipListInput.trim()}
              onClick={() => handleAddSkipList(manualSkipListInput)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Add file to skip list"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          </div>

          {/* List of skip listed paths */}
          {skippedFiles.length === 0 ? (
            <p className="text-[10px] text-neutral-500 font-mono italic">
              No files skip listed. Saturated files with 0 diffs will prompt to be skipped here.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {skippedFiles.map((path) => (
                <div
                  key={path}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-900 border border-amber-500/30 text-amber-300 text-[11px] font-mono group"
                >
                  <span className="truncate max-w-[170px]" title={path}>
                    {path}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRemoveSkipList(path)}
                    className="p-0.5 text-neutral-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Remove from skip list"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loop Interval Slider */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400 uppercase mb-1.5">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3 h-3 text-amber-400" /> Cycle Frequency
            </span>
            <span className="text-amber-400 font-bold">{config.loopIntervalSec}s interval</span>
          </div>
          <input
            type="range"
            min={4}
            max={60}
            step={2}
            value={config.loopIntervalSec}
            disabled={disabled}
            onChange={(e) => onChange('loopIntervalSec', Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-1">
            <span>Fast (4s)</span>
            <span>Standard (15s)</span>
            <span>Production (60s)</span>
          </div>
        </div>

        {/* Auto-Sanitizer Guard */}
        <div className="pt-2.5 border-t border-neutral-800/80">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Auto-Sanitize Secrets & PATs
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                Strip GitHub PATs, Gemini/OpenAI/Stripe keys & credentials before push
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-auto-sanitize"
              checked={config.autoSanitize !== false}
              disabled={disabled}
              onChange={(e) => onChange('autoSanitize', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Strict Type & Syntax Verifier */}
        <div className="pt-2.5 border-t border-neutral-800/80">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Strict Type & Syntax Verifier
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                Reject code containing broken types, unmatched braces, or AST parse errors
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-strict-typecheck"
              checked={config.strictTypeCheck !== false}
              disabled={disabled}
              onChange={(e) => onChange('strictTypeCheck', e.target.checked)}
              className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Dry Run Toggle */}
        <div className="pt-2.5 border-t border-neutral-800/80">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" /> Dry-Run Guard
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                Simulate AST enhancements without remote git push
              </div>
            </div>
            <input
              type="checkbox"
              id="toggle-dry-run"
              checked={config.dryRun}
              disabled={disabled}
              onChange={(e) => onChange('dryRun', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
          </label>
        </div>

        {/* Memory & Cache Purge */}
        {onOpenWipeMemory && (
          <div className="pt-3 border-t border-neutral-800/80">
            <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Memory & Cache Wipe</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  Flush mutation records, reset sandbox files & baseline
                </div>
              </div>
              <button
                type="button"
                id="btn-config-wipe-memory"
                disabled={disabled}
                onClick={onOpenWipeMemory}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-mono font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                <span>Wipe All</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
