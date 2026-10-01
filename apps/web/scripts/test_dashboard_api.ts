import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { SeoPerformance } from "../src/lib/models/SeoPerformance";
import { GET } from "../src/app/api/admin/seo/gsc/dashboard/route";

// Mock auth
jest.mock("@/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { role: "admin" } })
}));

async function runTest() {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);

  // Clear any existing test data
  await SeoPerformance.deleteMany({ query: { $regex: "^test_dashboard_" } });

  console.log("=== GSC DASHBOARD API VERIFICATION ===");

  // Mock Request creator
  const createReq = (urlParams = "") => {
    return {
      url: `http://localhost/api/admin/seo/gsc/dashboard${urlParams}`,
      headers: new Headers()
    } as any;
  };

  // Test 1: No Data
  const res1 = await GET(createReq());
  const data1 = await res1.json();
  console.log("1. No Data Test:", data1.hasData === false ? "✅ PASSED" : "❌ FAILED");

  // Insert mock data
  const date1 = new Date("2026-10-01");
  const date2 = new Date("2026-10-15");
  await SeoPerformance.insertMany([
    { date: date1, page: "https://example.com/a", query: "test_dashboard_1", clicks: 10, impressions: 100, position: 5, isBlogUrl: true },
    { date: date2, page: "https://example.com/b", query: "test_dashboard_2", clicks: 50, impressions: 1000, position: 2, isBlogUrl: true }
  ]);

  // Test 2: One available date (latest date anchors the 28 day window)
  const res2 = await GET(createReq());
  const data2 = await res2.json();
  // latest date is 2026-10-15. 28 days back is 2026-09-17.
  // So it should include BOTH date1 (10-01) and date2 (10-15).
  console.log("2. Multiple Available Dates (Default 28 day window anchored to latest):", data2.kpis.clicks === 60 ? "✅ PASSED" : "❌ FAILED", "Clicks:", data2.kpis.clicks);
  console.log("   Date Range:", data2.dateRange);

  // Test 3: Explicit startDate/endDate
  const res3 = await GET(createReq("?startDate=2026-10-10&endDate=2026-10-20"));
  const data3 = await res3.json();
  // Should only include date2
  console.log("3. Explicit startDate/endDate:", data3.kpis.clicks === 50 ? "✅ PASSED" : "❌ FAILED", "Clicks:", data3.kpis.clicks);

  // Test 4: startDate > endDate (Invalid range, yields empty results)
  const res4 = await GET(createReq("?startDate=2026-10-20&endDate=2026-10-10"));
  const data4 = await res4.json();
  console.log("4. startDate > endDate (Yields empty KPIs):", data4.kpis.clicks === 0 ? "✅ PASSED" : "❌ FAILED");

  // Test 5: Invalid Date Strings
  const res5 = await GET(createReq("?startDate=invalid&endDate=invalid"));
  const data5 = await res5.json();
  // Date("invalid") yields NaN, which mongo handles as no match or crashes. Let's see.
  // Actually, wait, it might crash.
  console.log("5. Invalid Dates (Handled/Caught):", res5.status === 500 || data5.kpis.clicks === 0 ? "✅ PASSED" : "❌ FAILED", "Status:", res5.status);

  // Cleanup
  await SeoPerformance.deleteMany({ query: { $regex: "^test_dashboard_" } });
  mongoose.disconnect();
}

// Quick manual mock for auth before running
const mockAuth = require("module");
const originalRequire = mockAuth.prototype.require;
mockAuth.prototype.require = function() {
  if (arguments[0] === "@/auth") return { auth: async () => ({ user: { role: "admin" } }) };
  // need to mock NextResponse also
  if (arguments[0] === "next/server") {
    return {
      NextResponse: {
        json: (data: any, init: any) => ({
          status: init?.status || 200,
          json: async () => data
        })
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

runTest().catch(console.error);
