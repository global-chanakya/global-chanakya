import React from "react";
import { Telescope } from "lucide-react";

interface FutureOutlookProps {
  outlook: string;
  scenarios?: string[];
}

export function FutureOutlook({ outlook, scenarios }: FutureOutlookProps) {
  if (!outlook) return null;

  return (
    <section className="my-10 p-6 border border-gray-800 rounded-lg" aria-label="Future Outlook">
      <header className="flex items-center gap-3 mb-4">
        <Telescope className="w-6 h-6 text-indigo-400" />
        <h3 className="text-lg font-extrabold text-white">Strategic Forecast & Future Outlook</h3>
      </header>
      <div className="text-gray-300 leading-relaxed mb-6">
        {outlook}
      </div>
      
      {scenarios && scenarios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((scenario, idx) => (
            <div key={idx} className="p-4 rounded-sm bg-gray-800/50 border border-gray-700/50">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Scenario {idx + 1}</span>
              <p className="text-sm text-gray-200">{scenario}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
