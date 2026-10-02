import React from "react";
import { AlertTriangle } from "lucide-react";

interface RiskBlockProps {
  level: "Low" | "Medium" | "High" | "Critical";
  assessment: string;
}

export function RiskBlock({ level, assessment }: RiskBlockProps) {
  if (!assessment) return null;

  const colorMap = {
    Low: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    Medium: "text-orange-400 border-orange-500/30 bg-orange-500/5",
    High: "text-red-400 border-red-500/30 bg-red-500/5",
    Critical: "text-purple-400 border-purple-500/30 bg-purple-500/5",
  };

  return (
    <section className={`my-8 p-5 border rounded-sm ${colorMap[level]} `} aria-label="Risk Assessment">
      <header className="flex items-center gap-3 mb-3">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Risk Assessment: <span className="font-extrabold">{level}</span>
        </h3>
      </header>
      <div className="text-sm text-gray-300 leading-relaxed font-medium">
        {assessment}
      </div>
    </section>
  );
}
