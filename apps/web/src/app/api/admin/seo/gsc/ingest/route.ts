import { NextResponse } from "next/server";
import { SeoPerformanceIngestionService } from "@/modules/seo/services/seo-performance-ingestion.service";
import dbConnect from "@/lib/mongoose";

export const maxDuration = 300; // Allow maximum execution time on Vercel for ingestion

/**
 * Endpoint for automated GSC data ingestion.
 * Compatible with QStash or Vercel Cron.
 * Secured via CRON_SECRET or an Authorization Bearer token.
 */
export async function POST(req: Request) {
  try {
    // 1. Security check
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: "Configuration Error: CRON_SECRET is missing." }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      // Check if it's passed as a query param (common for some simple crons)
      const { searchParams } = new URL(req.url);
      if (searchParams.get("token") !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Parse configurable date range (if provided in payload)
    let startDate: string;
    let endDate: string;

    try {
      const body = await req.json();
      if (body.startDate && body.endDate) {
        startDate = body.startDate;
        endDate = body.endDate;
      } else {
        throw new Error("No dates provided in body");
      }
    } catch {
      // Default: Google Search Console data is delayed by about 3 days.
      // We will pull the data for 3 days ago.
      const date = new Date();
      date.setDate(date.getDate() - 3);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      startDate = `${year}-${month}-${day}`;
      endDate = startDate;
    }

    // 3. Connect DB
    await dbConnect();

    // 4. Run Ingestion
    const result = await SeoPerformanceIngestionService.ingestHistoricalData(startDate, endDate);

    // 5. Return success
    return NextResponse.json({
      message: "GSC Ingestion Completed",
      dateRange: { startDate, endDate },
      result
    }, { status: 200 });

  } catch (error: any) {
    console.error("[GSC Ingestion API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
