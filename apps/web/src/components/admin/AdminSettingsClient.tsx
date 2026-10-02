"use client";
import { useState } from "react";
import { Settings2, Save, User, ShieldAlert, CheckCircle2, Globe, Layout, Sliders, AlertTriangle } from "lucide-react";

interface AdminUser {
  name?: string;
  email?: string;
  image?: string;
}

export default function AdminSettingsClient({ user }: { user: AdminUser }) {
  const [saved, setSaved] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Global Chanakya",
    siteTagline: "Geopolitics & Strategic Intelligence",
    siteUrl: "https://global-chanakya-web.vercel.app",
    contactEmail: "contact@globalchanakya.in",
    twitterHandle: "@globalchanakya",
    linkedinUrl: "https://linkedin.com/company/globalchanakya",
    articlesPerPage: "10",
    maintenanceMode: false,
    allowSignups: true,
    commentModeration: true,
  });

  function update(key: string, value: string | boolean) {
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass = "w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)] focus: transition-all";
  const labelClass = "block text-[11px] text-white/50 font-bold mb-2 uppercase tracking-[0.1em]";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto relative z-10 min-h-screen">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-2 flex items-center gap-3">
            System <span className="text-[var(--text)]">Parameters</span>
          </h1>
          <p className="text-white/50 text-[14px] font-medium max-w-xl leading-relaxed">
            Configure global telemetry, access controls, and network-wide parameters.
          </p>
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-sm font-bold uppercase tracking-[0.1em] text-[12px] transition-all  hover:scale-105 ${
            saved ? "bg-[var(--cyan)] text-black" : " )]  text-black"
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Configuration Saved" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* Site Settings */}
          <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 /20" />
            <h2 className="text-white font-extrabold text-[14px] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
              <Globe className="w-4 h-4 text-white/50" /> Network Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Network Designation (Site Name)</label>
                <input type="text" value={siteSettings.siteName} onChange={(e) => update("siteName", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Operational Tagline</label>
                <input type="text" value={siteSettings.siteTagline} onChange={(e) => update("siteTagline", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Communications Link (Email)</label>
                <input type="email" value={siteSettings.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Public Channel (Twitter)</label>
                <input type="text" value={siteSettings.twitterHandle} onChange={(e) => update("twitterHandle", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm p-6 md:p-8 shadow-sm relative overflow-hidden">
            <h2 className="text-white font-extrabold text-[14px] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
              <Layout className="w-4 h-4 text-white/50" /> Display Formatting
            </h2>
            <div className="grid grid-cols-1 gap-6 max-w-sm">
              <div>
                <label className={labelClass}>Reports Per Sector (Page)</label>
                <input type="number" value={siteSettings.articlesPerPage} onChange={(e) => update("articlesPerPage", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Admin Profile Card */}
          <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/10 blur-[50px] rounded-full group-hover:bg-[var(--gold)]/20 transition-colors" />
            <h2 className="text-white font-extrabold text-[14px] uppercase tracking-[0.15em] mb-6 flex items-center gap-3 relative z-10">
              <User className="w-4 h-4 text-[var(--gold)]" /> Director Profile
            </h2>
            
            <div className="flex flex-col items-center text-center relative z-10">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" src={user.image} alt="" className="w-20 h-20 rounded-full border-2 border-[var(--accent)] p-1 mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-black font-extrabold text-2xl mb-4">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <h3 className="text-white font-bold text-[16px]">{user.name}</h3>
              <p className="text-white/50 text-[12px] font-medium mt-1">{user.email}</p>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-[var(--gold)]/10 text-[var(--gold)] text-[10px] font-bold uppercase tracking-[0.1em] rounded-full border border-[var(--accent)]">
                  Apex Access
                </span>
                <span className="px-3 py-1 bg-[var(--cyan)]/10 text-[var(--cyan)] text-[10px] font-bold uppercase tracking-[0.1em] rounded-full border border-[var(--border)]">
                  Verified Auth
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[var(--danger)]/5 border border-[var(--danger)]/20 rounded-sm relative z-10">
              <div className="flex gap-3">
                <ShieldAlert className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
                <p className="text-[var(--danger)] text-[11px] font-medium leading-relaxed">
                  Director protocols locked to <strong>{user.email}</strong>. This parameter is immutable.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Toggles */}
          <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm p-6 shadow-sm relative overflow-hidden">
            <h2 className="text-white font-extrabold text-[14px] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
              <Sliders className="w-4 h-4 text-[var(--cyan)]" /> Security Toggles
            </h2>
            <div className="space-y-4">
              {[
                {
                  key: "maintenanceMode",
                  label: "Network Lockdown",
                  desc: "Block all public access immediately",
                  danger: true,
                  icon: AlertTriangle
                },
                {
                  key: "allowSignups",
                  label: "Allow New Operatives",
                  desc: "Permit open registration",
                  danger: false,
                },
                {
                  key: "commentModeration",
                  label: "Strict Comm Filter",
                  desc: "All traffic requires manual approval",
                  danger: false,
                },
              ].map((t) => (
                <div key={t.key} className="flex items-center justify-between p-4 rounded-sm border border-[var(--border)] bg-[var(--bg)]/50">
                  <div className="pr-4">
                    <p className={`text-[12px] font-bold uppercase tracking-[0.05em] flex items-center gap-2 ${t.danger ? "text-[var(--danger)]" : "text-white"}`}>
                      {t.icon && <t.icon className="w-3.5 h-3.5" />}
                      {t.label}
                    </p>
                    <p className="text-white/40 text-[11px] mt-1">{t.desc}</p>
                  </div>
                  <button
                    onClick={() => update(t.key, !siteSettings[t.key as keyof typeof siteSettings])}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                      siteSettings[t.key as keyof typeof siteSettings]
                        ? t.danger ? "bg-[var(--danger)] " : "bg-[var(--cyan)] "
                        : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                        siteSettings[t.key as keyof typeof siteSettings] ? "translate-x-6 bg-white" : "translate-x-0 bg-white/50"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
