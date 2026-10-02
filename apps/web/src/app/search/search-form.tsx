"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";

interface BlogResult {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  publishAt: string;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<BlogResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        if (query.trim()) {
          posthog.capture("search_performed", {
            query: query.trim(),
            results_count: data.results?.length || 0,
          });
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 lg:py-28">
      <div className="container mx-auto max-w-4xl px-6">
        
        {/* Header / Input */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <Search className="w-4 h-4" />
            Global Search
          </div>
          <h1 className="font-heading text-4xl lg:text-6xl font-extrabold leading-[1] tracking-[-0.03em] text-white mb-6">
            Search <span className="text-[var(--gold)]">Intelligence</span>
          </h1>
          
          <div className="relative w-full max-w-2xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search reports, regions, or topics..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-sm py-4 pl-12 pr-4 text-lg text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--cyan)] transition-colors shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results Body */}
        <div className="bg-[var(--surface)] rounded-sm border border-[var(--border)] min-h-[400px] bg-[var(--surface)]/30 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-[var(--secondary)]">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--gold)]" />
              <span className="text-sm font-bold uppercase tracking-widest">Scanning Network...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((blog) => (
                <Link 
                  href={`/blogs/${blog.slug}`} 
                  key={blog._id}
                  className="group flex gap-6 p-6 border-b border-[var(--border)] hover:bg-[var(--elevated)] transition-all duration-300 hover:px-8"
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 shrink-0 rounded-sm overflow-hidden border border-[var(--border)]/50 hidden sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy"
                      src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)] mb-2">
                      {blog.category}
                    </span>
                    <h4 className="font-heading text-white font-bold text-lg line-clamp-1 group-hover:text-[var(--gold)] transition-colors mb-1">
                      {blog.title}
                    </h4>
                    <p className="text-[var(--secondary)] text-sm line-clamp-2 leading-[1.6]">
                      {blog.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-[var(--secondary)] group-hover:text-[var(--gold)] transition-colors pl-4">
                    <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--gold)] group-hover:bg-[var(--gold)]/10 transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() !== "" ? (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
              <div className="w-20 h-20 rounded-sm bg-[var(--elevated)] border border-[var(--border)] flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-[var(--muted)]" />
              </div>
              <p className="text-white font-bold text-2xl mb-2">No Intel Found</p>
              <p className="text-[var(--secondary)] text-base max-w-md">
                We couldn&apos;t find any classified reports matching &quot;<span className="text-white">{query}</span>&quot;. Try adjusting your search parameters.
              </p>
            </div>
          ) : (
            <div className="py-20 px-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--secondary)] mb-6">
                Popular Theatres
              </h4>
              <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                {["Geopolitics", "Indo-Pacific", "Defence", "Middle East", "Economy"].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-5 py-2.5 rounded-sm bg-[var(--elevated)] border border-[var(--border)] text-sm text-[var(--secondary)] font-bold uppercase tracking-wider hover:text-white hover:border-[var(--accent)] hover:bg-[var(--gold)]/5 transition-all shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
