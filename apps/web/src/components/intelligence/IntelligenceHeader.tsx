import React from 'react';
import { Crosshair } from 'lucide-react';

interface IntelligenceHeaderProps {
  title: string;
  subtitle: string;
  live?: boolean;
}

export function IntelligenceHeader({ title, subtitle, live = false }: IntelligenceHeaderProps) {
  return (
    <div className="flex flex-col mb-8 md:mb-12 border-b border-[var(--border)] pb-6 pt-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
          <Crosshair className="w-5 h-5 md:w-6 md:h-6 text-[var(--gold)] drop-" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase leading-none">
              {title}
            </h1>
            {live && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[9px] font-bold uppercase tracking-[0.15em] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]"></span> Live
              </span>
            )}
          </div>
          <p className="text-[var(--muted)] text-[11px] md:text-xs mt-2 uppercase tracking-[0.14em] font-bold">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
