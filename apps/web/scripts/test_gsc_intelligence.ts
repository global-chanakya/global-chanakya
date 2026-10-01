import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import { GscIntelligenceService } from "../src/modules/seo/services/gsc-intelligence.service";
import { SeoPerformance } from "../src/lib/models/SeoPerformance";
import { Blog } from "../src/lib/models/Blog";

async function run() {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const testDate = new Date("2026-10-15");
  const pastDate = new Date("2026-09-15");

  // 1. Setup Mock Performance Data
  await SeoPerformance.deleteMany({ date: { $in: [testDate, pastDate] } });

  await SeoPerformance.insertMany([
    // Query Overlap - Two blogs, same query
    { date: testDate, page: "https://www.globalchanakya.in/blogs/article-a", query: "defense budget 2026", clicks: 10, impressions: 500, ctr: 2.0, position: 3, isBlogUrl: true },
    { date: testDate, page: "https://www.globalchanakya.in/blogs/article-b", query: "defense budget 2026", clicks: 5, impressions: 200, ctr: 2.5, position: 5, isBlogUrl: true },
    
    // No overlap - Different query
    { date: testDate, page: "https://www.globalchanakya.in/blogs/article-c", query: "unrelated topics", clicks: 50, impressions: 1000, ctr: 5.0, position: 2, isBlogUrl: true },

    // Non-blog URL
    { date: testDate, page: "https://www.globalchanakya.in/about", query: "about global chanakya", clicks: 0, impressions: 2000, ctr: 0.0, position: 1, isBlogUrl: false },

    // CTR Opportunity - High imp, low ctr (0 clicks)
    { date: testDate, page: "https://www.globalchanakya.in/blogs/low-ctr-article", query: "high volume query", clicks: 0, impressions: 5000, ctr: 0.0, position: 8, isBlogUrl: true },

    // Normal CTR
    { date: testDate, page: "https://www.globalchanakya.in/blogs/normal-ctr-article", query: "normal query", clicks: 500, impressions: 5000, ctr: 10.0, position: 1, isBlogUrl: true },

    // Past Date (Historical)
    { date: pastDate, page: "https://www.globalchanakya.in/blogs/article-a", query: "defense budget 2026", clicks: 10, impressions: 500, ctr: 2.0, position: 3, isBlogUrl: true },
  ]);

  const blogA = { title: "Defense Budget 2026 Details", searchIntent: "informational" } as any;
  const blogB = { title: "Defense Budget 2026 Impact", searchIntent: "informational" } as any;
  const blogC_intentDiv = { title: "Defense Budget 2026 Analysis", searchIntent: "commercial" } as any;

  console.log("=== GSC INTELLIGENCE TESTS ===\n");

  // 1. Query -> URLs
  const urls = await GscIntelligenceService.getUrlsForQuery("defense budget 2026", pastDate, testDate);
  console.log("Urls for query 'defense budget 2026':", urls.length === 2 ? "✅ PASSED" : "❌ FAILED", urls.map(u => u.page));

  // 2. URL -> Queries
  const queries = await GscIntelligenceService.getQueriesForUrl("https://www.globalchanakya.in/blogs/article-a", pastDate, testDate);
  console.log("Queries for article-a:", queries.length === 1 ? "✅ PASSED" : "❌ FAILED");
  if (queries.length === 1 && queries[0].impressions === 1000) {
    console.log("Historical range sum (1000 imp): ✅ PASSED");
  }

  // 3. Cannibalization: Semantic Similarity + Query Overlap + Intent Match (STRONG_EVIDENCE)
  const can1 = await GscIntelligenceService.evaluateCannibalization(
    "defense budget 2026",
    "https://www.globalchanakya.in/blogs/article-a",
    "https://www.globalchanakya.in/blogs/article-b",
    blogA, blogB, 0.95, testDate, testDate
  );
  console.log("Cannibalization (Strong Evidence):", can1?.evidence === "STRONG_EVIDENCE" ? "✅ PASSED" : "❌ FAILED", can1?.evidence);

  // 4. Cannibalization: Intent Divergence (POSSIBLE)
  const can2 = await GscIntelligenceService.evaluateCannibalization(
    "defense budget 2026",
    "https://www.globalchanakya.in/blogs/article-a",
    "https://www.globalchanakya.in/blogs/article-c",
    blogA, blogC_intentDiv, 0.95, testDate, testDate
  );
  console.log("Cannibalization (Intent Divergence):", can2?.evidence === "POSSIBLE" ? "✅ PASSED" : "❌ FAILED", can2?.evidence);

  // 5. Cannibalization: No Query Overlap (POSSIBLE at best, based on semantics)
  const can3 = await GscIntelligenceService.evaluateCannibalization(
    "unrelated topics",
    "https://www.globalchanakya.in/blogs/article-a",
    "https://www.globalchanakya.in/blogs/article-c",
    blogA, blogC_intentDiv, 0.95, testDate, testDate
  );
  console.log("Cannibalization (No Query Overlap):", can3?.evidence === "POSSIBLE" ? "✅ PASSED" : "❌ FAILED", can3?.evidence);

  // 6. Non-Blog URL Isolation
  const can4 = await GscIntelligenceService.evaluateCannibalization(
    "about global chanakya",
    "https://www.globalchanakya.in/about",
    "https://www.globalchanakya.in/blogs/article-a",
    blogA, blogA, 0.95, testDate, testDate
  );
  console.log("Cannibalization (Non-Blog URL ignored):", can4 === null ? "✅ PASSED" : "❌ FAILED");

  // 7. CTR Opportunity
  const opps = await GscIntelligenceService.getCtrOpportunities(testDate, testDate, {
    minImpressions: 1000,
    maxCtr: 1.0,
    minPosition: 1,
    maxPosition: 20,
    minClicks: 0
  });
  
  const hasLowCtr = opps.find(o => o.url === "https://www.globalchanakya.in/blogs/low-ctr-article");
  const hasNormalCtr = opps.find(o => o.url === "https://www.globalchanakya.in/blogs/normal-ctr-article");
  const hasAbout = opps.find(o => o.url === "https://www.globalchanakya.in/about"); // Non-blog

  console.log("CTR Opportunity (Identified low CTR):", hasLowCtr ? "✅ PASSED" : "❌ FAILED");
  console.log("CTR Opportunity (Ignored normal CTR):", !hasNormalCtr ? "✅ PASSED" : "❌ FAILED");
  console.log("CTR Opportunity (Ignored non-blog):", !hasAbout ? "✅ PASSED" : "❌ FAILED");
  
  if (hasLowCtr && hasLowCtr.clicks === 0) {
    console.log("CTR Opportunity (Zero clicks handled safely): ✅ PASSED");
  }

  // Cleanup
  await SeoPerformance.deleteMany({ date: { $in: [testDate, pastDate] } });
  
  mongoose.disconnect();
}

run().catch(console.error);
