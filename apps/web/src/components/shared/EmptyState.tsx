import { ShieldAlert } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ 
  title, 
  description, 
  icon = <ShieldAlert className="w-8 h-8 text-[var(--muted)]" />, 
  actionLabel, 
  actionHref 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-sm border border-dashed border-[var(--border)] bg-[var(--surface)]/30">
      <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-[var(--muted)] max-w-md mb-8 leading-[1.6]">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="px-6 py-3 intel-border bg-[var(--surface)] text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--elevated)] transition-colors rounded-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
