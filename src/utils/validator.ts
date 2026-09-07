/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/utils/validator.ts
 * Role: AST and syntactic/type validation layer for verifying generated code before commit.
 * Architecture: Multi-tier validator with balanced token parsing, simple type checks, and TS compiler validation.
 */

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  code?: string;
  severity: 'error' | 'warning';
  snippet?: string;
}

export interface ValidationResult {
  valid: boolean;
  language: string;
  errors: ValidationError[];
  warnings: string[];
  autoHealed: boolean;
  healedCode?: string;
}

/**
 * Detect if a file path is a Markdown/Documentation document
 */
export function isMarkdownFile(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') return false;
  const normalized = filePath.trim().toLowerCase();
  if (/\.(md|markdown|mdx|txt)$/i.test(normalized)) return true;
  if (
    /\.(js|jsx|ts|tsx|mjs|cjs|json|py|rs|go|c|cpp|h|hpp|css|scss|html|yaml|yml|sh|bash|zsh|toml|ini|env|sql|xml|svg|wasm)$/i.test(
      normalized
    )
  ) {
    return false;
  }
  const basename = normalized.split('/').pop()?.split('\\').pop() || '';
  return /^(readme|license|changelog|contributing|authors|notice|security)(\.[a-z0-9_-]+)?$/i.test(basename);
}

/**
 * Determine language from file path
 */
export function getLanguageFromFilePath(filePath: string): string {
  const lower = (filePath || '').toLowerCase();
  if (lower.endsWith('.tsx')) return 'typescript-jsx';
  if (lower.endsWith('.ts')) return 'typescript';
  if (lower.endsWith('.jsx')) return 'javascript-jsx';
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.rs')) return 'rust';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.html')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  if (isMarkdownFile(lower)) return 'markdown';
  return 'generic';
}

/**
 * Unwraps accidental markdown code fences (```js ... ```) that AI might have included
 */
export function unwrapMarkdownCodeFences(code: string, language: string): { unwrapped: string; wasWrapped: boolean } {
  if (language === 'markdown') return { unwrapped: code, wasWrapped: false };
  const trimmed = code.trim();

  // 1. If wrapped between delimiters @@@START and @@@END, extract that
  if (trimmed.includes('@@@START') && trimmed.includes('@@@END')) {
    const extracted = trimmed.split('@@@START')[1].split('@@@END')[0].trim();
    return { unwrapped: extracted, wasWrapped: true };
  }

  // 2. If code contains a markdown code fence block anywhere inside commentary
  const fenceMatch = trimmed.match(/```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch && fenceMatch[1]) {
    return { unwrapped: fenceMatch[1].trim(), wasWrapped: true };
  }

  // 3. Simple root-wrapped code fence
  if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
    const lines = trimmed.split('\n');
    if (lines.length >= 2) {
      const contentLines = lines.slice(1, -1);
      return { unwrapped: contentLines.join('\n'), wasWrapped: true };
    }
  }

  return { unwrapped: code, wasWrapped: false };
}

/**
 * Bracket, parenthesis, brace and string balance validator
 */
function checkDelimitersAndStrings(
  code: string,
  isPython: boolean = false
): { errors: ValidationError[]; autoFixableFence: boolean } {
  const errors: ValidationError[] = [];
  const lines = code.split('\n');
  const stack: Array<{ char: string; line: number; col: number }> = [];

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let inMultiLineComment = false;
  let inRegex = false;
  let inPythonTripleSingle = false;
  let inPythonTripleDouble = false;

  let stringStartLine = 1;
  let stringStartCol = 1;
  let templateBraceDepth = 0;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    const lineNum = l + 1;

    for (let c = 0; c < line.length; c++) {
      const colNum = c + 1;
      const char = line[c];
      const nextChar = line[c + 1] || '';
      const prevChar = c > 0 ? line[c - 1] : '';

      // Skip escaped characters
      if (prevChar === '\\' && (inSingleQuote || inDoubleQuote || inTemplateString || inRegex)) {
        continue;
      }

      // Python triple quote handling
      if (isPython) {
        if (!inSingleQuote && !inDoubleQuote && !inMultiLineComment) {
          if (char === "'" && nextChar === "'" && line[c + 2] === "'") {
            inPythonTripleSingle = !inPythonTripleSingle;
            c += 2;
            continue;
          }
          if (char === '"' && nextChar === '"' && line[c + 2] === '"') {
            inPythonTripleDouble = !inPythonTripleDouble;
            c += 2;
            continue;
          }
        }
        if (inPythonTripleSingle || inPythonTripleDouble) {
          continue;
        }
        if (char === '#' && !inSingleQuote && !inDoubleQuote) {
          break; // Rest of line is comment
        }
      }

      // JS/TS/Go/Rust Single-line comment //
      if (!isPython && !inSingleQuote && !inDoubleQuote && !inTemplateString && !inMultiLineComment && !inRegex) {
        if (char === '/' && nextChar === '/') {
          break; // Rest of line is comment
        }
        if (char === '/' && nextChar === '*') {
          inMultiLineComment = true;
          c++;
          continue;
        }
      }

      // Multi-line comment end */
      if (inMultiLineComment) {
        if (char === '*' && nextChar === '/') {
          inMultiLineComment = false;
          c++;
        }
        continue;
      }

      // Regular Expression Literal detection in JS/TS
      if (!isPython && !inSingleQuote && !inDoubleQuote && !inTemplateString && !inMultiLineComment) {
        if (char === '/' && !inRegex) {
          const before = line.slice(0, c).trim();
          const lastChar = before.slice(-1);
          const isRegexStart =
            before.length === 0 ||
            /[=([:,!&|?+\-*/;^~{}]/.test(lastChar) ||
            /\b(?:return|case|throw|typeof|instanceof|yield|await|delete|void)\b$/.test(before);

          if (isRegexStart && nextChar !== '/' && nextChar !== '*') {
            inRegex = true;
            continue;
          }
        } else if (char === '/' && inRegex) {
          inRegex = false;
          while (c + 1 < line.length && /[gimsuyvd]/.test(line[c + 1])) {
            c++;
          }
          continue;
        }
      }

      if (inRegex) {
        continue;
      }

      // Strings
      if (!inDoubleQuote && !inTemplateString) {
        if (char === "'") {
          if (!inSingleQuote) {
            inSingleQuote = true;
            stringStartLine = lineNum;
            stringStartCol = colNum;
          } else {
            inSingleQuote = false;
          }
          continue;
        }
      }

      if (!inSingleQuote && !inTemplateString) {
        if (char === '"') {
          if (!inDoubleQuote) {
            inDoubleQuote = true;
            stringStartLine = lineNum;
            stringStartCol = colNum;
          } else {
            inDoubleQuote = false;
          }
          continue;
        }
      }

      if (!isPython && !inSingleQuote && !inDoubleQuote) {
        if (char === '`') {
          if (!inTemplateString) {
            inTemplateString = true;
            stringStartLine = lineNum;
            stringStartCol = colNum;
          } else {
            inTemplateString = false;
          }
          continue;
        }

        if (inTemplateString && char === '$' && nextChar === '{') {
          templateBraceDepth++;
          stack.push({ char: '{', line: lineNum, col: colNum });
          c++;
          continue;
        }
      }

      // If inside string literal, skip delimiter matching
      if (inSingleQuote || inDoubleQuote || (inTemplateString && templateBraceDepth === 0)) {
        continue;
      }

      // Delimiter tracking
      if (char === '(' || char === '{' || char === '[') {
        stack.push({ char, line: lineNum, col: colNum });
      } else if (char === ')' || char === '}' || char === ']') {
        const top = stack.pop();
        if (char === '}' && templateBraceDepth > 0 && top && top.char === '{') {
          templateBraceDepth--;
          continue;
        }

        if (!top) {
          errors.push({
            line: lineNum,
            column: colNum,
            message: `Unexpected closing delimiter '${char}' with no matching opening pair.`,
            code: 'SYNTAX_UNMATCHED_CLOSING',
            severity: 'error',
            snippet: line.trim(),
          });
        } else {
          const match =
            (top.char === '(' && char === ')') ||
            (top.char === '{' && char === '}') ||
            (top.char === '[' && char === ']');
          if (!match) {
            errors.push({
              line: lineNum,
              column: colNum,
              message: `Mismatched closing delimiter: expected matching '${top.char === '(' ? ')' : top.char === '{' ? '}' : ']'}' but found '${char}' (opened on Line ${top.line}).`,
              code: 'SYNTAX_MISMATCHED_PAIR',
              severity: 'error',
              snippet: line.trim(),
            });
          }
        }
      }
    }

    // In single-line strings (single/double quotes), newline without backslash is an unclosed string in TS/JS/Python
    if (inSingleQuote && !isPython) {
      errors.push({
        line: stringStartLine,
        column: stringStartCol,
        message: `Unclosed single-quote string literal.`,
        code: 'SYNTAX_UNCLOSED_STRING',
        severity: 'error',
      });
      inSingleQuote = false;
    }
    if (inDoubleQuote && !isPython) {
      errors.push({
        line: stringStartLine,
        column: stringStartCol,
        message: `Unclosed double-quote string literal.`,
        code: 'SYNTAX_UNCLOSED_STRING',
        severity: 'error',
      });
      inDoubleQuote = false;
    }
    if (inRegex) {
      inRegex = false;
    }
  }

  if (inTemplateString) {
    errors.push({
      line: stringStartLine,
      column: stringStartCol,
      message: `Unclosed template literal string (\`).`,
      code: 'SYNTAX_UNCLOSED_TEMPLATE_STRING',
      severity: 'error',
    });
  }

  if (inMultiLineComment) {
    errors.push({
      line: lines.length,
      column: 1,
      message: `Unclosed multiline comment block (/* ... */).`,
      code: 'SYNTAX_UNCLOSED_COMMENT',
      severity: 'error',
    });
  }

  // Any unclosed open braces/brackets
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push({
      line: unclosed.line,
      column: unclosed.col,
      message: `Unclosed opening delimiter '${unclosed.char}'.`,
      code: 'SYNTAX_UNCLOSED_DELIMITER',
      severity: 'error',
    });
  }

  return { errors, autoFixableFence: false };
}

/**
 * Check TypeScript / JavaScript specific syntax and simple type error patterns
 */
function checkTypeScriptPatterns(code: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = code.split('\n');

  let exportDefaultCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();

    // Skip comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    // 1. Multiple default exports in single file
    if (/^export\s+default\b/.test(trimmed)) {
      exportDefaultCount++;
      if (exportDefaultCount > 1) {
        errors.push({
          line: lineNum,
          column: 1,
          message: `A module cannot have multiple default export assignments.`,
          code: 'TS_MULTIPLE_DEFAULT_EXPORTS',
          severity: 'error',
          snippet: trimmed,
        });
      }
    }

    // 2. Empty type alias: type Foo = ; or type Foo =
    if (/^type\s+[A-Za-z0-9_$]+(?:\s*<[^>]*>)?\s*=\s*;?$/.test(trimmed)) {
      errors.push({
        line: lineNum,
        column: trimmed.indexOf('=') + 1,
        message: `Type alias declaration is missing a type definition after '='.`,
        code: 'TS_EMPTY_TYPE_ALIAS',
        severity: 'error',
        snippet: trimmed,
      });
    }

    // 3. Incomplete interface/type property: prop: ;
    if (/^[A-Za-z0-9_$]+(?:\s*\?)?\s*:\s*;?$/.test(trimmed)) {
      errors.push({
        line: lineNum,
        column: trimmed.indexOf(':') + 1,
        message: `Property declaration is missing its type annotation.`,
        code: 'TS_MISSING_PROPERTY_TYPE',
        severity: 'error',
        snippet: trimmed,
      });
    }

    // 4. Missing variable type in typed declaration: let x: = 5; or const a: = "val";
    if (/\b(?:const|let|var)\s+[A-Za-z0-9_$]+\s*:\s*=\s*/.test(trimmed)) {
      errors.push({
        line: lineNum,
        column: trimmed.indexOf(':') + 1,
        message: `Type expected after ':' before assignment operator '='.`,
        code: 'TS_INVALID_TYPE_ANNOTATION',
        severity: 'error',
        snippet: trimmed,
      });
    }

    // 5. Broken generic declaration: <T extends > or Map<string, >
    if (/<[A-Za-z0-9_$,\s]*extends\s*>/.test(trimmed) || /<[A-Za-z0-9_$,\s]+,\s*>/.test(trimmed)) {
      errors.push({
        line: lineNum,
        column: 1,
        message: `Malformed generic type parameter: incomplete constraint or trailing comma in type arguments.`,
        code: 'TS_MALFORMED_GENERIC',
        severity: 'error',
        snippet: trimmed,
      });
    }

    // 6. Double operators e.g. "const x === 5;" or "let a ++ b;"
    if (/\b(?:const|let|var)\s+[A-Za-z0-9_$]+\s*===\s*/.test(trimmed) && !trimmed.includes('?')) {
      errors.push({
        line: lineNum,
        column: trimmed.indexOf('===') + 1,
        message: `Comparison operator '===' used in variable initialization instead of assignment '='.`,
        code: 'TS_INVALID_ASSIGNMENT_OPERATOR',
        severity: 'error',
        snippet: trimmed,
      });
    }

    // 7. Broken async keyword without function / arrow
    if (/^async\s+[A-Za-z0-9_$]+\s*\(/.test(trimmed) && !/async\s+(?:function\s+)?[A-Za-z0-9_$]+\s*\(/.test(trimmed)) {
      // In TS/JS classes "async foo()" is valid, but outside classes "async foo()" without function/const is invalid
      // Only warn if top level and not in class
    }

    // 8. Reserved keywords used as variable names without escaping
    if (/\b(?:const|let|var)\s+(?:interface|type|class|enum|namespace|module|implements)\s*[:=]/.test(trimmed)) {
      errors.push({
        line: lineNum,
        column: 1,
        message: `Cannot use reserved TypeScript keyword as a variable identifier.`,
        code: 'TS_RESERVED_KEYWORD_IDENTIFIER',
        severity: 'error',
        snippet: trimmed,
      });
    }
  }

  return errors;
}

/**
 * Validate JSON file syntax
 */
function validateJson(code: string): ValidationError[] {
  try {
    JSON.parse(code);
    return [];
  } catch (err: any) {
    const msg = err.message || 'JSON Parse Error';
    let line = 1;
    let column = 1;

    // Extract position from standard V8 error "at position X"
    const posMatch = msg.match(/at position (\d+)/);
    if (posMatch && posMatch[1]) {
      const pos = parseInt(posMatch[1], 10);
      const prefix = code.slice(0, pos);
      const lines = prefix.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return [
      {
        line,
        column,
        message: `JSON syntax error: ${msg}`,
        code: 'JSON_SYNTAX_ERROR',
        severity: 'error',
      },
    ];
  }
}

/**
 * Validate Markdown code block fences
 */
function validateMarkdown(code: string): { errors: ValidationError[]; unclosedFence: boolean } {
  const errors: ValidationError[] = [];
  const lines = code.split('\n');
  let inCodeBlock = false;
  let blockStartLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        blockStartLine = i + 1;
      } else {
        inCodeBlock = false;
      }
    }
  }

  if (inCodeBlock) {
    errors.push({
      line: blockStartLine,
      column: 1,
      message: `Unclosed Markdown code block fence (\`\`\`) opened on Line ${blockStartLine}.`,
      code: 'MD_UNCLOSED_CODE_FENCE',
      severity: 'error',
    });
    return { errors, unclosedFence: true };
  }

  return { errors, unclosedFence: false };
}

/**
 * Server-side native TypeScript compiler verification
 */
async function callServerTsValidator(
  code: string,
  filePath: string
): Promise<{ reachable: boolean; diagnostics: ValidationError[] }> {
  try {
    const res = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, filePath }),
    });

    if (!res.ok) return { reachable: false, diagnostics: [] };
    const data = await res.json();
    if (Array.isArray(data.diagnostics)) {
      const diagnostics = data.diagnostics.map((d: any) => ({
        line: d.line || 1,
        column: d.column || 1,
        message: d.message || 'TypeScript Diagnostic Error',
        code: d.code ? `TS${d.code}` : 'TS_DIAGNOSTIC',
        severity: d.severity === 'warning' ? 'warning' : 'error',
        snippet: d.snippet,
      }));
      return { reachable: true, diagnostics };
    }
    return { reachable: true, diagnostics: [] };
  } catch {
    return { reachable: false, diagnostics: [] };
  }
}

/**
 * Main Code and Type Error Validation Engine
 */
export async function lintSourceCode(code: string, filePath: string): Promise<{ valid: boolean; lintEvidence: string }> {
  try {
    const res = await fetch('/api/lint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, filePath })
    });
    if (!res.ok) return { valid: false, lintEvidence: 'Failed to connect to linting server' };
    const data = await res.json();
    return { valid: !!data.valid, lintEvidence: data.lintEvidence || '' };
  } catch (e) {
    return { valid: false, lintEvidence: String(e) };
  }
}

export async function validateSourceCode(
  rawCode: string,
  filePath: string
): Promise<ValidationResult> {
  if (!rawCode || !rawCode.trim()) {
    return {
      valid: false,
      language: getLanguageFromFilePath(filePath),
      errors: [
        {
          line: 1,
          column: 1,
          message: 'Source code is completely empty.',
          code: 'EMPTY_FILE',
          severity: 'error',
        },
      ],
      warnings: [],
      autoHealed: false,
    };
  }

  const language = getLanguageFromFilePath(filePath);
  let autoHealed = false;
  let healedCode: string | undefined = undefined;

  // Auto-unwrap markdown fences if the model output raw markdown wrapper around source files
  const { unwrapped, wasWrapped } = unwrapMarkdownCodeFences(rawCode, language);
  let code = unwrapped;
  if (wasWrapped) {
    autoHealed = true;
    healedCode = code;
  }

  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // 1. JSON Specific Check
  if (language === 'json') {
    const jsonErrors = validateJson(code);
    return {
      valid: jsonErrors.length === 0,
      language,
      errors: jsonErrors,
      warnings,
      autoHealed,
      healedCode,
    };
  }

  // 2. Markdown Specific Check
  if (language === 'markdown') {
    const { errors: mdErrors, unclosedFence } = validateMarkdown(code);
    if (unclosedFence) {
      healedCode = code.trimEnd() + '\n```\n';
      autoHealed = true;
      return {
        valid: true,
        language,
        errors: [],
        warnings: ['Auto-repaired unclosed markdown code fence at end-of-file.'],
        autoHealed: true,
        healedCode,
      };
    }
    return {
      valid: mdErrors.length === 0,
      language,
      errors: mdErrors,
      warnings,
      autoHealed,
      healedCode,
    };
  }

  // 3. TypeScript & JavaScript authoritative AST & Compiler Check
  const isJsTs =
    language === 'typescript' ||
    language === 'typescript-jsx' ||
    language === 'javascript' ||
    language === 'javascript-jsx';

  if (isJsTs) {
    const serverResult = await callServerTsValidator(code, filePath);

    if (serverResult.reachable) {
      errors.push(...serverResult.diagnostics);

      const tsPatternErrors = checkTypeScriptPatterns(code);
      for (const err of tsPatternErrors) {
        if (!errors.some((e) => e.line === err.line && e.message === err.message)) {
          errors.push(err);
        }
      }

      const valid = errors.filter((e) => e.severity === 'error').length === 0;
      return {
        valid,
        language,
        errors,
        warnings,
        autoHealed,
        healedCode,
      };
    }
  }

  // 4. Non-JS/TS or Offline Fallback Delimiter & Token Scanner
  const isPython = language === 'python';
  const delimiterCheck = checkDelimitersAndStrings(code, isPython);
  errors.push(...delimiterCheck.errors);

  // 5. Auto-fix single missing trailing delimiter
  if (errors.length === 1 && errors[0].code === 'SYNTAX_UNCLOSED_DELIMITER') {
    const unclosedChar = errors[0].message.includes('{')
      ? '}'
      : errors[0].message.includes('(')
      ? ')'
      : errors[0].message.includes('[')
      ? ']'
      : '';
    if (unclosedChar) {
      const candidateHealed = code.trimEnd() + '\n' + unclosedChar + '\n';
      const recheck = checkDelimitersAndStrings(candidateHealed, isPython);
      if (recheck.errors.length === 0) {
        return {
          valid: true,
          language,
          errors: [],
          warnings: [`Auto-healed missing closing '${unclosedChar}' at end-of-file.`],
          autoHealed: true,
          healedCode: candidateHealed,
        };
      }
    }
  }

  const valid = errors.filter((e) => e.severity === 'error').length === 0;

  return {
    valid,
    language,
    errors,
    warnings,
    autoHealed,
    healedCode,
  };
}
