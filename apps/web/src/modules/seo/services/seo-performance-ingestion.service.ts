import { SearchConsoleService } from "./search-console.service";
import { SeoPerformance } from "@/lib/models/SeoPerformance";
import { Blog } from "@/lib/models/Blog";

export class SeoPerformanceIngestionService {
  /**
   * Ingest GSC data for a specific date range.
   * Designed to be idempotent.
   */
  static async ingestHistoricalData(startDate: string, endDate: string): Promise<{
    processed: number;
    insertedOrUpdated: number;
    errors: number;
  }> {
    console.log(`[SeoPerformanceIngestionService] Starting ingestion from ${startDate} to ${endDate}`);
    
    const rows = await SearchConsoleService.getGranularPerformance(startDate, endDate);
    if (!rows) {
      console.warn("[SeoPerformanceIngestionService] No data returned from GSC.");
      return { processed: 0, insertedOrUpdated: 0, errors: 0 };
    }

    console.log(`[SeoPerformanceIngestionService] Fetched ${rows.length} rows.`);

    let processed = 0;
    let insertedOrUpdated = 0;
    let errors = 0;

    const bulkOps = [];
    
    // To optimize blog lookups, cache the URL paths to ObjectIds
    const blogUrlCache = new Map<string, string>();

    // Pre-cache all blog slugs found in the dataset to avoid N+1 lookups
    const uniqueSlugs = new Set<string>();
    const siteUrl = process.env.GSC_SITE_URL || "";

    for (const row of rows) {
      const pageUrl = row.keys?.[1] || "";
      const urlWithoutHost = pageUrl.replace(siteUrl, "/").replace("//", "/");
      if (urlWithoutHost.startsWith("/blogs/")) {
        const slug = urlWithoutHost.split("/")[2];
        if (slug) uniqueSlugs.add(slug);
      }
    }

    if (uniqueSlugs.size > 0) {
      const blogs = await Blog.find({ slug: { $in: Array.from(uniqueSlugs) } }).select("slug _id").lean();
      for (const b of blogs) {
        blogUrlCache.set(b.slug, b._id.toString());
      }
    }

    for (const row of rows) {
      processed++;
      try {
        const dateStr = row.keys?.[0]; // dimensions: ["date", "page", "query"]
        const pageUrl = row.keys?.[1];
        const query = row.keys?.[2];

        if (!dateStr || !pageUrl || !query) continue;

        const date = new Date(dateStr);
        const clicks = row.clicks || 0;
        const impressions = row.impressions || 0;
        const ctr = parseFloat(((row.ctr || 0) * 100).toFixed(2));
        const position = parseFloat((row.position || 0).toFixed(1));

        let blogId = undefined;
        let isBlogUrl = false;

        const urlWithoutHost = pageUrl.replace(siteUrl, "/").replace("//", "/");
        if (urlWithoutHost.startsWith("/blogs/")) {
          isBlogUrl = true;
          const slug = urlWithoutHost.split("/")[2];
          if (slug && blogUrlCache.has(slug)) {
            blogId = blogUrlCache.get(slug);
          }
        }

        bulkOps.push({
          updateOne: {
            filter: { date, page: pageUrl, query },
            update: {
              $set: {
                clicks,
                impressions,
                ctr,
                position,
                isBlogUrl,
                ...(blogId ? { blogId } : {}),
              }
            },
            upsert: true
          }
        });

        if (bulkOps.length >= 1000) {
          const result = await SeoPerformance.bulkWrite(bulkOps, { ordered: false });
          insertedOrUpdated += (result.upsertedCount + result.modifiedCount);
          bulkOps.length = 0; // Clear array
        }

      } catch (e) {
        console.error("[SeoPerformanceIngestionService] Failed to process row:", e);
        errors++;
      }
    }

    if (bulkOps.length > 0) {
      try {
        const result = await SeoPerformance.bulkWrite(bulkOps, { ordered: false });
        insertedOrUpdated += (result.upsertedCount + result.modifiedCount);
      } catch (e) {
        console.error("[SeoPerformanceIngestionService] Bulk write failed:", e);
        errors += bulkOps.length;
      }
    }

    console.log(`[SeoPerformanceIngestionService] Ingestion complete. Processed: ${processed}, Upserted: ${insertedOrUpdated}, Errors: ${errors}`);
    return { processed, insertedOrUpdated, errors };
  }
}
