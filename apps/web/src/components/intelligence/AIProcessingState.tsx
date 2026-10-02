import React from 'react';
import { Loader2 } from 'lucide-react';

interface AIProcessingStateProps {
  status: "IDLE" | "PROCESSING" | "STREAMING" | "COMPLETE" | "ERROR";
  message?: string;
}

export function AIProcessingState({ status, message }: AIProcessingStateProps) {
  if (status === "IDLE" || status === "COMPLETE") return null;

  return (
    <div className="w-full flex flex-col items-center justify-center p-12 bg-[var(--surface)] rounded-sm border border-[var(--border)] relative overflow-hidden">
      {/* Background sweep */}
      <div className="absolute inset-0 -translate-x-[100%] animate-[shimmer_2s_infinite]" />
      
      {status === "PROCESSING" || status === "STREAMING" ? (
        <>
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-t-[var(--gold)] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-[var(--border)] border-b-[var(--cyan)] animate-spin-reverse" />
            <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-2">
            Chanakya Intelligence Core
          </h3>
          <p className="text-sm font-medium text-[var(--gold)] animate-pulse uppercase tracking-widest">
            {message || "Analyzing Strategic Context..."}
          </p>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--danger)]/10 border border-[var(--danger)]/30 flex items-center justify-center mx-auto mb-4 text-[var(--danger)]">
            !
          </div>
          <p className="text-sm text-[var(--danger)] font-bold uppercase tracking-widest">Analysis Failed</p>
        </div>
      )}
    </div>
  );
}
