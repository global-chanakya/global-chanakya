"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { LogIn, UserPlus, Lock } from "lucide-react";

interface GatedArticleContentProps {
  content: string;
  isLoggedIn: boolean;
  slug: string;
}

export default function GatedArticleContent({
  content,
  isLoggedIn,
  slug,
}: GatedArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGate, setShowGate] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);
  const storageKey = `article-progress-${slug}`;
  const THRESHOLD = 0.5; // 50%

  // Restore scroll position after login (or on page refresh)
  useEffect(() => {
    try {
      const savedPosition = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
      if (savedPosition) {
        // Prevent jarring flash by restoring immediately
        window.scrollTo({ top: parseInt(savedPosition, 10), behavior: "instant" });
        if (isLoggedIn) {
          // If logged in, clean up
          sessionStorage.removeItem(storageKey);
          localStorage.removeItem(storageKey);
        } else {
          // If guest and they have a position, we should show the gate because they were already gated
          setShowGate(true);
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
    setHasRestored(true);
  }, [isLoggedIn, storageKey]);

  const handleScroll = useCallback(() => {
    if (isLoggedIn || showGate || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const contentHeight = containerRef.current.scrollHeight;
    
    // Scrolled amount within the container
    const scrolled = -rect.top + window.innerHeight;
    
    if (scrolled >= contentHeight * THRESHOLD) {
      setShowGate(true);
      // Save position to both in case sessionStorage clears unexpectedly
      const pos = window.scrollY.toString();
      sessionStorage.setItem(storageKey, pos);
      localStorage.setItem(storageKey, pos);
    }
  }, [isLoggedIn, showGate, storageKey]);

  useEffect(() => {
    if (isLoggedIn) return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Dynamic recalculation for images/iframes loading
    const observer = new ResizeObserver(() => {
      handleScroll();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [isLoggedIn, handleScroll]);

  // Don't render until we attempt restoration to avoid layout jumps
  if (!hasRestored) {
    return <div className="min-h-[50vh]" />;
  }

  return (
    <div 
      className={`relative ${showGate ? "max-h-[60vh] overflow-hidden" : ""}`}
      ref={containerRef}
    >
      <div 
        className={`article-body transition-all duration-1000 ${
          showGate ? "blur-md pointer-events-none select-none opacity-50" : ""
        }`} 
        dangerouslySetInnerHTML={{ __html: content }} 
      />

      {showGate && (
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] )] flex items-end justify-center pb-8 z-30 pointer-events-auto">
          <div className="bg-[var(--surface)] max-w-md w-full mx-4 p-8 rounded-lg border border-[var(--border)] shadow-sm flex flex-col items-center text-center animate-in fade-in slide-in- duration-500">
            <div className="w-12 h-12 rounded-full bg-[var(--gold)]/20 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-[var(--gold)]" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              Keep Reading
            </h3>
            
            <p className="text-[var(--secondary)] mb-8 leading-relaxed">
              Log in to continue reading this article and unlock personalized features like saving, liking, and reading history.
            </p>
            
            <div className="w-full flex flex-col gap-3">
              <Link 
                href="/auth/signin" 
                className="w-full py-3 px-4 rounded-md bg-[var(--gold)] text-black font-bold flex items-center justify-center gap-2 hover:bg-[#d4af37] transition-colors"
                onClick={() => {
                  const pos = window.scrollY.toString();
                  sessionStorage.setItem(storageKey, pos);
                  localStorage.setItem(storageKey, pos);
                }}
              >
                <LogIn className="w-4 h-4" /> Log In to Continue
              </Link>
              
              <Link 
                href="/auth/signup" 
                className="w-full py-3 px-4 rounded-md bg-transparent border border-[var(--border)] text-white font-bold flex items-center justify-center gap-2 hover:bg-[var(--surface)] transition-colors"
                onClick={() => {
                  const pos = window.scrollY.toString();
                  sessionStorage.setItem(storageKey, pos);
                  localStorage.setItem(storageKey, pos);
                }}
              >
                <UserPlus className="w-4 h-4" /> Create Free Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
