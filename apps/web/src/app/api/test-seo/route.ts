import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { SeoPreflightService } from "@/modules/seo/services/seo-preflight.service";
import { ContentQualityService } from "@/modules/seo/services/content-quality.service";
import { RelatedArticleService } from "@/modules/seo/services/related-article.service";
import { PublishPipelineService } from "@/modules/seo/services/publish-pipeline.service";
import { SearchConsoleService } from "@/modules/seo/services/search-console.service";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // 1. Find the FlyDubai article or any published article
    const blog = await Blog.findOne({ slug: { $regex: "flydubai" } })
      .populate("author", "name")
      .populate("topics", "name");

    if (!blog) {
      return NextResponse.json({ error: "Flydubai article not found" }, { status: 404 });
    }

    // 2. PublishPipeline
    console.log("Running PublishPipelineService...");
    await PublishPipelineService.execute(blog._id.toString());
    const updatedBlog = await Blog.findById(blog._id);

    // 3. Preflight
    const preflightErrors = SeoPreflightService.validateForPublishing(updatedBlog);

    // 4. Content Quality & Cannibalization
    const qualityReport = await ContentQualityService.check(
      updatedBlog.title,
      updatedBlog.content,
      updatedBlog.tags || [],
      updatedBlog.contentType || "standard",
      updatedBlog.slug
    );

    // 5. Related Articles
    const relatedArticles = await RelatedArticleService.getHighlyRelevantArticles(updatedBlog, 5);
    const oldArticlesToUpdate = relatedArticles
      .filter(a => new Date(a.publishAt) < new Date(updatedBlog.publishAt || new Date()))
      .map(a => ({
        title: a.title,
        slug: a.slug,
        url: `/blogs/${a.slug}`
      }));

    // 6. GSC Data
    let gscData = null;
    let seoProblemClass = "WAITING_FOR_DATA";
    if (SearchConsoleService.isConfigured()) {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      gscData = await SearchConsoleService.getPagePerformance(updatedBlog.slug, startDate, endDate);
    }

    return NextResponse.json({
      blogId: updatedBlog._id,
      slug: updatedBlog.slug,
      embeddingGenerated: !!updatedBlog.embedding,
      embeddingHash: updatedBlog.embeddingContentHash,
      preflightErrors,
      qualityReport,
      relatedArticlesCount: relatedArticles.length,
      oldArticlesToUpdate,
      gscConfigured: SearchConsoleService.isConfigured(),
      gscData,
      seoProblemClass,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
