/**
 * File: src/utils/github.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { sanitizeCode, sanitizeText } from './sanitizer';
import { isMarkdownFile } from './validator';

export const b64ToUtf8 = (str: string): string => {
  if (!str) return '';
  const cleaned = str.replace(/\s/g, '');
  try {
    const binaryString = atob(cleaned);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    try {
      return decodeURIComponent(
        binaryStringToArray(atob(cleaned))
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      try {
        return atob(cleaned);
      } catch {
        return str;
      }
    }
  }
};

function binaryStringToArray(binaryStr: string): string[] {
  const arr = new Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    arr[i] = binaryStr.charAt(i);
  }
  return arr;
}

export const utf8ToB64 = (str: string): string => {
  if (!str) return '';
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    try {
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(Number('0x' + p1))
        )
      );
    } catch {
      return btoa(str);
    }
  }
};

export interface GitHubFileItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubRepoInfo {
  name: string;
  full_name: string;
  default_branch: string;
  private: boolean;
  stargazers_count: number;
}

export interface GitHubUserRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export class GitHubError extends Error {
  status: number;
  isNotFound: boolean;
  isRateLimit: boolean;
  isAuth: boolean;
  isConflict: boolean;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
    this.isNotFound = status === 404;
    this.isRateLimit = status === 429 || (status === 403 && message.toLowerCase().includes('rate limit'));
    this.isAuth = status === 401 || (status === 403 && !this.isRateLimit);
    this.isConflict = status === 409;
  }
}

async function parseJsonResponse<T = unknown>(res: Response, fallbackError: string): Promise<T> {
  const raw = await res.text();
  if (!raw || !raw.trim()) {
    if (!res.ok) {
      if (res.status === 404) throw new GitHubError('Resource not found (HTTP 404)', 404);
      if (res.status === 429) throw new GitHubError('GitHub API rate limit reached (HTTP 429)', 429);
      if (res.status === 401) throw new GitHubError('GitHub unauthorized (HTTP 401). Check Personal Access Token.', 401);
      if (res.status === 403) throw new GitHubError('GitHub forbidden (HTTP 403). Check token scopes or rate limit.', 403);
      if (res.status === 409) throw new GitHubError('GitHub file conflict (HTTP 409). SHA out of sync.', 409);
      throw new GitHubError(`${fallbackError} (HTTP ${res.status})`, res.status);
    }
    return {} as T;
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
    if (!res.ok) {
      throw new GitHubError(`GitHub/Server returned HTML error page (HTTP ${res.status}): ${res.statusText || 'Unavailable'}`, res.status);
    }
    throw new GitHubError('Received HTML response instead of JSON. Check repository URL and connection.', 500);
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (!res.ok) {
      const errMsg = (parsed?.error as string) || (parsed?.message as string) || fallbackError;
      if (res.status === 404) throw new GitHubError(`[404 Not Found] ${errMsg}`, 404);
      if (res.status === 429) throw new GitHubError(`[429 Rate Limit] ${errMsg}`, 429);
      if (res.status === 401) throw new GitHubError(`[401 Unauthorized] ${errMsg}`, 401);
      if (res.status === 403) throw new GitHubError(`[403 Forbidden] ${errMsg}`, 403);
      if (res.status === 409) throw new GitHubError(`[409 Conflict] ${errMsg}`, 409);
      throw new GitHubError(`[HTTP ${res.status}] ${errMsg}`, res.status);
    }
    return parsed as T;
  } catch (err: unknown) {
    if (err instanceof GitHubError) throw err;
    if (!res.ok) {
      throw new GitHubError(`${fallbackError} (HTTP ${res.status}): ${trimmed.slice(0, 120)}`, res.status);
    }
    throw new GitHubError(`Invalid response format from GitHub API: ${trimmed.slice(0, 100)}`, 500);
  }
}

export async function fetchUserRepositories(token: string): Promise<GitHubUserRepo[]> {
  if (!token || !token.trim()) {
    return [];
  }
  const cleanToken = token.trim();
  
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${cleanToken}`,
    };

    const res = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member',
      { headers }
    );

    if (res.ok) {
      return await parseJsonResponse<GitHubUserRepo[]>(res, 'Failed to fetch user repositories');
    }
    
    if (res.status === 401) {
      throw new Error('GitHub Authorization Failed: Invalid token or expired.');
    }
    if (res.status === 403) {
      throw new Error('GitHub Authorization Error: Rate limit or missing "repo" scope.');
    }
  } catch (err: unknown) {
    const errorInstance = err as Error;
    if (errorInstance.message && (errorInstance.message.includes('Authorization') || errorInstance.message.includes('Rate limit'))) {
      throw errorInstance;
    }
  }

  try {
    const proxyRes = await fetch('/api/github/user-repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: cleanToken }),
    });
    return await parseJsonResponse<GitHubUserRepo[]>(proxyRes, 'GitHub repository handshake failed');
  } catch (proxyErr: unknown) {
    const proxyErrorInstance = proxyErr as Error;
    throw new Error(proxyErrorInstance.message || 'Unable to fetch GitHub repositories.');
  }
}

export async function fetchRepoDetails(repo: string, token: string): Promise<GitHubRepoInfo> {
  const cleanRepo = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${cleanRepo}`, { headers });
    if (res.ok) {
      return await parseJsonResponse<GitHubRepoInfo>(res, `Failed to retrieve repository ${cleanRepo}`);
    }
    if (res.status === 404) throw new Error(`Repository "${cleanRepo}" not found (check name or token scope).`);
    if (res.status === 401) throw new Error('GitHub Authorization Failed: Invalid token.');
    if (res.status === 403) throw new Error('GitHub Rate Limit exceeded or insufficient repo permissions.');
  } catch (err: unknown) {
    const errorInstance = err as Error;
    if (errorInstance.message && (errorInstance.message.includes('not found') || errorInstance.message.includes('Authorization') || errorInstance.message.includes('Rate Limit'))) {
      throw errorInstance;
    }
  }

  const proxyRes = await fetch('/api/github/repo-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo: cleanRepo, token: token || undefined }),
  });
  return await parseJsonResponse<GitHubRepoInfo>(proxyRes, `Repository handshake failed for ${cleanRepo}`);
}

export async function fetchRepoTree(repo: string, branch: string, token: string): Promise<GitHubFileItem[]> {
  const cleanRepo = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  let rawData: { tree?: GitHubFileItem[] } | null = null;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${cleanRepo}/git/trees/${branch}?recursive=1`,
      { headers }
    );
    if (res.ok) {
      rawData = await parseJsonResponse<{ tree?: GitHubFileItem[] }>(res, `Failed to fetch file tree for ${branch}`);
    }
  } catch {
    // Fallback handled below
  }

  if (!rawData) {
    const proxyRes = await fetch('/api/github/repo-tree', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: cleanRepo, branch, token: token || undefined }),
    });
    rawData = await parseJsonResponse<{ tree?: GitHubFileItem[] }>(proxyRes, `Failed to fetch file tree for ${branch}`);
  }

  return (rawData.tree || []).filter(
    (item: GitHubFileItem) =>
      item.type === 'blob' &&
      (/\.(js|jsx|ts|tsx|py|html|css|json|rs|go|c|cpp|h|md|markdown|mdx|txt)$/i.test(item.path) ||
        isMarkdownFile(item.path)) &&
      !item.path.includes('node_modules/') &&
      !item.path.includes('dist/') &&
      !item.path.includes('.git/') &&
      !item.path.includes('package-lock.json') &&
      !item.path.includes('bun.lock') &&
      !item.path.includes('yarn.lock')
  );
}

export async function fetchFileContent(
  repo: string,
  filePath: string,
  token: string,
  branch?: string
): Promise<{ content: string; sha: string }> {
  const cleanRepo = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache'
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  let data: { content?: string; sha?: string } | null = null;

  try {
    let url = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}?t=${Date.now()}`;
    if (branch && branch.trim()) {
      url += `&ref=${encodeURIComponent(branch.trim())}`;
    }
    const res = await fetch(url, { headers });
    if (res.ok) {
      data = await parseJsonResponse<{ content?: string; sha?: string }>(res, `Failed to retrieve file contents for ${filePath}`);
    }
  } catch {
    // Fallback handled below
  }

  if (!data) {
    const proxyRes = await fetch('/api/github/file-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: cleanRepo,
        filePath,
        token: token || undefined,
        branch: branch?.trim(),
      }),
    });
    data = await parseJsonResponse<{ content?: string; sha?: string }>(proxyRes, `Failed to retrieve file ${filePath}`);
  }

  return {
    content: b64ToUtf8(data?.content || ''),
    sha: data?.sha || '',
  };
}

export async function commitFileUpdate(
  repo: string,
  filePath: string,
  content: string,
  sha: string,
  token: string,
  commitMessage: string,
  branch?: string
): Promise<{ commitSha: string }> {
  const cleanRepo = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
  const sanitizedContent = sanitizeCode(content, filePath).sanitized;
  const sanitizedMessage = sanitizeText(commitMessage);

  const body: Record<string, unknown> = {
    message: sanitizedMessage,
    content: utf8ToB64(sanitizedContent),
    sha: sha,
  };
  if (branch && branch.trim()) {
    body.branch = branch.trim();
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token.trim()}`,
    };

    const res = await fetch(
      `https://api.github.com/repos/${cleanRepo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (res.ok) {
      const data = await parseJsonResponse<{ commit?: { sha?: string } }>(res, 'Failed to commit mutation');
      return { commitSha: data.commit?.sha || 'unknown' };
    }
  } catch {
    // Fallback handled below
  }

  const proxyRes = await fetch('/api/github/commit-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo: cleanRepo,
      filePath,
      content: utf8ToB64(content),
      sha,
      token: token.trim(),
      commitMessage,
      branch: branch?.trim(),
    }),
  });

  const data = await parseJsonResponse<{ commit?: { sha?: string } }>(proxyRes, 'Failed to commit mutation via backend proxy');
  return { commitSha: data.commit?.sha || 'unknown' };
}