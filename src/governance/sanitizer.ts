/**
 * EMG Sovereign Kernel - Edge Security Sanitizer & Governance Gatekeeper
 * File: src/governance/sanitizer.ts
 */

import { queryEmgRag } from '../memory/emg_rag';

export type ErrorClass = 'HARDCODED_CRED' | 'SECRET_LEAKAGE' | 'PII' | 'AST_PARSE' | 'CLEAN';

export interface SecuritySanitizerResult {
  readonly clean: boolean;
  readonly sanitizedCode: string;
  readonly errorClass?: ErrorClass;
  readonly violations: string[];
  readonly autoAppliedFix?: string;
}

const SECRET_PATTERNS = [
  /AIzaSy[A-Za-z0-9_-]{33}/g, // Google / Gemini API Keys
  /ghp_[A-Za-z0-9]{36}/g,     // GitHub Personal Access Token
  /sk-[A-Za-z0-9]{32,48}/g,    // OpenAI API Key
  /AKIA[0-9A-Z]{16}/g,        // AWS Access Key ID
  /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
  /https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9_]+/g,
];

const PII_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  /\b\d{3}-\d{2}-\d{4}\b/g,                          // SSN
];

const HARDCODED_CRED_REGEX = /(?:api[_-]?key|secret|password|auth[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_~.+-]{16,}["']/gi;

/**
 * Validates AST balance for basic JSX/TS syntax safety.
 */
function checkAstParseBalance(code: string): { valid: boolean; error?: string } {
  let braceCount = 0;
  let bracketCount = 0;
  let parenCount = 0;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '{') braceCount++;
    else if (char === '}') braceCount--;
    else if (char === '[') bracketCount++;
    else if (char === ']') bracketCount--;
    else if (char === '(') parenCount++;
    else if (char === ')') parenCount--;

    if (braceCount < 0 || bracketCount < 0 || parenCount < 0) {
      return { valid: false, error: 'Unbalanced structural closing delimiter' };
    }
  }

  if (braceCount !== 0 || bracketCount !== 0 || parenCount !== 0) {
    return { valid: false, error: `Unbalanced delimiters: braces=${braceCount}, brackets=${bracketCount}, parens=${parenCount}` };
  }

  return { valid: true };
}

/**
 * Calculates Shannon entropy of a string to detect randomized high-entropy secrets/tokens.
 */
function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const len = str.length;
  const freqs: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    freqs[char] = (freqs[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in freqs) {
    const p = freqs[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Scans code for high-entropy tokens (e.g. raw secret keys or tokens with Shannon entropy > 4.5).
 */
function scanHighEntropyTokens(code: string): { found: boolean; tokens: string[] } {
  const tokenRegex = /["']([A-Za-z0-9_\-~.+=]{24,})["']/g;
  const matches = [...code.matchAll(tokenRegex)];
  const highEntropyTokens: string[] = [];

  for (const match of matches) {
    const candidate = match[1];
    if (candidate) {
      const entropy = calculateShannonEntropy(candidate);
      if (entropy > 4.5 && !candidate.startsWith('http') && !candidate.startsWith('/') && !candidate.includes(' ')) {
        highEntropyTokens.push(candidate);
      }
    }
  }

  return {
    found: highEntropyTokens.length > 0,
    tokens: highEntropyTokens,
  };
}

/**
 * Core Security Sanitizer & Edge Governance Gatekeeper.
 */
export function sanitizeAndGovern(filePath: string, proposedCode: string): SecuritySanitizerResult {
  const violations: string[] = [];
  let sanitizedCode = proposedCode;
  let primaryErrorClass: ErrorClass | undefined = undefined;

  // 1. Check Secret Leakage & Hardcoded Credentials
  let hasSecretLeak = false;
  SECRET_PATTERNS.forEach((pattern) => {
    if (pattern.test(proposedCode)) {
      hasSecretLeak = true;
      sanitizedCode = sanitizedCode.replace(pattern, '[REDACTED_SECRET_KEY]');
    }
  });

  if (hasSecretLeak) {
    violations.push('SECRET_LEAKAGE: Detected hardcoded API keys/secrets.');
    primaryErrorClass = 'SECRET_LEAKAGE';
  }

  if (HARDCODED_CRED_REGEX.test(proposedCode)) {
    violations.push('HARDCODED_CRED: Detected hardcoded credentials or auth tokens.');
    if (!primaryErrorClass) primaryErrorClass = 'HARDCODED_CRED';
  }

  // Shannon Entropy Secret Scan (siphoned from AI_Agent_OS)
  const entropyScan = scanHighEntropyTokens(proposedCode);
  if (entropyScan.found) {
    violations.push(`SECRET_LEAKAGE: Detected ${entropyScan.tokens.length} high-entropy token(s) (Shannon entropy > 4.5).`);
    entropyScan.tokens.forEach((tok) => {
      sanitizedCode = sanitizedCode.replaceAll(tok, '[REDACTED_HIGH_ENTROPY_SECRET]');
    });
    if (!primaryErrorClass) primaryErrorClass = 'SECRET_LEAKAGE';
  }

  // 2. Check PII
  PII_PATTERNS.forEach((pattern) => {
    if (pattern.test(proposedCode)) {
      violations.push('PII: Detected unredacted Personal Identifiable Information (email/SSN).');
      sanitizedCode = sanitizedCode.replace(pattern, '[REDACTED_PII]');
      if (!primaryErrorClass) primaryErrorClass = 'PII';
    }
  });

  // 3. Check AST Parse
  const astResult = checkAstParseBalance(proposedCode);
  if (!astResult.valid) {
    violations.push(`AST_PARSE: ${astResult.error}`);
    if (!primaryErrorClass) primaryErrorClass = 'AST_PARSE';
  }

  // 4. Paired Fix Auto-Recovery Check from RAG
  let autoAppliedFix: string | undefined = undefined;
  if (violations.length > 0 || primaryErrorClass) {
    const ragQuery = queryEmgRag(`${filePath} ${primaryErrorClass || ''} ${violations.join(' ')}`);
    if (ragQuery.topFixes.length > 0 && ragQuery.topFixes[0]?.pairedFixSnippet) {
      autoAppliedFix = ragQuery.topFixes[0].pairedFixSnippet;
      sanitizedCode = autoAppliedFix;
    }
  }

  const clean = violations.length === 0;

  return {
    clean,
    sanitizedCode,
    errorClass: primaryErrorClass || (clean ? 'CLEAN' : undefined),
    violations,
    autoAppliedFix,
  };
}

export class EdgeGovernanceGatekeeper {
  static evaluateProposal(filePath: string, proposedCode: string): SecuritySanitizerResult {
    return sanitizeAndGovern(filePath, proposedCode);
  }
}
