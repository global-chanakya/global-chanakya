import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import { SearchConsoleService } from "../src/modules/seo/services/search-console.service";
import { SeoPerformanceIngestionService } from "../src/modules/seo/services/seo-performance-ingestion.service";
import { GscIntelligenceService } from "../src/modules/seo/services/gsc-intelligence.service";

async function run() {
  console.log("=== GSC REAL DATA PRODUCTION VALIDATION ===");

  // 1. Verify Environment Safety
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error("Missing MONGODB_URI. Aborting validation.");
    process.exit(1);
  }

  // Double check that we are not accidentally wiping data. We will not use deleteMany() for real tests!
  console.log(`[Validation] Target DB: ${MONGO_URI.split("@").pop()?.split("?")[0]}`);

  // 2. Credential Configuration Status
  if (!SearchConsoleService.isConfigured()) {
    console.warn("\n[Validation] REAL GSC VALIDATION BLOCKED: GSC credentials are not configured.");
    console.warn("Required environment variables: GSC_SERVICE_ACCOUNT_EMAIL, GSC_PRIVATE_KEY, GSC_SITE_URL.");
    console.log("No database records have been modified. No Google API requests were made.");
    process.exit(0);
  }

  console.log("\n[Validation] GSC Credentials found. Connecting to DB...");
  await mongoose.connect(MONGO_URI);

  // 3. Define 7 day window (GSC is delayed by 2-3 days, so we fetch -10 to -3 days)
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date();
  start.setDate(start.getDate() - 10);

  const fmtDate = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  
  const startDateStr = fmtDate(start);
  const endDateStr = fmtDate(end);

  console.log(`[Validation] Target Window: ${startDateStr} to ${endDateStr}`);

  // 4. Ingest Real Data
  console.log("\n--- STARTING REAL GSC INGESTION ---");
  const ingestionResult = await SeoPerformanceIngestionService.ingestHistoricalData(startDateStr, endDateStr);
  console.log("Ingestion Result:", ingestionResult);

  if (ingestionResult.processed === 0) {
    console.warn("[Validation] Ingestion returned 0 rows. GSC might not have data for this window or credentials might be invalid for this site property.");
  } else {
    // 5. Run Intelligence Queries on real data
    console.log("\n--- REAL GSC INTELLIGENCE VALIDATION ---");
    
    // Test CTR Opportunity
    const opps = await GscIntelligenceService.getCtrOpportunities(start, end, {
      minImpressions: 10,  // low threshold for testing
      maxCtr: 5.0,
      minPosition: 1,
      maxPosition: 100,
      minClicks: 0
    });

    console.log(`Found ${opps.length} CTR opportunities in this window.`);
    if (opps.length > 0) {
      console.log("Top Opportunity:", opps[0]);
    }
  }

  await mongoose.disconnect();
  console.log("\n=== VALIDATION COMPLETE ===");
}

run().catch(console.error);
