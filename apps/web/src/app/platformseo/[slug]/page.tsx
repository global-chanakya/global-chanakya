import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Tag, ArrowLeft, Clock, Crosshair, Newspaper } from "lucide-react";
import ReactMarkdown from "react-markdown";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import ReadingProgress from "@/components/blogs/ReadingProgress";
import { calculateReadingTime, formatDate } from "@repo/utils";

export const revalidate = 300;

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function getPlatformSeoBlog(slug: string) {
  await dbConnect();
  const blog = await Blog.findOne(
    { slug, contentType: "platform-seo", status: "published" },
    { title: 1, slug: 1, excerpt: 1, content: 1, markdown: 1, category: 1, publishAt: 1, seo: 1, featuredImage: 1 }
  ).lean();
  return blog ? JSON.parse(JSON.stringify(blog)) : null;
}

async function getRelatedPosts(category: string, excludeSlug: string) {
  await dbConnect();
  const posts = await Blog.find(
    { contentType: "platform-seo", status: "published", category, slug: { $ne: excludeSlug } },
    { title: 1, slug: 1, category: 1, publishAt: 1 }
  )
    .sort({ publishAt: -1 })
    .limit(3)
    .lean();

  if (posts.length < 3) {
    const existingSlugs = [excludeSlug, ...posts.map(p => p.slug)];
    const filler = await Blog.find(
      { contentType: "platform-seo", status: "published", slug: { $nin: existingSlugs } },
      { title: 1, slug: 1, category: 1, publishAt: 1 }
    )
      .sort({ publishAt: -1 })
      .limit(3 - posts.length)
      .lean();
    posts.push(...filler);
  }

  return JSON.parse(JSON.stringify(posts));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getPlatformSeoBlog(resolvedParams.slug);

  if (!blog) {
    return { title: "Not Found | Global Chanakya" };
  }

  const canonicalUrl = `https://www.globalchanakya.in/platformseo/${blog.slug}`;

  return {
    title: `${blog.title} | Global Chanakya Strategic Intelligence`,
    description: blog.excerpt,
    keywords: blog.seo?.keywords?.join(", ") || "",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: canonicalUrl,
      siteName: "Global Chanakya",
      locale: "en_US",
      type: "article",
      publishedTime: new Date(blog.publishAt).toISOString(),
      authors: ["Global Chanakya Intelligence"],
      images: [{
        url: blog.featuredImage || "https://www.globalchanakya.in/og-image.png",
        width: 1200,
        height: 630,
        alt: blog.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      creator: "@globalchanakya",
      site: "@globalchanakya",
      images: [blog.featuredImage || "https://www.globalchanakya.in/og-image.png"],
    },
  };
}

export default async function PlatformSeoArticle({ params }: Props) {
  const resolvedParams = await params;
  const blog = await getPlatformSeoBlog(resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(blog.category, blog.slug);
  const articleContent = blog.markdown || blog.content || "";

  // Extract TOC
  const toc: { id: string, level: string, text: string }[] = [];
  const lines = articleContent.split('\n');
  let currentTocIndex = 0;
  for (const line of lines) {
    const m = line.match(/^(##|###)\s+(.+)$/);
    if (m) {
      toc.push({ id: `toc-${currentTocIndex++}`, level: m[1] === '##' ? '2' : '3', text: m[2] });
    }
  }

  let renderTocIndex = 0;
  const MarkdownComponents = {
    h2: ({ node, ...props }: any) => {
      const id = `toc-${renderTocIndex++}`;
      return <h2 id={id} style={{ scrollMarginTop: "100px" }} {...props} />;
    },
    h3: ({ node, ...props }: any) => {
      const id = `toc-${renderTocIndex++}`;
      return <h3 id={id} style={{ scrollMarginTop: "100px" }} {...props} />;
    }
  };

  const readTime = Math.max(1, calculateReadingTime(articleContent.replace(/<[^>]*>/g, "")));
  const publishDate = formatDate(blog.publishAt, "long");

  // Construct JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt,
        "datePublished": blog.publishAt,
        "author": {
          "@type": "Organization",
          "name": "Global Chanakya Intelligence"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Global Chanakya",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.globalchanakya.in/icon.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.globalchanakya.in/platformseo/${blog.slug}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.globalchanakya.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Platform SEO",
            "item": "https://www.globalchanakya.in/platformseo"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": blog.title,
            "item": `https://www.globalchanakya.in/platformseo/${blog.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ReadingProgress />

      {/* Hero Header matching standard blogs */}
      <header className="relative pt-32 pb-12 border-b border-[var(--border)] strategic-grid bg-[var(--surface)]">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <Link href="/platformseo" className="inline-flex items-center gap-2 text-[var(--secondary)] text-[12px] font-bold uppercase tracking-widest hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Intelligence Hub
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-widest">
              {blog.category}
            </span>
            <span className="px-3 py-1.5 rounded-sm bg-[var(--gold)]/10 border border-[var(--accent)] text-[var(--gold)] text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              Platform Intelligence
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-[-0.02em] text-white mb-6 max-w-4xl">
            {blog.title}
          </h1>

          <p className="text-[18px] md:text-[20px] leading-[1.8] text-[var(--secondary)] max-w-3xl border-l-2 border-[var(--gold)] pl-5 font-medium">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-[var(--border)] text-[12px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] intel-border flex items-center justify-center text-[14px] text-white">
                GC
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white">Global Chanakya Intelligence</span>
                <span className="text-[10px] text-[var(--gold)]">Platform SEO Core</span>
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--border)] hidden sm:block"></div>
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--secondary)]" /> {publishDate}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--secondary)]" /> {readTime} min read</span>
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
                <img fetchPriority="high" src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="article-body">
              <ReactMarkdown components={MarkdownComponents}>
                {articleContent}
              </ReactMarkdown>
            </div>

            {/* Tags / Keywords */}
            {blog.seo?.keywords && blog.seo.keywords.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
                <div className="w-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--secondary)] mb-2">
                  <Tag className="w-3.5 h-3.5" /> Keywords
                </div>
                {blog.seo.keywords.map((kw: string) => (
                  <span key={kw} className="px-4 py-2 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Suggestions */}
            {relatedPosts.length > 0 && (
              <div className="mt-16 pt-12 border-t border-[var(--border)]">
                <h3 className="text-[18px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-8">
                  <Newspaper className="w-5 h-5 text-[var(--cyan)]" /> Related Platform Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((rp: any) => (
                    <Link key={rp._id} href={`/platformseo/${rp.slug}`} className="bg-[var(--surface)] p-5 rounded-sm hover:-translate-y-1 transition-transform group flex flex-col gap-3 border border-[var(--border)] hover:border-[var(--accent)]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)]">{rp.category}</span>
                      <h4 className="text-[16px] font-bold text-white leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-3">
                        {rp.title}
                      </h4>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2 mt-auto pt-2">
                        <Clock className="w-3.5 h-3.5" /> {formatDate(rp.publishAt, "short")}
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
              <div className="bg-[var(--surface)] rounded-sm p-6 shrink-0">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                  <Crosshair className="w-4 h-4 text-[var(--gold)]" /> Contents
                </h3>
                <nav className="flex flex-col gap-3">
                  {toc.map((item) => (
                    <a 
                      key={item.id} 
                      href={`#${item.id}`} 
                      className={`text-[13px] leading-[1.6] font-medium transition-colors hover:text-[var(--gold)] ${item.level === "3" ? "ml-4 text-[var(--muted)]" : "text-[var(--secondary)]"}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Reports */}
            {relatedPosts.length > 0 && (
              <div className="bg-[var(--surface)] rounded-sm p-6 shrink-0">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                  <Newspaper className="w-4 h-4 text-[var(--cyan)]" /> Explore More
                </h3>
                <div className="flex flex-col gap-5">
                  {relatedPosts.map((rp: any) => (
                    <Link key={rp._id} href={`/platformseo/${rp.slug}`} className="group flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)]">{rp.category}</span>
                      <h4 className="text-[14px] font-bold text-white leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                        {rp.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </div>

      <style>{`
        .article-body {
          font-size: 18px;
          line-height: 1.85;
          color: var(--secondary);
          font-family: var(--font-inter), sans-serif;
        }
        .article-body p { margin-bottom: 1.6em; color: var(--text); }
        .article-body h2 { 
          font-size: 1.8em; 
          font-weight: 800; 
          color: white !important; 
          margin-top: 2em; 
          margin-bottom: 1em; 
          border-bottom: 1px solid var(--border); 
          padding-bottom: 0.5em; 
        }
        .article-body h3 { font-size: 1.4em; font-weight: 700; color: white !important; margin-top: 1.8em; margin-bottom: 0.8em; }
        .article-body a { color: var(--gold) !important; text-decoration: none; border-bottom: 1px solid var(--gold); transition: all 0.2s; }
        .article-body a:hover { opacity: 0.8; }
        .article-body blockquote {
          margin: 2em 0;
          padding: 24px;
          border-left: 3px solid var(--gold);
          background: var(--surface) !important;
          color: var(--secondary) !important;
          font-style: italic;
          font-size: 1.1em;
          border-radius: 0 4px 4px 0;
        }
        .article-body blockquote p { color: var(--secondary) !important; margin: 0; }
        .article-body ul, .article-body ol { margin: 1.5em 0; padding-left: 2em; }
        .article-body li { margin-bottom: 0.5em; }
        .article-body ul li::marker { color: var(--gold); }
        .article-body img { width: 100%; border-radius: 4px; margin: 2em 0; border: 1px solid var(--border); }
        .article-body pre { background: var(--surface) !important; padding: 20px; border-radius: 4px; border: 1px solid var(--border); overflow-x: auto; }
        .article-body code { font-family: monospace; color: var(--cyan) !important; }
        .article-body strong { color: white !important; font-weight: 700; }
        
        table { width: 100%; border-collapse: collapse; margin: 2em 0; }
        th, td { border: 1px solid var(--border); padding: 12px; text-align: left; }
        th { background: var(--surface); color: white; font-weight: bold; }
        tr:nth-child(even) { background: var(--surface); }
      `}</style>
    </div>
  );
}
