"use client";
import { useState, useEffect } from "react";
import { Database, Zap, RefreshCcw, Activity, Key } from "lucide-react";

export default function SystemConfigClient() {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch("/api/admin/intelligence/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const triggerRefresh = async () => {
    if (!confirm("Are you sure you want to trigger a manual intelligence ingestion cycle? This consumes provider API limits.")) return;
    setLoading(true);
    setResult(null);
    try {
      // Use internal refresh endpoint which respects CRON_SECRET if it was exposed, but wait, the internal endpoint uses CRON_SECRET.
      // Wait, is there an admin endpoint for refresh? Let's use the one the dashboard was using or hit the cron.
      // The dashboard was using: /api/internal/intelligence/refresh with dev-secret
      const res = await fetch("/api/internal/intelligence/refresh", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "dev-secret"}`
        }
      });
      const data = await res.json();
      setResult(data);
      fetchHealth(); // refresh health after ingestion
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto relative z-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-2 flex items-center gap-3">
          System <span className="text-[var(--text)]">Configuration</span>
        </h1>
        <p className="text-white/50 text-[14px] font-medium max-w-xl leading-relaxed">
          Manage ingestion settings, provider health, and trigger manual synchronization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Ingestion Control */}
        <div className="bg-[var(--surface)]/50 border border-[var(--border)] rounded-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--cyan)]" />
          <h2 className="text-white text-[16px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[var(--cyan)]" /> Manual Ingestion
          </h2>
          <p className="text-white/50 text-[13px] font-medium mb-6">
            Trigger a synchronous poll of all registered intelligence providers. Bypasses the cron schedule.
          </p>
          <button
            onClick={triggerRefresh}
            disabled={loading}
            className="w-full py-3 bg-[var(--cyan)]/10 text-[var(--cyan)] border border-[var(--border)] rounded-sm font-bold uppercase tracking-[0.1em] text-[12px] hover:bg-[var(--cyan)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Ingesting..." : "Trigger Live Ingestion"}
          </button>
        </div>

        {/* Provider Health */}
        <div className="bg-[var(--surface)]/50 border border-[var(--border)] rounded-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
          <h2 className="text-white text-[16px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" /> Provider Health
          </h2>
          {health ? (
            <div className="space-y-4">
              {Object.entries(health.circuitBreakers || {}).map(([provider, failures]) => (
                <div key={provider} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-white text-[13px] font-bold">{provider.replace(/_/g, " ")}</span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${Number(failures) >= 3 ? 'bg-[var(--danger)]/20 text-[var(--danger)]' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {Number(failures) >= 3 ? `Broken (${failures} fails)` : `Healthy (${failures} fails)`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-[13px]">Loading provider health...</p>
          )}
        </div>

        {/* Groq Key Health */}
        <div className="bg-[var(--surface)]/50 border border-[var(--border)] rounded-sm p-6 relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)]" />
          <h2 className="text-white text-[16px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-[var(--gold)]" /> Groq Key Pool Health
          </h2>
          {health?.groqHealth ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-sm border border-white/10 text-center">
                <div className="text-[24px] font-bold text-white mb-1">{health.groqHealth.totalKeys}</div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">Configured</div>
              </div>
              <div className="bg-white/5 p-4 rounded-sm border border-white/10 text-center">
                <div className="text-[24px] font-bold text-emerald-400 mb-1">{health.groqHealth.healthy}</div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">Healthy</div>
              </div>
              <div className="bg-white/5 p-4 rounded-sm border border-white/10 text-center">
                <div className="text-[24px] font-bold text-orange-400 mb-1">{health.groqHealth.cooldown}</div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">Cooldown</div>
              </div>
              <div className="bg-white/5 p-4 rounded-sm border border-white/10 text-center">
                <div className="text-[24px] font-bold text-[var(--danger)] mb-1">{health.groqHealth.failed}</div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">Failed</div>
              </div>
              <div className="bg-white/5 p-4 rounded-sm border border-white/10 text-center">
                <div className="text-[24px] font-bold text-blue-400 mb-1">{health.groqHealth.totalRateLimits}</div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">Rate Limits</div>
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-[13px]">Loading Groq health...</p>
          )}
        </div>
      </div>

      {result && (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-sm p-6 overflow-hidden">
          <h3 className="text-white text-[14px] font-bold uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--gold)]" /> Ingestion Result
          </h3>
          <pre className="text-[var(--cyan)] font-mono text-[11px] overflow-x-auto custom-scrollbar p-4 bg-black/50 rounded-sm border border-white/5">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
