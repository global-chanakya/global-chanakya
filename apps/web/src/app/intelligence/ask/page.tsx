"use client";

import React, { useState } from 'react';
import { IntelligenceHeader } from '@/components/intelligence/IntelligenceHeader';
import { AIProcessingState } from '@/components/intelligence/AIProcessingState';
import { AIAnswerSection } from '@/components/intelligence/AIAnswerSection';
import { SourcePanel } from '@/components/intelligence/SourcePanel';
import { AskChanakyaResponse } from '@/lib/intelligence/types';
import { Compass, Search, AlertTriangle } from 'lucide-react';

export default function AskChanakyaPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "COMPLETE" | "ERROR">("IDLE");
  const [response, setResponse] = useState<AskChanakyaResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const executeQuery = async (q: string) => {
    setStatus("PROCESSING");
    setErrorMsg(null);
    setResponse(null);
    
    try {
      const res = await fetch("/api/intelligence/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "An unexpected error occurred");
      }
      
      setResponse(data);
      setStatus("COMPLETE");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect to Intelligence Service.");
      setStatus("ERROR");
    }
  };

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeQuery(query);
  };

  const handleSuggested = (q: string) => {
    setQuery(q);
    executeQuery(q);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      <div className="container mx-auto max-w-4xl px-6 md:px-8 py-12">
        <IntelligenceHeader 
          title="Ask Chanakya" 
          subtitle="Strategic Geopolitical Queries & Intelligence Synthesis"
        />

        <div className="mb-12">
          <form onSubmit={handleQuery} className="relative">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-[var(--gold)]/50" />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a strategic question..." 
              className="w-full bg-[var(--surface)]/50 border-2 border-[var(--border)] rounded-sm py-6 pl-16 pr-32 text-lg focus:outline-none focus:border-[var(--accent)] transition-colors shadow-inner"
              disabled={status === "PROCESSING"}
            />
            <button 
              type="submit"
              disabled={status === "PROCESSING" || !query.trim()}
              className="absolute right-3 top-3 bottom-3 px-6 bg-[var(--gold)] text-[var(--bg)] font-bold uppercase tracking-wider rounded-sm hover:bg-yellow-400 disabled:opacity-50 transition-colors"
            >
              Analyze
            </button>
          </form>

          {status === "IDLE" && (
            <div className="mt-8">
              <h4 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.15em] mb-4">Suggested Intelligence Queries</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  "What would a prolonged Iran crisis mean for India?",
                  "Why does the Strait of Hormuz matter to India?",
                  "How could a Taiwan crisis affect India's economy?",
                  "What are China's strategic options in the Indo-Pacific?"
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
          <AIProcessingState status="PROCESSING" message="Synthesizing strategic implications..." />
        )}

        {status === "ERROR" && (
          <div className="animate-in fade-in p-6 rounded-sm bg-red-950/40 border border-red-500/50 text-red-200">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Intelligence Synthesis Failed
            </h3>
            <p className="text-sm opacity-80">{errorMsg}</p>
            <button 
              onClick={() => setStatus("IDLE")} 
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "COMPLETE" && response && (
          <div className="animate-in fade-in slide-in- duration-700">
            <div className="mb-8 p-6 rounded-sm bg-[var(--surface)]/80 border border-[var(--border)]">
               <h2 className="text-xl font-bold mb-2">Query Assessment: {query || response.query}</h2>
               <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                 <Compass className="w-4 h-4 text-[var(--cyan)]" /> Intelligence Core Synthesis
               </p>
            </div>

            <AIAnswerSection title="Direct Assessment" content={response.directAssessment} highlight={true} />
            <AIAnswerSection title="Strategic Context" content={response.strategicContext} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <AIAnswerSection title="Economic Impact" content={response.economicImpact} />
              <AIAnswerSection title="Security Impact" content={response.securityImpact} />
            </div>
            
            <AIAnswerSection title="Diplomatic Impact" content={response.diplomaticImpact} />
            <AIAnswerSection title="Key Risks" content={response.keyRisks} type="list" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <AIAnswerSection title="Possible Scenarios" content={response.scenarios} type="list" />
              <AIAnswerSection title="What To Watch Next" content={response.whatToWatch} type="list" />
            </div>
            
            <AIAnswerSection title="Analyst Assessment" content={response.analystAssessment} highlight={true} />

            <SourcePanel 
              sources={response.sources} 
              confidence={response.confidence}
            />
          </div>
        )}
      </div>
    </div>
  );
}
