/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Database, Network, Crosshair, Newspaper } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RelatedIntelligence } from "@/components/shared/RelatedIntelligence";
import { EntityIntelligenceExplorer } from "@/components/intelligence/EntityIntelligenceExplorer";
import { MOCK_COUNTRY_INTELLIGENCE } from "@/lib/intelligence/mockData";
import { SITE_URL } from "@/constants";

interface EntityHubProps {
  entityType: string; // e.g., "Country", "Leader"
  slug: string;
  name: string;
  description?: string;
  articleCount: number;
  status: "404" | "noindex" | "index";
  articles: any[];
  relatedEntities: any;
  structuredData: any;
  featuredImage?: string;
}

export function EntityHub({
  entityType,
  slug,
  name,
  description,
  articleCount,
  status,
  articles,
  relatedEntities,
  structuredData,
}: EntityHubProps) {
  if (status === "404") {
    notFound();
  }

  const typePlural = entityType.endsWith("y") 
    ? entityType.slice(0, -1) + "ies" 
    : entityType + "s";
  
  const basePath = `/${typePlural.toLowerCase()}`;

  const hasRelated = Object.values(relatedEntities).some((arr: any) => arr && arr.length > 0);

  return (
    <div className="bg-[#060606] text-white min-h-screen pt-24 pb-20 px-6">
      {status === "noindex" && <meta name="robots" content="noindex, follow" />}
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[
          { name: typePlural, href: basePath },
          { name: name, href: `${basePath}/${slug}` }
        ]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 mt-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-sm bg-indigo-500/[0.04] border border-indigo-500/[0.2] flex items-center justify-center">
              <Network className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[12px] font-bold uppercase tracking-wider mb-2">
                <Database className="w-4 h-4" />
                {entityType} Intelligence Hub
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{name}</h1>
              <div className="text-neutral-400 font-medium max-w-2xl">
                {description || `Aggregated intelligence, reports, and geopolitical relations concerning ${name}.`}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-12">
            {articles.length > 0 ? (
              <RelatedIntelligence items={articles} title={`Latest ${entityType} Reports`} />
            ) : (
              <div className="bg-[var(--surface)] p-8 rounded-sm text-center border border-[var(--border)]">
                <p className="text-[var(--secondary)]">No intelligence reports currently available for this entity.</p>
              </div>
            )}
            
            {/* INJECTED INTELLIGENCE EXPLORER MOCK */}
            <EntityIntelligenceExplorer intelligence={MOCK_COUNTRY_INTELLIGENCE} />
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-8">
            {hasRelated && (
              <div className="bg-[var(--surface)] rounded-sm p-6">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                  <Crosshair className="w-4 h-4 text-[var(--gold)]" /> Entity Graph
                </h3>
                <div className="flex flex-col gap-6">
                  {Object.entries(relatedEntities).map(([relType, items]: [string, any]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={relType}>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-3">{relType}</h4>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item: any) => (
                            <Link 
                              key={item.slug} 
                              href={`/${relType}/${item.slug}`}
                              className="px-3 py-1.5 rounded-sm bg-[var(--surface)] border border-[var(--border)] text-[12px] font-medium hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-[var(--secondary)]"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="bg-[var(--surface)] rounded-sm p-6 border border-[var(--border)] bg-[var(--surface)]/50">
               <h3 className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-4">
                 <Newspaper className="w-4 h-4 text-[var(--cyan)]" /> Intelligence Stats
               </h3>
               <div className="flex items-center justify-between text-[13px]">
                 <span className="text-[var(--secondary)]">Published Reports</span>
                 <span className="font-bold text-white bg-[var(--surface)] px-2 py-1 rounded-sm border border-[var(--border)]">{articleCount}</span>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
