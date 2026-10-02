"use client";

import React, { useState, useEffect } from "react";
import { LayoutTemplate, Plus, Trash2, GripVertical, Save, AlertCircle } from "lucide-react";

export default function HomepageBuilderPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch system config
    fetch("/api/admin/system-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config);
        } else {
          // Default empty state
          setConfig({
            homepage: {
              sections: [
                { sectionType: "hero", order: 0, isActive: true, fallbackLogic: "latest_breaking", assignedContentIds: [] },
                { sectionType: "featured_reports", order: 1, isActive: true, fallbackLogic: "latest_reports", assignedContentIds: [] },
                { sectionType: "trending_conflicts", order: 2, isActive: true, fallbackLogic: "highest_engagement", assignedContentIds: [] },
                { sectionType: "region_spotlight", order: 3, isActive: true, fallbackLogic: "critical_regions", assignedContentIds: [] },
              ]
            }
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/system-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      alert("Homepage layout saved successfully.");
    } catch (err) {
      alert("Failed to save layout.");
    }
    setSaving(false);
  };

  const addSection = () => {
    const newSections = [...config.homepage.sections];
    newSections.push({
      sectionType: "custom",
      order: newSections.length,
      isActive: false,
      fallbackLogic: "none",
      assignedContentIds: [],
    });
    setConfig({ ...config, homepage: { ...config.homepage, sections: newSections } });
  };

  const removeSection = (index: number) => {
    const newSections = [...config.homepage.sections];
    newSections.splice(index, 1);
    setConfig({ ...config, homepage: { ...config.homepage, sections: newSections } });
  };

  const updateSection = (index: number, key: string, value: any) => {
    const newSections = [...config.homepage.sections];
    newSections[index][key] = value;
    setConfig({ ...config, homepage: { ...config.homepage, sections: newSections } });
  };

  if (loading) return <div className="p-8 text-white">Loading builder...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LayoutTemplate className="text-[var(--gold)]" />
            Homepage Builder
          </h1>
          <p className="text-[var(--muted)]">Manage layout, hero sections, and featured modules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--gold)] text-black font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Layout"}
        </button>
      </div>

      <div className="space-y-4">
        {config?.homepage?.sections?.sort((a: any, b: any) => a.order - b.order).map((section: any, idx: number) => (
          <div key={idx} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex items-start gap-4 transition-all hover:border-[var(--accent)]">
            <div className="mt-2 text-gray-500 cursor-grab hover:text-white">
              <GripVertical className="w-5 h-5" />
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2">Section Type</label>
                <select
                  value={section.sectionType}
                  onChange={(e) => updateSection(idx, "sectionType", e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-white text-sm focus:border-[var(--gold)] outline-none"
                >
                  <option value="hero">Hero / Breaking</option>
                  <option value="featured_reports">Featured Reports</option>
                  <option value="trending_conflicts">Trending Conflicts</option>
                  <option value="region_spotlight">Region Spotlight</option>
                  <option value="newsletter">Newsletter Block</option>
                  <option value="custom">Custom Module</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2">Fallback Logic</label>
                <select
                  value={section.fallbackLogic}
                  onChange={(e) => updateSection(idx, "fallbackLogic", e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-white text-sm focus:border-[var(--gold)] outline-none"
                >
                  <option value="none">None (Hide if empty)</option>
                  <option value="latest_breaking">Show Latest Breaking</option>
                  <option value="latest_reports">Show Latest Reports</option>
                  <option value="highest_engagement">Show Highest Engagement</option>
                  <option value="critical_regions">Show Critical Regions</option>
                </select>
              </div>

              <div className="flex items-end justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.isActive}
                    onChange={(e) => updateSection(idx, "isActive", e.target.checked)}
                    className="w-4 h-4 accent-[var(--gold)] bg-transparent border-[var(--border)]"
                  />
                  <span className="text-sm text-white font-medium">Active</span>
                </label>

                <button
                  onClick={() => removeSection(idx)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  title="Remove Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="col-span-3">
                 <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2 flex items-center gap-2">
                    Pinned Content
                    <span title="If left empty, the fallback logic will automatically populate the section.">
                      <AlertCircle className="w-3 h-3 text-[var(--gold)]" />
                    </span>
                 </label>
                 <div className="p-3 bg-[var(--bg)] border border-[var(--border)] border-dashed rounded text-xs text-gray-500 text-center">
                    No items pinned. Using fallback logic.
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSection}
        className="mt-6 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[var(--border)] text-gray-400 rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors font-bold uppercase tracking-wider text-sm"
      >
        <Plus className="w-4 h-4" />
        Add New Section
      </button>
    </div>
  );
}
