# STUDIO_ATTACHMENT_WRONG.md — EMG Failure & Recovery Ledger

Paired failure and recovery commits categorized by error class and preventative rules.

## FAILURE: fail_mup0ieky | FIX: fix_mup0ieky
- Error Class: AST_PARSE
- File: apps/cli/src/colors.ts
- Rule to Avoid: Objection! Detected 0 historical failure patterns matching this change. Errors: . Sanitizer violations: AST_PARSE: Unbalanced delimiters: braces=0, brackets=10, parens=0.
- Diagnosis: Ethical Debate Rejection: Risk score (5/10) >= Benefit score (6.5/10). Objection! Detected 0 historical failure patterns matching this change. Errors: . Sanitizer violations: AST_PARSE: Unbalanced delimiters: braces=0, brackets=10, parens=0.

### Failure Diff
```typescript
/**
 * ANSI color and style escapes — the single source for the CLI's palette.
 *
 * Codes are plain constants; callers decide whether to emit them via `paint`
 * (wrap-and-reset) or `gate` (prefix-or-empty), gating on `supportsColor()` from
 * `tty.ts`. Cursor-control escapes live with their sole consumer, not here — this
 * module is color only.
 */

export const RESET = '\x1b[0m';

/** Shannon brand gold — the running/completed accent, shared with the splash logo. */
export const GOLD = '\x1b[38;2;244;197;66m';

export const BOLD = '\x1b[1m';
export const RED = '\x1b[31m';
export const YELLOW = '\x1b[33m';
export const DIM = '\x1b[90m';

// The splash logo uses bolder variants of cyan/white/yellow than the progress tree.
export const CYAN = '\x1b[36;1m';
export const WHITE = '\x1b[1;37m';
export const GRAY = '\x1b[0;37m';
export const BOLD_YELLOW = '\x1b[1;33m';

/** Wrap `text` in `code` and reset, or return it unchanged when color is off. */
export function paint(text: string, code: string, enabled: boolean): string {
  return enabled ? code + text + RESET : text;
}

/** A style code when color is on, or an empty string when off — for templates that interleave prefixes directly. */
export function gate(code: string, enabled: boolean): string {
  return enabled ? code : '';
}
```

### Paired Fix Diff
```typescript
/**
 * ANSI color and style escapes — the single source for the CLI's palette.
 *
 * Codes are plain constants; callers decide whether to emit them via `paint`
 * (wrap-and-reset) or `gate` (prefix-or-empty), gating on `supportsColor()` from
 * `tty.ts`. Cursor-control escapes live with their sole consumer, not here — this
 * module is color only.
 */

export const RESET = '\x1b[0m';

/** Shannon brand gold — the running/completed accent, shared with the splash logo. */
export const GOLD = '\x1b[38;2;244;197;66m';

export const BOLD = '\x1b[1m';
export const RED = '\x1b[31m';
export const YELLOW = '\x1b[33m';
export const DIM = '\x1b[90m';

// The splash logo uses bolder variants of cyan/white/yellow than the progress tree.
export const CYAN = '\x1b[36;1m';
export const WHITE = '\x1b[1;37m';
export const GRAY = '\x1b[0;37m';
export const BOLD_YELLOW = '\x1b[1;33m';

/** Wrap `text` in `code` and reset, or return it unchanged when color is off. */
export function paint(text: string, code: string, enabled: boolean): string {
  return enabled ? code + text + RESET : text;
}

/** A style code when color is on, or an empty string when off — for templates that interleave prefixes directly. */
export function gate(code: string, enabled: boolean): string {
  return enabled ? code : '';
}
```

---
