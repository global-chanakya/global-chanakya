import { Types } from "mongoose";
import { SeoPerformance, ISeoPerformance } from "@/lib/models/SeoPerformance";
import { Blog, IBlog } from "@/lib/models/Blog";

// Typings for GSC Intelligence outputs
export type EvidenceLevel = "NO_EVIDENCE" | "POSSIBLE" | "LIKELY" | "STRONG_EVIDENCE";

export interface CannibalizationSignal {
  semanticSimilarity: number;
  titleOverlap: number;
  intentMatch: boolean;
  queryOverlap: boolean;
}

export interface CannibalizationEvidence {
  query: string;
  urlA: string;
  urlB: string;
  signals: CannibalizationSignal;
  urlAStats: { impressions: number; clicks: number; ctr: number; position: number };
  urlBStats: { impressions: number; clicks: number; ctr: number; position: number };
  evidence: EvidenceLevel;
  reason: string;
}

export interface CtrOpportunityConfig {
  minImpressions: number;
  maxCtr: number;
  minPosition: number;
  maxPosition: number;
  minClicks: number;
}

export interface SeoReviewOpportunity {
  url: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  dateRange: { start: Date; end: Date };
  reason: string;
}

export class GscIntelligenceService {
  /**
   * Helper: Calculate Jaccard similarity for two strings (Title/Lexical Overlap)
   */
  private static calculateJaccard(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));
    if (set1.size === 0 && set2.size === 0) return 0;
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * 1. URL -> Queries
   */
  static async getQueriesForUrl(url: string, startDate: Date, endDate: Date): Promise<ISeoPerformance[]> {
    return await SeoPerformance.aggregate([
      {
        $match: {
          page: url,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$query",
          clicks: { $sum: "$clicks" },
          impressions: { $sum: "$impressions" },
          avgPosition: { $avg: "$position" },
          isBlogUrl: { $first: "$isBlogUrl" },
          blogId: { $first: "$blogId" }
        }
      },
      {
        $project: {
          query: "$_id",
          page: url,
          clicks: 1,
          impressions: 1,
          ctr: { $round: [{ $cond: [{ $eq: ["$impressions", 0] }, 0, { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] }] }, 2] },
          position: { $round: ["$avgPosition", 1] },
          isBlogUrl: 1,
          blogId: 1,
          _id: 0
        }
      },
      { $sort: { impressions: -1 } }
    ]);
  }

  /**
   * 2. Query -> URLs
   */
  static async getUrlsForQuery(query: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await SeoPerformance.aggregate([
      {
        $match: {
          query: query,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$page",
          clicks: { $sum: "$clicks" },
          impressions: { $sum: "$impressions" },
          avgPosition: { $avg: "$position" },
          isBlogUrl: { $first: "$isBlogUrl" },
          blogId: { $first: "$blogId" }
        }
      },
      {
        $project: {
          page: "$_id",
          query: query,
          clicks: 1,
          impressions: 1,
          ctr: { $round: [{ $cond: [{ $eq: ["$impressions", 0] }, 0, { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] }] }, 2] },
          position: { $round: ["$avgPosition", 1] },
          isBlogUrl: 1,
          blogId: 1,
          _id: 0
        }
      },
      { $sort: { impressions: -1 } }
    ]);
  }

  /**
   * 3. Evaluate Cannibalization Evidence using internal GSC overlap + Semantics
   * Takes two URLs and analyzes their overlap on a specific query.
   */
  static async evaluateCannibalization(
    query: string,
    urlA: string,
    urlB: string,
    blogA: Partial<IBlog>,
    blogB: Partial<IBlog>,
    semanticSimilarity: number,
    startDate: Date,
    endDate: Date
  ): Promise<CannibalizationEvidence | null> {
    
    // Ignore non-blog URLs for cannibalization logic
    if (!urlA.includes("/blogs/") || !urlB.includes("/blogs/")) {
       return null; 
    }

    const [statsA, statsB] = await Promise.all([
      SeoPerformance.aggregate([
        { $match: { page: urlA, query, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, clicks: { $sum: "$clicks" }, impressions: { $sum: "$impressions" }, position: { $avg: "$position" } } }
      ]),
      SeoPerformance.aggregate([
        { $match: { page: urlB, query, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, clicks: { $sum: "$clicks" }, impressions: { $sum: "$impressions" }, position: { $avg: "$position" } } }
      ])
    ]);

    const aPerf = statsA[0] || { clicks: 0, impressions: 0, position: 0 };
    const bPerf = statsB[0] || { clicks: 0, impressions: 0, position: 0 };

    const aCtr = aPerf.impressions > 0 ? parseFloat(((aPerf.clicks / aPerf.impressions) * 100).toFixed(2)) : 0;
    const bCtr = bPerf.impressions > 0 ? parseFloat(((bPerf.clicks / bPerf.impressions) * 100).toFixed(2)) : 0;

    const titleOverlap = this.calculateJaccard(blogA.title || "", blogB.title || "");
    const intentMatch = (blogA.searchIntent === blogB.searchIntent) && (blogA.searchIntent !== undefined);
    
    // Query overlap requires BOTH to have impressions > 0 for this query in the date range
    const queryOverlap = aPerf.impressions > 0 && bPerf.impressions > 0;

    const signals: CannibalizationSignal = {
      semanticSimilarity,
      titleOverlap,
      intentMatch,
      queryOverlap
    };

    let evidence: EvidenceLevel = "NO_EVIDENCE";
    let reason = "No significant overlap detected.";

    if (queryOverlap) {
      if (semanticSimilarity > 0.85 && intentMatch) {
        evidence = "STRONG_EVIDENCE";
        reason = "Both URLs receive impressions for the exact same query, possess high semantic similarity, and share the same search intent.";
      } else if (semanticSimilarity > 0.75 || intentMatch) {
        evidence = "LIKELY";
        reason = "Both URLs receive impressions for the query and have moderate semantic similarity or intent overlap.";
      } else {
        evidence = "POSSIBLE";
        reason = "Both URLs receive impressions for the query, but semantic similarity is low and intents diverge. (Could be legitimate topic overlap, e.g., news vs analysis).";
      }
    } else {
      if (semanticSimilarity > 0.90 && titleOverlap > 0.5) {
        evidence = "POSSIBLE";
        reason = "High semantic and title overlap, but they do NOT currently compete for the same query impressions in GSC.";
      }
    }

    return {
      query,
      urlA,
      urlB,
      signals,
      urlAStats: { impressions: aPerf.impressions, clicks: aPerf.clicks, ctr: aCtr, position: aPerf.position },
      urlBStats: { impressions: bPerf.impressions, clicks: bPerf.clicks, ctr: bCtr, position: bPerf.position },
      evidence,
      reason
    };
  }

  /**
   * 4. Identify High-Impression / Low-CTR Opportunities
   */
  static async getCtrOpportunities(
    startDate: Date,
    endDate: Date,
    config: CtrOpportunityConfig = { minImpressions: 1000, maxCtr: 1.0, minPosition: 1, maxPosition: 20, minClicks: 0 }
  ): Promise<SeoReviewOpportunity[]> {
    
    // Group all performance by page first
    const pages = await SeoPerformance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          isBlogUrl: true // Only evaluate blog articles
        }
      },
      {
        $group: {
          _id: "$page",
          clicks: { $sum: "$clicks" },
          impressions: { $sum: "$impressions" },
          avgPosition: { $avg: "$position" }
        }
      },
      {
        $project: {
          clicks: 1,
          impressions: 1,
          avgPosition: 1,
          avgCtr: { $cond: [{ $eq: ["$impressions", 0] }, 0, { $multiply: [{ $divide: ["$clicks", "$impressions"] }, 100] }] }
        }
      },
      {
        $match: {
          impressions: { $gte: config.minImpressions },
          clicks: { $gte: config.minClicks },
          avgCtr: { $lte: config.maxCtr },
          avgPosition: { $gte: config.minPosition, $lte: config.maxPosition }
        }
      },
      { $sort: { impressions: -1 } }
    ]);

    return pages.map(p => ({
      url: p._id,
      impressions: p.impressions,
      clicks: p.clicks,
      ctr: parseFloat((p.avgCtr || 0).toFixed(2)),
      averagePosition: parseFloat((p.avgPosition || 0).toFixed(1)),
      dateRange: { start: startDate, end: endDate },
      reason: `SEO_REVIEW_OPPORTUNITY: Page has high visibility (${p.impressions} impressions) on page 1-2, but poor CTR (${parseFloat((p.avgCtr || 0).toFixed(2))}%)`
    }));
  }

  /**
   * 5. Top Cannibalization Candidates
   * Identifies top queries where multiple blog URLs are competing for impressions.
   */
  static async getTopCannibalizationCandidates(startDate: Date, endDate: Date, limit: number = 10): Promise<CannibalizationEvidence[]> {
    const queryCandidates = await SeoPerformance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate }, isBlogUrl: true } },
      { $group: { _id: { query: "$query", page: "$page" }, impressions: { $sum: "$impressions" } } },
      { $match: { impressions: { $gt: 0 } } },
      { $sort: { impressions: -1 } },
      { $group: { _id: "$_id.query", urls: { $push: { page: "$_id.page", impressions: "$impressions" } }, urlCount: { $sum: 1 }, totalImpressions: { $sum: "$impressions" } } },
      { $match: { urlCount: { $gt: 1 } } },
      { $sort: { totalImpressions: -1 } },
      { $limit: limit }
    ]);

    const results: CannibalizationEvidence[] = [];
    for (const candidate of queryCandidates) {
      if (candidate.urls.length < 2) continue;
      const urlA = candidate.urls[0].page;
      const urlB = candidate.urls[1].page;
      const query = candidate._id;

      const slugA = urlA.split("/").pop();
      const slugB = urlB.split("/").pop();

      const blogA = await Blog.findOne({ slug: slugA }).select("title searchIntent").lean();
      const blogB = await Blog.findOne({ slug: slugB }).select("title searchIntent").lean();

      if (!blogA || !blogB) continue;

      const evidence = await this.evaluateCannibalization(query, urlA, urlB, blogA, blogB, 0, startDate, endDate);
      if (evidence) results.push(evidence);
    }
    return results;
  }
}
