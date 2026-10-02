import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { IntelligenceItem } from '@/lib/intelligence/types';
import { EntityChip } from './EntityChip';

const impactColors = {
  CRITICAL: "text-[var(--danger)] border-[var(--danger)] bg-[var(--danger)]/10",
  HIGH: "text-orange-400 border-orange-400/50 bg-orange-400/10",
  MEDIUM: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  LOW: "text-green-400 border-green-400/50 bg-green-400/10",
  NEUTRAL: "text-[var(--muted)] border-[var(--border)] bg-[var(--surface)]",
};

const riskColors = {
  SEVERE: "text-[var(--danger)] border-[var(--danger)] bg-[var(--danger)]/10",
  HIGH: "text-orange-400 border-orange-400/50 bg-orange-400/10",
  MODERATE: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  LOW: "text-green-400 border-green-400/50 bg-green-400/10",
};

export function IntelligenceCard({ item }: { item: IntelligenceItem }) {
  return (
    <article className="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden transition-all duration-300 hover:border-[var(--accent)] bg-[var(--surface)]/30 flex flex-col h-full group">
      
      {/* Header area */}
      <div className="px-5 py-4 border-b border-[var(--border)]/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cyan)] bg-[var(--cyan)]/10 px-2 py-1 rounded border border-[var(--border)]">
             {item.region}
           </span>
           <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
             {item.topic}
           </span>
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
           {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-[var(--gold)] transition-colors">
          {item.headline}
        </h3>
        
        <div className="mb-5 flex-1">
          <p className="text-sm text-white/80 leading-relaxed mb-4">
            {item.summary}
          </p>
          <div className="bg-[var(--bg)]/50 p-4 rounded-sm border border-[var(--border)]">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">Why It Matters</h4>
            <p className="text-xs text-white/70 leading-relaxed">{item.whyItMatters}</p>
          </div>
        </div>

        {/* Indicators */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`p-3 rounded-sm border ${impactColors[item.indiaImpact]}`}>
             <div className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-80 mb-1">India Impact</div>
             <div className="font-extrabold text-sm">{item.indiaImpact}</div>
          </div>
          <div className={`p-3 rounded-sm border ${riskColors[item.riskLevel]}`}>
             <div className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-80 mb-1">Regional Risk</div>
             <div className="font-extrabold text-sm">{item.riskLevel}</div>
          </div>
        </div>
        
        {/* Entities */}
        {item.entities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]/50 mb-4">
            {item.entities.map(entity => (
              <EntityChip key={entity.id} entity={entity} />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer CTA */}
      <div className="px-5 py-4 bg-[var(--bg)]/80 border-t border-[var(--border)] flex justify-between items-center">
         <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
            Confidence: <span className="text-white">{item.confidence}</span>
         </div>
         <Link href={`/intelligence/${item.id}`} className="text-xs font-bold text-[var(--gold)] hover:text-yellow-300 transition-colors uppercase tracking-[0.1em] flex items-center gap-1.5">
            Read Intel <ArrowRight className="w-3.5 h-3.5" />
         </Link>
      </div>
    </article>
  );
}
