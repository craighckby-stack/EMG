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
