"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gc_cookie_consent");
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("gc_cookie_consent", "accepted");
    document.cookie = "gc_cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax";
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("gc_cookie_consent", "declined");
    document.cookie = "gc_cookie_consent=declined; max-age=31536000; path=/; SameSite=Lax";
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-in slide-in- duration-500">
      <div className="max-w-4xl mx-auto bg-[var(--elevated)] border border-[var(--border)] rounded-sm p-5 md:p-6 shadow-sm shadow-black/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-[var(--gold)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-1.5">Cookie Notice</h3>
            <p className="text-xs text-[var(--muted)] leading-[1.7] mb-4">
              We use essential cookies for site functionality and security, along with advertising cookies (Google AdSense) to display relevant ads and support our free content. By clicking &quot;Accept All&quot;, you consent to our use of cookies as described in our{" "}
              <Link href="/cookie-policy" className="text-[var(--gold)] hover:underline">Cookie Policy</Link> and{" "}
              <Link href="/privacy" className="text-[var(--gold)] hover:underline">Privacy Policy</Link>.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={acceptCookies}
                className="px-5 py-2.5 bg-[var(--gold)] text-[var(--bg)] text-xs font-bold uppercase tracking-[0.06em] rounded-lg hover:opacity-90 transition-opacity"
              >
                Accept All
              </button>
              <button
                onClick={declineCookies}
                className="px-5 py-2.5 bg-[var(--surface)] text-[var(--muted)] text-xs font-bold uppercase tracking-[0.06em] rounded-lg border border-[var(--border)] hover:text-white hover:bg-[var(--elevated)] transition-colors"
              >
                Essential Only
              </button>
              <Link
                href="/cookie-policy"
                className="text-xs text-[var(--muted)] hover:text-[var(--gold)] transition-colors underline underline-offset-2"
              >
                Learn More
              </Link>
            </div>
          </div>
          <button
            onClick={declineCookies}
            className="text-[var(--muted)] hover:text-white transition-colors shrink-0"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
