import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AIAnswerSectionProps {
  title: string;
  content: string | string[];
  type?: "text" | "list";
  highlight?: boolean;
}

export function AIAnswerSection({ title, content, type = "text", highlight = false }: AIAnswerSectionProps) {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;

  return (
    <div className={`p-6 rounded-sm border ${highlight ? 'border-[var(--accent)] bg-[var(--gold)]/5 ' : 'border-[var(--border)] bg-[var(--surface)]/50'} mb-6`}>
      <h3 className={`text-xs font-extrabold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${highlight ? 'text-[var(--gold)]' : 'text-[var(--cyan)]'}`}>
        {highlight && <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />}
        {title}
      </h3>
      
      {type === "text" ? (
        <p className="text-white/90 leading-relaxed text-sm md:text-base">
          {content}
        </p>
      ) : (
        <ul className="space-y-3">
          {(content as string[]).map((item, i) => (
            <li key={i} className="flex gap-3 text-sm md:text-base text-white/90 leading-relaxed">
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${highlight ? 'text-[var(--gold)]' : 'text-[var(--cyan)]/50'}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
