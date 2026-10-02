import dbConnect from "@/lib/mongoose";
import { Topic, ITopic } from "@/lib/models/Topic";
import Link from "next/link";
import { Folder, Hash, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strategic Topics | Global Chanakya Intelligence",
  description: "Explore our strategic topics and intelligence hubs covering geopolitics, defense, and geoeconomics.",
  openGraph: {
    title: "Strategic Topics | Global Chanakya Intelligence",
    description: "Explore our strategic topics and intelligence hubs covering geopolitics, defense, and geoeconomics.",
  },
};

// Next.js 15 requires dynamic APIs for search params if used, but we are just rendering static list
export const revalidate = 3600; // Cache for 1 hour

export default async function TopicsPage() {
  await dbConnect();

  // Fetch active topics
  const topicsData = await Topic.find({ status: "active" })
    .sort({ name: 1 })
    .lean();
  
  const topics = topicsData as unknown as Array<ITopic & { _id: string }>;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col pt-[80px]">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative py-16 md:py-24 border-b border-[var(--border-dark)] overflow-hidden">
        {/* Abstract Background Grid & Glow */}
        <div className="absolute inset-0 bg-[var(--navy-surface)] z-0" />
        <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--gold)]/10 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="container relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] md:text-xs font-bold uppercase tracking-[0.14em]">
                <Hash className="w-3.5 h-3.5" /> Intelligence Hubs
              </span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-[var(--white)] leading-[1.1] tracking-tight">
              Strategic Topics
            </h1>
            <p className="text-lg md:text-xl text-[var(--slate-200)] font-medium leading-[1.7] max-w-2xl">
              Navigate our curated intelligence dossiers. Explore targeted analysis organized by critical geopolitical themes, economic shifts, and defense domains.
            </p>
          </div>
        </div>
      </section>

      {/* ─── TOPICS GRID ─── */}
      <section className="flex-1 py-12 md:py-20 relative z-10">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          
          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--navy-surface)] rounded-sm border border-[var(--border-dark)]">
              <div className="w-16 h-16 rounded-sm bg-[var(--navy-surface)] border border-[var(--border-dark)] flex items-center justify-center mb-6 shadow-sm">
                <Search className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-[var(--white)] mb-3">
                No topics found
              </h2>
              <p className="text-base text-[var(--slate-200)] max-w-md mb-8 leading-[1.6]">
                Our intelligence analysts are actively updating the topic index. Please check back shortly.
              </p>
              <Link 
                href="/blogs"
                className="px-6 py-3 rounded-lg bg-[var(--navy-deep)] border border-[var(--border-dark)] text-[var(--white)] font-bold text-sm uppercase tracking-wider hover:border-[var(--gold)] transition-all"
              >
                Browse Latest Reports
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic._id.toString()}
                  href={`/topics/${topic.slug}`}
                  className="group flex flex-col h-full bg-[var(--navy-surface)] border border-[var(--border-dark)] rounded-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]"
                >
                  <div className="w-12 h-12 rounded-lg bg-[var(--navy-deep)] border border-[var(--border-dark)] flex items-center justify-center mb-5 group-hover:border-[var(--gold)] group-hover:bg-[var(--gold)]/5 transition-colors">
                    <Folder className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  
                  <h3 className="font-heading text-xl font-bold text-[var(--white)] mb-2 group-hover:text-[var(--gold)] transition-colors">
                    {topic.name}
                  </h3>
                  
                  {topic.description ? (
                    <p className="text-sm text-[var(--slate-200)] leading-[1.6] line-clamp-3 mb-4 flex-1">
                      {topic.description}
                    </p>
                  ) : (
                    <div className="flex-1 mb-4" />
                  )}
                  
                  <div className="flex items-center text-xs font-bold text-[var(--gold)] uppercase tracking-wider group-hover:text-[var(--white)] transition-colors">
                    Explore Topic <span className="ml-2">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
