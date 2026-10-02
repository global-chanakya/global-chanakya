import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export const revalidate = 3600;

import BlogActions from "@/components/blogs/BlogActions";
import ReadingProgress from "@/components/blogs/ReadingProgress";
import BlogClientTracker from "@/components/blogs/BlogClientTracker";
import { generateSeoMetadata, calculateReadingTime, formatDate } from "@repo/utils";
import { formatViews } from "@/lib/formatViews";
import { ArrowLeft, Clock, Eye, Calendar, Tag, Crown, TrendingUp, Crosshair, Newspaper } from "lucide-react";
import { SITE_URL } from "@/constants";
import AdUnit, { InArticleAd, SidebarAd } from "@/components/ads/AdUnit";

import { generateArticleSchema, sanitizeOgImageUrl } from "@/lib/seo/generateBlogJsonLd";

// Global cache across requests
const getCachedBlog = unstable_cache(
  async (slug: string) => {
    await dbConnect();
    const blog = await Blog.findOne({ slug, contentType: { $ne: "platform-seo" } })
      .populate("author", "name authorSlug bio expertise socialLinks avatar")
      .populate("categoryId", "name slug")
      .populate("topics", "name slug")
      .populate("countries", "name slug")
      .populate("regions", "name slug")
      .populate("leaders", "name slug")
      .populate("conflicts", "name slug")
      .populate("organizations", "name slug")
      .lean();
    return blog ? JSON.parse(JSON.stringify(blog)) : null;
  },
  ["blog-detail-cache"],
  { revalidate: 3600, tags: ["blogs"] }
);

const getCachedRelatedBlogs = unstable_cache(
  async (blog: any) => {
    await dbConnect();
    const { RelatedArticleService } = await import("@/modules/seo/services/related-article.service");
    const related = await RelatedArticleService.getHighlyRelevantArticles(blog, 6);
    return JSON.parse(JSON.stringify(related));
  },
  ["related-blogs-cache-v2"],
  { revalidate: 3600, tags: ["blogs"] }
);

const getCachedAdjacentBlogs = unstable_cache(
  async (blog: any) => {
    await dbConnect();
    // Use publishAt or createdAt for chronological sorting
    const dateQuery = blog.publishAt || blog.createdAt;
    
    // Find the next older article in the same category
    const prev = await Blog.findOne({
      status: "published",
      category: blog.category,
      $or: [
        { publishAt: { $lt: dateQuery } },
        { publishAt: dateQuery, _id: { $lt: blog._id } }
      ]
    }).sort({ publishAt: -1, _id: -1 }).select("slug title category").lean();

    // Find the next newer article in the same category
    const next = await Blog.findOne({
      status: "published",
      category: blog.category,
      $or: [
        { publishAt: { $gt: dateQuery } },
        { publishAt: dateQuery, _id: { $gt: blog._id } }
      ]
    }).sort({ publishAt: 1, _id: 1 }).select("slug title category").lean();

    return {
      prev: prev ? JSON.parse(JSON.stringify(prev)) : null,
      next: next ? JSON.parse(JSON.stringify(next)) : null
    };
  },
  ["adjacent-blogs-cache-v1"],
  { revalidate: 3600, tags: ["blogs"] }
);

// Request-level cache deduplication
const getBlogData = cache(async (slug: string) => {
  return await getCachedBlog(slug);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const blog = await getBlogData(decodedSlug);
  
  if (!blog) return { title: "Not Found" };
  return generateSeoMetadata({
    title: blog.seo?.title || blog.title,
    description: blog.seo?.description || blog.excerpt,
    keywords: blog.seo?.keywords?.join?.(", ") || blog.tags?.join(", "),
    canonicalUrl: blog.seo?.canonicalUrl || `${SITE_URL}/blogs/${blog.slug}`,
    imageUrl: sanitizeOgImageUrl(blog.ogImage || blog.featuredImage),
    type: "article",
    authorName: blog.isSystemGenerated ? "Global Chanakya Editorial" : blog.author?.name || "Global Chanakya Editorial",
    publishedTime: blog.publishAt ? new Date(blog.publishAt).toISOString() : undefined,
    modifiedTime: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
    robots: blog.seo?.robots,
    category: blog.category,
  });
}

function sanitizeBlogContent(html: string): string {
  let clean = html || "";
  
  // Handle double-escaped HTML tags
  if (clean.includes("&lt;")) {
    clean = clean
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");
  return clean;
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const blog = await getBlogData(decodedSlug);
  if (!blog) notFound();

  // Defer auth check until after blog is loaded from cache
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  
  // Security check: if not published and not admin, return 404
  if (blog.status !== "published" && !isAdmin) {
    notFound();
  }

  // Get related blogs from cache
  const relatedBlogs = await getCachedRelatedBlogs(blog);
  
  // Get adjacent blogs for chronological crawl paths
  const adjacentBlogs = await getCachedAdjacentBlogs(blog);

  const readTime = Math.max(1, calculateReadingTime(blog.content.replace(/<[^>]*>/g, "")));
  const publishDate = formatDate(blog.publishAt, "long");

  let sanitizedContent = sanitizeBlogContent(blog.content);

  let tocIndex = 0;
  const toc: { id: string, level: string, text: string }[] = [];
  sanitizedContent = sanitizedContent.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    const id = `toc-${tocIndex++}`;
    const cleanText = text.replace(/<[^>]+>/g, '');
    toc.push({ id, level, text: cleanText });
    return `<h${level} id="${id}"${attrs} style="scroll-margin-top: 100px;">${text}</h${level}>`;
  });

  if (relatedBlogs.length > 0) {
    let pCount = 0;
    sanitizedContent = sanitizedContent.replace(/<\/p>/gi, (match) => {
      pCount++;
      if (pCount === 2 || (pCount === 6 && relatedBlogs.length > 1)) {
        const relatedLink = pCount === 2 ? relatedBlogs[0] : relatedBlogs[1];
        return `${match}
          <div className="my-8 p-5 bg-[var(--navy-surface)] rounded-md border-l-4 border-[var(--gold)] transition-colors w-full relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] mb-1.5 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8l-4 4v16a2 2 0 0 0 2 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Related Intelligence
              </div>
              <a href="/blogs/${relatedLink.slug}" className="text-[16px] md:text-[18px] font-heading font-bold text-[var(--white)] hover:text-[var(--gold-light)] !border-none inline-block">
                ${relatedLink.title}
              </a>
            </div>
          </div>
        `;
      }
      return match;
    });
  }

  const jsonLd = generateArticleSchema(blog);

  return (
    <div className="min-h-screen bg-[var(--navy-deep)] text-[var(--text-on-dark)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogClientTracker 
        title={blog.title} 
        category={blog.category} 
        author={blog.isSystemGenerated ? "Global Chanakya Editorial" : blog.author?.name || "Global Chanakya Editorial"} 
        slug={blog.slug}
        isLoggedIn={!!session}
      />
      <ReadingProgress />

      {/* Hero Header */}
      <header className="relative pt-32 pb-12 border-b border-[var(--border-dark)] strategic-grid bg-[var(--navy-surface)]">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-[var(--slate-200)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--white)] transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Intel Desk
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-sm intel-border bg-[var(--navy-deep)] text-[var(--gold)] text-[11px] font-bold uppercase tracking-widest">
              {blog.category}
            </span>
            {blog.isTrending && (
              <span className="px-3 py-1.5 rounded-sm bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Trending Report
              </span>
            )}
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--white)] mb-6 max-w-4xl">
            {blog.title}
          </h1>

          <p className="text-[18px] md:text-[20px] leading-[1.8] text-[var(--slate-100)] max-w-3xl border-l-2 border-[var(--gold)] pl-5 font-medium">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-[var(--border-dark)] text-[12px] font-bold uppercase tracking-widest text-[var(--slate-200)]">
            <div className="flex items-center gap-3">
              <Link href={`/author/${blog.author?.authorSlug || 'global-chanakya-editorial'}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-sm bg-[var(--navy-deep)] intel-border flex items-center justify-center text-[14px] text-white group-hover:border-[var(--gold)] transition-colors overflow-hidden">
                  {blog.author?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={blog.author.avatar} alt={blog.author?.name || "Global Chanakya Editorial"} className="w-full h-full object-cover" />
                  ) : (
                    (blog.isSystemGenerated ? "G" : (blog.author?.name || "G"))[0].toUpperCase()
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[var(--white)] group-hover:text-[var(--gold)] transition-colors">{blog.isSystemGenerated ? "Global Chanakya Editorial" : blog.author?.name || "Global Chanakya Editorial"}</span>
                  <span className="text-[10px] text-[var(--gold)]">{blog.author?.role === 'editor' ? 'Lead Analyst / Editor' : 'Lead Analyst'}</span>
                </div>
              </Link>
            </div>
            <div className="w-px h-8 bg-[var(--border-dark)] hidden sm:block"></div>
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--slate-200)]" /> {publishDate}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--slate-200)]" /> {readTime} min read</span>
            <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-[var(--slate-200)]" /> <span className="blog-view-count">{formatViews(blog.analytics?.views || 0)}</span> views</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Main Content */}
          <article className="xl:col-span-8 w-full max-w-4xl mx-auto xl:mx-0">
            {blog.featuredImage && (
              <div className="mb-12 aspect-video w-full rounded-sm overflow-hidden intel-border relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image src={blog.featuredImage} alt={blog.seo?.title || blog.title || "Global Chanakya"} width={1200} height={675} priority={true} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Ad: After featured image */}
            <InArticleAd slot="auto" />

            <div className="bg-[var(--navy-surface)] border border-[var(--border-dark)] rounded-sm p-6 md:p-10 text-[var(--white)] shadow-sm mb-12">
              <div 
                className="article-body" 
                dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
              />
            </div>

            {/* Citations */}
            {blog.citations && blog.citations.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[var(--border-dark)]">
                <h3 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">Sources & References</h3>
                <ul className="space-y-3">
                  {blog.citations.map((citation: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-[15px] leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-2 shrink-0" />
                      <div>
                        {citation.url ? (
                          <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline font-medium break-all">
                            {citation.source}
                          </a>
                        ) : (
                          <span className="text-[var(--white)] font-medium">{citation.source}</span>
                        )}
                        {citation.type && <span className="text-[var(--slate-200)] ml-2 text-xs uppercase tracking-wider">[{citation.type}]</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ad: After article content */}
            <InArticleAd slot="auto" />

            {/* Entity Hub Links */}
            {(blog.topics?.length > 0 || blog.countries?.length > 0 || blog.regions?.length > 0 || blog.leaders?.length > 0 || blog.conflicts?.length > 0) && (
              <div className="mt-16 pt-8 border-t border-[var(--border-dark)] flex flex-wrap gap-3">
                <div className="w-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--slate-200)] mb-2">
                  <Tag className="w-3.5 h-3.5" /> Related Analysis Hubs
                </div>
                {blog.topics?.map((entity: any) => (
                  <Link key={entity._id || entity.slug} href={`/topics/${entity.slug}`} className="px-4 py-2 rounded-sm border border-[var(--border-dark)] bg-[var(--navy-deep)] text-[var(--slate-200)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    {entity.name} (Topic)
                  </Link>
                ))}
                {blog.countries?.map((entity: any) => (
                  <Link key={entity._id || entity.slug} href={`/countries/${entity.slug}`} className="px-4 py-2 rounded-sm border border-[var(--border-dark)] bg-[var(--navy-deep)] text-[var(--slate-200)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    {entity.name} (Country)
                  </Link>
                ))}
                {blog.regions?.map((entity: any) => (
                  <Link key={entity._id || entity.slug} href={`/regions/${entity.slug}`} className="px-4 py-2 rounded-sm border border-[var(--border-dark)] bg-[var(--navy-deep)] text-[var(--slate-200)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    {entity.name} (Region)
                  </Link>
                ))}
                {blog.leaders?.map((entity: any) => (
                  <Link key={entity._id || entity.slug} href={`/leaders/${entity.slug}`} className="px-4 py-2 rounded-sm border border-[var(--border-dark)] bg-[var(--navy-deep)] text-[var(--slate-200)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    {entity.name} (Leader)
                  </Link>
                ))}
                {blog.conflicts?.map((entity: any) => (
                  <Link key={entity._id || entity.slug} href={`/conflicts/${entity.slug}`} className="px-4 py-2 rounded-sm border border-[var(--border-dark)] bg-[var(--navy-deep)] text-[var(--slate-200)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    {entity.name} (Conflict)
                  </Link>
                ))}
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-[var(--border-dark)] flex flex-wrap gap-3">
                <div className="w-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--slate-200)] mb-2">
                  <Tag className="w-3.5 h-3.5" /> Tracked Tags
                </div>
                {blog.tags.map((tag: string) => (
                  <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`} className="px-4 py-2 rounded-sm border border-[var(--border-dark)] bg-[var(--navy-deep)] text-[var(--slate-200)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            
            <BlogActions
              slug={blog.slug}
              initialLikes={blog.analytics?.likes || 0}
              initialBookmarks={blog.analytics?.bookmarks || 0}
              isLoggedIn={!!session}
              commentsEnabled={blog.commentsEnabled !== false}
            />

            {/* Chronological Discovery / Prev & Next */}
            {(adjacentBlogs.prev || adjacentBlogs.next) && (
              <div className="mt-12 pt-8 border-t border-[var(--border-dark)] flex flex-col sm:flex-row justify-between gap-4">
                {adjacentBlogs.prev ? (
                  <Link href={`/blogs/${adjacentBlogs.prev.slug}`} className="flex-1 bg-[var(--navy-surface)] p-5 rounded-sm border border-[var(--border-dark)] hover:border-[var(--gold)] group flex flex-col items-start text-left transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--slate-200)] mb-2 flex items-center gap-1.5">
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous in {blog.category}
                    </span>
                    <span className="font-heading text-[15px] font-bold text-[var(--white)] group-hover:text-[var(--gold)] transition-colors line-clamp-2 leading-snug">
                      {adjacentBlogs.prev.title}
                    </span>
                  </Link>
                ) : <div className="flex-1" />}
                
                {adjacentBlogs.next ? (
                  <Link href={`/blogs/${adjacentBlogs.next.slug}`} className="flex-1 bg-[var(--navy-surface)] p-5 rounded-sm border border-[var(--border-dark)] hover:border-[var(--gold)] group flex flex-col items-end text-right transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--slate-200)] mb-2 flex items-center gap-1.5">
                      Next in {blog.category} <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </span>
                    <span className="font-heading text-[15px] font-bold text-[var(--white)] group-hover:text-[var(--gold)] transition-colors line-clamp-2 leading-snug">
                      {adjacentBlogs.next.title}
                    </span>
                  </Link>
                ) : <div className="flex-1" />}
              </div>
            )}

            {/* Bottom Suggestions / Related Blogs */}
            {relatedBlogs.length > 0 && (
              <div className="mt-16 pt-12 border-t border-[var(--border-dark)]">
                <h3 className="font-heading text-[18px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-8">
                  <Newspaper className="w-5 h-5 text-[var(--gold)]" /> Suggested Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBlogs.map((rb: any) => (
                    <Link key={rb._id} href={`/blogs/${rb.slug}`} className="bg-[var(--navy-surface)] p-5 rounded-sm hover:-translate-y-1 transition-transform group flex flex-col gap-3 border border-[var(--border-dark)] hover:border-[var(--gold)]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">{rb.category}</span>
                      <h4 className="font-heading text-[16px] font-bold text-white leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                        {rb.title}
                      </h4>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--slate-200)] flex items-center gap-2 mt-auto pt-2">
                        <Clock className="w-3.5 h-3.5" /> {formatDate(rb.publishAt, "short")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="xl:col-span-4 sticky top-32 max-h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar flex-col gap-8 hidden xl:flex pb-8 pr-4">
            {/* TOC */}
            {toc.length > 0 && (
              <div className="bg-[var(--navy-surface)] border border-[var(--border-dark)] rounded-sm p-6 shrink-0">
                <h3 className="font-heading text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border-dark)] pb-4">
                  <Crosshair className="w-4 h-4 text-[var(--gold)]" /> Executive Summary
                </h3>
                <nav className="flex flex-col gap-3">
                  {toc.map((item) => (
                    <a 
                      key={item.id} 
                      href={`#${item.id}`} 
                      className={`text-[13px] leading-[1.6] font-medium transition-colors hover:text-[var(--gold)] ${item.level === "3" ? "ml-4 text-[var(--slate-200)]" : "text-[var(--slate-100)]"}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Reports */}
            {relatedBlogs.length > 0 && (
              <div className="bg-[var(--navy-surface)] border border-[var(--border-dark)] rounded-sm p-6 shrink-0">
                <h3 className="font-heading text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border-dark)] pb-4">
                  <Newspaper className="w-4 h-4 text-[var(--gold)]" /> Related Intelligence
                </h3>
                <div className="flex flex-col gap-5">
                  {relatedBlogs.map((rb: any) => (
                    <Link key={rb._id} href={`/blogs/${rb.slug}`} className="group flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">{rb.category}</span>
                      <h4 className="font-heading text-[14px] font-bold text-[var(--white)] leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                        {rb.title}
                      </h4>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--slate-200)] flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {formatDate(rb.publishAt, "short")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ad: Sidebar ad unit */}
            <SidebarAd slot="auto" />
          </aside>

        </div>
      </div>

      <style>{`
        .article-body {
          font-size: 18px;
          line-height: 1.85;
          color: var(--slate-100);
          font-family: var(--font-inter), sans-serif;
        }
        .article-body p { margin-bottom: 1.6em; color: var(--slate-100); }
        .article-body h2 { 
          font-family: var(--font-heading), sans-serif;
          font-size: 1.8em; 
          font-weight: 800; 
          color: var(--white) !important; 
          margin-top: 2em; 
          margin-bottom: 1em; 
          border-bottom: 1px solid var(--border-dark); 
          padding-bottom: 0.5em; 
        }
        .article-body h3 { font-family: var(--font-heading), sans-serif; font-size: 1.4em; font-weight: 700; color: var(--white) !important; margin-top: 1.8em; margin-bottom: 0.8em; }
        .article-body a { color: var(--gold) !important; text-decoration: none; border-bottom: 1px solid var(--gold); transition: all 0.2s; }
        .article-body a:hover { opacity: 0.8; }
        .article-body blockquote {
          margin: 2em 0;
          padding: 24px;
          border-left: 3px solid var(--gold);
          background: var(--navy-deep) !important;
          color: var(--slate-200) !important;
          font-style: italic;
          font-size: 1.1em;
          border-radius: 0 4px 4px 0;
        }
        .article-body blockquote p { color: var(--slate-200) !important; margin: 0; }
        .article-body ul, .article-body ol { margin: 1.5em 0; padding-left: 2em; }
        .article-body li { margin-bottom: 0.5em; }
        .article-body ul li::marker { color: var(--gold); }
        .article-body img { width: 100%; border-radius: 4px; margin: 2em 0; border: 1px solid var(--border-dark); }
        .article-body pre { background: var(--navy-deep) !important; padding: 20px; border-radius: 4px; border: 1px solid var(--border-dark); overflow-x: auto; }
        .article-body code { font-family: monospace; color: var(--gold) !important; }
      `}</style>
    </div>
  );
}
