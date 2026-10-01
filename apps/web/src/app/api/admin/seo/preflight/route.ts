import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { SeoPreflightService } from "@/modules/seo/services/seo-preflight.service";
import { ContentQualityService } from "@/modules/seo/services/content-quality.service";

export const maxDuration = 20;

async function requireAdmin() {
  const [session] = await Promise.all([auth(), dbConnect()]);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

/**
 * POST /api/admin/seo/preflight
 * Called from the blog editor UI before publishing.
 * Returns SEO preflight errors + content quality report.
 * Does NOT block or publish anything itself.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await dbConnect();

    const body = await req.json();
    const { title, slug, content, tags, contentType, seo, category, featuredImage, author, topics } = body;

    // 1. SEO Preflight
    const preflightErrors = SeoPreflightService.validateForPublishing({
      title,
      slug,
      content,
      tags,
      seo,
      category,
      featuredImage,
      author,
      topics,
    } as any);

    // 2. Content Quality + Cannibalization
    const qualityReport = await ContentQualityService.check(
      title,
      content || "",
      tags || [],
      contentType || "standard",
      slug // exclude self from cannibalization check
    );

    const isPublishable = preflightErrors.length === 0
      && qualityReport.cannibalization.filter(c => c.similarity === "HIGH").length === 0;

    return NextResponse.json({
      isPublishable,
      preflightErrors,
      qualityReport,
    });
  } catch (err) {
    console.error("[POST /api/admin/seo/preflight]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
