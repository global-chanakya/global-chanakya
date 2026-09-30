import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }));
vi.mock("@/auth", () => ({
  auth: () => mockAuth()
}));

const mockRedisSetNx = vi.fn();
const mockRedisGet = vi.fn();
const mockRedisSet = vi.fn();
const mockRedisDelIfOwner = vi.fn();

vi.mock("@/lib/redis", () => ({
  redis: {
    setNX: (...args: any[]) => mockRedisSetNx(...args),
    get: (...args: any[]) => mockRedisGet(...args),
    set: (...args: any[]) => mockRedisSet(...args),
    delIfOwner: (...args: any[]) => mockRedisDelIfOwner(...args),
  }
}));

const mockPollAllProviders = vi.fn();
vi.mock("@/lib/intelligence/live/ingestion.service", () => ({
  liveIngestionService: {
    pollAllProviders: () => mockPollAllProviders()
  }
}));

vi.mock("@/lib/mongoose", () => ({
  default: vi.fn()
}));

// Mock `after` from next/server to immediately execute
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    after: (fn: any) => fn(),
    NextResponse: {
      json: (data: any, init?: any) => {
        return {
          status: init?.status || 200,
          json: async () => data
        };
      }
    }
  };
});

import { POST } from "../../../app/api/admin/intelligence/run/route";

describe("Admin Intelligence Run Trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized access", async () => {
    mockAuth.mockResolvedValue(null);
    const response: any = await POST({} as any, {} as any);
    expect(response.status).toBe(401);
  });

  it("rejects non-admin users", async () => {
    mockAuth.mockResolvedValue({ user: { role: "editor" } });
    const response: any = await POST({} as any, {} as any);
    expect(response.status).toBe(401);
  });

  it("returns already_running if lock is held", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    // Simulate lock already exists
    mockRedisSetNx.mockResolvedValue(null);
    
    const response: any = await POST({} as any, {} as any);
    const data = await response.json();
    
    expect(data.success).toBe(false);
    expect(data.status).toBe("ALREADY_RUNNING");
    expect(mockPollAllProviders).not.toHaveBeenCalled();
  });

  it("acquires shared lock and executes pipeline", async () => {
    // 1. Mock auth success
    mockAuth.mockResolvedValue({
      user: { id: "123", email: "admin@globalchanakya.in", role: "admin" },
      expires: "2099-01-01T00:00:00.000Z"
    });

    // 3. Mock Redis lock acquisition success
    mockRedisSetNx.mockResolvedValue(true);

    // 4. Mock pipeline stats return
    mockPollAllProviders.mockResolvedValue({
      fetched: 10,
      duplicates: 5,
      inserted: 5,
      published: 3,
      failed: 2
    });



    const res = await POST({} as any, {} as any);
    const data = await (res as any).json();

    expect(data.success).toBe(true);
    expect(data.status).toBe("SUCCESS");
    
    // Verify lock was requested with the correct key
    expect(mockRedisSetNx).toHaveBeenCalledWith("intelligence:worker:lock", expect.any(String), 300);
    
    // Wait a tick for the `after` execution (mocked to run immediately)
    await new Promise(r => setTimeout(r, 10));
    
    // Verify intelligence was run
    expect(mockPollAllProviders).toHaveBeenCalled();
    
    // Verify lock was released
    expect(mockRedisDelIfOwner).toHaveBeenCalledWith("intelligence:worker:lock", expect.any(String));
  });
});
