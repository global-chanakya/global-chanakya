import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";
import { ReadingHistory } from "@/lib/models/ReadingHistory";
import { formatViews } from "@/lib/formatViews";
import * as Sentry from "@sentry/nextjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await dbConnect();

  try {
    let progressPercentage = 0;
    let timeSpent = 0;
    let resumePoint = 0;
    let deviceType = "unknown";
    let isPing = false;
    
    try {
      const body = await request.json();
      if (typeof body.progressPercentage === "number") progressPercentage = body.progressPercentage;
      if (typeof body.timeSpent === "number") timeSpent = body.timeSpent;
      if (typeof body.resumePoint === "number") resumePoint = body.resumePoint;
      if (typeof body.deviceType === "string") deviceType = body.deviceType;
      if (body.isPing === true) isPing = true;
    } catch (e) {
      // body might be empty
    }

    let blog;
    if (isPing) {
      blog = await Blog.findOne({ slug, status: "published", contentType: { $ne: "platform-seo" } }).lean();
    } else {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const ua = request.headers.get("user-agent") || "unknown";
      const isBot = /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|whatsapp|telegram/i.test(ua);

      blog = await Blog.findOne({ slug, status: "published", contentType: { $ne: "platform-seo" } }).lean();
      
      if (blog && !isBot) {
        // Implement Deduplication using redis
        const crypto = require("crypto");
        const { redis } = require("@/lib/redis");
        
        const hash = crypto.createHash("sha256").update(`${ip}-${ua}-${slug}`).digest("hex");
        const dedupKey = `view:dedup:${slug}:${hash}`;
        const isDuplicate = await redis.get(dedupKey);

        if (!isDuplicate) {
          blog = await Blog.findOneAndUpdate(
            { slug, status: "published", contentType: { $ne: "platform-seo" } },
            { $inc: { "analytics.views": 1 } },
            { new: true, timestamps: false }
          ).lean();
          
          await redis.set(dedupKey, "1", "EX", 3600); // 1 hour deduplication
        }
      }
    }

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const session = await auth();
    const userId = session?.user?.id || session?.user?.email;

    if (userId) {
      const isCompleted = progressPercentage >= 95;

      await ReadingHistory.findOneAndUpdate(
        { user: userId, blog: blog._id },
        { 
          $set: { 
            lastInteractionAt: new Date(),
            deviceType
          },
          $max: { 
            progressPercentage,
            resumePoint
          },
          $inc: { sessionDuration: timeSpent },
          // Only set completed to true if it reaches 95%
          ...(isCompleted ? { $set: { completed: true, lastInteractionAt: new Date(), deviceType } } : {})
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ 
      success: true, 
      views: blog.analytics?.views,
      formattedViews: blog.analytics?.views ? formatViews(blog.analytics.views) : "0"
    });
  } catch (error: any) {
    Sentry.captureException(error, { extra: { slug, action: "process_view_route" } });
    console.error({ event: "process_view_failure", error: error.message, timestamp: new Date().toISOString() });
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
