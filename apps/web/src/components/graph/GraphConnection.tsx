import React from "react";
import { ArrowRight } from "lucide-react";

interface GraphConnectionProps {
  label: string;
  direction?: "horizontal" | "vertical";
}

export function GraphConnection({ label, direction = "horizontal" }: GraphConnectionProps) {
  return (
    <div className={`flex items-center justify-center ${direction === "vertical" ? "flex-col my-2" : "flex-row mx-2"}`} aria-label={`Connected via: ${label}`}>
      {direction === "horizontal" && <div className="h-[2px] w-8" />}
      
      <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 bg-gray-800 text-gray-400 rounded-full border border-gray-700 z-10 whitespace-nowrap">
        {label}
      </span>
      
      {direction === "vertical" ? (
        <div className="w-[2px] h-8 my-1" />
      ) : (
        <ArrowRight className="w-4 h-4 text-gray-500 -ml-1" />
      )}
    </div>
  );
}
