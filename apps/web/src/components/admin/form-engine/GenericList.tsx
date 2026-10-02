"use client";

import React, { useState, useEffect } from "react";
import { EntitySchema } from "./EntitySchemas";
import { Plus, Search, Edit2, Trash2, Eye, Filter, RefreshCw, BarChart2 } from "lucide-react";
import Link from "next/link";
import { formatViews } from "@/lib/formatViews";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function GenericList({ schema }: { schema: EntitySchema }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "views" | "title">("date");

  const fetchData = () => {
    setLoading(true);
    fetch(schema.apiPath)
      .then((res) => res.json())
      .then((res) => {
        if (Array.isArray(res)) {
          setData(res);
        } else {
          setData(
            res.data ||
            res.items ||
            res.blogs ||
            []
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [schema.apiPath]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${schema.apiPath}?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => prev.filter((item) => item._id !== id && item.id !== id));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      const res = await fetch(schema.apiPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (res.ok) {
        setData((prev) => prev.map((item) => {
          const itemId = item._id || item.id;
          if (itemId === id) return { ...item, [field]: value };
          return item;
        }));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Update failed");
      }
    } catch {
      alert("Update failed");
    }
  };


  // Filter & sort
  const filtered = data
    .filter((item) => {
      const text = (item.title || item.name || item.slug || "").toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "views") return (b.analytics?.views ?? 0) - (a.analytics?.views ?? 0);
      if (sortBy === "title") return (a.title || a.name || "").localeCompare(b.title || b.name || "");
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    });

  const hasAnalytics = data.some((d) => d.analytics);
  const totalViews = data.reduce((sum, d) => sum + (d.analytics?.views ?? 0), 0);
  const publishedCount = data.filter((d) => d.status === "published").length;
  const draftCount = data.filter((d) => d.status === "draft").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{schema.name}s</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {data.length} total · {publishedCount} published · {draftCount} drafts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-[var(--muted)] hover:text-white bg-[var(--surface)] border border-[var(--border)] rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href={`${schema.frontendBasePath || '/admin/' + schema.id}/new`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create {schema.name}
          </Link>
        </div>
      </div>

      {/* Stats Row (for blogs/analytics) */}
      {hasAnalytics && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
            <p className="text-xs text-[var(--muted)] flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Total Views</p>
            <p className="text-2xl font-bold text-white mt-1">{formatViews(totalViews)}</p>
          </div>
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
            <p className="text-xs text-[var(--muted)]">📰 Published</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{publishedCount}</p>
          </div>
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
            <p className="text-xs text-[var(--muted)]">✏️ Drafts</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{draftCount}</p>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder={`Search ${schema.name.toLowerCase()}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[var(--gold)] outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--gold)] outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--gold)] outline-none"
          >
            <option value="date">Sort: Newest</option>
            <option value="views">Sort: Most Viewed</option>
            <option value="title">Sort: A-Z</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/40">
                <th className="px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Title / Name</th>
                {data.some(d => d.visibility) && (
                  <th className="px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Visibility</th>
                )}
                <th className="px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Status</th>
                {hasAnalytics && (
                  <th className="px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                    <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Views</span>
                  </th>
                )}
                <th className="px-5 py-3.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Published</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <RefreshCw className="w-6 h-6 text-[var(--gold)] animate-spin mx-auto mb-2" />
                    <p className="text-[var(--muted)] text-sm">Loading data...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="w-14 h-14 bg-[var(--bg)] border border-[var(--border)] rounded-sm flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-[var(--muted)]" />
                    </div>
                    <p className="text-white font-bold mb-1">No items found</p>
                    <p className="text-[var(--muted)] text-sm">
                      {search ? `No results for "${search}"` : `No ${schema.name.toLowerCase()}s yet. Create your first one!`}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const itemId = item._id || item.id;
                  return (
                    <tr key={itemId || idx} className="hover:bg-[var(--bg)]/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.featuredImage || item.flagUrl || item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img loading="lazy"
                              src={item.featuredImage || item.flagUrl || item.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-[var(--border)] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] text-lg shrink-0">
                              {(item.title || item.name || "?")[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate max-w-xs">{item.title || item.name || item.slug}</p>
                            <p className="text-xs text-[var(--muted)] font-mono truncate max-w-xs">{item.slug || item.category || item.type || ""}</p>
                          </div>
                        </div>
                      </td>
                      {data.some(d => d.visibility !== undefined) && (
                        <td className="px-5 py-4">
                          {item.visibility !== undefined ? (
                            <select
                              value={item.visibility || "public"}
                              onChange={(e) => handleUpdate(itemId, "visibility", e.target.value)}
                              className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--muted)] hover:text-white w-fit outline-none cursor-pointer appearance-none"
                            >
                              <option value="public">🌐 PUBLIC</option>
                              <option value="premium">⭐ PREMIUM</option>
                              <option value="private">🔒 PRIVATE</option>
                            </select>
                          ) : (
                            <span className="text-[var(--muted)] text-xs">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <select
                            value={item.status || "draft"}
                            onChange={(e) => handleUpdate(itemId, "status", e.target.value)}
                            className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border w-fit outline-none appearance-none cursor-pointer ${STATUS_STYLES[item.status] || STATUS_STYLES.archived}`}
                          >
                            <option value="draft">DRAFT</option>
                            <option value="published">PUBLISHED</option>
                            <option value="scheduled">SCHEDULED</option>
                            <option value="archived">ARCHIVED</option>
                          </select>
                          {item.isBreaking && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 w-fit">
                              🔴 Breaking
                            </span>
                          )}
                        </div>
                      </td>
                      {hasAnalytics && (
                        <td className="px-5 py-4">
                          {item.analytics ? (
                            <div>
                              <p className="text-white font-bold text-sm">{formatViews(item.analytics.views ?? 0)}</p>
                              <p className="text-xs text-[var(--muted)]">
                                ❤️ {item.analytics.likes ?? 0} · 🔖 {item.analytics.bookmarks ?? 0}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[var(--muted)] text-xs">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-4 text-sm text-[var(--muted)]">
                        {new Date(item.publishAt || item.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.slug && (
                            <a
                              href={`/${schema.id === "blogs" ? "blogs" : schema.id}/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-[var(--muted)] hover:text-white bg-[var(--bg)] rounded-lg border border-[var(--border)] transition-colors"
                              title="View live"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            href={`${schema.frontendBasePath || '/admin/' + schema.id}/${itemId}`}
                            className="p-1.5 text-[var(--gold)] hover:bg-[var(--gold)]/10 bg-[var(--bg)] rounded-lg border border-[var(--accent)] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(itemId)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 bg-[var(--bg)] rounded-lg border border-red-500/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg)]/20 flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">
              Showing {filtered.length} of {data.length} {schema.name.toLowerCase()}s
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
