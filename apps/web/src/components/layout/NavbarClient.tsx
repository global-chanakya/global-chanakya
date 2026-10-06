"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, LayoutDashboard, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const SearchModal = dynamic(() => import("../shared/SearchModal"));
import { logoutAction } from "@/app/actions";
import LiveUpdatesButton from "../notifications/LiveUpdatesButton";

interface NavbarClientProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  } | null;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Reports", href: "/blogs" },
  { label: "Topics", href: "/topics" },
  { label: "About", href: "/about" },
];

export default function NavbarClient({ session }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const close = () => setProfileOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [profileOpen]);

  return (
    <nav className={`sticky top-0 z-50 w-full bg-[var(--navy-deep)]/95 border-b border-[var(--border-dark)] flex items-center transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-1.5 md:gap-4 md:min-w-[240px] group">
          <Image
            src="/icon.svg"
            alt="Global Chanakya"
            width={48}
            height={48}
            className={`rounded-lg md:rounded-sm group-hover:scale-105 transition-transform duration-300 ${scrolled ? 'w-8 h-8 md:w-10 md:h-10' : 'w-8 h-8 md:w-12 md:h-12'}`}
          />
          <div className="flex flex-col leading-none gap-0.5 md:gap-1">
            <span className="text-[16px] md:text-[28px] font-serif font-bold tracking-[-0.03em] text-[var(--white)]">
              Global Chanakya
            </span>
            <span className="text-[8px] md:text-[11px] font-bold text-[var(--slate-200)] tracking-[0.22em] uppercase">
              Intelligence
            </span>
          </div>
        </Link>

        {/* Center: Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex items-center py-2 text-sm font-semibold tracking-[0.06em] uppercase transition-colors duration-200 group after:absolute after:left-0 after:bottom-[-8px] after:h-[2px] after:w-full after:bg-[var(--gold)] after:scale-x-0 hover:after:scale-x-100 active:after:scale-x-100 after:transition-transform after:origin-left after:duration-300 ${
                  isActive ? "text-[var(--gold)] after:scale-x-100" : "text-[var(--text-secondary)] hover:text-[var(--white)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Search, Status, Auth */}
        <div className="hidden lg:flex items-center gap-5">
          {/* Status Pill Removed */}

          <LiveUpdatesButton />

          <button 
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            className="text-[var(--secondary)] hover:text-white transition-colors ml-2"
          >
            <Search className="w-5 h-5" />
          </button>

          {session ? (
            <div className="relative flex items-center gap-5 pl-5 border-l border-[var(--border)]/50">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)] rounded-md hover:bg-[var(--gold)]/20 transition-colors uppercase tracking-wider"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  Admin
                </Link>
              )}

              {/* Profile button */}
              <button
                onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                className="flex items-center gap-2.5 px-2 py-1 rounded-md hover:bg-[var(--navy-surface)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--navy-surface)] border border-[var(--border-dark)] flex items-center justify-center text-[12px] font-bold text-[var(--white)]">
                  {(session.user?.name || "U")[0].toUpperCase()}
                </div>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-4 w-56 py-2 rounded-sm bg-[var(--elevated)] intel-border shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-[13px] font-bold text-white truncate">{session.user?.name}</p>
                    <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--white)] hover:bg-[var(--navy-surface)] transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <form action={logoutAction} className="w-full">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-[var(--danger)] hover:bg-[var(--surface)] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Secure Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-5 pl-5 border-l border-[var(--border)]/50">
              <Link
                href="/auth/signin"
                className="px-5 py-3 text-sm font-bold uppercase tracking-wider text-[var(--secondary)] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-7 py-3 bg-[var(--gold)] text-[var(--navy-deep)] text-sm font-bold uppercase tracking-wider rounded-sm hover:bg-[var(--gold-light)] transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button 
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            className="p-2 text-[var(--secondary)] hover:text-white rounded-md transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="p-2 text-[var(--secondary)] hover:text-white rounded-md transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 w-full lg:hidden border-b border-[var(--border)] bg-[var(--bg)]/95">
          <div className="px-6 py-6 space-y-2">
            <div className="pb-4">
              <LiveUpdatesButton />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-md text-[14px] font-bold uppercase tracking-wider transition-colors ${
                  pathname === link.href
                    ? "text-[var(--gold)] bg-[var(--navy-surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--white)] hover:bg-[var(--navy-surface)]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-6 mt-6 border-t border-[var(--border)]">
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--navy-surface)] border border-[var(--border-dark)] flex items-center justify-center text-sm font-bold text-[var(--white)]">
                      {(session.user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-white">{session.user?.name}</p>
                      <p className="text-[12px] text-[var(--muted)]">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-md text-[14px] font-bold uppercase tracking-wider text-[var(--secondary)] hover:text-white hover:bg-[var(--surface)] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-md text-[14px] font-bold uppercase tracking-wider text-[var(--danger)] hover:bg-[var(--surface)] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Secure Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-md border border-[var(--border)] text-[14px] font-bold uppercase tracking-wider text-[var(--secondary)] hover:text-white hover:bg-[var(--surface)] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-sm bg-[var(--gold)] text-[var(--navy-deep)] text-[14px] font-bold uppercase tracking-wider hover:bg-[var(--gold-light)] transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
      )}
    </nav>
  );
}
