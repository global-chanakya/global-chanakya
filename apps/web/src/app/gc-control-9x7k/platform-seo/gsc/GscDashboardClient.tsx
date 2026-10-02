"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, MousePointerClick, Eye, TrendingUp, AlertTriangle, Link as LinkIcon, RefreshCw, BarChart2 } from "lucide-react";

interface GscData {
  hasData: boolean;
  latestDataDate?: string;
  dateRange?: { start: string; end: string };
  kpis?: { clicks: number; impressions: number; ctr: number; position: number };
  trend?: { date: string; clicks: number; impressions: number }[];
  topQueries?: { query: string; clicks: number; impressions: number; ctr: number; avgPosition: number }[];
  topPages?: { page: string; clicks: number; impressions: number; ctr: number; avgPosition: number; blogTitle?: string }[];
  ctrOpportunities?: any[];
  cannibalizationEvidence?: any[];
}

export default function GscDashboardClient() {
  const [data, setData] = useState<GscData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/seo/gsc/dashboard");
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-sm flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-8 h-8 mb-3" />
          <h2 className="text-lg font-bold mb-1">Failed to load Intelligence Data</h2>
          <p className="text-sm opacity-80">{error}</p>
          <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data?.hasData) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">GSC SEO Intelligence</h1>
            <p className="text-gray-400">Search Console Performance & Semantic Analysis</p>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-12 rounded-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--cyan)]/10 flex items-center justify-center mb-6">
            <BarChart2 className="w-8 h-8 text-[var(--cyan)]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Google Search Console data is not available yet.</h2>
          <p className="text-gray-400 max-w-md mb-8">
            To view organic search intelligence, you must configure GSC credentials and ingest historical data.
          </p>
          <div className="bg-black/40 rounded-sm p-6 text-left max-w-lg w-full border border-white/5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-sm text-gray-300">Configure <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">GSC_SERVICE_ACCOUNT_EMAIL</code>, <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">GSC_PRIVATE_KEY</code>, and <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">GSC_SITE_URL</code>.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-sm text-gray-300">Run controlled ingestion (e.g. via QStash or API trigger).</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <p className="text-sm text-gray-300">Return to this dashboard to view intelligence reports.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, trend, topQueries, topPages, ctrOpportunities, cannibalizationEvidence, dateRange, latestDataDate } = data;

  const maxClicks = Math.max(...(trend?.map(t => t.clicks) || [0]), 1);
  const maxImpressions = Math.max(...(trend?.map(t => t.impressions) || [0]), 1);

  return (
    <div className="p-8 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">GSC SEO Intelligence</h1>
          <p className="text-gray-400">Date Range: {dateRange?.start} to {dateRange?.end}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Latest GSC Data</p>
            <p className="text-sm font-medium text-white">{latestDataDate}</p>
          </div>
          <button onClick={fetchDashboardData} className="p-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)]">
              <MousePointerClick className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Clicks</p>
          </div>
          <p className="text-3xl font-black text-white">{kpis?.clicks.toLocaleString()}</p>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)]">
              <Eye className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Impressions</p>
          </div>
          <p className="text-3xl font-black text-white">{kpis?.impressions.toLocaleString()}</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Average CTR</p>
          </div>
          <p className="text-3xl font-black text-white">{kpis?.ctr}%</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Avg Position</p>
          </div>
          <p className="text-3xl font-black text-white">{kpis?.position}</p>
        </div>
      </div>

      {/* Trend Chart (Simple CSS implementation) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Performance Trend (Impressions vs Clicks)</h3>
        <div className="h-48 flex items-end gap-2 w-full pt-4 relative">
          {trend?.map((t, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 items-center group relative h-full">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 bg-black/90 border border-white/10 px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                <p className="font-bold text-white mb-1">{t.date}</p>
                <p className="text-[var(--gold)]">Impressions: {t.impressions}</p>
                <p className="text-[var(--cyan)]">Clicks: {t.clicks}</p>
              </div>
              
              <div 
                className="w-full bg-[var(--gold)]/40 hover:bg-[var(--gold)]/60 rounded-t-sm transition-all"
                style={{ height: `${Math.max((t.impressions / maxImpressions) * 100, 2)}%` }}
              />
              <div 
                className="w-full bg-[var(--cyan)] hover:bg-[var(--cyan)]/80 rounded-t-sm transition-all absolute bottom-0"
                style={{ height: `${Math.max((t.clicks / maxClicks) * 100, 1)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[var(--gold)]/40"></div>
            <span className="text-xs text-gray-400">Impressions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[var(--cyan)]"></div>
            <span className="text-xs text-gray-400">Clicks</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Queries */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Top Search Queries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-medium">Query</th>
                  <th className="px-5 py-3 font-medium text-right">Clicks</th>
                  <th className="px-5 py-3 font-medium text-right">Impr.</th>
                  <th className="px-5 py-3 font-medium text-right">CTR</th>
                  <th className="px-5 py-3 font-medium text-right">Pos.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {topQueries?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">No queries found.</td>
                  </tr>
                )}
                {topQueries?.map((q, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-medium text-white max-w-[200px] truncate" title={q.query}>{q.query}</td>
                    <td className="px-5 py-3 text-right text-[var(--cyan)]">{q.clicks}</td>
                    <td className="px-5 py-3 text-right text-[var(--gold)]">{q.impressions}</td>
                    <td className="px-5 py-3 text-right text-gray-300">{q.ctr}%</td>
                    <td className="px-5 py-3 text-right text-gray-400">{q.avgPosition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Top Performing URLs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-medium">Page</th>
                  <th className="px-5 py-3 font-medium text-right">Clicks</th>
                  <th className="px-5 py-3 font-medium text-right">CTR</th>
                  <th className="px-5 py-3 font-medium text-right">Pos.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {topPages?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">No pages found.</td>
                  </tr>
                )}
                {topPages?.map((p, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 max-w-[250px] truncate">
                      {p.blogTitle ? (
                        <div>
                          <p className="font-medium text-white truncate" title={p.blogTitle}>{p.blogTitle}</p>
                          <p className="text-xs text-gray-500 truncate" title={p.page}>{p.page.split('/').pop()}</p>
                        </div>
                      ) : (
                        <p className="text-gray-300 truncate" title={p.page}>{p.page.replace(/^.*\/\/[^\/]+/, '')}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-[var(--cyan)]">{p.clicks}</td>
                    <td className="px-5 py-3 text-right text-gray-300">{p.ctr}%</td>
                    <td className="px-5 py-3 text-right text-gray-400">{p.avgPosition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SEO Review Opportunities (CTR) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">SEO Review Opportunities</h3>
          <span className="px-2 py-1 bg-[var(--cyan)]/10 text-[var(--cyan)] text-xs font-bold rounded">High Impr. / Low CTR</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-medium">URL</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium text-right">Impr.</th>
                <th className="px-5 py-3 font-medium text-right">CTR</th>
                <th className="px-5 py-3 font-medium text-right">Pos.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {ctrOpportunities?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">No immediate review opportunities detected.</td>
                </tr>
              )}
              {ctrOpportunities?.map((opp, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-gray-300 max-w-[200px] truncate">
                    <a href={opp.url} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" />
                      {opp.url.split('/').pop()}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 max-w-[300px] truncate" title={opp.reason}>{opp.reason}</td>
                  <td className="px-5 py-3 text-right text-[var(--gold)]">{opp.impressions}</td>
                  <td className="px-5 py-3 text-right text-red-400">{opp.ctr}%</td>
                  <td className="px-5 py-3 text-right text-gray-400">{opp.averagePosition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cannibalization Evidence */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Cannibalization Evidence</h3>
          <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs font-bold rounded">Query Overlap Analysis</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-medium">Query</th>
                <th className="px-5 py-3 font-medium">Evidence Level</th>
                <th className="px-5 py-3 font-medium">URL A</th>
                <th className="px-5 py-3 font-medium">URL B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {cannibalizationEvidence?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">No cannibalization evidence detected.</td>
                </tr>
              )}
              {cannibalizationEvidence?.map((c, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white max-w-[200px] truncate" title={c.query}>{c.query}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg
                      ${c.evidence === 'STRONG_EVIDENCE' ? 'bg-red-500/10 text-red-400' : ''}
                      ${c.evidence === 'LIKELY' ? 'bg-orange-500/10 text-orange-400' : ''}
                      ${c.evidence === 'POSSIBLE' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                      ${c.evidence === 'NO_EVIDENCE' ? 'bg-gray-500/10 text-gray-400' : ''}
                    `}>
                      {c.evidence.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] truncate" title={c.reason}>{c.reason}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-300">
                    <div className="max-w-[200px]">
                      <p className="truncate text-xs hover:text-white" title={c.urlA}>{c.urlA.split('/').pop()}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Impr: {c.urlAStats.impressions} | Clicks: {c.urlAStats.clicks} | CTR: {c.urlAStats.ctr}%</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-300">
                    <div className="max-w-[200px]">
                      <p className="truncate text-xs hover:text-white" title={c.urlB}>{c.urlB.split('/').pop()}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Impr: {c.urlBStats.impressions} | Clicks: {c.urlBStats.clicks} | CTR: {c.urlBStats.ctr}%</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
