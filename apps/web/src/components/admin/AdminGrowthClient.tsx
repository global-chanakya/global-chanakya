"use client";
import { useState, useEffect } from "react";
import { Save, CheckCircle2, Megaphone, Mail, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export default function AdminGrowthClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [growthSettings, setGrowthSettings] = useState({
    announcementBar: {
      isActive: false,
      message: "",
      link: "",
      linkText: "",
      bgColor: "#1e40af", // default blue
    },
    newsletterConfig: "",
    trendingRules: "",
  });

  useEffect(() => {
    fetch("/api/admin/system-config")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config?.growth) {
          setGrowthSettings(data.config.growth);
        }
      })
      .catch(err => {
        console.error("Failed to load config", err);
        setError("Failed to load configuration.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateAnnouncement = (key: string, value: string | boolean) => {
    setGrowthSettings(prev => ({
      ...prev,
      announcementBar: {
        ...prev.announcementBar,
        [key]: value
      }
    }));
  };

  const updateField = (key: "newsletterConfig" | "trendingRules", value: string) => {
    setGrowthSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ growth: growthSettings }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || "Failed to save configuration");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] focus: transition-all";
  const labelClass = "block text-[11px] text-white/50 font-bold mb-2 uppercase tracking-[0.1em]";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto relative z-10 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-2 flex items-center gap-3">
            Growth <span className="text-[var(--text)]">Dashboard</span>
          </h1>
          <p className="text-white/50 text-[14px] font-medium max-w-xl leading-relaxed">
            Manage announcements, newsletter configurations, and trending algorithms.
          </p>
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-sm font-bold uppercase tracking-[0.1em] text-[12px] transition-all  hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
            saved ? "bg-[var(--cyan)] text-black" : " )]  text-black"
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : saved ? "Configuration Saved" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          {/* Announcement Bar */}
          <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm p-6 md:p-8 shadow-sm relative overflow-hidden">
            <h2 className="text-white font-extrabold text-[14px] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
              <Megaphone className="w-4 h-4 text-[var(--gold)]" /> Announcement Bar
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-sm border border-[var(--border)] bg-[var(--bg)]/50">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-white">Enable Bar</p>
                  <p className="text-white/40 text-[11px] mt-1">Show banner across all pages</p>
                </div>
                <button
                  onClick={() => updateAnnouncement("isActive", !growthSettings.announcementBar.isActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                    growthSettings.announcementBar.isActive
                      ? "bg-[var(--cyan)] "
                      : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                      growthSettings.announcementBar.isActive ? "translate-x-6 bg-white" : "translate-x-0 bg-white/50"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className={labelClass}>Message</label>
                <input 
                  type="text" 
                  value={growthSettings.announcementBar.message || ""} 
                  onChange={(e) => updateAnnouncement("message", e.target.value)} 
                  placeholder="e.g. New Strategic Report Available"
                  className={inputClass} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Link URL (Optional)</label>
                  <input 
                    type="text" 
                    value={growthSettings.announcementBar.link || ""} 
                    onChange={(e) => updateAnnouncement("link", e.target.value)} 
                    placeholder="/blogs/..."
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className={labelClass}>Link Text (Optional)</label>
                  <input 
                    type="text" 
                    value={growthSettings.announcementBar.linkText || ""} 
                    onChange={(e) => updateAnnouncement("linkText", e.target.value)} 
                    placeholder="Read Now"
                    className={inputClass} 
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Background Color</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={growthSettings.announcementBar.bgColor || "#1e40af"} 
                    onChange={(e) => updateAnnouncement("bgColor", e.target.value)} 
                    className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0" 
                  />
                  <input 
                    type="text" 
                    value={growthSettings.announcementBar.bgColor || ""} 
                    onChange={(e) => updateAnnouncement("bgColor", e.target.value)} 
                    placeholder="#HEX"
                    className={`${inputClass} max-w-[150px] uppercase`} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Newsletter Config */}
          <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm p-6 md:p-8 shadow-sm relative overflow-hidden">
            <h2 className="text-white font-extrabold text-[14px] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-400" /> Newsletter Configuration
            </h2>
            <div className="space-y-4">
              <label className={labelClass}>Integration Script / ID</label>
              <textarea 
                value={growthSettings.newsletterConfig || ""} 
                onChange={(e) => updateField("newsletterConfig", e.target.value)}
                placeholder="Paste Mailchimp or internal newsletter configuration JSON here..."
                rows={5}
                className={`${inputClass} font-mono resize-y`}
              />
            </div>
          </div>

          {/* Trending Rules */}
          <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm p-6 md:p-8 shadow-sm relative overflow-hidden">
            <h2 className="text-white font-extrabold text-[14px] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Trending Algorithm
            </h2>
            <div className="space-y-4">
              <label className={labelClass}>Scoring Rules (JSON)</label>
              <textarea 
                value={growthSettings.trendingRules || ""} 
                onChange={(e) => updateField("trendingRules", e.target.value)}
                placeholder={'{\n  "viewsWeight": 1,\n  "likesWeight": 3\n}'}
                rows={5}
                className={`${inputClass} font-mono resize-y`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
