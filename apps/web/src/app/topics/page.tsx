import Link from "next/link";
import { Network } from "lucide-react";
import { TopicService } from "@/modules/seo/services/topic.service";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: "Intelligence Topics",
    description: "Browse geopolitical intelligence by topic and tag.",
  };
}

export default async function TopicsIndexPage() {
  const topics = await TopicService.getAllUniqueTopics();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[var(--navy-deep)] text-[var(--text-on-dark)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-sm bg-indigo-500/[0.04] border border-indigo-500/[0.2] flex items-center justify-center">
            <Network className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--white)] tracking-tight">
            Topics Index
          </h1>
        </div>

        <p className="text-base text-[var(--slate-200)] mb-12">
          Browse strategic intelligence and geopolitical analysis by topic.
        </p>

        {topics.length === 0 ? (
          <div className="text-center py-20 text-[var(--slate-200)] border border-[var(--border-dark)] rounded-sm">
            No topics available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="p-4 rounded-sm border border-[var(--border-dark)] bg-[var(--navy-surface)] hover:border-[var(--gold)] hover:bg-[var(--elevated)] transition-all flex flex-col"
              >
                <span className="text-sm font-bold text-[var(--white)] capitalize">
                  {topic.original}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
