"use client";

import React, { useState } from 'react';
import { IntelligenceHeader } from '@/components/intelligence/IntelligenceHeader';
import { ImpactMeter } from '@/components/intelligence/ImpactMeter';
import { AIProcessingState } from '@/components/intelligence/AIProcessingState';
import { AIAnswerSection } from '@/components/intelligence/AIAnswerSection';
import { MOCK_INDIA_IMPACT_RESPONSE } from '@/lib/intelligence/mockData';
import { Activity, Search, Target } from 'lucide-react';

export default function IndiaImpactPage() {
  const [event, setEvent] = useState('');
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "COMPLETE">("IDLE");

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.trim()) return;
    setStatus("PROCESSING");
    setTimeout(() => setStatus("COMPLETE"), 2000);
  };
  
  const handleSuggested = (q: string) => {
    setEvent(q);
    setStatus("PROCESSING");
    setTimeout(() => setStatus("COMPLETE"), 2000);
  };

  const response = MOCK_INDIA_IMPACT_RESPONSE;

  const impactColors = {
    CRITICAL: "bg-[var(--danger)]/20 text-[var(--danger)] border-[var(--danger)]",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
    LOW: "bg-green-500/20 text-green-400 border-green-500",
    NEUTRAL: "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]",
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      <div className="container mx-auto max-w-5xl px-6 md:px-8 py-12">
        <IntelligenceHeader 
          title="India Impact Engine" 
          subtitle="Multi-Dimensional Analysis of Global Events on Indian Strategic Interests"
        />

        <div className="mb-12">
          <form onSubmit={handleAnalyze} className="relative max-w-3xl">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Activity className="w-6 h-6 text-[var(--cyan)]/50" />
            </div>
            <input 
              type="text" 
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="Enter a global event to analyze impact on India..." 
              className="w-full bg-[var(--surface)]/50 border-2 border-[var(--border)] rounded-sm py-6 pl-16 pr-32 text-lg focus:outline-none focus:border-[var(--border)] transition-colors shadow-inner"
              disabled={status === "PROCESSING"}
            />
            <button 
              type="submit"
              disabled={status === "PROCESSING" || !event.trim()}
              className="absolute right-3 top-3 bottom-3 px-6 bg-[var(--cyan)] text-[var(--bg)] font-bold uppercase tracking-wider rounded-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors"
            >
              Assess
            </button>
          </form>
          
          {status === "IDLE" && (
            <div className="mt-8">
              <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.15em] mb-4">Select Event to Analyze</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  "Iran sanctions intensified",
                  "China blocks Taiwan Strait",
                  "OPEC+ cuts production by 2M bpd",
                  "US withdraws from NATO"
                ].map(q => (
                  <button 
                    key={q}
                    onClick={() => handleSuggested(q)}
                    className="text-xs text-left px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]/30 hover:border-[var(--border)] hover:bg-[var(--cyan)]/5 transition-all text-white/80"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {status === "PROCESSING" && (
          <AIProcessingState status="PROCESSING" message="Mapping Multi-Dimensional Impact..." />
        )}

        {status === "COMPLETE" && (
          <div className="animate-in fade-in slide-in- duration-700">
            {/* Summary Header */}
            <div className="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
               <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-[var(--cyan)]" />
                    <span className="text-[10px] font-extrabold text-[var(--cyan)] uppercase tracking-[0.2em]">Event Analyzed</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{event || response.event}</h2>
               </div>
               
               <div className="flex flex-col items-end min-w-[200px]">
                  <span className="text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-[0.2em] mb-2">Overall India Impact</span>
                  <div className={`px-6 py-3 rounded-sm border-2 ${impactColors[response.overallImpact]} font-black text-xl tracking-widest`}>
                    {response.overallImpact}
                  </div>
               </div>
            </div>
            
            <AIAnswerSection title="Why It Matters" content={response.whyItMatters} highlight={true} />

            {/* Impact Dimensions */}
            <div className="mb-10">
              <h3 className="text-sm font-extrabold text-white tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-[var(--border)]" />
                Impact Dimensions
                <span className="flex-1 h-px bg-[var(--border)]" />
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {response.dimensions.map((dim, idx) => (
                  <ImpactMeter key={idx} dimension={dim} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <AIAnswerSection title="Immediate Effects" content={response.immediateEffects} type="list" />
               <AIAnswerSection title="Medium-Term Effects" content={response.mediumTermEffects} type="list" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <AIAnswerSection title="Strategic Options for India" content={response.strategicOptions} type="list" highlight={true} />
               <AIAnswerSection title="What To Watch Next" content={response.whatToWatch} type="list" />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
