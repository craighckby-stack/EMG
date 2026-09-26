/**
 * Ephemeral memory storage with pressure-based decay.
 * Manages transient DNA mutations, temporary vectors, and memory pressure.
 */

export interface DNA {
  readonly hash: string;
  readonly payload: unknown;
  readonly entropy: number;
  readonly timestamp: number;
  readonly ancestry?: string;
}

export class EphemeralStorage {
  private readonly state: Map<string, DNA> = new Map<string, DNA>();
  private memoryPressure: number = 0;
  private decayTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof globalThis !== 'undefined' && typeof globalThis.setInterval !== 'undefined') {
      this.decayTimer = globalThis.setInterval(() => this.applyDecay(), 10000);
    }
  }

  public setMemoryPressure(pressure: number): void {
    this.memoryPressure = Math.max(0, Math.min(1, pressure));
    if (this.memoryPressure > 0.7) {
      this.applyDecay();
    }
  }

  public getMemoryPressure(): number {
    return this.memoryPressure;
  }

  public persist(dna: DNA): void {
    this.state.set(dna.hash, dna);
  }

  private applyDecay(): void {
    const now = Date.now();
    const pressureMultiplier = this.memoryPressure > 0.7 ? 10 : 1;

    for (const [hash, dna] of this.state.entries()) {
      const entropyBonus = dna.entropy * 7200000;
      const baseLifespan = 3600000 + entropyBonus;
      const effectiveLifespan = baseLifespan / pressureMultiplier;

      const isLowEntropyNoise = dna.entropy < 0.2;
      const shouldPurgeImmediately = isLowEntropyNoise && this.memoryPressure > 0.7;

      if (shouldPurgeImmediately || (now - dna.timestamp) > effectiveLifespan) {
        this.state.delete(hash);
      }
    }
  }

  public get(hash: string): DNA | undefined {
    return this.state.get(hash);
  }

  public getAll(): DNA[] {
    return Array.from(this.state.values());
  }

  public size(): number {
    return this.state.size;
  }

  public clear(): void {
    this.state.clear();
  }

  public dispose(): void {
    if (this.decayTimer !== null) {
      clearInterval(this.decayTimer);
      this.decayTimer = null;
    }
    this.state.clear();
  }
}

export const ephemeralStorage: EphemeralStorage = new EphemeralStorage();