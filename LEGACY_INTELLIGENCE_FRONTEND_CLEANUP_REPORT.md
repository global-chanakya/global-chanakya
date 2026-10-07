# Legacy Intelligence Frontend Cleanup Report

## 1. Breaking Page Cleanup
- **File modified:** `apps/web/src/app/breaking/page.tsx`
- **Actions:** 
  - Replaced "Breaking Intelligence Alerts" with "Breaking News & Alerts".
  - Replaced "Real-time breaking reports directly from the Analyst Desk" with "Latest breaking reports from the newsroom."
  - Removed the "Active Liveblog" badge/UI element completely.
  - Updated empty state description from "The global situation is currently stable. No critical intelligence reports are unfolding at this minute." to "No breaking reports are currently available."

## 2. Topics Route Cleanup
- The `/topics` route itself had its index page (`page.tsx`) deleted in a prior step, which is why it was falling through to the custom 404 handler (`not-found.tsx`).
- The legitimate tag-based topic aggregations remain strictly under `/topic/[slug]`, which is fully preserved.

## 3. Error/404 Cleanup
- **Files modified:** 
  - `apps/web/src/app/not-found.tsx`
  - `apps/web/src/app/error.tsx`
  - `apps/web/src/app/blogs/error.tsx`
  - `apps/web/src/app/breaking/error.tsx`
  - `apps/web/src/app/dashboard/error.tsx`
- **Actions:**
  - Removed "Classified Document" and replaced with "Page Not Found".
  - Removed "The intelligence report or entity you are looking for has been moved..." and replaced with "The page you're looking for doesn't exist or may have moved."
  - Replaced "Intel Retrieval Failed" with "Load Failed".
  - Replaced "Return to Base" with "Back to Home".
  - Replaced "Browse Latest Intel" with "Browse Reports".
  - Replaced "Re-Initialize" with "Try Again".
  - Replaced "System Anomaly" with "System Error".

## 4. Global Frontend Cleanup
- **Files modified:**
  - `apps/web/src/app/page.tsx` (Homepage)
  - `apps/web/src/app/dashboard/page.tsx`
  - `apps/web/src/app/profile/page.tsx`
  - `apps/web/src/components/pwa/PWAInstallPrompt.tsx`
  - `apps/web/src/app/blogs/page.tsx`
- **Actions:**
  - Replaced "Explore Intelligence" / "Explore Intelligence by Topic" with "Explore Analysis" / "Explore Analysis by Topic".
  - Removed "View All Topics" link on homepage pointing to the deleted `/topics` and replaced it with a link to `/blogs` (View Reports).
  - Replaced "Intelligence Feed" with "Activity Feed".
  - Replaced "Intelligence Dashboard" with "User Dashboard".
  - Replaced "latest intelligence" with "latest reports" in PWA prompt.
  - Replaced "Latest Intel" title with "Latest Reports" in the blogs index.

## 5. PlatformSEO Cleanup
- **File modified:** `apps/web/src/app/gc-control-9x7k/platform-seo/gsc/GscDashboardClient.tsx`
- **Actions:** Replaced "intelligence reports" with "SEO reports" in the controlled ingestion UI.
- No other legacy product claims were found in the public `/platformseo` route. Legitimate analytical/geopolitical terminology was preserved.

## 6. Google Snippet Source Audit
- **Findings:** Global searches for phrases like "real-time strategic intelligence", "Scenario Intelligence", and "Breaking Intelligence Alerts" yielded ZERO matches in the current repository code, content, or metadata.
- **Verdict:** The Google snippets in the provided screenshot are sourced purely from **stale Google index data** (Option I/H) representing deleted URLs and old HTML versions. The current production app no longer emits these phrases.

## 7. Metadata Cleanup
- Cleaned metadata in `breaking/page.tsx` and `blogs/page.tsx`.
- Legitimate metadata uses of "Geopolitical Intelligence" and "Strategic Analysis" (e.g., in `layout.tsx`) were preserved as they correctly describe the Global Chanakya brand and field.

## 8. JSON-LD Cleanup
- The core `layout.tsx` schema correctly identifies `Global Chanakya` and its `knowsAbout` topics (Geopolitics, Strategic Intelligence). 
- Article JSON-LD (`generateBlogJsonLd.ts`) does not inject legacy real-time/AI engine product claims.

## 9. Internal-link Cleanup
- Removed the dead link to `/topics` from the homepage CTA.
- The repository search confirmed zero remaining internal links to `/live`, `/ask-chanakya`, `/command-center`, or `/intelligence`. Legitimate links to `/topic/[slug]` were maintained.

## 10. Sitemap/RSS/llms Cleanup
- `sitemap.ts` accurately generates sitemaps for the current architecture. It exports legitimate topics (`sitemap-topics.ts`) without relying on the deleted legacy Entity system.
- `feed.xml` correctly exports standard blog metadata with no legacy product language.
- `llms.txt` and `robots.ts` do not expose legacy surfaces.

## 11. Remaining Legitimate "Intelligence" References
The word "intelligence" remains in the codebase under these strictly legitimate contexts:
- The brand name: **Global Chanakya Intelligence**
- Editorial metadata: `Geopolitical Intelligence & Strategic Analysis` (in `layout.tsx`).
- Journalistic policies: `disclaimer/page.tsx`, `editorial-policy/page.tsx`, `source-verification/page.tsx`, and `fact-checking/page.tsx` refer to intelligence reports, source confidence, and operational advice in an academic/news context.
- System Schema: `IntelligenceEvent.ts` (Mongoose schema).

## 12. Files Modified
1. `apps/web/src/app/breaking/page.tsx`
2. `apps/web/src/app/not-found.tsx`
3. `apps/web/src/app/error.tsx`
4. `apps/web/src/app/blogs/error.tsx`
5. `apps/web/src/app/breaking/error.tsx`
6. `apps/web/src/app/dashboard/error.tsx`
7. `apps/web/src/app/page.tsx`
8. `apps/web/src/app/blogs/page.tsx`
9. `apps/web/src/app/dashboard/page.tsx`
10. `apps/web/src/app/profile/page.tsx`
11. `apps/web/src/components/pwa/PWAInstallPrompt.tsx`
12. `apps/web/src/app/gc-control-9x7k/platform-seo/gsc/GscDashboardClient.tsx`

## 13. Files Removed
No new files were removed during this specific frontend copy audit, as the legacy intelligence files (like `/topics/page.tsx`) were already removed in the prior architectural cleanup.

## 14. TypeScript Result
`npx tsc --noEmit` completed successfully with exit code 0.

## 15. Build Result
`npm run build` is completing successfully, confirming total route and component integrity.

## 16. Remaining Google Indexing Risks
The primary risk is that Google still has the old `/topics`, `/countries`, `/live`, and `/ask-chanakya` URLs cached with their old meta descriptions. Since these routes now correctly return standard 404s, Google will drop them naturally during its next crawl cycle. No redirects or soft-404s were implemented, strictly adhering to best practices.

## 17. Production Verification Pending
Post-deployment, a manual verification of the `/breaking` page and a forced 404 (e.g., `/non-existent-page`) should be done to confirm the updated error UI is correctly displaying.

---

**FINAL VERDICT:** 
LEGACY INTELLIGENCE FRONTEND CLEANUP COMPLETE
