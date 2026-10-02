"use client";
import React, { useState, useEffect } from "react";

export default function AsyncRelationSelect({
  relationModel,
  value,
  onChange,
}: {
  relationModel?: string;
  value: any;
  onChange: (val: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // In a real app, this would debounce and hit an endpoint like /api/admin/search?model=relationModel&q=query
  useEffect(() => {
    if (query.length < 2) return;
    setLoading(true);
    const timeout = setTimeout(() => {
      // Mock search results
      setResults([
        { id: "1", title: `Mock Result 1 for ${query} in ${relationModel}` },
        { id: "2", title: `Mock Result 2 for ${query} in ${relationModel}` },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [query, relationModel]);

  const selectedItems = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedItems.map((item: any, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--accent)] px-3 py-1 rounded text-sm">
            <span>{item.title || item.name || item.id || item}</span>
            <button
              onClick={() => onChange(selectedItems.filter((i) => i !== item))}
              className="hover:text-white transition-colors"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder={`Search ${relationModel || "entities"}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-white focus:border-[var(--gold)] outline-none text-sm"
      />
      {loading && <div className="text-xs text-[var(--muted)] mt-1">Searching...</div>}
      {!loading && results.length > 0 && query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded shadow-sm">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onChange([...selectedItems, r]);
                setQuery("");
                setResults([]);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[var(--bg)] transition-colors"
            >
              {r.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
