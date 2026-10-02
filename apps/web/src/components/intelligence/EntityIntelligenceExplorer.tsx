import React from 'react';
import { EntityIntelligence } from '@/lib/intelligence/types';
import { AIAnswerSection } from './AIAnswerSection';
import { Compass, ShieldAlert, Crosshair } from 'lucide-react';

export function EntityIntelligenceExplorer({ intelligence }: { intelligence: EntityIntelligence }) {
  if (!intelligence) return null;

  return (
    <div className="mt-12 pt-12 border-t border-[var(--border)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-sm bg-[var(--gold)]/10 flex items-center justify-center border border-[var(--accent)]">
          <Compass className="w-5 h-5 text-[var(--gold)]" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Strategic Intelligence Profile</h2>
          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">Chanakya Intelligence Core Assessment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <AIAnswerSection title="AI Assessment" content={intelligence.aiAssessment} highlight={true} />
          
          {intelligence.entityType === 'Country' && (
             <>
               <AIAnswerSection title="Strategic Position" content={intelligence.strategicPosition!} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <AIAnswerSection title="Economic Exposure" content={intelligence.economicExposure!} />
                 <AIAnswerSection title="Defence Considerations" content={intelligence.defenceConsiderations!} />
               </div>
               <AIAnswerSection title="Diplomatic Position" content={intelligence.diplomaticPosition!} />
             </>
          )}

          {intelligence.entityType === 'Leader' && (
             <>
               <AIAnswerSection title="Strategic Profile" content={intelligence.strategicProfile!} />
               <AIAnswerSection title="Foreign Policy" content={intelligence.foreignPolicy!} />
               <AIAnswerSection title="India Relations" content={intelligence.indiaRelations!} highlight={true} />
             </>
          )}

          {intelligence.entityType === 'Conflict' && (
             <>
               <AIAnswerSection title="Conflict Overview" content={intelligence.overview!} />
               <AIAnswerSection title="Current Status" content={intelligence.currentStatus!} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <AIAnswerSection title="Regional Impact" content={intelligence.regionalImpact!} />
                 <AIAnswerSection title="India Impact" content={intelligence.indiaImpact!} highlight={true} />
               </div>
             </>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-[var(--surface)] p-5 rounded-sm border border-[var(--border)]">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--danger)] mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Current Risks
              </h3>
              <ul className="space-y-3">
                {intelligence.currentRisks.map((risk, i) => (
                  <li key={i} className="text-sm text-white/80 leading-relaxed border-l-2 border-[var(--danger)]/50 pl-3">
                    {risk}
                  </li>
                ))}
              </ul>
           </div>

           <div className="bg-[var(--surface)] p-5 rounded-sm border border-[var(--border)]">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-400 mb-4 flex items-center gap-2">
                <Crosshair className="w-4 h-4" /> Possible Scenarios
              </h3>
              <ul className="space-y-3">
                {intelligence.possibleScenarios.map((scenario, i) => (
                  <li key={i} className="text-sm text-white/80 leading-relaxed border-l-2 border-purple-400/50 pl-3">
                    {scenario}
                  </li>
                ))}
              </ul>
           </div>
           
           {intelligence.entityType === 'Country' && intelligence.majorRelationships && (
             <div className="bg-[var(--surface)] p-5 rounded-sm border border-[var(--border)]">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--cyan)] mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4" /> Major Relationships
                </h3>
                <ul className="space-y-3">
                  {intelligence.majorRelationships.map((rel, i) => (
                    <li key={i} className="text-sm text-white/80 leading-relaxed border-l-2 border-[var(--border)] pl-3">
                      {rel}
                    </li>
                  ))}
                </ul>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
