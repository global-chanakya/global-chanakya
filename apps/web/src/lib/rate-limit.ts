import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

// Require explicit opt-in for local quota to prevent silent fallbacks in production
const useLocalQuota = process.env.USE_LOCAL_QUOTA === "true"; 

if (!useLocalQuota && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: false,
  });
}

// Token Bucket Implementation
export interface TokenBucketEntry {
  tokens: number;
  lastRefillTimestamp: number;
}

export class TokenBucketRateLimiter {
  private static store = new Map<string, TokenBucketEntry>();
  
  static readonly CAPACITY = 100;
  static readonly REFILL_RATE = 100 / 60000; // tokens per ms
  static readonly IDLE_TTL = 60000; // ms
  static readonly MAX_ENTRIES = 10000;

  static checkLimit(userId: string) {
    const now = Date.now();
    let entry = this.store.get(userId);

    if (!entry) {
      // Idle eviction
      if (this.store.size >= this.MAX_ENTRIES) {
        for (const [k, v] of this.store.entries()) {
          if (now - v.lastRefillTimestamp > this.IDLE_TTL) {
            this.store.delete(k);
          }
        }
      }

      // Check if capacity exists after eviction
      if (this.store.size >= this.MAX_ENTRIES) {
        return { success: false, reason: "CAPACITY_EXCEEDED", retryAfter: 0 };
      }

      entry = { tokens: this.CAPACITY, lastRefillTimestamp: now };
    }

    const elapsedMs = now - entry.lastRefillTimestamp;
    const refillAmount = elapsedMs * this.REFILL_RATE;
    const currentTokens = Math.min(this.CAPACITY, entry.tokens + refillAmount);

    if (currentTokens >= 1.0) {
      this.store.set(userId, { tokens: currentTokens - 1.0, lastRefillTimestamp: now });
      return { success: true, reason: "OK", retryAfter: 0 };
    } else {
      this.store.set(userId, { tokens: currentTokens, lastRefillTimestamp: now });
      const retryAfterSeconds = Math.ceil((1.0 - currentTokens) / (this.REFILL_RATE * 1000));
      return { success: false, reason: "RATE_LIMITED", retryAfter: Math.max(1, retryAfterSeconds) };
    }
  }

  // Exposed for tests
  static _getStore() {
    return this.store;
  }
}

// In-memory rate limiter fallback (Temporary)
export class MemoryRateLimiter {
  private static store = new Map<string, { count: number; expiresAt: number }>();

  static async checkLimit(ip: string, action: string, limit: number, windowMs: number) {
    const key = `${ip}:${action}`;
    const now = Date.now();
    const record = this.store.get(key);

    // Clean up old records periodically
    if (this.store.size > 10000) {
      for (const [k, v] of this.store.entries()) {
        if (v.expiresAt < now) this.store.delete(k);
      }
    }

    if (!record || record.expiresAt < now) {
      if (this.store.size >= 10000) {
        return { success: false }; // Prevent unbounded memory growth under volumetric attack
      }
      this.store.set(key, { count: 1, expiresAt: now + windowMs });
      return { success: true };
    }

    if (record.count >= limit) {
      return { success: false }; // Rate limited
    }

    record.count += 1;
    this.store.set(key, record);
    return { success: true };
  }
}

export { ratelimit, useLocalQuota };
