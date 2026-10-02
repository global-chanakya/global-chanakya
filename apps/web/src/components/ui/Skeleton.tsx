import React from "react";

export function Skeleton({
  className = "",
  variant = "text",
  pulse = true,
  ...props
}: {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  pulse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const baseClass = "bg-[var(--border)]/40 overflow-hidden relative";
  
  const variantClass = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-sm"
  }[variant];
  
  // Custom subtle shimmer animation using CSS
  const animationClass = pulse ? "animate-pulse" : "";

  return (
    <div
      className={`${baseClass} ${variantClass} ${animationClass} ${className}`}
      {...props}
    >
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col h-full bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden bg-[var(--surface)]/20 p-5 md:p-6 lg:p-7">
      <Skeleton variant="rectangular" className="w-full aspect-[16/9] -mx-5 -mx-6 -mx-7 -mt-5 -mt-6 -mt-7 mb-4 md:mb-5" />
      <Skeleton className="w-16 h-5 mb-4" />
      <Skeleton className="w-full h-6 mb-2" />
      <Skeleton className="w-3/4 h-6 mb-4" />
      <Skeleton className="w-full h-3 mb-2" />
      <Skeleton className="w-full h-3 mb-2" />
      <Skeleton className="w-2/3 h-3 mb-6" />
      <div className="mt-auto pt-4 border-t border-[var(--border)]/50 flex items-center justify-between">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}

export function SkeletonIntelligenceCard() {
  return (
    <div className="flex flex-col h-full bg-[var(--surface)] rounded-sm border border-[var(--border)] bg-[var(--surface)]/20 p-6 md:p-8 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6 rounded" />
          <Skeleton className="w-24 h-6 rounded" />
        </div>
        <Skeleton className="w-20 h-4" />
      </div>
      <Skeleton className="w-full h-7 mb-2" />
      <Skeleton className="w-4/5 h-7 mb-4" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-2/3 h-4 mb-6" />
      <div className="mt-auto border-t border-[var(--border)] pt-4">
        <Skeleton className="w-32 h-4 mb-2" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-20 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 md:mb-12 border-b border-[var(--border)] pb-6">
      <Skeleton className="w-32 h-6 mb-4" />
      <Skeleton className="w-3/4 max-w-lg h-10 md:h-12 mb-4" />
      <Skeleton className="w-full max-w-2xl h-5" />
    </div>
  );
}
