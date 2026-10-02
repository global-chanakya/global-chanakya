"use client";

import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";

export function StreakTracker() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // In production, this would fetch from the User's profile DB
    // For now, simulate reading localStorage
    const saved = localStorage.getItem("gc_read_streak");
    if (saved) {
      setStreak(parseInt(saved, 10));
    } else {
      setStreak(1); // First visit
      localStorage.setItem("gc_read_streak", "1");
    }
  }, []);

  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 group cursor-default transition-all hover:bg-orange-500/20" title={`${streak} Day Reading Streak`}>
      <Flame className={`w-4 h-4 ${streak > 3 ? 'fill-orange-500 animate-pulse' : ''}`} />
      <span className="text-sm font-bold">{streak}</span>
      
      {/* Hidden tooltip for growth engine */}
      <div className="absolute top-12 right-0 w-48 p-3 rounded-sm bg-gray-900 border border-gray-700 shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-gray-300">
        You are on a <strong className="text-orange-400">{streak} day streak!</strong> Read 1 more article today to maintain your status as an active intelligence gatherer.
      </div>
    </div>
  );
}
