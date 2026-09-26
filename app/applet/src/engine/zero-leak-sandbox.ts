/**
 * SIPHONED FROM AI_AGENT_OS
 * WeakMap-backed execution isolation to prevent memory leaks during dynamic module loading and mutation execution.
 */

export interface SandboxContext {
  createdAt: number;
  status: 'active' | 'completed' | 'failed';
  taskName?: string;
  error?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface SandboxExecutionResult<T> {
  result?: T;
  error?: string;
  durationMs: number;
}

export class ZeroLeakSandbox {
  private readonly activeContexts = new WeakMap<object, SandboxContext>();

  public createContext(owner: object, initialMetadata: Record<string, unknown> = {}): void {
    const context: SandboxContext = {
      ...initialMetadata,
      createdAt: Date.now(),
      status: 'active',
    };
    this.activeContexts.set(owner, context);
  }

  public getContext(owner: object): SandboxContext | undefined {
    return this.activeContexts.get(owner);
  }

  public updateContext(owner: object, updates: Partial<SandboxContext>): void {
    const currentContext = this.activeContexts.get(owner);
    if (currentContext) {
      this.activeContexts.set(owner, { ...currentContext, ...updates });
    }
  }

  public executeInSandbox<T>(
    owner: object,
    taskName: string,
    taskFn: () => T
  ): SandboxExecutionResult<T> {
    const startTime = performance.now();
    this.createContext(owner, { taskName });

    try {
      const result = taskFn();
      const durationMs = this.calculateDuration(startTime);
      this.updateContext(owner, { status: 'completed', durationMs });
      return { result, durationMs };
    } catch (error: unknown) {
      const durationMs = this.calculateDuration(startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateContext(owner, { status: 'failed', error: errorMessage, durationMs });
      return { error: errorMessage, durationMs };
    }
  }

  private calculateDuration(startTime: number): number {
    return parseFloat((performance.now() - startTime).toFixed(2));
  }
}

export const zeroLeakSandbox = new ZeroLeakSandbox();