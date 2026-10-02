import Link from "next/link";
import { Search, ChevronRight, Hash, FileText } from "lucide-react";
import { Metadata } from "next";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";

export const revalidate = 300; // revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Strategic Intelligence Hub | Global Chanakya — Geopolitical Analysis Platform",
  description: "Explore in-depth geopolitical intelligence, strategic conflict analysis, regional power shifts, global diplomacy, defense strategy, and real-time intelligence insights from Global Chanakya.",
  keywords: "geopolitical analysis, global conflict intelligence, strategic intelligence platform, india geopolitics, world politics analysis, defense intelligence, foreign policy insights, international relations",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://www.globalchanakya.in/platformseo",
  },
  openGraph: {
    title: "Strategic Intelligence Hub | Global Chanakya",
    description: "In-depth geopolitical intelligence, strategic conflict analysis, and real-time intelligence insights.",
    url: "https://www.globalchanakya.in/platformseo",
    siteName: "Global Chanakya",
    locale: "en_US",
    type: "website",
    images: [{
      url: "https://www.globalchanakya.in/og-image.png",
      width: 1200,
      height: 630,
      alt: "Global Chanakya Strategic Intelligence Hub",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Strategic Intelligence Hub | Global Chanakya",
    description: "Explore in-depth geopolitical intelligence and strategic analysis.",
    creator: "@globalchanakya",
    site: "@globalchanakya",
    images: ["https://www.globalchanakya.in/og-image.png"],
  },
};

interface PlatformSeoPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishAt: string;
  seo?: { keywords?: string[] };
}

async function getPlatformSeoBlogs(): Promise<PlatformSeoPost[]> {
  await dbConnect();
  const blogs = await Blog.find(
    { contentType: "platform-seo", status: "published" },
    { title: 1, slug: 1, excerpt: 1, category: 1, publishAt: 1, seo: 1 }
  )
    .sort({ publishAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(blogs));
}

export default async function PlatformSeoIndex() {
  const posts = await getPlatformSeoBlogs();
  const categories = Array.from(new Set(posts.map(b => b.category).filter(Boolean)));
  const popularPosts = posts.slice(0, 3);

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Strategic Intelligence <span className="text-[var(--gold)]">Hub</span>
            </h1>
            <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
              In-depth analysis of global power shifts, defense strategy, and international relations.
            </p>
          </div>
          <div className="bg-[var(--surface)] p-12 rounded-sm border border-[var(--border)] text-center">
            <FileText className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">No Platform Intelligence Published Yet</h2>
            <p className="text-sm text-[var(--muted)]">Strategic reports will appear here once they are published through the admin CMS.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Strategic Intelligence <span className="text-[var(--gold)]">Hub</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
            In-depth analysis of global power shifts, defense strategy, and international relations. Read our comprehensive reports below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <h2 className="text-2xl font-bold text-white border-b border-[var(--border)] pb-4">Latest Analysis</h2>
            
            <div className="flex flex-col gap-8">
              {posts.map((post) => (
                <article key={post._id} className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded bg-[var(--surface)] text-[10px] font-bold uppercase tracking-wider text-[var(--cyan)]">
                      {post.category}
                    </span>
                    <time className="text-xs font-semibold text-[var(--muted)]">
                      {new Date(post.publishAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </time>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 hover:text-[var(--gold)] transition-colors">
                    <Link href={`/platformseo/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-[var(--muted)] leading-[1.7] mb-5">
                    {post.excerpt}
                  </p>
                  
                  {post.seo?.keywords && post.seo.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.seo.keywords.slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link href={`/platformseo/${post.slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] hover:text-white transition-colors">
                    Read Full Report <ChevronRight className="w-3 h-3" />
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            
            {/* Search */}
            <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Search Hub</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input 
                  type="text" 
                  placeholder="Search intelligence reports..." 
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Focus Areas</h3>
                <ul className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <Link href={`/platformseo?category=${cat}`} className="flex items-center justify-between py-2 text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
                        <span>{cat}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Popular Posts */}
            {popularPosts.length > 0 && (
              <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Strategic Briefs</h3>
                <div className="flex flex-col gap-4">
                  {popularPosts.map((post) => (
                    <Link href={`/platformseo/${post.slug}`} key={post._id} className="group flex flex-col gap-1 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                      <h4 className="text-sm font-bold text-white leading-[1.4] group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--cyan)]">{post.category}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
