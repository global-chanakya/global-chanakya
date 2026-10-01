import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import { SearchConsoleService } from "../src/modules/seo/services/search-console.service";
import { SeoPerformanceIngestionService } from "../src/modules/seo/services/seo-performance-ingestion.service";
import { SeoPerformance } from "../src/lib/models/SeoPerformance";
import { Blog } from "../src/lib/models/Blog";

async function run() {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  // Fetch an existing blog
  const existingBlog = await Blog.findOne({ status: "published" }).lean();
  if (!existingBlog) {
    console.error("No blogs found");
    process.exit(1);
  }
  const slug = existingBlog.slug;

  // Mock the GSC response
  SearchConsoleService.getGranularPerformance = async (start, end) => {
    return [
      { keys: ["2026-10-01", `https://www.globalchanakya.in/blogs/${slug}`, "test query 1"], clicks: 10, impressions: 100, ctr: 0.1, position: 5.5 },
      { keys: ["2026-10-01", "https://www.globalchanakya.in/about", "about global chanakya"], clicks: 2, impressions: 20, ctr: 0.1, position: 1.2 },
      // Duplicate to test in-flight handling or repeated run
    ];
  };

  process.env.GSC_SITE_URL = "https://www.globalchanakya.in";

  console.log("=== RUN 1: First Ingestion ===");
  const res1 = await SeoPerformanceIngestionService.ingestHistoricalData("2026-10-01", "2026-10-01");
  console.log("Result 1:", res1);
  
  const docCount1 = await SeoPerformance.countDocuments();
  console.log("Total DB Documents:", docCount1);

  console.log("\n=== RUN 2: Idempotency Test (Duplicate Ingestion) ===");
  const res2 = await SeoPerformanceIngestionService.ingestHistoricalData("2026-10-01", "2026-10-01");
  console.log("Result 2:", res2);
  
  const docCount2 = await SeoPerformance.countDocuments();
  console.log("Total DB Documents:", docCount2);
  
  if (docCount1 === docCount2 && docCount1 === 2) {
    console.log("✅ IDEMPOTENCY PASSED");
  } else {
    console.log("❌ IDEMPOTENCY FAILED");
  }

  // Check URL Mapping
  const blogMetric = await SeoPerformance.findOne({ query: "test query 1" });
  if (blogMetric?.isBlogUrl === true && blogMetric?.blogId?.toString() === existingBlog._id.toString()) {
    console.log("✅ URL MAPPING PASSED (Mapped to Blog ID)");
  } else {
    console.log("❌ URL MAPPING FAILED");
  }

  const nonBlogMetric = await SeoPerformance.findOne({ query: "about global chanakya" });
  if (nonBlogMetric?.isBlogUrl === false && !nonBlogMetric?.blogId) {
    console.log("✅ NON-BLOG URL MAPPING PASSED");
  } else {
    console.log("❌ NON-BLOG URL MAPPING FAILED");
  }

  // Cleanup
  await SeoPerformance.deleteMany({ date: new Date("2026-10-01") });
  
  mongoose.disconnect();
}

run().catch(console.error);
