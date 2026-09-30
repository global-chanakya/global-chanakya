export interface GroqKeyHealth {
  status: "HEALTHY" | "COOLDOWN" | "FAILED";
  consecutiveFailures: number;
  rateLimitCount: number;
  cooldownUntil: number;
  lastSuccessAt: number;
  lastFailureAt: number;
}

export interface GroqKeyConfig {
  id: string;
  value: string;
}

const DEFAULT_COOLDOWN_MS = 60000; // 1 minute

export class GroqKeyManager {
  // Instance-local advisory state
  private static localHealthMap = new Map<string, GroqKeyHealth>();
  private static localRrIndex = 0;

  private static getConfiguredKeys(): GroqKeyConfig[] {
    const keys: GroqKeyConfig[] = [];

    // Supports up to 5 keys: GROQ_API_KEY, GROQ_API_KEY_1 … GROQ_API_KEY_4
    if (process.env.GROQ_API_KEY)   keys.push({ id: "groq-1", value: process.env.GROQ_API_KEY });
    if (process.env.GROQ_API_KEY_1) keys.push({ id: "groq-2", value: process.env.GROQ_API_KEY_1 });
    if (process.env.GROQ_API_KEY_2) keys.push({ id: "groq-3", value: process.env.GROQ_API_KEY_2 });
    if (process.env.GROQ_API_KEY_3) keys.push({ id: "groq-4", value: process.env.GROQ_API_KEY_3 });
    if (process.env.GROQ_API_KEY_4) keys.push({ id: "groq-5", value: process.env.GROQ_API_KEY_4 });

    return keys;
  }

  private static async getKeyHealth(keyId: string): Promise<GroqKeyHealth> {
    const data = this.localHealthMap.get(keyId);
    
    if (data) {
      // Auto-recover from COOLDOWN once the cooldown window has passed locally
      if (data.status === "COOLDOWN" && Date.now() > data.cooldownUntil) {
        data.status = "HEALTHY";
        data.consecutiveFailures = 0;
        await this.saveKeyHealth(keyId, data);
      }
      return data;
    }

    return {
      status: "HEALTHY",
      consecutiveFailures: 0,
      rateLimitCount: 0,
      cooldownUntil: 0,
      lastSuccessAt: 0,
      lastFailureAt: 0
    };
  }

  private static async saveKeyHealth(keyId: string, health: GroqKeyHealth): Promise<void> {
    // Save to bounded local map. 
    // The map will never grow beyond the number of configured keys (max 5).
    this.localHealthMap.set(keyId, health);
  }

  /**
   * Instance-local round-robin key selection.
   *
   * Maintains an instance-local integer counter.
   * If the next key in the rotation is in COOLDOWN or FAILED, the selector walks
   * forward through the ring until it finds a HEALTHY key.
   * Returns null when every key is locally unavailable.
   * 
   * Note: Instance-local health is advisory, not globally authoritative.
   */
  static async getAvailableKey(): Promise<GroqKeyConfig | null> {
    const keys = this.getConfiguredKeys();
    if (keys.length === 0) return null;

    // Fetch local health for all keys
    const healths = await Promise.all(keys.map(k => this.getKeyHealth(k.id)));

    // Fast path: if all keys are unhealthy, return null immediately
    const anyHealthy = healths.some(h => h.status === "HEALTHY");
    if (!anyHealthy) return null;

    // Instance-local atomic round-robin increment
    const currentIndex = this.localRrIndex++;

    // Walk the ring starting at currentIndex, find first HEALTHY key
    for (let i = 0; i < keys.length; i++) {
      const idx = (currentIndex + i) % keys.length;
      if (healths[idx].status === "HEALTHY") {
        return keys[idx];
      }
    }

    return null;
  }

  static async markSuccess(keyId: string): Promise<void> {
    const health = await this.getKeyHealth(keyId);
    health.status = "HEALTHY";
    health.consecutiveFailures = 0;
    health.lastSuccessAt = Date.now();
    await this.saveKeyHealth(keyId, health);
  }

  static async markRateLimited(keyId: string, retryAfterMs?: number): Promise<void> {
    const health = await this.getKeyHealth(keyId);
    health.status = "COOLDOWN";
    health.rateLimitCount += 1;
    health.lastFailureAt = Date.now();

    let cooldownMs = retryAfterMs;
    if (!cooldownMs) {
      // Exponential backoff capped at 15 minutes
      const expBackoff = DEFAULT_COOLDOWN_MS * Math.pow(2, health.consecutiveFailures);
      cooldownMs = Math.min(expBackoff, 15 * 60 * 1000);
    }

    health.cooldownUntil = Date.now() + cooldownMs;
    health.consecutiveFailures += 1;

    console.warn(
      `[GroqKeyManager] Key ${keyId} rate-limited locally. ` +
      `Cooldown for ${Math.round(cooldownMs / 1000)}s ` +
      `(rateLimitCount=${health.rateLimitCount})`
    );
    await this.saveKeyHealth(keyId, health);
  }

  static async markFailure(keyId: string): Promise<void> {
    const health = await this.getKeyHealth(keyId);
    health.lastFailureAt = Date.now();
    health.consecutiveFailures += 1;

    if (health.consecutiveFailures >= 5) {
      health.status = "FAILED";
      console.error(`[GroqKeyManager] Key ${keyId} marked FAILED (5 consecutive failures locally).`);
    } else {
      health.status = "COOLDOWN";
      health.cooldownUntil = Date.now() + 10000; // 10 s short cooldown
    }

    await this.saveKeyHealth(keyId, health);
  }

  static async getHealthReport() {
    const keys = this.getConfiguredKeys();
    const healths = await Promise.all(keys.map(k => this.getKeyHealth(k.id)));

    let healthy = 0, cooldown = 0, failed = 0, totalRateLimits = 0;

    const details = keys.map((k, i) => {
      const h = healths[i];
      if (h.status === "HEALTHY")  healthy++;
      else if (h.status === "COOLDOWN") cooldown++;
      else if (h.status === "FAILED")   failed++;
      totalRateLimits += h.rateLimitCount;

      return {
        id: k.id,
        status: h.status,
        consecutiveFailures: h.consecutiveFailures,
        rateLimitCount: h.rateLimitCount,
        lastSuccessAt: h.lastSuccessAt,
        cooldownUntil: h.cooldownUntil
      };
    });

    return { totalKeys: keys.length, healthy, cooldown, failed, totalRateLimits, details };
  }

  /** Reset all local key health state */
  static async resetAllHealth(): Promise<void> {
    this.localHealthMap.clear();
    this.localRrIndex = 0;
    console.log("[GroqKeyManager] All local key health state reset.");
  }
}
