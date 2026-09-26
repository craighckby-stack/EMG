export function sanitizeContent(content: string): { sanitized: string; blocked: boolean; violation?: string } {
  // Regex pattern matching Google API keys (AIzaSy...) and GitHub tokens (ghp_...)
  const secretRegex = /AIzaSy[A-Za-z0-0_-]{33}|ghp_[A-Za-z0-9]{36}/g;
  
  if (secretRegex.test(content)) {
    return {
      sanitized: content.replace(secretRegex, '[REDACTED_SECRET]'),
      blocked: true,
      violation: 'HARDCODED_CRED'
    };
  }
  
  return { sanitized: content, blocked: false };
}