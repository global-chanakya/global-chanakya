"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, PenTool, Edit3, Trash2, Eye, EyeOff, FileText, BarChart2, ShieldAlert } from "lucide-react";
import { formatViews } from "@/lib/formatViews";

interface BlogRow {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  visibility: string;
  isTrending: boolean;
  analytics: { views: number };
  createdAt: string;
  publishAt: string;
  chunkCount?: number;
}

const statusColors: Record<string, { bg: string, text: string, border: string }> = {
  published: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  draft: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
  scheduled: { bg: "bg-[var(--cyan)]/10", text: "text-[var(--cyan)]", border: "border-[var(--border)]" },
  archived: { bg: "bg-[var(--danger)]/10", text: "text-[var(--danger)]", border: "border-[var(--danger)]/30" },
};

const visibilityColors: Record<string, string> = {
  public: "text-emerald-400",
  premium: "text-[var(--gold)]",
  private: "text-[var(--danger)]",
};

export default function AdminBlogsClient({ blogs }: { blogs: BlogRow[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [localBlogs, setLocalBlogs] = useState(blogs);

  const filtered = localBlogs.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function deleteBlog(id: string, slug: string) {
    if (!confirm(`Warning: Are you sure you want to delete the report "${slug}"? This action cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
      if (res.ok) setLocalBlogs((prev) => prev.filter((b) => b._id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const res = await fetch("/api/admin/blogs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      setLocalBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10 min-h-screen">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-2 flex items-center gap-3">
            Intelligence <span className="text-[var(--text)]">Archive</span>
          </h1>
          <p className="text-white/50 text-[14px] font-medium max-w-xl leading-relaxed">
            Manage, review, and publish strategic reports and geopolitical analysis.
            <span className="text-[var(--cyan)] ml-2">Total Reports: {localBlogs.length}</span>
          </p>
        </div>
        
        {/* Action Button */}
        <Link
          href="/admin/write"
          className="group relative flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-black rounded-sm font-bold uppercase tracking-[0.1em] text-[12px] overflow-hidden transition-all hover:scale-105 hover:"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-sm" />
          <PenTool className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Write New Report</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-[var(--surface)]/50 border border-[var(--border)] p-3 rounded-sm shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search reports by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] focus: transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["all", "published", "draft", "scheduled", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.1em] border transition-all ${
                filterStatus === s
                  ? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--accent)] "
                  : "bg-[var(--bg)] text-white/40 border-[var(--border)] hover:text-white hover:bg-[var(--surface)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Archive Table */}
      <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm overflow-hidden shadow-sm relative">
        {/* Glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-px" />
        
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="w-16 h-16 text-white/10 mb-6" />
            <p className="text-white/40 text-[15px] font-medium max-w-md">No intelligence reports match your current clearance filters or search query.</p>
            <Link
              href="/admin/write"
              className="mt-6 px-6 py-3 rounded-sm bg-white/5 border border-white/10 hover:border-[var(--accent)] hover:bg-[var(--gold)]/10 text-[var(--gold)] text-[12px] font-bold uppercase tracking-[0.1em] transition-all"
            >
              Draft Initial Report
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50">
                  {["Directive / Subject", "Classification", "Status", "RAG Status", "Access", "Telemetry", "Timestamp", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {filtered.map((b) => (
                  <tr key={b._id} className="group hover:bg-[var(--bg)]/50 transition-colors">
                    <td className="px-6 py-5 max-w-[280px]">
                      <div className="flex items-center gap-3">
                        {b.isTrending && (
                          <div className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" title="Trending Intelligence" />
                        )}
                        <p className="text-white text-[13.5px] font-bold truncate group-hover:text-[var(--gold)] transition-colors" title={b.title}>
                          {b.title}
                        </p>
                      </div>
                      <p className="text-white/40 text-[11px] font-medium mt-1 truncate">
                        ID: {b.slug}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.15em] bg-[var(--cyan)]/10 border border-[var(--border)] px-3 py-1 rounded-full">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${statusColors[b.status]?.border ?? statusColors.draft.border} ${statusColors[b.status]?.text ?? statusColors.draft.text} ${statusColors[b.status]?.bg ?? statusColors.draft.bg}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {(b.chunkCount ?? 0) > 0 ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-[0.1em] bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Indexed ({b.chunkCount})
                        </span>
                      ) : b.status === "published" ? (
                        <span className="flex items-center gap-1.5 text-[var(--gold)] text-[11px] font-bold uppercase tracking-[0.1em] bg-[var(--gold)]/10 border border-[var(--accent)] px-3 py-1 rounded-full w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                          Pending Index
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-white/40 text-[11px] font-bold uppercase tracking-[0.1em] bg-white/5 border border-white/10 px-3 py-1 rounded-full w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          Not Indexed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[11px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 ${visibilityColors[b.visibility] ?? "text-white/50"}`}>
                        {b.visibility === 'public' ? <Eye className="w-3.5 h-3.5" /> : b.visibility === 'premium' ? <ShieldAlert className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {b.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-white/60 text-[12px] font-medium bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg w-fit">
                        <BarChart2 className="w-3.5 h-3.5 text-[var(--gold)]" />
                        {formatViews(b.analytics.views)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-white/50 text-[11px] font-medium tracking-wide">
                      {new Date(b.publishAt || b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/blogs/${b.slug}`}
                          target="_blank"
                          className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-[var(--cyan)] hover:border-[var(--border)] transition-all"
                          title="View Live"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/write?id=${b._id}`}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-[var(--gold)] hover:border-[var(--accent)] transition-all"
                          title="Edit Report"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleStatus(b._id, b.status)}
                          className={`p-2 rounded-lg border transition-all ${
                            b.status === "published"
                              ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-500"
                              : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500"
                          }`}
                          title={b.status === "published" ? "Recall to Draft" : "Publish Report"}
                        >
                          {b.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteBlog(b._id, b.slug)}
                          disabled={deleting === b._id}
                          className={`p-2 bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] rounded-lg hover:bg-[var(--danger)]/20 transition-all ${
                            deleting === b._id ? "opacity-50 cursor-wait" : ""
                          }`}
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
