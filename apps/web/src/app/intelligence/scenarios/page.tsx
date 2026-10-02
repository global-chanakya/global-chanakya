"use client";

import React, { useState } from 'react';
import { IntelligenceHeader } from '@/components/intelligence/IntelligenceHeader';
import { AIProcessingState } from '@/components/intelligence/AIProcessingState';
import { AIAnswerSection } from '@/components/intelligence/AIAnswerSection';
import { ScenarioTimeline } from '@/components/intelligence/ScenarioTimeline';
import { MOCK_SCENARIO_RESPONSE } from '@/lib/intelligence/mockData';
import { Zap, Search, Route } from 'lucide-react';

export default function ScenariosPage() {
  const [scenario, setScenario] = useState('');
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "COMPLETE">("IDLE");

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) return;
    setStatus("PROCESSING");
    setTimeout(() => setStatus("COMPLETE"), 2500);
  };

  const handleSuggested = (q: string) => {
    setScenario(q);
    setStatus("PROCESSING");
    setTimeout(() => setStatus("COMPLETE"), 2500);
  };

  const response = MOCK_SCENARIO_RESPONSE;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      <div className="container mx-auto max-w-5xl px-6 md:px-8 py-12">
        <IntelligenceHeader 
          title="Scenario Intelligence" 
          subtitle="Predictive What-If Analysis & Timeline Modeling"
        />

        <div className="mb-12">
          <form onSubmit={handleAnalyze} className="relative max-w-3xl">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Route className="w-6 h-6 text-purple-400/50" />
            </div>
            <input 
              type="text" 
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="What if..." 
              className="w-full bg-[var(--surface)]/50 border-2 border-[var(--border)] rounded-sm py-6 pl-16 pr-32 text-lg focus:outline-none focus:border-purple-400/50 transition-colors shadow-inner"
              disabled={status === "PROCESSING"}
            />
            <button 
              type="submit"
              disabled={status === "PROCESSING" || !scenario.trim()}
              className="absolute right-3 top-3 bottom-3 px-6 bg-purple-500 text-white font-bold uppercase tracking-wider rounded-sm hover:bg-purple-400 disabled:opacity-50 transition-colors"
            >
              Simulate
            </button>
          </form>
          
          {status === "IDLE" && (
            <div className="mt-8">
              <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.15em] mb-4">Suggested Scenarios</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  "What if the Strait of Hormuz closes?",
                  "What if China initiates a blockade of Taiwan?",
                  "What if Russia halts all energy exports?",
                  "What if a cyberattack cripples India's power grid?"
                ].map(q => (
                  <button 
                    key={q}
                    onClick={() => handleSuggested(q)}
                    className="text-xs text-left px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]/30 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-white/80"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {status === "PROCESSING" && (
          <AIProcessingState status="PROCESSING" message="Simulating Scenario Outcomes..." />
        )}

        {status === "COMPLETE" && (
          <div className="animate-in fade-in slide-in- duration-700">
            {/* Header */}
            <div className="p-6 md:p-8 rounded-sm border border-purple-500/30 bg-[var(--surface)]/80 relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                 <div>
                   <span className="inline-block px-3 py-1 mb-4 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                     Simulated Scenario
                   </span>
                   <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{scenario || response.scenario}</h2>
                 </div>
                 
                 <div className="flex gap-4">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Probability</span>
                       <span className="text-sm font-extrabold text-white px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)]">{response.probability}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Impact</span>
                       <span className={`text-sm font-extrabold px-3 py-1.5 rounded border ${response.indiaImpact === 'CRITICAL' ? 'bg-[var(--danger)] text-white border-[var(--danger)]' : 'bg-orange-500 text-white border-orange-500'}`}>{response.indiaImpact}</span>
                    </div>
                 </div>
              </div>
            </div>
            
            <AIAnswerSection title="Immediate Impact" content={response.immediateImpact} highlight={true} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
               {/* Left Column: Timeline */}
               <div className="lg:col-span-5">
                  <h3 className="text-sm font-extrabold text-white tracking-[0.2em] uppercase mb-4 pl-2">
                    Event Progression
                  </h3>
                  <ScenarioTimeline phases={response.timeline} />
               </div>
               
               {/* Right Column: Impacts */}
               <div className="lg:col-span-7 flex flex-col gap-6">
                  <AIAnswerSection title="Global Impact" content={response.globalImpact} />
                  <AIAnswerSection title="India Specific Impact" content={response.indiaImpactDetails} highlight={true} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <AIAnswerSection title="Energy Impact" content={response.energyImpact} />
                     <AIAnswerSection title="Security Impact" content={response.securityImpact} />
                  </div>
                  
                  <AIAnswerSection title="Strategic Response Required" content={response.strategicResponse} type="list" highlight={true} />
                  <AIAnswerSection title="Possible Outcomes" content={response.outcomes} type="list" />
                  
                  <div className="p-5 rounded-sm border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-sm text-white/90">
                    <span className="text-[10px] font-extrabold text-[var(--danger)] uppercase tracking-[0.2em] block mb-2">Risk Assessment</span>
                    {response.riskAssessment}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
