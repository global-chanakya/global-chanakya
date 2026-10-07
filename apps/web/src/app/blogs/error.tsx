"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function EntityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Entity Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/[0.02] border border-red-500/20 rounded-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-sm flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <h1 className="text-xl font-bold text-white mb-2">Load Failed</h1>
        <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
          We couldn't load this page. The data may be temporarily unavailable.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 font-bold rounded-sm hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white font-medium rounded-sm hover:bg-white/10 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
