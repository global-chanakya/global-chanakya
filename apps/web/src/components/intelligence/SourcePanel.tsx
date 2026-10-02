import React from 'react';
import { IntelligenceSource } from '@/lib/intelligence/types';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export function SourcePanel({ 
  sources, 
  methodology, 
  confidence 
}: { 
  sources: IntelligenceSource[], 
  methodology?: string,
  confidence: string
}) {
  return (
    <div className="mt-8 pt-8 border-t border-[var(--border)]/50">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-[var(--gold)]" />
        <h3 className="text-sm font-extrabold text-white tracking-[0.15em] uppercase">Intelligence Provenance</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.15em] mb-3">Primary Sources</h4>
          <ul className="space-y-3">
            {sources.map((source, i) => (
              <li key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--surface)]/50 border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white flex items-center gap-2 hover:text-[var(--cyan)] transition-colors">
                      {source.name}
                      <ExternalLink className="w-3 h-3 text-[var(--muted)]" />
                    </a>
                  ) : (
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      {source.name}
                    </span>
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--cyan)] bg-[var(--cyan)]/10 px-1.5 py-0.5 rounded">
                    {source.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-[var(--muted)] uppercase tracking-wider mt-1">
                  <span>Published: {new Date(source.publishedTime).toLocaleDateString()}</span>
                  <span>Retrieved: {new Date(source.retrievedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex flex-col gap-4">
           {methodology && (
             <div className="p-4 rounded-sm border border-[var(--border)] bg-[var(--surface)]/30">
               <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.15em] mb-2">Methodology</h4>
               <p className="text-xs text-white/70 leading-relaxed">{methodology}</p>
             </div>
           )}
           
           <div className="p-4 rounded-sm border border-[var(--accent)] bg-[var(--gold)]/5 flex items-center justify-between">
             <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.15em]">Overall Confidence</span>
             <span className="text-xs font-extrabold text-[var(--gold)] uppercase tracking-[0.15em]">{confidence}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
