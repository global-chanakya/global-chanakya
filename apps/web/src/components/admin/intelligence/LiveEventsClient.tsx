"use client";
import { useState } from "react";
import { Search, Eye, Archive, Trash2, Globe, FileText, Zap } from "lucide-react";

interface EventRow {
  _id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  status: string;
  impactLevel: number;
}

export default function LiveEventsClient({ events }: { events: EventRow[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [localEvents, setLocalEvents] = useState(events);
  const [processing, setProcessing] = useState<string | null>(null);

  const filtered = localEvents.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.source.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "archived" : "active";
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/intelligence/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setLocalEvents((prev) =>
          prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
        );
      }
    } finally {
      setProcessing(null);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm(`Warning: Are you sure you want to permanently delete this event?`)) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/intelligence/events?id=${id}`, { method: "DELETE" });
      if (res.ok) setLocalEvents((prev) => prev.filter((e) => e._id !== id));
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10 min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-2 flex items-center gap-3">
            Live <span className="text-[var(--text)]">Intelligence</span>
          </h1>
          <p className="text-white/50 text-[14px] font-medium max-w-xl leading-relaxed">
            Manage real-time events ingested from external intelligence providers.
            <span className="text-[var(--gold)] ml-2">Total Events: {localEvents.length}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-[var(--surface)]/50 border border-[var(--border)] p-3 rounded-sm shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search events by title or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--border)] focus: transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["all", "active", "archived", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.1em] border transition-all ${
                filterStatus === s
                  ? "bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--border)] "
                  : "bg-[var(--bg)] text-white/40 border-[var(--border)] hover:text-white hover:bg-[var(--surface)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-1/4 w-1/2 h-px" />
        
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Zap className="w-16 h-16 text-white/10 mb-6" />
            <p className="text-white/40 text-[15px] font-medium max-w-md">No live events match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50">
                  {["Title", "Source", "Status", "Impact", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {filtered.map((e) => (
                  <tr key={e._id} className="group hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="px-6 py-5 max-w-[300px]">
                      <p className="text-white text-[13.5px] font-bold truncate group-hover:text-[var(--cyan)] transition-colors" title={e.title}>
                        {e.title}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-white/70 text-[12px]">
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded w-fit">
                        <Globe className="w-3 h-3 text-[var(--gold)]" /> {e.source}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${
                        e.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                        'bg-gray-500/10 text-gray-400 border-gray-500/30'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-white/50 text-[12px] font-mono">
                      {e.impactLevel}/10
                    </td>
                    <td className="px-6 py-5 text-white/50 text-[11px] font-medium tracking-wide">
                      {new Date(e.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {e.url && (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-[var(--cyan)] hover:border-[var(--border)] transition-all"
                            title="View Source"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => toggleStatus(e._id, e.status)}
                          disabled={processing === e._id}
                          className={`p-2 rounded-lg border transition-all ${
                            e.status === "active"
                              ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-500"
                              : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500"
                          } disabled:opacity-50`}
                          title={e.status === "active" ? "Archive Event" : "Restore Event"}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEvent(e._id)}
                          disabled={processing === e._id}
                          className="p-2 bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] rounded-lg hover:bg-[var(--danger)]/20 transition-all disabled:opacity-50"
                          title="Purge Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
