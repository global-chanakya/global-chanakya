import React from 'react';
import Link from 'next/link';
import { ArrowRight, Activity, Zap, Compass, TriangleAlert } from 'lucide-react';
import { IntelligenceHeader } from '@/components/intelligence/IntelligenceHeader';
import { IntelligenceCard } from '@/components/intelligence/IntelligenceCard';
import { IntelligenceEvent } from '@/lib/models/IntelligenceEvent';
import dbConnect from '@/lib/mongoose';
import { unstable_cache } from 'next/cache';

const getCachedIntelligenceEvents = unstable_cache(
  async () => {
    await dbConnect();
    return IntelligenceEvent.find({ status: "published", enrichmentStatus: "COMPLETED" })
      .sort({ publishedAt: -1 })
      .limit(10)
      .select("slug title publishedAt region category summary whyItMatters indiaImpact riskLevel confidence sourceNames sourceUrls discoveredAt")
      .lean();
  },
  ["intelligence-page-events"],
  { revalidate: 60 }
);

export const metadata = {
  title: 'Global Intelligence Live | Global Chanakya',
  description: 'Real-time strategic intelligence, geopolitical risk analysis, and India impact assessments.',
};

export default async function IntelligencePage() {
  await dbConnect();
  
  const rawLiveEvents = await getCachedIntelligenceEvents();
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

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-12">
        <IntelligenceHeader 
          title="Global Intelligence" 
          subtitle="Live Strategic Developments & Risk Assessments"
          live={true}
        />

        {/* Intelligence Command Center Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/intelligence/ask" className="group p-6 bg-[var(--surface)] rounded-sm border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col gap-4">
            <div className="w-12 h-12 rounded-sm bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--accent)] text-[var(--gold)]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-2">Ask Chanakya</h3>
              <p className="text-sm text-white/70">Get structured geopolitical assessments and strategic context for any global event.</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--gold)]">
              Query Intelligence Core <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          <Link href="/intelligence/india-impact" className="group p-6 bg-[var(--surface)] rounded-sm border border-[var(--border)] hover:border-[var(--border)] transition-all flex flex-col gap-4">
            <div className="w-12 h-12 rounded-sm bg-[var(--cyan)]/10 flex items-center justify-center border border-[var(--border)] text-[var(--cyan)]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-[var(--cyan)] transition-colors mb-2">India Impact Engine</h3>
              <p className="text-sm text-white/70">Multi-dimensional analysis of how global events affect India's security, economy, and diplomacy.</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cyan)]">
              Assess Impact <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/intelligence/scenarios" className="group p-6 bg-[var(--surface)] rounded-sm border border-[var(--border)] hover:border-purple-500/50 transition-all flex flex-col gap-4">
            <div className="w-12 h-12 rounded-sm bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors mb-2">Scenario Intelligence</h3>
              <p className="text-sm text-white/70">Visual timelines and predictive analysis for "What-If" geopolitical crises.</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-[10px] font-bold uppercase tracking-[0.15em] text-purple-400">
              Run Scenarios <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Live Feed Section */}
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-bold flex items-center gap-3">
             <TriangleAlert className="w-6 h-6 text-[var(--cyan)]" />
             Live Intelligence Feed
           </h2>
           <div className="flex gap-2">
             {["ALL", "CRITICAL", "HIGH RISK"].map(filter => (
               <button key={filter} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${filter === 'ALL' ? 'bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--border)]' : 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-white/20'}`}>
                 {filter}
               </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {liveEvents.map((item: any) => (
            <IntelligenceCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
