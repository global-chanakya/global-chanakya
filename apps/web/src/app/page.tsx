import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, Globe, Shield, Clock,
  TrendingUp, Eye, Heart, Bookmark, ChevronRight, Crosshair,
  Newspaper, Flame, Activity, TriangleAlert, Info
} from "lucide-react";
import { BlogService } from "@/modules/blog/services/blog.service";
import { formatViews } from "@/lib/formatViews";
import type { TrendingBlog } from "@/lib/trending";
import { BannerAd } from "@/components/ads/AdUnit";
import { IntelligenceCard } from "@/components/intelligence/IntelligenceCard";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";
import dbConnect from "@/lib/mongoose";
import { ensureFreshLiveIntelligence } from "@/lib/intelligence/live/demandRefresh";
import { unstable_cache } from "next/cache";

const getCachedLiveEvents = unstable_cache(
  async () => {
    await dbConnect();
    return IntelligenceEvent.find({ status: "published", enrichmentStatus: "COMPLETED" })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select("slug title publishedAt region category summary whyItMatters indiaImpact riskLevel confidence sourceNames sourceUrls discoveredAt")
      .lean();
  },
  ["homepage-live-events"],
  { revalidate: 60 }
);

export const revalidate = 60;

const methodologyPillars = [
  {
    icon: Shield,
    title: "Source Verification",
    desc: "Rigorous vetting of open-source intelligence and primary documents before publication.",
  },
  {
    icon: Crosshair,
    title: "Analytical Independence",
    desc: "Unvarnished, non-partisan intelligence briefs unaffected by external influence.",
  },
  {
    icon: Globe,
    title: "Global Context",
    desc: "Every development analyzed within the broader framework of great power competition.",
  },
  {
    icon: Activity,
    title: "Real-Time Tracking",
    desc: "Continuous monitoring of flashpoints, economic shifts, and defense posturing.",
  },
];

function BlogCard({ blog, variant = "default", isViral = false }: { blog: TrendingBlog; variant?: "featured" | "default" | "compact"; isViral?: boolean }) {
  if (variant === "compact") {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block h-full">
        <article className="flex flex-row items-center sm:items-stretch gap-4 h-full p-3 bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] bg-[var(--surface)]">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-lg border border-[var(--border)]/50">
            <Image
              src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
              alt={blog.title || "Geopolitical Intelligence"}
              fill
              sizes="(max-width: 768px) 96px, 128px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isViral && (
              <div className="absolute top-1.5 left-1.5 bg-[var(--danger)] text-white p-1 rounded shadow-sm">
                 <Flame className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center flex-1 py-1 pr-2">
            <div className="mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
                {blog.category}
              </span>
            </div>
            <h3 className="font-heading font-bold text-white text-xs sm:text-sm md:text-base leading-[1.3] mb-2 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
              {blog.title}
            </h3>
            <div className="mt-auto flex items-center justify-between text-[9px] sm:text-[10px] text-[var(--muted)] uppercase tracking-[0.14em] font-bold">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {formatViews(blog.analytics?.views ?? 0)}
              </span>
              <span>{new Date(blog.publishAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block h-full min-h-[360px] md:min-h-[440px]">
        <article className="relative flex flex-col h-full bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-[var(--accent)]">
          <div className="absolute inset-0 bg-[var(--surface)]">
            <Image
              src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
              alt={blog.title || "Geopolitical Intelligence"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 )]/80 opacity-90 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Badges */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-20">
            {isViral ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--danger)]/90 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em]">
                <Flame className="w-3.5 h-3.5" /> High Threat
              </span>
            ) : blog.isTrending && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cyan)]/20 border border-[var(--border)] text-[var(--cyan)] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em]">
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </span>
            )}
          </div>

          <div className="relative z-10 mt-auto p-6 md:p-8 lg:p-10 flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1.5 rounded bg-[var(--gold)]/10 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)] border border-[var(--accent)]">
                {blog.category}
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-white text-2xl md:text-3xl lg:text-4xl leading-[1.2] mb-4 group-hover:text-[var(--gold)] transition-colors duration-300 line-clamp-3">
              {blog.title}
            </h3>
            <p className="text-sm md:text-base lg:text-lg text-white/80 leading-[1.6] line-clamp-2 mb-6 max-w-3xl">
              {blog.excerpt}
            </p>
            <div className="pt-5 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between text-[10px] md:text-[11px] text-[var(--muted)] uppercase tracking-[0.14em] font-bold">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {formatViews(blog.analytics?.views ?? 0)} Views
                </span>
              </div>
              <span>
                {new Date(blog.publishAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default Variant
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <article className="flex flex-col h-full bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] bg-[var(--surface)]">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--border)] bg-[var(--elevated)]">
          <Image
            src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
            alt={blog.title || "Geopolitical Intelligence"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-2 z-10">
            {isViral ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--danger)]/90 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em]">
                <Flame className="w-3.5 h-3.5" /> Hot
              </span>
            ) : blog.isTrending && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cyan)]/90 text-[var(--bg)] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em]">
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 p-5 lg:p-6">
          <div className="mb-3">
            <span className="inline-block px-2.5 py-1 rounded bg-[var(--elevated)] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)] border border-[var(--border)]">
              {blog.category}
            </span>
          </div>
          <h3 className="font-heading font-bold text-white text-lg md:text-xl leading-[1.3] mb-3 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-xs md:text-sm text-[var(--muted)] leading-[1.6] line-clamp-3 flex-1 mb-5">
            {blog.excerpt}
          </p>
          <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between text-[9px] md:text-[10px] text-[var(--muted)] uppercase tracking-[0.14em] font-bold">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
               {formatViews(blog.analytics?.views ?? 0)}
            </span>
            <span>
              {new Date(blog.publishAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function Home() {
  await dbConnect();
  
  // Trigger demand-driven refresh safely in the background
  ensureFreshLiveIntelligence().catch(err => console.error("[Home] Demand refresh error:", err));
  
  const theatresPromise = BlogService.getActiveCategories().then((categories) => {
    return { theatres: categories };
  });

  const [
    trendingBlogs, 
    latestBlogs, 
    mostViewedBlog7Days, 
    rawLiveEvents,
    theatresData
  ] = await Promise.all([
    BlogService.getTrendingBlogs(6),
    BlogService.getLatestBlogs(6),
    BlogService.getMostViewedBlogPast7Days(),
    getCachedLiveEvents(),
    theatresPromise
  ]);

  const { theatres } = theatresData;

  const liveEvents = rawLiveEvents.map((event: any) => ({
    id: event.slug,
    headline: event.title,
    timestamp: event.publishedAt ? new Date(event.publishedAt).toISOString() : new Date().toISOString(),
    region: event.region || "Global",
    topic: event.category || "Intelligence",
    summary: event.summary,
    whyItMatters: event.whyItMatters || "No strategic summary available.",
    indiaImpact: event.indiaImpact || "NEUTRAL",
    riskLevel: event.riskLevel || "LOW",
    confidence: event.confidence || "MODERATE",
    entities: [],
    sourceMetadata: {
      sources: event.sourceNames?.map((name: string, idx: number) => ({
        name,
        url: event.sourceUrls?.[idx],
        publishedTime: event.publishedAt ? new Date(event.publishedAt).toISOString() : undefined,
        retrievedTime: event.discoveredAt ? new Date(event.discoveredAt).toISOString() : undefined,
        type: "Media"
      })) || [],
      sourceCount: event.sourceNames?.length || 1,
      freshness: "Recently Updated",
      methodology: "Real-time AI enriched extraction"
    }
  }));

  const mostViewedBlogId = mostViewedBlog7Days?._id;
  const featuredBlog = mostViewedBlog7Days || latestBlogs[0] || trendingBlogs[0];

  const hasTrending = trendingBlogs.length > 0;
  const sideTrending = trendingBlogs.slice(1, 4); // take exactly 3 for perfect side stack

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] min-h-[calc(100vh-5rem)] flex items-center py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 md:px-4 md:py-2 rounded border border-[var(--sage)] bg-[var(--sage)]/10 text-[var(--sage)] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage)]" />
                Independent Strategic Analysis
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-[var(--cream)] max-w-[760px] mb-6 md:mb-8">
                Understand the Forces <br className="hidden sm:block" />
                <span className="text-[var(--sage-light)]">Shaping the World.</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--muted)] leading-[1.7] max-w-[620px] mb-8 md:mb-10">
                Independent geopolitical intelligence, strategic analysis, and research on the developments reshaping global power.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
                <Link
                  href="/blogs"
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--amber)] text-[var(--cream)] text-sm font-extrabold uppercase tracking-[0.06em] rounded-md hover:bg-[var(--amber-dark)] transition-all flex items-center justify-center gap-3 shadow-sm border border-[var(--amber-dark)]"
                >
                  Explore Intelligence
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/topics"
                  className="w-full sm:w-auto px-8 py-4 border border-[var(--sage)] bg-[var(--surface)] text-sm font-bold uppercase tracking-[0.06em] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-[var(--bg)] transition-all rounded-md text-center"
                >
                  View Topics
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-5 w-full">
              {featuredBlog && (
                <div className="relative w-full aspect-square sm:aspect-[4/5] max-h-[500px] md:max-h-[600px] bg-[var(--surface)] rounded-sm overflow-hidden flex flex-col group border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-500">
                  <div className="px-5 py-3 md:px-6 md:py-4 border-b border-[var(--border)] bg-[var(--elevated)] flex items-center justify-between">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-white flex items-center gap-2">
                      <Crosshair className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--gold)]" /> Featured Brief
                    </span>
                  </div>
                  <Link href={`/blogs/${featuredBlog.slug}`} className="flex-1 relative flex flex-col p-6 md:p-8 justify-end">
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105">
                      <Image
                        src={featuredBlog.featuredImage || "/images/fallback-geopolitics.jpg"}
                        alt={featuredBlog.title || "Geopolitical Intelligence"}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 )]/80" />
                    
                    <div className="relative z-10 flex flex-col">
                      <span className="mb-3 inline-block px-3 py-1.5 rounded bg-[var(--elevated)]/80 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)] border border-[var(--border)] w-fit">
                        {featuredBlog.category}
                      </span>
                      <h3 className="font-heading text-2xl md:text-3xl font-bold leading-[1.2] text-white group-hover:text-[var(--gold)] transition-all duration-300 mb-3 md:mb-4 line-clamp-3">
                        {featuredBlog.title}
                      </h3>
                      <p className="text-[var(--muted)] text-sm md:text-base line-clamp-2 md:line-clamp-3 leading-[1.6]">
                        {featuredBlog.excerpt}
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── LATEST INTELLIGENCE (Replaces Breaking Intel) ─── */}
      <section className="py-16 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 border-b border-[var(--border)] pb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-[var(--elevated)] border border-[var(--border)] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">Latest Intelligence</h2>
                <p className="text-[var(--muted)] text-[10px] md:text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Real-time assessments</p>
              </div>
            </div>
            <Link
              href={`/intelligence`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--elevated)] border border-[var(--border)] text-xs font-bold uppercase tracking-[0.06em] text-white hover:border-[var(--accent)] transition-all duration-300"
            >
              Command Center <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
             {liveEvents.map((item: any) => (
                <IntelligenceCard key={item.id} item={item} />
             ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ANALYSIS (Trending) ─── */}
      {hasTrending && (
        <section className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--bg)]">
          <div className="container mx-auto max-w-7xl px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 border-b border-[var(--border)] pb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-[var(--danger)]" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">Featured Analysis</h2>
                  <p className="text-[var(--muted)] text-[10px] md:text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Trending Geopolitics</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
              <div className="lg:col-span-8 h-full">
                {trendingBlogs[0] && (
                  <BlogCard blog={trendingBlogs[0]} variant="featured" isViral={trendingBlogs[0]._id === mostViewedBlogId} />
                )}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 h-full">
                {sideTrending.map((blog: TrendingBlog) => (
                  <div key={blog._id} className="flex-1 min-h-[120px]">
                    <BlogCard blog={blog} variant="compact" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── EXPLORE TOPICS ─── */}
      <section className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Explore Intelligence by Topic</h2>
            <p className="text-[var(--muted)] text-[10px] md:text-sm font-bold uppercase tracking-[0.14em]">Deep dive into specialized research areas</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {theatres.map((cat) => (
              <Link
                key={cat}
                href={`/blogs?category=${encodeURIComponent(cat)}`}
                className="px-5 py-3 md:px-6 md:py-4 rounded-md border border-[var(--border)] bg-[var(--elevated)] text-xs md:text-sm font-bold uppercase tracking-[0.06em] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LATEST REPORTS ─── */}
      {latestBlogs.length > 0 && (
        <section className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--bg)]">
          <div className="container mx-auto max-w-7xl px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 border-b border-[var(--border)] pb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[var(--cyan)]" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">Latest Reports</h2>
                  <p className="text-[var(--muted)] text-[10px] md:text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Recently Published</p>
                </div>
              </div>
              <Link
                href={`/blogs`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-bold uppercase tracking-[0.06em] text-white hover:border-[var(--accent)] transition-all duration-300"
              >
                All Reports <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {latestBlogs.map((blog: TrendingBlog) => (
                <div key={blog._id} className="h-full">
                  <BlogCard blog={blog} variant="default" isViral={blog._id === mostViewedBlogId} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── AD UNIT ─── */}
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-8">
        <BannerAd slot="auto" />
      </div>

      {/* ─── METHODOLOGY / SOURCE VERIFICATION ─── */}
      <section className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Methodology & Trust
            </h2>
            <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
              We adhere to strict editorial standards, ensuring all intelligence is independently verified, properly sourced, and analytically sound.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodologyPillars.map((p) => (
              <div
                key={p.title}
                className="p-6 md:p-8 rounded-sm bg-[var(--elevated)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--bg)] flex items-center justify-center mb-6 border border-[var(--border)]">
                  <p.icon className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-3">{p.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-[1.6]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT GLOBAL CHANAKYA ─── */}
      <section className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="container mx-auto max-w-7xl px-6 md:px-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-6">
            <Info className="w-8 h-8 text-[var(--gold)]" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">About Global Chanakya</h2>
          <p className="text-[var(--muted)] text-lg max-w-3xl leading-[1.7] mb-8">
            Global Chanakya Intelligence is a premier strategic research platform dedicated to decoding the complexities of modern geopolitics. We provide policymakers, defense analysts, and corporate strategists with the actionable insights required to navigate an increasingly multipolar world.
          </p>
          <Link
            href="/about"
            className="px-6 py-3 border border-[var(--gold)] text-[var(--gold)] font-bold uppercase tracking-[0.06em] rounded-md hover:bg-[var(--gold)] hover:text-[var(--bg)] transition-colors text-sm"
          >
            Read Our Story
          </Link>
        </div>
      </section>

    </div>
  );
}
