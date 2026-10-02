"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, ChevronLeft, Globe, Eye } from "lucide-react";

interface EditData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  visibility: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    focusKeyword?: string;
  };
}

interface Props {
  authorId: string;
  editData?: EditData;
}

export default function PlatformSeoEditorClient({ authorId, editData }: Props) {
  const router = useRouter();
  const isEditing = !!editData;

  const [title, setTitle] = useState(editData?.title || "");
  const [slug, setSlug] = useState(editData?.slug || "");
  const [excerpt, setExcerpt] = useState(editData?.excerpt || "");
  const [content, setContent] = useState(editData?.content || "");
  const [category, setCategory] = useState(editData?.category || "Platform Updates");
  const [seoTitle, setSeoTitle] = useState(editData?.seo?.title || "");
  const [seoDescription, setSeoDescription] = useState(editData?.seo?.description || "");
  const [seoKeywords, setSeoKeywords] = useState(editData?.seo?.keywords?.join(", ") || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isEditing) {
      setSlug(generateSlug(val));
    }
  }

  async function handleSave(publish: boolean) {
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content,
      category,
      contentType: "platform-seo",
      visibility: "public",
      status: publish ? "published" : "draft",
      seo: {
        title: seoTitle || title,
        description: seoDescription || excerpt,
        keywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      },
    };

    try {
      if (isEditing) {
        payload.id = editData._id;
        const res = await fetch("/api/admin/blogs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
      } else {
        const res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Create failed");
      }

      setSaved(true);
      if (publish) {
        setTimeout(() => router.push("/gc-control-9x7k/platform-seo"), 500);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] focus: transition-all";
  const labelClass = "block text-[11px] text-white/50 font-bold mb-2 uppercase tracking-[0.1em]";

  return (
    <div className="flex flex-col min-h-screen relative bg-[var(--bg)]">
      <div className="absolute top-0 left-0 w-full h-96 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]/50 bg-[var(--surface)]/80 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/gc-control-9x7k/platform-seo")}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-[var(--border)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-white font-extrabold text-[15px] tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--gold)]" />
              {isEditing ? "Edit Platform SEO" : "New Platform SEO"}
            </h1>
            <p className="text-[var(--gold)] text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
              {isEditing ? "Modify Article" : "Create Article"}
            </p>
          </div>
          {saved && (
            <span className="ml-4 text-[var(--cyan)] text-[10px] font-bold uppercase tracking-[0.15em] bg-[var(--cyan)]/10 border border-[var(--border)] px-2.5 py-1 rounded-full animate-pulse">
              ✓ Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-[0.1em] rounded-sm border border-[var(--border)] transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !title.trim() || !content.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-black text-[11px] font-bold uppercase tracking-[0.1em] rounded-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Publish
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-sm text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full relative z-10">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter article title..."
              className={inputClass}
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelClass}>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="article-slug"
              className={inputClass}
            />
            {slug && (
              <p className="text-[10px] text-[var(--muted)] mt-1">
                Preview: globalchanakya.in/platformseo/{slug}
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className={labelClass}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article..."
              rows={3}
              className={inputClass + " resize-y"}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Platform Updates, Technology, Platform Guides"
              className={inputClass}
            />
          </div>

          {/* Content */}
          <div>
            <label className={labelClass}>Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content in Markdown..."
              rows={20}
              className={inputClass + " resize-y font-mono text-[12px] leading-relaxed"}
            />
          </div>

          {/* SEO Section */}
          <div className="bg-[var(--surface)] p-6 rounded-sm border border-[var(--border)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--gold)]" /> SEO Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to article title"
                  className={inputClass}
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">{(seoTitle || title).length}/70 characters</p>
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to excerpt"
                  rows={2}
                  className={inputClass + " resize-y"}
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">{(seoDescription || excerpt).length}/200 characters</p>
              </div>
              <div>
                <label className={labelClass}>Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="global chanakya, geopolitical analysis, strategic intelligence"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
