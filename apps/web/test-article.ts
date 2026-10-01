import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import { Blog } from "./src/lib/models/Blog";
import { ContentQualityService } from "./src/modules/seo/services/content-quality.service";
import { SeoPreflightService } from "./src/modules/seo/services/seo-preflight.service";
import { SearchConsoleService } from "./src/modules/seo/services/search-console.service";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to DB");

  const slug = "flydubai-fz1073-cockpit-attack-uae-israel-ties";
  const blog = await Blog.findOne({ slug }).lean();

  if (!blog) {
    console.error("Blog not found:", slug);
    process.exit(1);
  }

  console.log("Found blog:", blog.title);
  
  // 1. Preflight
  const preflightErrors = SeoPreflightService.validateForPublishing(blog as any);
  console.log("\n--- Preflight Errors ---");
  console.log(preflightErrors);

  // 2. Quality & Cannibalization
  const qualityReport = await ContentQualityService.check(
    blog.title,
    blog.content,
    blog.tags || [],
    (blog as any).contentType || "standard",
    blog.slug
  );
  console.log("\n--- Quality Report ---");
  console.log(JSON.stringify(qualityReport, null, 2));

  // 3. GSC status (skip actual call if not configured)
  console.log("\n--- GSC Configured ---");
  console.log(SearchConsoleService.isConfigured());

  // 4. Checklist & Old Articles (Mocked from check route logic)
  const checklist = {
    title: !!blog.title && blog.title.length >= 15,
    slug: !!blog.slug && blog.slug.length >= 5,
    metaTitle: !!blog.seo?.title,
    metaDescription: !!blog.seo?.description && blog.seo.description.length >= 50,
    h1OrHeadings: /<h[1-6]/.test(blog.content),
    category: !!blog.category,
    tags: blog.tags?.length > 0,
    topic: !!(blog as any).topics?.length || !!(blog as any).primaryTopic,
    featuredImage: !!blog.featuredImage,
    author: !!blog.author,
    canonical: !!blog.seo?.canonicalUrl,
    jsonLd: !!blog.seo?.schemaMarkup,
    sitemapEligible: blog.status === "published",
    noDuplicateWarning: qualityReport.cannibalization.filter((c: any) => c.similarity === "HIGH").length === 0,
    contentQuality: qualityReport.passed,
  };
  
  console.log("\n--- Readiness Checklist ---");
  console.log(checklist);

  const { RelatedArticleService } = await import("./src/modules/seo/services/related-article.service");
  const relatedArticles = await RelatedArticleService.getHighlyRelevantArticles(blog as any, 5);
  const oldArticlesToUpdate = relatedArticles
    .filter((a: any) => new Date(a.publishAt) < new Date(blog.publishAt || new Date()))
    .map((a: any) => ({
      title: a.title,
      slug: a.slug,
      url: `/blogs/${a.slug}`
    }));

  console.log("\n--- Old Articles To Update (Discovery) ---");
  console.log(oldArticlesToUpdate);

  process.exit(0);
}

run().catch(console.error);
