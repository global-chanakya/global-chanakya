import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function IntelligenceEventLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12">
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-8">
          <Skeleton className="w-24 h-6 rounded uppercase mb-6" />
          <Skeleton className="w-full h-12 md:h-16 mb-4" />
          <Skeleton className="w-4/5 h-12 md:h-16 mb-6" />
          
          <div className="flex items-center gap-6 py-4 border-y border-[var(--border)] mb-8">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-40 h-5" />
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-sm mb-10 border border-[var(--border)]">
            <Skeleton className="w-48 h-6 mb-4" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-5/6 h-4" />
          </div>

          <div className="space-y-4">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
