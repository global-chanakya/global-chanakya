import React, { useState, useEffect } from "react";
import { FormData } from "./useArticleEditor";
import { BLOG_CATEGORIES } from "@/constants";

export function WriteArticleSettingsTab({ form, update, inputClass, labelClass }: { form: FormData; update: (field: keyof FormData, value: string | boolean) => void; inputClass: string; labelClass: string; }) {

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
            {BLOG_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d0d17]">{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Visibility</label>
          <select value={form.visibility} onChange={(e) => update("visibility", e.target.value)} className={inputClass}>
            <option value="public" className="bg-[#0d0d17]">🌐 Public</option>
            <option value="private" className="bg-[#0d0d17]">🔒 Private</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Tags (comma separated)</label>
        <input type="text" placeholder="tags..." value={form.tags} onChange={(e) => update("tags", e.target.value)} className={inputClass} />
      </div>
      <div className="space-y-3">
        <label className={labelClass}>Article Options</label>
        {[
          { key: "isTrending", label: "🔥 Trending Article" },
          { key: "commentsEnabled", label: "💬 Comments Enable" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => update(key as keyof FormData, !form[key as keyof FormData])} className={`w-10 h-5 rounded-full transition-all relative ${form[key as keyof FormData] ? "bg-amber-500" : "bg-white/10"}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${form[key as keyof FormData] ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-gray-300 text-sm">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
