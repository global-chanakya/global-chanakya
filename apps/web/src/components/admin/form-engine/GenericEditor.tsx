"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { EntitySchema, FormField } from "./EntitySchemas";
import {
  Save, Clock, Lock, AlertCircle, Eye, ChevronDown, ChevronUp,
  BarChart2, RefreshCw, CheckCircle2, XCircle, Search, Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import AsyncRelationSelect from "./AsyncRelationSelect";
import SEOScoringWidget from "./SEOScoringWidget";
import { formatViews } from "@/lib/formatViews";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ─── Character Count Indicator ────────────────────────────────────────────────
function CharCountIndicator({ value, hint, maxLength }: { value: string; hint?: string; maxLength?: number }) {
  const len = (value || "").length;

  // Parse hint like "30–60 chars recommended" to extract min/max
  let hintMin = 0, hintMax = 0;
  if (hint) {
    const match = hint.match(/(\d+)\s*[–\-]\s*(\d+)/);
    if (match) { hintMin = parseInt(match[1]); hintMax = parseInt(match[2]); }
  }

  const getColor = () => {
    if (maxLength && len > maxLength) return "text-red-400";
    if (hintMin && hintMax) {
      if (len >= hintMin && len <= hintMax) return "text-green-400";
      if (len > 0 && (len < hintMin || len > hintMax)) return "text-yellow-400";
    }
    return "text-[var(--muted)]";
  };

  const getLabel = () => {
    if (maxLength && len > maxLength) return `${len}/${maxLength} — too long!`;
    if (hintMin && hintMax) {
      if (len === 0) return `0 chars — ${hint}`;
      if (len < hintMin) return `${len} chars — ${hintMin - len} more needed`;
      if (len > hintMax) return `${len} chars — ${len - hintMax} over optimal`;
      return `${len} chars ✓ perfect`;
    }
    return `${len} chars`;
  };

  return (
    <div className="flex items-center justify-between mt-1.5">
      <span className={`text-[10px] font-semibold tabular-nums ${getColor()}`}>
        {getLabel()}
      </span>
      {hintMin > 0 && hintMax > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                len >= hintMin && len <= hintMax ? "bg-green-400" :
                len > hintMax ? "bg-red-400" :
                len > 0 ? "bg-yellow-400" : "bg-white/5"
              }`}
              style={{ width: `${Math.min(100, (len / (maxLength || hintMax)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SERP Preview ─────────────────────────────────────────────────────────────
function SERPPreview({ title, url, description }: { title: string; url: string; description: string }) {
  const displayTitle = title || "Page Title — Global Chanakya";
  const displayUrl = url || "https://www.globalchanakya.in/...";
  const displayDesc = description || "Add a meta description to see how this page will appear in search results.";

  // Truncate like Google does
  const truncTitle = displayTitle.length > 60 ? displayTitle.slice(0, 57) + "..." : displayTitle;
  const truncDesc = displayDesc.length > 160 ? displayDesc.slice(0, 157) + "..." : displayDesc;

  return (
    <div className="rounded-sm border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          Google SERP Preview
        </span>
      </div>
      <div className="p-5 bg-white rounded-b-xl">
        {/* Google-style result */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-800 font-medium truncate">Global Chanakya</p>
            <p className="text-[11px] text-gray-500 truncate">{displayUrl}</p>
          </div>
        </div>
        <h3 className="text-lg font-medium text-[#1a0dab] leading-snug mb-1 hover:underline cursor-pointer">
          {truncTitle}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {truncDesc}
        </p>
      </div>
    </div>
  );
}


function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []); // only on mount

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  };

  const toolbarBtn = (label: string, cmd: string, val?: string) => (
    <button
      key={cmd + label}
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
      title={label}
      className="px-2 py-1 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-[var(--surface)] border-b border-[var(--border)]">
        {toolbarBtn("B", "bold")}
        {toolbarBtn("I", "italic")}
        {toolbarBtn("U", "underline")}
        {toolbarBtn("S", "strikeThrough")}
        <div className="w-px bg-white/10 mx-1" />
        {toolbarBtn("H1", "formatBlock", "h1")}
        {toolbarBtn("H2", "formatBlock", "h2")}
        {toolbarBtn("H3", "formatBlock", "h3")}
        {toolbarBtn("P", "formatBlock", "p")}
        <div className="w-px bg-white/10 mx-1" />
        {toolbarBtn("• List", "insertUnorderedList")}
        {toolbarBtn("1. List", "insertOrderedList")}
        {toolbarBtn("Quote", "formatBlock", "blockquote")}
        <div className="w-px bg-white/10 mx-1" />
        {toolbarBtn("Link", "createLink")}
        {toolbarBtn("Clear", "removeFormat")}
      </div>
      {/* Content Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        className="min-h-[400px] p-6 text-white text-base leading-relaxed outline-none bg-[var(--bg)]
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-white
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-white
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-white
          [&_p]:mb-3 [&_p]:text-gray-300
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3
          [&_li]:mb-1 [&_li]:text-gray-300
          [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--gold)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:mb-3
          [&_a]:text-[var(--gold)] [&_a]:underline
          [&_strong]:text-white [&_em]:italic"
        style={{ wordBreak: "break-word" }}
      />
      <div className="px-4 py-2 bg-[var(--surface)] border-t border-[var(--border)] text-xs text-[var(--muted)] flex justify-between">
        <span>Rich Text Editor</span>
        <span>{(editorRef.current?.innerText || "").length} chars</span>
      </div>
    </div>
  );
}

// ─── String Array ─────────────────────────────────────────────────────────────
function StringArrayInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const arr = Array.isArray(value) ? value : [];

  const add = () => {
    if (!input.trim()) return;
    
    const newTags = input
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "" && !arr.includes(tag));
      
    const uniqueNewTags = Array.from(new Set(newTags));
    
    if (uniqueNewTags.length > 0) {
      onChange([...arr, ...uniqueNewTags]);
    }
    
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-white text-sm focus:border-[var(--gold)] outline-none"
        />
        <button onClick={add} className="px-4 py-2 bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--accent)] rounded-lg text-sm font-bold hover:bg-[var(--gold)]/30 transition-colors">
          Add
        </button>
      </div>
      {arr.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {arr.map((tag, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-full text-xs text-white">
              {tag}
              <button onClick={() => onChange(arr.filter((_, idx) => idx !== i))} className="text-[var(--muted)] hover:text-red-400 transition-colors">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Citations ────────────────────────────────────────────────────────────────
function CitationsInput({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const arr = Array.isArray(value) ? value : [];
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const add = () => {
    if (url.trim()) {
      onChange([...arr, { url: url.trim(), label: label.trim() || url.trim(), addedAt: new Date() }]);
      setUrl(""); setLabel("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-white text-sm focus:border-[var(--gold)] outline-none" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-white text-sm focus:border-[var(--gold)] outline-none" />
        <button onClick={add} className="px-4 py-2 bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--accent)] rounded-lg text-sm font-bold hover:bg-[var(--gold)]/30 transition-colors">Add</button>
      </div>
      {arr.map((c, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--gold)] font-bold truncate">{c.label || c.url}</p>
            <p className="text-xs text-[var(--muted)] truncate">{c.url}</p>
          </div>
          <button onClick={() => onChange(arr.filter((_, idx) => idx !== i))} className="text-[var(--muted)] hover:text-red-400 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Analytics Widget ────────────────────────────────────────────────────────
function AnalyticsWidget({ analytics }: { analytics?: Record<string, number> }) {
  if (!analytics) return null;
  const stats = [
    { label: "Views", value: analytics.views ?? 0, icon: "👁" },
    { label: "Likes", value: analytics.likes ?? 0, icon: "❤️" },
    { label: "Bookmarks", value: analytics.bookmarks ?? 0, icon: "🔖" },
    { label: "Read Time", value: analytics.readTime ?? 0, icon: "⏱", suffix: "s" },
  ];

  return (
    <div className="mt-6 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-2">
        <BarChart2 className="w-3.5 h-3.5" /> Live Analytics
      </p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--bg)] rounded-lg p-3 border border-[var(--border)]">
            <p className="text-[var(--muted)] text-xs">{s.icon} {s.label}</p>
            <p className="text-white font-bold text-xl">{formatViews(s.value)}{s.suffix || ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function GenericEditor({
  schema,
  entityId,
  initialData,
}: {
  schema: EntitySchema;
  entityId?: string;
  initialData?: any;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isLoading, setIsLoading] = useState(entityId && Object.keys(initialData || {}).length === 0);
  const [activeTab, setActiveTab] = useState(schema.tabs[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const formRef = useRef(formData);

  useEffect(() => { formRef.current = formData; }, [formData]);

  // Fetch data client-side (auth cookie present in browser)
  useEffect(() => {
    if (!entityId || Object.keys(initialData || {}).length > 0) {
      if (initialData) setFormData(initialData);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch(`${schema.apiPath}?id=${entityId}`)
      .then(res => res.json())
      .then(json => {
        const data = json.data || json;
        setFormData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [entityId, schema.apiPath]);

  // Autosave every 30s
  useEffect(() => {
    if (!entityId) return;
    const interval = setInterval(() => handleSave(true), 30000);
    return () => clearInterval(interval);
  }, [entityId]);

  const handleSave = useCallback(async (isAutosave = false) => {
    if (isAutosave && isSaving) return;
    if (!isAutosave) {
      const isPublishing = formRef.current.status === "published" || formRef.current.status === "scheduled";
      if (isPublishing) {
        const missing: string[] = [];
        if (!formRef.current.title && !formRef.current.name) missing.push("Title/Name");
        if (!formRef.current.slug) missing.push("Slug");
        if (missing.length > 0) {
          alert("Cannot publish. Missing: " + missing.join(", "));
          return;
        }
      }
    }

    if (!isAutosave) setIsSaving(true);
    try {
      const isEdit = Boolean(entityId);
      const payload = isEdit ? { id: entityId, ...formRef.current } : formRef.current;
      const res = await fetch(schema.apiPath, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }

      const data = await res.json();
      setLastSaved(new Date());
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);

      if (!entityId && data.id) {
        router.push(`${schema.frontendBasePath || '/admin/' + schema.id}/${data.id}`);
      }
    } catch (err) {
      setSaveStatus("error");
      if (!isAutosave) alert(`Save failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      if (!isAutosave) setIsSaving(false);
    }
  }, [entityId, schema, isSaving]);

  const handleFieldChange = (name: string, value: any) => {
    const keys = name.split(".");
    setFormData((prev: any) => {
      if (keys.length === 1) return { ...prev, [name]: value };
      return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
    });
  };

  const getNestedValue = (name: string) => {
    const keys = name.split(".");
    if (keys.length === 1) return formData[name] ?? "";
    return formData[keys[0]]?.[keys[1]] ?? "";
  };

  const renderField = (field: FormField) => {
    const value = getNestedValue(field.name);

    switch (field.type) {
      case "text":
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => {
                handleFieldChange(field.name, e.target.value);
                // Auto-generate slug from title if slug is empty
                if ((field.name === "title" || field.name === "name") && !formData.slug) {
                  handleFieldChange("slug", slugify(e.target.value));
                }
              }}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--gold)] outline-none transition-colors text-sm"
            />
            {(field.charCountHint || field.maxLength) && (
              <CharCountIndicator value={value} hint={field.charCountHint} maxLength={field.maxLength} />
            )}
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--gold)] outline-none transition-colors text-sm"
          />
        );

      case "textarea":
        return (
          <div>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.charCountHint ? 3 : 5}
              maxLength={field.maxLength}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--gold)] outline-none transition-colors text-sm resize-y"
            />
            {(field.charCountHint || field.maxLength) && (
              <CharCountIndicator value={value} hint={field.charCountHint} maxLength={field.maxLength} />
            )}
          </div>
        );

      case "richtext":
        return (
          <RichTextEditor
            value={value}
            onChange={(v) => handleFieldChange(field.name, v)}
          />
        );

      case "boolean":
        return (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => handleFieldChange(field.name, !value)}
              className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-[var(--gold)]" : "bg-[var(--border)]"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-white text-sm font-medium">{field.label}</span>
          </label>
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--gold)] outline-none transition-colors text-sm appearance-none"
          >
            <option value="">Select {field.label}...</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <div className="grid grid-cols-2 gap-2">
            {field.options?.map((o) => (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(o.value) : false}
                  onChange={(e) => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    handleFieldChange(field.name, e.target.checked ? [...arr, o.value] : arr.filter((v) => v !== o.value));
                  }}
                  className="accent-[var(--gold)]"
                />
                <span className="text-white text-sm">{o.label}</span>
              </label>
            ))}
          </div>
        );

      case "date":
        return (
          <input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value ? new Date(e.target.value) : null)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--gold)] outline-none transition-colors text-sm"
          />
        );

      case "string-array":
        return (
          <StringArrayInput
            value={Array.isArray(value) ? value : []}
            onChange={(v) => handleFieldChange(field.name, v)}
          />
        );

      case "citations":
        return (
          <CitationsInput
            value={Array.isArray(value) ? value : []}
            onChange={(v) => handleFieldChange(field.name, v)}
          />
        );

      case "media-picker":
        return (
          <div className="space-y-2">
            {value && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={value} alt="media" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleFieldChange(field.name, "")}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="url"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder="Paste image URL or upload via Media Library"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--gold)] outline-none transition-colors text-sm"
            />
          </div>
        );

      case "async-relation":
        return (
          <AsyncRelationSelect
            relationModel={field.relationModel}
            value={value}
            onChange={(val) => handleFieldChange(field.name, val)}
          />
        );

      default:
        if (field.name === "versionHistory") {
          const versions = Array.isArray(formData.previousVersions) ? formData.previousVersions : [];
          return (
            <div className="space-y-3">
              <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-white text-sm font-bold">Current Version</p>
                  <p className="text-xs text-[var(--muted)]">Unsaved changes</p>
                </div>
                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded">LIVE</span>
              </div>
              {versions.length === 0 && (
                <p className="text-[var(--muted)] text-sm text-center py-4">No previous versions saved yet.</p>
              )}
              {versions.map((v: any, i: number) => (
                <div key={i} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold text-sm">Version {versions.length - i}</p>
                    <p className="text-xs text-[var(--muted)]">{new Date(v.savedAt || Date.now()).toLocaleString()}</p>
                  </div>
                  <button className="text-sm font-medium text-red-500 hover:text-red-400">Restore</button>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="p-4 bg-[var(--bg)] border border-dashed border-[var(--border)] rounded-lg text-[var(--muted)] text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Field type "{field.type}" — coming soon
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[var(--gold)] animate-spin mx-auto" />
          <p className="text-[var(--muted)] text-sm">Loading {schema.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <div className="w-60 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col overflow-y-auto">
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3 px-1">Sections</p>
          <div className="space-y-0.5">
            {schema.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--accent)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEO Score */}
        <div className="p-4 border-t border-[var(--border)] mt-auto">
          <SEOScoringWidget 
            formData={formData} 
            onOptimized={(optimized) => {
              setFormData((prev: any) => ({
                ...prev,
                ...optimized,
                seo: { ...(prev.seo || {}), ...(optimized.seo || {}) }
              }));
            }}
          />
        </div>

        {/* Analytics */}
        {formData.analytics && (
          <div className="p-4 border-t border-[var(--border)]">
            <AnalyticsWidget analytics={formData.analytics} />
          </div>
        )}
      </div>

      {/* ── Main Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg)]">
        {/* Toolbar */}
        <div className="h-14 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              {entityId ? "Editing" : "Creating"} {schema.name}
              <span className="bg-[var(--gold)]/10 text-[var(--gold)] px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1 border border-[var(--accent)]">
                <Lock className="w-2.5 h-2.5" /> Locked to you
              </span>
            </h2>
            {lastSaved && (
              <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Save failed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {formData.slug && (
              <a
                href={`/${schema.id === "blogs" ? "blogs" : schema.id}/${formData.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:text-white bg-[var(--bg)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-all"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </a>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--gold)] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-7">
            {/* Analytics banner for blogs */}
            {formData.analytics && activeTab === schema.tabs[0].id && (
              <div className="grid grid-cols-4 gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-sm">
                {[
                  { label: "Views", value: formData.analytics.views ?? 0, color: "text-blue-400" },
                  { label: "Likes", value: formData.analytics.likes ?? 0, color: "text-rose-400" },
                  { label: "Bookmarks", value: formData.analytics.bookmarks ?? 0, color: "text-[var(--gold)]" },
                  { label: "Read Time", value: `${formData.analytics.readTime ?? 0}s`, color: "text-green-400" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{typeof s.value === "number" ? formatViews(s.value) : s.value}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* SERP Preview — shown on SEO tab */}
            {activeTab === "seo" && (
              <SERPPreview
                title={formData.seo?.title || formData.title || formData.name || ""}
                url={formData.slug ? `https://www.globalchanakya.in/${schema.id === "blogs" ? "blogs" : schema.id}/${formData.slug}` : ""}
                description={formData.seo?.description || formData.excerpt || formData.overview || ""}
              />
            )}

            {schema.tabs.find((t) => t.id === activeTab)?.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                {field.type !== "boolean" && (
                  <label className="block text-sm font-semibold text-[var(--secondary)]">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                    {field.description && <span className="text-[var(--muted)] font-normal ml-2 text-xs">— {field.description}</span>}
                  </label>
                )}
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
