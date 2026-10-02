"use client";
import { useState } from "react";
import { Search, ShieldAlert, UserX, UserCheck } from "lucide-react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
  isBanned: boolean;
  createdAt: string;
}

const roleColors: Record<string, { bg: string, text: string, border: string }> = {
  admin: { bg: "bg-[var(--gold)]/10", text: "text-[var(--gold)]", border: "border-[var(--accent)]" },
  premium: { bg: "bg-[var(--cyan)]/10", text: "text-[var(--cyan)]", border: "border-[var(--border)]" },
  free: { bg: "bg-[var(--blue)]/10", text: "text-[var(--blue)]", border: "border-[var(--blue)]/30" },
  guest: { bg: "bg-[var(--surface)]", text: "text-[var(--muted)]", border: "border-[var(--border)]" },
};

const providerIcons: Record<string, string> = {
  google: "🌐",
  github: "🐙",
  credentials: "🔑",
};

export default function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState(users);

  const filtered = localUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "banned" ? u.isBanned : u.role === filter);
    return matchSearch && matchFilter;
  });

  async function updateRole(userId: string, newRole: string) {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "setRole", role: newRole }),
      });
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } finally {
      setLoading(null);
    }
  }

  async function toggleBan(userId: string, currentBan: boolean) {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: currentBan ? "unban" : "ban" }),
      });
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBanned: !currentBan } : u))
        );
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10 min-h-screen">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] mb-2 flex items-center gap-3">
            Operative <span className="text-[var(--text)]">Roster</span>
          </h1>
          <p className="text-white/50 text-[14px] font-medium max-w-xl leading-relaxed">
            Manage system access, intelligence clearances, and active operatives across the network.
            <span className="text-[var(--gold)] ml-2">Total Active: {localUsers.length}</span>
          </p>
        </div>
        
        {/* Admin Warning */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm border border-[var(--accent)] bg-[var(--gold)]/5">
          <ShieldAlert className="w-4 h-4 text-[var(--gold)]" />
          <p className="text-[var(--gold)] text-[11px] font-bold uppercase tracking-[0.1em]">Admin roles locked</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-[var(--surface)]/50 border border-[var(--border)] p-3 rounded-sm shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or email identity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-sm text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--border)] focus: transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["all", "admin", "free", "banned"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.1em] border transition-all ${
                filter === f
                  ? "bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--border)] "
                  : "bg-[var(--bg)] text-white/40 border-[var(--border)] hover:text-white hover:bg-[var(--surface)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-[var(--surface)]/40 border border-[var(--border)] rounded-sm overflow-hidden shadow-sm relative">
        {/* Glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-px" />
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Operative Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Access Level</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Origin</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <UserX className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 text-[14px] font-medium">No operatives matching the query.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className={`group hover:bg-[var(--bg)]/50 transition-colors ${u.isBanned ? "opacity-50 hover:opacity-80" : ""}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 )] blur opacity-30 group-hover:opacity-60 transition-opacity rounded-full" />
                          <div className="relative w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-white font-bold text-[14px] shadow-inner">
                            {u.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        </div>
                        <div>
                          <p className="text-white text-[13.5px] font-bold group-hover:text-[var(--cyan)] transition-colors">{u.name}</p>
                          <p className="text-white/40 text-[11px] font-medium mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select
                        disabled={u.role === "admin"}
                        value={u.role}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border outline-none appearance-none cursor-pointer transition-all ${
                          roleColors[u.role]?.bg ?? roleColors.free.bg
                        } ${roleColors[u.role]?.text ?? roleColors.free.text} ${roleColors[u.role]?.border ?? roleColors.free.border} ${
                          u.role === "admin" ? "opacity-70 cursor-not-allowed" : "hover:brightness-125 "
                        }`}
                      >
                        <option value="free" className="bg-[var(--bg)] text-white">FREE</option>
                        <option value="premium" className="bg-[var(--bg)] text-white">PREMIUM</option>
                        {u.role === "admin" && <option value="admin">ADMIN (LOCKED)</option>}
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-white/50 text-[12px] font-medium bg-[var(--bg)] px-3 py-1.5 rounded-lg border border-[var(--border)] w-fit">
                        {providerIcons[u.provider] ?? "❓"} {u.provider}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {u.isBanned ? (
                        <span className="flex items-center gap-1.5 text-[var(--danger)] text-[11px] font-bold uppercase tracking-widest">
                          <UserX className="w-3.5 h-3.5" /> Banned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[var(--cyan)] text-[11px] font-bold uppercase tracking-widest">
                          <UserCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => toggleBan(u._id, u.isBanned)}
                          disabled={loading === u._id}
                          className={`px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-[0.1em] border transition-all ${
                            u.isBanned
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 "
                              : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30 hover:bg-[var(--danger)]/20 hover:"
                          } ${loading === u._id ? "opacity-50 cursor-wait" : ""}`}
                        >
                          {loading === u._id ? "Processing..." : u.isBanned ? "Reinstate" : "Revoke Access"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
