"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BlogResult {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  publishAt: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BlogResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--bg)]/80"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-sm shadow-sm overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header / Input */}
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--secondary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search intelligence reports, regions..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-base sm:text-lg placeholder:text-[var(--muted)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5 text-[var(--secondary)] hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--secondary)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
              <span className="text-sm font-semibold uppercase tracking-widest">Scanning Network...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((blog) => (
                <Link 
                  href={`/blogs/${blog.slug}`} 
                  key={blog._id}
                  onClick={onClose}
                  className="group flex gap-4 p-5 border-b border-[var(--border)] hover:bg-[var(--elevated)] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-[var(--border)]/50 hidden sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy"
                      src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)] mb-1">
                      {blog.category}
                    </span>
                    <h4 className="text-white font-bold text-base line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
                      {blog.title}
                    </h4>
                    <p className="text-[var(--secondary)] text-sm line-clamp-1 mt-1">
                      {blog.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-[var(--secondary)] group-hover:text-[var(--gold)] transition-colors pr-2">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() !== "" ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 rounded-sm bg-[var(--elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[var(--muted)]" />
              </div>
              <p className="text-white font-bold text-lg">No Intel Found</p>
              <p className="text-[var(--secondary)] text-sm mt-1 max-w-md">
                We couldn&apos;t find any classified reports matching &quot;{query}&quot;. Try adjusting your search parameters.
              </p>
            </div>
          ) : (
            <div className="py-12 px-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--secondary)] mb-4 px-2">
                Popular Theatres
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Geopolitics", "Indo-Pacific", "Defence", "Middle East", "Economy"].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-4 py-2 rounded-lg bg-[var(--elevated)] border border-[var(--border)] text-sm text-[var(--secondary)] font-medium hover:text-white hover:border-[var(--accent)] hover:bg-[var(--gold)]/5 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--bg)]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
              Powered by Global Chanakya
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-[var(--elevated)] border border-[var(--border)]">ESC</kbd> to close</span>
          </div>
        </div>

      </div>
    </div>
  );
}
