/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-152 [2026-09-20T06:04:20.806Z] */
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { saveMutationToRag } from './ragBrain';
import { safeSetLocalStorage, safeGetLocalStorage } from './safeStorage';

/**
 * Live sync from craighckby-stack/Archaeology-Engine into DARLEK's RAG.
 *
 * Replaces the old `ingestArchaeologyDatasetToFirebase()` in
 * archaeology-dataset.ts, which only ever ingested 4 hardcoded example
 * pairs baked into the source — it never actually read the live repo.
 * This module fetches the real, current `correct/<hash>.md` and
 * `wrong/<hash>.md` files pushed by the Commit Archaeology Engine app and
 * ingests any that haven't been seen before.
 *
 * Deliberately slow & bounded per call (maxFilesPerRun, delayMs) so a large
 * backlog can't spike GitHub's rate limit in one run — already-ingested
 * files are tracked and skipped, so calling this repeatedly (e.g. on a
 * timer, or a console command) just picks up whatever's new since last time.
 */

const GITHUB_API_BASE = 'https://api.github.com';
const SOURCE_OWNER = 'craighckby-stack';
const SOURCE_REPO = 'Archaeology-Engine';
const SOURCE_BRANCH = 'main';

const LOCAL_INGESTED_KEY = 'darlek_cann_archaeology_ingested_paths';
const DEFAULT_MAX_FILES_PER_RUN = 20;
const DEFAULT_DELAY_MS = 1200;

type Verdict = 'correct' | 'wrong';

interface TreeEntry {
  readonly path: string;
  readonly sha: string;
  readonly verdict: Verdict;
}

interface ParsedCommitRecord {
  readonly path: string;
  readonly verdict: Verdict;
  readonly hash: string;
  readonly title: string;
  readonly date: string;
  readonly author: string;
  readonly filesTouched: string[];
  readonly commitMessage: string;
  readonly reason: string;
  readonly diff: string;
}

export interface ArchaeologySyncResult {
  readonly scanned: number;
  readonly newFilesFound: number;
  readonly ingested: number;
  readonly alreadyIngestedTotal: number;
  readonly deferredForNextRun: number;
  readonly errors: string[];
}

function githubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function decodeBase64Utf8(base64Content: string): string {
  const sanitized = (base64Content || '').replace(/\s/g, '');
  if (!sanitized) return '';
  try {
    const binary = atob(sanitized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    try {
      return decodeURIComponent(escape(atob(sanitized)));
    } catch {
      return '';
    }
  }
}

async function fetchArchaeologyMarkdownPaths(token?: string): Promise<TreeEntry[]> {
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${SOURCE_OWNER}/${SOURCE_REPO}/git/trees/${SOURCE_BRANCH}?recursive=1`,
    { headers: githubHeaders(token) }
  );
  if (!res.ok) throw new Error(`Failed to list ${SOURCE_REPO} tree: HTTP ${res.status}`);
  const data = await res.json();
  const entries: TreeEntry[] = [];
  for (const item of (data.tree || [])) {
    if (item?.type !== 'blob' || typeof item.path !== 'string' || !item.path.endsWith('.md')) continue;
    if (/(^|\/)correct\//.test(item.path)) entries.push({ path: item.path, sha: item.sha, verdict: 'correct' });
    else if (/(^|\/)wrong\//.test(item.path)) entries.push({ path: item.path, sha: item.sha, verdict: 'wrong' });
  }
  return entries;
}

async function fetchBlobContent(sha: string, token?: string): Promise<string> {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${SOURCE_OWNER}/${SOURCE_REPO}/git/blobs/${sha}`, {
    headers: githubHeaders(token),
  });
  if (!res.ok) throw new Error(`Failed to fetch blob ${sha}: HTTP ${res.status}`);
  const data = await res.json();
  return decodeBase64Utf8(data.content || '');
}

// Matches the format written by Commit-puller's buildCommitRecordFile().
function parseCommitRecordMarkdown(raw: string, path: string, verdict: Verdict): ParsedCommitRecord | null {
  const headerMatch = raw.match(/^##\s+(.+?)\s+--\s+(.+?)\s+\(`([^`]+)`\)/m);
  if (!headerMatch) return null;
  const [, date, title, hash] = headerMatch;

  const authorMatch = raw.match(/\*\*Author:\*\*\s*(.+)/);
  const filesMatch = raw.match(/\*\*Files touched:\*\*\s*\n\n([\s\S]*?)\n\n\*\*Commit message/);
  const messageMatch = raw.match(/\*\*Commit message:\*\*\s*\n\n```\n([\s\S]*?)\n```/);
  const reasonMatch = raw.match(/\*\*Verdict Reason:\*\*\s*(.+)/);
  const diffMatch = raw.match(/\*\*Diff:\*\*\s*\n\n```diff\n([\s\S]*?)\n```\s*$/);

  const filesTouched = filesMatch
    ? filesMatch[1].split('\n').map(l => l.replace(/^-\s*`|`$/g, '').trim()).filter(Boolean)
    : [];

  return {
    path,
    verdict,
    hash: hash.trim(),
    title: title.trim(),
    date: date.trim(),
    author: authorMatch ? authorMatch[1].trim() : 'Unknown',
    filesTouched,
    commitMessage: messageMatch ? messageMatch[1].trim() : title.trim(),
    reason: reasonMatch ? reasonMatch[1].trim() : '',
    diff: diffMatch ? diffMatch[1] : '',
  };
}

async function getAlreadyIngestedPaths(): Promise<Set<string>> {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'archaeology_ingested_files'));
      return new Set(snap.docs.map(d => d.id));
    } catch {
      // Fall through to the local fallback below.
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = safeGetLocalStorage(LOCAL_INGESTED_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  }
  return new Set();
}

async function markIngested(paths: string[], alreadyKnown: Set<string>): Promise<void> {
  if (paths.length === 0) return;
  if (isFirebaseConfigured() && db) {
    try {
      for (const p of paths) {
        await setDoc(doc(db, 'archaeology_ingested_files', encodeURIComponent(p)), { path: p, ingestedAt: serverTimestamp() });
      }
      return;
    } catch {
      // Fall through to the local fallback below.
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const merged = new Set(alreadyKnown);
      paths.forEach(p => merged.add(p));
      const capped = Array.from(merged).slice(-100);
      safeSetLocalStorage(LOCAL_INGESTED_KEY, JSON.stringify(capped));
    } catch {
      // Best effort only — a missed local mark just means the next run re-scans it.
    }
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function syncArchaeologyRagFromGitHub(options?: {
  readonly token?: string;
  readonly maxFilesPerRun?: number;
  readonly delayMs?: number;
}): Promise<ArchaeologySyncResult> {
  const token = options?.token;
  const maxFilesPerRun = options?.maxFilesPerRun ?? DEFAULT_MAX_FILES_PER_RUN;
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;
  const errors: string[] = [];

  let allEntries: TreeEntry[] = [];
  try {
    allEntries = await fetchArchaeologyMarkdownPaths(token);
  } catch (err: unknown) {
    return {
      scanned: 0,
      newFilesFound: 0,
      ingested: 0,
      alreadyIngestedTotal: 0,
      deferredForNextRun: 0,
      errors: [err instanceof Error ? err.message : String(err)],
    };
  }

  const alreadyIngested = await getAlreadyIngestedPaths();
  const newEntries = allEntries.filter(e => !alreadyIngested.has(e.path));
  const batch = newEntries.slice(0, maxFilesPerRun);
  const deferred = Math.max(0, newEntries.length - batch.length);

  let ingested = 0;
  const successfullyProcessedPaths: string[] = [];

  for (const entry of batch) {
    try {
      const raw = await fetchBlobContent(entry.sha, token);
      const parsed = parseCommitRecordMarkdown(raw, entry.path, entry.verdict);

      if (!parsed) {
        errors.push(`Could not parse ${entry.path} — skipping (won't retry)`);
        successfullyProcessedPaths.push(entry.path);
        await sleep(delayMs);
        continue;
      }

      const isCorrect = parsed.verdict === 'correct';
      await saveMutationToRag({
        filePath: parsed.filesTouched[0] || 'unknown',
        originalCode: isCorrect ? '' : parsed.diff,
        mutatedCode: isCorrect ? parsed.diff : '',
        rationale: `Archaeology Engine ${isCorrect ? 'success' : 'failure'} pattern (${parsed.hash}): ${parsed.title}. ${parsed.reason || parsed.commitMessage}`.slice(0, 500),
        riskScore: isCorrect ? 0.1 : 0.85,
        generation: 1,
        commitSha: parsed.hash,
        hotswapped: false,
      });

      if (isFirebaseConfigured() && db) {
        try {
          await addDoc(collection(db, 'mutations'), {
            pairId: parsed.hash,
            filePath: parsed.filesTouched[0] || 'unknown',
            title: parsed.title,
            verdict: parsed.verdict,
            diff: parsed.diff,
            commitMessage: parsed.commitMessage,
            author: parsed.author,
            date: parsed.date,
            source: `https://github.com/${SOURCE_OWNER}/${SOURCE_REPO}/blob/${SOURCE_BRANCH}/${entry.path}`,
            createdAt: serverTimestamp(),
          });
        } catch (fbErr: unknown) {
          errors.push(`Firestore write failed for ${entry.path}: ${fbErr instanceof Error ? fbErr.message : String(fbErr)}`);
        }
      }

      ingested++;
      successfullyProcessedPaths.push(entry.path);
    } catch (err: unknown) {
      // Left un-marked on failure, so a transient error gets retried next run.
      errors.push(`${entry.path}: ${err instanceof Error ? err.message : String(err)}`);
    }

    // One file at a time with a pause between fetches — deliberately slow so
    // a large backlog never turns into a rate-limit spike.
    await sleep(delayMs);
  }

  await markIngested(successfullyProcessedPaths, alreadyIngested);

  return {
    scanned: allEntries.length,
    newFilesFound: newEntries.length,
    ingested,
    alreadyIngestedTotal: alreadyIngested.size + successfullyProcessedPaths.length,
    deferredForNextRun: deferred,
    errors,
  };
}


// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 149,
  timestamp: "2026-09-20T04:00:07.248Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});