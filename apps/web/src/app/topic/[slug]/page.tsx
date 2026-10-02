import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Network, Database } from "lucide-react";
import { TopicService } from "@/modules/seo/services/topic.service";
import { RelatedIntelligence } from "@/components/shared/RelatedIntelligence";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { generateSeoMetadata } from "@repo/utils";
import { SITE_URL } from "@/constants";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const formattedSlug = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const title = `${formattedSlug} Analysis & Reports | Global Chanakya`;
  const description = `Read the latest geopolitical analysis, intelligence reports, and strategic insights concerning ${formattedSlug}.`;
  const canonicalUrl = `${SITE_URL}/topic/${slug}`;

  return generateSeoMetadata({
    title,
    description,
    canonicalUrl,
    keywords: `${formattedSlug} intelligence, ${formattedSlug} geopolitics, ${formattedSlug} reports, ${formattedSlug} analysis`,
    type: "website",
  });
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await TopicService.getTopicHubData(slug);
  
  const totalItems = data.reports?.length || 0;
  if (totalItems === 0) {
    notFound();
  }

  const formattedSlug = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: formattedSlug,
    description: `Aggregated intelligence, reports, and geopolitical relations concerning ${formattedSlug}.`,
    url: `${SITE_URL}/topic/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Global Chanakya",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/logo.svg`,
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        ...data.reports.map((r: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/blogs/${r.slug || r._id}`,
        })),
      ]
    }
  };

  return (
    <div className="bg-[#060606] text-white min-h-screen pt-24 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[
          { name: "Topics", href: "/topic" },
          { name: formattedSlug, href: `/topic/${slug}` }
        ]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 mt-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-sm bg-indigo-500/[0.04] border border-indigo-500/[0.2] flex items-center justify-center">
              <Network className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[12px] font-bold uppercase tracking-wider mb-2">
                <Database className="w-4 h-4" />
                Intelligence Hub
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{formattedSlug}</h1>
              <div className="text-neutral-400 font-medium">Aggregated entity graph and geopolitical insights.</div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <RelatedIntelligence items={data.reports as any} title={`Intelligence Reports & Briefings`} />
        </div>
      </div>
    </div>
  );
}
