"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Users, Newspaper, PenTool, Settings, LogOut, ShieldAlert, TrendingUp, FileText, Activity, Image as ImageIcon, Zap, Radio, Database, Globe } from "lucide-react";

export const navItems = [
  // Dashboard
  { href: "/gc-control-9x7k", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },

  // Content
  { href: "/gc-control-9x7k/blogs", label: "Intelligence Archive", icon: Newspaper, group: "Content" },
  { href: "/gc-control-9x7k/write", label: "Write Report", icon: PenTool, group: "Content" },

  // Platform SEO
  { href: "/gc-control-9x7k/platform-seo", label: "All Platform SEO", icon: Globe, group: "Platform SEO" },
  { href: "/gc-control-9x7k/platform-seo/new", label: "Create Platform SEO", icon: PenTool, group: "Platform SEO" },
  { href: "/gc-control-9x7k/platform-seo/gsc", label: "GSC Intelligence", icon: Activity, group: "Platform SEO" },

  // Intelligence
  { href: "/gc-control-9x7k/intelligence", label: "Live Events", icon: Zap, group: "Intelligence" },
  { href: "/gc-control-9x7k/intelligence/countries", label: "Countries", icon: Database, group: "Intelligence" },
  { href: "/gc-control-9x7k/intelligence/leaders", label: "Leaders", icon: Database, group: "Intelligence" },
  { href: "/gc-control-9x7k/intelligence/conflicts", label: "Conflicts", icon: Database, group: "Intelligence" },
  { href: "/gc-control-9x7k/intelligence/entity-resolution", label: "Entity Resolution", icon: Database, group: "Intelligence" },
  { href: "/gc-control-9x7k/intelligence/config", label: "System Config", icon: Database, group: "Intelligence" },
  { href: "/gc-control-9x7k/intelligence/trigger", label: "Manual Trigger", icon: Zap, group: "Intelligence" },

  // Media & Growth (Temporarily disabled due to 404s)
  // { href: "/gc-control-9x7k/media", label: "Media Library", icon: ImageIcon, group: "Assets" },
  // { href: "/gc-control-9x7k/growth", label: "Growth", icon: TrendingUp, group: "Assets" },

  // Admin
  { href: "/gc-control-9x7k/users", label: "Operatives", icon: Users, group: "Admin" },
  // { href: "/gc-control-9x7k/audit", label: "Audit Logs", icon: FileText, group: "Admin" },
  // { href: "/gc-control-9x7k/health", label: "Health", icon: Activity, group: "Admin" },
  { href: "/gc-control-9x7k/settings", label: "Settings", icon: Settings, group: "Admin" },
];

export default function AdminSidebar({ user }: { user: { name?: string; email?: string; image?: string } }) {
  const pathname = usePathname();

  // Group the nav items
  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <aside className="w-[280px] min-w-[280px] h-screen bg-[var(--surface)]/60 backdrop-blur-3xl border-r border-[var(--border)] flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--cyan)]/5 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="px-6 py-6 border-b border-[var(--border)]/50 relative z-10">
        <Link href="/gc-control-9x7k" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--gold)]/20 blur-md rounded-full group-hover:bg-[var(--gold)]/40 transition-colors" />
            <Image
              src="/icon.svg"
              alt="GC"
              width={32}
              height={32}
              className="relative z-10"
            />
          </div>
          <div>
            <p className="text-white font-black text-[15px] tracking-[-0.03em] leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">Global Chanakya</p>
            <p className="text-[var(--gold)] text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" /> Command
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar relative z-10">
        <div className="space-y-8">
          {Object.entries(groupedNavItems).map(([group, items]) => (
            <div key={group}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">{group}</p>
              <div className="space-y-1">
                {items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-bold uppercase tracking-[0.05em] transition-all group relative overflow-hidden ${
                        active
                          ? "text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/10 to-transparent border border-[var(--gold)]/20 rounded-xl" />
                      )}
                      {!active && (
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      )}
                      
                      <Icon className={`w-4 h-4 relative z-10 transition-colors ${active ? "text-[var(--gold)]" : "group-hover:text-[var(--gold)]/70"}`} />
                      <span className="relative z-10">{item.label}</span>
                      
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_8px_var(--gold)] relative z-10" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[var(--border)]/50 bg-[var(--bg)]/50 relative z-10">
        <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[var(--surface)]/80 border border-[var(--border)] shadow-xl mb-3 group hover:border-white/20 transition-colors">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--cyan)]/20 blur-md rounded-full" />
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" src={user.image} alt="" className="relative z-10 w-9 h-9 rounded-full ring-2 ring-[var(--cyan)]/40" />
            ) : (
              <div className="relative z-10 w-9 h-9 rounded-full bg-[var(--cyan)]/20 border border-[var(--cyan)]/40 flex items-center justify-center text-[var(--cyan)] font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-bold truncate group-hover:text-[var(--cyan)] transition-colors">{user.name}</p>
            <p className="text-white/40 text-[11px] font-medium truncate mt-0.5">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/30 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4" /> Disconnect
        </button>
      </div>
    </aside>
  );
}
