import { NextResponse } from "next/server";
import { SeoPerformanceIngestionService } from "@/modules/seo/services/seo-performance-ingestion.service";
import dbConnect from "@/lib/mongoose";
import { Receiver } from "@upstash/qstash";

export const maxDuration = 300; // Allow maximum execution time on Vercel for ingestion

/**
 * Endpoint for automated GSC data ingestion.
 * Compatible with QStash or Vercel Cron.
 * Secured via CRON_SECRET or an Authorization Bearer token.
 */
export async function POST(req: Request) {
  try {
    // 1. Security check
    const signature = req.headers.get("upstash-signature");
    let bodyText = "";

    if (signature) {
      if (!process.env.QSTASH_CURRENT_SIGNING_KEY || !process.env.QSTASH_NEXT_SIGNING_KEY) {
        return NextResponse.json({ error: "Configuration Error: QStash keys missing." }, { status: 500 });
      }
      const receiver = new Receiver({
        currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
      });
      bodyText = await req.text();
      try {
        const isValid = await receiver.verify({
          signature,
          body: bodyText,
        });
        if (!isValid) throw new Error("Invalid signature");
      } catch (e) {
        return NextResponse.json({ error: "Invalid QStash signature" }, { status: 401 });
      }
    } else {
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
      bodyText = await req.text();
    }

    // 2. Parse configurable date range (if provided in payload)
    let startDate: string;
    let endDate: string;

    try {
      if (bodyText) {
        const body = JSON.parse(bodyText);
        if (body.startDate && body.endDate) {
          startDate = body.startDate;
          endDate = body.endDate;
        } else {
          throw new Error("No dates provided in body");
        }
      } else {
        throw new Error("Empty body");
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
