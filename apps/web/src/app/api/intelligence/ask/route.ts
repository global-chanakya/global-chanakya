import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { ratelimit, MemoryRateLimiter, TokenBucketRateLimiter, useLocalQuota } from "@/lib/rate-limit";
import { 
  intelligenceService, 
  AIProviderError, 
  AIValidationError 
} from "@/modules/intelligence/services/intelligence.service";

// Give Vercel 30s before cutting off the function to accommodate LLM reasoning
export const maxDuration = 30;

const requestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty").max(2000, "Query is too long"),
  context: z.string().max(10000, "Context is too long").optional(),
  mode: z.enum(["INTERNAL", "LIVE", "HYBRID"]).optional().default("HYBRID"),
});

export const POST = auth(async function POST(req) {
  try {
    const session = req.auth;
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to use Ask Chanakya." },
        { status: 401 }
      );
    }
    const userId = session.user?.id || "anonymous";

    // 2. Rate Limiting (Application Level)
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    
    let isRateLimited = false;
    let retryAfter = 0;

    
    if (useLocalQuota) {
      // 5B-4: Local Token Bucket Soft Quota
      // Synchronous critical section
      const limitResult = TokenBucketRateLimiter.checkLimit(userId);
      isRateLimited = !limitResult.success;
      if (isRateLimited) {
        retryAfter = limitResult.retryAfter || 1;
        if (limitResult.reason === "CAPACITY_EXCEEDED") {
          return NextResponse.json(
            { error: { code: "SERVICE_UNAVAILABLE", message: "System is currently at maximum capacity. Please try again later." } },
            { status: 503, headers: { "Retry-After": "10" } }
          );
        }
      }
    } else {
      // Legacy Redis path (Rollback)
      if (ratelimit) {
        try {
          const { success } = await ratelimit.limit(`ask_chanakya_${userId}`);
          isRateLimited = !success;
        } catch (redisError: any) {
          console.warn("[AskChanakya] Upstash Redis error, falling back to MemoryRateLimiter:", redisError.message);
          const { success } = await MemoryRateLimiter.checkLimit(ip, "ask_chanakya_fallback", 5, 60000);
          isRateLimited = !success;
        }
      } else {
        const { success } = await MemoryRateLimiter.checkLimit(ip, "ask_chanakya", 5, 60000);
        isRateLimited = !success;
      }
    }

    if (isRateLimited) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "You have exceeded your AI request limit. Please try again later." } },
        { status: 429, headers: retryAfter > 0 ? { "Retry-After": retryAfter.toString() } : undefined }
      );
    }

    // 3. Input Validation
    const body = await req.json().catch(() => ({}));
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: validation.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { query, context, mode } = validation.data;

    // 4. Execute Intelligence Service
    const start = Date.now();
    const result = await intelligenceService.askChanakya(query, context, mode);
    const duration = Date.now() - start;

    // 5. Observability
    Sentry.addBreadcrumb({
      category: "ai",
      message: "Ask Chanakya Query",
      level: "info",
      data: {
        durationMs: duration,
        userId: userId,
        model: process.env.GROQ_DEFAULT_MODEL || "openai/gpt-oss-120b",
        usage: result.usage,
      }
    });

    // 6. Return Structured Response conforming to AskChanakyaResponse
    return NextResponse.json(result.data, { status: 200 });

  } catch (error: any) {
    Sentry.captureException(error);
    
    console.error("[POST /api/intelligence/ask]", error.message);

    if (error instanceof AIValidationError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 502 }
      );
    }

    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred while processing your request." } },
      { status: 500 }
    );
  }
});
