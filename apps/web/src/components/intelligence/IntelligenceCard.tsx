import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { IntelligenceItem } from '@/lib/intelligence/types';
import { EntityChip } from './EntityChip';

const impactColors = {
  CRITICAL: "text-[#DC2626] border-[#DC2626]/50 bg-[#DC2626]/10",
  HIGH: "text-[var(--gold-dark)] border-[var(--gold-dark)]/50 bg-[var(--gold-dark)]/10",
  MEDIUM: "text-[var(--gold)] border-[var(--gold)]/50 bg-[var(--gold)]/10",
  LOW: "text-[var(--slate-200)] border-[var(--border-dark)] bg-[var(--navy-deep)]",
  NEUTRAL: "text-[var(--slate-200)] border-[var(--border-dark)] bg-[var(--navy-deep)]",
};

const riskColors = {
  SEVERE: "text-[#DC2626] border-[#DC2626]/50 bg-[#DC2626]/10",
  HIGH: "text-[var(--gold-dark)] border-[var(--gold-dark)]/50 bg-[var(--gold-dark)]/10",
  MODERATE: "text-[var(--gold)] border-[var(--gold)]/50 bg-[var(--gold)]/10",
  LOW: "text-[var(--slate-200)] border-[var(--border-dark)] bg-[var(--navy-deep)]",
};

export function IntelligenceCard({ item }: { item: IntelligenceItem }) {
  return (
    <article className="bg-[var(--navy-surface)] rounded-sm border border-[var(--border-dark)] overflow-hidden transition-all duration-300 hover:border-[var(--gold)] flex flex-col h-full group">
      
      {/* Header area */}
      <div className="px-5 py-4 border-b border-[var(--border-dark)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--slate-200)] bg-[var(--navy-deep)] px-2 py-1 rounded-sm border border-[var(--border-dark)]">
             {item.region}
           </span>
           <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--slate-200)]">
             {item.topic}
           </span>
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
           {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl md:text-2xl font-serif font-bold text-[var(--white)] mb-3 leading-tight group-hover:text-[var(--gold)] transition-colors">
          {item.headline}
        </h3>
        
        <div className="mb-5 flex-1">
          <p className="text-sm text-[var(--slate-100)] leading-relaxed mb-4">
            {item.summary}
          </p>
          <div className="bg-[var(--navy-deep)] p-4 rounded-sm border border-[var(--border-dark)]">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--slate-200)] mb-2">Why It Matters</h4>
            <p className="text-xs text-[var(--slate-200)] leading-relaxed">{item.whyItMatters}</p>
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
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border-dark)] mb-4">
            {item.entities.map(entity => (
              <EntityChip key={entity.id} entity={entity} />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer CTA */}
      <div className="px-5 py-4 bg-[var(--navy-deep)] border-t border-[var(--border-dark)] flex justify-between items-center">
         <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Confidence: <span className="text-[var(--white)]">{item.confidence}</span>
         </div>
         <Link href={`/intelligence/${item.id}`} className="text-xs font-bold text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors uppercase tracking-[0.1em] flex items-center gap-1.5">
            Read Intel <ArrowRight className="w-3.5 h-3.5" />
         </Link>
      </div>
    </article>
  );
}
