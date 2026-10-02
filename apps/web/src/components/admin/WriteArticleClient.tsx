"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────
const SITE_ORIGIN = "https://www.globalchanakya.in";

const CATEGORIES = [
  "Geopolitics", "Defence", "Economy", "Diplomacy",
  "Indo-Pacific", "South Asia", "Europe", "Middle East",
  "China", "Russia", "USA", "Energy", "Technology", "Analysis",
];

const REPORT_TYPES = ["Analysis", "Briefing", "Op-Ed", "Intelligence", "Report"];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "🌐 Public" },
  { value: "premium", label: "⭐ Premium (subscribers only)" },
  { value: "private", label: "🔒 Private (admin only)" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "📝 Draft" },
  { value: "published", label: "✅ Published" },
  { value: "archived", label: "📦 Archived" },
  { value: "scheduled", label: "📅 Scheduled" },
];

const ROBOTS_OPTIONS = [
  { value: "index,follow", label: "index, follow (default — recommended)" },
  { value: "noindex,follow", label: "noindex, follow — ⚠️ removed from search" },
  { value: "index,nofollow", label: "index, nofollow — links not passed" },
  { value: "noindex,nofollow", label: "noindex, nofollow — ⚠️ completely hidden" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  robots: string;
  ogImage: string;
  aiSummary: string;
  category: string;
  reportType: string;
  visibility: "public" | "premium" | "private";
  status: "draft" | "published" | "archived" | "scheduled";
  tags: string;
  isTrending: boolean;
  commentsEnabled: boolean;
  isBreaking: boolean;
  breakingUntil: string;
  isFeatured: boolean;
  featuredUntil: string;
  publishAt: string;
  unpublishAt: string;
  topics: string;
  countries: string;
  leaders: string;
  conflicts: string;
  organizations: string;
  references: string;
  featuredImageWidth?: number;
  featuredImageHeight?: number;
}

interface EntityOption { _id: string; name: string; }

interface SlugStatus { state: "idle" | "checking" | "available" | "taken" | "error"; message?: string; }

interface ValidationErrors {
  title?: string; slug?: string; excerpt?: string; content?: string; category?: string;
  canonicalUrl?: string; seoTitle?: string; seoDescription?: string;
  publishAt?: string; unpublishAt?: string; references?: string; featuredImage?: string;
  topics?: string;
}

interface PublishResult { id: string; slug: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toDatetimeLocal(val: string | Date | undefined | null): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

function isValidAbsoluteUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function WriteArticleClient({ authorId }: { authorId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // ─── UI State ──────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState<0 | 1 | 2 | 3>(0);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"code" | "preview">("code");
  const [showPrePublishChecklist, setShowPrePublishChecklist] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(!!editId);
  const [activeSection, setActiveSection] = useState<"identity" | "content" | "seo" | "settings">("identity");

  // ─── Slug state ────────────────────────────────────────────────────────────
  const slugManuallyEdited = useRef(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>({ state: "idle" });
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Validation ────────────────────────────────────────────────────────────
  const [frontendErrors, setFrontendErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // ─── Entity caches ─────────────────────────────────────────────────────────
  const [entityTopics, setEntityTopics] = useState<EntityOption[]>([]);
  const [entityCountries, setEntityCountries] = useState<EntityOption[]>([]);
  const [entityLeaders, setEntityLeaders] = useState<EntityOption[]>([]);
  const [entityConflicts, setEntityConflicts] = useState<EntityOption[]>([]);

  // ─── Form ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormData>({
    title: "", slug: "", excerpt: "", content: "", featuredImage: "",
    focusKeyword: "", seoTitle: "", seoDescription: "", seoKeywords: "",
    canonicalUrl: "", robots: "index,follow", ogImage: "", aiSummary: "",
    category: "Geopolitics", reportType: "",
    visibility: "public", status: "draft",
    tags: "", isTrending: false, commentsEnabled: true,
    isBreaking: false, breakingUntil: "",
    isFeatured: false, featuredUntil: "",
    publishAt: "", unpublishAt: "",
    topics: "", countries: "", leaders: "", conflicts: "", organizations: "",
    references: "",
    featuredImageWidth: 0,
    featuredImageHeight: 0,
  });

  // ─── Warn on unsaved leave ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // ─── Auto-slug from title ─────────────────────────────────────────────────
  useEffect(() => {
    if (!slugManuallyEdited.current) {
      const slug = slugify(form.title);
      setForm(prev => ({ ...prev, slug }));
    }
  }, [form.title]);

  // ─── Debounced slug-check ─────────────────────────────────────────────────
  useEffect(() => {
    if (!form.slug || form.slug.length < 3) {
      setSlugStatus({ state: "idle" });
      return;
    }
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    setSlugStatus({ state: "checking" });
    slugCheckTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug: form.slug });
        if (editId) params.set("excludeId", editId);
        const res = await fetch(`/api/admin/blogs/slug-check?${params}`);
        const data = await res.json();
        if (data.available) {
          setSlugStatus({ state: "available" });
        } else {
          setSlugStatus({ state: "taken", message: data.reason });
        }
      } catch {
        setSlugStatus({ state: "error", message: "Slug check failed" });
      }
    }, 600);
    return () => { if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current); };
  }, [form.slug, editId]);

  // ─── Fetch entities ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [tRes, cRes, lRes, coRes] = await Promise.allSettled([
          fetch("/api/admin/intelligence/topics").then(r => r.ok ? r.json() : []),
          fetch("/api/admin/intelligence/countries").then(r => r.ok ? r.json() : []),
          fetch("/api/admin/intelligence/leaders").then(r => r.ok ? r.json() : []),
          fetch("/api/admin/intelligence/conflicts").then(r => r.ok ? r.json() : []),
        ]);
        if (tRes.status === "fulfilled") setEntityTopics(tRes.value);
        if (cRes.status === "fulfilled") setEntityCountries(cRes.value);
        if (lRes.status === "fulfilled") setEntityLeaders(lRes.value);
        if (coRes.status === "fulfilled") setEntityConflicts(coRes.value);
      } catch { /* entities are optional */ }
    })();
  }, []);

  // ─── Load article for editing ──────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    setLoadingArticle(true);
    fetch(`/api/admin/blogs?id=${editId}`)
      .then(r => r.json())
      .then(blog => {
        if (blog) {
          slugManuallyEdited.current = true;
          setForm({
            title: blog.title ?? "",
            slug: blog.slug ?? "",
            excerpt: blog.excerpt ?? "",
            content: blog.content ?? "",
            featuredImage: blog.featuredImage ?? "",
            focusKeyword: blog.seo?.focusKeyword ?? "",
            seoTitle: blog.seo?.title ?? "",
            seoDescription: blog.seo?.description ?? "",
            seoKeywords: (blog.seo?.keywords ?? []).join(", "),
            canonicalUrl: blog.seo?.canonicalUrl ?? "",
            robots: blog.seo?.robots ?? "index,follow",
            ogImage: blog.ogImage ?? "",
            aiSummary: blog.aiSummary ?? "",
            category: blog.category ?? "Geopolitics",
            reportType: blog.reportType ?? "",
            visibility: blog.visibility ?? "public",
            status: blog.status ?? "draft",
            tags: (blog.tags ?? []).join(", "),
            isTrending: blog.isTrending ?? false,
            commentsEnabled: blog.commentsEnabled ?? true,
            isBreaking: blog.isBreaking ?? false,
            breakingUntil: toDatetimeLocal(blog.breakingUntil),
            isFeatured: blog.isFeatured ?? false,
            featuredUntil: toDatetimeLocal(blog.featuredUntil),
            publishAt: toDatetimeLocal(blog.publishAt),
            unpublishAt: toDatetimeLocal(blog.unpublishAt),
            topics: (blog.topics ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
            countries: (blog.countries ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
            leaders: (blog.leaders ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
            conflicts: (blog.conflicts ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
            organizations: (blog.organizations ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
            references: (blog.citations ?? []).map((c: any) => c.url || "").filter(Boolean).join("\n"),
            featuredImageWidth: blog.featuredImageWidth || 0,
            featuredImageHeight: blog.featuredImageHeight || 0,
          });
        }
      })
      .catch(() => { /* already loaded */ })
      .finally(() => setLoadingArticle(false));
  }, [editId]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!publishing) handlePublishClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, publishing]);

  // ─── Field update ──────────────────────────────────────────────────────────
  function update(field: keyof FormData, value: string | boolean) {
    if (field === "slug") slugManuallyEdited.current = true;
    setForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    setTouched(prev => new Set(prev).add(field));
  }

  // ─── Frontend validation ───────────────────────────────────────────────────
  function validate(forPublish: boolean): ValidationErrors {
    const errs: ValidationErrors = {};

    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.trim().length < 5) errs.title = "Title must be at least 5 characters";

    if (!form.slug.trim()) errs.slug = "Slug is required";
    else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(form.slug)) errs.slug = "Slug must be lowercase letters, numbers and hyphens only";

    if (!form.excerpt.trim()) errs.excerpt = "Excerpt is required";
    else if (form.excerpt.trim().length < 10) errs.excerpt = "Excerpt must be at least 10 characters";

    if (!form.content.trim()) errs.content = "Content is required";
    else if (form.content.trim().length < 50) errs.content = "Content is too short";

    if (!form.category) errs.category = "Category is required";

    if (form.canonicalUrl && !isValidAbsoluteUrl(form.canonicalUrl)) {
      errs.canonicalUrl = "Must be a valid absolute URL (https://...)";
    }

    if (form.unpublishAt && form.publishAt && new Date(form.unpublishAt) <= new Date(form.publishAt)) {
      errs.unpublishAt = "Unpublish date must be after publish date";
    }

    if (form.references) {
      const lines = form.references.split("\n").map(l => l.trim()).filter(Boolean);
      const badUrls = lines.filter(l => !isValidUrl(l));
      if (badUrls.length > 0) errs.references = `Invalid URL(s): ${badUrls.slice(0, 2).join(", ")}`;
    }

    if (forPublish) {
      if (form.featuredImage && !isValidAbsoluteUrl(form.featuredImage)) {
        errs.featuredImage = "Featured image must be a valid URL";
      }
      if (form.seoTitle && form.seoTitle.length > 70) {
        errs.seoTitle = "SEO title exceeds 70 characters";
      }
      if (form.seoDescription && form.seoDescription.length > 200) {
        errs.seoDescription = "Meta description exceeds 200 characters";
      }
      if (!form.topics || form.topics.trim().length === 0) {
        errs.topics = "At least one topic is required for publishing";
      }
    }

    return errs;
  }

  // ─── Build API payload ─────────────────────────────────────────────────────
  function buildPayload(publishNow: boolean) {
    const refsArray = form.references
      .split("\n").map(r => r.trim()).filter(Boolean)
      .map(url => ({ type: "Primary" as const, source: url, url }));

    return {
      id: editId ?? undefined,
      // authorId intentionally not sent — server uses session
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      category: form.category,
      featuredImage: form.featuredImage || "",
      ogImage: form.ogImage || "",
      aiSummary: form.aiSummary || "",
      reportType: form.reportType || undefined,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      visibility: form.visibility,
      status: publishNow ? "published" : form.status,
      isTrending: form.isTrending,
      commentsEnabled: form.commentsEnabled,
      isBreaking: form.isBreaking,
      breakingUntil: form.breakingUntil || undefined,
      isFeatured: form.isFeatured,
      featuredUntil: form.featuredUntil || undefined,
      publishAt: form.publishAt || undefined,
      unpublishAt: form.unpublishAt || undefined,
      topics: form.topics.split(",").map(s => s.trim()).filter(Boolean),
      countries: form.countries.split(",").map(s => s.trim()).filter(Boolean),
      leaders: form.leaders.split(",").map(s => s.trim()).filter(Boolean),
      conflicts: form.conflicts.split(",").map(s => s.trim()).filter(Boolean),
      organizations: form.organizations.split(",").map(s => s.trim()).filter(Boolean),
      citations: refsArray,
      featuredImageWidth: form.featuredImageWidth || undefined,
      featuredImageHeight: form.featuredImageHeight || undefined,
      seo: {
        focusKeyword: form.focusKeyword || "",
        title: form.seoTitle || form.title,
        description: form.seoDescription || form.excerpt,
        keywords: form.seoKeywords.split(",").map(k => k.trim()).filter(Boolean),
        canonicalUrl: form.canonicalUrl || `${SITE_ORIGIN}/blogs/${form.slug}`,
        robots: form.robots || "index,follow",
      },
    };
  }

  // ─── Save Draft ────────────────────────────────────────────────────────────
  async function handleSave(publishNow: boolean) {
    const errs = validate(publishNow);
    if (Object.keys(errs).length > 0) {
      setFrontendErrors(errs);
      // Mark all errored fields as touched so errors are visible
      setTouched(new Set(Object.keys(errs)));
      if (!publishNow) {
        // For draft saves, only block on critical fields
        if (errs.title || errs.slug) return;
      } else {
        return;
      }
    }

    setSaving(true);
    setSaveState("saving");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const payload = buildPayload(false);
      const res = await fetch("/api/admin/blogs", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        // If new article, switch to edit mode
        if (!editId && data.id) {
          const url = new URL(window.location.href);
          url.searchParams.set("edit", data.id);
          window.history.replaceState({}, "", url.toString());
        }
        setSaveState("saved");
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        const errBody = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        setSaveState("error");
        const errorMsg = errBody.details
          ? `${errBody.error}\n\nDetails:\n• ${Array.isArray(errBody.details) ? errBody.details.join("\n• ") : JSON.stringify(errBody.details)}`
          : errBody.error || `Server error ${res.status}`;
        alert(`❌ Save Failed:\n\n${errorMsg}`);
        setTimeout(() => setSaveState("idle"), 3000);
      }
    } catch (err: any) {
      setSaveState("error");
      const msg = err?.name === "AbortError"
        ? "Request timed out (45s). Please try again."
        : "Network error. Check your connection and retry.";
      alert(`❌ ${msg}`);
      setTimeout(() => setSaveState("idle"), 3000);
    } finally {
      clearTimeout(timeout);
      setSaving(false);
    }
  }

  // ─── Publish flow ──────────────────────────────────────────────────────────
  function handlePublishClick() {
    const errs = validate(true);
    setFrontendErrors(errs);
    setTouched(new Set([...Object.keys(errs), ...Array.from(touched)]));

    if (Object.keys(errs).length > 0 || slugStatus.state === "taken") {
      setShowPrePublishChecklist(true);
      return;
    }

    setShowPrePublishChecklist(true);
  }

  async function confirmPublish() {
    setShowPrePublishChecklist(false);
    setPublishError(null);
    setPublishResult(null);
    setPublishing(true);
    setPublishStep(1);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const stepTimer = setTimeout(() => setPublishStep(2), 1800);

    try {
      const payload = buildPayload(true);
      const res = await fetch("/api/admin/blogs", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(stepTimer);

      if (res.ok) {
        const data = await res.json();
        setPublishStep(3);
        setPublishResult({ id: data.id || editId || "", slug: payload.slug });
        setHasUnsavedChanges(false);
      } else {
        const errBody = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        const errorMsg = errBody.details
          ? `${errBody.error}\n\n${Array.isArray(errBody.details) ? errBody.details.join("\n") : JSON.stringify(errBody.details)}`
          : errBody.error || `Server error ${res.status}`;
        setPublishError(errorMsg);
        setPublishing(false);
        setPublishStep(0);
      }
    } catch (err: any) {
      clearTimeout(stepTimer);
      const msg = err?.name === "AbortError"
        ? "Request timed out (45s). Please try again."
        : "Network error. Check your connection.";
      setPublishError(msg);
      setPublishing(false);
      setPublishStep(0);
    } finally {
      clearTimeout(timeout);
    }
  }

  // ─── Computed ──────────────────────────────────────────────────────────────
  const plainText = form.content.replace(/<[^>]*>/g, " ");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const charCount = form.content.length;
  const hasH2OrH3 = /<h[2-3]/i.test(form.content);

  // SEO checks
  const seoTitleLen = (form.seoTitle || form.title).length;
  const seoDescLen = (form.seoDescription || form.excerpt).length;

  // Pre-publish checklist items
  const checks = {
    title: !!form.title && form.title.length >= 15,
    slug: !!form.slug && form.slug.length >= 5 && slugStatus.state !== "taken",
    excerpt: !!form.excerpt && form.excerpt.length >= 10,
    content: !!form.content && form.content.length >= 300 && hasH2OrH3,
    featuredImage: !!form.featuredImage,
    category: !!form.category,
    topics: form.topics.split(",").map(s => s.trim()).filter(Boolean).length > 0,
    tags: form.tags.split(",").map(t => t.trim()).filter(Boolean).length > 0,
    seoTitle: seoTitleLen >= 10 && seoTitleLen <= 70,
    seoDesc: seoDescLen >= 50 && seoDescLen <= 200,
    canonical: !form.canonicalUrl || isValidAbsoluteUrl(form.canonicalUrl),
    robots: !!form.robots,
    noindex: !form.robots.includes("noindex"),
  };
  const errorsExist = Object.keys(validate(true)).length > 0 || slugStatus.state === "taken";

  // ─── Style constants ───────────────────────────────────────────────────────
  const inputClass = "w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cyan)]/40 focus:bg-white/8 transition-all";
  const labelClass = "block text-[11px] text-gray-400 font-semibold mb-1.5 uppercase tracking-widest";
  const errorClass = "text-red-400 text-xs mt-1";
  const selectBg = "bg-[#0d0d17]";

  function fieldError(field: keyof ValidationErrors) {
    if (!touched.has(field)) return null;
    return frontendErrors[field] ? (
      <p className={errorClass} role="alert">⚠ {frontendErrors[field]}</p>
    ) : null;
  }

  function mark(field: string) {
    setTouched(prev => new Set(prev).add(field));
  }

  // ─── Section nav ───────────────────────────────────────────────────────────
  const sections = [
    { id: "identity", label: "Identity", dot: "bg-[var(--gold)]" },
    { id: "content", label: "Content", dot: "bg-[var(--cyan)]" },
    { id: "seo", label: "SEO", dot: "bg-blue-500" },
    { id: "settings", label: "Settings", dot: "bg-emerald-500" },
  ] as const;

  if (loadingArticle) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading article…</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full relative bg-[#080812]">

      {/* ═══════ Publishing Overlay ═══════ */}
      {publishing && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0d17] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            {publishStep < 3 ? (
              <>
                <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl bg-amber-500/20 border border-amber-500/30">
                  {publishStep === 1 && "💾"}
                  {publishStep === 2 && <span className="animate-spin inline-block text-2xl">⚙</span>}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {publishStep === 1 && "Saving Article…"}
                  {publishStep === 2 && "Running Publish Pipeline…"}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {publishStep === 1 && "Persisting to database"}
                  {publishStep === 2 && "SEO enrichment · Embedding · Cache invalidation"}
                </p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${publishStep >= s ? "w-8 bg-amber-500" : "w-4 bg-white/10"}`} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl bg-green-500/20 border border-green-500/30">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">Published!</h3>
                <p className="text-gray-400 text-sm mb-1">Your article is now live</p>
                {publishResult && (
                  <a
                    href={`${SITE_ORIGIN}/blogs/${publishResult.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-[var(--cyan)] hover:underline break-all"
                  >
                    {SITE_ORIGIN}/blogs/{publishResult.slug}
                  </a>
                )}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  {publishResult && (
                    <a
                      href={`${SITE_ORIGIN}/blogs/${publishResult.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-[var(--cyan)] text-black text-sm font-bold rounded-lg text-center hover:opacity-90 transition-opacity"
                    >
                      Open Article ↗
                    </a>
                  )}
                  <button
                    onClick={() => router.push("/gc-control-9x7k/blogs")}
                    className="flex-1 py-2.5 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/15 transition-colors"
                  >
                    Back to Articles
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════ Publish Error (preserved data) ═══════ */}
      {publishError && !publishing && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3">
          <p className="text-red-400 text-sm font-medium">❌ Publish failed — your data is preserved</p>
          <p className="text-red-400/70 text-xs mt-0.5 whitespace-pre-line">{publishError}</p>
          <button onClick={() => setPublishError(null)} className="text-red-400/60 text-xs mt-1 hover:text-red-400 underline">Dismiss</button>
        </div>
      )}

      {/* ═══════ Pre-Publish Checklist Modal ═══════ */}
      {showPrePublishChecklist && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d17] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span className="text-amber-400">📋</span> Pre-Publish Checklist
            </h3>

            <div className="space-y-4">
              <ChecklistSection title="Content">
                <CheckItem ok={checks.title} label="Title (≥ 15 chars)" />
                <CheckItem ok={checks.excerpt} label="Excerpt (≥ 10 chars)" />
                <CheckItem ok={checks.content} label="Content (≥ 300 chars + at least one H2/H3)" />
                <CheckItem ok={checks.featuredImage} label="Featured Image URL" warning={!checks.featuredImage} />
              </ChecklistSection>

              <ChecklistSection title="SEO">
                <CheckItem ok={checks.slug} label={slugStatus.state === "taken" ? "Slug — ⚠ TAKEN" : "Slug (unique, ≥ 5 chars)"} />
                <CheckItem ok={checks.seoTitle} label={`SEO Title (${seoTitleLen} chars, ideal 10–70)`} warning={seoTitleLen > 70} />
                <CheckItem ok={checks.seoDesc} label={`Meta Description (${seoDescLen} chars, ideal 50–200)`} warning={seoDescLen > 200} />
                <CheckItem ok={checks.canonical} label="Canonical URL (valid or empty)" />
                <CheckItem ok={checks.noindex} label="Robots: indexable" warning={!checks.noindex} warningMsg="noindex is set — article will NOT appear in search" />
              </ChecklistSection>

              <ChecklistSection title="Discovery">
                <CheckItem ok={checks.category} label="Category" />
                <CheckItem ok={checks.topics} label="At least one Topic (Entities)" />
                <CheckItem ok={checks.tags} label="At least one tag" />
                <CheckItem ok={checks.robots} label="Robots directive set" />
              </ChecklistSection>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {!errorsExist ? (
                <button
                  onClick={confirmPublish}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-all"
                >
                  🚀 Confirm Publish
                </button>
              ) : (
                <div className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg text-center">
                  ⚠ Fix errors before publishing
                </div>
              )}
              <button
                onClick={() => setShowPrePublishChecklist(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-lg transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Top Bar ═══════ */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#0a0a14] sticky top-0 z-20 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              if (hasUnsavedChanges && !confirm("You have unsaved changes. Leave anyway?")) return;
              router.push("/gc-control-9x7k/blogs");
            }}
            className="text-gray-500 hover:text-white transition-colors text-sm shrink-0"
            aria-label="Back to articles"
          >
            ← Back
          </button>
          <div className="h-4 w-px bg-white/10 shrink-0" />
          <h1 className="text-white font-semibold text-sm truncate">
            {editId ? "Edit Article" : "New Article"}
          </h1>
          {hasUnsavedChanges && <span className="text-amber-400/70 text-xs shrink-0">● Unsaved</span>}
        </div>

        {/* Save state indicator */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {saveState === "saved" && (
            <span className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Saved {lastSaved ? lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
            </span>
          )}
          {saveState === "error" && (
            <span className="text-red-400 text-xs">Save failed</span>
          )}

          <button
            id="btn-save-draft"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 bg-white/8 hover:bg-white/12 text-white text-xs font-medium rounded-lg border border-white/10 transition-all disabled:opacity-50 flex items-center gap-1.5"
            aria-label="Save as draft (Ctrl+S)"
          >
            {saving && saveState === "saving" ? (
              <><span className="w-3 h-3 border border-white/40 border-t-white/90 rounded-full animate-spin" />Saving…</>
            ) : (
              <><span>💾</span> Save Draft</>
            )}
          </button>
          <button
            id="btn-publish"
            onClick={handlePublishClick}
            disabled={saving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all disabled:opacity-50"
            aria-label="Publish article (Ctrl+Enter)"
          >
            🚀 Publish
          </button>
        </div>
      </div>

      {/* ═══════ Section Nav ═══════ */}
      <div className="flex border-b border-white/8 bg-[#0a0a14] overflow-x-auto sticky top-[57px] z-10">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSection(s.id);
              document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
              activeSection === s.id
                ? "border-[var(--cyan)] text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </button>
        ))}
      </div>

      {/* ═══════ Main Scroll Area ═══════ */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

            {/* ══════════════════════════════════════════
                SECTION: ARTICLE IDENTITY
                ══════════════════════════════════════════ */}
            <section id="section-identity" className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-white/10 bg-white/4">
                <h2 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                  Article Identity
                </h2>
              </div>
              <div className="p-6 space-y-5">

                {/* Title */}
                <div>
                  <label htmlFor="field-title" className={labelClass}>Article Title <span className="text-red-400">*</span></label>
                  <input
                    id="field-title"
                    type="text"
                    placeholder="e.g. India-China Border Tensions: A Strategic Analysis"
                    value={form.title}
                    onChange={e => update("title", e.target.value)}
                    onBlur={() => mark("title")}
                    className={`${inputClass} text-base font-medium ${touched.has("title") && frontendErrors.title ? "border-red-500/50" : ""}`}
                    aria-describedby={frontendErrors.title ? "title-error" : undefined}
                  />
                  {fieldError("title")}
                  <p className="text-gray-600 text-xs mt-1">{form.title.length} chars · {form.title.length < 15 ? <span className="text-amber-500/70">min 15 for publishing</span> : <span className="text-green-500/70">✓ length OK</span>}</p>
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="field-slug" className={labelClass}>URL Slug</label>
                  <div className="flex items-stretch gap-0 rounded-lg overflow-hidden border border-white/10 focus-within:border-[var(--cyan)]/40 transition-all">
                    <span className="flex items-center px-3 bg-white/4 text-gray-500 text-xs font-mono border-r border-white/10 whitespace-nowrap shrink-0">/blogs/</span>
                    <input
                      id="field-slug"
                      type="text"
                      value={form.slug}
                      onChange={e => { slugManuallyEdited.current = true; update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }}
                      onBlur={() => mark("slug")}
                      className="flex-1 px-3 py-2.5 bg-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:bg-white/8 transition-all font-mono"
                      placeholder="article-url-slug"
                    />
                    <div className="flex items-center px-3 bg-white/4 border-l border-white/10">
                      {slugStatus.state === "checking" && <span className="w-3 h-3 border border-gray-400 border-t-white rounded-full animate-spin" />}
                      {slugStatus.state === "available" && <span className="text-green-400 text-xs font-bold">✓</span>}
                      {slugStatus.state === "taken" && <span className="text-red-400 text-xs font-bold">✗</span>}
                    </div>
                  </div>
                  {slugStatus.state === "taken" && (
                    <p className="text-red-400 text-xs mt-1">⚠ {slugStatus.message}</p>
                  )}
                  {slugStatus.state === "available" && (
                    <p className="text-green-400/70 text-xs mt-1">✓ Slug is available</p>
                  )}
                  {!slugManuallyEdited.current && form.slug && (
                    <p className="text-gray-600 text-xs mt-1">Auto-generated · <button type="button" onClick={() => { slugManuallyEdited.current = true; }} className="text-[var(--cyan)]/60 hover:text-[var(--cyan)] underline">Edit manually</button></p>
                  )}
                  {fieldError("slug")}
                  {/* URL preview */}
                  {form.slug && (
                    <p className="text-gray-600 text-xs mt-2 font-mono break-all">
                      Preview: <span className="text-gray-400">{SITE_ORIGIN}/blogs/<span className="text-white">{form.slug}</span></span>
                    </p>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <div className="flex items-end justify-between mb-1.5">
                    <label htmlFor="field-excerpt" className={`${labelClass} mb-0`}>Excerpt <span className="text-red-400">*</span></label>
                    <span className={`text-[10px] font-bold ${form.excerpt.length > 300 ? "text-amber-400" : "text-gray-600"}`}>{form.excerpt.length}/300</span>
                  </div>
                  <textarea
                    id="field-excerpt"
                    rows={3}
                    placeholder="Short summary shown on article cards and homepage…"
                    value={form.excerpt}
                    onChange={e => update("excerpt", e.target.value)}
                    onBlur={() => mark("excerpt")}
                    className={`${inputClass} resize-none ${touched.has("excerpt") && frontendErrors.excerpt ? "border-red-500/50" : ""}`}
                  />
                  {fieldError("excerpt")}
                </div>

                {/* Featured Image */}
                <div>
                  <label htmlFor="field-featuredImage" className={labelClass}>Featured Image URL</label>
                  <input
                    id="field-featuredImage"
                    type="url"
                    placeholder="https://example.com/image.jpg (required for publishing)"
                    value={form.featuredImage}
                    onChange={e => {
                      update("featuredImage", e.target.value);
                      if (e.target.value && isValidAbsoluteUrl(e.target.value)) {
                        const img = new window.Image();
                        img.onload = () => {
                          setForm(prev => ({ ...prev, featuredImageWidth: img.width, featuredImageHeight: img.height }));
                        };
                        img.src = e.target.value;
                      }
                    }}
                    onBlur={() => mark("featuredImage")}
                    className={`${inputClass} ${touched.has("featuredImage") && frontendErrors.featuredImage ? "border-red-500/50" : ""}`}
                  />
                  {fieldError("featuredImage")}
                  {form.featuredImage && isValidAbsoluteUrl(form.featuredImage) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.featuredImage}
                      alt="Featured image preview"
                      loading="lazy"
                      className="mt-3 rounded-xl max-h-48 w-auto object-cover border border-white/10"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════
                SECTION: CONTENT
                ══════════════════════════════════════════ */}
            <section id="section-content" className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-white/10 bg-white/4 flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--cyan)]" />
                  Article Content
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-gray-500 text-xs hidden sm:flex items-center gap-2">
                    <span>{wordCount.toLocaleString()} words</span>
                    <span>·</span>
                    <span>~{readTime} min read</span>
                    <span>·</span>
                    <span className={hasH2OrH3 ? "text-green-400/70" : "text-amber-400/70"}>{hasH2OrH3 ? "✓ Has headings" : "⚠ No H2/H3"}</span>
                  </div>
                  <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setEditorMode("code")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${editorMode === "code" ? "bg-[var(--cyan)] text-black" : "text-gray-400 hover:text-white"}`}
                    >
                      &lt;/&gt; Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("preview")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${editorMode === "preview" ? "bg-[var(--cyan)] text-black" : "text-gray-400 hover:text-white"}`}
                    >
                      👁 Preview
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {editorMode === "code" ? (
                  <>
                    <textarea
                      id="field-content"
                      rows={30}
                      spellCheck={false}
                      placeholder={`Write full HTML content:\n\n<h2>Section Title</h2>\n<p>Your paragraph here...</p>\n\n<h3>Sub-section</h3>\n<p>More content...</p>`}
                      value={form.content}
                      onChange={e => update("content", e.target.value)}
                      onBlur={() => mark("content")}
                      className={`${inputClass} font-mono text-sm leading-relaxed resize-y bg-[#080812] ${touched.has("content") && frontendErrors.content ? "border-red-500/50" : ""}`}
                      style={{ minHeight: "520px", tabSize: 2 }}
                      onKeyDown={e => {
                        if (e.key === "Tab") {
                          e.preventDefault();
                          const s = e.currentTarget.selectionStart;
                          const end = e.currentTarget.selectionEnd;
                          const val = e.currentTarget.value;
                          update("content", val.substring(0, s) + "  " + val.substring(end));
                          requestAnimationFrame(() => {
                            e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2;
                          });
                        }
                      }}
                    />
                    {fieldError("content")}
                    <div className="flex items-center gap-4 mt-2 px-1 text-xs text-gray-600">
                      <span>{charCount.toLocaleString()} chars</span>
                      <span>{form.content.length >= 300 ? <span className="text-green-400/60">✓ Length OK</span> : <span className="text-amber-400/60">⚠ Min 300 chars for publish</span>}</span>
                      <span className="hidden sm:inline">Tab = 2 spaces · HTML</span>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-white/10" style={{ minHeight: "560px" }}>
                    {form.content ? (
                      <iframe
                        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#fff;color:#111;font-family:Georgia,serif;font-size:17px;line-height:1.8;padding:24px 32px;max-width:800px;margin:0 auto;}h1,h2,h3,h4{font-family:-apple-system,sans-serif;font-weight:700;margin-top:1.5em;line-height:1.3;}h2{font-size:1.4em;}h3{font-size:1.2em;}a{color:#ef4444;}blockquote{border-left:4px solid #ef4444;margin:1.5em 0;padding:12px 20px;background:#fff5f5;border-radius:0 8px 8px 0;font-style:italic;color:#555;}ul,ol{padding-left:1.5em;}img{max-width:100%;border-radius:8px;}p{margin-bottom:1em;}</style></head><body>${form.content}</body></html>`}
                        className="w-full bg-white"
                        style={{ minHeight: "560px", height: "560px" }}
                        title="Article Preview"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="flex items-center justify-center bg-white/3 text-gray-500 text-sm font-medium" style={{ minHeight: "560px" }}>
                        Write HTML content in Code mode to see preview
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ══════════════════════════════════════════
                SECTION: SEO & METADATA
                ══════════════════════════════════════════ */}
            <section id="section-seo" className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-white/10 bg-white/4">
                <h2 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Search &amp; Metadata
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    {/* Focus Keyword */}
                    <div>
                      <label htmlFor="field-focusKeyword" className={labelClass}>Focus Keyword</label>
                      <input id="field-focusKeyword" type="text" placeholder="Primary keyword for this article" value={form.focusKeyword} onChange={e => update("focusKeyword", e.target.value)} className={inputClass} />
                      <p className="text-gray-600 text-xs mt-1">Max 5% density in content is enforced server-side</p>
                    </div>

                    {/* SEO Title */}
                    <div>
                      <div className="flex items-end justify-between mb-1.5">
                        <label htmlFor="field-seoTitle" className={`${labelClass} mb-0`}>SEO / Meta Title</label>
                        <span className={`text-[10px] font-bold ${seoTitleLen > 70 ? "text-red-400" : seoTitleLen > 60 ? "text-amber-400" : "text-gray-600"}`}>{seoTitleLen}/70</span>
                      </div>
                      <input
                        id="field-seoTitle"
                        type="text"
                        placeholder="Title shown in Google (blank = article title)"
                        value={form.seoTitle}
                        onChange={e => update("seoTitle", e.target.value)}
                        onBlur={() => mark("seoTitle")}
                        className={`${inputClass} ${touched.has("seoTitle") && frontendErrors.seoTitle ? "border-red-500/50" : ""}`}
                      />
                      <div className="mt-1.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className={`h-full transition-all ${seoTitleLen > 70 ? "bg-red-500" : seoTitleLen > 60 ? "bg-amber-500" : seoTitleLen > 0 ? "bg-green-500" : "bg-transparent"}`}
                          style={{ width: `${Math.min((seoTitleLen / 70) * 100, 100)}%` }} />
                      </div>
                      {seoTitleLen > 70 && <p className="text-amber-400/80 text-xs mt-1">⚠ Title may be truncated in search results</p>}
                      {fieldError("seoTitle")}
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-end justify-between mb-1.5">
                        <label htmlFor="field-seoDescription" className={`${labelClass} mb-0`}>Meta Description</label>
                        <span className={`text-[10px] font-bold ${seoDescLen > 200 ? "text-red-400" : seoDescLen > 160 ? "text-amber-400" : "text-gray-600"}`}>{seoDescLen}/200</span>
                      </div>
                      <textarea
                        id="field-seoDescription"
                        rows={3}
                        placeholder="Shown in Google search results (blank = excerpt)…"
                        value={form.seoDescription}
                        onChange={e => update("seoDescription", e.target.value)}
                        onBlur={() => mark("seoDescription")}
                        className={`${inputClass} resize-none ${touched.has("seoDescription") && frontendErrors.seoDescription ? "border-red-500/50" : ""}`}
                      />
                      <div className="mt-1.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className={`h-full transition-all ${seoDescLen > 200 ? "bg-red-500" : seoDescLen > 160 ? "bg-amber-500" : seoDescLen > 0 ? "bg-green-500" : "bg-transparent"}`}
                          style={{ width: `${Math.min((seoDescLen / 200) * 100, 100)}%` }} />
                      </div>
                      {seoDescLen > 0 && seoDescLen < 50 && <p className="text-amber-400/70 text-xs mt-1">⚠ Too short for SEO preflight (min 50)</p>}
                      {fieldError("seoDescription")}
                    </div>

                    {/* SEO Keywords */}
                    <div>
                      <label htmlFor="field-seoKeywords" className={labelClass}>SEO Keywords <span className="text-gray-500 normal-case">(comma separated)</span></label>
                      <input id="field-seoKeywords" type="text" placeholder="india china, geopolitics, defence" value={form.seoKeywords} onChange={e => update("seoKeywords", e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Canonical URL */}
                    <div>
                      <label htmlFor="field-canonical" className={labelClass}>Canonical URL</label>
                      <input
                        id="field-canonical"
                        type="url"
                        placeholder={`${SITE_ORIGIN}/blogs/${form.slug || "your-slug"}`}
                        value={form.canonicalUrl}
                        onChange={e => update("canonicalUrl", e.target.value)}
                        onBlur={() => mark("canonicalUrl")}
                        className={`${inputClass} ${touched.has("canonicalUrl") && frontendErrors.canonicalUrl ? "border-red-500/50" : ""}`}
                      />
                      {fieldError("canonicalUrl")}
                      <p className="text-gray-600 text-xs mt-1">
                        Leave blank to auto-set: <span className="font-mono text-gray-500">{SITE_ORIGIN}/blogs/{form.slug || "slug"}</span>
                      </p>
                      {form.canonicalUrl && isValidAbsoluteUrl(form.canonicalUrl) && !form.canonicalUrl.includes("globalchanakya.in") && (
                        <p className="text-amber-400/80 text-xs mt-1">⚠ Canonical points outside globalchanakya.in — confirm this is intentional</p>
                      )}
                    </div>

                    {/* Robots */}
                    <div>
                      <label htmlFor="field-robots" className={labelClass}>Robots Directive</label>
                      <select id="field-robots" value={form.robots} onChange={e => update("robots", e.target.value)} className={inputClass}>
                        {ROBOTS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value} className={selectBg}>{o.label}</option>
                        ))}
                      </select>
                      {form.robots.includes("noindex") && (
                        <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-red-400 text-xs font-medium">⚠ noindex — this article will NOT appear in Google search results</p>
                        </div>
                      )}
                    </div>

                    {/* OG Image */}
                    <div>
                      <label htmlFor="field-ogImage" className={labelClass}>OG Image URL <span className="text-gray-500 normal-case">(social sharing)</span></label>
                      <input id="field-ogImage" type="url" placeholder="Defaults to Featured Image" value={form.ogImage} onChange={e => update("ogImage", e.target.value)} className={inputClass} />
                    </div>

                    {/* AI Summary */}
                    <div>
                      <label htmlFor="field-aiSummary" className={labelClass}>AI Summary <span className="text-gray-500 normal-case">(optional)</span></label>
                      <textarea id="field-aiSummary" rows={3} placeholder="AI-generated summary of the article" value={form.aiSummary} onChange={e => update("aiSummary", e.target.value)} className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════
                SECTION: SETTINGS
                ══════════════════════════════════════════ */}
            <section id="section-settings" className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-white/10 bg-white/4">
                <h2 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Editor Settings &amp; Classification
                </h2>
              </div>

              <div className="p-6 space-y-8">
                {/* Row 1: Status, Visibility, Category, Report Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label htmlFor="field-status" className={labelClass}>Status</label>
                    <select id="field-status" value={form.status} onChange={e => update("status", e.target.value as FormData["status"])} className={inputClass}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className={selectBg}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="field-visibility" className={labelClass}>Visibility</label>
                    <select id="field-visibility" value={form.visibility} onChange={e => update("visibility", e.target.value as FormData["visibility"])} className={inputClass}>
                      {VISIBILITY_OPTIONS.map(v => <option key={v.value} value={v.value} className={selectBg}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="field-category" className={labelClass}>Category <span className="text-red-400">*</span></label>
                    <select
                      id="field-category"
                      value={form.category}
                      onChange={e => update("category", e.target.value)}
                      onBlur={() => mark("category")}
                      className={`${inputClass} ${touched.has("category") && frontendErrors.category ? "border-red-500/50" : ""}`}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className={selectBg}>{c}</option>)}
                    </select>
                    {fieldError("category")}
                  </div>
                  <div>
                    <label htmlFor="field-reportType" className={labelClass}>Report Type</label>
                    <select id="field-reportType" value={form.reportType} onChange={e => update("reportType", e.target.value)} className={inputClass}>
                      <option value="" className={selectBg}>— Select —</option>
                      {REPORT_TYPES.map(rt => <option key={rt} value={rt} className={selectBg}>{rt}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Scheduling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="field-publishAt" className={labelClass}>Publish Date</label>
                    <input
                      id="field-publishAt"
                      type="datetime-local"
                      value={form.publishAt}
                      onChange={e => update("publishAt", e.target.value)}
                      onBlur={() => mark("publishAt")}
                      className={inputClass}
                    />
                    {fieldError("publishAt")}
                  </div>
                  <div>
                    <label htmlFor="field-unpublishAt" className={labelClass}>Unpublish Date</label>
                    <input
                      id="field-unpublishAt"
                      type="datetime-local"
                      value={form.unpublishAt}
                      onChange={e => update("unpublishAt", e.target.value)}
                      onBlur={() => mark("unpublishAt")}
                      className={`${inputClass} ${touched.has("unpublishAt") && frontendErrors.unpublishAt ? "border-red-500/50" : ""}`}
                    />
                    {fieldError("unpublishAt")}
                  </div>
                </div>

                {/* Row 3: Tags + References */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="field-tags" className={labelClass}>Tags <span className="text-gray-500 normal-case">(comma separated)</span></label>
                    <input
                      id="field-tags"
                      type="text"
                      placeholder="india, china, defence"
                      value={form.tags}
                      onChange={e => update("tags", e.target.value)}
                      className={inputClass}
                    />
                    {form.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-bold tracking-wider rounded-md border border-amber-500/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="field-references" className={labelClass}>References <span className="text-gray-500 normal-case">(one URL per line)</span></label>
                    <textarea
                      id="field-references"
                      rows={3}
                      placeholder={"https://source1.com/article\nhttps://source2.org/report"}
                      value={form.references}
                      onChange={e => update("references", e.target.value)}
                      onBlur={() => mark("references")}
                      className={`${inputClass} font-mono text-xs resize-none ${touched.has("references") && frontendErrors.references ? "border-red-500/50" : ""}`}
                    />
                    {fieldError("references")}
                  </div>
                </div>

                {/* Row 4: Toggles */}
                <div>
                  <p className={`${labelClass} mb-3`}>Article Flags</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { key: "isTrending", label: "🔥 Trending" },
                      { key: "commentsEnabled", label: "💬 Comments" },
                      { key: "isBreaking", label: "🚨 Breaking" },
                      { key: "isFeatured", label: "⭐ Featured" },
                    ] as { key: keyof FormData; label: string }[]).map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        role="switch"
                        aria-checked={!!form[key]}
                        onClick={() => update(key, !form[key])}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          form[key]
                            ? "bg-[var(--cyan)]/10 border-[var(--cyan)]/30 text-[var(--cyan)]"
                            : "bg-white/3 border-white/8 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <div className={`w-8 h-4 rounded-full relative transition-all ${form[key] ? "bg-[var(--cyan)]" : "bg-white/10"}`}>
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all shadow ${form[key] ? "translate-x-4" : ""}`} />
                        </div>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Conditional date fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                    {form.isBreaking && (
                      <div>
                        <label htmlFor="field-breakingUntil" className={labelClass}>Breaking Until</label>
                        <input id="field-breakingUntil" type="datetime-local" value={form.breakingUntil} onChange={e => update("breakingUntil", e.target.value)} className={inputClass} />
                      </div>
                    )}
                    {form.isFeatured && (
                      <div>
                        <label htmlFor="field-featuredUntil" className={labelClass}>Featured Until</label>
                        <input id="field-featuredUntil" type="datetime-local" value={form.featuredUntil} onChange={e => update("featuredUntil", e.target.value)} className={inputClass} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 5: Entity selectors */}
                <div>
                  <p className={`${labelClass} mb-4`}>Linked Entities <span className="text-red-400">*</span></p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <EntitySelector
                        label="Topic"
                        entities={entityTopics}
                        value={form.topics}
                        onChange={v => update("topics", v)}
                        color="blue"
                      />
                      {fieldError("topics")}
                    </div>
                    <EntitySelector
                      label="Country"
                      entities={entityCountries}
                      value={form.countries}
                      onChange={v => update("countries", v)}
                      color="blue"
                    />
                    <EntitySelector
                      label="Leader"
                      entities={entityLeaders}
                      value={form.leaders}
                      onChange={v => update("leaders", v)}
                      color="purple"
                    />
                    <EntitySelector
                      label="Conflict"
                      entities={entityConflicts}
                      value={form.conflicts}
                      onChange={v => update("conflicts", v)}
                      color="red"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom save button (mobile convenience) */}
            <div className="flex gap-3 pb-8">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 py-3 bg-white/8 hover:bg-white/12 text-white text-sm font-medium rounded-xl border border-white/10 transition-all disabled:opacity-50"
              >
                {saving ? "Saving…" : "💾 Save Draft"}
              </button>
              <button
                onClick={handlePublishClick}
                disabled={saving}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              >
                🚀 Publish
              </button>
            </div>
          </div>
        </div>

        {/* ═══════ Right Sidebar (desktop only) ═══════ */}
        <aside className="w-52 border-l border-white/8 p-4 overflow-y-auto bg-[#0a0a14] hidden xl:block flex-shrink-0">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Article Stats</p>
          <div className="space-y-3 text-xs">
            <StatRow label="Status" value={
              <span className={`px-2 py-0.5 rounded-full text-[10px] capitalize border ${
                form.status === "published"
                  ? "bg-green-500/15 text-green-300 border-green-500/25"
                  : form.status === "draft"
                  ? "bg-gray-500/15 text-gray-300 border-gray-500/25"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/25"
              }`}>{form.status}</span>
            } />
            <StatRow label="Word Count" value={wordCount.toLocaleString()} />
            <StatRow label="Read Time" value={`~${readTime} min`} />
            <StatRow label="Excerpt" value={`${form.excerpt.length}/300`} />
            {form.focusKeyword && <StatRow label="Keyword" value={<span className="text-amber-300">{form.focusKeyword}</span>} />}
            <StatRow label="Category" value={form.category} />
            <StatRow label="Visibility" value={form.visibility} />
            <div className="pt-2 mt-2 border-t border-white/8">
              <div className="space-y-1">
                <div className={`flex items-center gap-1.5 text-[10px] ${checks.title ? "text-green-400/70" : "text-gray-600"}`}>
                  <span>{checks.title ? "✓" : "○"}</span> Title
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] ${checks.content ? "text-green-400/70" : "text-gray-600"}`}>
                  <span>{checks.content ? "✓" : "○"}</span> Content
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] ${checks.seoTitle ? "text-green-400/70" : "text-gray-600"}`}>
                  <span>{checks.seoTitle ? "✓" : "○"}</span> SEO Title
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] ${checks.featuredImage ? "text-green-400/70" : "text-amber-400/50"}`}>
                  <span>{checks.featuredImage ? "✓" : "⚠"}</span> Featured Image
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] ${checks.tags ? "text-green-400/70" : "text-gray-600"}`}>
                  <span>{checks.tags ? "✓" : "○"}</span> Tags
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/8">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Shortcuts</p>
            <div className="space-y-1.5 text-[10px] text-gray-600">
              <p>Save → <kbd className="text-white bg-white/10 px-1 rounded">Ctrl+S</kbd></p>
              <p>Publish → <kbd className="text-white bg-white/10 px-1 rounded">Ctrl+↵</kbd></p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}

function ChecklistSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckItem({ ok, label, warning, warningMsg }: { ok: boolean; label: string; warning?: boolean; warningMsg?: string }) {
  return (
    <div className={`flex items-start gap-2 text-xs ${ok ? "text-green-400" : warning ? "text-amber-400" : "text-red-400"}`}>
      <span className="mt-0.5 shrink-0">{ok ? "✓" : warning ? "⚠" : "✗"}</span>
      <span>
        {label}
        {warningMsg && <span className="block text-[10px] opacity-80 mt-0.5">{warningMsg}</span>}
      </span>
    </div>
  );
}

function EntitySelector({
  label, entities, value, onChange, color
}: {
  label: string;
  entities: EntityOption[];
  value: string;
  onChange: (v: string) => void;
  color: "blue" | "purple" | "red";
}) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    red: "bg-red-500/10 text-red-300 border-red-500/20",
  };
  const selectedIds = value.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div>
      <label className="block text-[11px] text-gray-400 font-semibold mb-1.5 uppercase tracking-widest">Linked {label}</label>
      <select
        value=""
        onChange={e => {
          if (!e.target.value) return;
          if (!selectedIds.includes(e.target.value)) {
            onChange([...selectedIds, e.target.value].join(", "));
          }
        }}
        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cyan)]/40 transition-all bg-[#0d0d17]"
      >
        <option value="" className="bg-[#0d0d17]">— Add {label} —</option>
        {entities.map(e => (
          <option key={e._id} value={e._id} className="bg-[#0d0d17]">{e.name}</option>
        ))}
      </select>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedIds.map(id => (
            <span key={id} className={`px-2 py-0.5 rounded-md text-[10px] border flex items-center gap-1 ${colors[color]}`}>
              {entities.find(e => e._id === id)?.name || id.slice(-6)}
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter(s => s !== id).join(", "))}
                className="hover:text-white transition-colors ml-0.5"
                aria-label={`Remove ${label}`}
              >×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
