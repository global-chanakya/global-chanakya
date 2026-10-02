import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/mongoose";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";
import { ArrowLeft, Clock, Eye, AlertTriangle, ArrowRight, Activity, Crosshair } from "lucide-react";
import { SITE_URL } from "@/constants";
import { SourcePanel } from "@/components/intelligence/SourcePanel";
import { EntityChip } from "@/components/intelligence/EntityChip";
import { findLiveSemanticMatches } from "@/lib/ai/vectorSearch";
import { cache } from "react";

export const revalidate = 300; // Cache for 5 minutes

const getIntelligenceEvent = cache(async (slug: string) => {
  await dbConnect();
  const event = await IntelligenceEvent.findOne({ slug, status: "published", enrichmentStatus: "COMPLETED" })
    .populate("countries", "name slug")
    .populate("leaders", "name slug")
    .populate("conflicts", "name slug")
    .populate("organizations", "name slug")
    .lean();
  
  if (!event) return null;
  return JSON.parse(JSON.stringify(event));
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const event = await getIntelligenceEvent(decodedSlug);
  
  if (!event) return { title: "Classified Document" };
  
  return {
    title: `${event.title} | Global Chanakya Intelligence`,
    description: event.whyItMatters || event.summary,
    alternates: {
      canonical: `${SITE_URL}/intelligence/${event.slug}`,
    },
    openGraph: {
      title: event.title,
      description: event.whyItMatters || event.summary,
      url: `${SITE_URL}/intelligence/${event.slug}`,
      type: "article",
      publishedTime: new Date(event.publishedAt).toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.whyItMatters || event.summary,
    }
  };
}

const impactColors: Record<string, string> = {
  CRITICAL: "text-[var(--danger)] border-[var(--danger)] bg-[var(--danger)]/10",
  HIGH: "text-orange-400 border-orange-400/50 bg-orange-400/10",
  MEDIUM: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  LOW: "text-green-400 border-green-400/50 bg-green-400/10",
  NEUTRAL: "text-[var(--muted)] border-[var(--border)] bg-[var(--surface)]",
};

const riskColors: Record<string, string> = {
  SEVERE: "text-[var(--danger)] border-[var(--danger)] bg-[var(--danger)]/10",
  HIGH: "text-orange-400 border-orange-400/50 bg-orange-400/10",
  MODERATE: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  LOW: "text-green-400 border-green-400/50 bg-green-400/10",
};

export default async function IntelligenceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const event = await getIntelligenceEvent(decodedSlug);
  if (!event) notFound();

  // Find related intelligence via vector search
  let relatedIntelligence: any[] = [];
  if (event.embedding && event.embedding.length === 384) {
     try {
       const rawMatches = await findLiveSemanticMatches(event.embedding, 4, 0.7);
       relatedIntelligence = rawMatches.filter(m => m.blogId !== event.slug).slice(0, 3);
     } catch (e) {
       console.warn("Failed to fetch related intelligence", e);
     }
  }

  // Combine all entities for display
  const allEntities = [
    ...(event.countries || []).map((e: any) => ({ ...e, type: "Country" as const })),
    ...(event.leaders || []).map((e: any) => ({ ...e, type: "Leader" as const })),
    ...(event.conflicts || []).map((e: any) => ({ ...e, type: "Conflict" as const })),
    ...(event.organizations || []).map((e: any) => ({ ...e, type: "Organization" as const })),
  ];

  // Map sources to IntelligenceSource interface
  const sources = event.sourceNames?.map((name: string, idx: number) => ({
    name,
    url: event.sourceUrls?.[idx],
    publishedTime: event.publishedAt,
    retrievedTime: event.discoveredAt,
    type: "Media" as const
  })) || [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Command Center Header */}
      <header className="relative pt-32 pb-12 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="absolute inset-0 pointer-events-none" />
        <div className="container mx-auto max-w-5xl px-6 md:px-8 relative z-10">
          <Link href="/live" className="inline-flex items-center gap-2 text-[var(--secondary)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--cyan)] transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Live Feed
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[11px] font-bold uppercase tracking-[0.15em] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]"></span> Live Intelligence
            </span>
            <span className="px-3 py-1.5 rounded-sm intel-border bg-[var(--bg)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-widest">
              {event.region || "Global"}
            </span>
            <span className="px-3 py-1.5 rounded-sm intel-border bg-[var(--bg)] text-white/50 text-[11px] font-bold uppercase tracking-widest">
              {event.category || "General"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] text-white mb-6">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-[var(--border)] text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--secondary)]" />
              Published: {new Date(event.publishedAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[var(--secondary)]" />
              Importance: {event.importance || 50}/100
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <article className="lg:col-span-8 flex flex-col gap-8">
             {/* AI Enriched Executive Summary */}
             <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)] bg-[var(--cyan)]/5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--cyan)] mb-4 flex items-center gap-2">
                   <Activity className="w-4 h-4" /> Executive Summary
                </h3>
                <p className="text-[16px] text-white/90 leading-[1.8] font-medium">
                   {event.summary}
                </p>
             </div>

             {/* Why It Matters */}
             <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--accent)] bg-[var(--gold)]/5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--gold)] mb-4 flex items-center gap-2">
                   <Crosshair className="w-4 h-4" /> Why It Matters
                </h3>
                <p className="text-[15px] text-white/80 leading-[1.7]">
                   {event.whyItMatters || "No strategic analysis available for this event."}
                </p>
             </div>

             {/* Strategic Significance */}
             {event.strategicSignificance && (
               <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)] bg-[var(--surface)]/50">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                     Strategic Significance
                  </h3>
                  <p className="text-[15px] text-white/80 leading-[1.7]">
                     {event.strategicSignificance}
                  </p>
               </div>
             )}

             {/* Impact & Risk Indicators */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-sm border ${impactColors[event.indiaImpact || "NEUTRAL"] || impactColors.NEUTRAL}`}>
                   <div className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80 mb-2">India Impact</div>
                   <div className="font-extrabold text-lg">{event.indiaImpact || "NEUTRAL"}</div>
                </div>
                <div className={`p-5 rounded-sm border ${riskColors[event.riskLevel || "LOW"] || riskColors.LOW}`}>
                   <div className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80 mb-2">Regional Risk</div>
                   <div className="font-extrabold text-lg">{event.riskLevel || "LOW"}</div>
                </div>
             </div>

             {/* Source Attribution */}
             <SourcePanel 
               sources={sources} 
               confidence={event.confidence || "MODERATE"} 
               methodology="Real-time AI enriched extraction" 
             />
          </article>

          <aside className="lg:col-span-4 flex flex-col gap-8">
             {/* Entities */}
             {allEntities.length > 0 && (
               <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)] bg-[var(--surface)]/30">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--muted)] mb-4 border-b border-[var(--border)] pb-3">
                     Tracked Entities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {allEntities.map(entity => (
                       <EntityChip key={entity._id} entity={{ id: entity._id, name: entity.name, type: entity.type, slug: entity.slug }} />
                     ))}
                  </div>
               </div>
             )}

             {/* Ask Chanakya CTA */}
             <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--accent)] bg-[var(--gold)]/10 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-white leading-snug">Assess this event with Ask Chanakya</h3>
                <p className="text-[13px] text-white/70 leading-relaxed">
                   Query our AI intelligence core to understand specific implications for your strategic interests.
                </p>
                <Link href="/intelligence/ask" className="w-full py-3 bg-[var(--gold)] text-[var(--bg)] font-extrabold uppercase tracking-widest rounded-sm hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 text-[11px]">
                   Ask Chanakya <ArrowRight className="w-4 h-4" />
                </Link>
             </div>

             {/* Related Intelligence */}
             {relatedIntelligence.length > 0 && (
               <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)] bg-[var(--surface)]/30">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--cyan)] mb-4 border-b border-[var(--border)] pb-3 flex items-center gap-2">
                     <AlertTriangle className="w-3.5 h-3.5" /> Related Intelligence
                  </h3>
                  <div className="flex flex-col gap-5">
                     {relatedIntelligence.map((match: any, i: number) => (
                       <Link key={i} href={`/intelligence/${match.blogId}`} className="group flex flex-col gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">{new Date().toLocaleDateString()}</span>
                          <h4 className="text-[13px] font-bold text-white/90 leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-3">
                             {match.title}
                          </h4>
                       </Link>
                     ))}
                  </div>
               </div>
             )}
          </aside>
          
        </div>
      </div>
    </div>
  );
}
