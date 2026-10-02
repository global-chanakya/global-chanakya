import React from "react";
import { SourceCategory } from "./SourceCategory";
import { SourceProps, SourceType } from "./SourceCard";
import { BookMarked } from "lucide-react";

interface CitationBlockProps {
  citations: SourceProps[];
}

export function CitationBlock({ citations }: CitationBlockProps) {
  if (!citations || citations.length === 0) return null;

  // Group citations by type
  const groupedCitations: Record<string, SourceProps[]> = {
    Primary: [],
    Government: [],
    "Think Tank": [],
    Academic: [],
    Secondary: [],
  };

  citations.forEach(cit => {
    if (groupedCitations[cit.type]) {
      groupedCitations[cit.type].push(cit);
    } else {
      groupedCitations["Secondary"].push(cit);
    }
  });

  return (
    <section className="my-12 p-6 rounded-sm bg-gray-950 border border-gray-800" aria-label="Article Citations and Sources">
      <header className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          <BookMarked className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">Citations & Verification</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Global Chanakya guarantees accuracy through verified intelligence streams.
          </p>
        </div>
      </header>

      <div className="space-y-2">
        {(Object.keys(groupedCitations) as SourceType[]).map((category) => (
          <SourceCategory key={category} category={category} sources={groupedCitations[category]} />
        ))}
      </div>
    </section>
  );
}
