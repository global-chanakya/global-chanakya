import React from 'react';
import { ScenarioPhase } from '@/lib/intelligence/types';
import { Clock } from 'lucide-react';

export function ScenarioTimeline({ phases }: { phases: ScenarioPhase[] }) {
  if (!phases || phases.length === 0) return null;

  return (
    <div className="relative pl-6 md:pl-8 py-4">
      {/* Vertical line */}
      <div className="absolute left-[11px] md:left-[15px] top-4 bottom-4 w-px )]/30" />
      
      <div className="space-y-10">
        {phases.map((phase, index) => (
          <div key={index} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-[30px] md:-left-[39px] top-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[var(--surface)] border-2 border-[var(--cyan)] flex items-center justify-center z-10 group-hover:bg-[var(--cyan)] transition-colors">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-[var(--cyan)] group-hover:text-[var(--bg)] transition-colors" />
            </div>
            
            <div className="bg-[var(--surface)] p-5 rounded-sm border border-[var(--border)] group-hover:border-[var(--border)] transition-colors">
              <span className="inline-block px-2.5 py-1 mb-3 rounded bg-[var(--cyan)]/10 text-[var(--cyan)] border border-[var(--border)] text-[10px] font-extrabold uppercase tracking-[0.2em]">
                {phase.timeframe}
              </span>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                {phase.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
