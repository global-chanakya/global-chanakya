import { config } from "dotenv";
config({ path: ".env.local" }); // Load env variables

import mongoose from "mongoose";
import { Blog } from "../src/lib/models/Blog";
import { BlogChunk } from "../src/lib/models/BlogChunk";
import { PublishPipelineService } from "../src/modules/seo/services/publish-pipeline.service";
import { SeoPreflightService } from "../src/modules/seo/services/seo-preflight.service";
import { ContentQualityService } from "../src/modules/seo/services/content-quality.service";
import { RelatedArticleService } from "../src/modules/seo/services/related-article.service";
import { SearchConsoleService } from "../src/modules/seo/services/search-console.service";

async function run() {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const blog = await Blog.findOne({ slug: /flydubai-fz1073-cockpit-attack/i });
  if (!blog) {
    console.log("Flydubai article not found. Testing with latest published article...");
    const latest = await Blog.findOne({ status: "published" }).sort({ publishAt: -1 });
    if (!latest) {
       console.log("No published articles found.");
       process.exit(0);
    }
    return runForBlog(latest);
  } else {
    return runForBlog(blog);
  }
}

async function runForBlog(blog: any) {
  console.log(`\n--- TRACING LIFECYCLE FOR: ${blog.slug} ---`);
  
  // 1. Run Pipeline
  console.log("\n[1] Running PublishPipelineService...");
  await PublishPipelineService.execute(blog._id.toString());
  
  const updatedBlog = await Blog.findById(blog._id);
  
  // 2. Preflight
  console.log("\n[2] Running SEO Preflight...");
  const preflightErrors = SeoPreflightService.validateForPublishing(updatedBlog as any);
  console.log("Preflight Errors:", preflightErrors);

  // 3. Embedding Status
  console.log("\n[3] Embedding Status:");
  console.log("Has Embedding Array:", Array.isArray(updatedBlog.embedding));
  console.log("Embedding Length:", updatedBlog.embedding?.length);
  console.log("Embedding Hash:", updatedBlog.embeddingContentHash);

  // 4. BlogChunk Status
  console.log("\n[4] BlogChunk Validation:");
  const chunks = await BlogChunk.find({ blogId: updatedBlog._id });
  console.log(`Found ${chunks.length} chunks for this blog.`);
  if (chunks.length > 0) {
    console.log("Chunk 0 embedding length:", chunks[0].embedding?.length);
  }

  // 5. Content Quality & Cannibalization
  console.log("\n[5] Content Quality & Cannibalization Check:");
  const qualityReport = await ContentQualityService.check(
    updatedBlog.title,
    updatedBlog.content,
    updatedBlog.tags || [],
    updatedBlog.contentType || "standard",
    updatedBlog.slug
  );
  console.log("Quality Report Passed:", qualityReport.passed);
  console.log("Cannibalization Alerts:", qualityReport.cannibalization.length);

  // 6. Vector Search & Related Articles
  console.log("\n[6] Vector Search & Related Articles:");
  const related = await RelatedArticleService.getHighlyRelevantArticles(updatedBlog as any, 5);
  console.log(`Found ${related.length} related articles.`);
  related.forEach((r, i) => console.log(`  ${i+1}. ${r.slug}`));

  // 7. Old -> New Links
  console.log("\n[7] Old -> New Recommendations:");
  const oldArticles = related.filter(a => new Date(a.publishAt || 0) < new Date(updatedBlog.publishAt || new Date()));
  console.log(`Found ${oldArticles.length} older articles that can link forward.`);
  
  // 8. GSC Status
  console.log("\n[8] GSC Status:");
  const isGscConfigured = SearchConsoleService.isConfigured();
  console.log("GSC Configured:", isGscConfigured);
  if (isGscConfigured) {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const perf = await SearchConsoleService.getPagePerformance(updatedBlog.slug, startDate, endDate);
    if (perf) {
       console.log("GSC Data Found:", perf);
    } else {
       console.log("GSC NO DATA / INSUFFICIENT DATA for this URL in date range.");
    }
  } else {
    console.log("GSC NOT VERIFIED (Configuration Pending)");
  }

  mongoose.disconnect();
}

run().catch(console.error);
