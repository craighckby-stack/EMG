/**
 * SIPHONED FROM AI_AGENT_OS
 * WeakMap-backed execution isolation to prevent memory leaks during dynamic module loading and mutation execution.
 */

export class ZeroLeakSandbox {
  // WeakMap ensures that once the context object is dereferenced, its metadata is garbage collected automatically
  private activeContexts: WeakMap<object, Record<string, any>> = new WeakMap();

  public createContext(owner: object, initialMetadata: Record<string, any> = {}): void {
    this.activeContexts.set(owner, {
      ...initialMetadata,
      createdAt: Date.now(),
      status: 'active',
    });
  }

  public getContext(owner: object): Record<string, any> | undefined {
    return this.activeContexts.get(owner);
  }

  public updateContext(owner: object, updates: Record<string, any>): void {
    const current = this.activeContexts.get(owner);
    if (current) {
      this.activeContexts.set(owner, { ...current, ...updates });
    }
  }

  public executeInSandbox<T>(owner: object, taskName: string, taskFn: () => T): { result?: T; error?: string; durationMs: number } {
    const start = performance.now();
    this.createContext(owner, { taskName });

    try {
      const result = taskFn();
      const durationMs = parseFloat((performance.now() - start).toFixed(2));
      this.updateContext(owner, { status: 'completed', durationMs });
      return { result, durationMs };
    } catch (err: any) {
      const durationMs = parseFloat((performance.now() - start).toFixed(2));
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.updateContext(owner, { status: 'failed', error: errorMsg, durationMs });
      return { error: errorMsg, durationMs };
    }
  }
}

export const zeroLeakSandbox = new ZeroLeakSandbox();
