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
