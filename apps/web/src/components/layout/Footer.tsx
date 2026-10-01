import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter } from "lucide-react";

// currentYear is computed at server render time. It matches the client at any reasonable
// page load time (same UTC date). suppressHydrationWarning is intentional here: the year
// is genuinely time-dependent and cannot meaningfully differ between SSR and hydration
// within the same page request.
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05070F] border-t border-[#0E1A36] pt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-14 mb-20">
          
          {/* Column 1: Brand Block */}
          <div className="lg:col-span-2 flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Image
                src="/icon.svg"
                alt="Global Chanakya"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col leading-none gap-1">
                <span className="text-[28px] font-bold tracking-[-0.03em] text-white">
                  Global Chanakya
                </span>
                <span className="text-[11px] font-bold text-[var(--gold)] tracking-[0.22em] uppercase">
                  Intelligence
                </span>
              </div>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-[1.7] mb-6">
              Independent geopolitical intelligence, strategic analysis and research on the developments reshaping global power.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/globalchanaky?stkn=MTRwaDFxaTl0dHRpMw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold-hover)] hover:border-[var(--gold-hover)] hover:bg-[var(--gold)]/10 transition-all duration-300 group"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a 
                href="https://www.linkedin.com/company/global-chanakya/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold-hover)] hover:border-[var(--gold-hover)] hover:bg-[var(--gold)]/10 transition-all duration-300 group"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a 
                href="https://x.com/GChanakyaIntel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold-hover)] hover:border-[var(--gold-hover)] hover:bg-[var(--gold)]/10 transition-all duration-300 group"
                aria-label="Follow us on X"
              >
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Explore</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/intelligence" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Intelligence</Link></li>
              <li><Link href="/blogs" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Reports</Link></li>
              <li><Link href="/topics" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Topics</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Company</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">About</Link></li>
              <li><Link href="/careers" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4: Standards */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Standards</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/methodology" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Methodology</Link></li>
              <li><Link href="/source-verification" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Source Verification</Link></li>
              <li><Link href="/editorial-policy" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Editorial Policy</Link></li>
              <li><Link href="/privacy" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">Terms</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-[#111827] py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)] tracking-wide" suppressHydrationWarning>
            © {currentYear} Global Chanakya Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="swg-preferred-sources-button" data-theme="dark"></div>
          </div>
        </div>

      </div>
    </footer>
  );
}
