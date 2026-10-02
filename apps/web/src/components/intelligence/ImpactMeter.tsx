import React from 'react';
import { ImpactDimension } from '@/lib/intelligence/types';
import { Zap, ArrowLeftRight, Shield, Globe, Ship, TrendingUp, TriangleAlert, ShieldAlert } from 'lucide-react';

const getIcon = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("energy")) return <Zap className="w-4 h-4" />;
  if (normalized.includes("trade")) return <ArrowLeftRight className="w-4 h-4" />;
  if (normalized.includes("defence")) return <Shield className="w-4 h-4" />;
  if (normalized.includes("diplomacy")) return <Globe className="w-4 h-4" />;
  if (normalized.includes("shipping")) return <Ship className="w-4 h-4" />;
  if (normalized.includes("economy")) return <TrendingUp className="w-4 h-4" />;
  if (normalized.includes("autonomy")) return <ShieldAlert className="w-4 h-4" />;
  if (normalized.includes("security")) return <TriangleAlert className="w-4 h-4" />;
  return <TriangleAlert className="w-4 h-4" />; // default
};

const impactColors = {
  CRITICAL: "bg-[var(--danger)] text-white  border-[var(--danger)]",
  HIGH: "bg-orange-500 text-white  border-orange-500",
  MEDIUM: "bg-yellow-500 text-[var(--bg)]  border-yellow-500",
  LOW: "bg-green-500 text-[var(--bg)] border-green-500",
  NEUTRAL: "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]",
};

const barWidths = {
  CRITICAL: "100%",
  HIGH: "75%",
  MEDIUM: "50%",
  LOW: "25%",
  NEUTRAL: "10%",
};

export function ImpactMeter({ dimension }: { dimension: ImpactDimension }) {
  return (
    <div className="flex flex-col p-4 rounded-sm bg-[var(--surface)]/30 border border-[var(--border)] group hover:border-[var(--accent)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] text-[var(--cyan)]">
            {getIcon(dimension.name)}
          </div>
          <span className="font-bold text-white text-sm tracking-tight">{dimension.name}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.15em] border ${impactColors[dimension.level]}`}>
          {dimension.level}
        </span>
      </div>
      
      {/* Meter Bar */}
      <div className="w-full h-1.5 bg-[var(--bg)] rounded-full mb-3 overflow-hidden border border-[var(--border)]">
         <div 
           className={`h-full rounded-full transition-all duration-1000 ${impactColors[dimension.level].split(' ')[0]}`} 
           style={{ width: barWidths[dimension.level] }}
         />
      </div>

      <p className="text-xs text-white/70 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
        {dimension.description}
      </p>
    </div>
  );
}
