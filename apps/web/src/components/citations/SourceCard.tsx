import React from "react";
import { ExternalLink, ShieldCheck, FileText, Landmark, GraduationCap, Library } from "lucide-react";

export type SourceType = "Primary" | "Secondary" | "Government" | "Think Tank" | "Academic";

export interface SourceProps {
  type: SourceType;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  credibilityScore?: number; // 0-100
}

const getSourceIcon = (type: SourceType) => {
  switch (type) {
    case "Primary": return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    case "Government": return <Landmark className="w-4 h-4 text-blue-400" />;
    case "Think Tank": return <Library className="w-4 h-4 text-purple-400" />;
    case "Academic": return <GraduationCap className="w-4 h-4 text-orange-400" />;
    default: return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

export function SourceCard({ type, title, publisher, date, url, credibilityScore = 95 }: SourceProps) {
  return (
    <div 
      className="p-4 rounded-sm border border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group"
      itemProp="citation" 
      itemScope 
      itemType="https://schema.org/CreativeWork"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {getSourceIcon(type)}
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{type} Source</span>
          {credibilityScore > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-800 text-emerald-400 border border-gray-700 ml-auto sm:ml-2">
              Score: {credibilityScore}
            </span>
          )}
        </div>
        
        <h4 className="text-sm font-semibold text-gray-200 leading-snug mb-1" itemProp="headline">{title}</h4>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span itemProp="publisher">{publisher}</span>
          <span>•</span>
          <time itemProp="datePublished" dateTime={new Date(date).toISOString()}>
            {new Date(date).toLocaleDateString()}
          </time>
        </div>
      </div>
      
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer nofollow" 
          itemProp="url"
          className="shrink-0 p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-blue-600 transition-colors"
          aria-label={`Read source: ${title}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
