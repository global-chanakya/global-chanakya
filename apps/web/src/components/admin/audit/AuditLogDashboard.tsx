"use client";
import React, { useState, useEffect } from "react";
import { Filter, Search, User, FileText, Calendar, Activity } from "lucide-react";

// Static mock data — DO NOT use new Date() / Date.now() at module level.
// Runtime timestamps differ between SSR and client hydration, causing React #418.
const MOCK_AUDITS = [
  { id: "al_1", user: "mukun@example.com", action: "CREATE", entity: "Conflict", entityId: "c_123", date: "2026-01-01T00:00:00.000Z" },
  { id: "al_2", user: "editor@example.com", action: "UPDATE", entity: "Blog", entityId: "b_456", date: "2025-12-31T23:00:00.000Z" },
  { id: "al_3", user: "system", action: "PUBLISH", entity: "Region", entityId: "r_789", date: "2025-12-31T22:00:00.000Z" },
];

export default function AuditLogDashboard() {
  const [logs, setLogs] = useState(MOCK_AUDITS);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then(res => res.json())
      .then(data => {
        if (data.logs && data.logs.length > 0) setLogs(data.logs);
      })
      .catch(() => {});
  }, []);

  const filtered = logs.filter(l => {
    if (entityFilter !== "ALL" && l.entity !== entityFilter) return false;
    if (search && !l.user.includes(search) && !l.action.includes(search.toUpperCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] min-h-[calc(100vh-80px)] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Trail</h1>
          <p className="text-[var(--muted)]">Track every change across the platform.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface)] text-white border border-[var(--border)] font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-[var(--bg)] transition-colors">
          <Filter className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by user or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[var(--gold)] outline-none"
            />
          </div>
          <select 
            value={entityFilter} 
            onChange={e => setEntityFilter(e.target.value)}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-white focus:border-[var(--gold)] outline-none"
          >
            <option value="ALL">All Entities</option>
            <option value="Blog">Blogs</option>
            <option value="Conflict">Conflicts</option>
            <option value="Region">Regions</option>
            <option value="SystemConfig">System Config</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50">
                <th className="px-6 py-4 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-[var(--bg)]/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white">{log.user}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      log.action === 'CREATE' ? 'bg-green-500/10 text-green-500' :
                      log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                      'bg-[var(--gold)]/10 text-[var(--gold)]'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted)] flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {log.entity} <span className="font-mono text-xs opacity-50">({log.entityId})</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[var(--muted)] font-mono">
                    {new Date(log.date).toLocaleString()}
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
