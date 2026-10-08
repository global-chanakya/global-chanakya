/**
 * /api/knowledge/entity/[slug]/route.ts
 * Internal API returning semantic graph data for an entity.
 * Note: Country, Leader, Conflict entities have been removed.
 * This endpoint now only returns blog-based content.
 */
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { escapeRegExp } from "@/lib/utils/regex";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    // Fetch related blog content by slug or tag match
    const safeSlug = escapeRegExp(slug).replace(/-/g, '[\\s-]');
    const relatedContent = await Blog.find({
      $or: [
        { slug },
        { tags: { $regex: new RegExp(`^${safeSlug}$`, 'i') } }
      ],
      status: "published",
      contentType: { $ne: "platform-seo" }
    })
    .select("title slug aiSummary keyInsights tags publishAt")
    .sort({ publishAt: -1 })
    .limit(10)
    .lean();

    if (!relatedContent || relatedContent.length === 0) {
      return NextResponse.json({ error: "Entity not found in Knowledge Graph" }, { status: 404 });
    }

    return NextResponse.json({
      content: relatedContent
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
