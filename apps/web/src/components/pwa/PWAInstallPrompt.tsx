"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(true); // Default true to avoid flash
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showManualInstruction, setShowManualInstruction] = useState(false);

  useEffect(() => {
    // 1. Detect Standalone
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      // @ts-ignore
      const isStandaloneNavigator = window.navigator.standalone === true;
      return isStandaloneMedia || isStandaloneNavigator;
    };

    if (checkStandalone()) {
      return; // Already installed, do not show
    }
    
    setIsStandalone(false);

    // 2. Check session dismissal
    if (sessionStorage.getItem("gc_pwa_prompt_dismissed") === "true") {
      return;
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Listen for native beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Listen for successful install
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // Delay popup slightly
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  // Auto-hide popup after 3 seconds if no manual instruction is showing
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    if (showPrompt && !showManualInstruction) {
      hideTimer = setTimeout(() => {
        setShowPrompt(false);
        sessionStorage.setItem("gc_pwa_prompt_dismissed", "true");
      }, 3000);
    }
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [showPrompt, showManualInstruction]);

  const handlePrimaryClick = async () => {
    if (showManualInstruction) {
      // "Got It" clicked
      handleDismiss();
      return;
    }

    if (isIOS || !deferredPrompt) {
      setShowManualInstruction(true);
      return;
    }

    // Trigger native prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("gc_pwa_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-[var(--elevated)] border border-[var(--border)] rounded-sm shadow-sm p-5 z-[100] flex flex-col gap-3 animate-in slide-in- fade-in duration-300">
      <div className="flex justify-between items-start">
        <h3 className="text-[14px] font-bold text-white tracking-wide">
          Install Global Chanakya
        </h3>
        <button 
          onClick={handleDismiss}
          className="text-[var(--muted)] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-[13px] text-[var(--secondary)] leading-relaxed">
        {isIOS 
          ? "Add Global Chanakya to your Home Screen for quick access." 
          : "Get faster access to the latest reports, analysis and platform updates."}
      </p>

      {showManualInstruction && (
        <div className="bg-[var(--surface)] p-3 border border-[var(--border)] rounded-md flex items-center gap-2 mt-1">
          {isIOS ? (
            <p className="text-[12px] text-white leading-snug">
              Tap <strong className="text-[var(--gold)]">Share</strong> → <strong className="text-[var(--gold)]">Add to Home Screen</strong>.
            </p>
          ) : (
            <p className="text-[12px] text-white leading-snug">
              Open your browser menu and choose <strong className="text-[var(--gold)]">Add to Home screen</strong> or <strong className="text-[var(--gold)]">Install app</strong>.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button
          onClick={handlePrimaryClick}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--gold)] text-[var(--bg)] text-[12px] font-bold uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
        >
          {!showManualInstruction && <Download className="w-3.5 h-3.5" />}
          {showManualInstruction ? "Got It" : (isIOS ? "How to Install" : "Install App")}
        </button>
        {!showManualInstruction && (
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 text-[12px] font-bold text-[var(--secondary)] hover:text-white border border-[var(--border)] rounded-md hover:border-white transition-colors uppercase tracking-wider"
          >
            Maybe Later
          </button>
        )}
      </div>
    </div>
  );
}
