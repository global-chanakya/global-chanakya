"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Clock, AlertTriangle, TrendingUp, Filter, RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveIntelligencePage() {
  const [filter, setFilter] = useState({ category: "", eventType: "", sort: "recent" });
  const [skip, setSkip] = useState(0);

  const queryParams = new URLSearchParams({
    limit: "20",
    skip: skip.toString(),
    ...(filter.category && { category: filter.category }),
    ...(filter.eventType && { eventType: filter.eventType }),
    ...(filter.sort && { sort: filter.sort })
  });

  const { data, error, isLoading, mutate } = useSWR(`/api/intelligence/timeline?${queryParams}`, fetcher, {
    refreshInterval: 60000, // Poll every minute
  });

  const events = data?.data || [];
  const hasMore = data?.pagination?.hasMore || false;

  return (
    <div className="min-h-screen bg-[var(--navy-deep)] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-heading font-extrabold text-[var(--white)] mb-2">Global Intelligence Live</h1>
            <p className="text-[var(--slate-200)] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Real-time geopolitical events and breaking news.
            </p>
          </div>
          <button 
            onClick={() => mutate()} 
            className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 rounded hover:bg-[var(--gold)]/20 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        {/* Filters */}
        <div className="bg-[var(--navy-surface)] border border-[var(--border-dark)] p-4 rounded-lg shadow mb-8 flex flex-wrap gap-4 items-center">
          <Filter className="w-5 h-5 text-[var(--slate-200)]" />
          <select 
            className="bg-[var(--navy-deep)] border border-[var(--border-dark)] rounded px-3 py-1 text-[var(--slate-200)]"
            value={filter.eventType}
            onChange={(e) => setFilter(f => ({ ...f, eventType: e.target.value, sort: e.target.value === 'BREAKING' ? 'recent' : f.sort }))}
          >
            <option value="">All Event Types</option>
            <option value="BREAKING">Breaking News</option>
            <option value="CONFLICT">Conflict</option>
            <option value="DIPLOMACY">Diplomacy</option>
            <option value="ANALYSIS">Analysis</option>
          </select>
          <select 
            className="bg-[var(--navy-deep)] border border-[var(--border-dark)] rounded px-3 py-1 text-[var(--slate-200)]"
            value={filter.sort}
            onChange={(e) => setFilter(f => ({ ...f, sort: e.target.value }))}
          >
            <option value="recent">Most Recent</option>
            <option value="important">Highest Importance</option>
          </select>
        </div>

        <div className="space-y-6">
          {isLoading && events.length === 0 ? (
            <div className="text-center py-12 text-[var(--slate-200)]">Loading live intelligence...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-[var(--slate-200)] py-12">No live events found for these filters.</div>
          ) : (
            events.map((event: any) => (
              <article key={event._id.toString()} className={`bg-[var(--navy-surface)] rounded-lg shadow p-6 border border-[var(--border-dark)] border-l-4 ${event.eventType === 'BREAKING' ? 'border-l-[#DC2626]' : 'border-l-[var(--gold)]'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {event.eventType === "BREAKING" && (
                      <span className="bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/50 text-xs px-2 py-1 rounded uppercase font-bold flex items-center gap-1 tracking-widest">
                        <AlertTriangle className="w-3 h-3" /> Breaking
                      </span>
                    )}
                    <span className="bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 text-xs px-2 py-1 rounded uppercase font-bold tracking-widest">{event.category}</span>
                    <span className={`text-xs px-2 py-1 rounded uppercase font-bold tracking-widest border flex items-center gap-1 ${event.importance >= 70 ? 'bg-[var(--gold)]/20 text-[var(--gold)] border-[var(--gold)]/50' : 'bg-[var(--navy-deep)] text-[var(--slate-200)] border-[var(--border-dark)]'}`}>
                      <TrendingUp className="w-3 h-3" />
                      Importance: {event.importance}/100
                    </span>
                  </div>
                  <div className="text-right">
                    <time className="text-sm text-[var(--slate-200)] font-mono block">
                      {new Date(event.publishedAt).toLocaleString()}
                    </time>
                    <span className="text-xs text-[var(--gold)] font-semibold uppercase tracking-wider">
                      {(Date.now() - new Date(event.publishedAt).getTime()) < 86400000 ? 'Fresh' : ''}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-heading font-bold text-[var(--white)] mb-3">{event.title}</h2>
                <p className="text-[var(--slate-100)] leading-relaxed mb-4">{event.summary}</p>
                <div className="text-sm text-[var(--slate-200)] flex items-center gap-4 border-t border-[var(--border-dark)] pt-4">
                  <span>Sources: <strong className="text-[var(--white)]">{event.sourceNames.join(", ")}</strong></span>
                  <a href={event.sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Read Original &rarr;</a>
                </div>
              </article>
            ))
          )}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setSkip(s => s + 20)}
              className="px-6 py-2 bg-[var(--navy-surface)] border border-[var(--border-dark)] text-[var(--white)] rounded hover:border-[var(--gold)] transition-colors font-medium"
            >
              Load Older Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
