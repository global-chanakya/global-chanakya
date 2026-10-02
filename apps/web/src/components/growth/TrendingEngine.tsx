"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Activity } from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  slug: string;
  type: "Conflict" | "Country" | "Leader" | "Blog";
  score: number;
}

export function TrendingEngine() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this fetches from Upstash Redis (cached every 15m)
    // Simulating API response
    setTimeout(() => {
      setTrending([
        { id: "1", title: "South China Sea Tensions", slug: "south-china-sea", type: "Conflict", score: 98 },
        { id: "2", title: "BRICS Expansion 2026", slug: "brics-expansion", type: "Blog", score: 85 },
        { id: "3", title: "India's Tech Diplomacy", slug: "india-tech-diplomacy", type: "Blog", score: 76 },
        { id: "4", title: "Xi Jinping", slug: "xi-jinping", type: "Leader", score: 65 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return <div className="h-48 rounded-sm bg-gray-900/30 animate-pulse border border-gray-800"></div>;
  }

  return (
    <div className="p-6 rounded-sm bg-gray-900/50 border border-gray-800">
      <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-red-500" />
        Trending Intelligence
      </h3>
      
      <ul className="space-y-4">
        {trending.map((item, index) => (
          <li key={item.id} className="flex items-start gap-4 group">
            <span className="text-2xl font-bold text-gray-800 group-hover:text-gray-700 transition-colors">
              0{index + 1}
            </span>
            <div>
              <Link 
                href={item.type === "Blog" ? `/blogs/${item.slug}` : `/${item.type.toLowerCase()}/${item.slug}`}
                className="text-sm font-semibold text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2"
              >
                {item.title}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.type}</span>
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <Activity className="w-3 h-3" /> {item.score} Pulse
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
