import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { SeoPreflightService } from "@/modules/seo/services/seo-preflight.service";
import { ContentQualityService } from "@/modules/seo/services/content-quality.service";
import { SearchConsoleService } from "@/modules/seo/services/search-console.service";

export const maxDuration = 30;

async function requireAdmin() {
  const [session] = await Promise.all([auth(), dbConnect()]);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

/**
 * GET /api/admin/seo/check?blogId=xxx
 * Returns a full SEO readiness report for a blog post.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get("blogId");

    if (!blogId) {
      return NextResponse.json({ error: "blogId is required" }, { status: 400 });
    }

    const blog = await Blog.findById(blogId)
      .populate("author", "name")
      .populate("topics", "name")
      .lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // 1. SEO Preflight
    const preflightErrors = SeoPreflightService.validateForPublishing(blog as any);

    // 2. Content Quality
    const qualityReport = await ContentQualityService.check(
      blog.title,
      blog.content,
      blog.tags || [],
      (blog as any).contentType || "standard",
      blog.slug
    );

    // 3. Search Console (if configured)
    let gscData = null;
    let seoProblemClass = "WAITING_FOR_DATA"; // DISCOVERY, CTR, RANKING, CONTENT_OPPORTUNITY
    
    if (SearchConsoleService.isConfigured() && blog.status === "published") {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      gscData = await SearchConsoleService.getPagePerformance(blog.slug, startDate, endDate);
      
      if (gscData) {
        const ageInDays = (Date.now() - new Date(blog.publishAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        
        if (gscData.impressions === 0 && ageInDays < 7) {
          seoProblemClass = "INSUFFICIENT_DATA"; // Too new, or genuinely 0 impressions early on
        } else if (gscData.impressions < 50) {
          if (ageInDays > 14) {
            seoProblemClass = "DISCOVERY_PROBLEM"; // Low impressions after 2 weeks
          } else {
            seoProblemClass = "INSUFFICIENT_DATA"; // Need more time to gather impressions
          }
        } else if (gscData.ctr < 1.5) {
          seoProblemClass = "CTR_PROBLEM"; // Getting impressions, but CTR is weak (< 1.5%)
        } else if (gscData.position > 20) {
          seoProblemClass = "RANKING_PROBLEM"; // Good CTR/Impressions, but still on page 3+
        } else {
          seoProblemClass = "HEALTHY";
        }

        // Query -> Content Gap Detection (if we have access to queries)
        // Note: The getPagePerformance we have only returns page totals. Let's fetch queries for this page.
        try {
          const { google } = await import("googleapis");
          const auth = new google.auth.JWT({
            email: process.env.GSC_SERVICE_ACCOUNT_EMAIL!,
            key: process.env.GSC_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
          });
          const webmasters = google.webmasters({ version: "v3", auth });
          const siteUrl = process.env.GSC_SITE_URL!;
          const pageUrl = `${siteUrl.replace(/\/$/, "")}/blogs/${blog.slug}`;

          const queryRes = await webmasters.searchanalytics.query({
            siteUrl,
            requestBody: {
              startDate,
              endDate,
              dimensions: ["query"],
              dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "equals", expression: pageUrl }] }],
              rowLimit: 10, // Fetch top 10
            },
          });

          const queries = queryRes.data.rows?.filter(r => r.impressions && r.impressions > 10).map(r => r.keys?.[0]) || [];
          const missingQueries = [];
          
          const textToSearch = `${blog.title} ${blog.content} ${blog.tags?.join(" ")}`.toLowerCase();
          
          for (const q of queries) {
            if (!q) continue;
            const qLower = q.toLowerCase();
            
            // 1. Exact match
            if (textToSearch.includes(qLower)) continue;
            
            // 2. Token overlap (allow missing stop words or plural variations)
            const tokens = qLower.split(/\s+/).filter(t => t.length > 3 && !['what', 'how', 'why', 'when', 'who'].includes(t));
            let matches = 0;
            for (const t of tokens) {
              if (textToSearch.includes(t)) matches++;
            }
            // If most meaningful tokens are present, consider it covered
            if (tokens.length > 0 && matches / tokens.length >= 0.75) continue;

            // 3. This query gets significant impressions but isn't well covered conceptually
            missingQueries.push(q);
          }

          if (missingQueries.length > 0 && seoProblemClass !== "DISCOVERY_PROBLEM") {
            seoProblemClass = "CONTENT_OPPORTUNITY";
            (gscData as any).missingQueries = missingQueries; // Expose missing queries for the frontend
          }
        } catch (e) {
          console.warn("[Content Gap Detection] Failed to fetch queries for gap analysis");
        }
      }
    }

    // 4. Old -> New Discovery Recommendations
    const { RelatedArticleService } = await import("@/modules/seo/services/related-article.service");
    const relatedArticles = await RelatedArticleService.getHighlyRelevantArticles(blog as any, 5);
    const oldArticlesToUpdate = relatedArticles
      .filter(a => new Date(a.publishAt) < new Date(blog.publishAt || new Date()))
      .map(a => ({
        title: a.title,
        slug: a.slug,
        category: a.category,
        url: `/blogs/${a.slug}`
      }));

    // 4. Compose SEO checklist
    const checklist = {
      title: !!blog.title && blog.title.length >= 15,
      slug: !!blog.slug && blog.slug.length >= 5,
      metaTitle: !!blog.seo?.title,
      metaDescription: !!blog.seo?.description && blog.seo.description.length >= 50,
      h1OrHeadings: /<h[1-6]/.test(blog.content),
      category: !!blog.category,
      tags: blog.tags?.length > 0,
      topic: !!(blog as any).topics?.length || !!(blog as any).primaryTopic,
      featuredImage: !!blog.featuredImage,
      author: !!blog.author,
      canonical: !!blog.seo?.canonicalUrl,
      jsonLd: !!blog.seo?.schemaMarkup,
      sitemapEligible: blog.status === "published",
      noDuplicateWarning: qualityReport.cannibalization.filter(c => c.similarity === "HIGH").length === 0,
      contentQuality: qualityReport.passed,
    };

    const readinessScore = Object.values(checklist).filter(Boolean).length;
    const readinessTotal = Object.keys(checklist).length;

    return NextResponse.json({
      blogId,
      slug: blog.slug,
      status: blog.status,
      seoStatus: (blog as any).seoStatus || "NEEDS_REVIEW",
      readinessScore,
      readinessTotal,
      readinessPercent: Math.round((readinessScore / readinessTotal) * 100),
      checklist,
      preflightErrors,
      qualityReport,
      gscData,
      gscConfigured: SearchConsoleService.isConfigured(),
      seoProblemClass,
      oldArticlesToUpdate,
    });
  } catch (err) {
    console.error("[GET /api/admin/seo/check]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/seo/check?report=site
 * Site-wide SEO performance report from Search Console.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!SearchConsoleService.isConfigured()) {
      return NextResponse.json({
        configured: false,
        message: "Google Search Console is not configured.",
        requiredEnvVars: [
          "GSC_SERVICE_ACCOUNT_EMAIL",
          "GSC_PRIVATE_KEY",
          "GSC_SITE_URL",
        ],
        setupInstructions: [
          "1. Go to Google Cloud Console > APIs & Services > Enable 'Google Search Console API'",
          "2. Create a Service Account and download the JSON key",
          "3. In Google Search Console, add the service account email as a 'Full' user for the property",
          "4. Set GSC_SERVICE_ACCOUNT_EMAIL, GSC_PRIVATE_KEY, and GSC_SITE_URL in your .env.local and Vercel dashboard",
        ],
      });
    }

    const body = await req.json().catch(() => ({}));
    const endDate = body.endDate || new Date().toISOString().split("T")[0];
    const startDate = body.startDate || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const data = await SearchConsoleService.getSitePerformance(startDate, endDate);
    return NextResponse.json({ configured: true, data });
  } catch (err) {
    console.error("[POST /api/admin/seo/check]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
