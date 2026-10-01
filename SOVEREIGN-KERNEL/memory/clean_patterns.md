# STUDIO_ATTACHMENT_CORRECT.md — EMG Clean Vector Knowledge Base

Verified patterns surviving AST and sanitizer gates.

## COMMIT: b100a0b828ab0feffafc21f900c7764d99da8c63
- File: apps/cli/src/args.ts
- Sanitizer: PASSED
```typescript
/**
 * Shared argument parsing for CLI commands.
 *
 * Every command declares which boolean flags, value options, and positionals it
 * accepts; `parseArgs` resolves aliases, rejects anything unrecognized, and hands
 * back a typed result. This centralizes the common flags (notably `--yes`/`-y`) so
 * each command no longer re-hardcodes `args.includes('--yes')`, and it makes
 * unknown flags and stray arguments fail loudly instead of being silently ignored.
 */

import { closestMatch } from './suggest.js';

/** Thrown when argv does not match a command's schema. The dispatcher formats it. */
export class ArgError extends Error {}

/** Tokens that set the "skip confirmation" flag, declared once for every command. */
export const YES_FLAGS = ['--yes', '-y'] as const;

export interface ArgSch
```

## COMMIT: b7f37f2427be6e147b44355c8c6f6c3f303be1bf
- File: apps/cli/src/commands/build.ts
- Sanitizer: PASSED
```typescript
/**
 * `shannon build` command — build the worker Docker image from the repository.
 * Requires a clone (Dockerfile in the working directory).
 */

import { buildImage, canBuildImage, ensureDocker } from '../docker.js';
import { fail } from '../errors.js';

export function build(noCache: boolean, version: string): void {
  if (!canBuildImage()) {
    fail(
      'Build is only available when running from the Shannon repository',
      '  (Dockerfile not found in current directory)',
    );
  }

  ensureDocker();
  buildImage(noCache, version);
}
```

## COMMIT: 7931913bdc43c8cf0e59fa2262a8ea017fc3f9c2
- File: apps/cli/src/confirm.ts
- Sanitizer: PASSED
```typescript
/**
 * Shared confirmation prompt for destructive or batch commands.
 *
 * `stop` and `reset` gate their action behind the same "confirm unless --yes"
 * flow. Centralizing it here keeps the behavior identical across commands and
 * impossible to change in only one place by accident.
 */

import * as p from '@clack/prompts';
import { requireInteractive } from './tty.js';

/**
 * Ask the user to confirm an action, unless `yes` was passed. Off a TTY without
 * `--yes`, fails fast rather than hanging on a prompt. Exits 0 if the user declines.
 */
export async function confirmOrExit(command: string, message: string, yes: boolean): Promise<void> {
  if (yes) {
    return;
  }

  requireInteractive(command, 'Re-run with --yes to skip this confirmation.');
  const confirmed: symbol | boolean = aw
```

## COMMIT: 7c6e4d5a6984f1f807c0da1b14a117e22f8e9cad
- File: apps/cli/src/docker.ts
- Sanitizer: PASSED
```typescript
/**
 * Docker orchestration — compose lifecycle, network, image pull/build, worker spawning.
 *
 * Local mode: builds locally, uses docker-compose.yml from repo root, mounts prompts.
 * NPX mode: pulls from Docker Hub, uses bundled compose.yml.
 */

import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import type { SpinnerResult } from '@clack/prompts';
import { envBool, PI_AUTH_CONTAINER_PATH } from './env.js';
import { fail, warn } from './errors.js';
import { getMode, isDevMode } from './mode.js';
import { INTERNAL_DIR } from './paths.js';
import {
```

## COMMIT: 87fa0c33bb54e73e1e335299085b5c94298077f7
- File: apps/cli/src/env.ts
- Sanitizer: PASSED
```typescript
/**
 * Environment variable loading and credential validation.
 *
 * Local mode: loads ./.env via dotenv.
 * NPX mode: fills gaps from ~/.shannon/config.toml (no .env).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import dotenv from 'dotenv';
import { resolveConfig } from './config/resolver.js';
import { getMode } from './mode.js';
import {
  CURATED_PROVIDERS,
  type CuratedProviderId,
  GENERIC_API_KEY_ENV,
  isCuratedProvider,
  PROVIDER_API_KEY_ENV,
  PROVIDER_CREDENTIAL_HINT,
  PROVIDER_EXTRA_ENV,
  resolveModelSpec,
} from './model-spec.js';

/**
 * Variables forwarded to every worker container regardless of provider. Each is
 * forwarded only when set, so an unused one never appears in the container.
 * SHANNON_AI_API_KEY rides along because
```

## COMMIT: 0dd9336a41ef8f6b7dd0a227713cf6827ebc238d
- File: apps/cli/src/errors.ts
- Sanitizer: PASSED
```typescript
/**
 * Centralized error reporting.
 *
 * `fail` / `failWith` — an expected, user-fixable error (bad input, missing
 * prerequisite): a clean message on stderr and a non-zero exit, never a stack trace.
 * `failUsage` — a malformed invocation (unknown command, bad or missing
 * arguments): the same clean message, but a distinct exit code so callers can
 * tell a usage mistake from an operational failure.
 * `crash` — an unexpected error (a bug): a fixed code and a pointer to the issue tracker.
 *
 * JSON mode (enabled once, before parsing, for the `--json` command surface) replaces
 * the text lines with one compact envelope on stderr — stdout stays empty — while the
 * exit-code split is unchanged. Call sites on a JSON-capable path must exit through
 * `failWith`/`failUsage`/`crash` (never
```
