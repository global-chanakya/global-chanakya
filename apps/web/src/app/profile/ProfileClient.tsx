"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Bookmark, Heart, Clock, MessageSquare, Shield, Activity, Calendar, Newspaper, Edit3, X } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@repo/utils";

interface ProfileStats {
  user: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    role: string;
    joinedAt: string;
  };
  stats: {
    totalReads: number;
    totalLikes: number;
    totalBookmarks: number;
    totalComments: number;
    totalReadingTimeMinutes: number;
    engagementScore: number;
  };
}

interface ActivityItem {
  _id: string;
  createdAt: string;
  blog: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    publishAt: string;
    featuredImage?: string;
    analytics?: {
      views?: number;
      likes?: number;
      bookmarks?: number;
    };
  } | null;
}

export default function ProfileClient() {
  const [profileData, setProfileData] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"history" | "bookmarks" | "likes">("history");
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok) {
          setProfileData(data);
          setEditForm({ name: data.user.name || "", bio: data.user.bio || "" });
        } else {
          setError(data.error || "Failed to load profile");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch activity when tab or page changes
  useEffect(() => {
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const res = await fetch(`/api/profile/activity?type=${activeTab}&page=${page}&limit=10`);
        const data = await res.json();
        if (res.ok) {
          if (page === 1) {
            setActivityItems(data.items);
          } else {
            setActivityItems(prev => [...prev, ...data.items]);
          }
          setHasMore(data.pagination.page < data.pagination.totalPages);
        }
      } catch (err) {
        // Silently handle activity fetch error
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, [activeTab, page]);

  // Handle Tab Change
  const handleTabChange = (tab: "history" | "bookmarks" | "likes") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setActivityItems([]);
    setHasMore(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setProfileData(prev => {
          if (!prev) return prev;
          return { ...prev, user: { ...prev.user, ...editForm } };
        });
        setIsEditing(false);
      }
    } catch (err) {
      // Handle error
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--border)] animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--surface)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--surface)] rounded w-3/4" />
                <div className="h-3 bg-[var(--surface)] rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-3 bg-[var(--surface)] rounded w-2/3" />
              <div className="h-3 bg-[var(--surface)] rounded w-1/2" />
            </div>
          </div>
          <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--border)] animate-pulse h-48" />
        </aside>
        <main className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-[var(--surface)] h-[600px] rounded-lg border border-[var(--border)] animate-pulse" />
        </main>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="bg-[var(--surface)] p-8 rounded-lg text-center border-red-500/20">
        <p className="text-red-400">{error || "Failed to load profile"}</p>
      </div>
    );
  }

  const { user, stats } = profileData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ── Left Sidebar (User Info & Stats) ── */}
      <aside className="lg:col-span-4 flex flex-col gap-6">
        {/* User Card */}
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--border)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1" />
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--surface)] intel-border flex items-center justify-center text-xl font-bold text-white shadow-sm overflow-hidden relative">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img loading="lazy" src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-[13px] text-[var(--secondary)]">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-[var(--surface)] text-[var(--secondary)] hover:text-white transition-colors"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col gap-3 text-[13px] font-medium text-[var(--secondary)] mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--cyan)]" />
              <span className="capitalize">{user.role} Clearance</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--muted)]" />
              <span>Joined {formatDate(user.joinedAt, "standard")}</span>
            </div>
          </div>

          {user.bio && (
            <p className="text-[13px] text-[var(--secondary)] italic border-l-2 border-[var(--gold)] pl-3 mb-2">
              {user.bio}
            </p>
          )}
        </div>

        {/* Analytics Card */}
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--border)]">
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
            <Activity className="w-4 h-4 text-[var(--gold)]" /> Engagement Metrics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-4 text-center">
              <Clock className="w-5 h-5 text-[var(--cyan)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalReadingTimeMinutes}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">Min Read</div>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-4 text-center">
              <Activity className="w-5 h-5 text-[var(--gold)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.engagementScore}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">Eng. Score</div>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-4 text-center">
              <Bookmark className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalBookmarks}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">Saved</div>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-4 text-center">
              <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalComments}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">Comments</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right Content (Activity Feed) ── */}
      <main className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden">
          {/* Tabs Header */}
          <div className="flex border-b border-[var(--border)] bg-[var(--surface)]">
            <button
              onClick={() => handleTabChange("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[13px] font-bold uppercase tracking-widest transition-colors ${
                activeTab === "history" ? "text-[var(--gold)] border-b-2 border-[var(--gold)] bg-black/20" : "text-[var(--muted)] hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" /> Reading History
            </button>
            <button
              onClick={() => handleTabChange("bookmarks")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[13px] font-bold uppercase tracking-widest transition-colors ${
                activeTab === "bookmarks" ? "text-amber-500 border-b-2 border-amber-500 bg-black/20" : "text-[var(--muted)] hover:text-white"
              }`}
            >
              <Bookmark className="w-4 h-4" /> Saved Reports
            </button>
            <button
              onClick={() => handleTabChange("likes")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[13px] font-bold uppercase tracking-widest transition-colors ${
                activeTab === "likes" ? "text-red-400 border-b-2 border-red-400 bg-black/20" : "text-[var(--muted)] hover:text-white"
              }`}
            >
              <Heart className="w-4 h-4" /> Liked
            </button>
          </div>

          {/* Activity List */}
          <div className="p-6 flex flex-col gap-4 min-h-[400px]">
            {activityItems.length === 0 && !activityLoading ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-[var(--muted)]">
                <Newspaper className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[14px]">No activity found in this category.</p>
              </div>
            ) : (
              <>
                {activityItems.map((item, index) => {
                  const blog = item.blog;
                  if (!blog) return null;
                  
                  return (
                    <Link
                      key={`${item._id}-${index}`}
                      href={`/blogs/${blog.slug}`}
                      className="group flex flex-col sm:flex-row gap-4 p-4 rounded-md border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] hover:-translate-y-1 transition-all"
                    >
                      {blog.featuredImage && (
                        <div className="w-full sm:w-32 h-24 shrink-0 rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img loading="lazy"
                            src={blog.featuredImage} 
                            alt={blog.title} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      )}
                      <div className="flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] mb-1">
                          {blog.category}
                        </span>
                        <h4 className="text-[15px] font-bold text-white leading-snug group-hover:text-[var(--gold)] transition-colors line-clamp-2 mb-2">
                          {blog.title}
                        </h4>
                        <div className="mt-auto flex items-center gap-4 text-[11px] font-medium text-[var(--muted)] uppercase tracking-wide">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> 
                            {formatDate(blog.publishAt, "short")}
                          </span>
                          {blog.analytics?.likes !== undefined && (
                            <span className="flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5" /> 
                              {blog.analytics.likes}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                
                {activityLoading && (
                  <div className="space-y-4 py-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4 p-4 rounded-md border border-[var(--border)] bg-[var(--bg)] animate-pulse">
                        <div className="w-full sm:w-32 h-24 shrink-0 rounded bg-[var(--surface)]" />
                        <div className="flex-1 space-y-3 py-2">
                          <div className="h-2 bg-[var(--surface)] rounded w-16" />
                          <div className="h-4 bg-[var(--surface)] rounded w-3/4" />
                          <div className="h-3 bg-[var(--surface)] rounded w-1/3 mt-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {hasMore && !activityLoading && (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="mt-4 w-full py-3 rounded border border-[var(--border)] text-[12px] font-bold uppercase tracking-widest text-[var(--secondary)] hover:text-white hover:bg-[var(--surface)] transition-colors"
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg max-w-md w-full shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-[var(--muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">Display Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--gold)]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">Bio</label>
                <textarea 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--gold)] resize-none" 
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-bold text-[var(--secondary)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-4 py-2 bg-[var(--gold)] text-black font-bold text-sm rounded flex items-center gap-2 hover:bg-[#d4af37] disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
