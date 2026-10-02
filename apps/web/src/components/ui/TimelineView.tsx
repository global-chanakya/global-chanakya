import { Calendar, AlertCircle } from "lucide-react";

export interface TimelineEventProp {
  _id: string;
  title: string;
  description: string;
  eventDate: string | Date;
  severity: "critical" | "major" | "normal" | "minor";
  tags: string[];
}

export function TimelineView({ events }: { events: TimelineEventProp[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-white/10 rounded-sm bg-white/[0.01]">
        <p className="text-neutral-500">No timeline events recorded yet.</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-500 bg-red-500/10 text-red-500";
      case "major": return "border-amber-500 bg-amber-500/10 text-amber-500";
      case "minor": return "border-blue-500 bg-blue-500/10 text-blue-500";
      default: return "border-white/20 bg-white/5 text-neutral-300";
    }
  };

  return (
    <div className="relative border-l border-white/10 ml-4 py-4 space-y-10">
      {events.map((event) => (
        <div key={event._id} className="relative pl-8 group">
          <div className={`absolute -left-2.5 top-1.5 w-5 h-5 rounded-full border-4 border-[#060606] ${getSeverityColor(event.severity).split(' ')[1]}`} />
          
          <div className="flex items-center gap-3 text-[13px] font-medium text-neutral-400 mb-2">
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(event.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            {event.severity === "critical" && (
              <span className="flex items-center gap-1 text-red-500 uppercase tracking-wider text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Critical
              </span>
            )}
          </div>
          
          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
            {event.title}
          </h4>
          
          <p className="text-neutral-400 text-[14.5px] leading-relaxed mb-4">
            {event.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[11px] font-medium text-neutral-500">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
