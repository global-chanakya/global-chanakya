"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, PenTool, Edit3, Trash2, Eye, EyeOff, Globe, FileText } from "lucide-react";

interface BlogRow {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  visibility: string;
  analytics: { views: number };
  createdAt: string;
  publishAt: string;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  published: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  draft: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
  scheduled: { bg: "bg-[var(--cyan)]/10", text: "text-[var(--cyan)]", border: "border-[var(--border)]" },
  archived: { bg: "bg-[var(--danger)]/10", text: "text-[var(--danger)]", border: "border-[var(--danger)]/30" },
};

export default function PlatformSeoListClient({ blogs }: { blogs: BlogRow[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [localBlogs, setLocalBlogs] = useState(blogs);

  const filtered = localBlogs.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function deleteBlog(id: string, slug: string) {
    if (!confirm(`Delete Platform SEO article "${slug}"? This cannot be undone.`)) return;
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
            Platform <span className="text-[var(--text)]">SEO</span>
          </h1>
          <p className="text-sm text-[var(--muted)]">Manage articles that appear on /platformseo</p>
        </div>
        <Link
          href="/gc-control-9x7k/platform-seo/new"
          className="flex items-center gap-2 px-6 py-3 text-black font-bold text-xs uppercase tracking-[0.1em] rounded-sm transition-all"
        >
          <PenTool className="w-4 h-4" /> New Platform SEO
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search platform SEO articles..."
            className="w-full px-4 py-3 pl-12 bg-[var(--surface)]/80 border border-[var(--border)] rounded-sm text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all ${
                filterStatus === s
                  ? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--accent)]"
                  : "bg-[var(--surface)]/50 text-white/40 border-[var(--border)] hover:text-white/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--surface)] p-12 rounded-sm border border-[var(--border)] text-center">
          <FileText className="w-12 h-12 text-[var(--muted)] mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">No Platform SEO Articles</h2>
          <p className="text-sm text-[var(--muted)] mb-6">Create your first Platform SEO article to get started.</p>
          <Link
            href="/gc-control-9x7k/platform-seo/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-black font-bold text-xs uppercase tracking-wider rounded-sm"
          >
            <PenTool className="w-4 h-4" /> Create
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((blog) => {
            const sc = statusColors[blog.status] || statusColors.draft;
            return (
              <div
                key={blog._id}
                className="bg-[var(--surface)] p-5 rounded-sm border border-[var(--border)] hover:border-[var(--accent)] transition-all flex items-center gap-4"
              >
                <Globe className="w-5 h-5 text-[var(--cyan)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/gc-control-9x7k/platform-seo/${blog._id}`}
                    className="text-sm font-bold text-white hover:text-[var(--gold)] transition-colors line-clamp-1"
                  >
                    {blog.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--cyan)]">{blog.category || "Uncategorized"}</span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {new Date(blog.publishAt || blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">{blog.analytics?.views || 0} views</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${sc.bg} ${sc.text} ${sc.border}`}>
                  {blog.status}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStatus(blog._id, blog.status)}
                    title={blog.status === "published" ? "Unpublish" : "Publish"}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
                  >
                    {blog.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link
                    href={`/gc-control-9x7k/platform-seo/${blog._id}`}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteBlog(blog._id, blog.slug)}
                    disabled={deleting === blog._id}
                    className="p-2 rounded-lg hover:bg-[var(--danger)]/10 text-white/40 hover:text-[var(--danger)] transition-all disabled:opacity-30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
