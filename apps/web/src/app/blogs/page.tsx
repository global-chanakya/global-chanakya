import Link from "next/link";
import { Search, Crown, Eye, Heart, Bookmark, Newspaper, ArrowRight, TrendingUp } from "lucide-react";
import { Blog, IBlog } from "@/lib/models/Blog";
import { formatDate } from "@repo/utils";
import { formatViews } from "@/lib/formatViews";
import dbConnect from "@/lib/mongoose";
import { BlogService } from "@/modules/blog/services/blog.service";
import { BannerAd } from "@/components/ads/AdUnit";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category as string | undefined;
  const search = resolvedParams.search as string | undefined;
  const tag = resolvedParams.tag as string | undefined;

  const hasFilters = !!(search || tag || category);

  let canonical = "/blogs";
  if (category) {
    try {
      const activeCategories = await BlogService.getActiveCategories();
      const isValid = activeCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
      if (isValid) {
        const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        canonical = `/categories/${slug}`;
      }
    } catch (error) {
      console.error("Failed to fetch active categories for canonical:", error);
    }
  }

  return {
    title: "Latest Intel",
    description: "Read the latest geopolitical reports and intelligence briefs.",
    alternates: {
      canonical,
    },
    ...(hasFilters ? { robots: { index: false, follow: false } } : {}),
  };
}

// Next.js App Router ISR
export const revalidate = 3600; // 1 hour

import { unstable_cache } from "next/cache";

const getCachedBlogs = unstable_cache(
  async (category?: string, trending?: boolean) => {
    await dbConnect();
    const query: Record<string, unknown> = {
      status: "published",
      contentType: { $ne: "platform-seo" },
    };
    if (category) query.category = category;
    if (trending) query.isTrending = true;

    const blogs = await Blog.find(query)
      .select("-content")
      .sort({ publishAt: -1 })
      .populate("author", "name")
      .lean();
      
    // Serialize to remove ObjectIds and Dates for Next.js cache
    return JSON.parse(JSON.stringify(blogs)) as any[];
  },
  ["blogs-list-cache"],
  { revalidate: 3600, tags: ["blogs"] }
);

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category as string | undefined;
  const trending = resolvedParams.trending === "true";

  let blogs: IBlog[] = [];
  try {
    blogs = await getCachedBlogs(category, trending);
  } catch (error) {
    console.error("DB connection failed for blogs:", error);
  }

  const categories = await BlogService.getActiveCategories();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {trending ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--cyan)]/10 text-[var(--cyan)] text-[10px] font-bold uppercase tracking-[0.14em] rounded border border-[var(--border)]">
                  <TrendingUp className="w-3.5 h-3.5" /> Trending Intel
                </span>
              ) : category ? (
                <span className="px-3 py-1.5 bg-[var(--surface)] text-[var(--cyan)] text-[10px] font-bold uppercase tracking-[0.14em] rounded border border-[var(--border)]">
                  {category}
                </span>
              ) : null}
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight tracking-tight">
              {trending ? "Most Read Reports" : category ? `${category} Intelligence` : "Strategic Reports"}
            </h1>
            <p className="text-base md:text-lg text-white/80 font-medium">
              Unvarnished analysis and strategic foresight.{" "}
              {blogs.length > 0 && (
                <span className="text-[var(--gold)] ml-2">
                  • {blogs.length} article{blogs.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search intelligence..."
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-sm pl-10 pr-4 py-2.5 text-sm text-white focus:border-[var(--border)] focus:bg-[var(--surface)]/80 outline-none transition-all placeholder:text-[var(--muted)]"
              />
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-12">
          <Link
            href="/blogs"
            className={`px-4 py-2 rounded-sm border text-[13px] font-bold uppercase tracking-[0.06em] transition-all duration-300 ${
              !category && !trending
                ? "border-[var(--accent)] bg-[var(--gold)]/10 text-[var(--gold)] "
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-white hover:bg-[var(--elevated)] hover:border-[var(--border)]/80"
            }`}
          >
            All Reports
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blogs?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-sm border text-[13px] font-bold uppercase tracking-[0.06em] transition-all duration-300 ${
                category === cat
                  ? "border-[var(--border)] bg-[var(--cyan)]/10 text-[var(--cyan)] "
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-white hover:bg-[var(--elevated)] hover:border-[var(--border)]/80"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* ─── BLOGS PAGE AD UNIT ─── */}
        <div className="mb-12">
          <BannerAd slot="auto" />
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-sm bg-[var(--surface)] border border-[var(--border)] bg-[var(--surface)]/10">
            <div className="w-16 h-16 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-6 shadow-sm">
              <Newspaper className="w-8 h-8 text-[var(--cyan)]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              {category ? `No ${category} reports yet` : "No reports published yet"}
            </h2>
            <p className="text-base text-white/70 max-w-md mb-8 leading-[1.6]">
              {category
                ? `Be the first to read when our analysts publish in the ${category} theatre.`
                : "Our editorial team is working on the first batch of reports. Check back soon for strategic intelligence briefs."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {category && (
                <Link
                  href="/blogs"
                  className="px-6 py-3 rounded-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-white hover:bg-[var(--elevated)] transition-all text-sm font-bold uppercase tracking-[0.06em]"
                >
                  View all reports
                </Link>
              )}
              <Link
                href="/auth/signup"
                className="px-6 py-3 rounded-sm bg-[var(--gold)] text-[var(--bg)] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-extrabold uppercase tracking-[0.06em] flex items-center gap-2"
              >
                Join Platform <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog._id.toString()} href={`/blogs/${blog.slug}`} className="group flex flex-col h-full bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[var(--accent)] bg-[var(--surface)]/20">
                <div className="relative aspect-[16/9] bg-[var(--surface)] overflow-hidden border-b border-[var(--border)]">
                  {blog.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 )] group-hover:scale-105 transition-transform duration-500" />
                  )}

                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
                    <span className="inline-block px-2.5 py-1 rounded bg-[var(--surface)]/90 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)] border border-[var(--border)]">
                      {blog.category}
                    </span>
                  </div>
                  {blog.visibility === "private" && (
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 px-3 py-1.5 bg-[var(--danger)]/90 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-white flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" /> Clearance: High
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5 md:p-6 lg:p-7">
                  <h3 className="font-heading font-bold text-white text-lg md:text-xl leading-[1.3] mb-3 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/75 leading-[1.6] line-clamp-3 flex-1 mb-5 md:mb-6">
                    {blog.excerpt}
                  </p>

                  <div className="mt-auto pt-4 md:pt-5 border-t border-[var(--border)]/50 flex items-center justify-between text-[9px] md:text-[10px] text-[var(--secondary)] uppercase tracking-[0.14em] font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--cyan)]">
                        {(blog.isSystemGenerated ? "G" : ((blog.author as any)?.name || "G"))[0]}
                      </div>
                      <span className="text-white/80">
                        {blog.isSystemGenerated ? "Global Chanakya" : (blog.author as any)?.name?.split(" ")[0] || "Global Chanakya"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-white/60">
                        <Eye className="w-3.5 h-3.5" />
                        {formatViews(blog.analytics?.views || 0)}
                      </span>
                      <span className="text-white/60">
                        {formatDate(blog.publishAt, "short")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
