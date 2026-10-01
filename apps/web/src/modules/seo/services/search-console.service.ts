/**
 * Google Search Console Integration Service
 *
 * This service provides the interface for fetching Search Console data.
 * It requires a Google Cloud Service Account with Search Console API access.
 *
 * Required environment variables (add to .env.local and Vercel dashboard):
 *   GSC_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
 *   GSC_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
 *   GSC_SITE_URL=https://www.globalchanakya.in/
 *
 * Setup steps:
 *   1. Go to Google Cloud Console > APIs & Services > Enable "Google Search Console API"
 *   2. Create a Service Account and download the JSON key
 *   3. In Google Search Console, add the service account email as a "Full" user for the property
 *   4. Copy the private_key and client_email values into the env vars above
 */

export interface GscQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPerformanceData {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  topQueries: GscQueryRow[];
  topPages: GscPageRow[];
  dataFreshness: string;
}

export type GscAvailability = "AVAILABLE" | "NOT_CONFIGURED" | "ERROR";

export class SearchConsoleService {
  static isConfigured(): boolean {
    return !!(
      process.env.GSC_SERVICE_ACCOUNT_EMAIL &&
      process.env.GSC_PRIVATE_KEY &&
      process.env.GSC_SITE_URL
    );
  }

  /**
   * Fetch site-wide performance data from the Search Console API.
   * Returns null if credentials are not configured.
   * Requires: npm install googleapis
   */
  static async getSitePerformance(
    startDate: string, // YYYY-MM-DD
    endDate: string    // YYYY-MM-DD
  ): Promise<GscPerformanceData | null> {
    if (!this.isConfigured()) {
      console.warn("[SearchConsoleService] Not configured. Set GSC_* environment variables.");
      return null;
    }

    try {
      // Dynamic import avoids bundling googleapis unless used server-side
      const { google } = await import("googleapis");

      const auth = new google.auth.JWT({
        email: process.env.GSC_SERVICE_ACCOUNT_EMAIL!,
        key: process.env.GSC_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      });

      const webmasters = google.webmasters({ version: "v3", auth });
      const siteUrl = process.env.GSC_SITE_URL!;

      const [queryRes, pageRes] = await Promise.all([
        webmasters.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate,
            endDate,
            dimensions: ["query"],
            rowLimit: 25,
          },
        }),
        webmasters.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate,
            endDate,
            dimensions: ["page"],
            rowLimit: 25,
          },
        }),
      ]);

      const mapRow = (row: any) => ({
        query: row.keys?.[0] || row.keys?.join(" ") || "",
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: parseFloat(((row.ctr || 0) * 100).toFixed(2)),
        position: parseFloat((row.position || 0).toFixed(1)),
      });

      const topQueries: GscQueryRow[] = (queryRes.data.rows || []).map(mapRow);
      const topPages: GscPageRow[] = (pageRes.data.rows || []).map((row: any) => ({
        ...mapRow(row),
        page: row.keys?.[0] || "",
      }));

      const totalClicks = topPages.reduce((s, p) => s + p.clicks, 0);
      const totalImpressions = topPages.reduce((s, p) => s + p.impressions, 0);

      return {
        totalClicks,
        totalImpressions,
        averageCtr: totalImpressions > 0
          ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2))
          : 0,
        averagePosition: topPages.length > 0
          ? parseFloat((topPages.reduce((s, p) => s + p.position, 0) / topPages.length).toFixed(1))
          : 0,
        topQueries,
        topPages,
        dataFreshness: `${startDate} to ${endDate}`,
      };
    } catch (e) {
      console.error("[SearchConsoleService] API error:", e);
      return null;
    }
  }

  /**
   * Fetch performance data for a single page URL slug.
   */
  static async getPagePerformance(
    slug: string,
    startDate: string,
    endDate: string
  ): Promise<GscPageRow | null> {
    if (!this.isConfigured()) return null;

    try {
      const { google } = await import("googleapis");
      const auth = new google.auth.JWT({
        email: process.env.GSC_SERVICE_ACCOUNT_EMAIL!,
        key: process.env.GSC_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      });

      const webmasters = google.webmasters({ version: "v3", auth });
      const siteUrl = process.env.GSC_SITE_URL!;
      const pageUrl = `${siteUrl.replace(/\/$/, "")}/blogs/${slug}`;

      const res = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["page"],
          dimensionFilterGroups: [
            {
              filters: [{ dimension: "page", operator: "equals", expression: pageUrl }],
            },
          ],
          rowLimit: 1,
        },
      });

      const row = res.data.rows?.[0];
      if (!row) return null;

      return {
        page: pageUrl,
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: parseFloat(((row.ctr || 0) * 100).toFixed(2)),
        position: parseFloat((row.position || 0).toFixed(1)),
      };
    } catch (e) {
      console.error("[SearchConsoleService] getPagePerformance error:", e);
      return null;
    }
  }

  /**
   * Fetch granular performance data mapping date -> page -> query.
   * Required for accurate database persistence and intelligence pipelines.
   */
  static async getGranularPerformance(
    startDate: string,
    endDate: string
  ): Promise<any[] | null> {
    if (!this.isConfigured()) {
      console.warn("[SearchConsoleService] GSC credentials missing. Granular fetch aborted.");
      return null;
    }

    try {
      const { google } = await import("googleapis");
      const auth = new google.auth.JWT({
        email: process.env.GSC_SERVICE_ACCOUNT_EMAIL!,
        key: process.env.GSC_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      });

      const webmasters = google.webmasters({ version: "v3", auth });
      const siteUrl = process.env.GSC_SITE_URL!;

      const res = await webmasters.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["date", "page", "query"],
          // Note: for production ingestion over large date ranges, you might need pagination
          // using 'startRow' and 'rowLimit'. Default limit is 1000. We will set it to 25000 (max).
          rowLimit: 25000, 
        },
      });

      return res.data.rows || [];
    } catch (e) {
      console.error("[SearchConsoleService] getGranularPerformance error:", e);
      return null;
    }
  }
}
