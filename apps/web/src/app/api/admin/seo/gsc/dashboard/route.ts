import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { SeoPerformance } from "@/lib/models/SeoPerformance";
import { GscIntelligenceService } from "@/modules/seo/services/gsc-intelligence.service";
import { Blog } from "@/lib/models/Blog";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Determine the latest available data date
    const latestRecord = await SeoPerformance.findOne().sort({ date: -1 }).select("date").lean();
    
    if (!latestRecord) {
      return NextResponse.json({
        hasData: false
      });
    }

    const endDate = latestRecord.date;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 28); // Default 28 days back from the latest record

    // Extract filters if provided (optional for future scaling)
    const { searchParams } = new URL(req.url);
    const paramStart = searchParams.get("startDate");
    const paramEnd = searchParams.get("endDate");
    
    let finalStart = paramStart ? new Date(paramStart) : startDate;
    let finalEnd = paramEnd ? new Date(paramEnd) : endDate;

    if (isNaN(finalStart.getTime())) finalStart = startDate;
    if (isNaN(finalEnd.getTime())) finalEnd = endDate;

    // 1. KPIs
    const kpiResult = await SeoPerformance.aggregate([
      { $match: { date: { $gte: finalStart, $lte: finalEnd } } },
      { 
        $group: { 
          _id: null, 
          clicks: { $sum: "$clicks" }, 
          impressions: { $sum: "$impressions" },
          avgPosition: { $avg: "$position" }
        }
      },
      {
        $project: {
          clicks: 1,
          impressions: 1,
          avgPosition: { $round: ["$avgPosition", 1] },
          ctr: { $round: [{ $cond: [{ $eq: ["$impressions", 0] }, 0, { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] }] }, 2] }
        }
      }
    ]);

    const kpis = kpiResult[0] || { clicks: 0, impressions: 0, ctr: 0, avgPosition: 0 };

    // 2. Trend (group by date)
    const trendResult = await SeoPerformance.aggregate([
      { $match: { date: { $gte: finalStart, $lte: finalEnd } } },
      { 
        $group: { 
          _id: "$date", 
          clicks: { $sum: "$clicks" }, 
          impressions: { $sum: "$impressions" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trend = trendResult.map(t => ({
      date: t._id.toISOString().split('T')[0],
      clicks: t.clicks,
      impressions: t.impressions
    }));

    // 3. Top Queries
    const topQueriesResult = await SeoPerformance.aggregate([
      { $match: { date: { $gte: finalStart, $lte: finalEnd } } },
      { 
        $group: { 
          _id: "$query", 
          clicks: { $sum: "$clicks" }, 
          impressions: { $sum: "$impressions" },
          avgPosition: { $avg: "$position" }
        }
      },
      {
        $project: {
          query: "$_id",
          clicks: 1,
          impressions: 1,
          avgPosition: { $round: ["$avgPosition", 1] },
          ctr: { $round: [{ $cond: [{ $eq: ["$impressions", 0] }, 0, { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] }] }, 2] },
          _id: 0
        }
      },
      { $sort: { impressions: -1 } },
      { $limit: 10 }
    ]);

    // 4. Top Pages
    const topPagesResult = await SeoPerformance.aggregate([
      { $match: { date: { $gte: finalStart, $lte: finalEnd } } },
      { 
        $group: { 
          _id: "$page", 
          clicks: { $sum: "$clicks" }, 
          impressions: { $sum: "$impressions" },
          avgPosition: { $avg: "$position" },
          blogId: { $first: "$blogId" }
        }
      },
      {
        $project: {
          page: "$_id",
          clicks: 1,
          impressions: 1,
          blogId: 1,
          avgPosition: { $round: ["$avgPosition", 1] },
          ctr: { $round: [{ $cond: [{ $eq: ["$impressions", 0] }, 0, { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] }] }, 2] },
          _id: 0
        }
      },
      { $sort: { impressions: -1 } },
      { $limit: 10 }
    ]);

    // Attach blog titles if available
    const blogIds = topPagesResult.map(p => p.blogId).filter(Boolean);
    const blogs = await Blog.find({ _id: { $in: blogIds } }).select("_id title").lean();
    const blogMap = new Map(blogs.map(b => [b._id.toString(), b.title]));

    const topPages = topPagesResult.map(p => ({
      ...p,
      blogTitle: p.blogId ? blogMap.get(p.blogId.toString()) : undefined
    }));

    // 5. CTR Opportunities
    const ctrOpportunities = await GscIntelligenceService.getCtrOpportunities(finalStart, finalEnd, {
      minImpressions: 50,
      maxCtr: 2.0,
      minPosition: 1,
      maxPosition: 20,
      minClicks: 0
    });

    // 6. Cannibalization Evidence
    const cannibalizationEvidence = await GscIntelligenceService.getTopCannibalizationCandidates(finalStart, finalEnd, 5);

    return NextResponse.json({
      hasData: true,
      latestDataDate: endDate.toISOString().split('T')[0],
      dateRange: {
        start: finalStart.toISOString().split('T')[0],
        end: finalEnd.toISOString().split('T')[0],
      },
      kpis: {
        clicks: kpis.clicks,
        impressions: kpis.impressions,
        ctr: kpis.ctr,
        position: kpis.avgPosition
      },
      trend,
      topQueries: topQueriesResult,
      topPages,
      ctrOpportunities: ctrOpportunities.slice(0, 10), // Limit array
      cannibalizationEvidence
    });

  } catch (error: any) {
    console.error("[GSC Dashboard API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
