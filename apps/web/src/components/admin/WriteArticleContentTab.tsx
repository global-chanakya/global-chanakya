import React from "react";
import { FormData } from "./useArticleEditor";

export function WriteArticleContentTab({
  form, update, editorMode, setEditorMode, inputClass, labelClass
}: {
  form: FormData; update: (field: keyof FormData, value: string | boolean) => void;
  editorMode: "code" | "preview"; setEditorMode: (mode: "code" | "preview") => void;
  inputClass: string; labelClass: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Article Title *</label>
        <input type="text" placeholder="Title..." value={form.title} onChange={(e) => update("title", e.target.value)} className={`${inputClass} text-lg font-medium`} />
      </div>
      <div>
        <label className={labelClass}>URL Slug</label>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-[13px] font-medium">/blogs/</span>
          <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Excerpt (Short Summary) *</label>
        <textarea rows={3} placeholder="Summary..." value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Featured Image URL</label>
        <input type="text" placeholder="Image URL..." value={form.featuredImage} onChange={(e) => update("featuredImage", e.target.value)} className={inputClass} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`${labelClass} !mb-0`}>Article Content *</label>
          <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1 shadow-inner">
            <button type="button" onClick={() => setEditorMode("code")} className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${editorMode === "code" ? "bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--accent)]" : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"}`}>&lt;/&gt; Code</button>
            <button type="button" onClick={() => setEditorMode("preview")} className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${editorMode === "preview" ? "bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--accent)]" : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"}`}>👁 Preview</button>
          </div>
        </div>
        {editorMode === "code" ? (
          <textarea rows={28} spellCheck={false} placeholder="HTML/CSS/JS here..." value={form.content} onChange={(e) => update("content", e.target.value)} className={`${inputClass} font-mono text-[13px] leading-relaxed resize-y`} style={{ minHeight: "520px", tabSize: 2 }} onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const val = e.currentTarget.value;
              update("content", val.substring(0, start) + "  " + val.substring(end));
            }
          }} />
        ) : (
          <div className="rounded-sm overflow-hidden border border-[var(--border)] shadow-inner" style={{ height: "560px" }}>
            {form.content ? (
              <iframe srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#fff;color:#111;font-family:Georgia,serif;font-size:17px;line-height:1.8;padding:24px 32px;max-width:800px;margin:0 auto;}h1,h2,h3,h4{font-family:-apple-system,sans-serif;font-weight:700;margin-top:1.5em;}a{color:#ef4444;}blockquote{border-left:4px solid #ef4444;margin:1.5em 0;padding:12px 20px;background:#fff5f5;border-radius:0 8px 8px 0;font-style:italic;color:#555;}ul,ol{padding-left:1.5em;}img{max-width:100%;border-radius:8px;}</style></head><body>${form.content}</body></html>`} className="w-full h-full bg-white" title="Preview" sandbox="allow-scripts" />
            ) : (
              <div className="h-full flex items-center justify-center bg-[var(--bg)] text-white/30 text-[13px] font-medium">Preview area</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
