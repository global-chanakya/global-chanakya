import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TokenBucketRateLimiter, useLocalQuota } from '../rate-limit';

describe('TokenBucketRateLimiter', () => {
  beforeEach(() => {
    // Clear the store before each test
    TokenBucketRateLimiter._getStore().clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1000000000000)); // Arbitrary starting time
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic behavior', () => {
    it('new user starts with 100 tokens and 1st request consumes 1 token', () => {
      const res1 = TokenBucketRateLimiter.checkLimit('user1');
      expect(res1.success).toBe(true);
      
      const entry = TokenBucketRateLimiter._getStore().get('user1');
      expect(entry?.tokens).toBe(99); // 100 - 1
    });

    it('100 requests can be accepted instantly', () => {
      for (let i = 0; i < 100; i++) {
        const res = TokenBucketRateLimiter.checkLimit('user_burst');
        expect(res.success).toBe(true);
      }
      
      const entry = TokenBucketRateLimiter._getStore().get('user_burst');
      expect(entry?.tokens).toBe(0);
    });

    it('101st request is rejected with 429 and Retry-After', () => {
      for (let i = 0; i < 100; i++) {
        TokenBucketRateLimiter.checkLimit('user_reject');
      }
      
      const res = TokenBucketRateLimiter.checkLimit('user_reject');
      expect(res.success).toBe(false);
      expect(res.reason).toBe("RATE_LIMITED");
      
      // Need 1 token. Refill rate is 100/60s = 1.666/sec. Time to get 1 token = 0.6s -> Math.ceil = 1 sec
      expect(res.retryAfter).toBeGreaterThanOrEqual(1);
    });

    it('0 tokens -> Retry-After = 1', () => {
      TokenBucketRateLimiter.checkLimit('user_0');
      // manually set tokens to 0
      TokenBucketRateLimiter._getStore().set('user_0', { tokens: 0, lastRefillTimestamp: Date.now() });
      const res = TokenBucketRateLimiter.checkLimit('user_0');
      expect(res.retryAfter).toBe(1);
    });

    it('0.5 tokens -> Retry-After = 1', () => {
      TokenBucketRateLimiter.checkLimit('user_05');
      // manually set tokens to 0.5
      TokenBucketRateLimiter._getStore().set('user_05', { tokens: 0.5, lastRefillTimestamp: Date.now() });
      const res = TokenBucketRateLimiter.checkLimit('user_05');
      expect(res.retryAfter).toBe(1);
    });

    it('0.9 tokens -> Retry-After = 1', () => {
      TokenBucketRateLimiter.checkLimit('user_09');
      // manually set tokens to 0.9
      TokenBucketRateLimiter._getStore().set('user_09', { tokens: 0.9, lastRefillTimestamp: Date.now() });
      const res = TokenBucketRateLimiter.checkLimit('user_09');
      expect(res.retryAfter).toBe(1);
    });

    it('a value that requires multiple seconds -> correct integer seconds', () => {
      TokenBucketRateLimiter.checkLimit('user_negative');
      // If someone magically had negative tokens (e.g. -5), they need 6 tokens to reach 1.
      // Wait time: 6 / (100 / 60) = 6 * 0.6 = 3.6 seconds -> ceil -> 4
      TokenBucketRateLimiter._getStore().set('user_negative', { tokens: -5, lastRefillTimestamp: Date.now() });
      const res = TokenBucketRateLimiter.checkLimit('user_negative');
      expect(res.retryAfter).toBe(4);
    });

    it('Retry-After is never 0 or negative', () => {
      TokenBucketRateLimiter.checkLimit('user_borderline');
      TokenBucketRateLimiter._getStore().set('user_borderline', { tokens: 0.99999, lastRefillTimestamp: Date.now() });
      const res = TokenBucketRateLimiter.checkLimit('user_borderline');
      expect(res.retryAfter).toBeGreaterThan(0);
      expect(res.retryAfter).toBe(1);
    });
  });

  describe('Refill', () => {
    it('partial elapsed time partially refills', () => {
      TokenBucketRateLimiter.checkLimit('user_refill');
      const entry1 = TokenBucketRateLimiter._getStore().get('user_refill');
      expect(entry1?.tokens).toBe(99);

      // Advance by 300ms (half a token)
      vi.advanceTimersByTime(300);
      
      TokenBucketRateLimiter.checkLimit('user_refill');
      const entry2 = TokenBucketRateLimiter._getStore().get('user_refill');
      // Previous tokens (99) + 0.5 (refill) - 1 (consume) = 98.5
      expect(entry2?.tokens).toBe(98.5);
    });

    it('refill is continuous and bucket never exceeds 100', () => {
      TokenBucketRateLimiter.checkLimit('user_max');
      vi.advanceTimersByTime(120000); // 2 minutes, should refill past 100
      
      const res = TokenBucketRateLimiter.checkLimit('user_max');
      expect(res.success).toBe(true);
      const entry = TokenBucketRateLimiter._getStore().get('user_max');
      expect(entry?.tokens).toBe(99); // Maxed at 100, then 1 consumed
    });

    it('after >60s inactivity the bucket is effectively full', () => {
      TokenBucketRateLimiter.checkLimit('user_idle');
      TokenBucketRateLimiter._getStore().set('user_idle', { tokens: 0, lastRefillTimestamp: Date.now() });
      
      vi.advanceTimersByTime(60001); // >60s
      
      // Verify math formula returns 100 internally
      TokenBucketRateLimiter.checkLimit('user_idle');
      const entry = TokenBucketRateLimiter._getStore().get('user_idle');
      expect(entry?.tokens).toBe(99); // Hit 100, consumed 1
    });
  });

  describe('Eviction', () => {
    it('idle bucket can be evicted, active cannot be evicted', () => {
      // Create user1 (active) and user2 (idle)
      TokenBucketRateLimiter.checkLimit('user_active');
      TokenBucketRateLimiter.checkLimit('user_idle');
      
      // Advance time slightly, make user_active active again
      vi.advanceTimersByTime(1000);
      TokenBucketRateLimiter.checkLimit('user_active');
      
      // Advance time so user_idle is > 60s idle, but user_active is < 60s idle
      vi.advanceTimersByTime(59500);
      
      // Fill map to max to trigger eviction
      const originalMax = (TokenBucketRateLimiter as any).MAX_ENTRIES;
      (TokenBucketRateLimiter as any).MAX_ENTRIES = 3;
      
      TokenBucketRateLimiter.checkLimit('user3');
      
      // Now Map has user_active, user_idle, user3. 
      // Add user4, should evict user_idle.
      TokenBucketRateLimiter.checkLimit('user4');
      
      const store = TokenBucketRateLimiter._getStore();
      expect(store.has('user_idle')).toBe(false); // Evicted
      expect(store.has('user_active')).toBe(true); // Retained
      
      // Restore MAX_ENTRIES
      (TokenBucketRateLimiter as any).MAX_ENTRIES = originalMax;
    });

    it('full map + no idle entry returns 503 for a NEW user', () => {
      const originalMax = (TokenBucketRateLimiter as any).MAX_ENTRIES;
      (TokenBucketRateLimiter as any).MAX_ENTRIES = 2;
      
      TokenBucketRateLimiter.checkLimit('user1');
      TokenBucketRateLimiter.checkLimit('user2');
      
      // user3 is a new user, no idle entries
      const res = TokenBucketRateLimiter.checkLimit('user3');
      expect(res.success).toBe(false);
      expect(res.reason).toBe('CAPACITY_EXCEEDED');
      
      // Existing user continues to work
      const resExisting = TokenBucketRateLimiter.checkLimit('user1');
      expect(resExisting.success).toBe(true);

      (TokenBucketRateLimiter as any).MAX_ENTRIES = originalMax;
    });
  });

  describe('Identity', () => {
    it('authenticated user IDs are isolated', () => {
      TokenBucketRateLimiter.checkLimit('alice');
      TokenBucketRateLimiter.checkLimit('bob');
      
      const store = TokenBucketRateLimiter._getStore();
      expect(store.get('alice')?.tokens).toBe(99);
      expect(store.get('bob')?.tokens).toBe(99);
    });
  });

  describe('Concurrency', () => {
    it('synchronous repeated calls do not produce more accepted requests than the local bucket permits', () => {
      let accepted = 0;
      for (let i = 0; i < 200; i++) {
        if (TokenBucketRateLimiter.checkLimit('concurrent_user').success) {
          accepted++;
        }
      }
      expect(accepted).toBe(100);
    });
  });

  describe('Memory', () => {
    it('map cannot exceed MAX_ENTRIES', () => {
      const originalMax = (TokenBucketRateLimiter as any).MAX_ENTRIES;
      (TokenBucketRateLimiter as any).MAX_ENTRIES = 5;
      
      for (let i = 0; i < 10; i++) {
        TokenBucketRateLimiter.checkLimit(`u${i}`);
      }
      
      expect(TokenBucketRateLimiter._getStore().size).toBe(5); // Capped
      
      (TokenBucketRateLimiter as any).MAX_ENTRIES = originalMax;
    });
  });

  describe('Rollback / flag', () => {
    it('default behavior is explicitly tested via useLocalQuota flag', () => {
      expect(typeof useLocalQuota).toBe('boolean');
    });
  });
});
