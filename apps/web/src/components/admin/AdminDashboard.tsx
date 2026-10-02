"use client";

import { Users, Newspaper, ExternalLink, ShieldAlert, PenTool, LayoutDashboard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TrendingDown, Globe, Eye, UserCheck, Play, Save } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalBlogs: number;
  recentUsers: { _id: string; name: string; email: string; role: string; provider: string; createdAt: string }[];
}

export default function AdminDashboard({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, glow: "", border: "hover:border-[var(--blue)]", text: "text-[var(--blue)]", gradient: ")] " },
    { label: "Total Reports", value: stats.totalBlogs, icon: Newspaper, glow: "", border: "hover:border-[var(--gold)]", text: "text-[var(--gold)]", gradient: ")] " },
  ];

  const roleColors: Record<string, { bg: string, text: string, border: string }> = {
    admin: { bg: "bg-[var(--gold)]/10", text: "text-[var(--gold)]", border: "border-[var(--accent)]" },
    premium: { bg: "bg-[var(--cyan)]/10", text: "text-[var(--cyan)]", border: "border-[var(--border)]" },
    free: { bg: "bg-[var(--blue)]/10", text: "text-[var(--blue)]", border: "border-[var(--blue)]/30" },
    guest: { bg: "bg-[var(--surface)]", text: "text-[var(--muted)]", border: "border-[var(--border)]" },
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-white overflow-hidden pb-20">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--cyan)]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--blue)]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto relative z-10 pt-12 md:pt-16">
        
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 text-[var(--danger)] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
            <ShieldAlert className="w-4 h-4 animate-pulse" /> Director Level Access Only
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-4">
            Command <span className=")] text-[var(--text)]">Center</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl font-medium leading-relaxed">
            Welcome back, Director. Here is the latest global intelligence brief and system status overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`relative bg-[var(--surface)]/50  border border-[var(--border)] rounded-sm p-8 overflow-hidden group transition-all duration-500 hover:-translate-y-1 ${card.glow} ${card.border}`}
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24  ${card.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
              <div className="flex justify-between items-start mb-6">
                <p className="text-[12px] text-white/50 font-bold uppercase tracking-[0.2em]">{card.label}</p>
                <div className={`p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] ${card.text} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              {/* suppressHydrationWarning: toLocaleString is locale-sensitive; explicit "en-US"
                  keeps server and client output identical regardless of system locale. */}
              <p className={`text-5xl font-black  ${card.gradient} text-[var(--text)]  `} suppressHydrationWarning>
                {card.value.toLocaleString("en-US")}
              </p>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Clearances (Users Table) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-white/80 flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[var(--cyan)]" /> Recent Clearances
              </h2>
              <Link href="/admin/users" className="group flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--gold)] hover:text-yellow-300 transition-colors">
                View Roster <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="bg-[var(--surface)]/60 border border-[var(--border)] rounded-sm overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="divide-y divide-[var(--border)]/50 flex-1">
                {stats.recentUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <Users className="w-12 h-12 text-white/10 mb-4" />
                    <p className="text-white/40 text-[14px] font-medium">No active operatives found</p>
                  </div>
                ) : (
                  stats.recentUsers.map((u, i) => (
                    <div key={u._id} className="px-6 py-5 flex items-center gap-5 hover:bg-[var(--bg)]/50 transition-colors group">
                      <div className="relative">
                        <div className={`absolute inset-0  )] )] blur opacity-40 group-hover:opacity-70 transition-opacity rounded-full`} />
                        <div className="relative w-11 h-11 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-white font-bold text-[15px] z-10 shadow-inner">
                          {u.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[14px] font-bold truncate group-hover:text-[var(--cyan)] transition-colors">{u.name}</p>
                        <p className="text-white/50 text-[12px] truncate font-medium mt-0.5">{u.email}</p>
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${roleColors[u.role]?.border ?? roleColors.free.border} ${roleColors[u.role]?.text ?? roleColors.free.text} ${roleColors[u.role]?.bg ?? roleColors.free.bg} `}>
                        {u.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Directives (Quick Actions) */}
          <div className="lg:col-span-4 flex flex-col">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-white/80 flex items-center gap-2.5 mb-6">
              <LayoutDashboard className="w-4 h-4 text-[var(--gold)]" /> Directives
            </h2>
            
            <div className="flex flex-col gap-4">
              {[
                { href: "/admin/write", label: "Write Intel Report", desc: "Draft a new strategic analysis", icon: PenTool, color: "var(--cyan)" },
                { href: "/admin/users", label: "Manage Operatives", desc: "Update user clearances", icon: Users, color: "var(--blue)" },
                { href: "/admin/blogs", label: "Intelligence Archive", desc: "Edit or classify reports", icon: Newspaper, color: "var(--gold)" },
                { href: "/", label: "View Public Terminal", desc: "Access the front-facing site", icon: ExternalLink, color: "var(--text)" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group relative flex items-center gap-5 p-5 rounded-sm border border-[var(--border)] bg-[var(--surface)]/40 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 /0 /5 /0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                  
                  <div className="p-3 rounded-sm bg-[var(--bg)] border border-[var(--border)] group-hover:scale-110 transition-transform duration-300 shadow-inner" style={{ color: action.color }}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <p className="text-white text-[14px] font-bold uppercase tracking-[0.05em] mb-1 group-hover:text-[var(--text)] transition-all">
                      {action.label}
                    </p>
                    <p className="text-white/50 text-[12px] font-medium leading-relaxed">{action.desc}</p>
                  </div>
                </Link>
              ))}

              {/* Admin Lock Notice */}
              <div className="mt-4 p-5 rounded-sm bg-[var(--danger)]/5 border border-[var(--danger)]/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--danger)]" />
                <p className="text-[var(--danger)] text-[12px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4" /> Protocol Lockdown
                </p>
                <p className="text-white/60 text-[12.5px] leading-relaxed font-medium">
                  System restricted to <span className="text-white font-bold">Director-level access</span>. No unauthorized escalation allowed.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
