"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 pt-20 pb-20">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-900/20 rounded-sm flex items-center justify-center mx-auto mb-8 border border-red-900/30">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">System Anomaly</h1>
        <p className="text-neutral-400 mb-8 leading-relaxed">
          Our intelligence array encountered an unexpected issue while processing your request. Please try again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Re-Initialize
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-neutral-900 text-neutral-300 font-medium hover:bg-neutral-800 hover:text-white transition-colors border border-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Base
          </Link>
        </div>
      </div>
    </div>
  );
}
