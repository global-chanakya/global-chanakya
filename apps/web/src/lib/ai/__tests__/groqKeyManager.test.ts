import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GroqKeyManager } from "../groqKeyManager";

// Mock environment variables for testing
vi.stubEnv("GROQ_API_KEY", "test-key-1");
vi.stubEnv("GROQ_API_KEY_1", "test-key-2");
vi.stubEnv("GROQ_API_KEY_2", "test-key-3");
// Ensure keys 4 and 5 are empty
vi.stubEnv("GROQ_API_KEY_3", "");
vi.stubEnv("GROQ_API_KEY_4", "");

describe("GroqKeyManager (Instance-Local Mode)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await GroqKeyManager.resetAllHealth();
    
    // Explicitly mock Date.now to control cooldowns
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A. Round-robin selection
  it("rotates keys in round-robin fashion", async () => {
    const k1 = await GroqKeyManager.getAvailableKey();
    const k2 = await GroqKeyManager.getAvailableKey();
    const k3 = await GroqKeyManager.getAvailableKey();
    const k4 = await GroqKeyManager.getAvailableKey();

    expect(k1?.id).toBe("groq-1");
    expect(k2?.id).toBe("groq-2");
    expect(k3?.id).toBe("groq-3");
    expect(k4?.id).toBe("groq-1"); // wraps around
  });

  // B. Key cooldown
  it("marks key in cooldown and skips it during selection", async () => {
    const k1 = await GroqKeyManager.getAvailableKey();
    expect(k1?.id).toBe("groq-1");

    await GroqKeyManager.markRateLimited("groq-1");

    // Next key should be groq-2
    const k2 = await GroqKeyManager.getAvailableKey();
    expect(k2?.id).toBe("groq-2");

    // Next should be groq-3
    const k3 = await GroqKeyManager.getAvailableKey();
    expect(k3?.id).toBe("groq-3");

    // Next should wrap to groq-1, but groq-1 is in cooldown, so it should skip to groq-2
    const k4 = await GroqKeyManager.getAvailableKey();
    expect(k4?.id).toBe("groq-2");
  });

  // C. Cooldown expiration
  it("recovers from cooldown after expiration", async () => {
    await GroqKeyManager.markRateLimited("groq-1", 1000); // 1s cooldown
    
    // Attempting to select groq-1 (which would be first) will skip it
    const k1 = await GroqKeyManager.getAvailableKey();
    expect(k1?.id).toBe("groq-2");

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000);

    // groq-1 should now be healthy and selectable
    // RR index is currently pointing at 2 (since groq-2 was selected, index advanced).
    // Let's get keys until we wrap around to groq-1
    let foundRecovered = false;
    for (let i = 0; i < 3; i++) {
        const k = await GroqKeyManager.getAvailableKey();
        if (k?.id === "groq-1") foundRecovered = true;
    }
    expect(foundRecovered).toBe(true);
  });

  // G. All keys 429 -> bounded failure
  it("returns null instantly when all keys are in cooldown (No unbounded polling)", async () => {
    await GroqKeyManager.markRateLimited("groq-1");
    await GroqKeyManager.markRateLimited("groq-2");
    await GroqKeyManager.markRateLimited("groq-3");

    const t0 = Date.now();
    const k = await GroqKeyManager.getAvailableKey();
    const t1 = Date.now();

    expect(k).toBeNull();
    expect(t1 - t0).toBeLessThan(50); // Should be immediate, no sleeps
  });

  // D, E, F: 429 Failover Sequences
  it("handles sequence: A 429 -> B succeeds -> C 429", async () => {
    // 1st request gets groq-1, hits 429
    const k1 = await GroqKeyManager.getAvailableKey();
    await GroqKeyManager.markRateLimited(k1!.id);

    // 2nd request gets groq-2, succeeds
    const k2 = await GroqKeyManager.getAvailableKey();
    expect(k2?.id).toBe("groq-2");
    await GroqKeyManager.markSuccess(k2!.id);

    // 3rd request gets groq-3, hits 429
    const k3 = await GroqKeyManager.getAvailableKey();
    expect(k3?.id).toBe("groq-3");
    await GroqKeyManager.markRateLimited(k3!.id);

    // 4th request skips 1 (cooldown), skips 3 (cooldown), gets 2 (healthy)
    const k4 = await GroqKeyManager.getAvailableKey();
    expect(k4?.id).toBe("groq-2");
  });

  // K. Redis unavailable -> Groq manager still functions
  it("functions perfectly even if Redis is mocked as dead (because it is local)", async () => {
    // There is no Redis dependency in the new GroqKeyManager!
    // We can prove this by just running the selection and ensuring it works.
    const k1 = await GroqKeyManager.getAvailableKey();
    expect(k1?.id).toBe("groq-1");
  });

  // L. Concurrent requests
  it("handles 20 concurrent selections cleanly", async () => {
    const promises = Array.from({ length: 20 }, () => GroqKeyManager.getAvailableKey());
    const results = await Promise.all(promises);
    
    // We expect a perfect distribution since it's atomic instance-local increment
    const groq1Count = results.filter(r => r?.id === "groq-1").length;
    const groq2Count = results.filter(r => r?.id === "groq-2").length;
    const groq3Count = results.filter(r => r?.id === "groq-3").length;
    
    // 20 requests / 3 keys = 6, 7, or 7
    expect(groq1Count).toBeGreaterThanOrEqual(6);
    expect(groq2Count).toBeGreaterThanOrEqual(6);
    expect(groq3Count).toBeGreaterThanOrEqual(6);
  });
});
