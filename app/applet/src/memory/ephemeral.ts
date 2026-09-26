/**
 * SIPHONED FROM HUXLEY SINGULARITY LOOP (V3.2_CORE)
 * Ephemeral Memory Storage with Pressure-Based Decay
 * Manages transient DNA mutations, temporary vectors, and memory pressure.
 */

export interface DNA {
  hash: string;
  payload: any;
  entropy: number;
  timestamp: number;
  ancestry?: string;
}

export class EphemeralStorage {
  private state = new Map<string, DNA>();
  private memoryPressure: number = 0; // 0 to 1

  constructor() {
    // Periodic pressure-based decay monitor
    if (typeof window !== 'undefined' || typeof setInterval !== 'undefined') {
      setInterval(() => this.applyDecay(), 10000);
    }
  }

  public setMemoryPressure(pressure: number) {
    this.memoryPressure = Math.max(0, Math.min(1, pressure));
    if (this.memoryPressure > 0.7) {
      this.applyDecay(); // Immediate cull on high pressure
    }
  }

  public getMemoryPressure(): number {
    return this.memoryPressure;
  }

  public persist(dna: DNA) {
    this.state.set(dna.hash, dna);
  }

  private applyDecay() {
    const now = Date.now();
    const pressureMultiplier = this.memoryPressure > 0.7 ? 10 : 1;

    for (const [hash, dna] of this.state.entries()) {      // Logic: High entropy persists longer.
      // Base lifespan: 1 hour (3600000ms)
      const entropyBonus = dna.entropy * 7200000; // Up to 2 extra hours for high entropy
      const baseLifespan = 3600000 + entropyBonus;
      const effectiveLifespan = baseLifespan / pressureMultiplier;

      // Rule: Low-entropy noise (entropy < 0.2) must be purged immediately when pressure > 70%
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

  public clear() {
    this.state.clear();
  }
}

export const ephemeralStorage = new EphemeralStorage();
